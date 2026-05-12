export type ThemeName = "warm" | "dark" | "ink" | "forest" | "ocean";

export interface ColorTokens {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  placeholder: string;
  text: string;
  tint: string;
  tabBarBg: string;
  headerBg: string;
  statusBar: "dark-content" | "light-content";
}

export const themes: Record<ThemeName, ColorTokens> = {
  warm: {
    background: "#FAFAF8",
    foreground: "#1A1A1A",
    card: "#FFFFFF",
    cardForeground: "#1A1A1A",
    primary: "#1A1A1A",
    primaryForeground: "#FFFFFF",
    secondary: "#F0EDE8",
    secondaryForeground: "#1A1A1A",
    muted: "#F5F2EE",
    mutedForeground: "#9E9B96",
    accent: "#E8E5E0",
    accentForeground: "#1A1A1A",
    destructive: "#ef4444",
    destructiveForeground: "#ffffff",
    border: "#E8E5E0",
    input: "#E8E5E0",
    placeholder: "#C0BDB8",
    text: "#1A1A1A",
    tint: "#1A1A1A",
    tabBarBg: "#FAFAF8",
    headerBg: "#FAFAF8",
    statusBar: "dark-content",
  },
  dark: {
    background: "#0F0F0F",
    foreground: "#E5E5E5",
    card: "#1A1A1A",
    cardForeground: "#E5E5E5",
    primary: "#A8FF78",
    primaryForeground: "#0F0F0F",
    secondary: "#222222",
    secondaryForeground: "#E5E5E5",
    muted: "#1E1E1E",
    mutedForeground: "#666666",
    accent: "#2A2A2A",
    accentForeground: "#E5E5E5",
    destructive: "#ef4444",
    destructiveForeground: "#ffffff",
    border: "#2A2A2A",
    input: "#2A2A2A",
    placeholder: "#444444",
    text: "#E5E5E5",
    tint: "#A8FF78",
    tabBarBg: "#1A1A1A",
    headerBg: "#0F0F0F",
    statusBar: "light-content",
  },
  ink: {
    background: "#1C1917",
    foreground: "#F5F0EB",
    card: "#292524",
    cardForeground: "#F5F0EB",
    primary: "#FBBF24",
    primaryForeground: "#1C1917",
    secondary: "#292524",
    secondaryForeground: "#F5F0EB",
    muted: "#292524",
    mutedForeground: "#78716C",
    accent: "#3A3330",
    accentForeground: "#F5F0EB",
    destructive: "#ef4444",
    destructiveForeground: "#ffffff",
    border: "#3A3330",
    input: "#3A3330",
    placeholder: "#57534E",
    text: "#F5F0EB",
    tint: "#FBBF24",
    tabBarBg: "#292524",
    headerBg: "#1C1917",
    statusBar: "light-content",
  },
  forest: {
    background: "#F0F4F0",
    foreground: "#1A2E1A",
    card: "#FFFFFF",
    cardForeground: "#1A2E1A",
    primary: "#2D6A2D",
    primaryForeground: "#FFFFFF",
    secondary: "#E2EDE2",
    secondaryForeground: "#1A2E1A",
    muted: "#E8EEE8",
    mutedForeground: "#7A9A7A",
    accent: "#D4E4D4",
    accentForeground: "#1A2E1A",
    destructive: "#dc2626",
    destructiveForeground: "#ffffff",
    border: "#C4D8C4",
    input: "#C4D8C4",
    placeholder: "#9ABF9A",
    text: "#1A2E1A",
    tint: "#2D6A2D",
    tabBarBg: "#F0F4F0",
    headerBg: "#F0F4F0",
    statusBar: "dark-content",
  },
  ocean: {
    background: "#0A1628",
    foreground: "#E0EAFF",
    card: "#0F2040",
    cardForeground: "#E0EAFF",
    primary: "#38BDF8",
    primaryForeground: "#0A1628",
    secondary: "#0F2040",
    secondaryForeground: "#E0EAFF",
    muted: "#0F2040",
    mutedForeground: "#4A6FA0",
    accent: "#1A3060",
    accentForeground: "#E0EAFF",
    destructive: "#ef4444",
    destructiveForeground: "#ffffff",
    border: "#1A3060",
    input: "#1A3060",
    placeholder: "#2A4A7A",
    text: "#E0EAFF",
    tint: "#38BDF8",
    tabBarBg: "#0F2040",
    headerBg: "#0A1628",
    statusBar: "light-content",
  },
};

export const themeLabels: Record<ThemeName, string> = {
  warm: "Sıcak",
  dark: "Karanlık",
  ink: "Mürekkep",
  forest: "Orman",
  ocean: "Okyanus",
};

const colors = themes.warm;
export default colors;
