import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useIdeas } from "@/context/IdeaContext";
import { useColors } from "@/hooks/useColors";

export default function NewIdeaScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addIdea } = useIdeas();
  const [rawIdea, setRawIdea] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const charCount = rawIdea.trim().length;
  const isReady = charCount >= 10;

  async function handleStart() {
    if (!isReady || isSaving) return;
    setIsSaving(true);

    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const now = Date.now();

    await addIdea({
      id,
      rawIdea: rawIdea.trim(),
      answers: [],
      spec: "",
      createdAt: now,
      updatedAt: now,
    });

    setIsSaving(false);
    router.replace(`/idea/${id}`);
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        style={[
          styles.navBar,
          {
            paddingTop: topPad + 8,
            backgroundColor: colors.background,
          },
        ]}
      >
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="x" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.navTitle, { color: colors.foreground }]}>Yeni Fikir</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topSection}>
          <View style={[styles.iconWrap, { backgroundColor: colors.secondary }]}>
            <Feather name="zap" size={28} color={colors.primary} />
          </View>
          <Text style={[styles.heading, { color: colors.foreground }]}>
            Ham fikrin nedir?
          </Text>
          <Text style={[styles.subheading, { color: colors.mutedForeground }]}>
            Kafandaki fikri olduğu gibi yaz. Düzgün cümle kurmana gerek yok — sadece ne yapmak istediğini anlat.
          </Text>
        </View>

        <View
          style={[
            styles.inputCard,
            {
              backgroundColor: colors.card,
              borderColor: isReady ? colors.primary : colors.border,
              borderRadius: 16,
            },
          ]}
        >
          <TextInput
            style={[styles.input, { color: colors.foreground }]}
            placeholder="Örn: Bir uygulama yapayım insanlar kendi bitkilerini takip edebilsin, sulama zamanlarını hatırlatsın..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            value={rawIdea}
            onChangeText={setRawIdea}
            autoFocus
            textAlignVertical="top"
          />
          <Text style={[styles.charCount, { color: colors.mutedForeground }]}>
            {charCount} karakter
          </Text>
        </View>

        <View style={styles.stepsSection}>
          <Text style={[styles.stepsTitle, { color: colors.mutedForeground }]}>
            Bundan sonra ne olacak?
          </Text>
          {[
            { icon: "help-circle" as const, label: "5 engineering sorusu yanıtlayacaksın" },
            { icon: "file-text" as const, label: "Tek sayfalık spec otomatik oluşturulacak" },
            { icon: "share-2" as const, label: "Spec'ini kaydedip paylaşabileceksin" },
          ].map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={[styles.stepIcon, { backgroundColor: colors.secondary }]}>
                <Feather name={step.icon} size={16} color={colors.primary} />
              </View>
              <Text style={[styles.stepLabel, { color: colors.foreground }]}>{step.label}</Text>
            </View>
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.startButton,
            {
              backgroundColor: isReady ? colors.primary : colors.muted,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
          onPress={handleStart}
          disabled={!isReady || isSaving}
        >
          <Text
            style={[
              styles.startButtonText,
              { color: isReady ? colors.primaryForeground : colors.mutedForeground },
            ]}
          >
            {isSaving ? "Başlatılıyor..." : "Sorulara Geç"}
          </Text>
          <Feather
            name="arrow-right"
            size={18}
            color={isReady ? colors.primaryForeground : colors.mutedForeground}
          />
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  navTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 20,
  },
  topSection: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subheading: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  inputCard: {
    borderWidth: 1.5,
    padding: 16,
    minHeight: 140,
  },
  input: {
    fontSize: 16,
    lineHeight: 24,
    minHeight: 100,
  },
  charCount: {
    fontSize: 12,
    marginTop: 8,
    textAlign: "right",
  },
  stepsSection: {
    gap: 10,
  },
  stepsTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  stepLabel: {
    fontSize: 15,
    flex: 1,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 8,
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: "700",
  },
});
