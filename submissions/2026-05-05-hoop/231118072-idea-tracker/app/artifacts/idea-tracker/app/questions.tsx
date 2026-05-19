import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
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

import { ENGINEERING_QUESTIONS } from "@/constants/questions";
import { IdeaAnswer, useIdeas } from "@/context/IdeasContext";
import { useColors } from "@/hooks/useColors";

export default function QuestionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getIdea, addIdea, deleteIdea } = useIdeas();

  const idea = getIdea(id);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<IdeaAnswer[]>(
    idea?.answers ?? ENGINEERING_QUESTIONS.map((q) => ({ questionId: q.id, question: q.description, answer: "" }))
  );

  const topPadding = Platform.OS === "web" ? 67 : insets.top + 16;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom + 20;

  useEffect(() => {
    if (!idea) {
      router.replace("/");
    }
  }, [idea]);

  const question = ENGINEERING_QUESTIONS[currentStep];
  const currentAnswer = answers[currentStep]?.answer ?? "";
  const isLast = currentStep === ENGINEERING_QUESTIONS.length - 1;
  const progress = (currentStep + 1) / ENGINEERING_QUESTIONS.length;

  const updateAnswer = (text: string) => {
    setAnswers((prev) =>
      prev.map((a, i) => (i === currentStep ? { ...a, answer: text } : a))
    );
  };

  const handleNext = async () => {
    if (currentAnswer.trim().length < 5) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (isLast) {
      if (!idea) return;
      const updated = {
        ...idea,
        answers,
        completedAt: new Date().toISOString(),
      };
      await deleteIdea(idea.id);
      await addIdea(updated);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace(`/spec/${updated.id}`);
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const styles = makeStyles(colors);

  if (!idea) return null;

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
            onPress={() => router.replace("/")}
            style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Feather name="home" size={18} color={colors.foreground} />
          </Pressable>
          <Text style={styles.stepLabel}>
            {currentStep + 1} / {ENGINEERING_QUESTIONS.length}
          </Text>
        </View>

        <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progress * 100}%` as any,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>

        <View style={styles.ideaPreview}>
          <Feather name="zap" size={14} color={colors.primary} />
          <Text style={styles.ideaPreviewText} numberOfLines={2}>
            {idea.rawIdea}
          </Text>
        </View>

        <View style={styles.questionBlock}>
          <View style={[styles.qIcon, { backgroundColor: colors.accent }]}>
            <Feather name={question.icon as any} size={20} color={colors.primary} />
          </View>
          <Text style={styles.qTitle}>{question.title}</Text>
          <Text style={styles.qDesc}>{question.description}</Text>
        </View>

        <View
          style={[
            styles.inputContainer,
            {
              borderColor:
                currentAnswer.trim().length > 0 && currentAnswer.trim().length < 5
                  ? colors.destructive
                  : currentAnswer.trim().length >= 5
                  ? colors.primary
                  : colors.border,
              backgroundColor: colors.card,
            },
          ]}
        >
          <TextInput
            style={styles.input}
            placeholder={question.placeholder}
            placeholderTextColor={colors.mutedForeground}
            multiline
            value={currentAnswer}
            onChangeText={updateAnswer}
            textAlignVertical="top"
            autoFocus
          />
          <Text style={styles.charCount}>{currentAnswer.length} karakter</Text>
        </View>

        {currentAnswer.trim().length > 0 && currentAnswer.trim().length < 5 ? (
          <View style={styles.errorRow}>
            <Feather name="alert-circle" size={14} color={colors.destructive} />
            <Text style={[styles.errorText, { color: colors.destructive }]}>
              En az 5 karakter gerekli
            </Text>
          </View>
        ) : null}

        <View style={styles.navRow}>
          {currentStep > 0 ? (
            <Pressable
              onPress={handlePrev}
              style={({ pressed }) => [
                styles.prevBtn,
                { borderColor: colors.border, backgroundColor: colors.card, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Feather name="arrow-left" size={18} color={colors.foreground} />
              <Text style={[styles.prevBtnText, { color: colors.foreground }]}>Geri</Text>
            </Pressable>
          ) : (
            <View />
          )}

          <Pressable
            style={({ pressed }) => [
              styles.nextBtn,
              {
                backgroundColor:
                  currentAnswer.trim().length >= 5 ? colors.primary : colors.muted,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
            onPress={handleNext}
            disabled={currentAnswer.trim().length < 5}
          >
            <Text
              style={[
                styles.nextBtnText,
                {
                  color:
                    currentAnswer.trim().length >= 5
                      ? colors.primaryForeground
                      : colors.mutedForeground,
                },
              ]}
            >
              {isLast ? "Spec Oluştur" : "Sonraki"}
            </Text>
            <Feather
              name={isLast ? "file-text" : "arrow-right"}
              size={18}
              color={
                currentAnswer.trim().length >= 5
                  ? colors.primaryForeground
                  : colors.mutedForeground
              }
            />
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1 },
    content: { paddingHorizontal: 20, gap: 20 },
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
    stepLabel: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
    },
    progressTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
    progressFill: { height: 6, borderRadius: 3 },
    ideaPreview: {
      flexDirection: "row",
      gap: 8,
      backgroundColor: colors.accent,
      borderRadius: 12,
      padding: 12,
      alignItems: "flex-start",
    },
    ideaPreviewText: {
      flex: 1,
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.accentForeground,
      lineHeight: 20,
    },
    questionBlock: { gap: 8 },
    qIcon: {
      width: 48,
      height: 48,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "flex-start",
    },
    qTitle: {
      fontSize: 20,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    qDesc: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      lineHeight: 22,
    },
    inputContainer: {
      borderWidth: 1.5,
      borderRadius: 16,
      padding: 16,
      minHeight: 140,
    },
    input: {
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
      lineHeight: 24,
      minHeight: 100,
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
    navRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 4,
    },
    prevBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingVertical: 13,
      paddingHorizontal: 20,
      borderRadius: 14,
      borderWidth: 1.5,
    },
    prevBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
    nextBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingVertical: 13,
      paddingHorizontal: 24,
      borderRadius: 14,
    },
    nextBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  });
}
