import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface IdeaAnswers {
  problem: string;
  user: string;
  scope: string;
  constraints: string;
  solution: string;
}

export interface IdeaSession {
  id: string;
  rawIdea: string;
  answers: IdeaAnswers;
  createdAt: string;
}

interface IdeaContextType {
  sessions: IdeaSession[];
  currentSession: Partial<IdeaSession> | null;
  setCurrentRawIdea: (idea: string) => void;
  setCurrentAnswers: (answers: Partial<IdeaAnswers>) => void;
  saveSession: () => Promise<IdeaSession | null>;
  deleteSession: (id: string) => Promise<void>;
  resetCurrent: () => void;
  isLoading: boolean;
}

const IdeaContext = createContext<IdeaContextType | null>(null);

const STORAGE_KEY = "@idea_tracker_sessions";

export function IdeaProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<IdeaSession[]>([]);
  const [currentSession, setCurrentSession] = useState<Partial<IdeaSession> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSessions(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Failed to load sessions", e);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSessions = async (updated: IdeaSession[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setSessions(updated);
  };

  const setCurrentRawIdea = useCallback((idea: string) => {
    setCurrentSession({ rawIdea: idea });
  }, []);

  const setCurrentAnswers = useCallback((answers: Partial<IdeaAnswers>) => {
    setCurrentSession((prev) => ({
      ...prev,
      answers: { ...((prev?.answers ?? {}) as Partial<IdeaAnswers>), ...answers } as IdeaAnswers,
    }));
  }, []);

  const saveSession = useCallback(async (): Promise<IdeaSession | null> => {
    if (!currentSession?.rawIdea || !currentSession?.answers) return null;

    const session: IdeaSession = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      rawIdea: currentSession.rawIdea,
      answers: currentSession.answers as IdeaAnswers,
      createdAt: new Date().toISOString(),
    };

    const updated = [session, ...sessions];
    await saveSessions(updated);
    return session;
  }, [currentSession, sessions]);

  const deleteSession = useCallback(async (id: string) => {
    const updated = sessions.filter((s) => s.id !== id);
    await saveSessions(updated);
  }, [sessions]);

  const resetCurrent = useCallback(() => {
    setCurrentSession(null);
  }, []);

  return (
    <IdeaContext.Provider
      value={{
        sessions,
        currentSession,
        setCurrentRawIdea,
        setCurrentAnswers,
        saveSession,
        deleteSession,
        resetCurrent,
        isLoading,
      }}
    >
      {children}
    </IdeaContext.Provider>
  );
}

export function useIdea() {
  const ctx = useContext(IdeaContext);
  if (!ctx) throw new Error("useIdea must be used inside IdeaProvider");
  return ctx;
}
