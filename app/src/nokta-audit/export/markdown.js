// @ts-check
/**
 * @param {import('./core/types').AuditNote['status']} s
 * @returns {string}
 */
function statusEmoji(s) {
  return s === 'fixed' ? '✅' : '🔴';
}

/**
 * @param {import('./core/types').AuditNote['status']} s
 * @returns {string}
 */
function statusLabel(s) {
  return s === 'fixed' ? 'Düzeltildi' : 'Açık';
}

/**
 * @param {import('./core/types').AuditNote[]} notes
 * @param {import('./core/types').AuditReportMeta} meta
 * @returns {string}
 */
export function buildMarkdown(notes, meta) {
  const open = notes.filter((n) => n.status === 'open').length;
  const fixed = notes.filter((n) => n.status === 'fixed').length;

  let md = `# Bug Raporu — ${meta.appName}\n\n`;
  md += `**Tarih:** ${new Date(meta.exportedAt).toLocaleString('tr-TR')}  \n`;
  md += `**Toplam:** ${meta.totalNotes} not`;
  if (open) md += ` · 🔴 ${open} açık`;
  if (fixed) md += ` · ✅ ${fixed} düzeltildi`;
  md += `\n\n---\n\n`;

  /** @type {Record<string, import('./core/types').AuditNote[]>} */
  const grouped = {};
  notes.forEach((n) => {
    (grouped[n.screenName] = grouped[n.screenName] || []).push(n);
  });

  let i = 1;
  for (const [screen, items] of Object.entries(grouped)) {
    md += `## Ekran: ${screen}\n\n`;
    for (const n of items) {
      const noteText = n.note.replace(/\s*\n\s*/g, ' ').trim();
      md += `### ${statusEmoji(n.status)} #${i++} — ${noteText}\n\n`;
      if (n.screenshot) {
        const thumb = n.screenshot.slice(0, 120);
        md += `![Screenshot](${thumb}…[truncated])\n\n`;
      }
      md += `- **Durum:** ${statusLabel(n.status)}\n`;
      md += `- **Zaman:** ${new Date(n.timestamp).toLocaleString('tr-TR')}\n`;
      if (n.reporterId) md += `- **Raporlayan:** ${n.reporterId}\n`;
      md += `\n---\n\n`;
    }
  }

  return md;
}
