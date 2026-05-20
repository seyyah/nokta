import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useIdeas } from "@/context/IdeasContext";
import { useColors } from "@/hooks/useColors";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { ideas, deleteIdea, isLoading } = useIdeas();

  const topPadding = Platform.OS === "web" ? 67 : insets.top + 16;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom + 16;

  const styles = makeStyles(colors);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  };

  const completionPercent = (idea: (typeof ideas)[0]) =>
    Math.round((idea.answers.filter((a) => a.answer.trim().length > 0).length / 5) * 100);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding }]}>
        <View>
          <Text style={styles.greeting}>Merhaba</Text>
          <Text style={styles.title}>Fikirlerim</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.newBtn, { opacity: pressed ? 0.8 : 1 }]}
          onPress={() => router.push("/new-idea")}
        >
          <Feather name="plus" size={22} color={colors.primaryForeground} />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : ideas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconBox, { backgroundColor: colors.accent }]}>
            <Feather name="zap" size={36} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Henüz fikir yok</Text>
          <Text style={styles.emptyDesc}>
            Ham bir fikrin mi var? Hemen yaz, sorularla bir spec'e dönüştür.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.emptyBtn, { opacity: pressed ? 0.8 : 1 }]}
            onPress={() => router.push("/new-idea")}
          >
            <Feather name="plus" size={18} color={colors.primaryForeground} />
            <Text style={styles.emptyBtnText}>İlk Fikrimi Ekle</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.list, { paddingBottom: bottomPadding }]}
          showsVerticalScrollIndicator={false}
        >
          {ideas.map((idea) => {
            const pct = completionPercent(idea);
            const isComplete = idea.completedAt != null;
            return (
              <Pressable
                key={idea.id}
                style={({ pressed }) => [
                  styles.card,
                  { backgroundColor: colors.card, opacity: pressed ? 0.9 : 1 },
                ]}
                onPress={() =>
                  isComplete
                    ? router.push(`/spec/${idea.id}`)
                    : router.push({ pathname: "/questions", params: { id: idea.id } })
                }
              >
                <View style={styles.cardTop}>
                  <View style={styles.cardMeta}>
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor: isComplete ? colors.success + "20" : colors.accent,
                        },
                      ]}
                    >
                      <Feather
                        name={isComplete ? "check-circle" : "edit-3"}
                        size={12}
                        color={isComplete ? colors.success : colors.primary}
                      />
                      <Text
                        style={[
                          styles.badgeText,
                          { color: isComplete ? colors.success : colors.primary },
                        ]}
                      >
                        {isComplete ? "Tamamlandı" : `${pct}% Tamamlandı`}
                      </Text>
                    </View>
                    <Text style={styles.date}>{formatDate(idea.createdAt)}</Text>
                  </View>
                  <Pressable
                    hitSlop={8}
                    onPress={() => deleteIdea(idea.id)}
                    style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                  >
                    <Feather name="trash-2" size={16} color={colors.mutedForeground} />
                  </Pressable>
                </View>

                <Text style={styles.ideaText} numberOfLines={2}>
                  {idea.rawIdea}
                </Text>

                <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${pct}%` as any,
                        backgroundColor: isComplete ? colors.success : colors.primary,
                      },
                    ]}
                  />
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.footerText}>
                    {idea.answers.filter((a) => a.answer.trim()).length}/5 soru cevaplandı
                  </Text>
                  <Feather
                    name={isComplete ? "file-text" : "arrow-right"}
                    size={16}
                    color={colors.primary}
                  />
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1 },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
    greeting: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    title: {
      fontSize: 28,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      marginTop: 2,
    },
    newBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 40,
      gap: 12,
    },
    emptyIconBox: {
      width: 80,
      height: 80,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },
    emptyTitle: {
      fontSize: 20,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      textAlign: "center",
    },
    emptyDesc: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
      lineHeight: 22,
    },
    emptyBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
      marginTop: 8,
    },
    emptyBtnText: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: colors.primaryForeground,
    },
    list: { padding: 20, gap: 12 },
    card: {
      borderRadius: 16,
      padding: 16,
      gap: 10,
      boxShadow: "0px 2px 8px rgba(0,0,0,0.06)",
      elevation: 2,
    },
    cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    cardMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 20,
    },
    badgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
    date: { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    ideaText: {
      fontSize: 15,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
      lineHeight: 22,
    },
    progressBar: { height: 4, borderRadius: 2, overflow: "hidden" },
    progressFill: { height: 4, borderRadius: 2 },
    cardFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    footerText: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
  });
}
