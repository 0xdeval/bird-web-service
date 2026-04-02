# Bird API Service

Simple REST wrapper around a locally installed `bird` CLI.

## Requirements

- Node.js 18+
- `bird` installed and available in your shell `PATH`
- `bird` already authenticated on this server

## Run

```bash
npm install
cp .env.example .env
# edit .env
npm start
```

`.env` is loaded automatically on startup (`npm start` and `bun start`).
If `API_SECRET` is omitted, all endpoints are open (use only on trusted networks).

## Cloudflare Tunnel

Expose local server:

```bash
cloudflared tunnel --url http://localhost:3000
```

Use the tunnel URL and include header `x-api-key: your-secret-key` on requests.

## Endpoints

- `GET /health` (no auth)
- `GET /whoami`
- `POST /tweet` body: `{ "text": "hello" }`
- `POST /reply` body: `{ "tweetId": "123", "text": "hi" }`
- `GET /read?id=<id-or-url>`
- `GET /search?q=<query>&n=5`
- `GET /mentions?n=10`
- `GET /replies?id=<id-or-url>`
- `GET /thread?id=<id-or-url>`
- `GET /user-tweets?handle=<handle>&n=20`

## Example

```bash
curl "http://localhost:3000/search?q=AI&n=5" \
  -H "x-api-key: your-secret-key"
```
