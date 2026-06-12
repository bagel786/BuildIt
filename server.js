import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8787;

const GROQ_API_KEY = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Only the models the app actually uses — keeps the open endpoint from being
// abused as a general-purpose Groq proxy.
const ALLOWED_MODELS = new Set([
  'llama-3.3-70b-versatile',
  'meta-llama/llama-4-scout-17b-16e-instruct',
]);
const MAX_TOKENS_CAP = 8000;

app.use(express.json({ limit: '10mb' })); // photo uploads arrive as base64

app.post('/api/chat', async (req, res) => {
  if (!GROQ_API_KEY) {
    return res.status(401).json({ error: 'GROQ_API_KEY is not configured on the server' });
  }

  const { model, messages, max_tokens, temperature, response_format } = req.body || {};
  if (!ALLOWED_MODELS.has(model) || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  try {
    const upstream = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: Math.min(max_tokens || 1024, MAX_TOKENS_CAP),
        temperature,
        response_format,
      }),
    });

    const body = await upstream.text();
    res.status(upstream.status).type('application/json').send(body);
  } catch (err) {
    console.error('Groq proxy error:', err);
    res.status(502).json({ error: 'Upstream request failed' });
  }
});

// Serve the built frontend; fall back to index.html for client-side routing
const dist = path.join(__dirname, 'dist');
app.use(express.static(dist));
app.get(/^(?!\/api\/).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));

app.listen(PORT, () => console.log(`BuildIt server listening on port ${PORT}`));
