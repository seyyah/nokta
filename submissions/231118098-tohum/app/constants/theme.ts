// Tohum design tokens — Stitch palette ported verbatim into code.
// UI is single-theme (dark) intentionally; no light/dark branching.

export const colors = {
  primary: '#2F7AC2',
  secondary: '#627997',
  tertiary: '#898200',

  bg: '#0D1117',
  surface: '#161B22',
  surfaceRaised: '#1C2128',
  border: '#262C33',
  divider: '#1F2428',

  text: '#E6EDF3',
  textMuted: '#8B949E',
  textDim: '#484F58',

  success: '#238636',
  warn: '#D29922',
  danger: '#F85149',

  // semantic roles used across screens
  bubbleUser: '#2F7AC2',
  bubbleAi: '#1C2128',
  suggestionChip: '#898200',
  suggestionChipSurface: '#1F2A16',
} as const;

export const typography = {
  headline: 'Manrope_700Bold',
  headlineMedium: 'Manrope_600SemiBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemi: 'Inter_600SemiBold',
  label: 'Inter_500Medium',
  mono: 'Menlo',
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  display: 44,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  pill: 999,
} as const;

export const timing = {
  fast: 150,
  base: 220,
  slow: 320,
} as const;
