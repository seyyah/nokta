import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { type ColorTokens, type ThemeName, themes } from "@/constants/colors";

interface ThemeContextValue {
  themeName: ThemeName;
  colors: ColorTokens;
  setTheme: (name: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  themeName: "warm",
  colors: themes.warm,
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>("warm");

  useEffect(() => {
    AsyncStorage.getItem("nokta_theme").then((v) => {
      if (v && v in themes) setThemeName(v as ThemeName);
    });
  }, []);

  const setTheme = useCallback((name: ThemeName) => {
    setThemeName(name);
    AsyncStorage.setItem("nokta_theme", name);
  }, []);

  return (
    <ThemeContext.Provider value={{ themeName, colors: themes[themeName], setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
