import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark';
export type AccentColor = 'purple' | 'orange' | 'green' | 'blue' | 'red';

interface ThemeContextType {
  themeMode: ThemeMode;
  accentColor: AccentColor;
  setThemeMode: (mode: ThemeMode) => void;
  setAccentColor: (color: AccentColor) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@nokta_theme_mode';
const ACCENT_STORAGE_KEY = '@nokta_accent_color';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');
  const [accentColor, setAccentColorState] = useState<AccentColor>('purple');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        const savedAccent = await AsyncStorage.getItem(ACCENT_STORAGE_KEY);
        
        if (savedMode) setThemeModeState(savedMode as ThemeMode);
        if (savedAccent) setAccentColorState(savedAccent as AccentColor);
      } catch (e) {
        console.error('Failed to load theme settings', e);
      }
    };
    loadSettings();
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (e) {
      console.error(e);
    }
  };

  const setAccentColor = async (color: AccentColor) => {
    setAccentColorState(color);
    try {
      await AsyncStorage.setItem(ACCENT_STORAGE_KEY, color);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleTheme = () => {
    setThemeMode(themeMode === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ themeMode, accentColor, setThemeMode, setAccentColor, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
