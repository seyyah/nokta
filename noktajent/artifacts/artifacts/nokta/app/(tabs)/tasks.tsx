import React, { useState } from "react";
import {
  Alert,
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
import { type Task, type TaskPriority, type TaskStatus, useTasks } from "@/contexts/TasksContext";

const COLUMNS: { id: TaskStatus; label: string; emoji: string }[] = [
  { id: "todo", label: "Yapılacak", emoji: "📋" },
  { id: "in_progress", label: "Devam Eden", emoji: "⚡" },
  { id: "review", label: "İnceleme", emoji: "👁" },
  { id: "completed", label: "Tamamlandı", emoji: "✅" },
];

const PRIORITIES: { id: TaskPriority; label: string; color: string }[] = [
  { id: "low", label: "Düşük", color: "#22c55e" },
  { id: "medium", label: "Orta", color: "#f59e0b" },
  { id: "high", label: "Yüksek", color: "#f97316" },
  { id: "urgent", label: "Acil", color: "#ef4444" },
];

function getPriorityColor(p: TaskPriority): string {
  return PRIORITIES.find((x) => x.id === p)?.color ?? "#888";
}

function TaskCard({ task, colors, onPress, onMove }: {
  task: Task;
  colors: ReturnType<typeof useTheme>["colors"];
  onPress: () => void;
  onMove: (status: TaskStatus) => void;
}) {
  const done = task.checklist.filter((c) => c.completed).length;
  const total = task.checklist.length;
  const progress = total > 0 ? done / total : 0;

  return (
    <TouchableOpacity
      style={[styles.taskCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.taskCardHeader}>
        <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(task.priority) }]} />
        <Text style={[styles.taskTitle, { color: colors.foreground }]} numberOfLines={2}>
          {task.title}
        </Text>
      </View>
      {task.description ? (
        <Text style={[styles.taskDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
          {task.description}
        </Text>
      ) : null}
      {total > 0 && (
        <View style={styles.progressRow}>
          <View style={[styles.progressBar, { backgroundColor: colors.secondary }]}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` as `${number}%`, backgroundColor: colors.tint }]} />
          </View>
          <Text style={[styles.progressText, { color: colors.mutedForeground }]}>{done}/{total}</Text>
        </View>
      )}
      <View style={styles.taskFooter}>
        <View style={styles.taskMeta}>
          {task.dueDate && (
            <View style={styles.metaItem}>
              <Feather name="calendar" size={10} color={colors.mutedForeground} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{task.dueDate}</Text>
            </View>
          )}
          {task.pomodoroCount > 0 && (
            <View style={styles.metaItem}>
              <Text style={styles.pomodoroIcon}>🍅</Text>
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{task.pomodoroCount}</Text>
            </View>
          )}
        </View>
        <View style={styles.moveActions}>
          {COLUMNS.filter((c) => c.id !== task.status).map((col) => (
            <TouchableOpacity
              key={col.id}
              style={[styles.moveBtn, { borderColor: colors.border }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onMove(col.id);
              }}
            >
              <Text style={styles.moveBtnEmoji}>{col.emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function TaskDetailModal({ task, visible, onClose, colors }: {
  task: Task | null;
  visible: boolean;
  onClose: () => void;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  const { updateTask, toggleChecklistItem, addChecklistItem, deleteTask } = useTasks();
  const [checkText, setCheckText] = useState("");

  if (!task) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.modalClose, { color: colors.foreground }]}>✕</Text>
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: colors.foreground }]} numberOfLines={1}>{task.title}</Text>
          <TouchableOpacity onPress={() => {
            Alert.alert("Sil", "Bu görevi silmek istiyor musunuz?", [
              { text: "İptal", style: "cancel" },
              { text: "Sil", style: "destructive", onPress: () => { deleteTask(task.id); onClose(); } },
            ]);
          }}>
            <Feather name="trash-2" size={18} color={colors.destructive} />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
          {task.description ? (
            <Text style={[styles.detailDesc, { color: colors.mutedForeground }]}>{task.description}</Text>
          ) : null}

          <View style={styles.detailMeta}>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) + "22" }]}>
              <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(task.priority) }]} />
              <Text style={[styles.priorityLabel, { color: getPriorityColor(task.priority) }]}>
                {PRIORITIES.find((p) => p.id === task.priority)?.label}
              </Text>
            </View>
            {task.dueDate && (
              <View style={[styles.dueDateBadge, { backgroundColor: colors.secondary }]}>
                <Feather name="calendar" size={12} color={colors.mutedForeground} />
                <Text style={[styles.dueDateText, { color: colors.mutedForeground }]}>{task.dueDate}</Text>
              </View>
            )}
            {task.pomodoroCount > 0 && (
              <View style={[styles.dueDateBadge, { backgroundColor: colors.secondary }]}>
                <Text>🍅</Text>
                <Text style={[styles.dueDateText, { color: colors.mutedForeground }]}>{task.pomodoroCount} pomodoro</Text>
              </View>
            )}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Kontrol Listesi</Text>
          {task.checklist.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.checkItem}
              onPress={() => toggleChecklistItem(task.id, item.id)}
            >
              <View style={[styles.checkbox, { borderColor: item.completed ? colors.tint : colors.border, backgroundColor: item.completed ? colors.tint : "transparent" }]}>
                {item.completed && <Feather name="check" size={10} color={colors.primaryForeground} />}
              </View>
              <Text style={[styles.checkText, { color: item.completed ? colors.mutedForeground : colors.foreground, textDecorationLine: item.completed ? "line-through" : "none" }]}>
                {item.text}
              </Text>
            </TouchableOpacity>
          ))}

          <View style={[styles.checkInputRow, { borderColor: colors.border }]}>
            <TextInput
              style={[styles.checkInput, { color: colors.foreground }]}
              placeholder="Madde ekle..."
              placeholderTextColor={colors.placeholder}
              value={checkText}
              onChangeText={setCheckText}
              returnKeyType="done"
              onSubmitEditing={() => {
                if (checkText.trim()) {
                  addChecklistItem(task.id, checkText.trim());
                  setCheckText("");
                }
              }}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

function AddTaskModal({ visible, onClose, colors }: {
  visible: boolean;
  onClose: () => void;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  const { addTask } = useTasks();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState("");

  function handleAdd() {
    if (!title.trim()) return;
    addTask({ title: title.trim(), description: desc.trim(), status: "todo", priority, tags: [], dueDate: dueDate || undefined });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTitle(""); setDesc(""); setPriority("medium"); setDueDate("");
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.modalClose, { color: colors.foreground }]}>✕</Text>
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: colors.foreground }]}>Yeni Görev</Text>
          <TouchableOpacity onPress={handleAdd}>
            <Text style={[styles.modalSave, { color: colors.tint }]}>Ekle</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, gap: 16 }} keyboardShouldPersistTaps="handled">
          <TextInput
            style={[styles.formInput, { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground }]}
            placeholder="Görev başlığı"
            placeholderTextColor={colors.placeholder}
            value={title}
            onChangeText={setTitle}
            autoFocus
          />
          <TextInput
            style={[styles.formInput, { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground, minHeight: 80, textAlignVertical: "top" }]}
            placeholder="Açıklama (isteğe bağlı)"
            placeholderTextColor={colors.placeholder}
            value={desc}
            onChangeText={setDesc}
            multiline
          />
          <View>
            <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>Öncelik</Text>
            <View style={styles.priorityRow}>
              {PRIORITIES.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.priorityOption, { borderColor: priority === p.id ? p.color : colors.border, backgroundColor: priority === p.id ? p.color + "22" : colors.card }]}
                  onPress={() => setPriority(p.id)}
                >
                  <Text style={[styles.priorityOptionText, { color: priority === p.id ? p.color : colors.mutedForeground }]}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <TextInput
            style={[styles.formInput, { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground }]}
            placeholder="Son tarih (GG.AA.YYYY)"
            placeholderTextColor={colors.placeholder}
            value={dueDate}
            onChangeText={setDueDate}
          />
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function TasksScreen() {
  const { colors } = useTheme();
  const { tasks, moveTask } = useTasks();
  const insets = useSafeAreaInsets();
  const [activeColumn, setActiveColumn] = useState<TaskStatus>("todo");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const webTopPad = Platform.OS === "web" ? 67 : 0;

  const columnTasks = tasks.filter((t) => t.status === activeColumn);

  return (
    <View style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: webTopPad }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Görevler</Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => setShowAdd(true)}
        >
          <Feather name="plus" size={18} color={colors.primaryForeground} />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.columnTabs} contentContainerStyle={styles.columnTabsContent}>
        {COLUMNS.map((col) => {
          const count = tasks.filter((t) => t.status === col.id).length;
          const isActive = activeColumn === col.id;
          return (
            <TouchableOpacity
              key={col.id}
              style={[styles.colTab, { borderColor: isActive ? colors.tint : colors.border, backgroundColor: isActive ? colors.tint + "15" : "transparent" }]}
              onPress={() => setActiveColumn(col.id)}
            >
              <Text style={styles.colTabEmoji}>{col.emoji}</Text>
              <Text style={[styles.colTabLabel, { color: isActive ? colors.tint : colors.mutedForeground }]}>{col.label}</Text>
              {count > 0 && (
                <View style={[styles.colCount, { backgroundColor: isActive ? colors.tint : colors.secondary }]}>
                  <Text style={[styles.colCountText, { color: isActive ? colors.primaryForeground : colors.mutedForeground }]}>{count}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {columnTasks.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>{COLUMNS.find((c) => c.id === activeColumn)?.emoji}</Text>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Bu sütun boş</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Yeni görev ekle veya başka sütundan taşı</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.taskList, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={columnTasks.length > 0}
        >
          {columnTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              colors={colors}
              onPress={() => setSelectedTask(task)}
              onMove={(status) => moveTask(task.id, status)}
            />
          ))}
        </ScrollView>
      )}

      <TaskDetailModal task={selectedTask} visible={!!selectedTask} onClose={() => setSelectedTask(null)} colors={colors} />
      <AddTaskModal visible={showAdd} onClose={() => setShowAdd(false)} colors={colors} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 24, fontWeight: "700", letterSpacing: -0.5 },
  addBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  columnTabs: { maxHeight: 52 },
  columnTabsContent: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  colTab: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, gap: 5 },
  colTabEmoji: { fontSize: 14 },
  colTabLabel: { fontSize: 13, fontWeight: "600" },
  colCount: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 10 },
  colCountText: { fontSize: 11, fontWeight: "700" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: { fontSize: 18, fontWeight: "600" },
  emptyText: { fontSize: 14, textAlign: "center", paddingHorizontal: 40 },
  taskList: { padding: 16, gap: 10 },
  taskCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  taskCardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  priorityDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  taskTitle: { flex: 1, fontSize: 15, fontWeight: "600", lineHeight: 22 },
  taskDesc: { fontSize: 13, lineHeight: 18 },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  progressBar: { flex: 1, height: 4, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2 },
  progressText: { fontSize: 11, fontWeight: "500", minWidth: 28 },
  taskFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  taskMeta: { flexDirection: "row", gap: 8 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 3 },
  metaText: { fontSize: 11 },
  pomodoroIcon: { fontSize: 11 },
  moveActions: { flexDirection: "row", gap: 4 },
  moveBtn: { width: 26, height: 26, borderRadius: 13, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  moveBtnEmoji: { fontSize: 12 },
  modalContainer: { flex: 1 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  modalClose: { fontSize: 18, fontWeight: "500", width: 36, textAlign: "center" },
  modalTitle: { flex: 1, fontSize: 17, fontWeight: "600", textAlign: "center" },
  modalSave: { fontSize: 16, fontWeight: "600", width: 50, textAlign: "right" },
  detailDesc: { fontSize: 14, lineHeight: 22, marginBottom: 16 },
  detailMeta: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  priorityBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  priorityLabel: { fontSize: 13, fontWeight: "600" },
  dueDateBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  dueDateText: { fontSize: 13 },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 10 },
  checkItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  checkbox: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  checkText: { flex: 1, fontSize: 14 },
  checkInputRow: { flexDirection: "row", borderTopWidth: 1, paddingTop: 12, marginTop: 8 },
  checkInput: { flex: 1, fontSize: 14, padding: 0 },
  formInput: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15 },
  formLabel: { fontSize: 12, fontWeight: "600", marginBottom: 8, textTransform: "uppercase" },
  priorityRow: { flexDirection: "row", gap: 8 },
  priorityOption: { flex: 1, paddingVertical: 8, borderWidth: 1, borderRadius: 8, alignItems: "center" },
  priorityOptionText: { fontSize: 12, fontWeight: "600" },
});
