import type { ForgeCycle } from './forgeEngine';

const formatTime = (value: number) => `${Math.round(value / 1000)}s`;

export function buildForgeMarkdown(cycles: ForgeCycle[]) {
  const header = '# FORGE Otomatik Raporu\n\n';
  const rows = cycles.map((cycle) => `## ${cycle.timestamp}\n\n- Durum: ${cycle.state}\n- Süre: ${formatTime(cycle.duration)}\n- Deneme: ${cycle.retries}\n- Uzman eskalasyonu: ${cycle.escalation ? 'Evet' : 'Hayır'}\n- Özet: ${cycle.summary}\n\n`);
  return header + rows.join('\n');
}
