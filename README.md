# Bird API — Open Source Web Service for X/Twitter

A lightweight, self-hosted REST API that wraps the [bird CLI](https://github.com/jawond/bird) to interact with X/Twitter. Designed for easy integration with no-code platforms like **n8n**, **Zapier**, and **Make**, and perfect for building AI avatars, content monitoring, and engagement workflows.

**Bird API is open source.** Deploy it yourself on Railway, Docker, or any hosting that supports Node.js.

---

## ✨ Features

- **Read tweets, threads, and mentions** from X
- **Search** X with full operator support (filters, engagement, date ranges, etc.)
- **Post tweets and replies** programmatically
- **Monitor mentions** and build engagement workflows
- **Get user timelines** and conversation context
- **Webhook-friendly** — designed for n8n, Zapier, Make, and custom integrations
- **Rate-limit aware** — built-in helpers for managing X's aggressive limits
- **Self-hosted** — keep your credentials secure, run it yourself
- **Simple API key authentication** — protect your instance with a single secret

---

## 🚀 Quick Start

### 1. Deploy to Railway (Easiest)

1. Fork or clone this repository
2. Push to GitHub
3. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub Repo
4. Add environment variables:
   - `AUTH_TOKEN`: Your X `auth_token` cookie
   - `CT0`: Your X `ct0` cookie
   - `API_SECRET`: Any random string (e.g., `your-secret-key-123`)
5. Railway auto-deploys and gives you a public URL

### 2. Deploy with Docker

```bash
docker build -t bird-api .
docker run -p 3000:3000 \
  -e AUTH_TOKEN="your_auth_token" \
  -e CT0="your_ct0" \
  -e API_SECRET="your_secret" \
  bird-api
```

### 3. Run Locally

```bash
npm install
AUTH_TOKEN="your_auth_token" CT0="your_ct0" API_SECRET="your_secret" npm start
```

See **[SETUP.md](SETUP.md)** for detailed setup instructions, including how to extract X cookies and configure different deployment environments.

---

## 📡 API Reference

All endpoints (except `/health`) require the `x-api-key` header:

```bash
curl "http://localhost:3000/search?q=AI&n=5" \
  -H "x-api-key: your-secret-key-123"
```

### Health Check (no auth required)
```
GET /health
```
Returns `{ "status": "ok", "timestamp": "..." }`

### Verify Credentials
```
GET /whoami
```
Confirms your auth tokens are working.

### Post a Tweet
```
POST /tweet
Content-Type: application/json

{ "text": "Hello world! 🚀" }
```

### Reply to a Tweet
```
POST /reply
Content-Type: application/json

{
  "tweetId": "1234567890123456789",
  "text": "Great point!"
}
```
`tweetId` can be a tweet ID or full URL (`https://x.com/user/status/...`).

### Read a Tweet
```
GET /read?id=1234567890123456789
```
Returns the full tweet object with author, engagement metrics, and media.

### Search Tweets
```
GET /search?q=artificial+intelligence&n=5
```
Supports X search operators. See **[CONTENT_SOURCING.md](CONTENT_SOURCING.md)** for full operator reference and search recipes.

**Common query examples:**
```bash
# High-engagement posts about AI
q=AI+min_faves:500

# News posts about Iran with links
q=Iran+filter:news+filter:links

# Posts from specific sources
q=AI+(from:Reuters+OR+from:BBC)

# Recent technical discussions
q="large+language+models"+filter:links+since:2026-03-25
```

### Get Mentions
```
GET /mentions?n=10
```
Fetch the last `n` mentions of your account. Use this to power reply workflows.

### Get Replies to a Tweet
```
GET /replies?id=1234567890123456789
```
See how people are responding to a specific tweet.

### Get a Thread
```
GET /thread?id=1234567890123456789
```
Fetch an entire conversation thread for full context before replying.

### Get User Tweets
```
GET /user-tweets?handle=elonmusk&n=20
```
Get the last `n` tweets from a user. Handle auto-prefixed with `@` if omitted.

---

## 🔗 Integration Guides

### n8n Workflow Example

In your n8n **HTTP Request** node:

```
Method: GET
URL: {{$env.BIRD_API_URL}}/search?q=AI+regulation&n=5
Headers:
  x-api-key: {{$env.BIRD_API_SECRET}}
```

See **[USAGE.md](USAGE.md)** for complete n8n workflow patterns, including:
- Topic monitoring workflows
- News-driven post generation
- Engagement and mention response workflows
- Memory and deduplication strategies

### Zapier / Make Integration

1. Use the **HTTP** or **Webhooks** module
2. Set **Method** to GET (for reads) or POST (for writes)
3. Add **Header**: `x-api-key: your-secret-key`
4. Pass query params or JSON body as needed

Example (Zapier Code step):
```javascript
const fetch = require('node-fetch');

const response = await fetch('https://your-bird-api.com/search?q=AI&n=5', {
  headers: { 'x-api-key': process.env.API_SECRET }
});
const data = await response.json();
```

---

## 📚 Full Documentation

| Document | Purpose |
|----------|---------|
| **[SETUP.md](SETUP.md)** | Getting X credentials, deployment guides (Railway, Docker, local), environment configuration, troubleshooting |
| **[USAGE.md](USAGE.md)** | Workflow patterns for n8n, Zapier, Make; rate limiting & error handling; memory/deduplication; best practices |
| **[CONTENT_SOURCING.md](CONTENT_SOURCING.md)** | Search operators reference, content sourcing recipes, integration with Google News RSS |
| **[DEPLOYMENT.md](DEPLOYMENT.md)** | Quick deployment guides for Railway, Render, Fly.io, AWS, Google Cloud, DigitalOcean, Docker |
| **[FAQ.md](FAQ.md)** | Common questions about setup, rate limits, integration, troubleshooting, best practices |
| **[CONTRIBUTING.md](CONTRIBUTING.md)** | How to contribute, code style, PR process, issue templates |

---

## ⚠️ Rate Limits & Best Practices

Bird API uses X's internal GraphQL endpoints, which are heavily rate-limited:

- **Keep reads under 100/day** — searches, mentions, threads combined
- **Keep writes under 20/day** — tweets and replies combined
- **Add 2-10 second delays** between requests to avoid patterns
- **Expect 429 errors** — implement exponential backoff in your workflows
- **Monitor cookie expiry** — X auth tokens expire; refresh them every 2-4 weeks

For heavy usage, combine Bird with the [official X API](https://developer.twitter.com/).

---

## 🛠️ Development

### Project Structure
```
bird-api/
├── server.js           # Main Express server
├── package.json        # Dependencies
├── Dockerfile          # Docker configuration
├── README.md          # This file
├── SETUP.md           # Detailed setup guide
├── USAGE.md           # Workflow patterns & examples
└── CONTENT_SOURCING.md # Search operators & recipes
```

### Local Development

```bash
# Install dependencies
npm install

# Start server (with hot-reload via nodemon if installed)
npm start

# Test an endpoint
curl "http://localhost:3000/health"
```

### Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:
- Reporting issues
- Submitting feature requests
- Code contributions and pull requests

---

## 📜 License

MIT License — use freely in personal and commercial projects.

---

## 🔒 Security

- **Never commit your API keys or X credentials** to version control
- Use environment variables for all secrets
- Regenerate your `API_SECRET` regularly
- Monitor who has access to your Bird API instance
- X cookies eventually expire — refresh them proactively

---

## ❓ Troubleshooting

**"Unauthorized" error:**
- Check that `x-api-key` header matches your `API_SECRET` env var

**"Command not found" errors:**
- Ensure [bird CLI](https://github.com/jawond/bird) is installed in your environment
- On Railway, check that the Dockerfile installs bird correctly

**Requests timing out:**
- X's rate limits may be blocking you; wait 15+ minutes and try again
- Reduce the `n` parameter in your requests

**Stale cookies:**
- Extract fresh `auth_token` and `ct0` from x.com; update your env vars

See **[SETUP.md](SETUP.md)** for more troubleshooting and FAQ.

---

## 🙋 Support & Community

- **Issues**: Open an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Bird CLI**: See the [bird CLI repo](https://github.com/jawond/bird) for CLI-specific issues

---

**Happy automating!** 🐦
