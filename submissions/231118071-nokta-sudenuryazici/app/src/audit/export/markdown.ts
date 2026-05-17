import type { AuditNote } from '../core/types';

export function buildMarkdown(notes: AuditNote[], config: { appName: string; exportedAt: string; totalNotes: number }) {
  let md = `# 🐞 Bug Report: ${config.appName}\n\n`;
  md += `**Date:** ${config.exportedAt}\n`;
  md += `**Total Issues:** ${config.totalNotes}\n\n---\n\n`;

  notes.forEach((note, index) => {
    md += `### ISSUE #${index + 1}: ${note.note.substring(0, 50)}${note.note.length > 50 ? '...' : ''}\n\n`;
    md += `| Attribute | Details |\n`;
    md += `| :--- | :--- |\n`;
    md += `| **Screen** | ${note.screenName} |\n`;
    md += `| **Timestamp** | ${note.timestamp} |\n`;
    md += `| **Reporter** | ${note.reporterId || 'Anonymous'} |\n\n`;
    
    md += `#### 📝 Note\n> ${note.note}\n\n`;
    
    if (note.screenshot) {
      md += `#### 📸 Screenshot\n![Bug Screenshot](${note.screenshot})\n\n`;
    }
    
    md += `---\n\n`;
  });

  return md;
}
