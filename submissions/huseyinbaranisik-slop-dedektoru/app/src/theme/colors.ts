import { ThemeMode, AccentColor } from '../context/ThemeContext';

export const accentPalettes: Record<AccentColor, string> = {
  purple: '#7C3AED',
  orange: '#F97316',
  green: '#22C55E',
  blue: '#3B82F6',
  red: '#EF4444',
};

export const getColors = (mode: ThemeMode, accent: AccentColor) => {
  const primary = accentPalettes[accent];
  
  const isDark = mode === 'dark';

  return {
    primary,
    bg: isDark ? '#0F1117' : '#F8FAFC',
    bgCard: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
    bgCardBorder: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0',
    textPrimary: isDark ? '#F1F5F9' : '#0F172A',
    textMuted: isDark ? '#94A3B8' : '#64748B',
    textDim: isDark ? '#475569' : '#94A3B8',
    white: '#FFFFFF',
    black: '#000000',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    
    // For legacy support if needed, but we should aim to use the above
    purple: '#7C3AED',
    magenta: '#EC4899',
    amber: '#F59E0B',
    green: '#22C55E',
    red: '#EF4444',
    orange: '#F97316',
  };
};

export type AppColors = ReturnType<typeof getColors>;

// For initial types or static uses where context isn't available
export const colors = getColors('dark', 'purple');
