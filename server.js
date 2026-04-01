const express = require('express');
const { execSync } = require('child_process');
const app = express();

app.use(express.json());

// ============================================================
// AUTH MIDDLEWARE
// Protects all endpoints with a simple API key check.
// Set API_SECRET in your Railway environment variables.
// Pass it from n8n as header: x-api-key
// ============================================================
app.use((req, res, next) => {
  // Allow health check without auth
  if (req.path === '/health') return next();

  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.API_SECRET) {
    return res.status(401).json({ error: 'Unauthorized. Provide x-api-key header.' });
  }
  next();
});

// ============================================================
// HELPER: Run bird command safely
// ============================================================
function runBird(command, timeout = 30000) {
  try {
    const result = execSync(command, {
      encoding: 'utf-8',
      timeout,
      env: {
        ...process.env,
        NO_COLOR: '1'
      }
    });
    return { success: true, output: result.trim() };
  } catch (e) {
    return {
      success: false,
      error: e.stderr ? e.stderr.trim() : e.message,
      output: e.stdout ? e.stdout.trim() : ''
    };
  }
}

function runBirdJSON(command, timeout = 30000) {
  const result = runBird(command, timeout);
  if (!result.success) return result;
  try {
    result.data = JSON.parse(result.output);
  } catch (e) {
    result.data = null;
  }
  return result;
}

// Escape double quotes in user text to prevent command injection
function escapeText(text) {
  if (!text) return '';
  return text.replace(/"/g, '\\"').replace(/\$/g, '\\$').replace(/`/g, '\\`');
}

// ============================================================
// ENDPOINTS
// ============================================================

// Health check (no auth required)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Check credentials
app.get('/whoami', (req, res) => {
  const result = runBird('bird whoami');
  res.json(result);
});

// Post a new tweet
// Body: { "text": "Hello world" }
app.post('/tweet', (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });

  const result = runBird(`bird tweet "${escapeText(text)}"`);
  res.json(result);
});

// Reply to a tweet
// Body: { "tweetId": "123456789" or URL, "text": "My reply" }
app.post('/reply', (req, res) => {
  const { tweetId, text } = req.body;
  if (!tweetId || !text) {
    return res.status(400).json({ error: 'tweetId and text are required' });
  }

  const result = runBird(`bird reply "${escapeText(tweetId)}" "${escapeText(text)}"`);
  res.json(result);
});

// Read a tweet
// Query: /read?id=123456789 or /read?id=https://x.com/user/status/123
app.get('/read', (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'id query param is required' });

  const result = runBirdJSON(`bird read "${escapeText(id)}" --json`);
  res.json(result);
});

// Search tweets
// Query: /search?q=AI+agents&n=5
app.get('/search', (req, res) => {
  const { q, n = 5 } = req.query;
  if (!q) return res.status(400).json({ error: 'q query param is required' });

  const result = runBirdJSON(`bird search "${escapeText(q)}" -n ${parseInt(n)} --json`);
  res.json(result);
});

// Get mentions
// Query: /mentions?n=10
app.get('/mentions', (req, res) => {
  const { n = 10 } = req.query;

  const result = runBirdJSON(`bird mentions -n ${parseInt(n)} --json`);
  res.json(result);
});

// Get replies to a tweet
// Query: /replies?id=123456789
app.get('/replies', (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'id query param is required' });

  const result = runBirdJSON(`bird replies "${escapeText(id)}" --json`);
  res.json(result);
});

// Get a thread
// Query: /thread?id=123456789
app.get('/thread', (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'id query param is required' });

  const result = runBirdJSON(`bird thread "${escapeText(id)}" --json`);
  res.json(result);
});

// Get user tweets
// Query: /user-tweets?handle=steipete&n=20
app.get('/user-tweets', (req, res) => {
  const { handle, n = 20 } = req.query;
  if (!handle) return res.status(400).json({ error: 'handle query param is required' });

  const cleanHandle = handle.startsWith('@') ? handle : `@${handle}`;
  const result = runBirdJSON(`bird user-tweets ${cleanHandle} -n ${parseInt(n)} --json`);
  res.json(result);
});

// ============================================================
// START SERVER
// ============================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Bird API running on port ${PORT}`);
});
