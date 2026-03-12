// ai_feedback_client.js
// Frontend-Helfer: ruft deinen Backend-Proxy auf.
// WICHTIG: KEIN API-Key im Browser!

export async function requestAIFeedback({ code, lesson, signal, endpoint = '/api/groq-feedback' }) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, lesson }),
    signal,
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Groq proxy error ${res.status}: ${txt}`);
  }
  return await res.json();
}

// Kleine, stabile Hash-Funktion um unnötige API Calls zu vermeiden
export function stableHash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}
