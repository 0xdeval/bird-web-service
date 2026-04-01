# Bird API Usage Guide

Complete patterns and examples for using Bird API in n8n, Zapier, Make, and custom applications.

## Table of Contents

- [Basic Concepts](#basic-concepts)
- [n8n Workflow Patterns](#n8n-workflow-patterns)
  - [Pattern 1: Topic Monitoring](#pattern-1-topic-monitoring)
  - [Pattern 2: News-Driven Posts](#pattern-2-news-driven-posts)
  - [Pattern 3: Engagement Workflow](#pattern-3-engagement-workflow)
  - [Pattern 4: Mention Response](#pattern-4-mention-response)
- [Zapier / Make Integration](#zapier--make-integration)
- [Rate Limiting & Error Handling](#rate-limiting--error-handling)
- [Memory & Deduplication](#memory--deduplication)
- [Best Practices](#best-practices)

---

## Basic Concepts

### API Key Authentication

Every request to Bird API (except `/health`) must include your API secret:

```bash
# As a header
-H "x-api-key: your-secret-key"
```

### Query vs. Body Parameters

- **GET requests**: Parameters go in the query string
  ```
  GET /search?q=AI&n=5
  ```

- **POST requests**: Parameters go in JSON body
  ```
  POST /tweet
  { "text": "Hello world" }
  ```

### Response Format

All responses are JSON:

```json
{
  "success": true,
  "data": [...],
  "error": null
}
```

Or on error:
```json
{
  "success": false,
  "error": "Rate limited. Please wait.",
  "output": ""
}
```

---

## n8n Workflow Patterns

### Pattern 1: Topic Monitoring

**Goal**: Periodically check what's being discussed about your avatar's key topics.

**Trigger**: Schedule (every 4 hours)

**Flow**:
```
Schedule Trigger (every 4 hours)
  ↓
HTTP Request → Bird /search
  ↓
Code Node (filter high-engagement posts)
  ↓
Store in Data Table or Database
```

**HTTP Request Node Configuration**:

| Field | Value |
|-------|-------|
| Method | GET |
| URL | `{{ YOUR_BIRD_API_URL }}/search?q=AI+regulation+min_faves:50&n=10` |
| Headers | `x-api-key: {{ YOUR_API_SECRET }}` |

**Code Node (JavaScript)**:
```javascript
// Filter for high-quality posts
const posts = $input.all()[0].body.data || [];
const filtered = posts.filter(p => 
  p.engagement.favorites > 100 || 
  p.engagement.replies > 50
);

return {
  filtered_posts: filtered,
  count: filtered.length,
  timestamp: new Date().toISOString()
};
```

**Store Results**:
- Use n8n's **Data Table** or **Database** node
- Write filtered posts + timestamp
- Query weekly for trends

---

### Pattern 2: News-Driven Posts

**Goal**: Generate original posts based on current topics, avoiding repetition.

**Trigger**: Schedule (2× per day, 9am + 4pm)

**Flow**:
```
Schedule Trigger
  ↓
HTTP Request → Bird /search
  ↓
Code Node (check Memory table for duplicates)
  ↓
Skip if already posted (IF node)
  ↓
HTTP Request → Sub-workflow (get avatar prompt)
  ↓
Code Node (generate post via LLM)
  ↓
HTTP Request → Bird /tweet
  ↓
Data Table Insert (write to Memory)
```

**Sub-workflow: Avatar Init**

Create a separate n8n workflow called "Avatar Init" that returns:
```javascript
{
  "systemPrompt": "You are...",
  "personality": "...",
  "topics": ["AI", "tech"]
}
```

**Main Workflow: HTTP Request (Bird /search)**

```
Method: GET
URL: {{ YOUR_BIRD_API_URL }}/search?q=AI+regulation+filter:news+min_faves:50&n=10
Headers: x-api-key: {{ YOUR_API_SECRET }}
```

**Code Node: Check Memory**
```javascript
const posts = $input.all()[0].body.data || [];
const memory = $input.all()[1].body; // From Data Table query

// Filter out posts we've already covered
const newPosts = posts.filter(p => 
  !memory.some(m => m.tweet_id === p.id)
);

return {
  new_posts: newPosts,
  should_post: newPosts.length > 0
};
```

**Code Node: Generate Post (requires Claude API key)**
```javascript
const posts = $input.all()[0].body.new_posts;
const avatar = $input.all()[1].body; // From Avatar Init workflow

if (!posts.length) {
  return { should_post: false };
}

const topPost = posts[0];

// Call Claude API to generate post
const prompt = `You are ${avatar.systemPrompt}.

Here's a trending topic:
Title: ${topPost.text}
Engagement: ${topPost.engagement.favorites} likes

Write one original post (max 280 characters) that shares your unique perspective.
Be opinionated. Sound human, not like a bot.`;

// ... call Claude API here ...
// This is pseudo-code; adapt to your LLM setup

return {
  generated_text: "Your generated post here...",
  original_post_id: topPost.id
};
```

**HTTP Request: Post Tweet**
```
Method: POST
URL: {{ YOUR_BIRD_API_URL }}/tweet
Body: {
  "text": "{{ $node.GeneratePost.data.generated_text }}"
}
Headers: x-api-key: {{ YOUR_API_SECRET }}
```

**Data Table: Store Memory**
- Write `{ tweet_id, posted_text, timestamp, original_post }`
- Query this before posting to avoid repeats

---

### Pattern 3: Engagement Workflow

**Goal**: Find interesting posts to reply to and engage with.

**Trigger**: Schedule (3–5× per day)

**Flow**:
```
Schedule Trigger (every 4 hours)
  ↓
HTTP Request → Bird /search (with filters)
  ↓
Code Node (filter + deduplicate)
  ↓
HTTP Request → Bird /thread (get context)
  ↓
HTTP Request → Sub-workflow (get avatar prompt)
  ↓
Code Node (generate reply via LLM)
  ↓
HTTP Request → Bird /reply
  ↓
Data Table Insert (write to Memory)
```

**HTTP Request: Search for Engagement Targets**
```
Method: GET
URL: {{ YOUR_BIRD_API_URL }}/search?q=AI+min_replies:20+min_faves:100&n=5
Headers: x-api-key: {{ YOUR_API_SECRET }}
```

**Code Node: Filter & Deduplicate**
```javascript
const posts = $input.all()[0].body.data || [];
const memory = $input.all()[1].body; // From Data Table

// Filter out posts we've already replied to
const candidates = posts.filter(p => 
  !memory.some(m => m.replied_to_id === p.id)
);

// Pick the best one
const best = candidates.sort((a, b) => 
  (b.engagement.replies - a.engagement.replies)
)[0];

return {
  target_post: best,
  should_engage: !!best
};
```

**HTTP Request: Get Thread Context**
```
Method: GET
URL: {{ YOUR_BIRD_API_URL }}/thread?id={{ $node.FilterCandidates.data.target_post.id }}
Headers: x-api-key: {{ YOUR_API_SECRET }}
```

**Code Node: Generate Reply**
```javascript
const thread = $input.all()[0].body.data;
const avatar = $input.all()[1].body;

// Prepare context
const context = thread.map(t => 
  `@${t.author} said: "${t.text}"`
).join("\n\n");

const prompt = `You are ${avatar.systemPrompt}.

Here's a conversation thread:
${context}

Write one reply to the last message. Be conversational and add value.
Max 280 characters. Don't just agree; add your unique perspective.`;

// ... call LLM to generate reply ...

return {
  reply_text: "Your reply here...",
  reply_to_id: thread[thread.length - 1].id
};
```

**HTTP Request: Post Reply**
```
Method: POST
URL: {{ YOUR_BIRD_API_URL }}/reply
Body: {
  "tweetId": "{{ $node.GenerateReply.data.reply_to_id }}",
  "text": "{{ $node.GenerateReply.data.reply_text }}"
}
Headers: x-api-key: {{ YOUR_API_SECRET }}
```

**Data Table: Log Engagement**
- Write `{ replied_to_id, reply_text, timestamp, engagement_metrics }`
- Use this to avoid duplicate replies

---

### Pattern 4: Mention Response

**Goal**: Reply to people who mention your avatar.

**Trigger**: Schedule (every 2–3 hours)

**Flow**:
```
Schedule Trigger (every 2-3 hours)
  ↓
HTTP Request → Bird /mentions
  ↓
Code Node (filter + deduplicate)
  ↓
IF: Any new mentions?
  ├─ Yes:
  │   ↓
  │   HTTP Request → Bird /thread
  │   ↓
  │   Code Node (generate contextual reply)
  │   ↓
  │   HTTP Request → Bird /reply
  │   ↓
  │   Data Table Insert
  └─ No: Skip
```

**HTTP Request: Get Mentions**
```
Method: GET
URL: {{ YOUR_BIRD_API_URL }}/mentions?n=10
Headers: x-api-key: {{ YOUR_API_SECRET }}
```

**Code Node: Filter Unanswered**
```javascript
const mentions = $input.all()[0].body.data || [];
const responded = $input.all()[1].body; // From Data Table

// Find mentions we haven't replied to
const unanswered = mentions.filter(m => 
  !responded.some(r => r.mention_id === m.id)
);

// Pick the first unanswered one
const priority = unanswered[0];

return {
  mention: priority,
  has_mentions: !!priority
};
```

**HTTP Request: Get Thread**
```
Method: GET
URL: {{ YOUR_BIRD_API_URL }}/thread?id={{ $node.FilterMentions.data.mention.id }}
Headers: x-api-key: {{ YOUR_API_SECRET }}
```

**Code Node: Generate Reply**
```javascript
const thread = $input.all()[0].body.data;
const avatar = $input.all()[1].body;

const context = thread.map(t => 
  `@${t.author}: "${t.text}"`
).join("\n\n");

const prompt = `You are ${avatar.systemPrompt}.

Someone mentioned you in this conversation:
${context}

Write a thoughtful reply. Be warm but authentic. Max 280 characters.`;

// ... call LLM ...

return {
  reply_text: "Your reply here...",
  mention_id: thread[thread.length - 1].id
};
```

**HTTP Request: Post Reply**
```
Method: POST
URL: {{ YOUR_BIRD_API_URL }}/reply
Body: {
  "tweetId": "{{ $node.GenerateReply.data.mention_id }}",
  "text": "{{ $node.GenerateReply.data.reply_text }}"
}
Headers: x-api-key: {{ YOUR_API_SECRET }}
```

**Data Table: Log Response**
- Write `{ mention_id, replied_text, timestamp }`

---

## Zapier / Make Integration

### Simple Zapier Zap: Search on Schedule

**Trigger**: Schedule (daily at 9am)

**Action 1**: Webhook by Zapier → POST

```
URL: YOUR_BIRD_API_URL/search?q=AI+regulation&n=5
Method: GET
Headers:
  x-api-key: YOUR_SECRET
```

**Action 2**: Filter

```
Text: {{ response.body.data | length }}
Condition: Is greater than 0
```

**Action 3**: Send Email or Slack Message

```
Send results to yourself
```

### Zapier Code Step (Advanced)

In a Code by Zapier step:

```javascript
const fetch = require('node-fetch');

const response = await fetch(
  'YOUR_BIRD_API_URL/search?q=AI&n=5',
  {
    headers: { 'x-api-key': process.env.API_SECRET }
  }
);

const data = await response.json();
return { results: data.data };
```

### Make (formerly Integromat)

**HTTP Module**:
- **Method**: GET
- **URL**: `{{YOUR_BIRD_API_URL}}/search?q=AI&n=5`
- **Headers**: 
  - `x-api-key: {{YOUR_API_SECRET}}`
- **Receive**: JSON (auto-parses response)

---

## Rate Limiting & Error Handling

### Expected Errors

| Code | Meaning | Solution |
|------|---------|----------|
| 401 | Wrong API key | Check `x-api-key` header |
| 400 | Missing required param | Check query string or body |
| 429 | Rate limited by X | Wait 15+ minutes, reduce frequency |
| 500 | Server error | Check logs, retry in 30s |

### Retry Logic in n8n

Use a **Wait** node + **Loop** node:

1. Add HTTP Request node
2. After the node, add **Error Handling → Continue on error**
3. Add an **IF** node: `check if error.status === 429`
4. If true: **Wait** 30 seconds, then **Retry**
5. If false: **Fail** and log

```javascript
// In Code node after HTTP request
if ($input.all()[0].executionStatus === 'error') {
  const status = $input.all()[0].error.statusCode;
  
  if (status === 429) {
    // Rate limited — caller should retry
    return { retry_after: 30 };
  } else if (status >= 500) {
    // Server error — retry after delay
    return { retry_after: 30 };
  } else {
    // Client error — fail
    return { should_fail: true, error: $input.all()[0].error };
  }
}
```

---

## Memory & Deduplication

### Why Memory Matters

Without a memory/history table, your workflows will:
- Reply to the same post multiple times
- Post about the same news twice
- Create duplicate content

### Using n8n Data Tables

1. Create a **Data Table** called "Bird Memory"
2. Columns: `id` (primary key), `tweet_id`, `action`, `timestamp`, `data`

**Before engaging**:
```javascript
// Query the Data Table
const memory = await n8n.getDataTable('Bird Memory');
const isDuplicate = memory.some(m => m.tweet_id === postId);

if (isDuplicate) {
  return { should_skip: true };
}
```

**After engaging**:
```javascript
// Insert into Data Table
await n8n.insertDataTableRow('Bird Memory', {
  id: postId,
  tweet_id: postId,
  action: 'replied',
  timestamp: new Date().toISOString(),
  data: JSON.stringify({ reply_text, engagement })
});
```

### Using a Database

For more robust memory, use PostgreSQL or MongoDB:

```javascript
// Example: PostgreSQL
const pool = new (require('pg')).Pool();

const isDuplicate = await pool.query(
  'SELECT * FROM bird_memory WHERE tweet_id = $1',
  [postId]
);

if (isDuplicate.rows.length > 0) {
  return { should_skip: true };
}

// Log action
await pool.query(
  'INSERT INTO bird_memory (tweet_id, action, timestamp) VALUES ($1, $2, $3)',
  [postId, 'replied', new Date()]
);
```

### Weekly Summary

Create a workflow that runs weekly:

```
Schedule Trigger (Sundays at 6pm)
  ↓
Query Data Table / Database (last 7 days)
  ↓
Code Node (count actions, engagement stats)
  ↓
Send email summary
```

---

## Best Practices

### 1. **Add Randomness to Avoid Detection**

X's systems flag patterns. Add jitter to:
- **Posting times**: ±30 minutes from scheduled time
- **Request delays**: 2–10 seconds between requests
- **Search queries**: Vary keywords (don't search the same exact query every time)

```javascript
// Randomize timing
const jitter = Math.random() * 60000; // 0-60 seconds
await new Promise(r => setTimeout(r, jitter));

// Randomize search queries
const queries = [
  'AI regulation',
  'artificial intelligence policy',
  'AI governance news'
];
const query = queries[Math.floor(Math.random() * queries.length)];
```

### 2. **Monitor Engagement Metrics**

Track which posts get engagement:

```javascript
// In your Data Table
{
  posted_text: "...",
  engagement_24h: 12,
  engagement_7d: 45,
  sentiment: "positive",
  topic: "AI regulation"
}
```

If posts consistently get zero engagement:
- Adjust topic selection
- Change posting time
- Vary tone/style

### 3. **Space Out Requests**

Don't send all requests at once:

```javascript
// Bad: All requests fire simultaneously
await Promise.all([search1, search2, search3]);

// Good: Space them out
await search1;
await wait(5000);
await search2;
await wait(5000);
await search3;
```

### 4. **Log Everything**

Write all actions to a log table:

```javascript
{
  timestamp: "2026-04-01T09:30:00Z",
  action: "search",
  query: "AI regulation",
  result_count: 5,
  status: "success"
}
```

Weekly, review your logs to:
- Spot failed requests
- Identify rate limit patterns
- Adjust scheduling

### 5. **Respect Rate Limits**

Keep to these guidelines:
- **100 reads per day** (searches, mentions, threads)
- **20 writes per day** (tweets, replies)

If you need more, combine Bird API with the official [X API](https://developer.twitter.com/).

### 6. **Rotate Credentials Monthly**

Every 4 weeks:
1. Extract fresh `auth_token` and `ct0` from x.com
2. Update environment variables
3. Restart your service

```bash
# Reminder: Set calendar reminders for this!
```

### 7. **Error Handling**

Always handle errors gracefully:

```javascript
try {
  const response = await fetch(birdApiUrl, ...);
  const data = await response.json();
  
  if (!response.ok) {
    if (response.status === 429) {
      // Rate limited — wait and retry
      console.log('Rate limited. Waiting 30 seconds...');
      await wait(30000);
      return retry();
    } else {
      // Other error — log and fail
      console.error('Bird API error:', data.error);
      throw new Error(data.error);
    }
  }
  
  return data;
} catch (e) {
  console.error('Request failed:', e.message);
  // Continue workflow (don't block entirely)
  return { error: e.message, retry_later: true };
}
```

---

## Common Recipes

### Recipe: Find Viral Posts to Engage With

```
Search: "AI" min_faves:1000 min_replies:100 lang:en
→ Get threads for top 3
→ Generate thoughtful replies
→ Schedule replies 2 hours apart
```

### Recipe: Monitor Competitor Mentions

```
Search: "@CompetitorName OR CompetitorName -from:CompetitorName"
→ Read threads
→ Store in Data Table
→ Weekly summary of what people say
```

### Recipe: Find Expert Opinions

```
Search: "I think..." OR "Hot take" OR "Unpopular opinion" AI regulation
→ Get replies
→ Note who's getting traction
→ Follow interesting voices
```

### Recipe: Build a News Digest

```
Combine Google News RSS + Bird Search
→ Fetch daily headlines on your topic
→ Search X for reactions
→ Generate summary post
→ Post once daily
```

---

## Need Help?

- See [SETUP.md](SETUP.md) for deployment & credential issues
- See [CONTENT_SOURCING.md](CONTENT_SOURCING.md) for search operator reference
- Open an issue on GitHub
- Check the [bird CLI docs](https://github.com/jawond/bird) for CLI-specific questions

**Happy building!** 🚀
