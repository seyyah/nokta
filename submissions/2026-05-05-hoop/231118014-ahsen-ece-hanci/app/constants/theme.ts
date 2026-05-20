export const theme = {
  bg: "#0A0B0D",
  bgElevated: "#111316",
  bgCard: "#15181C",
  border: "#1F242B",
  borderStrong: "#2A313A",
  text: "#E6EDF3",
  textDim: "#8B97A6",
  textFaint: "#4A5563",
  accent: "#00FF88",
  accentDim: "#00B85E",
  accentGlow: "rgba(0,255,136,0.18)",
  amber: "#FFB020",
  red: "#FF3355",
  blue: "#4DB5FF",
} as const;

export const mono = "Menlo";
export const monoWeb = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";

import { Platform } from "react-native";
export const monoFont = Platform.select({ web: monoWeb, default: mono }) as string;

export const verdictLabel = (score: number): { label: string; color: string } => {
  if (score >= 80) return { label: "PURE SLOP", color: theme.red };
  if (score >= 60) return { label: "SLOPPY", color: "#FF7744" };
  if (score >= 40) return { label: "MIXED", color: theme.amber };
  if (score >= 20) return { label: "GROUNDED", color: "#A0E060" };
  return { label: "SHARP", color: theme.accent };
};
