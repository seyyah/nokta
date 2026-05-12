import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface AgendaEvent {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:MM
  endTime?: string;
  color: string;
  isRecurring: boolean;
  recurringType?: "daily" | "weekly" | "monthly";
  reminderMinutes?: number;
  createdAt: number;
}

interface AgendaContextValue {
  events: AgendaEvent[];
  addEvent: (event: Omit<AgendaEvent, "id" | "createdAt">) => void;
  updateEvent: (id: string, updates: Partial<AgendaEvent>) => void;
  deleteEvent: (id: string) => void;
  getEventsForDate: (date: string) => AgendaEvent[];
  getEventsForMonth: (year: number, month: number) => Record<string, AgendaEvent[]>;
}

const AgendaContext = createContext<AgendaContextValue>({
  events: [],
  addEvent: () => {},
  updateEvent: () => {},
  deleteEvent: () => {},
  getEventsForDate: () => [],
  getEventsForMonth: () => ({}),
});

const KEY = "nokta_agenda_v1";

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function AgendaProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<AgendaEvent[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => {
      if (v) {
        try { setEvents(JSON.parse(v)); } catch {}
      }
    });
  }, []);

  const persist = useCallback((next: AgendaEvent[]) => {
    setEvents(next);
    AsyncStorage.setItem(KEY, JSON.stringify(next));
  }, []);

  const addEvent = useCallback((data: Omit<AgendaEvent, "id" | "createdAt">) => {
    const event: AgendaEvent = { ...data, id: uid(), createdAt: Date.now() };
    persist([event, ...events]);
  }, [events, persist]);

  const updateEvent = useCallback((id: string, updates: Partial<AgendaEvent>) => {
    persist(events.map((e) => e.id === id ? { ...e, ...updates } : e));
  }, [events, persist]);

  const deleteEvent = useCallback((id: string) => {
    persist(events.filter((e) => e.id !== id));
  }, [events, persist]);

  const getEventsForDate = useCallback((date: string) => {
    return events.filter((e) => {
      if (e.date === date) return true;
      if (!e.isRecurring) return false;
      const eventDate = new Date(e.date);
      const targetDate = new Date(date);
      if (e.recurringType === "daily") return targetDate >= eventDate;
      if (e.recurringType === "weekly") {
        return targetDate >= eventDate && eventDate.getDay() === targetDate.getDay();
      }
      if (e.recurringType === "monthly") {
        return targetDate >= eventDate && eventDate.getDate() === targetDate.getDate();
      }
      return false;
    });
  }, [events]);

  const getEventsForMonth = useCallback((year: number, month: number) => {
    const result: Record<string, AgendaEvent[]> = {};
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dayEvents = getEventsForDate(dateStr);
      if (dayEvents.length > 0) result[dateStr] = dayEvents;
    }
    return result;
  }, [getEventsForDate]);

  return (
    <AgendaContext.Provider value={{ events, addEvent, updateEvent, deleteEvent, getEventsForDate, getEventsForMonth }}>
      {children}
    </AgendaContext.Provider>
  );
}

export function useAgenda() {
  return useContext(AgendaContext);
}
