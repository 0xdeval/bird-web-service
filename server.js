const express = require('express');
const { execFileSync } = require('child_process');
require('dotenv').config();

const app = express();
const PORT = Number.parseInt(process.env.PORT, 10) || 3000;
const API_SECRET = process.env.API_SECRET;

app.use(express.json());

app.use((req, res, next) => {
  if (req.path === '/health' || !API_SECRET) return next();
  if (req.get('x-api-key') !== API_SECRET) {
    return res.status(401).json({ error: 'Unauthorized. Provide x-api-key header.' });
  }
  return next();
});

function toPositiveInt(value, fallbackValue) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallbackValue;
}

function runBird(args, options = {}) {
  const { timeout = 30000, parseJson = false } = options;
  try {
    const output = execFileSync('bird', args, {
      encoding: 'utf-8',
      timeout,
      env: { ...process.env, NO_COLOR: '1' }
    }).trim();

    const result = { success: true, output };
    if (parseJson) {
      try {
        result.data = output ? JSON.parse(output) : null;
      } catch {
        result.data = null;
      }
    }
    return result;
  } catch (error) {
    const stdout = error.stdout ? String(error.stdout).trim() : '';
    const stderr = error.stderr ? String(error.stderr).trim() : '';
    const birdNotFound = error.code === 'ENOENT';

    return {
      success: false,
      output: stdout,
      error: birdNotFound ? 'bird CLI not found in PATH.' : (stderr || error.message),
      ...(parseJson ? { data: null } : {})
    };
  }
}

function requireQueryParam(req, res, name) {
  const value = req.query[name];
  if (!value) {
    res.status(400).json({ error: `${name} query param is required` });
    return null;
  }
  return String(value);
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/credentials', (req, res) => {
  const { auth_token, ct0 } = req.body || {};
  if (!auth_token || !ct0) {
    return res.status(400).json({ error: 'auth_token and ct0 are required' });
  }
  process.env.AUTH_TOKEN = String(auth_token);
  process.env.CT0 = String(ct0);
  return res.json({ success: true });
});

app.get('/whoami', (req, res) => {
  res.json(runBird(['whoami']));
});

app.post('/tweet', (req, res) => {
  const { text } = req.body || {};
  if (!text) return res.status(400).json({ error: 'text is required' });
  return res.json(runBird(['tweet', String(text)]));
});

app.post('/reply', (req, res) => {
  const { tweetId, text } = req.body || {};
  if (!tweetId || !text) {
    return res.status(400).json({ error: 'tweetId and text are required' });
  }
  return res.json(runBird(['reply', String(tweetId), String(text)]));
});

app.get('/read', (req, res) => {
  const id = requireQueryParam(req, res, 'id');
  if (!id) return;
  res.json(runBird(['read', id, '--json'], { parseJson: true }));
});

app.get('/search', (req, res) => {
  const q = requireQueryParam(req, res, 'q');
  if (!q) return;
  const n = toPositiveInt(req.query.n, 5);
  res.json(runBird(['search', q, '-n', String(n), '--json'], { parseJson: true }));
});

app.get('/mentions', (req, res) => {
  const n = toPositiveInt(req.query.n, 10);
  res.json(runBird(['mentions', '-n', String(n), '--json'], { parseJson: true }));
});

app.get('/replies', (req, res) => {
  const id = requireQueryParam(req, res, 'id');
  if (!id) return;
  res.json(runBird(['replies', id, '--json'], { parseJson: true }));
});

app.get('/thread', (req, res) => {
  const id = requireQueryParam(req, res, 'id');
  if (!id) return;
  res.json(runBird(['thread', id, '--json'], { parseJson: true }));
});

app.get('/home', (req, res) => {
  const n = toPositiveInt(req.query.n, 20);
  const args = ['home', '-n', String(n), '--json'];
  if (req.query.following === 'true') args.splice(1, 0, '--following');
  res.json(runBird(args, { parseJson: true }));
});

app.get('/user-tweets', (req, res) => {
  const handle = requireQueryParam(req, res, 'handle');
  if (!handle) return;
  const n = toPositiveInt(req.query.n, 20);
  const cleanHandle = handle.startsWith('@') ? handle : `@${handle}`;
  res.json(runBird(['user-tweets', cleanHandle, '-n', String(n), '--json'], { parseJson: true }));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Bird API running on port ${PORT}`);
  if (!API_SECRET) {
    console.warn('API_SECRET is not set. Endpoints are currently unauthenticated.');
  }
});
