import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { IdeaEntry } from "@/context/IdeaContext";
import { useColors } from "@/hooks/useColors";

interface IdeaCardProps {
  idea: IdeaEntry;
  onDelete?: (id: string) => void;
}

export function IdeaCard({ idea, onDelete }: IdeaCardProps) {
  const colors = useColors();

  const answeredCount = idea.answers.filter((a) => a.answer.trim().length > 0).length;
  const totalQuestions = 5;
  const progress = answeredCount / totalQuestions;
  const isComplete = answeredCount === totalQuestions;

  const timeAgo = () => {
    const diff = Date.now() - idea.createdAt;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days} gün önce`;
    if (hours > 0) return `${hours} saat önce`;
    if (minutes > 0) return `${minutes} dakika önce`;
    return "Az önce";
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: 16,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
      onPress={() => router.push(`/idea/${idea.id}`)}
    >
      <View style={styles.header}>
        <View style={[styles.statusDot, { backgroundColor: isComplete ? colors.success : colors.primary }]} />
        <Text style={[styles.time, { color: colors.mutedForeground }]}>{timeAgo()}</Text>
        {onDelete && (
          <Pressable
            hitSlop={12}
            onPress={() => onDelete(idea.id)}
            style={styles.deleteBtn}
          >
            <Feather name="trash-2" size={16} color={colors.mutedForeground} />
          </Pressable>
        )}
      </View>

      <Text
        style={[styles.rawIdea, { color: colors.foreground }]}
        numberOfLines={2}
      >
        {idea.rawIdea}
      </Text>

      <View style={styles.footer}>
        <View style={[styles.progressBarBg, { backgroundColor: colors.secondary }]}>
          <View
            style={[
              styles.progressBarFill,
              {
                backgroundColor: isComplete ? colors.success : colors.primary,
                width: `${progress * 100}%`,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: colors.mutedForeground }]}>
          {answeredCount}/{totalQuestions} soru
        </Text>
      </View>

      {isComplete && (
        <View style={[styles.specBadge, { backgroundColor: colors.secondary }]}>
          <Feather name="file-text" size={12} color={colors.primary} />
          <Text style={[styles.specBadgeText, { color: colors.primary }]}>Spec hazır</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    flex: 1,
  },
  deleteBtn: {
    padding: 4,
  },
  rawIdea: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
    marginBottom: 14,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  progressBarBg: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 4,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
  },
  specBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 10,
  },
  specBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
