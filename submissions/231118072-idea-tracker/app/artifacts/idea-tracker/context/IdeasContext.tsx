import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface IdeaAnswer {
  questionId: string;
  question: string;
  answer: string;
}

export interface Idea {
  id: string;
  rawIdea: string;
  answers: IdeaAnswer[];
  createdAt: string;
  completedAt?: string;
}

interface IdeasContextType {
  ideas: Idea[];
  addIdea: (idea: Idea) => Promise<void>;
  deleteIdea: (id: string) => Promise<void>;
  getIdea: (id: string) => Idea | undefined;
  isLoading: boolean;
}

const IdeasContext = createContext<IdeasContextType | undefined>(undefined);

const STORAGE_KEY = "@idea_tracker_ideas";

export function IdeasProvider({ children }: { children: React.ReactNode }) {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadIdeas();
  }, []);

  const loadIdeas = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setIdeas(JSON.parse(stored));
      }
    } catch (err) {
      console.warn("Failed to load ideas", err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveIdeas = async (updatedIdeas: Idea[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedIdeas));
  };

  const addIdea = useCallback(async (idea: Idea) => {
    setIdeas((prev) => {
      const updated = [idea, ...prev];
      saveIdeas(updated);
      return updated;
    });
  }, []);

  const deleteIdea = useCallback(async (id: string) => {
    setIdeas((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      saveIdeas(updated);
      return updated;
    });
  }, []);

  const getIdea = useCallback(
    (id: string) => ideas.find((i) => i.id === id),
    [ideas],
  );

  return (
    <IdeasContext.Provider value={{ ideas, addIdea, deleteIdea, getIdea, isLoading }}>
      {children}
    </IdeasContext.Provider>
  );
}

export function useIdeas() {
  const ctx = useContext(IdeasContext);
  if (!ctx) throw new Error("useIdeas must be used within IdeasProvider");
  return ctx;
}
