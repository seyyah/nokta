import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface HistoryEntry {
  id: string;
  title: string;
  rawText: string;
  ideas: string[];
  duplicatesRemoved: number;
  tags: string[];
  createdAt: number;
}

interface HistoryContextValue {
  history: HistoryEntry[];
  saveEntry: (entry: Omit<HistoryEntry, "id" | "createdAt">) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
}

const HistoryContext = createContext<HistoryContextValue>({
  history: [],
  saveEntry: async () => {},
  deleteEntry: async () => {},
  clearHistory: async () => {},
});

const STORAGE_KEY = "nokta_history";

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (v) {
        try {
          setHistory(JSON.parse(v));
        } catch {}
      }
    });
  }, []);

  const persist = useCallback(async (entries: HistoryEntry[]) => {
    setHistory(entries);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, []);

  const saveEntry = useCallback(
    async (entry: Omit<HistoryEntry, "id" | "createdAt">) => {
      const newEntry: HistoryEntry = {
        ...entry,
        id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
        createdAt: Date.now(),
      };
      await persist([newEntry, ...history].slice(0, 50));
    },
    [history, persist],
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      await persist(history.filter((e) => e.id !== id));
    },
    [history, persist],
  );

  const clearHistory = useCallback(async () => {
    await persist([]);
  }, [persist]);

  return (
    <HistoryContext.Provider value={{ history, saveEntry, deleteEntry, clearHistory }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  return useContext(HistoryContext);
}
