import type { AuditReport } from "./types";

/**
 * Burn-in Markdown report — designed to be fed verbatim to a coding agent
 * (Claude Code / Codex / OpenCode) as the input for the forge loop.
 */
export function reportToMarkdown(report: AuditReport): string {
  const date = new Date(report.createdAt);
  const iso = date.toISOString();
  const human = date.toLocaleString();

  const header = [
    `# Nokta Audit Report`,
    ``,
    `- **Report ID:** \`${report.id}\``,
    `- **Screen:** \`${report.screen}\``,
    `- **Captured:** ${human} (\`${iso}\`)`,
    `- **Device:** ${report.device.os} ${report.device.osVersion} — ${report.device.screenWidth}×${report.device.screenHeight}`,
    `- **Annotations:** ${report.annotations.length}`,
    ``,
    `---`,
    ``,
  ].join("\n");

  if (report.annotations.length === 0) {
    return `${header}_No annotations recorded._\n`;
  }

  const findings = report.annotations
    .map((a, i) => {
      const note = a.note.trim().length > 0 ? a.note.trim() : "_(no note)_";
      return [
        `## Finding ${i + 1}`,
        ``,
        `- **Region:** x=${Math.round(a.x)}, y=${Math.round(a.y)}, w=${Math.round(a.width)}, h=${Math.round(a.height)}`,
        `- **Note:** ${note}`,
        ``,
      ].join("\n");
    })
    .join("\n");

  const layout = renderAsciiLayout(report);

  const footer = [
    ``,
    `---`,
    ``,
    `## Visual Layout`,
    ``,
    "```",
    layout,
    "```",
    ``,
    `## Agent Instructions`,
    ``,
    `Use the **READ → LOCATE → HYPOTHESIZE → REPAIR → TEST → VERIFY → COMMIT/ROLLBACK** loop.`,
    `Each annotated finding is an independent issue. Address them in order.`,
    ``,
  ].join("\n");

  return header + findings + footer;
}

/** Tiny ASCII grid showing where boxes live on screen. */
function renderAsciiLayout(report: AuditReport): string {
  const cols = 32;
  const rows = 24;
  const grid: string[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ".")
  );
  const sw = report.device.screenWidth;
  const sh = report.device.screenHeight;
  report.annotations.forEach((a, idx) => {
    const x0 = Math.max(0, Math.min(cols - 1, Math.floor((a.x / sw) * cols)));
    const y0 = Math.max(0, Math.min(rows - 1, Math.floor((a.y / sh) * rows)));
    const x1 = Math.max(0, Math.min(cols - 1, Math.floor(((a.x + a.width) / sw) * cols)));
    const y1 = Math.max(0, Math.min(rows - 1, Math.floor(((a.y + a.height) / sh) * rows)));
    const mark = String.fromCharCode("A".charCodeAt(0) + (idx % 26));
    for (let r = y0; r <= y1; r++) {
      for (let c = x0; c <= x1; c++) {
        if (r === y0 || r === y1 || c === x0 || c === x1) {
          grid[r][c] = mark;
        }
      }
    }
  });
  return grid.map((row) => row.join("")).join("\n");
}

export function generateReportId(): string {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 6);
  return `r_${t}_${r}`;
}
