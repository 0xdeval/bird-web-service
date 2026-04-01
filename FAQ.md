# FAQ — Frequently Asked Questions

## Authentication & Credentials

### Q: Where do I get my `auth_token` and `ct0` cookies?

See **[SETUP.md — Getting X Credentials](SETUP.md#getting-x-credentials)** for step-by-step instructions.

### Q: How often do X cookies expire?

Usually every 2-4 weeks. When your API starts returning `auth failed` errors, extract fresh cookies from x.com.

### Q: Can I use multiple X accounts?

Yes! Run separate instances of Bird API, each with different credentials:
- Instance 1: `AUTH_TOKEN_1`, `CT0_1`, `API_SECRET_1`
- Instance 2: `AUTH_TOKEN_2`, `CT0_2`, `API_SECRET_2`

### Q: What's `API_SECRET` for?

It protects your Bird API instance from unauthorized use. Include it as the `x-api-key` header in all requests (except `/health`). Use a random, long string.

---

## Rate Limits

### Q: How many requests can I make per day?

- **Reads** (search, mentions, threads): ~100/day
- **Writes** (tweets, replies): ~20/day

These are soft limits based on X's rate limiting. Exact limits vary.

### Q: What should I do when I hit a rate limit (429 error)?

Wait 15-30 minutes before retrying. The error message from X usually includes a `Retry-After` header.

### Q: Can I increase my rate limits?

Not through Bird API. X's rate limits are account-specific. Some older, active accounts have higher limits.

### Q: What's the best way to avoid getting rate-limited?

- Add 2-10 second delays between requests
- Vary your queries (don't search the exact same thing repeatedly)
- Space out posts (don't tweet 20 times in 5 minutes)
- Monitor your usage with logging

See **[USAGE.md — Best Practices](USAGE.md#best-practices)**.

---

## Deployment

### Q: What's the easiest way to deploy?

Railway. See **[SETUP.md — Railway](SETUP.md#railway-recommended)** or **[DEPLOYMENT.md](DEPLOYMENT.md#railway-recommended)**.

### Q: Can I deploy on a free tier?

Yes:
- **Railway**: Free tier (includes free credits monthly)
- **Render**: Free tier (sleeps after 15 min)
- **Fly.io**: Free tier (3 shared-cpu-1x 256MB VMs)
- **Docker Hub**: Free container registry

For production, a small paid plan (~$5-10/month) is recommended.

### Q: What's the minimum server size?

Very small. Bird API is lightweight:
- RAM: 256MB minimum (Railway free tier)
- Disk: <1GB
- CPU: Any (not CPU-intensive)

### Q: How do I update my credentials after deploying?

See **[DEPLOYMENT.md — Updating Credentials](DEPLOYMENT.md#updating-credentials)**.

---

## Integration with n8n, Zapier, Make

### Q: How do I use Bird API from n8n?

1. In n8n, create an HTTP Request node
2. Set **Method**: GET or POST
3. Set **URL**: `https://your-bird-api-url.com/endpoint?params`
4. Add **Header**: `x-api-key: your-api-secret`
5. Connect to downstream nodes

See **[USAGE.md — n8n Patterns](USAGE.md#n8n-workflow-patterns)** for examples.

### Q: Can I use Bird API with Zapier?

Yes! Use the **Webhooks by Zapier** module (Code step) or **HTTP** module.

See **[USAGE.md — Zapier Integration](USAGE.md#zapier--make-integration)**.

### Q: Does Bird API work with Make?

Yes, use Make's **HTTP** module. Same headers and params as n8n.

See **[USAGE.md — Zapier / Make Integration](USAGE.md#zapier--make-integration)**.

---

## Search & Content

### Q: How do I search for specific content?

Use the `/search` endpoint with X search operators.

Examples:
```bash
# Posts about AI with 500+ likes
/search?q=AI+min_faves:500&n=5

# News from Reuters
/search?q=Iran+from:Reuters&n=10

# Posts with links about startup funding
/search?q=startup+funding+filter:links&n=10
```

See **[CONTENT_SOURCING.md — Search Operators](CONTENT_SOURCING.md#search-operators)** for all operators and examples.

### Q: How many results can I get per request?

The `n` parameter (results per request) supports up to ~100. However, requesting 100 results at once counts against your rate limit heavily.

Recommendation: Request 5-10 at a time, add delays between requests.

### Q: Can I search for posts older than 1 week?

Yes, use the `since:` and `until:` operators:
```bash
/search?q=AI+since:2026-01-01+until:2026-01-31&n=10
```

### Q: Can I search by retweet count?

Not directly. X doesn't expose `min_retweets` in the public search (it exists but isn't always available). Use `min_faves:` and `min_replies:` instead.

---

## Memory & Deduplication

### Q: How do I avoid posting the same thing twice?

Use a memory/history table to track what you've already posted:

```javascript
// Before posting
const alreadyPosted = await checkMemory(content);
if (alreadyPosted) return;

// After posting
await logToMemory(content, timestamp);
```

See **[USAGE.md — Memory & Deduplication](USAGE.md#memory--deduplication)**.

### Q: What should I log to memory?

At minimum:
- Tweet/thread ID
- Action (posted, replied, searched)
- Timestamp
- Content (so you can review weekly)

---

## Troubleshooting

### Q: I get "Unauthorized" errors even with the correct API key.

Check:
1. Header is exactly: `x-api-key: YOUR_SECRET` (case-sensitive)
2. `YOUR_SECRET` matches your `API_SECRET` env var
3. You're not making a request to `/health` (doesn't need auth)

### Q: "bird: command not found" error.

The bird CLI isn't installed in your environment. On Railway, this means the Dockerfile didn't install it correctly.

Check the Dockerfile installs bird:
```dockerfile
RUN git clone https://github.com/jawond/bird.git /opt/bird \
    && cd /opt/bird \
    && npm install \
    && npm link
```

### Q: Requests timeout or hang.

Usually X's rate limits. Try:
- Reduce the `n` parameter (fewer results)
- Wait 15+ minutes
- Reduce request frequency

### Q: "auth failed" or "invalid credentials"

Your X cookies expired. Extract fresh ones from x.com and update `AUTH_TOKEN` and `CT0`.

### Q: My Bird API is slow.

Possible causes:
- X is slow or throttling you
- Your server is underpowered (upgrade plan)
- You're requesting too many results (`n=100`)

Try reducing `n` to 5-10 per request.

### Q: How do I debug what's happening?

Check logs:
```bash
# Local
npm start  # Check console output

# Railway
railway logs

# Docker
docker logs bird-api

# Fly.io
flyctl logs
```

### Q: Can I see the raw API response?

Yes, all endpoints return JSON. Use curl or Postman to inspect:
```bash
curl -i "http://localhost:3000/search?q=test&n=1" \
  -H "x-api-key: your-secret"
```

---

## Features & Limitations

### Q: Can I post images/videos with Bird API?

Not yet. Current `/tweet` endpoint only supports text. The bird CLI might support media; check [bird docs](https://github.com/jawond/bird).

### Q: Can I schedule tweets for later?

Not through Bird API directly. Use n8n or Zapier to schedule:
1. Create a scheduled trigger (e.g., "tomorrow at 9am")
2. Call Bird API `/tweet` endpoint when triggered

### Q: Can I delete tweets?

The bird CLI might support deletion, but Bird API doesn't expose it yet. Would be a good feature request!

### Q: Can I quote-tweet?

Not yet. The bird CLI might support it; check the [bird docs](https://github.com/jawond/bird).

### Q: Can I access my DMs?

No. X doesn't expose DMs through its public GraphQL API, and bird CLI doesn't support it.

---

## Best Practices

### Q: How do I avoid getting my account flagged/suspended?

- **Don't spam**: Space out posts and replies
- **Vary your behavior**: Add randomness to timing and search queries
- **Be authentic**: Don't post/reply to everything automatically
- **Monitor engagement**: If posts get zero engagement, rethink your strategy
- **Respect rate limits**: Stay well under 100 reads/20 writes per day

### Q: Should I use Bird API for commercial purposes?

Yes! It's open source (MIT license). Use it for:
- AI avatars / personas
- Content monitoring
- News aggregation
- Engagement automation

Just respect X's Terms of Service (no spam, no bot farms, etc.).

### Q: What should I do if my account gets suspended?

Bird API is a tool like curl or n8n. It's not responsible for suspensions. But:
- X might suspend accounts for bot-like behavior
- Ensure your workflows are respectful and authentic
- Don't run other tools/scripts simultaneously with Bird API that might conflict

If suspended, you likely violated X's ToS directly, not because of Bird API.

---

## Open Source & Contributing

### Q: Is Bird API open source?

Yes! MIT License. You can use, modify, and redistribute it.

### Q: Can I contribute?

Absolutely! See **[CONTRIBUTING.md](CONTRIBUTING.md)**.

### Q: Where can I report bugs?

Open an issue on [GitHub](https://github.com/your-username/bird-api/issues).

### Q: Can I suggest features?

Yes! Open an issue with label `enhancement`.

### Q: How do I get support?

1. Check this FAQ
2. Check [SETUP.md](SETUP.md), [USAGE.md](USAGE.md), [CONTENT_SOURCING.md](CONTENT_SOURCING.md)
3. Open a GitHub Issue
4. Ask in GitHub Discussions

---

## Pricing & Costs

### Q: Is Bird API free?

Yes, the software is free (MIT license).

Hosting costs depend on your provider:
- **Railway**: $5/month (after free credits)
- **Render**: Free (with sleep) or ~$7/month (paid)
- **Fly.io**: Free (3 shared VMs) or paid for more
- **Your server**: Whatever you pay for hosting

X API is free, no API key required.

### Q: Do I need a paid X API plan?

No. Bird API uses X's internal GraphQL endpoints (same ones the web app uses). Free.

---

## Privacy & Security

### Q: Are my X credentials secure?

Yes if you:
- Only use environment variables (never hardcode)
- Never commit `.env` to git
- Use HTTPS (Railway, Render, Fly.io all provide this by default)
- Keep your `API_SECRET` secret

Bird API is self-hosted on YOUR server, not shared with us.

### Q: What data does Bird API collect?

None. It's just a local wrapper around X's API. No analytics, no tracking.

Your requests go directly from your server to X's servers.

### Q: What happens to my search history?

Not stored by Bird API. X might store it (as they do for all web traffic).

If you use n8n or Zapier, they might log requests (check their privacy policies).

---

## Still Have Questions?

- **General questions**: Open a GitHub Discussion
- **Bug reports**: Open a GitHub Issue
- **Security concerns**: DM maintainers privately
- **Feature requests**: Open a GitHub Issue with label `enhancement`

**Happy automating!** 🚀
