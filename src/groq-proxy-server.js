// groq-proxy-server.js
// Minimaler Node/Express Proxy, damit dein GROQ_API_KEY NICHT im Frontend landet.
// Läuft als CommonJS (kein "type":"module" nötig).
//
// Start:
// 1) npm init -y
// 2) npm i express
// 3) GROQ_API_KEY als Umgebungsvariable setzen
//    Windows (PowerShell):  $env:GROQ_API_KEY="gsk_..."
//    mac/linux:             export GROQ_API_KEY="gsk_..."
// 4) node groq-proxy-server.js
//
// Dann im Frontend fetch auf: http://localhost:8787/api/groq-feedback (oder per Reverse-Proxy gleich-origin).

const express = require('express');

const app = express();
app.use(express.json({ limit: '1mb' }));

// Simple CORS (für lokale Tests). In Produktion bitte auf deine Domain einschränken.
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) {
  console.error('Missing GROQ_API_KEY env var');
  process.exit(1);
}

app.post('/api/groq-feedback', async (req, res) => {
  try {
    const { code, lesson } = req.body || {};
    if (!code || typeof code !== 'string') {
      return res.status(400).send('Missing code');
    }

    const prompt = `Du bist ein strenger aber hilfreicher Coding-Tutor.\n` +
      `Analysiere den eingegebenen Code für die Lesson: ${lesson || 'unbekannt'}.\n` +
      `Gib NUR gültiges JSON zurück (ohne Markdown), Schema:\n` +
      `{\n  "summary": "...",\n  "errors": ["..."],\n  "improvements": ["..."],\n  "score": 0\n}\n` +
      `Score 0-100.\n\nCODE:\n${code}`;

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        temperature: 0.2,
        messages: [
          { role: 'system', content: 'You are a helpful code reviewer.' },
          { role: 'user', content: prompt },
        ],
      }),
    });

    const data = await groqRes.json();
    const content = data?.choices?.[0]?.message?.content || '';

    // Parse JSON robust (falls Modell trotzdem Text drumherum liefert)
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
      else throw new Error('Model did not return JSON');
    }

    res.json(parsed);
  } catch (e) {
    res.status(500).send(String(e.message || e));
  }
});

app.listen(8787, () => console.log('Groq proxy listening on http://localhost:8787'));
