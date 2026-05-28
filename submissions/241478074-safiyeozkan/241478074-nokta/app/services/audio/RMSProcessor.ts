export function computeRMS(samples: number[]): number {
  if (!samples.length) return 0;
  const sumSquares = samples.reduce((sum, value) => sum + value * value, 0);
  return Math.sqrt(sumSquares / samples.length);
}

export function smoothLevel(current: number, previous: number, decay = 0.12): number {
  return Math.max(current, previous * (1 - decay));
}
