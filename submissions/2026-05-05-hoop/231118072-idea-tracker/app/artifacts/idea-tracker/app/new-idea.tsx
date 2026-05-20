import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Idea } from "@/context/IdeasContext";
import { useIdeas } from "@/context/IdeasContext";
import { ENGINEERING_QUESTIONS } from "@/constants/questions";
import { useColors } from "@/hooks/useColors";

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export default function NewIdeaScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addIdea } = useIdeas();
  const [rawIdea, setRawIdea] = useState("");
  const [error, setError] = useState("");

  const topPadding = Platform.OS === "web" ? 67 : insets.top + 16;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom + 20;

  const handleStart = async () => {
    if (rawIdea.trim().length < 10) {
      setError("Fikrin en az 10 karakter olmalı.");
      return;
    }
    setError("");
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newIdea: Idea = {
      id: generateId(),
      rawIdea: rawIdea.trim(),
      answers: ENGINEERING_QUESTIONS.map((q) => ({
        questionId: q.id,
        question: q.description,
        answer: "",
      })),
      createdAt: new Date().toISOString(),
    };

    await addIdea(newIdea);
    router.replace({ pathname: "/questions", params: { id: newIdea.id } });
  };

  const styles = makeStyles(colors);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAwareScrollView
        bottomOffset={20}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingTop: topPadding, paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Feather name="x" size={22} color={colors.foreground} />
          </Pressable>
        </View>

        <View style={styles.hero}>
          <View style={[styles.iconBox, { backgroundColor: colors.accent }]}>
            <Feather name="zap" size={32} color={colors.primary} />
          </View>
          <Text style={styles.title}>Ham Fikrin Nedir?</Text>
          <Text style={styles.subtitle}>
            Aklındakini serbest yaz. Cümleler, bullet noktaları, tek kelimeler — her şey olabilir.
            Sonra birlikte yapılandıracağız.
          </Text>
        </View>

        <View style={[styles.inputContainer, { borderColor: error ? colors.destructive : colors.border, backgroundColor: colors.card }]}>
          <TextInput
            style={styles.input}
            placeholder="Örn: Öğrencilerin proje fikirlerini yapılandırmasına yardımcı olan bir mobil uygulama..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            value={rawIdea}
            onChangeText={(t) => { setRawIdea(t); setError(""); }}
            textAlignVertical="top"
            autoFocus
          />
          <Text style={styles.charCount}>{rawIdea.length} karakter</Text>
        </View>

        {error ? (
          <View style={styles.errorRow}>
            <Feather name="alert-circle" size={14} color={colors.destructive} />
            <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.tipBox}>
          <Feather name="info" size={14} color={colors.primary} />
          <Text style={styles.tipText}>
            5 mühendislik sorusunu cevapladıktan sonra tek sayfalık spec'in hazır olacak.
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.startBtn,
            { backgroundColor: rawIdea.trim().length >= 10 ? colors.primary : colors.muted, opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={handleStart}
          disabled={rawIdea.trim().length < 10}
        >
          <Text style={[styles.startBtnText, { color: rawIdea.trim().length >= 10 ? colors.primaryForeground : colors.mutedForeground }]}>
            Sorulara Geç
          </Text>
          <Feather
            name="arrow-right"
            size={18}
            color={rawIdea.trim().length >= 10 ? colors.primaryForeground : colors.mutedForeground}
          />
        </Pressable>
      </KeyboardAwareScrollView>
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1 },
    content: { paddingHorizontal: 20, gap: 20 },
    headerRow: { flexDirection: "row", justifyContent: "flex-end" },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    hero: { alignItems: "center", gap: 12, paddingVertical: 8 },
    iconBox: {
      width: 72,
      height: 72,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 4,
    },
    title: {
      fontSize: 24,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
      lineHeight: 22,
      paddingHorizontal: 16,
    },
    inputContainer: {
      borderWidth: 1.5,
      borderRadius: 16,
      padding: 16,
      minHeight: 160,
    },
    input: {
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
      lineHeight: 24,
      minHeight: 120,
    },
    charCount: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "right",
      marginTop: 8,
    },
    errorRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    errorText: { fontSize: 13, fontFamily: "Inter_400Regular" },
    tipBox: {
      flexDirection: "row",
      gap: 8,
      backgroundColor: colors.accent,
      borderRadius: 12,
      padding: 12,
      alignItems: "flex-start",
    },
    tipText: {
      flex: 1,
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.accentForeground,
      lineHeight: 20,
    },
    startBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 15,
      borderRadius: 14,
      marginTop: 4,
    },
    startBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  });
}
