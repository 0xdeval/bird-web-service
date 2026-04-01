# Content Sourcing Guide

How to find, search, and collect content for your AI avatar workflows using the Bird API and free news sources.

## Table of Contents

- [Bird Search — Finding Content on X](#bird-search--finding-content-on-x)
  - [Basic Search](#basic-search)
  - [Search Operators](#search-operators)
  - [Filtering by Engagement](#filtering-by-engagement)
  - [Filtering by Content Type](#filtering-by-content-type)
  - [Combining Operators](#combining-operators)
  - [Search Recipes](#search-recipes)
- [Reading User Content](#reading-user-content)
  - [Read a Specific Post](#read-a-specific-post)
  - [Get User Tweets](#get-user-tweets)
  - [Get Replies to a Post](#get-replies-to-a-post)
  - [Get a Full Thread](#get-a-full-thread)
  - [Get Mentions](#get-mentions)
- [News Sources — Google News RSS](#news-sources--google-news-rss)
  - [Basic Topic Search](#basic-topic-search)
  - [Advanced Queries](#advanced-queries)
  - [Localization](#localization)
  - [Topic Feeds](#topic-feeds)
- [Workflow Patterns](#workflow-patterns)
  - [Pattern 1: Topic Monitoring](#pattern-1-topic-monitoring)
  - [Pattern 2: News-Driven Posts](#pattern-2-news-driven-posts)
  - [Pattern 3: Engagement Workflow](#pattern-3-engagement-workflow)
  - [Pattern 4: Mention Response](#pattern-4-mention-response)
- [Rate Limits and Best Practices](#rate-limits-and-best-practices)

---

## Bird Search — Finding Content on X

The `/search` endpoint wraps X's search functionality. It supports the same operators you'd use in the X search bar.

### Basic Search

```
GET /search?q=YOUR_QUERY&n=NUMBER_OF_RESULTS
Header: x-api-key: YOUR_API_SECRET
```

Examples:

```bash
# Simple keyword search
curl "http://YOUR_HOST/search?q=artificial+intelligence&n=5" \
  -H "x-api-key: YOUR_SECRET"

# Multi-word exact phrase
curl "http://YOUR_HOST/search?q=%22Iran+war%22&n=10" \
  -H "x-api-key: YOUR_SECRET"
```

> **Note:** Use `+` for spaces and `%22` for double quotes in URLs.

### Search Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `"exact phrase"` | Match exact phrase | `"climate change"` |
| `OR` | Match either term | `Iran OR Israel` |
| `-word` | Exclude a word | `AI -crypto` |
| `from:user` | Posts by a specific user | `from:Reuters` |
| `to:user` | Replies to a specific user | `to:elonmusk` |
| `@user` | Mentioning a user | `@OpenAI` |
| `since:YYYY-MM-DD` | Posts after a date | `since:2026-03-01` |
| `until:YYYY-MM-DD` | Posts before a date | `until:2026-04-01` |
| `lang:xx` | Filter by language | `lang:en` |
| `filter:links` | Only posts with links | `AI filter:links` |
| `filter:images` | Only posts with images | `cat filter:images` |
| `filter:videos` | Only posts with videos | `tutorial filter:videos` |
| `filter:news` | Posts from news accounts | `Iran filter:news` |

### Filtering by Engagement

Find popular posts by requiring minimum engagement:

| Operator | Description | Example |
|----------|-------------|---------|
| `min_faves:N` | Minimum likes | `min_faves:100` |
| `min_retweets:N` | Minimum retweets | `min_retweets:50` |
| `min_replies:N` | Minimum replies | `min_replies:20` |

```bash
# High-engagement posts about AI
curl "http://YOUR_HOST/search?q=AI+min_faves:500&n=5" \
  -H "x-api-key: YOUR_SECRET"
```

### Filtering by Content Type

```bash
# Only posts with links (articles, blog posts)
curl "http://YOUR_HOST/search?q=startup+funding+filter:links&n=10" \
  -H "x-api-key: YOUR_SECRET"

# Only news sources
curl "http://YOUR_HOST/search?q=Iran+filter:news&n=10" \
  -H "x-api-key: YOUR_SECRET"
```

### Combining Operators

Operators can be combined freely to build precise queries:

```bash
# English news about AI regulation with high engagement, from last week
curl "http://YOUR_HOST/search?q=AI+regulation+lang:en+filter:news+min_faves:50+since:2026-03-25&n=10" \
  -H "x-api-key: YOUR_SECRET"

# Posts from specific news outlets about a topic
curl "http://YOUR_HOST/search?q=Iran+(from:Reuters+OR+from:AP+OR+from:BBCWorld+OR+from:AFP)&n=10" \
  -H "x-api-key: YOUR_SECRET"

# Controversial takes (high replies relative to topic)
curl "http://YOUR_HOST/search?q=%22artificial+intelligence%22+min_replies:100+lang:en&n=5" \
  -H "x-api-key: YOUR_SECRET"
```

### Search Recipes

Below are ready-to-use queries for common content sourcing scenarios.

**Trending news on a specific topic:**

```
Iran war filter:news min_faves:100 lang:en
```

**Hot takes and opinions (good for reply engagement):**

```
"AI agents" min_replies:50 -filter:links lang:en
```

**Technical discussions:**

```
"large language models" filter:links min_faves:20 lang:en
```

**Startup and VC conversations:**

```
(fundraising OR "seed round" OR "series A") min_faves:50 lang:en
```

**Find debates to engage with:**

```
"I disagree" OR "hot take" OR "unpopular opinion" AI lang:en min_replies:20
```

**Competitor or brand monitoring:**

```
@YourCompetitor OR "CompetitorName" -from:CompetitorName
```

**Local tech scene (example: Lisbon):**

```
(Lisbon OR Lisboa) (startup OR tech OR AI) lang:en min_faves:10
```

---

## Reading User Content

### Read a Specific Post

Fetch the full content of a single post by ID or URL:

```bash
# By tweet ID
curl "http://YOUR_HOST/read?id=1234567890123456789" \
  -H "x-api-key: YOUR_SECRET"

# By URL
curl "http://YOUR_HOST/read?id=https://x.com/user/status/1234567890123456789" \
  -H "x-api-key: YOUR_SECRET"
```

Returns the post text, author, engagement metrics, and media details in JSON.

### Get User Tweets

Fetch recent posts from any public account:

```bash
# Last 20 tweets from a user
curl "http://YOUR_HOST/user-tweets?handle=elonmusk&n=20" \
  -H "x-api-key: YOUR_SECRET"

# Last 5 tweets from a news outlet
curl "http://YOUR_HOST/user-tweets?handle=Reuters&n=5" \
  -H "x-api-key: YOUR_SECRET"
```

Use this to monitor accounts your avatar should be aware of or respond to.

### Get Replies to a Post

See how people are reacting to a specific post:

```bash
curl "http://YOUR_HOST/replies?id=1234567890123456789" \
  -H "x-api-key: YOUR_SECRET"
```

Useful for finding conversations to join — your avatar can read the replies and add its own perspective.

### Get a Full Thread

Fetch an entire conversation thread:

```bash
curl "http://YOUR_HOST/thread?id=1234567890123456789" \
  -H "x-api-key: YOUR_SECRET"
```

Threads give your avatar the full context before replying, so it doesn't repeat what's already been said.

### Get Mentions

Find posts that mention your avatar's account:

```bash
# Last 10 mentions
curl "http://YOUR_HOST/mentions?n=10" \
  -H "x-api-key: YOUR_SECRET"
```

This is the trigger for your "reply to replies" workflow — check for new mentions, then respond.

---

## News Sources — Google News RSS

Google News provides free RSS feeds that return headlines, summaries, source names, and links. No API key required.

### Basic Topic Search

```
https://news.google.com/rss/search?q=QUERY&hl=LANGUAGE&gl=COUNTRY&ceid=COUNTRY:LANGUAGE
```

Examples:

```
# Iran war news in English
https://news.google.com/rss/search?q=Iran+war&hl=en&gl=US&ceid=US:en

# AI regulation news
https://news.google.com/rss/search?q=AI+regulation&hl=en&gl=US&ceid=US:en

# Startup funding news
https://news.google.com/rss/search?q=startup+funding+round&hl=en&gl=US&ceid=US:en
```

In n8n, use the **RSS Read** node and paste the URL. It returns structured items with `title`, `description`, `link`, and `pubDate`.

### Advanced Queries

Google News RSS supports Google search operators:

```
# Exact phrase
https://news.google.com/rss/search?q=%22artificial+intelligence%22&hl=en&gl=US&ceid=US:en

# Multiple topics with OR
https://news.google.com/rss/search?q=Iran+OR+Israel+OR+%22Middle+East%22&hl=en&gl=US&ceid=US:en

# Exclude terms
https://news.google.com/rss/search?q=AI+-crypto+-bitcoin&hl=en&gl=US&ceid=US:en

# From a specific source
https://news.google.com/rss/search?q=AI+site:reuters.com&hl=en&gl=US&ceid=US:en

# Recent only (last 24 hours)
https://news.google.com/rss/search?q=Iran+war+when:1d&hl=en&gl=US&ceid=US:en

# Last 7 days
https://news.google.com/rss/search?q=AI+regulation+when:7d&hl=en&gl=US&ceid=US:en
```

### Localization

Change `hl` (language) and `gl` (country) to get regional news:

| Region | hl | gl | ceid |
|--------|----|----|------|
| US English | en | US | US:en |
| UK English | en | GB | GB:en |
| Portuguese (Portugal) | pt-PT | PT | PT:pt-PT |
| Portuguese (Brazil) | pt-BR | BR | BR:pt-BR |
| Spanish | es | ES | ES:es |
| French | fr | FR | FR:fr |
| German | de | DE | DE:de |

Example for Portuguese news:

```
https://news.google.com/rss/search?q=inteligência+artificial&hl=pt-PT&gl=PT&ceid=PT:pt-PT
```

### Topic Feeds

Google News also has pre-built topic feeds (no custom query needed):

```
# Top headlines
https://news.google.com/rss?hl=en&gl=US&ceid=US:en

# World news
https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlY4U0FtVnVHZ0pWVXlnQVAB?hl=en&gl=US&ceid=US:en

# Technology
https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pWVXlnQVAB?hl=en&gl=US&ceid=US:en

# Business
https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtVnVHZ0pWVXlnQVAB?hl=en&gl=US&ceid=US:en

# Science
https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp0Y1RjU0FtVnVHZ0pWVXlnQVAB?hl=en&gl=US&ceid=US:en
```

---

## Workflow Patterns

See [USAGE.md](USAGE.md) for detailed n8n, Zapier, and Make workflow implementations.

### Pattern 1: Topic Monitoring

Goal: Periodically check what's being discussed about your avatar's key topics.

```
Schedule Trigger (every 4 hours)
  → HTTP Request (Bird /search for topic)
  → Code Node (combine and deduplicate)
  → Store results in Data Table
```

The Code node compares news headlines with X posts to identify trending angles that haven't been covered yet.

### Pattern 2: News-Driven Posts

Goal: Generate original posts based on current news, filtered through the avatar's personality.

```
Schedule Trigger (2x per day)
  → RSS Read (Google News for avatar's topics)
  → Code Node (pick top 3 headlines, check Memory table)
  → Sub-Workflow: Avatar Init (get system prompt + memory)
  → AI Agent (generate original post using news + personality)
  → HTTP Request (Bird /tweet to post)
  → Data Table Insert (write to Memory table)
```

### Pattern 3: Engagement Workflow

Goal: Find interesting posts to reply to and engage with.

```
Schedule Trigger (3-5x per day)
  → HTTP Request (Bird /search with topic + engagement filters)
  → Code Node (filter out posts avatar already replied to)
  → Code Node (pick 1-2 best candidates)
  → HTTP Request (Bird /thread to get full context)
  → Sub-Workflow: Avatar Init (get system prompt)
  → AI Agent (generate reply using thread context)
  → HTTP Request (Bird /reply to post the reply)
  → Data Table Insert (write to Memory table)
```

### Pattern 4: Mention Response

Goal: Reply to people who mention or reply to your avatar.

```
Schedule Trigger (every 2-3 hours)
  → HTTP Request (Bird /mentions)
  → Code Node (filter out already-responded mentions)
  → IF Node (any new mentions?)
    → Yes:
      → HTTP Request (Bird /thread to get context)
      → Sub-Workflow: Avatar Init (get system prompt)
      → AI Agent (generate contextual reply)
      → HTTP Request (Bird /reply)
      → Data Table Insert (write to Memory table)
    → No: Skip
```

---

## Rate Limits and Best Practices

### Bird API (X GraphQL)

Bird uses X's internal GraphQL endpoints which are rate-limited aggressively:

- **Keep reads under 100/day** — searches, user-tweets, mentions combined.
- **Keep writes under 20/day** — tweets and replies combined.
- **Add random delays** between requests (2-10 seconds) to avoid patterns.
- **Don't run searches back-to-back** — space them out across hours.
- **Expect 429 errors** — add retry logic with exponential backoff in your n8n workflows.
- **Cookies expire** — when bird stops working, grab fresh `auth_token` and `ct0` from your browser and update Railway environment variables.

### Google News RSS

- No rate limits, but don't abuse it (a few requests per hour is fine).
- Results are cached by Google — refreshing more often than every 15 minutes won't give you new results.
- RSS returns ~10-20 items per feed. If you need more, use different query variations.

### General Tips

- **Always check Memory before posting** — avoid replying to the same post twice or covering the same news story.
- **Vary your posting times** — add random delays (±30 minutes) to scheduled triggers so the avatar doesn't post at exact intervals.
- **Monitor engagement** — if posts consistently get zero engagement, adjust the avatar's topics or tone.
- **Rotate search queries** — don't search the same exact query every time. Vary keywords to discover different conversations.
- **Log everything** — write all actions to the Memory table so your weekly summary workflow has full data.

---

## Next Steps

- See **[USAGE.md](USAGE.md)** for complete workflow implementations in n8n, Zapier, and Make
- See **[SETUP.md](SETUP.md)** for deployment and configuration
- Check **[README.md](README.md)** for API endpoint reference
