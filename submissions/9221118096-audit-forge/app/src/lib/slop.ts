// Pure helper — slop-score tiering. Kept React-free so it is unit-testable
// and so forge cycles can use `tsc --noEmit` as a deterministic TEST gate.

export type SlopTier = "grounded" | "mixed" | "slop";

export function slopTier(score: number): SlopTier {
  const s = Math.max(0, Math.min(100, score));
  if (s >= 70) return "slop";
  if (s >= 40) return "mixed";
  return "grounded";
}

export function slopColor(score: number): string {
  switch (slopTier(score)) {
    case "slop":
      return "#E53935";
    case "mixed":
      return "#F59E0B";
    case "grounded":
      return "#10B981";
  }
}

export function slopLabel(score: number): string {
  switch (slopTier(score)) {
    case "slop":
      return "PURE SLOP";
    case "mixed":
      return "MIXED";
    case "grounded":
      return "GROUNDED";
  }
}
