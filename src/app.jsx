    const { useState, useEffect, useCallback, useRef } = React;

// ════════════════════════════════════════════════════════════════════════════
// 1. CONSTANTS
// ════════════════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'dq-academy-progress';
const AI_MODEL    = 'llama-3.3-70b-versatile';
const AI_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

const LANG_COLOR = { SAS: '#ffd600', PySpark: '#818cf8' };
const LANG_VAR   = { SAS: 'var(--sas)', PySpark: 'var(--py)' };

// ════════════════════════════════════════════════════════════════════════════
// 2. DIFFICULTY MAP
// ════════════════════════════════════════════════════════════════════════════

const DIFFICULTY = {
  l1_1: 1, l1_2: 1,                         // Grundlagen
  l2_1: 1,                                   // Filtern
  l3_1: 2, l3_2: 2, l3_3: 2,               // Datenqualität
  l4_1: 2,                                   // Aggregation
  l5_1: 2,                                   // JOINs
  l6_1: 3,                                   // DB-Verbindungen
  l7_1: 3,                                   // Performance
  l8_1: 3, l8_2: 3,                         // Pipelines
  l9_1: 4,                                   // SCD
  l10_1: 3,                                  // Smart Meter
  l11_1: 3,                                  // DQ-Framework
  l12_1: 3,                                  // GDPR
  l13_1: 4,                                  // Makros
  l14_1: 1, l14_2: 1, l14_3: 2,            // String-Ops
  l15_1: 2,                                  // Datumsfunktionen
  l16_1: 3, l16_2: 4,                       // SQL-Dialekte
};
const DIFF_LABEL = { 1: 'Einfach', 2: 'Mittel', 3: 'Fortgeschritten', 4: 'Experte' };
const DIFF_COLOR = { 1: '#10b981', 2: '#ffd600', 3: '#f97316', 4: '#ef4444' };

// ════════════════════════════════════════════════════════════════════════════
// 3. CUSTOM HOOKS
// ════════════════════════════════════════════════════════════════════════════

/**
 * useProgress — manages lesson completion state with localStorage persistence.
 * Returns: { completedSAS, completedPySpark, storageLoaded, saveProgress, markComplete }
 */
function useProgress(activeLang, activeLesson) {
  const [completedSAS,     setCompletedSAS]     = useState({});
  const [completedPySpark, setCompletedPySpark] = useState({});
  const [storageLoaded,    setStorageLoaded]    = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        setCompletedSAS(data.completedSAS || data.completedLessons || {});
        setCompletedPySpark(data.completedPySpark || {});
      }
    } catch (_) {}
    setStorageLoaded(true);
  }, []);

  // Persist to localStorage
  const saveProgress = useCallback(async (sasDone, pyDone, lang) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        completedSAS: sasDone, completedPySpark: pyDone,
        activeLang: lang || activeLang, lastSaved: new Date().toISOString()
      }));
    } catch (_) {}
  }, [activeLang]);

  // Toggle the active lesson's completion state
  const markComplete = async () => {
    const completedLessons = activeLang === 'SAS' ? completedSAS : completedPySpark;
    const nowDone = !completedLessons[activeLesson.id];
    if (activeLang === 'SAS') {
      const updated = { ...completedSAS };
      if (nowDone) updated[activeLesson.id] = true; else delete updated[activeLesson.id];
      setCompletedSAS(updated);
      await saveProgress(updated, completedPySpark);
    } else {
      const updated = { ...completedPySpark };
      if (nowDone) updated[activeLesson.id] = true; else delete updated[activeLesson.id];
      setCompletedPySpark(updated);
      await saveProgress(completedSAS, updated);
    }
  };

  return { completedSAS, completedPySpark, storageLoaded, saveProgress, markComplete };
}

/**
 * useCodeState — manages per-language code buffers, resets on lesson change.
 * Returns: { sasCode, setSasCode, pyCode, setPyCode }
 */
function useCodeState(lesson) {
  const [sasCode, setSasCode] = useState('');
  const [pyCode,  setPyCode]  = useState('');

  useEffect(() => {
    const ex = lesson.exercise;
    const desc = ex?.description || '';
    setSasCode(ex?.sasStarter   || (ex?.sasSolution      ? `/* ${desc}\n   Schreibe deinen SAS-Code hier: */\n\n`    : ''));
    setPyCode( ex?.pysparkStarter || (ex?.pysparkSolution ? `# ${desc}\n# Schreibe deinen PySpark-Code hier:\n\n` : ''));
  }, [lesson.id]);

  const loadSolution = (type) => {
    if (type === 'sas') setSasCode(lesson.exercise?.sasSolution || '');
    else                setPyCode(lesson.exercise?.pysparkSolution || '');
  };

  const resetCode = (type) => {
    const ex = lesson.exercise;
    if (type === 'sas') setSasCode(ex?.sasStarter || '');
    else                setPyCode(ex?.pysparkStarter || '');
  };

  return { sasCode, setSasCode, pyCode, setPyCode, loadSolution, resetCode };
}

/**
 * useAICheck — Groq API code review with viz-phase lifecycle.
 * Returns: { groqApiKey, setGroqApiKey, aiOutput, setAiOutput, aiLoading, vizPhase, vizOps, checkWithAI }
 */
function useAICheck({ lesson, activeLang, sasCode, pyCode }) {
  const [groqApiKey, setGroqApiKey] = useState('');
  const [aiOutput,   setAiOutput]   = useState('');
  const [aiLoading,  setAiLoading]  = useState(false);
  const [vizPhase,   setVizPhase]   = useState('idle');  // 'idle' | 'running' | 'done'
  const [vizOps,     setVizOps]     = useState([]);

  const checkWithAI = async () => {
    if (!groqApiKey.trim()) {
      setAiOutput('🔑 Bitte gib zuerst deinen Groq API-Key ein (kostenlos auf console.groq.com).');
      return;
    }

    const isSAS = activeLang === 'SAS';
    const code  = isSAS ? sasCode : pyCode;

    // Detect untouched placeholder code
    const isEmpty = !code.trim();
    const isSASPlaceholder = isSAS && code.trim().startsWith('/*') && code.trim().endsWith('*/') && code.trim().split('\n').length <= 4;
    const isPYPlaceholder  = !isSAS && code.trim().split('\n').every(l => l.trim() === '' || l.trim().startsWith('#'));

    if (isEmpty || isSASPlaceholder || isPYPlaceholder) {
      const aufg = lesson.exercise?.description || '';
      setAiOutput(isSAS
        ? `**Noch kein Code — so fängst du an:**\n\nDie Aufgabe lautet: _${aufg}_\n\n**Schritt 1:** Schreibe zuerst den Rahmen:\n\`\`\`sas\nDATA work.ergebnis;\n  SET quelltabelle;\n  /* deine Logik hier */\nRUN;\n\`\`\`\nOder falls du SQL brauchst:\n\`\`\`sas\nPROC SQL;\n  SELECT ...\n  FROM quelltabelle\n  WHERE ...;\nQUIT;\n\`\`\`\n\n**Tipp:** Schreib erst den Grundrahmen, dann füllen wir die Logik aus.`
        : `**Noch kein Code — so fängst du an:**\n\nDie Aufgabe lautet: _${aufg}_\n\n**Schritt 1:** Starte mit den Imports und dem DataFrame:\n\`\`\`python\nfrom pyspark.sql import functions as F\n\ndf = spark.table("quelltabelle")\n\n# deine Transformationen hier\nresult = df.filter(...).select(...)\nresult.show(10)\n\`\`\`\n\n**Tipp:** Schreib erst die Grundstruktur, dann verfeinern wir sie gemeinsam.`
      );
      return;
    }

    // Start loading + run viz animation
    setAiLoading(true);
    setAiOutput('');
    const ops = analyzeCodeOps(code);
    setVizOps(ops);
    setVizPhase('running');

    const langLabel = isSAS ? 'SAS' : 'PySpark/Python';
    const aufgabe   = lesson.exercise?.description;
    const mustLang  = isSAS ? lesson.exercise?.sasSolution : lesson.exercise?.pysparkSolution;
    const langCheck = isSAS
      ? 'Prüfe: korrekte SAS-Syntax, DATA/PROC Struktur, Semikolons, richtige Funktionen und Klauseln.'
      : 'Prüfe: korrekte PySpark-Syntax, Methodenketten, Import-Statements, DataFrame-Operationen.';

    const systemPrompt = `Du bist ein erfahrener Dateningenieur und Tutor für SAS und PySpark mit 15 Jahren Praxiserfahrung in Energieunternehmen wie Vattenfall. Deine Aufgabe ist konkretes, lernförderndes Code-Review.

DEINE REGELN:
- Antworte IMMER auf Deutsch
- Der Lernende HAT Code geschrieben — bewerte diesen Code konkret
- Nenne KONKRETE Zeilenfehler: "In Zeile 3 fehlt das Semikolon nach RUN" statt "Du hast einen Syntaxfehler"
- Zeige immer das KORRIGIERTE Code-Snippet wenn du einen Fehler nennst
- Erkläre WARUM etwas falsch ist, nicht nur WAS falsch ist
- Wenn der Code sehr kurz/unvollständig ist: würdige was da ist und zeige den nächsten konkreten Schritt
- Vergleiche nie 1:1 mit der Musterlösung — denke in Alternativen
- Maximal 400 Wörter
- NIEMALS schreibe "Der Code ist leer" — der Lernende hat Code eingegeben

AUSGABEFORMAT (exakt so strukturiert):
**Bewertung: X/10**
_Ein Satz warum._

**✅ Das stimmt:**
- [konkreter Punkt mit Codebezug]

**❌ Das muss korrigiert werden:**
- [Fehler + korrigiertes Snippet in \`\`\`sas oder \`\`\`python Block]

**💡 Nächster Schritt:**
[Eine einzige, sofort umsetzbare Aufgabe]`;

    const userPrompt =
      `AUFGABE:\n${aufgabe}\n\n` +
      `${langLabel}-CODE DES LERNENDEN (wurde bereits eingegeben):\n\`\`\`${isSAS ? 'sas' : 'python'}\n` +
      `${code.trim()}\n\`\`\`\n\n` +
      `MUSTERLÖSUNG ${langLabel} (nur intern — niemals direkt zeigen oder zitieren):\n${mustLang}\n\n` +
      `Bewerte den Code des Lernenden konkret. ${langCheck}` +
      ` Zeige niemals die Musterlösung — gib stattdessen gezielte Hinweise die zum Ziel führen.`;

    try {
      const res  = await fetch(AI_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + groqApiKey.trim() },
        body: JSON.stringify({ model: AI_MODEL, max_tokens: 1200, temperature: 0.3,
          messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }] })
      });
      const data = await res.json();
      if (data.error) setAiOutput('❌ Groq Fehler: ' + data.error.message);
      else            setAiOutput(data.choices?.[0]?.message?.content || 'Keine Antwort erhalten.');
    } catch (_) {
      setAiOutput('❌ Verbindungsfehler. Prüfe deinen API-Key und die Internetverbindung.');
    }

    setAiLoading(false);
    setVizPhase('done');
    setTimeout(() => setVizPhase('idle'), 8000);
  };

  return { groqApiKey, setGroqApiKey, aiOutput, setAiOutput, aiLoading, vizPhase, vizOps, checkWithAI };
}

// ════════════════════════════════════════════════════════════════════════════
// 4. SMALL UI COMPONENTS
// ════════════════════════════════════════════════════════════════════════════

/** DiffStars — coloured dot row indicating lesson difficulty (1-4). */
function DiffStars({ id, size = 9 }) {
  const d = DIFFICULTY[id] || 1;
  return (
    <span style={{ display: 'inline-flex', gap: 1.5, alignItems: 'center' }}>
      {[1,2,3,4].map(i => (
        <span key={i} style={{
          width: size, height: size, borderRadius: '50%',
          background: i <= d ? DIFF_COLOR[d] : 'rgba(255,255,255,0.1)',
          display: 'inline-block', flexShrink: 0,
          boxShadow: i <= d ? `0 0 4px ${DIFF_COLOR[d]}66` : 'none'
        }} />
      ))}
    </span>
  );
}

/** SidebarProgress — compact card at the BOTTOM of the sidebar (Deep Space style). */
function SidebarProgress({ doneCount, totalLessons, progressPct, langColorHex, mounted }) {
  return (
    <div style={{
      margin: '12px 12px 16px',
      padding: '12px 14px',
      borderRadius: 10,
      background: 'rgba(167,139,250,0.05)',
      border: '1px solid rgba(167,139,250,0.12)',
      opacity: mounted ? 1 : 0,
      transition: 'opacity 0.5s 0.2s'
    }}>
      <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: '#a78bfa', marginBottom: 8 }}>
        Fortschritt
      </div>
      <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden', marginBottom: 6 }}>
        <div style={{
          height: '100%', borderRadius: 99, width: progressPct + '%',
          background: 'linear-gradient(90deg, #a78bfa, #818cf8)',
          transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)'
        }} />
      </div>
      <div style={{ fontSize: 10, color: 'var(--text3)' }}>
        {doneCount}/{totalLessons} · {progressPct}% abgeschlossen
      </div>
    </div>
  );
}

/** LessonItem — Deep Space style: simple dot + title, no number circle or difficulty stars. */
function LessonItem({ lesson, isActive, isDone, langColorHex, mounted, staggerDelay, onClick }) {
  const dotColor = isActive ? langColorHex : isDone ? '#4ade80' : 'rgba(255,255,255,0.18)';
  return (
    <div
      onClick={onClick}
      className={'lesson-item' + (isActive ? ' active' : isDone ? ' done' : '')}
      style={{
        '--lang-color': langColorHex,
        opacity: mounted ? 1 : 0,
        transition: `background 0.2s, color 0.2s, transform 0.2s, opacity 0.3s ${staggerDelay}s`
      }}
    >
      {/* Simple status dot */}
      <div style={{
        width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
        background: dotColor,
        boxShadow: isActive ? `0 0 8px ${langColorHex}88` : 'none',
        transition: 'background 0.2s, box-shadow 0.2s'
      }} />
      <span style={{ fontSize: 13, lineHeight: 1.4, flex: 1, minWidth: 0 }}>
        {lesson.title}
      </span>
    </div>
  );
}

/** ModuleGroup — Deep Space style: flat section with uppercase label, no accordion. */
function ModuleGroup({ mod, modIdx, activeLesson, completedLessons, langColorHex, mounted, onSelect }) {
  return (
    <div style={{
      opacity: mounted ? 1 : 0,
      transform: mounted ? 'translateX(0)' : 'translateX(-12px)',
      transition: `opacity 0.4s ${modIdx * 0.04}s, transform 0.4s ${modIdx * 0.04}s`,
      marginBottom: 20
    }}>
      {/* Module label */}
      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: 1.8, textTransform: 'uppercase',
        color: 'rgba(167,139,250,0.55)', padding: '0 20px', marginBottom: 4
      }}>
        {mod.title}
      </div>

      {/* Lessons */}
      {mod.lessons.map((lesson, lIdx) => (
        <LessonItem
          key={lesson.id}
          lesson={lesson}
          isActive={activeLesson.id === lesson.id}
          isDone={!!completedLessons[lesson.id]}
          langColorHex={langColorHex}
          mounted={mounted}
          staggerDelay={(modIdx * 4 + lIdx) * 0.025}
          onClick={() => onSelect(lesson, mod)}
        />
      ))}
    </div>
  );
}

/** LangToggle — SAS / PySpark pill selector in the header. */
function LangToggle({ activeLang, onSelect }) {
  return (
    <div style={{
      marginLeft: 4,
      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 99, padding: '3px', display: 'flex'
    }}>
      {['SAS', 'PySpark'].map(l => {
        const active = activeLang === l;
        const c = LANG_COLOR[l];
        return (
          <button key={l} onClick={() => onSelect(l)} style={{
            background: active ? c + '20' : 'transparent',
            border: '1px solid ' + (active ? c + '55' : 'transparent'),
            borderRadius: 99, padding: '4px 16px',
            color: active ? c : 'var(--text3)',
            fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.2s', letterSpacing: 0.3
          }}>{l}</button>
        );
      })}
    </div>
  );
}

/** Breadcrumb — module › lesson path shown in header. */
function Breadcrumb({ activeModule, activeLesson }) {
  return (
    <div style={{ fontSize: 12, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 6 }}>
      <span>{activeModule.icon}</span>
      <span>{activeModule.title}</span>
      <span>›</span>
      <span style={{ color: 'var(--text2)' }}>{activeLesson.title}</span>
    </div>
  );
}

/** HeaderProgressBar — tiny lesson-completion progress bar in the top-right. */
function HeaderProgressBar({ progressPct, langColorHex }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 72, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          width: progressPct + '%', height: '100%',
          background: `linear-gradient(90deg, ${langColorHex}, #a78bfa)`,
          borderRadius: 99, transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)'
        }} />
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 5. SIDEBAR PANEL
// ════════════════════════════════════════════════════════════════════════════

function SidebarPanel({ modules, activeLesson, activeModule, completedLessons, langColorHex, onSelect, totalLessons, doneCount }) {
  const [mounted, setMounted] = React.useState(false);
  const progressPct = Math.round((doneCount / totalLessons) * 100);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  return (
    <aside style={{ width: 276, height: '100%', background: 'var(--sidebar-bg)', borderRight: '1px solid rgba(167,139,250,0.1)', overflowY: 'auto', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, padding: '16px 0 4px' }}>
        {modules.map((mod, modIdx) => (
          <ModuleGroup
            key={mod.id}
            mod={mod} modIdx={modIdx}
            activeLesson={activeLesson}
            completedLessons={completedLessons}
            langColorHex={langColorHex}
            mounted={mounted}
            onSelect={onSelect}
          />
        ))}
      </div>
      <SidebarProgress
        doneCount={doneCount}
        totalLessons={totalLessons}
        progressPct={progressPct}
        langColorHex={langColorHex}
        mounted={mounted}
      />
    </aside>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 6. LANGUAGE PICKER  (full-page entry screen)
// ════════════════════════════════════════════════════════════════════════════

function LanguagePicker({ onSelect }) {
  const CARDS = [
    {
      lang: 'SAS', color: '#ffd600', dim: 'rgba(255,214,0,0.08)', glow: 'rgba(255,214,0,0.2)',
      badge: 'Enterprise Standard', title: 'SAS Studio',
      desc: 'PROC SQL, DATA Steps, Makros — der Industriestandard in Energieversorgung und Banken.',
      stats: [['20+', 'Lektionen'], ['14', 'Module'], ['PROC & DATA', 'Kernkonzepte']],
      features: ['PROC SQL & DATA Step', 'Makroprogrammierung', 'CAT, PRXCHANGE, LIBNAME', 'PROC REPORT & ODS']
    },
    {
      lang: 'PySpark', color: '#818cf8', dim: 'rgba(129,140,248,0.08)', glow: 'rgba(129,140,248,0.2)',
      badge: 'Cloud Native', title: 'PySpark',
      desc: 'DataFrames, Delta Lake, Databricks — die Zukunft der Datenplattform.',
      stats: [['20+', 'Lektionen'], ['14', 'Module'], ['DataFrame API', 'Kernkonzept']],
      features: ['DataFrame API & SQL', 'Delta Lake & MERGE', 'Window Functions', 'Databricks / Azure']
    }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif", padding: '60px 20px' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 72 }} className="fade-up">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 99, padding: '6px 16px', marginBottom: 28, fontSize: 12, color: '#a78bfa', letterSpacing: 2, fontWeight: 600 }}>
          <span className="pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: '#a78bfa', display: 'inline-block' }} />
          DATA ENGINEERING ACADEMY
        </div>
        <h1 style={{ fontSize: 'clamp(36px,6vw,64px)', fontWeight: 800, letterSpacing: '-2px', lineHeight: 1.1, background: 'linear-gradient(135deg, #f0f4ff 30%, #8892a4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 20 }}>
          SAS & PySpark.<br />Zwei Wege, ein Ziel.
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 18, fontWeight: 400, maxWidth: 480, margin: '0 auto' }}>
          Lerne Enterprise-Datenverarbeitung mit dem Tool das du wirklich brauchst.
        </p>
      </div>

      {/* Language cards */}
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
        {CARDS.map(({ lang, color, dim, glow, badge, title, desc, stats, features }) => (
          <div key={lang} onClick={() => onSelect(lang)} className="lang-card" style={{ '--card-color': color }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = color + '55'; e.currentTarget.style.boxShadow = `0 32px 80px ${glow}, 0 0 0 1px ${color}22`; e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.background = dim; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: color + '15', border: `1px solid ${color}33`, borderRadius: 99, padding: '4px 12px', marginBottom: 24, fontSize: 11, color, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>{badge}</div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#f0f4ff', marginBottom: 12, letterSpacing: -0.5 }}>{title}</h2>
            <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>{desc}</p>
            <div style={{ display: 'flex', gap: 16, marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {stats.map(([val, label]) => (
                <div key={label}>
                  <div style={{ color, fontSize: 20, fontWeight: 800, lineHeight: 1 }}>{val}</div>
                  <div style={{ color: 'var(--text3)', fontSize: 11, marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
              {features.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="7" fill={color + '22'} /><path d="M4 7l2 2 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <span style={{ color: 'var(--text2)', fontSize: 13 }}>{f}</span>
                </div>
              ))}
            </div>
            <div style={{ background: color, borderRadius: 10, padding: '13px 0', textAlign: 'center', color: '#000', fontWeight: 700, fontSize: 14, letterSpacing: 0.3 }}>
              Mit {title} starten →
            </div>
          </div>
        ))}
      </div>
      <p style={{ color: 'var(--text3)', fontSize: 12, marginTop: 48, letterSpacing: 0.5 }}>
        Sprache jederzeit oben im Header wechselbar · Fortschritt wird gespeichert
      </p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 7. THEORY PANEL
// ════════════════════════════════════════════════════════════════════════════

function TheoryPanel({ lesson, activeLang, langColor, langColorHex, onExercise }) {
  const isSAS = activeLang === "SAS";
  const contentRef = React.useRef(null);
  const ctaRef = React.useRef(null);
  const [ctaVisible, setCtaVisible] = React.useState(false);
  const rawHtml = markdownToHTML(lesson.theory);

  // Reset CTA visibility when lesson changes
  useEffect(() => { setCtaVisible(false); }, [lesson.id]);

  useEffect(() => {
    if (!contentRef.current) return;
    if (typeof Prism !== "undefined") Prism.highlightAllUnder(contentRef.current);

    // Set up IntersectionObserver for scroll reveal of content elements
    const els = contentRef.current.querySelectorAll("h2, h3, p, pre, table, ul, ol, hr");
    els.forEach((el, i) => {
      el.classList.add("reveal");
      el.style.transitionDelay = Math.min(i * 0.05, 0.5) + "s";
    });
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    els.forEach(el => obs.observe(el));

    // Hide all elements tagged for the OTHER language, show active ones
    const container = contentRef.current;
    const otherLang = isSAS ? "python" : "sas";
    const activeLangTag = isSAS ? "sas" : "python";

    // 1. Hide/show headings by data-lang attribute
    container.querySelectorAll("h2[data-lang], h3[data-lang]").forEach(h => {
      h.style.display = h.getAttribute("data-lang") === otherLang ? "none" : "";
    });

    // 2. Hide/show code blocks by language class, and add badge to active ones
    container.querySelectorAll("pre").forEach(pre => {
      const isSASBlock = pre.classList.contains("language-sas");
      const isPYBlock  = pre.classList.contains("language-python");
      if (!isSASBlock && !isPYBlock) return; // neutral block — always show

      const isOther  = (isSASBlock && !isSAS) || (isPYBlock && isSAS);
      const isActive = (isSASBlock && isSAS)  || (isPYBlock && !isSAS);

      if (isOther) {
        pre.style.display = "none";
      } else if (isActive) {
        pre.style.display = "";
        pre.style.borderColor = langColor + "55";
        if (!pre.querySelector(".lang-tag")) {
          const tag = document.createElement("div");
          tag.className = "lang-tag";
          tag.textContent = isSASBlock ? "SAS" : "Python";
          tag.style.cssText = "position:absolute;top:10px;right:12px;font-size:10px;font-family:Outfit,sans-serif;font-weight:700;pointer-events:none;letter-spacing:1px;color:" + langColor + ";";
          pre.style.position = "relative";
          pre.appendChild(tag);
        }
      }
    });

    return () => { obs.disconnect(); };
  }, [lesson.id, activeLang]);

  // Show CTA only after the last reveal element's animation has fully completed
  useEffect(() => {
    setCtaVisible(false);

    // Small delay to let the first useEffect add .reveal classes to the DOM
    const init = setTimeout(() => {
      if (!contentRef.current) return;

      const allEls = Array.from(contentRef.current.querySelectorAll('.reveal'))
        .filter(el => el.offsetParent !== null); // skip hidden (wrong-lang) elements
      if (allEls.length === 0) { setCtaVisible(true); return; }

      const lastEl = allEls[allEls.length - 1];

      const showAfterTransition = () => {
        // Wait for the opacity transition to finish on lastEl, then show CTA
        const onEnd = (e) => {
          if (e.target === lastEl && e.propertyName === 'opacity') {
            lastEl.removeEventListener('transitionend', onEnd);
            setCtaVisible(true);
          }
        };
        lastEl.addEventListener('transitionend', onEnd);
        // Fallback: if transitionend never fires (e.g. display:none, prefers-reduced-motion)
        const fb = setTimeout(() => {
          lastEl.removeEventListener('transitionend', onEnd);
          setCtaVisible(true);
        }, 1500);
        return () => { lastEl.removeEventListener('transitionend', onEnd); clearTimeout(fb); };
      };

      // If last element already has .visible, its transition may still be running — listen now
      if (lastEl.classList.contains('visible')) {
        return showAfterTransition();
      }

      // Otherwise wait for .visible to be added first
      let cleanup;
      const mo = new MutationObserver(() => {
        if (lastEl.classList.contains('visible')) {
          mo.disconnect();
          cleanup = showAfterTransition();
        }
      });
      mo.observe(lastEl, { attributes: true, attributeFilter: ['class'] });

      return () => { mo.disconnect(); cleanup?.(); };
    }, 80);

    return () => clearTimeout(init);
  }, [lesson.id, activeLang]);
  return (
    <div>
      {/* Hero header */}
      <div style={{ marginBottom: 36 }}>
        {/* Breadcrumb path */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <span style={{
            background: langColor + "15", border: "1px solid " + langColor + "30",
            borderRadius: 99, padding: "3px 10px",
            fontSize: 10, color: langColor, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase"
          }}>
            {isSAS ? "SAS-Pfad" : "PySpark-Pfad"}
          </span>
          <span style={{ color: "var(--text3)", fontSize: 11 }}>›</span>
          <span style={{ color: "var(--text3)", fontSize: 11 }}>{lesson.title}</span>
        </div>

        {/* Gradient title */}
        <h1 style={{
          fontSize: "clamp(22px,3vw,30px)", fontWeight: 800, letterSpacing: -0.8,
          background: "linear-gradient(135deg, #f0f4ff 30%, #c4b5fd 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          marginBottom: 14, lineHeight: 1.2
        }}>
          {lesson.title}
        </h1>

        {/* Lead subtitle from first sentence of theory */}
        <p style={{ fontSize: 14, color: "var(--text3)", lineHeight: 1.6, maxWidth: 560 }}>
          {isSAS ? "SAS" : "PySpark"}-Code wird angezeigt — Blöcke der anderen Sprache sind ausgeblendet.
        </p>
      </div>

      {/* Content */}
      <div ref={contentRef} className="theory-content" dangerouslySetInnerHTML={{ __html: rawHtml }} />

      {/* ── End-of-theory CTA ── */}
      <div ref={ctaRef} className="theory-cta" style={{
        "--cta-glow": langColorHex + "18",
        opacity: ctaVisible ? 1 : 0,
        transform: ctaVisible ? "translateY(0) scale(1)" : "translateY(32px) scale(0.97)",
        transition: "opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)",
        pointerEvents: ctaVisible ? "auto" : "none"
      }}>
        <div className="theory-cta-box" style={{ borderColor: langColorHex + "22" }}>
          {/* Decorative top border line */}
          <div style={{
            position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
            width: "60%", height: 1,
            background: "linear-gradient(90deg, transparent, " + langColorHex + ", transparent)"
          }} />

          <div style={{ fontSize: 28, marginBottom: 12, lineHeight: 1 }}>🎯</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#f0f4ff", marginBottom: 8, letterSpacing: -0.3 }}>
            Bereit für die Praxis?
          </div>
          <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 28, maxWidth: 320, margin: "0 auto 28px" }}>
            Wende das Gelernte jetzt direkt in der interaktiven Übung an.
          </div>

          <button
            className="theory-cta-btn"
            onClick={onExercise}
            style={{
              background: "linear-gradient(135deg, " + langColorHex + " 0%, " + langColorHex + "cc 100%)",
              boxShadow: "0 8px 32px " + langColorHex + "55, 0 2px 8px " + langColorHex + "33, inset 0 1px 0 rgba(255,255,255,0.25)"
            }}
          >
            Zur Übung
            <span className="theory-cta-arrow">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}


// ════════════════════════════════════════════════════════════════════════════
// 8. EXERCISE PANEL
// ════════════════════════════════════════════════════════════════════════════

function ExercisePanel({
  lesson, activeLang, langColor, langColorHex,
  code, setCode,
  aiOutput, aiLoading, checkWithAI, loadSolution, resetCode,
  markComplete, completed, showHint, setShowHint, activeHint, setActiveHint,
  groqApiKey, setGroqApiKey,
  vizPhase, vizOps
}) {
  if (!langColorHex) langColorHex = activeLang === 'SAS' ? '#ffd600' : '#818cf8';
  const isSAS  = activeLang === "SAS";
  const ex     = lesson.exercise || {};
  const steps  = ex.steps || [];
  const [activeStep, setActiveStep] = useState(0);
  const [showOutput, setShowOutput] = useState(false);
  const [showViz,    setShowViz]    = useState(true);
  const [doneSteps,  setDoneSteps]  = useState({});

  // Reset steps on lesson change
  useEffect(() => { setActiveStep(0); setDoneSteps({}); setShowOutput(false); }, [lesson.id]);

  const toggleStepDone = (i) => setDoneSteps(d => ({ ...d, [i]: !d[i] }));
  const doneCount = Object.keys(doneSteps).filter(k => doneSteps[k]).length;

  const formatAI = (text) => {
    if (!text) return "";
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/```[\w]*\n?([\s\S]*?)```/g, "<pre>$1</pre>")
      .replace(/\n/g, "<br>");
  };

  const stepHint = steps[activeStep]?.hint;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── STEPS PANEL (Codecademy-style) ── */}
      {steps.length > 0 && (
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid " + langColorHex + "33",
          borderRadius: 16, overflow: "hidden"
        }}>
          {/* Steps header */}
          <div style={{
            background: langColorHex + "0e",
            borderBottom: "1px solid " + langColorHex + "22",
            padding: "12px 20px",
            display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 14 }}>📋</span>
              <span style={{ color: langColorHex, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
                Aufgabe — Schritt-für-Schritt
              </span>
            </div>
            {/* Progress dots */}
            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
              {steps.map((_, i) => (
                <div key={i} onClick={() => setActiveStep(i)} style={{
                  width: doneSteps[i] ? 18 : 8,
                  height: 8, borderRadius: 99,
                  background: doneSteps[i] ? langColorHex : i === activeStep ? langColorHex + "cc" : "rgba(255,255,255,0.15)",
                  cursor: "pointer", transition: "all 0.3s",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 6, color: "#000", fontWeight: 800,
                  overflow: "hidden"
                }}>
                  {doneSteps[i] && <span>✓</span>}
                </div>
              ))}
              <span style={{ color: "var(--text3)", fontSize: 11, marginLeft: 6 }}>
                {doneCount}/{steps.length}
              </span>
            </div>
          </div>

          {/* Step pills */}
          <div style={{ padding: "14px 20px 0", display: "flex", gap: 6, flexWrap: "wrap" }}>
            {steps.map((s, i) => (
              <button key={i} onClick={() => setActiveStep(i)} style={{
                background: i === activeStep ? langColorHex + "20" : doneSteps[i] ? "rgba(74,222,128,0.08)" : "transparent",
                border: "1px solid " + (i === activeStep ? langColorHex + "66" : doneSteps[i] ? "rgba(74,222,128,0.35)" : "rgba(255,255,255,0.1)"),
                borderRadius: 99, padding: "5px 14px",
                color: i === activeStep ? langColorHex : doneSteps[i] ? "#4ade80" : "var(--text3)",
                fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600,
                cursor: "pointer", transition: "all 0.2s",
                display: "flex", alignItems: "center", gap: 6
              }}>
                <span style={{
                  width: 18, height: 18, borderRadius: "50%",
                  background: doneSteps[i] ? "rgba(74,222,128,0.2)" : i === activeStep ? langColorHex + "30" : "rgba(255,255,255,0.06)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 800,
                  color: doneSteps[i] ? "#4ade80" : i === activeStep ? langColorHex : "var(--text3)"
                }}>
                  {doneSteps[i] ? "✓" : i + 1}
                </span>
                {s.title || `Schritt ${i + 1}`}
              </button>
            ))}
          </div>

          {/* Active step instruction */}
          <div style={{ padding: "16px 20px" }}>
            <div style={{
              background: langColorHex + "08",
              border: "1px solid " + langColorHex + "20",
              borderLeft: "3px solid " + langColorHex,
              borderRadius: "0 10px 10px 0",
              padding: "14px 18px", marginBottom: 14
            }}>
              <div style={{ fontSize: 11, color: langColorHex, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>
                Schritt {activeStep + 1} · {isSAS ? "SAS" : "PySpark"}
              </div>
              <p style={{ color: "var(--text)", fontSize: 14, lineHeight: 1.75, margin: 0, fontWeight: 500 }}>
                {steps[activeStep]?.instruction}
              </p>
            </div>

            {/* Step hint (inline, always visible) */}
            {stepHint && (
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ fontSize: 16, marginTop: 1 }}>💡</span>
                <p style={{ color: "#fbbf24", fontSize: 13, lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>
                  {stepHint}
                </p>
              </div>
            )}

            {/* Step navigation */}
            <div style={{ display: "flex", gap: 8, marginTop: 16, alignItems: "center" }}>
              {activeStep > 0 && (
                <button onClick={() => setActiveStep(s => s - 1)} style={{
                  background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 99, padding: "6px 14px",
                  color: "var(--text3)", fontFamily: "'Outfit', sans-serif",
                  fontSize: 12, cursor: "pointer"
                }}>← Zurück</button>
              )}
              <button onClick={() => {
                toggleStepDone(activeStep);
                if (activeStep < steps.length - 1 && !doneSteps[activeStep]) setActiveStep(s => s + 1);
              }} style={{
                background: doneSteps[activeStep] ? "rgba(74,222,128,0.1)" : langColorHex + "20",
                border: "1px solid " + (doneSteps[activeStep] ? "rgba(74,222,128,0.4)" : langColorHex + "55"),
                borderRadius: 99, padding: "6px 18px",
                color: doneSteps[activeStep] ? "#4ade80" : langColorHex,
                fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600,
                cursor: "pointer", transition: "all 0.2s"
              }}>
                {doneSteps[activeStep] ? "✓ Erledigt — rückgängig?" : "✓ Schritt erledigt"}
              </button>
              {activeStep < steps.length - 1 && (
                <button onClick={() => setActiveStep(s => s + 1)} style={{
                  background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 99, padding: "6px 14px",
                  color: "var(--text3)", fontFamily: "'Outfit', sans-serif",
                  fontSize: 12, cursor: "pointer"
                }}>Weiter →</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fallback task card (if no steps) */}
      {steps.length === 0 && (
        <div style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid " + langColor + "33",
          borderRadius: 14, overflow: "hidden"
        }}>
          <div style={{
            background: langColor + "10", borderBottom: "1px solid " + langColor + "22",
            padding: "12px 20px", display: "flex", alignItems: "center", gap: 8
          }}>
            <span style={{ color: langColor, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Aufgabe</span>
          </div>
          <div style={{ padding: "16px 20px", color: "var(--text2)", fontSize: 14, lineHeight: 1.8 }}>
            {ex.description}
          </div>
        </div>
      )}

      {/* Code Editor */}
      <CodeEditor
        title={isSAS ? "SAS Studio" : "PySpark"}
        lang={isSAS ? "SAS" : "Python"}
        color={langColor}
        colorHex={langColorHex}
        value={code}
        onChange={setCode}
        onLoadSolution={() => loadSolution(isSAS ? "sas" : "pyspark")}
      />

      {/* Pixel Art Visualizer */}
      {showViz && <PixelArtViz code={code} lesson={lesson} langColor={langColorHex} vizPhase={vizPhase} vizOps={vizOps} />}

      {/* Expected Output (collapsible) */}
      {ex.expectedOutput && (
        <div style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12, overflow: "hidden"
        }}>
          <button onClick={() => setShowOutput(v => !v)} style={{
            width: "100%", background: "none", border: "none",
            padding: "12px 20px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13 }}>📊</span>
              <span style={{ color: "var(--text2)", fontSize: 12, fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>
                Erwartetes Ergebnis
              </span>
            </div>
            <span style={{ color: "var(--text3)", fontSize: 12, fontFamily: "'Outfit', sans-serif" }}>
              {showOutput ? "▲ ausblenden" : "▼ anzeigen"}
            </span>
          </button>
          {showOutput && (
            <pre style={{
              margin: 0, padding: "0 20px 16px",
              fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
              color: "var(--text2)", lineHeight: 1.7, overflowX: "auto"
            }}>{ex.expectedOutput}</pre>
          )}
        </div>
      )}

      {/* Actions row */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={checkWithAI} disabled={aiLoading} style={{
          background: aiLoading ? "rgba(255,255,255,0.05)" : "#7c3aed",
          border: "1px solid " + (aiLoading ? "rgba(255,255,255,0.08)" : "#7c3aed"),
          borderRadius: 99, padding: "9px 22px",
          color: aiLoading ? "var(--text3)" : "white",
          fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600,
          cursor: aiLoading ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", gap: 8,
          transition: "all 0.2s", boxShadow: aiLoading ? "none" : "0 4px 20px rgba(124,58,237,0.35)"
        }}>
          <span>{aiLoading ? "⏳" : "✦"}</span>
          {aiLoading ? "KI analysiert…" : "KI-Feedback · " + (isSAS ? "SAS" : "PySpark")}
        </button>

        <button onClick={() => {
          if (resetCode) resetCode(isSAS ? "sas" : "pyspark");
        }} style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 99, padding: "9px 16px",
          color: "var(--text3)", fontFamily: "'Outfit', sans-serif",
          fontSize: 13, cursor: "pointer"
        }}>↺ Starter</button>

        <button onClick={() => loadSolution(isSAS ? "sas" : "pyspark")} style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 99, padding: "9px 16px",
          color: "var(--text3)", fontFamily: "'Outfit', sans-serif",
          fontSize: 13, cursor: "pointer"
        }}>👁 Lösung</button>

        <button onClick={() => setShowViz(!showViz)} style={{
          background: showViz ? "rgba(139,92,246,0.1)" : "rgba(255,255,255,0.03)",
          border: "1px solid " + (showViz ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.08)"),
          borderRadius: 99, padding: "9px 16px",
          color: showViz ? "#a78bfa" : "var(--text3)",
          fontFamily: "'Outfit', sans-serif", fontSize: 13, cursor: "pointer"
        }}>🎮 Pixel Viz</button>

        <button onClick={markComplete} style={{
          marginLeft: "auto",
          background: completed ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.03)",
          border: "1px solid " + (completed ? "rgba(52,211,153,0.35)" : "rgba(255,255,255,0.08)"),
          borderRadius: 99, padding: "9px 18px",
          color: completed ? "#a78bfa" : "var(--text3)",
          fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 500,
          cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 6
        }}>
          {completed
            ? <><span>✓ Abgeschlossen</span><span style={{fontSize:11,opacity:0.5,marginLeft:4}}>· rückgängig?</span></>
            : "○ Als erledigt markieren"}
        </button>
      </div>

      {/* Groq API Key */}
      <div style={{
        background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.2)",
        borderRadius: 14, padding: "16px 20px",
        display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap"
      }}>
        <span style={{ color: "#a78bfa", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", whiteSpace: "nowrap" }}>
          🔑 Groq API
        </span>
        <input
          type="password"
          placeholder="gsk_... (kostenlos auf console.groq.com)"
          value={groqApiKey}
          onChange={e => setGroqApiKey(e.target.value)}
          style={{
            flex: 1, minWidth: 220,
            background: "rgba(0,0,0,0.3)", border: "1px solid " + (groqApiKey ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.08)"),
            borderRadius: 8, padding: "8px 14px",
            color: "var(--text)", fontFamily: "'Outfit', sans-serif", fontSize: 13, outline: "none"
          }}
        />
        {groqApiKey && <span style={{ color: "#a78bfa", fontSize: 12, fontWeight: 600 }}>✓ Bereit</span>}
        <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer"
          style={{ color: "#a78bfa", fontSize: 12, textDecoration: "none", fontWeight: 500 }}>
          Kostenlos →
        </a>
      </div>

      {/* AI Output */}
      {(aiOutput || aiLoading) && (
        <div style={{
          background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.2)",
          borderRadius: 14, overflow: "hidden"
        }}>
          <div style={{
            background: "rgba(124,58,237,0.1)", borderBottom: "1px solid rgba(124,58,237,0.2)",
            padding: "12px 20px"
          }}>
            <span style={{ color: "#a78bfa", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
              ✦ KI-Feedback · {isSAS ? "SAS" : "PySpark"}
            </span>
          </div>
          <div style={{ padding: "18px 20px" }}>
            {aiLoading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[100, 80, 90, 60].map((w, i) => (
                  <div key={i} className="shimmer" style={{ height: 14, borderRadius: 4, width: w + "%" }} />
                ))}
              </div>
            ) : (
              <div className="ai-output" style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.8 }}
                dangerouslySetInnerHTML={{ __html: formatAI(aiOutput) }} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
  if (!langColorHex) langColorHex = activeLang === 'SAS' ? '#ffd600' : '#818cf8';
  const isSAS  = activeLang === "SAS";
  const hints  = lesson.exercise?.hints || [];
  const [showViz, setShowViz] = React.useState(true);

  // Format AI output with basic markdown
  const formatAI = (text) => {
    if (!text) return "";
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/```[\w]*\n?([\s\S]*?)```/g, "<pre>$1</pre>")
      .replace(/\n/g, "<br>");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Task card */}
      <div style={{
        background: "rgba(255,255,255,0.03)", border: "1px solid " + langColor + "33",
        borderRadius: 14, overflow: "hidden"
      }}>
        <div style={{
          background: langColor + "10", borderBottom: "1px solid " + langColor + "22",
          padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="12" height="12" rx="3" stroke={langColor} strokeWidth="1.5"/>
              <path d="M4 7h6M4 4.5h4M4 9.5h5" stroke={langColor} strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <span style={{ color: langColor, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
              Aufgabe
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              fontSize: 11, color: langColor, fontWeight: 600,
              background: langColor + "15", border: "1px solid " + langColor + "33",
              borderRadius: 99, padding: "2px 10px"
            }}>
              {isSAS ? "🟡 SAS" : "🔵 PySpark"}
            </span>
            <span style={{ color: "var(--text3)", fontSize: 11 }}>vs.</span>
            <span style={{
              fontSize: 11, fontWeight: 600,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 99, padding: "2px 10px", color: "var(--text3)"
            }}>
              {isSAS ? "🔵 PySpark" : "🟡 SAS"}
            </span>
          </div>
        </div>
        <div style={{ padding: "16px 20px", color: "var(--text2)", fontSize: 14, lineHeight: 1.8 }}>
          {lesson.exercise?.description}
        </div>
      </div>

      {/* Code Editor */}
      <CodeEditor
        title={isSAS ? "SAS Studio" : "PySpark"}
        lang={isSAS ? "SAS" : "Python"}
        color={langColor}
        colorHex={isSAS ? "#ffd600" : "#818cf8"}
        value={code}
        onChange={setCode}
        onLoadSolution={() => loadSolution(isSAS ? "sas" : "pyspark")}
      />

      {/* Pixel Art Visualizer */}
      {showViz && <PixelArtViz code={code} lesson={lesson} langColor={langColorHex} vizPhase={vizPhase} vizOps={vizOps} />}

      {/* Actions row */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={checkWithAI} disabled={aiLoading} style={{
          background: aiLoading ? "rgba(255,255,255,0.05)" : "#7c3aed",
          border: "1px solid " + (aiLoading ? "rgba(255,255,255,0.08)" : "#7c3aed"),
          borderRadius: 99, padding: "9px 22px",
          color: aiLoading ? "var(--text3)" : "white",
          fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600,
          cursor: aiLoading ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", gap: 8,
          transition: "all 0.2s", boxShadow: aiLoading ? "none" : "0 4px 20px rgba(124,58,237,0.35)"
        }}>
          <span>{aiLoading ? "⏳" : "✦"}</span>
          {aiLoading ? "KI analysiert…" : "KI-Feedback für " + (isSAS ? "SAS" : "PySpark")}
        </button>

        {hints.length > 0 && (
          <button onClick={() => setShowHint(!showHint)} style={{
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 99, padding: "9px 18px",
            color: showHint ? langColor : "var(--text2)",
            fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 500,
            cursor: "pointer", transition: "all 0.2s",
            borderColor: showHint ? langColor + "44" : "rgba(255,255,255,0.08)"
          }}>
            💡 {showHint ? "Hinweis ausblenden" : hints.length + " Hinweis" + (hints.length > 1 ? "e" : "")}
          </button>
        )}

        <button onClick={() => setShowViz(!showViz)} style={{
          background: showViz ? "rgba(139,92,246,0.1)" : "rgba(255,255,255,0.03)",
          border: "1px solid " + (showViz ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.08)"),
          borderRadius: 99, padding: "9px 18px",
          color: showViz ? "#a78bfa" : "var(--text3)",
          fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 500,
          cursor: "pointer", transition: "all 0.2s"
        }}>
          🎮 {showViz ? "Viz ausblenden" : "Pixel Viz"}
        </button>

        <button onClick={markComplete} style={{
          marginLeft: "auto",
          background: completed ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.03)",
          border: "1px solid " + (completed ? "rgba(52,211,153,0.35)" : "rgba(255,255,255,0.08)"),
          borderRadius: 99, padding: "9px 18px",
          color: completed ? "#a78bfa" : "var(--text3)",
          fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 500,
          cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 6
        }}>
          {completed
            ? <><span>✓ Abgeschlossen</span><span style={{fontSize:11,opacity:0.5,marginLeft:4}}>· rückgängig?</span></>
            : "○ Als erledigt markieren"}
        </button>
      </div>

      {/* Hints */}
      {showHint && (
        <div style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid " + langColor + "33",
          borderRadius: 14, padding: "18px 20px"
        }}>
          <div style={{ color: langColor, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>
            💡 Hinweise
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            {hints.map((_, i) => (
              <button key={i} onClick={() => setActiveHint(i)} style={{
                background: activeHint === i ? langColor + "20" : "transparent",
                border: "1px solid " + (activeHint === i ? langColor + "55" : "rgba(255,255,255,0.08)"),
                borderRadius: 99, padding: "4px 14px",
                color: activeHint === i ? langColor : "var(--text3)",
                fontFamily: "'Outfit', sans-serif", fontSize: 12, cursor: "pointer", transition: "all 0.2s"
              }}>#{i + 1}</button>
            ))}
          </div>
          <p style={{ color: "#fbbf24", fontSize: 14, lineHeight: 1.7 }}>{hints[activeHint]}</p>
        </div>
      )}

      {/* Groq API Key */}
      <div style={{
        background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.2)",
        borderRadius: 14, padding: "16px 20px",
        display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap"
      }}>
        <span style={{ color: "#a78bfa", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", whiteSpace: "nowrap" }}>
          🔑 Groq API
        </span>
        <input
          type="password"
          placeholder="gsk_... (kostenlos auf console.groq.com)"
          value={groqApiKey}
          onChange={e => setGroqApiKey(e.target.value)}
          style={{
            flex: 1, minWidth: 220,
            background: "rgba(0,0,0,0.3)", border: "1px solid " + (groqApiKey ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.08)"),
            borderRadius: 8, padding: "8px 14px",
            color: "var(--text)", fontFamily: "'Outfit', sans-serif", fontSize: 13, outline: "none",
            transition: "border-color 0.2s"
          }}
        />
        {groqApiKey && <span style={{ color: "#a78bfa", fontSize: 12, fontWeight: 600 }}>✓ Bereit</span>}
        <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer"
          style={{ color: "#a78bfa", fontSize: 12, textDecoration: "none", fontWeight: 500 }}>
          Kostenlos →
        </a>
      </div>

      {/* AI Output */}
      {(aiOutput || aiLoading) && (
        <div style={{
          background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.2)",
          borderRadius: 14, overflow: "hidden"
        }}>
          <div style={{
            background: "rgba(124,58,237,0.1)", borderBottom: "1px solid rgba(124,58,237,0.2)",
            padding: "12px 20px", display: "flex", alignItems: "center", gap: 8
          }}>
            <span style={{ color: "#a78bfa", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
              ✦ KI-Feedback · {isSAS ? "SAS" : "PySpark"}
            </span>
            {aiLoading && <div className="shimmer" style={{ height: 2, flex: 1, borderRadius: 99, marginLeft: 8 }} />}
          </div>
          <div style={{ padding: "18px 20px" }}>
            {aiLoading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[100, 80, 90, 60].map((w, i) => (
                  <div key={i} className="shimmer" style={{ height: 14, borderRadius: 4, width: w + "%" }} />
                ))}
              </div>
            ) : (
              <div
                className="ai-output"
                style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.8 }}
                dangerouslySetInnerHTML={{ __html: formatAI(aiOutput) }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}


// ════════════════════════════════════════════════════════════════════════════
// 9. PIXEL ART ENGINE
// ════════════════════════════════════════════════════════════════════════════


function PixelArtViz({code,lesson,langColor,vizPhase,vizOps}){
  const canvasRef=React.useRef(null);
  const animRef=React.useRef(null);
  const frameRef=React.useRef(0);
  const phaseRef=React.useRef(vizPhase);
  const opsRef=React.useRef(vizOps);
  const scene=React.useMemo(()=>detectPixelScene(code,lesson),[lesson&&lesson.id]);

  // Keep refs in sync
  useEffect(()=>{phaseRef.current=vizPhase;},[vizPhase]);
  useEffect(()=>{opsRef.current=vizOps;},[vizOps]);

  // Reset frame when phase changes to running
  useEffect(()=>{
    if(vizPhase==='running')frameRef.current=0;
    if(vizPhase==='done')frameRef.current=0;
  },[vizPhase]);

  useEffect(()=>{
    const canvas=canvasRef.current;if(!canvas)return;
    const ctx=canvas.getContext('2d');
    ctx.imageSmoothingEnabled=false;
    frameRef.current=0;
    if(animRef.current)cancelAnimationFrame(animRef.current);
    const loop=()=>{
      frameRef.current++;
      const ph=phaseRef.current;
      const ops=opsRef.current||[];
      if(ph==='running'&&ops.length>0){
        _renderRunning(ctx,canvas.width,canvas.height,langColor,frameRef.current,ops);
      } else if(ph==='done'){
        _renderDone(ctx,canvas.width,canvas.height,langColor,frameRef.current);
      } else {
        _renderOffice(ctx,canvas.width,canvas.height,scene.type,frameRef.current,langColor);
      }
      animRef.current=requestAnimationFrame(loop);
    };
    loop();
    return()=>{if(animRef.current)cancelAnimationFrame(animRef.current);};
  },[scene.type,langColor]);

  const phaseLabel=vizPhase==='running'?'⚙ Analysiere Code…':vizPhase==='done'?'✓ Fertig':scene.label;
  const phaseLabelColor=vizPhase==='running'?langColor:vizPhase==='done'?'#10b981':'#3d4558';

  return(
    <div style={{background:'#0d0f1a',border:'1px solid '+langColor+'44',borderRadius:14,overflow:'hidden'}}>
      <div style={{background:langColor+'0d',borderBottom:'1px solid '+langColor+'22',padding:'8px 18px',display:'flex',alignItems:'center',gap:10}}>
        <span style={{fontSize:12}}>{vizPhase==='running'?'⚙':vizPhase==='done'?'✅':'🏢'}</span>
        <span style={{color:langColor,fontSize:11,fontWeight:700,letterSpacing:2,textTransform:'uppercase'}}>Pixel Office</span>
        <span style={{color:phaseLabelColor,fontSize:10,fontFamily:"'JetBrains Mono',monospace",background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.06)',borderRadius:4,padding:'2px 8px',marginLeft:'auto'}}>{phaseLabel}</span>
      </div>
      <canvas ref={canvasRef} width={500} height={180} style={{width:'100%',imageRendering:'pixelated',display:'block'}}/>
    </div>
  );
}


// ════════════════════════════════════════════════════════════════════════════
// 11. CODE EDITOR
// ════════════════════════════════════════════════════════════════════════════

function CodeEditor({ title, lang, color, colorHex, value, onChange, onLoadSolution }) {
  const editorRef   = React.useRef(null);
  const cmRef       = React.useRef(null);
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;

  const cmMode = lang === "Python" ? "python" : "sas";
  const isSAS  = lang === "SAS";

  useEffect(() => {
    if (!editorRef.current) return;

    const cm = CodeMirror(editorRef.current, {
      value, mode: cmMode, theme: "dracula",
      lineNumbers: true, matchBrackets: true,
      autoCloseBrackets: true, indentUnit: 2,
      tabSize: 2, indentWithTabs: false, lineWrapping: true,
      extraKeys: { "Tab": (cm) => cm.replaceSelection("  ") }
    });

    cm.on("change", (instance) => onChangeRef.current(instance.getValue()));
    cmRef.current = cm;
    setTimeout(() => cm.refresh(), 0);

    return () => {
      cmRef.current = null;
      if (editorRef.current) editorRef.current.innerHTML = "";
    };
  }, []);

  useEffect(() => {
    if (!cmRef.current) return;
    if (cmRef.current.getValue() !== value) {
      const cursor = cmRef.current.getCursor();
      cmRef.current.setValue(value);
      try { cmRef.current.setCursor(cursor); } catch(e) {}
    }
  }, [value]);

  return (
    <div className={isSAS ? "sas-editor" : ""} style={{
      background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 14, overflow: "hidden",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
    }}>
      {/* Editor header */}
      <div style={{
        background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.07)",
        padding: "10px 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Traffic lights */}
          <div style={{ display: "flex", gap: 6 }}>
            {["#ff5f57","#febc2e","#28c840"].map(c => (
              <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.7 }} />
            ))}
          </div>
          <span style={{
            color: colorHex || "#fff", fontSize: 12, fontWeight: 700, letterSpacing: 1.5,
            textTransform: "uppercase"
          }}>{title}</span>
          <span style={{
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 4, padding: "2px 7px", fontSize: 10, color: "var(--text3)",
            fontFamily: "'JetBrains Mono', monospace"
          }}>{lang}</span>
        </div>
        <button onClick={onLoadSolution} style={{
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 6, padding: "4px 12px",
          color: "var(--text3)", fontFamily: "'Outfit', sans-serif", fontSize: 11,
          fontWeight: 500, cursor: "pointer", transition: "all 0.2s"
        }}
          onMouseEnter={e => { e.currentTarget.style.color = colorHex; e.currentTarget.style.borderColor = (colorHex||"#fff") + "44"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "var(--text3)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
        >
          Lösung laden
        </button>
      </div>
      <div ref={editorRef} style={{ minHeight: 300 }} />
    </div>
  );
}


// ════════════════════════════════════════════════════════════════════════════
// 12. APP  (root component — composes hooks + sub-components)
// ════════════════════════════════════════════════════════════════════════════

function App() {
  // ── Navigation state ──────────────────────────────────────────────────────
  const [activeLesson, setActiveLesson] = useState(MODULES[0].lessons[0]);
  const [activeModule, setActiveModule] = useState(MODULES[0]);
  const [tab,          setTab]          = useState('theory');
  const [sidebarOpen,  setSidebarOpen]  = useState(true);
  const [showHint,     setShowHint]     = useState(false);
  const [activeHint,   setActiveHint]   = useState(0);
  const [activeLang,   setActiveLang]   = useState(null); // null → show LanguagePicker
  const scrollRef = useRef(null);

  // ── Custom hooks ──────────────────────────────────────────────────────────
  const progress  = useProgress(activeLang, activeLesson);
  const codeState = useCodeState(activeLesson);
  const aiCheck   = useAICheck({
    lesson: activeLesson,
    activeLang,
    sasCode: codeState.sasCode,
    pyCode:  codeState.pyCode,
  });

  // Reset UI state on lesson change
  useEffect(() => {
    setShowHint(false);
    setActiveHint(0);
    setTab('theory');
    aiCheck.setAiOutput('');
  }, [activeLesson.id]);

  // Scroll content to top on lesson/tab change — triple-fire for React batching
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = 0;
    const t1 = setTimeout(() => { el.scrollTop = 0; }, 0);
    const t2 = setTimeout(() => { el.scrollTop = 0; }, 80);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [tab, activeLesson?.id]);

  // ── Derived values ────────────────────────────────────────────────────────
  const { completedSAS, completedPySpark, saveProgress, markComplete } = progress;
  const completedLessons = activeLang === 'SAS' ? completedSAS : completedPySpark;
  const totalLessons     = MODULES.reduce((a, m) => a + m.lessons.length, 0);
  const doneCount        = Object.keys(completedLessons).length;
  const progressPct      = Math.round((doneCount / totalLessons) * 100);
  const isSAS            = activeLang === 'SAS';
  const langColorHex     = isSAS ? '#ffd600' : '#818cf8';
  const langColor        = isSAS ? 'var(--sas)' : 'var(--py)';

  const selectLang = (lang) => {
    setActiveLang(lang);
    saveProgress(completedSAS, completedPySpark, lang);
    aiCheck.setAiOutput('');
  };

  const selectLesson = (lesson, mod) => {
    setActiveLesson(lesson);
    setActiveModule(mod);
  };

  // ── Language picker screen ────────────────────────────────────────────────
  if (!activeLang) return <LanguagePicker onSelect={selectLang} />;

  // ── Main academy layout ───────────────────────────────────────────────────
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: "'Outfit', sans-serif" }}>

      {/* ── TOP BAR ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(13,11,24,0.92)',
        backdropFilter: 'blur(24px) saturate(200%)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '0 24px', display: 'flex', alignItems: 'center',
        gap: 16, height: 54, flexShrink: 0
      }}>
        {/* Hamburger */}
        <button onClick={() => setSidebarOpen(o => !o)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 18, padding: 4, display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
        >☰</button>

        {/* Logo badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: `linear-gradient(135deg, ${langColorHex}, ${langColorHex}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, boxShadow: `0 0 20px ${langColorHex}44` }}>⬡</div>
          <span style={{ color: 'var(--text)', fontWeight: 700, fontSize: 15, letterSpacing: -0.3 }}>{isSAS ? 'SAS' : 'PySpark'} Academy</span>
        </div>

        <LangToggle activeLang={activeLang} onSelect={selectLang} />

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 20 }}>
          <Breadcrumb activeModule={activeModule} activeLesson={activeLesson} />
          <HeaderProgressBar progressPct={progressPct} langColorHex={langColorHex} />
          <span style={{ color: langColorHex, fontSize: 12, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
            {doneCount}/{totalLessons}
          </span>
        </div>
      </header>

      {/* ── BODY ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Sidebar — always rendered, animated via CSS transition */}
        <div style={{ width: sidebarOpen ? 276 : 0, minWidth: sidebarOpen ? 276 : 0, overflow: 'hidden', flexShrink: 0, transition: 'width 0.38s cubic-bezier(0.4,0,0.2,1), min-width 0.38s cubic-bezier(0.4,0,0.2,1)' }}>
          <div style={{ width: 276, height: '100%', opacity: sidebarOpen ? 1 : 0, transform: sidebarOpen ? 'translateX(0)' : 'translateX(-18px)', transition: sidebarOpen ? 'opacity 0.32s cubic-bezier(0.4,0,0.2,1) 0.06s, transform 0.38s cubic-bezier(0.34,1.4,0.64,1) 0.04s' : 'opacity 0.18s, transform 0.22s', pointerEvents: sidebarOpen ? 'auto' : 'none' }}>
            <SidebarPanel
              modules={MODULES} activeLesson={activeLesson} activeModule={activeModule}
              completedLessons={completedLessons} langColorHex={langColorHex}
              onSelect={selectLesson} totalLessons={totalLessons} doneCount={doneCount}
            />
          </div>
        </div>

        {/* Main content */}
        <div key={activeLesson.id + '-' + tab} id="main-scroll" ref={scrollRef}
          style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

          {/* Tab bar */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 32px', background: 'rgba(255,255,255,0.02)', flexShrink: 0 }}>
            {['theory', 'exercise'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                background: 'none', border: 'none', padding: '14px 20px',
                color: tab === t ? langColorHex : 'var(--text3)',
                fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: tab === t ? 700 : 400,
                cursor: 'pointer', borderBottom: tab === t ? `2px solid ${langColorHex}` : '2px solid transparent',
                marginBottom: -1, transition: 'all 0.2s', letterSpacing: 0.3
              }}>
                {t === 'theory' ? '📖 Theorie' : '⌨ Übung'}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div style={{ flex: 1, padding: '32px', maxWidth: 860, width: '100%', margin: '0 auto' }}>
            {tab === 'theory' ? (
              <TheoryPanel
                lesson={activeLesson} activeLang={activeLang} langColor={langColor} langColorHex={langColorHex}
                onExercise={() => setTab('exercise')}
              />
            ) : (
              <ExercisePanel
                lesson={activeLesson} activeLang={activeLang} langColor={langColor} langColorHex={langColorHex}
                code={isSAS ? codeState.sasCode : codeState.pyCode}
                setCode={isSAS ? codeState.setSasCode : codeState.setPyCode}
                aiOutput={aiCheck.aiOutput} aiLoading={aiCheck.aiLoading}
                checkWithAI={aiCheck.checkWithAI} loadSolution={codeState.loadSolution}
                resetCode={codeState.resetCode}
                markComplete={markComplete} completed={!!completedLessons[activeLesson.id]}
                showHint={showHint} setShowHint={setShowHint}
                activeHint={activeHint} setActiveHint={setActiveHint}
                groqApiKey={aiCheck.groqApiKey} setGroqApiKey={aiCheck.setGroqApiKey}
                vizPhase={aiCheck.vizPhase} vizOps={aiCheck.vizOps}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 13. MOUNT
// ════════════════════════════════════════════════════════════════════════════

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
  </script>

