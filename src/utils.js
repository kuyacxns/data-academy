
// ── MARKDOWN → HTML ───────────────────────────────────────────────────────────
function markdownToHTML(md) {
  if (!md) return "";
  // Strip markdown table separator rows like |---|---| or |:---|:---:|
  md = md.replace(/^\|[-| :\t]+\|$/gm, "");

  // Pre-pass: for untagged headings (no sas/pyspark in title), look ahead at the
  // next section's code blocks. If only python → prefix with LANG:python:, only sas → LANG:sas:
  md = md.replace(/^(#{2,3} )(.+)$/gm, (fullLine, hashes, title) => {
    const tl = title.trim().toLowerCase();
    const isComparison = tl.includes(' vs') || tl.includes('vergleich') || (tl.includes('sas') && tl.includes('spark'));
    const alreadyTagged = !isComparison && (tl.includes('sas') || tl.includes('pyspark') || tl.includes('python'));
    if (alreadyTagged || isComparison) return fullLine; // already handled below
    // look ahead in md from the position of this heading to the next heading
    const headingStart = md.indexOf(fullLine);
    const nextHeading = md.indexOf('\n#', headingStart + fullLine.length);
    const section = nextHeading === -1 ? md.slice(headingStart) : md.slice(headingStart, nextHeading);
    const hasSasBlock = /```sas\b/.test(section);
    const hasPyBlock  = /```python\b/.test(section);
    if (hasPyBlock && !hasSasBlock)  return fullLine + '<!--LANG:python-->';
    if (hasSasBlock && !hasPyBlock)  return fullLine + '<!--LANG:sas-->';
    return fullLine;
  });

  let html = md
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
      const prismLang = lang === "sas" ? "sas" : lang === "python" ? "python" : lang || "none";
      const cls = prismLang !== "none" ? ` class="language-${prismLang}"` : "";
      return `<pre class="language-${prismLang}"><code${cls}>${escapeHtml(code.trim())}</code></pre>`;
    })
    .replace(/`([^`]+)`/g, `<code style="background:#0f172a;color:#00ff88;padding:2px 6px;border-radius:4px;font-size:13px">$1</code>`)
    .replace(/^## (.+?)(?:<!--LANG:(sas|python)-->)?$/gm, (_, t, marker) => {
      const tl = t.trim().toLowerCase();
      // Exclude comparison/migration headings that mention both systems
      const isComparison = tl.includes(' vs') || tl.includes('vergleich') || (tl.includes('sas') && tl.includes('spark'));
      const hasSas = !isComparison && tl.includes('sas');
      const hasPy  = !isComparison && (tl.includes('pyspark') || tl.includes('python'));
      const lang = marker || ((hasSas && !hasPy) ? 'sas' : (hasPy && !hasSas) ? 'python' : '');
      return `<h2 style="color:#00ccff;font-size:17px;font-weight:700;margin:28px 0 12px;border-bottom:1px solid #1e293b;padding-bottom:8px;letter-spacing:1px"${lang ? ` data-lang="${lang}"` : ''}>${t}</h2>`;
    })
    .replace(/^### (.+?)(?:<!--LANG:(sas|python)-->)?$/gm, (_, t, marker) => {
      const tl = t.trim().toLowerCase();
      const isComparison = tl.includes(' vs') || tl.includes('vergleich') || (tl.includes('sas') && tl.includes('spark'));
      const hasSas = !isComparison && tl.includes('sas');
      const hasPy  = !isComparison && (tl.includes('pyspark') || tl.includes('python'));
      const lang = marker || ((hasSas && !hasPy) ? 'sas' : (hasPy && !hasSas) ? 'python' : '');
      return `<h3 style="color:#7dd3fc;font-size:14px;font-weight:700;margin:20px 0 8px;letter-spacing:1px"${lang ? ` data-lang="${lang}"` : ''}>${t}</h3>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, `<strong style="color:#f0abfc;font-weight:700">$1</strong>`)
    .replace(/\*([^*]+)\*/g, `<em style="color:#fbbf24">$1</em>`)
    .replace(/^---$/gm, `<hr style="border:none;border-top:1px solid #1e293b;margin:24px 0">`)
    .replace(/^\| (.+) \|$/gm, (line) => {
      const cells = line.split("|").filter(Boolean).map(c => c.trim());
      // Skip separator rows like |---|---|---|
      if (cells.every(c => /^[-: ]+$/.test(c))) return "";
      return `<tr data-row="body">${cells.map(c => `<td>${c}</td>`).join("")}</tr>`;
    })
    .replace(/^- (.+)$/gm, `<li style="color:#94a3b8;margin:4px 0;font-size:14px">$1</li>`)
    .replace(/\n\n/g, `</p>|||BREAK|||<p style="color:#94a3b8;font-size:14px;line-height:1.8;margin:12px 0">`);

  // Wrap tables: first <tr> becomes <thead> with <th>, rest become <tbody>
  html = html.replace(/(<tr[^>]*>[\s\S]*?<\/tr>\n?)+/g, match => {
    const rows = [];
    let isFirst = true;
    const rebuilt = match.replace(/<tr[^>]*>([\s\S]*?)<\/tr>/g, (_, cells) => {
      if (isFirst) {
        isFirst = false;
        const ths = cells.replace(/<td>/g, '<th>').replace(/<\/td>/g, '</th>');
        rows.push(`<thead><tr>${ths}</tr></thead><tbody>`);
      } else {
        rows.push(`<tr>${cells}</tr>`);
      }
      return '';
    });
    rows.push('</tbody>');
    return `<table>${rows.join('')}</table>`;
  });
  html = html.replace(/(<li[^>]*>[\s\S]*?<\/li>)+/g, match =>
    `<ul style="padding-left:20px;margin:12px 0">${match}</ul>`
  );

  // Pull h2/h3 out of <p> wrappers so they are standalone block elements
  html = html.replace(/(<p[^>]*>)([^<]*(<h[23][^>]*>.*?<\/h[23]>)[^<]*)<\/p>/gs,
    (_, ptag, content, heading) => content.trim() === heading.trim() ? heading : ptag + content + "</p>"
  );
  html = html.replace(/\|\|\|BREAK\|\|\|/g, "");
  return `<div>${html}</div>`;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
