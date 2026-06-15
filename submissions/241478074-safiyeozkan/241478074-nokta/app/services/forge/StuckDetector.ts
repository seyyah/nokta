import type { ForgeCycle } from './forgeEngine';

export function detectStuck(cycles: ForgeCycle[]): boolean {
  if (cycles.length < 2) return false;

  const recent = cycles.slice(-4);
  const failureStreak = recent.filter((cycle) => cycle.state === 'FAIL' || cycle.state === 'ROLLBACK').length;
  const sameSummary = recent.length > 2 && recent.every((cycle) => cycle.summary === recent[0].summary);
  const retryPressure = recent.some((cycle) => cycle.retries >= 2);
  const longTimeout = recent.some((cycle) => cycle.duration >= 12000);

  return failureStreak >= 3 || sameSummary || retryPressure || longTimeout;
}
