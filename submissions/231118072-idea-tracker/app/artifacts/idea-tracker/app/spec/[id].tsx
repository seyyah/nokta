import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useIdeas } from "@/context/IdeasContext";
import { ENGINEERING_QUESTIONS } from "@/constants/questions";
import { useColors } from "@/hooks/useColors";

export default function SpecScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getIdea } = useIdeas();

  const idea = getIdea(id);

  const topPadding = Platform.OS === "web" ? 67 : insets.top + 16;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom + 24;

  useEffect(() => {
    if (!idea) {
      router.replace("/");
    }
  }, [idea]);

  if (!idea) return null;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const styles = makeStyles(colors);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: topPadding, paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => router.replace("/")}
            style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Feather name="arrow-left" size={18} color={colors.foreground} />
          </Pressable>
          <Pressable
            onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
            style={({ pressed }) => [styles.shareBtn, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Feather name="share" size={16} color={colors.primary} />
            <Text style={[styles.shareBtnText, { color: colors.primary }]}>Paylaş</Text>
          </Pressable>
        </View>

        <View style={[styles.badge, { backgroundColor: colors.success + "20" }]}>
          <Feather name="check-circle" size={14} color={colors.success} />
          <Text style={[styles.badgeText, { color: colors.success }]}>Spec Hazır</Text>
        </View>

        <View style={styles.specHeader}>
          <Text style={styles.specTitle}>Ürün Spec'i</Text>
          <Text style={styles.specDate}>
            {idea.completedAt ? formatDate(idea.completedAt) : formatDate(idea.createdAt)}
          </Text>
        </View>

        <View style={[styles.rawIdeaCard, { backgroundColor: colors.accent }]}>
          <View style={styles.rawIdeaHeader}>
            <Feather name="zap" size={16} color={colors.primary} />
            <Text style={[styles.rawIdeaLabel, { color: colors.primary }]}>Ham Fikir</Text>
          </View>
          <Text style={styles.rawIdeaText}>{idea.rawIdea}</Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Engineering Sorular & Cevaplar</Text>

        {ENGINEERING_QUESTIONS.map((q, i) => {
          const answer = idea.answers.find((a) => a.questionId === q.id);
          return (
            <View key={q.id} style={[styles.qaCard, { backgroundColor: colors.card }]}>
              <View style={styles.qaHeader}>
                <View style={[styles.qNumber, { backgroundColor: colors.primary + "15" }]}>
                  <Text style={[styles.qNumberText, { color: colors.primary }]}>{i + 1}</Text>
                </View>
                <View style={styles.qTitleRow}>
                  <Feather name={q.icon as any} size={14} color={colors.primary} />
                  <Text style={styles.qaTitle}>{q.title}</Text>
                </View>
              </View>
              <Text style={styles.qaQuestion}>{q.description}</Text>
              <View style={[styles.answerBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={styles.answerText}>
                  {answer?.answer?.trim() ? answer.answer : "—"}
                </Text>
              </View>
            </View>
          );
        })}

        <View style={styles.divider} />

        <View style={[styles.specSummaryCard, { backgroundColor: colors.primary }]}>
          <Text style={[styles.summaryTitle, { color: colors.primaryForeground }]}>
            Tek Sayfalık Spec Ozeti
          </Text>

          {ENGINEERING_QUESTIONS.map((q) => {
            const answer = idea.answers.find((a) => a.questionId === q.id);
            return (
              <View key={q.id} style={styles.summaryRow}>
                <Feather name={q.icon as any} size={13} color={colors.primaryForeground + "bb"} />
                <View style={styles.summaryTextBlock}>
                  <Text style={[styles.summaryLabel, { color: colors.primaryForeground + "bb" }]}>
                    {q.title.toUpperCase()}
                  </Text>
                  <Text style={[styles.summaryValue, { color: colors.primaryForeground }]}>
                    {answer?.answer?.trim() ? answer.answer : "—"}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.doneBtn,
            { backgroundColor: colors.secondary, opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={() => router.replace("/")}
        >
          <Feather name="home" size={18} color={colors.primary} />
          <Text style={[styles.doneBtnText, { color: colors.primary }]}>Ana Sayfaya Dön</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1 },
    content: { paddingHorizontal: 20, gap: 16 },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    shareBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.accent,
    },
    shareBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      alignSelf: "flex-start",
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 20,
    },
    badgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
    specHeader: { gap: 4 },
    specTitle: {
      fontSize: 28,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    specDate: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    rawIdeaCard: {
      borderRadius: 14,
      padding: 16,
      gap: 8,
    },
    rawIdeaHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
    rawIdeaLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
    rawIdeaText: {
      fontSize: 15,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
      lineHeight: 24,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 4,
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    qaCard: {
      borderRadius: 14,
      padding: 16,
      gap: 10,
      boxShadow: "0px 1px 6px rgba(0,0,0,0.04)",
      elevation: 1,
    },
    qaHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
    qNumber: {
      width: 28,
      height: 28,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    qNumberText: { fontSize: 13, fontFamily: "Inter_700Bold" },
    qTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
    qaTitle: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    qaQuestion: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      lineHeight: 20,
    },
    answerBox: {
      borderRadius: 10,
      borderWidth: 1,
      padding: 12,
    },
    answerText: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
      lineHeight: 22,
    },
    specSummaryCard: {
      borderRadius: 16,
      padding: 20,
      gap: 16,
    },
    summaryTitle: {
      fontSize: 16,
      fontFamily: "Inter_700Bold",
      marginBottom: 4,
    },
    summaryRow: {
      flexDirection: "row",
      gap: 10,
      alignItems: "flex-start",
    },
    summaryTextBlock: { flex: 1, gap: 2 },
    summaryLabel: {
      fontSize: 10,
      fontFamily: "Inter_600SemiBold",
      letterSpacing: 0.5,
    },
    summaryValue: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      lineHeight: 20,
    },
    doneBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 14,
      borderRadius: 14,
      marginTop: 4,
    },
    doneBtnText: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
    },
  });
}
