# Bird API Setup Guide

Complete instructions for extracting X credentials, deploying Bird API, and configuring your environment.

## Table of Contents

- [Getting X Credentials](#getting-x-credentials)
- [Deployment Options](#deployment-options)
  - [Railway (Recommended)](#railway-recommended)
  - [Docker](#docker)
  - [Local Development](#local-development)
  - [Other Platforms](#other-platforms)
- [Environment Variables](#environment-variables)
- [Verifying Your Setup](#verifying-your-setup)
- [Troubleshooting](#troubleshooting)

---

## Getting X Credentials

You need two pieces of information from your X account: `auth_token` and `ct0`. These are cookies stored in your browser after you log in.

### Step 1: Extract Cookies from Your Browser

#### Google Chrome / Chromium

1. Go to [x.com](https://x.com) and log in to your account
2. Open Developer Tools: Press `F12` (or `Cmd+Option+I` on Mac)
3. Click the **Application** tab
4. In the left sidebar, expand **Cookies** → click **x.com**
5. Search for `auth_token` in the list
6. Click the row; the value appears in the **Value** column (right panel)
7. **Copy the entire value** (it's a long string)
8. Paste it somewhere safe temporarily

Repeat for `ct0`:
9. Search for `ct0` in the cookies list
10. Copy its value

#### Firefox / Safari

1. Log in to [x.com](https://x.com)
2. Open Developer Tools: `F12`
3. Go to **Storage** tab (Firefox) or **Storage** tab (Safari)
4. Click **Cookies** → **https://x.com**
5. Find `auth_token` and `ct0` and copy their values

### Step 2: Keep Credentials Safe

⚠️ **These credentials grant access to your X account.** Treat them like passwords:
- Never commit to version control
- Never share publicly
- Only store in environment variables
- Rotate them every 2-4 weeks (get fresh ones)

---

## Deployment Options

### Railway (Recommended)

Railway is the easiest way to deploy Bird API with persistent storage and automatic HTTPS.

#### 1. Prepare Repository

```bash
# Fork or clone this repo
git clone https://github.com/YOUR_USERNAME/bird-api.git
cd bird-api

# Push to GitHub (Railway needs a GitHub repo)
git remote set-url origin https://github.com/YOUR_USERNAME/bird-api.git
git push -u origin main
```

#### 2. Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click **New Project**
3. Select **Deploy from GitHub Repo**
4. Authorize GitHub and select your `bird-api` repo
5. Click **Deploy**

#### 3. Add Environment Variables

Railway will create a deployment. Wait for it to finish, then:

1. Go to your project dashboard
2. Click the **bird-api** service
3. Open the **Variables** tab
4. Add these variables:

| Variable | Value | Example |
|----------|-------|---------|
| `AUTH_TOKEN` | Your X `auth_token` cookie | `AAAAABc...very_long_string` |
| `CT0` | Your X `ct0` cookie | `a1b2c3d...` |
| `API_SECRET` | Random string for API key | `my-super-secret-key-123` |
| `PORT` | Port to listen on | `3000` |

4. Click **Save**
5. Railway redeploys automatically

#### 4. Get Your Public URL

1. In Railway dashboard, open the **bird-api** service
2. Look for **Domains** section
3. Copy your public URL (e.g., `https://bird-api-prod.up.railway.app`)

Test it:
```bash
curl "https://bird-api-prod.up.railway.app/health"
```

Should return:
```json
{ "status": "ok", "timestamp": "2026-04-01T12:00:00Z" }
```

#### 5. Connect to n8n / Zapier

Use your Railway URL + `API_SECRET` from the steps above.

---

### Docker

Deploy Bird API in a Docker container (locally or to any cloud provider).

#### 1. Build Image

```bash
git clone https://github.com/YOUR_USERNAME/bird-api.git
cd bird-api
docker build -t bird-api .
```

#### 2. Run Container

```bash
docker run -d \
  --name bird-api \
  -p 3000:3000 \
  -e AUTH_TOKEN="your_auth_token_here" \
  -e CT0="your_ct0_here" \
  -e API_SECRET="your_secret_key_here" \
  bird-api
```

#### 3. Test It

```bash
curl "http://localhost:3000/health" \
  -H "x-api-key: your_secret_key_here"
```

#### 4. Deploy to Production

To deploy to AWS, Google Cloud, Azure, DigitalOcean, etc.:

- Push your Docker image to a registry (Docker Hub, ECR, GCR, etc.)
- Configure the registry credentials in your cloud provider
- Create a service pointing to your image
- Set environment variables in the cloud provider's UI

---

### Local Development

For testing or development on your machine.

#### 1. Install Dependencies

```bash
npm install
```

Requires [bird CLI](https://github.com/jawond/bird) to be installed:
```bash
npm install -g bird  # or use deno/bun as per bird docs
```

#### 2. Create `.env` File (Optional)

Create a `.env` file in the project root:
```
AUTH_TOKEN=your_auth_token_here
CT0=your_ct0_here
API_SECRET=your_secret_key_here
PORT=3000
```

#### 3. Start Server

```bash
npm start
```

Server runs at `http://localhost:3000`

#### 4. Test Locally

```bash
curl "http://localhost:3000/health"

curl "http://localhost:3000/search?q=AI&n=5" \
  -H "x-api-key: your_secret_key_here"
```

#### 5. Development with Nodemon

For auto-reload on code changes:

```bash
npm install --save-dev nodemon
npx nodemon server.js
```

---

### Other Platforms

#### Vercel

1. Push repo to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your `bird-api` repo
4. Add environment variables in project settings
5. Deploy

⚠️ **Note**: Vercel is designed for serverless functions. For persistent long-running processes, Railway or Docker is better.

#### Heroku

Heroku [now requires paid plans](https://blog.heroku.com/free-dyno-hours) for any deployment.

```bash
heroku create bird-api
heroku config:set AUTH_TOKEN="..." CT0="..." API_SECRET="..."
git push heroku main
```

#### Fly.io

1. Install `flyctl`: [fly.io/docs](https://fly.io/docs)
2. `fly launch` (creates `fly.toml`)
3. `fly secrets set AUTH_TOKEN="..." CT0="..." API_SECRET="..."`
4. `fly deploy`

---

## Environment Variables

### Required

| Variable | Description |
|----------|-------------|
| `AUTH_TOKEN` | X account `auth_token` cookie |
| `CT0` | X account `ct0` cookie |
| `API_SECRET` | API key for protecting your endpoints |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Port to listen on | `3000` |
| `NODE_ENV` | Environment (development/production) | `production` |

### Tips

- **Rotate credentials monthly** — get fresh cookies from x.com and update your env vars
- **Use a password manager** to store long credential strings
- **Different instances?** Use different `API_SECRET` values for each
- **Monitoring** — log your API usage to identify rate limit issues

---

## Verifying Your Setup

### 1. Health Check (No Auth)

```bash
curl "https://your-bird-api-url.com/health"
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-04-01T12:34:56.789Z"
}
```

### 2. Verify Credentials

```bash
curl "https://your-bird-api-url.com/whoami" \
  -H "x-api-key: your-api-secret"
```

Expected response (your X account info):
```json
{
  "success": true,
  "output": "You are logged in as @yourusername"
}
```

If you get an error:
- **401 Unauthorized**: Wrong `API_SECRET`
- **bird: command not found**: bird CLI not installed
- **auth failed**: Wrong `AUTH_TOKEN` or `CT0`, or they've expired

### 3. Test a Search

```bash
curl "https://your-bird-api-url.com/search?q=hello&n=1" \
  -H "x-api-key: your-api-secret"
```

Expected response: JSON array of tweet objects.

### 4. Check Rate Limits

After a few requests, you might see:
```json
{
  "success": false,
  "error": "429 - rate limited"
}
```

This is normal. Wait 15+ minutes before retrying.

---

## Troubleshooting

### "auth_token cookie not found" or "ct0 not found"

**Problem**: Cookies aren't in your browser.

**Solution**:
1. Make sure you're logged in to [x.com](https://x.com)
2. Open DevTools, go to **Application** → **Cookies** → **x.com**
3. If `auth_token` and `ct0` aren't there, try:
   - Clear cookies and log in again
   - Use a different browser (Chrome, Firefox, Safari)
   - Disable browser extensions (they sometimes block cookies)

### "Command not found: bird"

**Problem**: Bird CLI isn't installed.

**Solution**:
- Follow [bird CLI installation](https://github.com/jawond/bird#installation)
- Verify: `bird --version`
- On Railway, check that the Dockerfile correctly installs bird

### "Invalid API secret" or 401 errors

**Problem**: `x-api-key` header doesn't match `API_SECRET` env var.

**Solution**:
1. Double-check your `API_SECRET` value (no typos)
2. Verify the header is exactly: `x-api-key: your-secret-here` (case-sensitive)
3. If using curl, make sure the quotes are correct:
   ```bash
   curl ... -H "x-api-key: YOUR_SECRET"
   ```

### "Timeout" or slow responses

**Problem**: Requests are taking 30+ seconds or timing out.

**Solution**:
- You're likely hitting X's rate limits
- Reduce the `n` parameter (number of results)
- Space out your requests (add delays)
- Wait 15+ minutes and try again
- Check X's current status at [status.twitter.com](https://status.twitter.com)

### Cookies expire / "auth failed" after a few days

**Problem**: X's `auth_token` and `ct0` eventually expire.

**Solution**:
1. Every 2-4 weeks, extract fresh cookies from x.com
2. Update `AUTH_TOKEN` and `CT0` in your deployment
3. Restart the service

Pro tip: Set a calendar reminder to refresh cookies monthly.

### n8n / Zapier can't connect

**Problem**: n8n or Zapier returns connection errors.

**Solutions**:
- Verify your Bird API is publicly accessible (test with curl from another machine)
- Check that your `API_SECRET` is correct in n8n/Zapier
- Ensure the URL is correct (copy from your deployment dashboard)
- Test `/health` first (no auth required): `https://your-url/health`
- Check firewall rules (Railway and other platforms have public URLs by default)

### Getting 429 errors constantly

**Problem**: Rate limited by X.

**Solution**:
- Space requests at least 2-10 seconds apart
- Reduce daily request count (aim for <100 reads, <20 writes)
- Batch queries (use the `n` parameter to get more results per request)
- Consider using the official X API for heavy usage

---

## Next Steps

1. **Test your API** with the verification steps above
2. **Read [USAGE.md](USAGE.md)** for workflow patterns and best practices
3. **Read [CONTENT_SOURCING.md](CONTENT_SOURCING.md)** for search operators and recipes
4. **Connect to n8n or Zapier** with your Bird API URL + API secret
5. **Build your workflow** — start simple, then add complexity

---

## Need Help?

- Check [TROUBLESHOOTING](#troubleshooting) above
- Open an issue on [GitHub](https://github.com/YOUR_USERNAME/bird-api/issues)
- See the [bird CLI docs](https://github.com/jawond/bird) for CLI-specific questions
