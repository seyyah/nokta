/**
 * Nokta Design System — Dark Engineering Tool Aesthetic
 * Inspired by Linear, Vercel, and Raycast design languages.
 */

import { Platform } from 'react-native';

// ─── Color Tokens ────────────────────────────────────────────
export const NoktaColors = {
  // Backgrounds
  bg: '#09090b',
  bgElevated: '#0f0f12',
  bgCard: '#131316',
  bgCardHover: '#18181b',
  bgInput: '#0c0c0e',

  // Borders
  border: '#27272a',
  borderSubtle: '#1e1e22',
  borderFocus: '#3f3f46',

  // Text
  textPrimary: '#fafafa',
  textSecondary: '#a1a1aa',
  textTertiary: '#71717a',
  textDimmed: '#52525b',

  // Accent — Emerald / Green (engineering feel)
  accent: '#10b981',
  accentMuted: '#065f46',
  accentGlow: 'rgba(16, 185, 129, 0.15)',

  // Status
  success: '#22c55e',
  warning: '#eab308',
  error: '#ef4444',
  info: '#3b82f6',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.6)',
  shimmer: 'rgba(255, 255, 255, 0.03)',
} as const;

// ─── Spacing Scale ───────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

// ─── Border Radius ───────────────────────────────────────────
export const Radius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 999,
} as const;

// ─── Typography ──────────────────────────────────────────────
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "Inter, system-ui, -apple-system, sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;

// ─── Legacy compat (used by existing themed components) ──────
const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};
