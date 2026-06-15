/**
 * Nokta Voice Forge — Design System
 * Premium dark theme inspired by OpenAI voice mode aesthetics
 */

export const colors = {
  // Core backgrounds
  background: '#0A0A0F',
  surface: '#12121A',
  surfaceLight: '#1A1A28',
  surfaceGlass: 'rgba(18, 18, 26, 0.75)',
  surfaceGlassLight: 'rgba(26, 26, 40, 0.6)',

  // Brand colors
  primary: '#00D4AA',       // Cyan-green (voice active, success)
  primaryDim: '#00A888',
  primaryGlow: 'rgba(0, 212, 170, 0.3)',
  secondary: '#7C5CFC',    // Purple (avatar, creative)
  secondaryDim: '#6347D4',
  secondaryGlow: 'rgba(124, 92, 252, 0.3)',
  accent: '#FF6B6B',       // Coral (alerts, STUCK, danger)
  accentDim: '#E05555',
  accentGlow: 'rgba(255, 107, 107, 0.3)',

  // Semantic
  success: '#00D4AA',
  warning: '#FFB347',
  warningDim: '#E09A30',
  error: '#FF4757',
  info: '#4DACFF',

  // Text
  text: '#EAEAEF',
  textSecondary: '#8888A0',
  textMuted: '#555570',
  textInverse: '#0A0A0F',

  // Borders & overlays
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.15)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',

  // Gradients (as arrays for LinearGradient)
  gradientPrimary: ['#00D4AA', '#00A888', '#007766'] as const,
  gradientSecondary: ['#7C5CFC', '#6347D4', '#4A32B0'] as const,
  gradientAccent: ['#FF6B6B', '#E05555', '#C43E3E'] as const,
  gradientDark: ['#12121A', '#0A0A0F'] as const,
  gradientSurface: ['rgba(18,18,26,0.9)', 'rgba(10,10,15,0.95)'] as const,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
} as const;

export const typography = {
  hero: {
    fontSize: 36,
    fontWeight: '800' as const,
    letterSpacing: -1,
    color: colors.text,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    color: colors.text,
  },
  subheading: {
    fontSize: 20,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
    color: colors.text,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    color: colors.text,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
    color: colors.text,
  },
  caption: {
    fontSize: 13,
    fontWeight: '500' as const,
    letterSpacing: 0.2,
    color: colors.textSecondary,
  },
  micro: {
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
    color: colors.textMuted,
  },
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  }),
} as const;

export const animation = {
  springConfig: {
    damping: 15,
    stiffness: 150,
    mass: 0.5,
  },
  springBouncy: {
    damping: 8,
    stiffness: 200,
    mass: 0.3,
  },
  springGentle: {
    damping: 20,
    stiffness: 100,
    mass: 0.8,
  },
  timing: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
} as const;

// Persona-specific themes
export const personaThemes = {
  junior: {
    name: 'Junior-Sen',
    primaryColor: colors.primary,
    glowColor: colors.primaryGlow,
    gradient: colors.gradientPrimary,
    faceShape: 'round' as const,
    eyeSize: 'large' as const,
    tone: 'Meraklı, öğrenmeye açık, enerjik',
    animationIntensity: 1.2,
  },
  senior: {
    name: 'Senior-Sen',
    primaryColor: colors.secondary,
    glowColor: colors.secondaryGlow,
    gradient: colors.gradientSecondary,
    faceShape: 'angular' as const,
    eyeSize: 'normal' as const,
    tone: 'Profesyonel, analitik, sakin',
    animationIntensity: 0.8,
  },
} as const;

export type PersonaType = keyof typeof personaThemes;
