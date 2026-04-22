import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface EngAnswer {
  questionId: string;
  question: string;
  answer: string;
}

export interface IdeaEntry {
  id: string;
  rawIdea: string;
  answers: EngAnswer[];
  spec: string;
  createdAt: number;
  updatedAt: number;
}

interface IdeaContextValue {
  ideas: IdeaEntry[];
  addIdea: (idea: IdeaEntry) => Promise<void>;
  updateIdea: (id: string, updates: Partial<IdeaEntry>) => Promise<void>;
  removeIdea: (id: string) => Promise<void>;
  getIdea: (id: string) => IdeaEntry | undefined;
  isLoading: boolean;
}

const IdeaContext = createContext<IdeaContextValue | undefined>(undefined);

const STORAGE_KEY = "@idea_tracker_ideas";

export function IdeaProvider({ children }: { children: React.ReactNode }) {
  const [ideas, setIdeas] = useState<IdeaEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadIdeas();
  }, []);

  async function loadIdeas() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as IdeaEntry[];
        setIdeas(parsed);
      }
    } catch (e) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }

  async function saveIdeas(newIdeas: IdeaEntry[]) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newIdeas));
  }

  const addIdea = useCallback(async (idea: IdeaEntry) => {
    setIdeas((prev) => {
      const next = [idea, ...prev];
      saveIdeas(next);
      return next;
    });
  }, []);

  const updateIdea = useCallback(async (id: string, updates: Partial<IdeaEntry>) => {
    setIdeas((prev) => {
      const next = prev.map((i) =>
        i.id === id ? { ...i, ...updates, updatedAt: Date.now() } : i
      );
      saveIdeas(next);
      return next;
    });
  }, []);

  const removeIdea = useCallback(async (id: string) => {
    setIdeas((prev) => {
      const next = prev.filter((i) => i.id !== id);
      saveIdeas(next);
      return next;
    });
  }, []);

  const getIdea = useCallback(
    (id: string) => ideas.find((i) => i.id === id),
    [ideas]
  );

  return (
    <IdeaContext.Provider value={{ ideas, addIdea, updateIdea, removeIdea, getIdea, isLoading }}>
      {children}
    </IdeaContext.Provider>
  );
}

export function useIdeas() {
  const ctx = useContext(IdeaContext);
  if (!ctx) throw new Error("useIdeas must be used within IdeaProvider");
  return ctx;
}
