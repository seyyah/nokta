/**
 * Nokta design tokens.
 * Aesthetic: precision inspection instrument — deep charcoal canvas with
 * a single high-contrast safety-yellow accent. No gradients, no fluff.
 */
const palette = {
  ink: "#0A0A0A",
  ink2: "#121212",
  surface: "#1A1A1A",
  surface2: "#222222",
  border: "#2A2A2A",
  borderStrong: "#3A3A3A",
  text: "#F5F5F5",
  textDim: "#9A9A9A",
  textMuted: "#6A6A6A",
  yellow: "#FFD60A",
  yellowDim: "#B89500",
  red: "#FF453A",
  green: "#30D158",
} as const;

export default {
  palette,
  light: {
    text: palette.text,
    background: palette.ink,
    tint: palette.yellow,
    tabIconDefault: palette.textMuted,
    tabIconSelected: palette.yellow,
  },
};
