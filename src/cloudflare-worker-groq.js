// cloudflare-worker-groq.js
// Cloudflare Worker als Proxy (API-Key bleibt als Secret im Worker!).
// Route: POST /api/groq-feedback
// Secret setzen: wrangler secret put GROQ_API_KEY

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/api/groq-feedback') {
      return new Response('Not found', { status: 404 });
    }
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const { code, lesson } = await request.json().catch(() => ({}));
    if (!code || typeof code !== 'string') {
      return new Response('Missing code', { status: 400 });
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
        'Authorization': `Bearer ${env.GROQ_API_KEY}`,
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

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
      else return new Response('Model did not return JSON', { status: 502 });
    }

    return new Response(JSON.stringify(parsed), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  },
};
