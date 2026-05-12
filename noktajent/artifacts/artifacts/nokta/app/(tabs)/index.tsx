import React, { useState } from "react";
import {
  Animated,
  FlatList,
  Keyboard,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { useTasks } from "@/contexts/TasksContext";
import { useAgenda } from "@/contexts/AgendaContext";
import { useHistory } from "@/contexts/HistoryContext";
import { usePlugins } from "@/contexts/PluginsContext";

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface IdeaCard {
  id: string;
  text: string;
}

function normalise(line: string, caseSensitive: boolean): string {
  const s = caseSensitive ? line : line.toLowerCase();
  return s.replace(/^[-*•·→✦▸◆►\s]+/, "").replace(/\s+/g, " ").trim();
}

function processText(raw: string, caseSensitive: boolean, stripEmojis: boolean): IdeaCard[] {
  const lines = raw.split("\n");
  const seen = new Set<string>();
  const results: IdeaCard[] = [];
  lines.forEach((line) => {
    let trimmed = line.trim();
    if (!trimmed) return;
    if (stripEmojis) { trimmed = trimmed.replace(/\p{Emoji}/gu, "").trim(); if (!trimmed) return; }
    const key = normalise(trimmed, caseSensitive);
    if (!key || seen.has(key)) return;
    seen.add(key);
    results.push({ id: `${Date.now()}-${results.length}`, text: trimmed });
  });
  return results;
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const { tasks } = useTasks();
  const { getEventsForDate } = useAgenda();
  const { history, saveEntry } = useHistory();
  const { plugins } = usePlugins();
  const insets = useSafeAreaInsets();
  const webTopPad = Platform.OS === "web" ? 67 : 0;
  const today = toDateStr(new Date());
  const todayEvents = getEventsForDate(today);
  const todayTasks = tasks.filter((t) => t.status !== "done" && t.dueDate === today);
  const urgentTasks = tasks.filter((t) => t.status !== "done" && t.priority === "urgent");
  const totalActive = tasks.filter((t) => t.status !== "done").length;

  const [screen, setScreen] = useState<"dashboard" | "processor">("dashboard");
  const [inputText, setInputText] = useState("");
  const [ideas, setIdeas] = useState<IdeaCard[]>([]);
  const [processed, setProcessed] = useState<"idle" | "result">("idle");
  const [duplicatesRemoved, setDuplicatesRemoved] = useState(0);
  const [copied, setCopied] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const weekday = new Date().toLocaleDateString("tr-TR", { weekday: "long" });
  const dateStr = new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long" });

  function handleProcess() {
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const rawLines = inputText.split("\n").filter((l) => l.trim());
    let result = processText(inputText, plugins.caseSensitive, plugins.stripEmojis);
    if (plugins.sortAlphabetically) result = [...result].sort((a, b) => a.text.localeCompare(b.text));
    setDuplicatesRemoved(rawLines.length - result.length);
    setIdeas(result);
    setProcessed("result");
    if (plugins.autoCopyToClipboard) Clipboard.setStringAsync(result.map((r) => r.text).join("\n"));
    saveEntry({ title: result[0]?.text.substring(0, 40) || "Not", rawText: inputText, ideas: result.map((r) => r.text), duplicatesRemoved: rawLines.length - result.length, tags });
  }

  async function handleCopy() {
    await Clipboard.setStringAsync(ideas.map((i) => i.text).join("\n"));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function resetProcessor() {
    setProcessed("idle"); setIdeas([]); setInputText(""); setDuplicatesRemoved(0); setTags([]); setTagInput("");
  }

  if (screen === "processor") {
    return (
      <View style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={[styles.procHeader, { borderBottomColor: colors.border, paddingTop: webTopPad }]}>
          <TouchableOpacity onPress={() => { setScreen("dashboard"); resetProcessor(); }} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.procHeaderTitle, { color: colors.foreground }]}>
            {processed === "result" ? "Sonuçlar" : "Not Temizleyici"}
          </Text>
          {processed === "result" && (
            <TouchableOpacity onPress={handleCopy}>
              <Feather name="copy" size={18} color={copied ? colors.tint : colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>

        {processed === "idle" ? (
          <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 120 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <TextInput
              style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground }]}
              multiline
              placeholder={"- süt al\n- Süt Al\n- dişçi ara\n• dişçi ara\n→ raporu bitir"}
              placeholderTextColor={colors.placeholder}
              value={inputText}
              onChangeText={setInputText}
              textAlignVertical="top"
              autoCorrect={false}
              autoCapitalize="none"
              autoFocus
            />
            {plugins.tagSuggestions && (
              <View>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                  {tags.map((t) => (
                    <TouchableOpacity key={t} style={[styles.tag, { backgroundColor: colors.accent }]} onPress={() => setTags(tags.filter((x) => x !== t))}>
                      <Text style={[styles.tagText, { color: colors.accentForeground }]}>{t} ×</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={[styles.tagInputRow, { borderColor: colors.border }]}>
                  <TextInput style={[styles.tagInput, { color: colors.foreground }]} placeholder="etiket..." placeholderTextColor={colors.placeholder} value={tagInput} onChangeText={setTagInput} onSubmitEditing={() => { if (tagInput.trim() && !tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]); setTagInput(""); }} returnKeyType="done" />
                </View>
              </View>
            )}
            <TouchableOpacity style={[styles.processBtn, { backgroundColor: !inputText.trim() ? colors.muted : colors.primary }]} onPress={handleProcess} disabled={!inputText.trim()} activeOpacity={0.8}>
              <Text style={[styles.processBtnText, { color: !inputText.trim() ? colors.mutedForeground : colors.primaryForeground }]}>Temizle & İşle →</Text>
            </TouchableOpacity>
            <Text style={[styles.hint, { color: colors.placeholder }]}>Madde listeleri · WhatsApp · Düz metin</Text>
          </ScrollView>
        ) : (
          <View style={{ flex: 1 }}>
            <View style={[styles.resultStats, { backgroundColor: colors.secondary }]}>
              <View style={styles.stat}><Text style={[styles.statNum, { color: colors.tint }]}>{ideas.length}</Text><Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Tekil</Text></View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.stat}><Text style={[styles.statNum, { color: colors.destructive }]}>{duplicatesRemoved}</Text><Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Silindi</Text></View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.stat}><Text style={[styles.statNum, { color: colors.foreground }]}>{ideas.length + duplicatesRemoved}</Text><Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Toplam</Text></View>
            </View>
            <FlatList
              data={ideas}
              keyExtractor={(i) => i.id}
              renderItem={({ item, index }) => (
                <View style={[styles.ideaCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  {plugins.showLineNumbers && <View style={[styles.idxBadge, { backgroundColor: colors.secondary }]}><Text style={[styles.idxText, { color: colors.mutedForeground }]}>{index + 1}</Text></View>}
                  <Text style={[styles.ideaText, { color: colors.foreground }]}>{item.text}</Text>
                </View>
              )}
              contentContainerStyle={{ padding: 16, gap: 8, paddingBottom: insets.bottom + 100 + (Platform.OS === "web" ? 34 : 0) }}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={[styles.dashHeader, { paddingTop: webTopPad }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>{weekday}</Text>
          <Text style={[styles.dateLabel, { color: colors.foreground }]}>{dateStr}</Text>
        </View>
        <TouchableOpacity onPress={() => router.push("/settings")} style={[styles.settingsBtn, { backgroundColor: colors.secondary }]}>
          <Feather name="settings" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 110 + (Platform.OS === "web" ? 34 : 0), gap: 16, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
        scrollEnabled
      >
        <View style={styles.statsRow}>
          {[
            { label: "Aktif Görev", value: totalActive, icon: "check-square" as const, color: colors.tint },
            { label: "Bugünün Görevi", value: todayTasks.length, icon: "clock" as const, color: "#f59e0b" },
            { label: "Acil", value: urgentTasks.length, icon: "alert-circle" as const, color: "#ef4444" },
          ].map((s) => (
            <TouchableOpacity key={s.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push("/(tabs)/tasks")}>
              <Feather name={s.icon} size={20} color={s.color} />
              <Text style={[styles.statCardNum, { color: colors.foreground }]}>{s.value}</Text>
              <Text style={[styles.statCardLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {todayEvents.length > 0 && (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Bugünün Etkinlikleri</Text>
            {todayEvents.map((ev) => (
              <TouchableOpacity key={ev.id} style={[styles.eventCard, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: ev.color }]} onPress={() => router.push("/(tabs)/agenda")}>
                <View>
                  {ev.startTime && <Text style={[styles.eventTime, { color: colors.mutedForeground }]}>{ev.startTime}</Text>}
                  <Text style={[styles.eventTitle, { color: colors.foreground }]}>{ev.title}</Text>
                </View>
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {urgentTasks.length > 0 && (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>🔥 Acil Görevler</Text>
            {urgentTasks.slice(0, 3).map((task) => (
              <TouchableOpacity key={task.id} style={[styles.taskQuick, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push("/(tabs)/tasks")}>
                <View style={[styles.urgentDot, { backgroundColor: "#ef4444" }]} />
                <Text style={[styles.taskQuickTitle, { color: colors.foreground }]} numberOfLines={1}>{task.title}</Text>
                <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Hızlı Erişim</Text>
          <View style={styles.quickGrid}>
            {[
              { label: "Yeni Görev", icon: "plus-square" as const, color: colors.tint, onPress: () => router.push("/(tabs)/tasks") },
              { label: "AI Planlayıcı", icon: "zap" as const, color: "#f59e0b", onPress: () => router.push("/(tabs)/ai") },
              { label: "Not Temizle", icon: "scissors" as const, color: "#8b5cf6", onPress: () => setScreen("processor") },
              { label: "Destek", icon: "message-circle" as const, color: "#22c55e", onPress: () => router.push("/(tabs)/support") },
            ].map((q) => (
              <TouchableOpacity key={q.label} style={[styles.quickCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={q.onPress} activeOpacity={0.8}>
                <View style={[styles.quickIcon, { backgroundColor: q.color + "20" }]}>
                  <Feather name={q.icon} size={20} color={q.color} />
                </View>
                <Text style={[styles.quickLabel, { color: colors.foreground }]}>{q.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {history.length > 0 && (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Son Notlar</Text>
            {history.slice(0, 3).map((h) => (
              <View key={h.id} style={[styles.historyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.historyTitle, { color: colors.foreground }]} numberOfLines={1}>{h.title}</Text>
                <Text style={[styles.historyMeta, { color: colors.mutedForeground }]}>{h.ideas.length} fikir · {new Date(h.createdAt).toLocaleDateString("tr-TR")}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={[styles.aiPromo, { backgroundColor: colors.primary }]}>
          <Text style={[styles.aiPromoTitle, { color: colors.primaryForeground }]}>✨ AI Ajanları</Text>
          <Text style={[styles.aiPromoDesc, { color: colors.primaryForeground, opacity: 0.8 }]}>Fikrinden plana, mimariden koda — 7 uzman ajan hizmetinizde</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/ai")} style={[styles.aiPromoBtn, { backgroundColor: colors.primaryForeground }]}>
            <Text style={[styles.aiPromoBtnText, { color: colors.primary }]}>Başlat →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  dashHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16 },
  greeting: { fontSize: 13, fontWeight: "500", textTransform: "capitalize" },
  dateLabel: { fontSize: 22, fontWeight: "700", letterSpacing: -0.5, marginTop: 2 },
  settingsBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 14, alignItems: "center", gap: 6 },
  statCardNum: { fontSize: 22, fontWeight: "800", letterSpacing: -1 },
  statCardLabel: { fontSize: 10, fontWeight: "500", textAlign: "center" },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
  eventCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderRadius: 12, borderWidth: 1, borderLeftWidth: 4, padding: 12, marginBottom: 8 },
  eventTime: { fontSize: 11, fontWeight: "500", marginBottom: 2 },
  eventTitle: { fontSize: 14, fontWeight: "600" },
  taskQuick: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 10, borderWidth: 1, padding: 12, marginBottom: 6 },
  urgentDot: { width: 8, height: 8, borderRadius: 4 },
  taskQuickTitle: { flex: 1, fontSize: 14, fontWeight: "500" },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  quickCard: { width: "47%", borderRadius: 14, borderWidth: 1, padding: 16, gap: 10 },
  quickIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  quickLabel: { fontSize: 14, fontWeight: "600" },
  historyCard: { borderRadius: 10, borderWidth: 1, padding: 12, marginBottom: 6 },
  historyTitle: { fontSize: 14, fontWeight: "600" },
  historyMeta: { fontSize: 12, marginTop: 2 },
  aiPromo: { borderRadius: 16, padding: 20, gap: 8 },
  aiPromoTitle: { fontSize: 18, fontWeight: "800" },
  aiPromoDesc: { fontSize: 13, lineHeight: 20 },
  aiPromoBtn: { alignSelf: "flex-start", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, marginTop: 4 },
  aiPromoBtnText: { fontSize: 14, fontWeight: "700" },
  procHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  procHeaderTitle: { fontSize: 17, fontWeight: "600" },
  input: { borderWidth: 1.5, borderRadius: 14, padding: 16, fontSize: 15, lineHeight: 22, fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace", minHeight: 200, maxHeight: 300 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  tagText: { fontSize: 12, fontWeight: "500" },
  tagInputRow: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, height: 38, justifyContent: "center" },
  tagInput: { fontSize: 13 },
  processBtn: { borderRadius: 12, paddingVertical: 15, alignItems: "center" },
  processBtnText: { fontSize: 16, fontWeight: "600" },
  hint: { textAlign: "center", fontSize: 12 },
  resultStats: { flexDirection: "row", paddingVertical: 14, marginHorizontal: 16, borderRadius: 14, marginBottom: 4 },
  stat: { flex: 1, alignItems: "center" },
  statNum: { fontSize: 26, fontWeight: "800", letterSpacing: -1 },
  statLabel: { fontSize: 11, marginTop: 2 },
  statDivider: { width: 1 },
  ideaCard: { borderRadius: 12, borderWidth: 1, padding: 14, flexDirection: "row", alignItems: "flex-start", gap: 10 },
  idxBadge: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  idxText: { fontSize: 10, fontWeight: "700" },
  ideaText: { flex: 1, fontSize: 15, lineHeight: 22 },
});
