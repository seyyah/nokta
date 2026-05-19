import { ColorSchemeName } from 'react-native';

export type AppPalette = {
  background: string;
  card: string;
  cardSoft: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentSoft: string;
  success: string;
  warning: string;
  danger: string;
};

const lightPalette: AppPalette = {
  background: '#F4F7FA',
  card: '#FFFFFF',
  cardSoft: '#EDF2F7',
  border: '#D6DEE8',
  textPrimary: '#0D1B2A',
  textSecondary: '#1B263B',
  textMuted: '#4A586D',
  accent: '#0F766E',
  accentSoft: '#D5F5F2',
  success: '#1B8F4A',
  warning: '#B46A00',
  danger: '#C92A2A'
};

const darkPalette: AppPalette = {
  background: '#0C1119',
  card: '#141C26',
  cardSoft: '#1B2633',
  border: '#2D3B4D',
  textPrimary: '#F4F7FB',
  textSecondary: '#D4DEEB',
  textMuted: '#A3B1C4',
  accent: '#29A19C',
  accentSoft: '#103B3A',
  success: '#4FCB7D',
  warning: '#F0A63E',
  danger: '#FF6B6B'
};

export function getPalette(colorScheme: ColorSchemeName): AppPalette {
  return colorScheme === 'dark' ? darkPalette : lightPalette;
}
