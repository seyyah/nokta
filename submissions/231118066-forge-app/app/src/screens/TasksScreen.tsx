import React, { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { Screen } from "../../App";
import { AuditWidget } from "../audit/AuditWidget";

type Props = {
  navigate: (screen: Screen) => void;
  onReport: (markdown: string) => void;
};

type Task = { id: string; title: string; done: boolean };

export function TasksScreen({ navigate, onReport }: Props) {
  const [tasks, setTasks] = useState<Task[]>([
    { id: "t1", title: "Ses RMS çubukları (80ms ölçüm)", done: true },
    { id: "t2", title: "Avatar göz kırpma + kafa sallama + ağız aralığı", done: true },
    { id: "t3", title: "Uzman görüşmesi (Jitsi) + özet kaydı", done: false },
  ]);
  const [text, setText] = useState("");

  const remaining = useMemo(
    () => tasks.filter((t) => !t.done).length,
    [tasks]
  );

  const add = () => {
    const title = text.trim();
    if (!title) return;
    const id = `t-${Date.now()}`;
    setTasks((prev) => [{ id, title, done: false }, ...prev]);
    setText("");
  };

  const toggle = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Pressable onPress={() => navigate("Home")} style={styles.backBtn}>
          <Text style={styles.backText}>← Ana Sayfa</Text>
        </Pressable>
        <Text style={styles.badge}>{remaining} açık</Text>
      </View>

      <Text style={styles.title}>Görevler</Text>

      <View style={styles.addRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Görev ekle…"
          placeholderTextColor="#6f6f86"
          style={styles.input}
          returnKeyType="done"
          onSubmitEditing={add}
        />
        <Pressable onPress={add} style={styles.addBtn}>
          <Text style={styles.addBtnText}>Ekle</Text>
        </Pressable>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ paddingBottom: 90 }}
        renderItem={({ item }) => (
          <Pressable onPress={() => toggle(item.id)} style={styles.taskRow}>
            <View style={[styles.checkbox, item.done && styles.checkboxOn]}>
              <Text style={styles.checkMark}>{item.done ? "✓" : ""}</Text>
            </View>
            <Text style={[styles.taskText, item.done && styles.taskDone]}>
              {item.title}
            </Text>
          </Pressable>
        )}
      />

      <AuditWidget screenName="Görevler" onReport={(md) => onReport(md)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a14", padding: 18 },
  topRow: { flexDirection: "row", justifyContent: "space-between" },
  backBtn: {
    backgroundColor: "#121226",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#242443",
  },
  backText: { color: "#e8e8ff", fontWeight: "800" },
  badge: {
    color: "#d9dcff",
    backgroundColor: "#1a1a2e",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    overflow: "hidden",
    fontWeight: "800",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2a2a45",
  },
  title: { marginTop: 14, color: "#f2f2ff", fontSize: 26, fontWeight: "900" },
  addRow: { flexDirection: "row", gap: 10, marginTop: 12, marginBottom: 14 },
  input: {
    flex: 1,
    backgroundColor: "#121226",
    borderColor: "#242443",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: "#f2f2ff",
  },
  addBtn: {
    backgroundColor: "#2a6df5",
    borderRadius: 16,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  addBtnText: { color: "#fff", fontWeight: "900" },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#0f0f1f",
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#242443",
    marginBottom: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#7b8cde",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  checkboxOn: { backgroundColor: "#7b8cde" },
  checkMark: { color: "#0a0a14", fontWeight: "900" },
  taskText: { flex: 1, color: "#e8e8ff", fontWeight: "700" },
  taskDone: { color: "#7c7c9d", textDecorationLine: "line-through" },
});

