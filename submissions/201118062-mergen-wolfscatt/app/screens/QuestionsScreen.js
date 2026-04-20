import React, { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import ProgressDots from "../components/ProgressDots";
import SectionCard from "../components/SectionCard";
import TextAreaField from "../components/TextAreaField";
import { colors, spacing } from "../constants/theme";

export default function QuestionsScreen({
  idea,
  questions,
  initialAnswers,
  onBack,
  onComplete
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(initialAnswers);
  const [error, setError] = useState("");

  const currentQuestion = questions[currentIndex];
  const currentValue = answers[currentQuestion.id] || "";
  const isLastQuestion = currentIndex === questions.length - 1;

  const progressText = useMemo(
    () => `${currentIndex + 1} / ${questions.length} soru`,
    [currentIndex, questions.length]
  );

  const handleNext = () => {
    if (!currentValue.trim()) {
      setError("Devam etmek için bu soruya kısa bir cevap yaz.");
      return;
    }

    setError("");

    if (isLastQuestion) {
      onComplete(answers);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
  };

  const handlePrevious = () => {
    if (currentIndex === 0) {
      onBack();
      return;
    }

    setError("");
    setCurrentIndex((prev) => prev - 1);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.caption}>Fikirin yakalandı</Text>
          <Text style={styles.ideaText}>{idea}</Text>
        </View>

        <SectionCard>
          <View style={styles.topRow}>
            <ProgressDots total={questions.length} currentIndex={currentIndex} />
            <Text style={styles.progressText}>{progressText}</Text>
          </View>

          <Text style={styles.questionTitle}>{currentQuestion.title}</Text>
          <Text style={styles.questionHint}>
            Kısa ve net yazman yeterli. Amaç uzun açıklama değil, spec için doğru çerçeveyi kurmak.
          </Text>

          <TextAreaField
            value={currentValue}
            onChangeText={(value) => {
              setAnswers((prev) => ({
                ...prev,
                [currentQuestion.id]: value
              }));

              if (error) {
                setError("");
              }
            }}
            placeholder={currentQuestion.placeholder}
            error={error}
            minHeight={160}
          />

          <View style={styles.buttonRow}>
            <View style={styles.buttonItem}>
              <PrimaryButton
                title={currentIndex === 0 ? "Başa Dön" : "Geri"}
                variant="ghost"
                onPress={handlePrevious}
              />
            </View>

            <View style={styles.buttonItem}>
              <PrimaryButton title={isLastQuestion ? "Spec Oluştur" : "Devam"} onPress={handleNext} />
            </View>
          </View>
        </SectionCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg
  },
  header: {
    gap: spacing.xs
  },
  caption: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary
  },
  ideaText: {
    fontSize: 22,
    lineHeight: 31,
    fontWeight: "800",
    color: colors.text
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg
  },
  progressText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textMuted
  },
  questionTitle: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing.xs
  },
  questionHint: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
    marginBottom: spacing.md
  },
  buttonRow: {
    marginTop: spacing.lg,
    flexDirection: "row",
    gap: spacing.sm
  },
  buttonItem: {
    flex: 1
  }
});
