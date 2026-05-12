import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface PluginSettings {
  autoCopyToClipboard: boolean;
  markdownMode: boolean;
  showLineNumbers: boolean;
  caseSensitive: boolean;
  sortAlphabetically: boolean;
  stripEmojis: boolean;
  tagSuggestions: boolean;
}

const DEFAULT_PLUGINS: PluginSettings = {
  autoCopyToClipboard: false,
  markdownMode: false,
  showLineNumbers: true,
  caseSensitive: false,
  sortAlphabetically: false,
  stripEmojis: false,
  tagSuggestions: true,
};

interface PluginsContextValue {
  plugins: PluginSettings;
  toggle: (key: keyof PluginSettings) => void;
  reset: () => void;
}

const PluginsContext = createContext<PluginsContextValue>({
  plugins: DEFAULT_PLUGINS,
  toggle: () => {},
  reset: () => {},
});

const STORAGE_KEY = "nokta_plugins";

export function PluginsProvider({ children }: { children: React.ReactNode }) {
  const [plugins, setPlugins] = useState<PluginSettings>(DEFAULT_PLUGINS);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (v) {
        try {
          setPlugins({ ...DEFAULT_PLUGINS, ...JSON.parse(v) });
        } catch {}
      }
    });
  }, []);

  const persist = useCallback(async (next: PluginSettings) => {
    setPlugins(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const toggle = useCallback(
    (key: keyof PluginSettings) => {
      persist({ ...plugins, [key]: !plugins[key] });
    },
    [plugins, persist],
  );

  const reset = useCallback(() => {
    persist(DEFAULT_PLUGINS);
  }, [persist]);

  return (
    <PluginsContext.Provider value={{ plugins, toggle, reset }}>
      {children}
    </PluginsContext.Provider>
  );
}

export function usePlugins() {
  return useContext(PluginsContext);
}
