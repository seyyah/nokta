import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import {
  AudioModule,
  RecordingPresets,
  createAudioPlayer,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { Mic, Send, Sparkles, Square, Trash2, UserCheck, Volume2, VolumeX } from "lucide-react-native";
import { generateObject } from "@rork-ai/toolkit-sdk";
import { z } from "zod";

import { GridBackground } from "@/components/GridBackground";
import { NoktaBot, type BotState } from "@/components/NoktaBot";
import { monoFont, theme } from "@/constants/theme";
import { useAnalysisContext } from "@/providers/AnalysisProvider";

const TOOLKIT_URL = process.env.EXPO_PUBLIC_TOOLKIT_URL ?? "";
const TOOLKIT_KEY = process.env.EXPO_PUBLIC_RORK_TOOLKIT_SECRET_KEY ?? "";
// Daniel - steady broadcaster, verified tr-TR via eleven_multilingual_v2
const EXPERT_VOICE_ID = "onwK4e9ZLuTAKqWW03F9";
const VOICE_PREF_KEY = "nokta.expert_voice.v1";

const CHAT_KEY = "nokta.expert_chat.v1";
const MAX_TURNS = 20;

async function fetchTtsBlob(text: string, attempt: number): Promise<Blob | null> {
  try {
    const res = await fetch(
      `${TOOLKIT_URL}/v2/elevenlabs/v1/text-to-speech/${EXPERT_VOICE_ID}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${TOOLKIT_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, model_id: "eleven_multilingual_v2" }),
      },
    );
    if (!res.ok) {
      console.log("[Nokta] tts http error", res.status, "attempt", attempt);
      return null;
    }
    return await res.blob();
  } catch (e) {
    console.log("[Nokta] tts fetch error", e, "attempt", attempt);
    return null;
  }
}

async function speakReply(
  text: string,
  onStart: () => void,
  onFinish: () => void,
): Promise<{ play: () => void; stop: () => void } | null> {
  if (!TOOLKIT_URL || !TOOLKIT_KEY) {
    console.log("[Nokta] tts skipped: missing toolkit env");
    return null;
  }
  try {
    // Ensure playback isn't blocked by recording mode (esp. right after mic use)
    if (Platform.OS !== "web") {
      try {
        await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });
      } catch (e) {
        console.log("[Nokta] tts audio mode error", e);
      }
    }
    // Retry once on transient failures
    let blob = await fetchTtsBlob(text, 1);
    if (!blob) {
      await new Promise((r) => setTimeout(r, 350));
      blob = await fetchTtsBlob(text, 2);
    }
    if (!blob) return null;
    const uri = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    const player = createAudioPlayer({ uri });
    let finished = false;
    let started = false;
    let lastTime = 0;
    let stallTimer: ReturnType<typeof setTimeout> | null = null;
    let fallbackFinishTimer: ReturnType<typeof setTimeout> | null = null;
    const safeFinish = () => {
      if (finished) return;
      finished = true;
      if (stallTimer) clearTimeout(stallTimer);
      if (fallbackFinishTimer) clearTimeout(fallbackFinishTimer);
      try { sub?.remove(); } catch {}
      onFinish();
    };
    const markStarted = () => {
      if (started) return;
      started = true;
      onStart();
    };
    let sub: { remove: () => void } | null = null;
    try {
      sub = player.addListener(
        "playbackStatusUpdate",
        (status: { didJustFinish?: boolean; playing?: boolean; currentTime?: number; duration?: number }) => {
          const t = status?.currentTime ?? 0;
          if (t > lastTime) lastTime = t;
          if (!started && (status?.playing === true || t > 0)) {
            markStarted();
          }
          if (status?.didJustFinish) {
            safeFinish();
          }
        },
      );
    } catch (e) {
      console.log("[Nokta] tts listener error", e);
    }
    return {
      play: () => {
        try {
          player.play();
        } catch (e) {
          console.log("[Nokta] tts play error", e);
        }
        // Fallback: if status update never fires "playing" within 500ms, force start
        setTimeout(() => { if (!started) markStarted(); }, 500);
        // Stall watchdog: if currentTime stays at 0 for 2.5s after play, treat as finished
        stallTimer = setTimeout(() => {
          if (!started || lastTime <= 0) {
            console.log("[Nokta] tts stall — finishing");
            safeFinish();
          }
        }, 2500);
        // Hard cap fallback: even if didJustFinish never fires, end after a reasonable max
        const approxMs = Math.min(60000, Math.max(4000, text.length * 75));
        fallbackFinishTimer = setTimeout(() => {
          if (!finished) {
            console.log("[Nokta] tts hard fallback finish");
            safeFinish();
          }
        }, approxMs + 3000);
      },
      stop: () => {
        try {
          if (stallTimer) clearTimeout(stallTimer);
          if (fallbackFinishTimer) clearTimeout(fallbackFinishTimer);
          player.pause();
          player.release();
        } catch {}
      },
    };
  } catch (e) {
    console.log("[Nokta] tts error", e);
    return null;
  }
}

async function transcribeAudio(uri: string): Promise<string | null> {
  if (!TOOLKIT_URL || !TOOLKIT_KEY) {
    console.log("[Nokta] stt skipped: missing toolkit env");
    return null;
  }
  try {
    const lower = uri.toLowerCase();
    const ext = lower.endsWith(".wav")
      ? "wav"
      : lower.endsWith(".mp3")
        ? "mp3"
        : lower.endsWith(".caf")
          ? "caf"
          : lower.endsWith(".3gp")
            ? "3gp"
            : lower.endsWith(".aac")
              ? "aac"
              : "m4a";
    const mime =
      ext === "wav"
        ? "audio/wav"
        : ext === "mp3"
          ? "audio/mpeg"
          : ext === "caf"
            ? "audio/x-caf"
            : ext === "3gp"
              ? "audio/3gpp"
              : ext === "aac"
                ? "audio/aac"
                : "audio/m4a";
    const body = new FormData();
    body.append("model_id", "scribe_v2");
    const fileObj: { uri: string; name: string; type: string } = {
      uri,
      name: `voice.${ext}`,
      type: mime,
    };
    body.append("file", fileObj as unknown as Blob);
    console.log("[Nokta] stt upload", { uri, ext, mime });
    const res = await fetch(`${TOOLKIT_URL}/v2/elevenlabs/v1/speech-to-text`, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOOLKIT_KEY}` },
      body,
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.log("[Nokta] stt http error", res.status, errText);
      return null;
    }
    const json = (await res.json()) as { text?: string };
    const out = (json.text ?? "").trim();
    console.log("[Nokta] stt ok, length=", out.length);
    return out.length > 0 ? out : null;
  } catch (e) {
    console.log("[Nokta] stt error", e);
    return null;
  }
}

type ChatMsg = {
  id: string;
  role: "expert" | "user";
  text: string;
  ts: number;
};

const replySchema = z.object({
  reply: z
    .string()
    .describe(
      "Senior VC partner's short, direct reply in the user's language. Max 3 short paragraphs. Plain spoken. No buzzwords.",
    ),
});

const SYSTEM = `You are "Nokta Expert" — a senior VC partner doing a one-on-one chat review of a founder's pitch and questions.

Voice: direct, warm, brutally honest when needed, never preachy. Talk like a person, not a brochure.
Rules:
- Reply in the SAME language the user wrote in (Turkish, English, etc.). Default Turkish if unclear.
- Keep replies SHORT: at most 3 short paragraphs. Often 1–2 sentences is enough.
- Ask ONE sharp follow-up question when something is vague or missing.
- Call out slop (buzzwords, unverifiable numbers, "no competition", vague TAM) gently but clearly.
- When the founder shares a pitch, give concrete, actionable feedback — not generic praise.
- No markdown headers, no bullet lists unless truly needed. Conversational prose.`;

function buildContext(pitch: string | undefined, history: ChatMsg[], userMsg: string): string {
  const lines: string[] = [SYSTEM];
  if (pitch && pitch.trim().length > 0) {
    lines.push(`\n---\nFOUNDER'S LATEST PITCH ON RECORD:\n"""\n${pitch.trim()}\n"""\n`);
  }
  lines.push("---\nCONVERSATION SO FAR:");
  for (const m of history.slice(-12)) {
    lines.push(`${m.role === "user" ? "FOUNDER" : "EXPERT"}: ${m.text}`);
  }
  lines.push(`FOUNDER: ${userMsg}`);
  lines.push("\nReply now as EXPERT. Return ONLY the structured object.");
  return lines.join("\n");
}

export default function ExpertScreen() {
  const { analyses } = useAnalysisContext();
  const latestPitch = useMemo<string>(() => analyses[0]?.pitch ?? "", [analyses]);

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);
  const [hydrated, setHydrated] = useState<boolean>(false);
  const [voiceOn, setVoiceOn] = useState<boolean>(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [transcribing, setTranscribing] = useState<boolean>(false);
  const scrollRef = useRef<ScrollView | null>(null);
  const playerRef = useRef<{ play: () => void; stop: () => void } | null>(null);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recState = useAudioRecorderState(recorder);
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    AsyncStorage.getItem(VOICE_PREF_KEY).then((v) => {
      // Default ON — auto-read every expert reply. Stored "0" mutes.
      if (v === "0") setVoiceOn(false);
      else setVoiceOn(true);
    });
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") return;
    setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true }).catch(() => {});
  }, []);

  useEffect(() => {
    if (recState.isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      ).start();
    } else {
      pulse.stopAnimation();
      pulse.setValue(0);
    }
  }, [recState.isRecording, pulse]);

  const stopSpeaking = useCallback(() => {
    playerRef.current?.stop();
    playerRef.current = null;
    setSpeakingId(null);
  }, []);

  const speak = useCallback(async (msg: ChatMsg) => {
    stopSpeaking();
    const ctrl = await speakReply(
      msg.text,
      () => {
        // Audio actually started — sync mouth animation with sound
        setSpeakingId((cur) => (cur === msg.id ? cur : msg.id));
      },
      () => {
        playerRef.current = null;
        setSpeakingId((cur) => (cur === msg.id ? null : cur));
      },
    );
    if (!ctrl) {
      return;
    }
    playerRef.current = ctrl;
    ctrl.play();
  }, [stopSpeaking]);

  useEffect(() => {
    return () => {
      playerRef.current?.stop();
      playerRef.current = null;
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(CHAT_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as ChatMsg[];
          const isLegacyIntroOnly =
            Array.isArray(parsed) &&
            parsed.length === 1 &&
            parsed[0]?.role === "expert" &&
            typeof parsed[0]?.text === "string" &&
            parsed[0].text.startsWith("Sıfırdan başlayalım");
          if (Array.isArray(parsed) && parsed.length > 0 && !isLegacyIntroOnly) {
            setMessages(parsed);
            setHydrated(true);
            return;
          }
          if (isLegacyIntroOnly) {
            await AsyncStorage.removeItem(CHAT_KEY).catch(() => {});
          }
        }
      } catch (e) {
        console.log("[Nokta] chat load error", e);
      }
      const intro = latestPitch
        ? "Merhaba, ben Nokta Uzmanı. Son pitch'ini okudum. İstersen onun üzerinden konuşalım — en çok hangi konuda kafan karışık?"
        : "Merhaba, ben Nokta Uzmanı. Bir kıdemli yatırımcı gibi düşün. Pitch'ini, fikrini ya da takıldığın bir soruyu yaz — birlikte üstünden geçelim.";
      setMessages([
        { id: `intro-${Date.now()}`, role: "expert", text: intro, ts: Date.now() },
      ]);
      setHydrated(true);
    })();
  }, [latestPitch]);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(CHAT_KEY, JSON.stringify(messages.slice(-MAX_TURNS * 2))).catch(() => {});
  }, [messages, hydrated]);

  useEffect(() => {
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
    return () => clearTimeout(t);
  }, [messages, sending]);

  const sendText = useCallback(async (text: string) => {
    if (text.length === 0 || sending) return;
    setSending(true);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    const userMsg: ChatMsg = {
      id: `u-${Date.now()}`,
      role: "user",
      text,
      ts: Date.now(),
    };
    const history = [...messages, userMsg];
    setMessages(history);

    try {
      const result = await generateObject({
        messages: [{ role: "user", content: buildContext(latestPitch, messages, text) }],
        schema: replySchema,
      });
      const reply: ChatMsg = {
        id: `e-${Date.now()}`,
        role: "expert",
        text: result.reply.trim(),
        ts: Date.now(),
      };
      setMessages((prev) => [...prev, reply]);
      if (voiceOn) {
        speak(reply).catch(() => {});
      }
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    } catch (e) {
      console.log("[Nokta] expert chat error", e);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "expert",
          text: "// bağlantı hatası. bir saniye sonra tekrar dener misin?",
          ts: Date.now(),
        },
      ]);
    } finally {
      setSending(false);
    }
  }, [sending, messages, latestPitch, voiceOn, speak]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (text.length === 0) return;
    setInput("");
    await sendText(text);
  }, [input, sendText]);

  const toggleVoice = useCallback(() => {
    setVoiceOn((prev) => {
      const next = !prev;
      AsyncStorage.setItem(VOICE_PREF_KEY, next ? "1" : "0").catch(() => {});
      if (!next) {
        stopSpeaking();
      }
      if (Platform.OS !== "web") {
        Haptics.selectionAsync().catch(() => {});
      }
      return next;
    });
  }, [stopSpeaking]);

  const startRecording = useCallback(async () => {
    if (Platform.OS === "web") return;
    try {
      const perm = await AudioModule.requestRecordingPermissionsAsync();
      if (!perm.granted) {
        console.log("[Nokta] mic permission denied");
        return;
      }
      stopSpeaking();
      try {
        await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      } catch (e) {
        console.log("[Nokta] mic audio mode error", e);
      }
      // Give iOS a moment to switch the audio session category before prepare.
      await new Promise((r) => setTimeout(r, 180));
      await recorder.prepareToRecordAsync();
      recorder.record();
      console.log("[Nokta] mic recording started");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    } catch (e) {
      console.log("[Nokta] mic start error", e);
    }
  }, [recorder, stopSpeaking]);

  const stopRecording = useCallback(async () => {
    try {
      await recorder.stop();
      // Give the OS more time to flush the file before we read uri/upload.
      await new Promise((r) => setTimeout(r, 350));
      const uri = recorder.uri;
      console.log("[Nokta] mic stopped, uri=", uri);
      // Keep allowsRecording: true between sessions; speakReply will toggle it off
      // right before playback. This avoids iOS audio-session race on the next mic press.
      if (!uri) {
        console.log("[Nokta] mic stop: no uri");
        setMessages((prev) => [
          ...prev,
          {
            id: `stt-err-${Date.now()}`,
            role: "expert",
            text: "// kayıt yapılamadı. mikrofon izinlerini kontrol edip tekrar dener misin?",
            ts: Date.now(),
          },
        ]);
        return;
      }
      setTranscribing(true);
      const text = await transcribeAudio(uri);
      setTranscribing(false);
      if (text && text.length > 0) {
        await sendText(text);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `stt-err-${Date.now()}`,
            role: "expert",
            text: "// seni duyamadım. tekrar dener misin? biraz daha uzun konuşmayı dene.",
            ts: Date.now(),
          },
        ]);
      }
    } catch (e) {
      setTranscribing(false);
      console.log("[Nokta] mic stop error", e);
    }
  }, [recorder, sendText]);

  const reset = useCallback(async () => {
    setMessages([]);
    setHydrated(false);
    await AsyncStorage.removeItem(CHAT_KEY).catch(() => {});
    setTimeout(() => setHydrated(false), 0);
    const intro = latestPitch
      ? "Merhaba, ben Nokta Uzmanı. Son pitch'ini okudum. İstersen onun üzerinden konuşalım — en çok hangi konuda kafan karışık?"
      : "Merhaba, ben Nokta Uzmanı. Bir kıdemli yatırımcı gibi düşün. Pitch'ini, fikrini ya da takıldığın bir soruyu yaz — birlikte üstünden geçelim.";
    setMessages([{ id: `intro-${Date.now()}`, role: "expert", text: intro, ts: Date.now() }]);
    setHydrated(true);
  }, [latestPitch]);

  return (
    <View style={styles.root} testID="expert-screen">
      <Stack.Screen
        options={{
          title: "EXPERT CHAT",
          headerTitleStyle: { color: theme.text, fontFamily: monoFont, fontSize: 13 },
          headerRight: () => (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Pressable
                onPress={toggleVoice}
                hitSlop={10}
                style={{ paddingHorizontal: 8 }}
                testID="expert-voice-toggle"
              >
                {voiceOn ? (
                  <Volume2 size={16} color={theme.accent} />
                ) : (
                  <VolumeX size={16} color={theme.textDim} />
                )}
              </Pressable>
              <Pressable
                onPress={reset}
                hitSlop={10}
                style={{ paddingHorizontal: 8 }}
                testID="expert-reset"
              >
                <Trash2 size={16} color={theme.textDim} />
              </Pressable>
            </View>
          ),
        }}
      />
      <GridBackground />
      <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <View style={styles.hero}>
            <View style={styles.heroBotWrap}>
              <NoktaBot
                state={(recState.isRecording
                  ? "listening"
                  : sending || transcribing
                  ? "thinking"
                  : speakingId
                  ? "speaking"
                  : "idle") as BotState}
                size={150}
                testID="nokta-bot"
              />
              <View style={styles.heroStatusRow}>
                <View style={styles.statusDot} />
                <Text style={styles.heroStatusText}>
                  {recState.isRecording
                    ? "DİNLİYORUM"
                    : sending || transcribing
                    ? "DÜŞÜNÜYOR"
                    : speakingId
                    ? "KONUŞUYOR"
                    : "HAZIR"}
                </Text>
              </View>
            </View>
          </View>

          <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((m) => (
              <View
                key={m.id}
                style={[
                  styles.bubbleRow,
                  m.role === "user" ? styles.rowEnd : styles.rowStart,
                ]}
              >
                {m.role === "expert" && (
                  <View style={styles.avatar}>
                    <Sparkles size={11} color={theme.accent} />
                  </View>
                )}
                <View
                  style={[
                    styles.bubble,
                    m.role === "user" ? styles.userBubble : styles.expertBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.bubbleText,
                      m.role === "user" ? styles.userText : styles.expertText,
                    ]}
                  >
                    {m.text}
                  </Text>
                  {m.role === "expert" && Platform.OS !== "web" && (
                    <Pressable
                      onPress={() => (speakingId === m.id ? stopSpeaking() : speak(m))}
                      style={styles.speakBtn}
                      hitSlop={8}
                      testID={`expert-speak-${m.id}`}
                    >
                      {speakingId === m.id ? (
                        <Square size={11} color={theme.accent} fill={theme.accent} />
                      ) : (
                        <Volume2 size={11} color={theme.textDim} />
                      )}
                      <Text style={styles.speakBtnText}>
                        {speakingId === m.id ? "durdur" : "dinle"}
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>
            ))}
            {sending && (
              <View style={[styles.bubbleRow, styles.rowStart]}>
                <View style={styles.avatar}>
                  <Sparkles size={11} color={theme.accent} />
                </View>
                <View style={[styles.bubble, styles.expertBubble, styles.typingBubble]}>
                  <ActivityIndicator size="small" color={theme.accent} />
                  <Text style={styles.typingText}>düşünüyor...</Text>
                </View>
              </View>
            )}
            <View style={{ height: 12 }} />
          </ScrollView>

          {recState.isRecording ? (
            <View style={styles.inputBar}>
              <View style={styles.recordingPill}>
                <Animated.View
                  style={[
                    styles.recordingDot,
                    {
                      opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }),
                      transform: [
                        { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.25] }) },
                      ],
                    },
                  ]}
                />
                <Text style={styles.recordingText}>// dinliyorum...</Text>
              </View>
              <Pressable onPress={stopRecording} style={styles.stopBtn} testID="expert-stop-rec">
                <Square size={14} color="#000" fill="#000" />
              </Pressable>
            </View>
          ) : transcribing ? (
            <View style={styles.inputBar}>
              <View style={styles.recordingPill}>
                <ActivityIndicator size="small" color={theme.accent} />
                <Text style={styles.recordingText}>// yazıya çevriliyor...</Text>
              </View>
            </View>
          ) : (
            <View style={styles.inputBar}>
              {Platform.OS !== "web" && (
                <Pressable
                  onPress={startRecording}
                  disabled={sending}
                  style={[styles.micBtn, sending && styles.micBtnDisabled]}
                  testID="expert-mic"
                  hitSlop={6}
                >
                  <Mic size={16} color={sending ? theme.textFaint : theme.accent} />
                </Pressable>
              )}
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="// uzmanla konuş..."
                placeholderTextColor={theme.textFaint}
                style={styles.input}
                multiline
                editable={!sending}
                testID="expert-input"
              />
              <Pressable
                onPress={send}
                disabled={sending || input.trim().length === 0}
                style={[
                  styles.sendBtn,
                  (sending || input.trim().length === 0) && styles.sendBtnDisabled,
                ]}
                testID="expert-send"
              >
                <Send size={16} color={sending || input.trim().length === 0 ? theme.textFaint : "#000"} />
              </Pressable>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  hero: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 18,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.bgElevated,
  },
  heroBotWrap: { alignItems: "center", justifyContent: "center" },
  heroStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.bgCard,
  },
  heroStatusText: {
    color: theme.textDim,
    fontFamily: monoFont,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "700",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.accent,
    shadowColor: theme.accent,
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  scroll: { paddingHorizontal: 14, paddingTop: 16, paddingBottom: 8 },
  bubbleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 10,
    maxWidth: "100%",
  },
  rowStart: { justifyContent: "flex-start" },
  rowEnd: { justifyContent: "flex-end" },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.bgCard,
    alignItems: "center",
    justifyContent: "center",
  },
  bubble: {
    maxWidth: "82%",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  expertBubble: {
    backgroundColor: theme.bgCard,
    borderColor: theme.border,
    borderBottomLeftRadius: 3,
  },
  userBubble: {
    backgroundColor: "rgba(0,255,136,0.12)",
    borderColor: theme.accent,
    borderBottomRightRadius: 3,
  },
  bubbleText: { fontFamily: monoFont, fontSize: 13, lineHeight: 19 },
  expertText: { color: theme.text },
  userText: { color: theme.text },
  typingBubble: { flexDirection: "row", alignItems: "center", gap: 8 },
  typingText: { color: theme.textDim, fontFamily: monoFont, fontSize: 11 },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    backgroundColor: theme.bgElevated,
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.bgCard,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: theme.text,
    fontFamily: monoFont,
    fontSize: 13,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: theme.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { backgroundColor: theme.bgCard, borderWidth: 1, borderColor: theme.border },
  micBtn: {
    width: 42,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.accent,
    backgroundColor: theme.bgCard,
    alignItems: "center",
    justifyContent: "center",
  },
  micBtnDisabled: { borderColor: theme.border },
  recordingPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 42,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.accent,
    backgroundColor: "rgba(0,255,136,0.08)",
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.accent,
    shadowColor: theme.accent,
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  recordingText: { color: theme.text, fontFamily: monoFont, fontSize: 12, letterSpacing: 1 },
  stopBtn: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: theme.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  speakBtn: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.bgElevated,
  },
  speakBtnText: {
    color: theme.textDim,
    fontFamily: monoFont,
    fontSize: 10,
    letterSpacing: 1,
  },
});
