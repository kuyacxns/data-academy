// useGroqFeedback.js
// React Hook: verhindert Dauerschleifen durch Debounce + AbortController + Request-Dedupe.

import { requestAIFeedback, stableHash } from './ai_feedback_client.js';

export function useGroqFeedback({ code, lesson, enabled = true, debounceMs = 700, endpoint }) {
  const React = window.React; // für In-Browser React
  const { useEffect, useRef, useState } = React;

  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const lastKeyRef = useRef('');
  const abortRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const trimmed = (code || '').trim();
    if (trimmed.length < 3) {
      setFeedback(null);
      setError(null);
      setLoading(false);
      return;
    }

    // Dedupe: gleicher Input + gleiche Lesson => kein neuer Call
    const lessonId = typeof lesson === 'string' ? lesson : (lesson?.id || lesson?.title || lesson?.type || '');
    const key = `${lessonId}:${stableHash(trimmed)}`;
    if (key === lastKeyRef.current) return;
    lastKeyRef.current = key;

    // Debounce
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      // Cancel in-flight request
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const result = await requestAIFeedback({
          code: trimmed,
          lesson: lessonId,
          signal: controller.signal,
          endpoint: endpoint || '/api/groq-feedback'
        });
        setFeedback(result);
      } catch (e) {
        if (e.name !== 'AbortError') setError(String(e.message || e));
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    // Cleanup
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };

    // WICHTIG: NICHT feedback als dependency aufnehmen (sonst Schleife!)
  }, [code, lesson, enabled, debounceMs, endpoint]);

  return { feedback, loading, error };
}
