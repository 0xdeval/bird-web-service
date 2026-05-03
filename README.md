# Bird API Service

A lightweight REST API that wraps the [`bird` CLI](https://github.com/jawond/bird), letting you interact with X/Twitter from n8n, Zapier, Make, or any HTTP client.

## How It Works

```
Your app / n8n / Zapier
        ↓  HTTP
   Bird API Service  (this repo)
        ↓  CLI
     bird CLI
        ↓
       X.com
```

The service authenticates using your X session cookies (`auth_token` + `ct0`). All endpoints (except `/health`) require an `x-api-key` header.

---

## Requirements

- Node.js 18+ (or Bun)
- [`bird` CLI](https://github.com/jawond/bird) installed and in your `PATH`

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy and fill in your environment variables
cp .env.example .env
# Edit .env — add AUTH_TOKEN, CT0, and API_SECRET

# 3. Start the server
npm start
# → Bird API running on port 3000
```

See [SETUP.md](SETUP.md) for how to extract `AUTH_TOKEN` and `CT0` from your browser, and for deployment options (Railway, Docker, Fly.io).

---

## Authentication

Set `API_SECRET` in `.env`. Every request (except `/health`) must include:

```
x-api-key: your-secret-key
```

If `API_SECRET` is omitted, all endpoints are open — only do this on trusted private networks.

### Set credentials at runtime

You can also push fresh X cookies to a running instance without restarting:

```bash
curl -X POST http://localhost:3000/credentials \
  -H "x-api-key: your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{ "auth_token": "...", "ct0": "..." }'
```

---

## Endpoints

### Utility

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check — no auth required |
| `GET` | `/whoami` | Show the authenticated X account |
| `POST` | `/credentials` | Update `auth_token` + `ct0` at runtime |

### Reading

| Method | Path | Params | Description |
|--------|------|--------|-------------|
| `GET` | `/home` | `n=20`, `following=true` | Home timeline |
| `GET` | `/mentions` | `n=10` | Recent mentions |
| `GET` | `/read` | `id=<tweet-id-or-url>` | Read a single tweet |
| `GET` | `/replies` | `id=<tweet-id-or-url>` | Replies to a tweet |
| `GET` | `/thread` | `id=<tweet-id-or-url>` | Full thread |
| `GET` | `/search` | `q=<query>`, `n=5`, `all=true` | Search tweets |
| `GET` | `/user-tweets` | `handle=<@handle>`, `n=20`, `maxPages`, `days` | User's tweets |

### Writing

| Method | Path | Body | Description |
|--------|------|------|-------------|
| `POST` | `/tweet` | `{ "text": "..." }` | Post a tweet |
| `POST` | `/reply` | `{ "tweetId": "...", "text": "..." }` | Reply to a tweet |

---

## Response Format

All endpoints return JSON:

```json
{ "success": true, "output": "...", "data": [...] }
```

On error:

```json
{ "success": false, "error": "...", "output": "" }
```

---

## Examples

```bash
# Health check
curl http://localhost:3000/health

# Who am I?
curl http://localhost:3000/whoami \
  -H "x-api-key: your-secret-key"

# Search tweets
curl "http://localhost:3000/search?q=AI&n=5" \
  -H "x-api-key: your-secret-key"

# Fetch all pages of results
curl "http://localhost:3000/search?q=AI&all=true" \
  -H "x-api-key: your-secret-key"

# Home timeline (all accounts you follow)
curl "http://localhost:3000/home?n=20" \
  -H "x-api-key: your-secret-key"

# Home timeline (following-only feed)
curl "http://localhost:3000/home?following=true&n=20" \
  -H "x-api-key: your-secret-key"

# Get recent mentions
curl "http://localhost:3000/mentions?n=10" \
  -H "x-api-key: your-secret-key"

# Read a tweet
curl "http://localhost:3000/read?id=1234567890" \
  -H "x-api-key: your-secret-key"

# Get replies to a tweet
curl "http://localhost:3000/replies?id=1234567890" \
  -H "x-api-key: your-secret-key"

# Get a full thread
curl "http://localhost:3000/thread?id=1234567890" \
  -H "x-api-key: your-secret-key"

# User tweets (simple)
curl "http://localhost:3000/user-tweets?handle=@elonmusk&n=20" \
  -H "x-api-key: your-secret-key"

# User tweets from the last 7 days (paginated)
curl "http://localhost:3000/user-tweets?handle=@elonmusk&maxPages=10&days=7" \
  -H "x-api-key: your-secret-key"

# Post a tweet
curl -X POST http://localhost:3000/tweet \
  -H "x-api-key: your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{ "text": "Hello world!" }'

# Reply to a tweet
curl -X POST http://localhost:3000/reply \
  -H "x-api-key: your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{ "tweetId": "1234567890", "text": "Great point!" }'
```

---

## Expose Locally with Cloudflare Tunnel

```bash
cloudflared tunnel --url http://localhost:3000
```

Use the tunnel URL + `x-api-key` header in your n8n / Zapier / Make workflows.

---

## Documentation

| File | Contents |
|------|----------|
| [SETUP.md](SETUP.md) | Extract X cookies, env vars, deployment step-by-step |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Railway, Docker, Fly.io, Render, AWS, GCP |
| [USAGE.md](USAGE.md) | n8n / Zapier / Make workflow patterns and recipes |
| [CONTENT_SOURCING.md](CONTENT_SOURCING.md) | X search operators reference |
| [FAQ.md](FAQ.md) | Common questions |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute |

---

## License

[MIT](LICENSE)
