import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
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

import { EngAnswer, useIdeas } from "@/context/IdeaContext";
import { ENGINEERING_QUESTIONS, generateSpec } from "@/constants/questions";
import { useColors } from "@/hooks/useColors";

export default function IdeaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { getIdea, updateIdea } = useIdeas();

  const idea = getIdea(id);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<EngAnswer[]>(idea?.answers ?? []);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [showSpec, setShowSpec] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  useEffect(() => {
    if (!idea) return;
    const existingAnswer = answers.find((a) => a.questionId === ENGINEERING_QUESTIONS[currentQ].id);
    setCurrentAnswer(existingAnswer?.answer ?? "");
  }, [currentQ]);

  useEffect(() => {
    if (idea && idea.answers.length === ENGINEERING_QUESTIONS.length && idea.spec) {
      setShowSpec(true);
    }
  }, [idea]);

  if (!idea) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground, padding: 20 }}>Fikir bulunamadı.</Text>
      </View>
    );
  }

  const question = ENGINEERING_QUESTIONS[currentQ];
  const answeredCount = answers.filter((a) => a.answer.trim().length > 0).length;
  const allAnswered = answeredCount === ENGINEERING_QUESTIONS.length;
  const progress = (currentQ + (currentAnswer.trim().length > 0 ? 1 : 0)) / ENGINEERING_QUESTIONS.length;

  function saveCurrentAnswer() {
    const q = ENGINEERING_QUESTIONS[currentQ];
    const newAnswers = answers.filter((a) => a.questionId !== q.id);
    const updated: EngAnswer[] = [
      ...newAnswers,
      { questionId: q.id, question: q.question, answer: currentAnswer.trim() },
    ].filter((a) => a.answer.length > 0);
    setAnswers(updated);
    return updated;
  }

  async function handleNext() {
    const updatedAnswers = saveCurrentAnswer();
    await updateIdea(id, { answers: updatedAnswers });

    if (currentQ < ENGINEERING_QUESTIONS.length - 1) {
      setCurrentQ((q) => q + 1);
    } else {
      const spec = generateSpec(idea.rawIdea, updatedAnswers);
      await updateIdea(id, { answers: updatedAnswers, spec });
      setShowSpec(true);
    }
  }

  function handlePrev() {
    saveCurrentAnswer();
    setCurrentQ((q) => Math.max(0, q - 1));
  }

  if (showSpec) {
    return <SpecView idea={idea} spec={idea.spec || generateSpec(idea.rawIdea, answers)} onEdit={() => setShowSpec(false)} />;
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        style={[
          styles.navBar,
          { paddingTop: topPad + 8, backgroundColor: colors.background },
        ]}
      >
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.navTitle, { color: colors.mutedForeground }]}>
          {currentQ + 1}/{ENGINEERING_QUESTIONS.length}
        </Text>
        {allAnswered && (
          <Pressable onPress={() => setShowSpec(true)} hitSlop={12}>
            <Feather name="file-text" size={22} color={colors.primary} />
          </Pressable>
        )}
        {!allAnswered && <View style={{ width: 22 }} />}
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 32 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[styles.progressBarBg, { backgroundColor: colors.secondary }]}
        >
          <View
            style={[
              styles.progressBarFill,
              { backgroundColor: colors.primary, width: `${progress * 100}%` },
            ]}
          />
        </View>

        <View
          style={[styles.rawIdeaBanner, { backgroundColor: colors.secondary, borderRadius: 12 }]}
        >
          <Feather name="zap" size={14} color={colors.primary} />
          <Text style={[styles.rawIdeaText, { color: colors.primary }]} numberOfLines={2}>
            {idea.rawIdea}
          </Text>
        </View>

        <View style={styles.qSection}>
          <View style={[styles.qNumberBadge, { backgroundColor: colors.primary }]}>
            <Text style={[styles.qNumber, { color: colors.primaryForeground }]}>
              S{currentQ + 1}
            </Text>
          </View>
          <Text style={[styles.qTitle, { color: colors.foreground }]}>
            {question.question}
          </Text>
          <Text style={[styles.qHint, { color: colors.mutedForeground }]}>
            {question.hint}
          </Text>
        </View>

        <View
          style={[
            styles.answerCard,
            {
              backgroundColor: colors.card,
              borderColor: currentAnswer.trim() ? colors.primary : colors.border,
              borderRadius: 16,
            },
          ]}
        >
          <TextInput
            style={[styles.answerInput, { color: colors.foreground }]}
            placeholder={question.placeholder}
            placeholderTextColor={colors.mutedForeground}
            multiline
            value={currentAnswer}
            onChangeText={setCurrentAnswer}
            autoFocus
            textAlignVertical="top"
          />
        </View>

        <View style={styles.navButtons}>
          {currentQ > 0 && (
            <Pressable
              style={[styles.prevButton, { borderColor: colors.border }]}
              onPress={handlePrev}
            >
              <Feather name="arrow-left" size={18} color={colors.foreground} />
              <Text style={[styles.prevButtonText, { color: colors.foreground }]}>Geri</Text>
            </Pressable>
          )}
          <Pressable
            style={({ pressed }) => [
              styles.nextButton,
              { backgroundColor: colors.primary, flex: currentQ > 0 ? 1 : undefined, opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={handleNext}
          >
            <Text style={[styles.nextButtonText, { color: colors.primaryForeground }]}>
              {currentQ === ENGINEERING_QUESTIONS.length - 1 ? "Spec Oluştur" : "Sonraki Soru"}
            </Text>
            <Feather
              name={currentQ === ENGINEERING_QUESTIONS.length - 1 ? "file-text" : "arrow-right"}
              size={18}
              color={colors.primaryForeground}
            />
          </Pressable>
        </View>

        <View style={styles.questionsOverview}>
          {ENGINEERING_QUESTIONS.map((q, i) => {
            const answered = answers.some((a) => a.questionId === q.id && a.answer.trim());
            const isCurrent = i === currentQ;
            return (
              <Pressable
                key={q.id}
                style={[
                  styles.qDot,
                  {
                    backgroundColor: isCurrent
                      ? colors.primary
                      : answered
                      ? colors.success
                      : colors.secondary,
                    width: isCurrent ? 24 : 8,
                  },
                ]}
                onPress={() => {
                  saveCurrentAnswer();
                  setCurrentQ(i);
                }}
              />
            );
          })}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SpecView({
  idea,
  spec,
  onEdit,
}: {
  idea: { rawIdea: string; answers: EngAnswer[] };
  spec: string;
  onEdit: () => void;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.navBar,
          { paddingTop: topPad + 8, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border },
        ]}
      >
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.navTitle, { color: colors.foreground, fontWeight: "700" }]}>Spec</Text>
        <Pressable onPress={onEdit} hitSlop={12}>
          <Feather name="edit-2" size={20} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.specContent, { paddingBottom: bottomPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.specHeader, { backgroundColor: colors.primary, borderRadius: 16 }]}>
          <Feather name="check-circle" size={20} color={colors.primaryForeground} />
          <Text style={[styles.specHeaderText, { color: colors.primaryForeground }]}>
            Spec tamamlandı
          </Text>
        </View>

        {spec.split("---").map((section, i) => {
          if (!section.trim()) return null;
          const lines = section.trim().split("\n").filter(Boolean);
          return (
            <View
              key={i}
              style={[styles.specSection, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 12 }]}
            >
              {lines.map((line, j) => {
                const isH1 = line.startsWith("# ");
                const isH2 = line.startsWith("## ");
                const isBold = line.startsWith("**");
                const text = line.replace(/^#{1,2} /, "").replace(/\*\*/g, "");

                return (
                  <Text
                    key={j}
                    style={[
                      styles.specLine,
                      isH1 && [styles.specH1, { color: colors.foreground }],
                      isH2 && [styles.specH2, { color: colors.foreground }],
                      isBold && { fontWeight: "700" as const },
                      !isH1 && !isH2 && { color: colors.foreground },
                      j === 0 && { marginTop: 0 },
                    ]}
                  >
                    {text}
                  </Text>
                );
              })}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  navTitle: { fontSize: 17, fontWeight: "600" },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 20,
  },
  progressBarBg: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 4,
    borderRadius: 2,
  },
  rawIdeaBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
  },
  rawIdeaText: {
    fontSize: 13,
    flex: 1,
    fontWeight: "500",
  },
  qSection: {
    gap: 10,
  },
  qNumberBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  qNumber: {
    fontSize: 14,
    fontWeight: "700",
  },
  qTitle: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.3,
    lineHeight: 30,
  },
  qHint: {
    fontSize: 14,
    lineHeight: 20,
  },
  answerCard: {
    borderWidth: 1.5,
    padding: 16,
    minHeight: 130,
  },
  answerInput: {
    fontSize: 16,
    lineHeight: 24,
    minHeight: 100,
  },
  navButtons: {
    flexDirection: "row",
    gap: 12,
  },
  prevButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
  },
  prevButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    minWidth: 180,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  questionsOverview: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  qDot: {
    height: 8,
    borderRadius: 4,
  },
  specContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  specHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 14,
  },
  specHeaderText: {
    fontSize: 15,
    fontWeight: "700",
  },
  specSection: {
    padding: 16,
    borderWidth: 1,
    gap: 6,
  },
  specLine: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: 4,
  },
  specH1: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  specH2: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8,
  },
});
