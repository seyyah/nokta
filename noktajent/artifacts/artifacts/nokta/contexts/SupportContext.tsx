import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface SupportMessage {
  id: string;
  sessionId: string;
  role: "user" | "agent";
  text: string;
  createdAt: number;
}

export interface SupportSession {
  id: string;
  deviceId: string;
  userName: string;
  status: "open" | "active" | "closed";
  createdAt: number;
  updatedAt: number;
}

interface SupportContextValue {
  session: SupportSession | null;
  messages: SupportMessage[];
  isConnecting: boolean;
  isSending: boolean;
  error: string | null;
  initSession: (userName?: string) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
}

const SupportContext = createContext<SupportContextValue>({
  session: null,
  messages: [],
  isConnecting: false,
  isSending: false,
  error: null,
  initSession: async () => {},
  sendMessage: async () => {},
});

const DEVICE_KEY = "nokta_device_id";
const BASE = process.env["EXPO_PUBLIC_DOMAIN"]
  ? `https://${process.env["EXPO_PUBLIC_DOMAIN"]}`
  : "";

async function getDeviceId(): Promise<string> {
  let id = await AsyncStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = Date.now().toString(36) + Math.random().toString(36).slice(2);
    await AsyncStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

export function SupportProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SupportSession | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastMsgTime = useRef(0);

  const startPolling = useCallback((sessionId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const url = `${BASE}/api/support/sessions/${sessionId}/messages?after=${lastMsgTime.current}`;
        const r = await fetch(url);
        if (!r.ok) return;
        const data = (await r.json()) as {
          messages: SupportMessage[];
          session: SupportSession;
        };
        setSession(data.session);
        if (data.messages.length > 0) {
          lastMsgTime.current = data.messages[data.messages.length - 1]!.createdAt;
          setMessages((prev) => [...prev, ...data.messages]);
        }
      } catch {}
    }, 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const initSession = useCallback(
    async (userName?: string) => {
      setIsConnecting(true);
      setError(null);
      try {
        const deviceId = await getDeviceId();
        const r = await fetch(`${BASE}/api/support/sessions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deviceId, userName: userName || "Kullanıcı" }),
        });
        if (!r.ok) throw new Error("Bağlanılamadı");
        const sess = (await r.json()) as SupportSession;
        setSession(sess);
        const msgsR = await fetch(`${BASE}/api/support/sessions/${sess.id}/messages`);
        const msgsData = (await msgsR.json()) as {
          messages: SupportMessage[];
          session: SupportSession;
        };
        setMessages(msgsData.messages);
        if (msgsData.messages.length > 0) {
          lastMsgTime.current =
            msgsData.messages[msgsData.messages.length - 1]!.createdAt;
        }
        startPolling(sess.id);
      } catch (e) {
        setError("Destek hattına bağlanılamadı. Lütfen tekrar deneyin.");
      } finally {
        setIsConnecting(false);
      }
    },
    [startPolling],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!session) return;
      setIsSending(true);
      try {
        const r = await fetch(
          `${BASE}/api/support/sessions/${session.id}/messages`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
          },
        );
        if (!r.ok) throw new Error("Gönderilemedi");
        const msg = (await r.json()) as SupportMessage;
        lastMsgTime.current = msg.createdAt;
        setMessages((prev) => [...prev, msg]);
      } catch {
        setError("Mesaj gönderilemedi.");
      } finally {
        setIsSending(false);
      }
    },
    [session],
  );

  return (
    <SupportContext.Provider
      value={{ session, messages, isConnecting, isSending, error, initSession, sendMessage }}
    >
      {children}
    </SupportContext.Provider>
  );
}

export function useSupport() {
  return useContext(SupportContext);
}
