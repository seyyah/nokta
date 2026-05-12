import React, { useState } from "react";
import {
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
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { type AgendaEvent, useAgenda } from "@/contexts/AgendaContext";
import { useTasks } from "@/contexts/TasksContext";

const DAYS_TR = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
const MONTHS_TR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

const EVENT_COLORS = ["#ef4444", "#f97316", "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6"];

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function AddEventModal({ visible, onClose, selectedDate, colors }: {
  visible: boolean;
  onClose: () => void;
  selectedDate: string;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  const { addEvent } = useAgenda();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [startTime, setStartTime] = useState("");
  const [color, setColor] = useState(EVENT_COLORS[0]!);

  function handleSave() {
    if (!title.trim()) return;
    addEvent({ title: title.trim(), description: desc, date: selectedDate, startTime: startTime || undefined, color, isRecurring: false });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTitle(""); setDesc(""); setStartTime(""); setColor(EVENT_COLORS[0]!);
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.modal, { backgroundColor: colors.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.modalClose, { color: colors.foreground }]}>✕</Text>
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: colors.foreground }]}>Yeni Etkinlik</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={[styles.modalSave, { color: colors.tint }]}>Ekle</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }} keyboardShouldPersistTaps="handled">
          <View style={[styles.dateBadge, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.dateBadgeText, { color: colors.foreground }]}>{selectedDate}</Text>
          </View>
          <TextInput style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground }]} placeholder="Etkinlik başlığı" placeholderTextColor={colors.placeholder} value={title} onChangeText={setTitle} autoFocus />
          <TextInput style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground }]} placeholder="Saat (ÖR: 14:30)" placeholderTextColor={colors.placeholder} value={startTime} onChangeText={setStartTime} />
          <TextInput style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground, minHeight: 70, textAlignVertical: "top" }]} placeholder="Notlar" placeholderTextColor={colors.placeholder} value={desc} onChangeText={setDesc} multiline />
          <Text style={[styles.colorLabel, { color: colors.mutedForeground }]}>Renk</Text>
          <View style={styles.colorRow}>
            {EVENT_COLORS.map((c) => (
              <TouchableOpacity key={c} style={[styles.colorDot, { backgroundColor: c, borderWidth: color === c ? 3 : 0, borderColor: colors.foreground }]} onPress={() => setColor(c)} />
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function AgendaScreen() {
  const { colors } = useTheme();
  const { getEventsForDate, getEventsForMonth, deleteEvent } = useAgenda();
  const { tasks } = useTasks();
  const insets = useSafeAreaInsets();
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(toDateStr(new Date()));
  const [showAdd, setShowAdd] = useState(false);
  const webTopPad = Platform.OS === "web" ? 67 : 0;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = toDateStr(new Date());
  const monthEvents = getEventsForMonth(year, month);

  function prevMonth() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentDate(new Date(year, month - 1, 1));
  }
  function nextMonth() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentDate(new Date(year, month + 1, 1));
  }

  const selectedEvents = getEventsForDate(selectedDate);
  const selectedTasks = tasks.filter((t) => t.dueDate === selectedDate && t.status !== "done");

  return (
    <View style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: webTopPad }]}>
        <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
          <Feather name="chevron-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.monthLabel, { color: colors.foreground }]}>
          {MONTHS_TR[month]} {year}
        </Text>
        <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
          <Feather name="chevron-right" size={22} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
        scrollEnabled
      >
        <View style={styles.calendar}>
          <View style={styles.weekHeader}>
            {DAYS_TR.map((d) => (
              <Text key={d} style={[styles.weekDay, { color: colors.mutedForeground }]}>{d}</Text>
            ))}
          </View>
          <View style={styles.grid}>
            {Array.from({ length: firstDay }).map((_, i) => (
              <View key={`empty-${i}`} style={styles.dayCell} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isToday = dateStr === today;
              const isSelected = dateStr === selectedDate;
              const hasEvents = !!monthEvents[dateStr];
              const dayTasks = tasks.filter((t) => t.dueDate === dateStr);

              return (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayCell,
                    isSelected && { backgroundColor: colors.tint },
                    !isSelected && isToday && { backgroundColor: colors.secondary },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedDate(dateStr);
                  }}
                >
                  <Text style={[styles.dayNum, { color: isSelected ? colors.primaryForeground : isToday ? colors.tint : colors.foreground, fontWeight: isToday || isSelected ? "700" : "400" }]}>
                    {day}
                  </Text>
                  <View style={styles.daydots}>
                    {hasEvents && <View style={[styles.dot, { backgroundColor: isSelected ? colors.primaryForeground : colors.tint }]} />}
                    {dayTasks.length > 0 && <View style={[styles.dot, { backgroundColor: isSelected ? colors.primaryForeground : "#f59e0b" }]} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={[styles.dayDetail, { borderTopColor: colors.border }]}>
          <View style={styles.dayDetailHeader}>
            <Text style={[styles.dayDetailTitle, { color: colors.foreground }]}>
              {new Date(selectedDate + "T00:00:00").toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" })}
            </Text>
            <TouchableOpacity style={[styles.addEventBtn, { backgroundColor: colors.primary }]} onPress={() => setShowAdd(true)}>
              <Feather name="plus" size={16} color={colors.primaryForeground} />
            </TouchableOpacity>
          </View>

          {selectedEvents.length === 0 && selectedTasks.length === 0 && (
            <View style={styles.emptyDay}>
              <Text style={[styles.emptyDayText, { color: colors.mutedForeground }]}>Bu gün için etkinlik yok</Text>
            </View>
          )}

          {selectedEvents.map((event) => (
            <View key={event.id} style={[styles.eventItem, { backgroundColor: colors.card, borderLeftColor: event.color }]}>
              <View style={styles.eventContent}>
                {event.startTime && <Text style={[styles.eventTime, { color: colors.mutedForeground }]}>{event.startTime}</Text>}
                <Text style={[styles.eventTitle, { color: colors.foreground }]}>{event.title}</Text>
                {event.description ? <Text style={[styles.eventDesc, { color: colors.mutedForeground }]}>{event.description}</Text> : null}
              </View>
              <TouchableOpacity onPress={() => deleteEvent(event.id)} style={styles.deleteEventBtn}>
                <Feather name="x" size={14} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          ))}

          {selectedTasks.map((task) => (
            <View key={task.id} style={[styles.eventItem, { backgroundColor: colors.card, borderLeftColor: "#f59e0b" }]}>
              <Text style={{ fontSize: 12 }}>⚡</Text>
              <Text style={[styles.eventTitle, { color: colors.foreground }]} numberOfLines={1}>{task.title}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <AddEventModal visible={showAdd} onClose={() => setShowAdd(false)} selectedDate={selectedDate} colors={colors} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  navBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  monthLabel: { fontSize: 18, fontWeight: "700", letterSpacing: -0.3 },
  calendar: { paddingHorizontal: 12, paddingTop: 12 },
  weekHeader: { flexDirection: "row", marginBottom: 8 },
  weekDay: { flex: 1, textAlign: "center", fontSize: 11, fontWeight: "600", letterSpacing: 0.3 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  dayCell: { width: `${100 / 7}%` as `${number}%`, aspectRatio: 1, alignItems: "center", justifyContent: "center", borderRadius: 10, marginVertical: 1 },
  dayNum: { fontSize: 14 },
  daydots: { flexDirection: "row", gap: 2, marginTop: 2 },
  dot: { width: 4, height: 4, borderRadius: 2 },
  dayDetail: { borderTopWidth: 1, paddingHorizontal: 16, paddingTop: 16, marginTop: 8 },
  dayDetailHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  dayDetailTitle: { fontSize: 15, fontWeight: "600" },
  addEventBtn: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  emptyDay: { paddingVertical: 20, alignItems: "center" },
  emptyDayText: { fontSize: 14 },
  eventItem: { flexDirection: "row", alignItems: "center", borderRadius: 10, borderLeftWidth: 4, padding: 12, marginBottom: 8, gap: 10 },
  eventContent: { flex: 1, gap: 2 },
  eventTime: { fontSize: 11, fontWeight: "500" },
  eventTitle: { fontSize: 14, fontWeight: "600" },
  eventDesc: { fontSize: 12 },
  deleteEventBtn: { padding: 4 },
  modal: { flex: 1 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  modalClose: { fontSize: 18, fontWeight: "500", width: 36, textAlign: "center" },
  modalTitle: { flex: 1, fontSize: 17, fontWeight: "600", textAlign: "center" },
  modalSave: { fontSize: 16, fontWeight: "600", width: 50, textAlign: "right" },
  dateBadge: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  dateBadgeText: { fontSize: 14, fontWeight: "600" },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15 },
  colorLabel: { fontSize: 12, fontWeight: "600", textTransform: "uppercase" },
  colorRow: { flexDirection: "row", gap: 10 },
  colorDot: { width: 30, height: 30, borderRadius: 15 },
});
