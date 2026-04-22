import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIdea, IdeaSession } from "@/context/IdeaContext";
import { useColors } from "@/hooks/useColors";

const LABELS: { key: keyof IdeaSession["answers"]; label: string; icon: string }[] = [
  { key: "problem", label: "Problem", icon: "alert-circle" },
  { key: "user", label: "Kullanıcı", icon: "users" },
  { key: "scope", label: "Kapsam (MVP)", icon: "layers" },
  { key: "constraints", label: "Kısıtlar", icon: "lock" },
  { key: "solution", label: "Çözüm", icon: "cpu" },
];

function SpecSection({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.section,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.sectionHeader}>
        <View
          style={[styles.sectionIcon, { backgroundColor: colors.secondary }]}
        >
          <Feather name={icon as any} size={14} color={colors.primary} />
        </View>
        <Text style={[styles.sectionLabel, { color: colors.primary }]}>
          {label}
        </Text>
      </View>
      <Text style={[styles.sectionValue, { color: colors.foreground }]}>
        {value}
      </Text>
    </View>
  );
}

export default function SpecScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { sessions } = useIdea();
  const [copied, setCopied] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + 24 : insets.bottom + 24;

  const session = useMemo(
    () => sessions.find((s) => s.id === sessionId),
    [sessions, sessionId]
  );

  const specText = useMemo(() => {
    if (!session) return "";
    return [
      `# PROJE SPEC — ${new Date(session.createdAt).toLocaleDateString("tr-TR")}`,
      "",
      `## Ham Fikir`,
      session.rawIdea,
      "",
      `## Problem`,
      session.answers.problem,
      "",
      `## Kullanıcı`,
      session.answers.user,
      "",
      `## Kapsam (MVP)`,
      session.answers.scope,
      "",
      `## Kısıtlar`,
      session.answers.constraints,
      "",
      `## Çözüm`,
      session.answers.solution,
    ].join("\n");
  }, [session]);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(specText);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNewIdea = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace("/");
  };

  if (!session) {
    return (
      <View
        style={[
          styles.errorContainer,
          { backgroundColor: colors.background, paddingTop: topPad },
        ]}
      >
        <Feather name="alert-circle" size={40} color={colors.mutedForeground} />
        <Text style={[styles.errorText, { color: colors.mutedForeground }]}>
          Spec bulunamadı
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.backBtnText, { color: colors.primaryForeground }]}>
            Geri Dön
          </Text>
        </Pressable>
      </View>
    );
  }

  const date = new Date(session.createdAt).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 8,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Proje Spec
        </Text>
        <Pressable onPress={handleCopy} hitSlop={12}>
          <Feather
            name={copied ? "check" : "copy"}
            size={20}
            color={copied ? colors.success : colors.foreground}
          />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.ideaCard,
            { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" },
          ]}
        >
          <View style={styles.ideaCardHeader}>
            <View
              style={[styles.ideaIcon, { backgroundColor: colors.primary }]}
            >
              <Feather name="zap" size={14} color={colors.primaryForeground} />
            </View>
            <Text style={[styles.ideaDate, { color: colors.mutedForeground }]}>
              {date}
            </Text>
            <View
              style={[styles.specBadge, { backgroundColor: colors.primary }]}
            >
              <Text
                style={[styles.specBadgeText, { color: colors.primaryForeground }]}
              >
                Spec
              </Text>
            </View>
          </View>
          <Text style={[styles.ideaText, { color: colors.foreground }]}>
            {session.rawIdea}
          </Text>
        </View>

        {LABELS.map(({ key, label, icon }) => (
          <SpecSection
            key={key}
            icon={icon}
            label={label}
            value={session.answers[key]}
          />
        ))}

        <View style={styles.actions}>
          <Pressable
            onPress={handleCopy}
            style={({ pressed }) => [
              styles.copyBtn,
              {
                backgroundColor: copied ? colors.success : colors.card,
                borderColor: copied ? colors.success : colors.border,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Feather
              name={copied ? "check" : "copy"}
              size={16}
              color={copied ? colors.successForeground : colors.foreground}
            />
            <Text
              style={[
                styles.copyBtnText,
                {
                  color: copied ? colors.successForeground : colors.foreground,
                },
              ]}
            >
              {copied ? "Kopyalandı!" : "Spec'i Kopyala"}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleNewIdea}
            style={({ pressed }) => [
              styles.newBtn,
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Feather name="plus" size={16} color={colors.primaryForeground} />
            <Text
              style={[styles.newBtnText, { color: colors.primaryForeground }]}
            >
              Yeni Fikir
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  ideaCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  ideaCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  ideaIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  ideaDate: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  specBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  specBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  ideaText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    lineHeight: 24,
  },
  section: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  sectionIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionValue: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  copyBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  copyBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  newBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  newBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  backBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
