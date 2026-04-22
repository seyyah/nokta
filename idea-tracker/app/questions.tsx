import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
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
import { useIdea, IdeaAnswers } from "@/context/IdeaContext";
import { useColors } from "@/hooks/useColors";

const QUESTIONS: {
  key: keyof IdeaAnswers;
  label: string;
  question: string;
  hint: string;
  icon: string;
}[] = [
  {
    key: "problem",
    label: "Problem",
    question: "Bu fikrin çözdüğü asıl problem nedir?",
    hint: "Kullanıcılar şu an bu sorunu nasıl çözüyor? Neden mevcut çözümler yeterli değil?",
    icon: "alert-circle",
  },
  {
    key: "user",
    label: "Kullanıcı",
    question: "Bu uygulamanın birincil kullanıcısı kim?",
    hint: "Teknik mi, teknik değil mi? Kaç kişilik bir grup? Hangi platform?",
    icon: "users",
  },
  {
    key: "scope",
    label: "Kapsam",
    question: "MVP kapsamında mutlaka olması gerekenler neler?",
    hint: "İlk sürümde hangi özellikler şart? Neler sonraya bırakılabilir?",
    icon: "layers",
  },
  {
    key: "constraints",
    label: "Kısıtlar",
    question: "Teknik veya iş kısıtları neler?",
    hint: "Zaman, bütçe, teknoloji, platform veya mevzuat kısıtları var mı?",
    icon: "lock",
  },
  {
    key: "solution",
    label: "Çözüm",
    question: "Bu problemi nasıl çözeceksin?",
    hint: "Teknik yaklaşım, kullanılacak teknolojiler ve genel mimari nedir?",
    icon: "cpu",
  },
];

export default function QuestionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentSession, setCurrentAnswers, saveSession } = useIdea();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<IdeaAnswers>>({});
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const current = QUESTIONS[step];
  const answer = answers[current.key] ?? "";
  const progress = ((step + 1) / QUESTIONS.length) * 100;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + 16 : insets.bottom + 16;

  const handleAnswer = (text: string) => {
    setAnswers((prev) => ({ ...prev, [current.key]: text }));
  };

  const handleNext = async () => {
    if (!answer.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const updatedAnswers = { ...answers, [current.key]: answer.trim() };
    setCurrentAnswers(updatedAnswers);

    if (step < QUESTIONS.length - 1) {
      setStep((s) => s + 1);
    } else {
      setIsSaving(true);
      const session = await saveSession();
      setIsSaving(false);
      if (session) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace({ pathname: "/spec", params: { sessionId: session.id } });
      }
    }
  };

  const handleBack = () => {
    if (step === 0) {
      router.back();
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setStep((s) => s - 1);
    }
  };

  const isLast = step === QUESTIONS.length - 1;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 8,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable onPress={handleBack} hitSlop={12} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <View style={styles.stepInfo}>
          <Text style={[styles.stepLabel, { color: colors.mutedForeground }]}>
            Soru {step + 1}/{QUESTIONS.length}
          </Text>
        </View>
        <View style={styles.stepDots}>
          {QUESTIONS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i <= step ? colors.primary : colors.border,
                  width: i === step ? 20 : 8,
                },
              ]}
            />
          ))}
        </View>
      </View>

      <View
        style={[styles.progressBar, { backgroundColor: colors.muted }]}
      >
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: colors.primary,
              width: `${progress}%`,
            },
          ]}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: colors.secondary },
          ]}
        >
          <Feather name={current.icon as any} size={14} color={colors.primary} />
          <Text style={[styles.categoryLabel, { color: colors.primary }]}>
            {current.label}
          </Text>
        </View>

        <Text style={[styles.question, { color: colors.foreground }]}>
          {current.question}
        </Text>

        <View
          style={[
            styles.hintBox,
            { backgroundColor: colors.muted, borderColor: colors.border },
          ]}
        >
          <Feather name="info" size={13} color={colors.mutedForeground} />
          <Text style={[styles.hintText, { color: colors.mutedForeground }]}>
            {current.hint}
          </Text>
        </View>

        {currentSession?.rawIdea ? (
          <View
            style={[
              styles.ideaPreview,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text
              style={[styles.ideaLabel, { color: colors.mutedForeground }]}
            >
              Fikrin
            </Text>
            <Text
              numberOfLines={2}
              style={[styles.ideaText, { color: colors.foreground }]}
            >
              {currentSession.rawIdea}
            </Text>
          </View>
        ) : null}

        <TextInput
          ref={inputRef}
          style={[
            styles.answerInput,
            {
              color: colors.foreground,
              backgroundColor: colors.card,
              borderColor: answer.trim() ? colors.primary : colors.border,
            },
          ]}
          placeholder="Cevabını buraya yaz..."
          placeholderTextColor={colors.mutedForeground}
          value={answer}
          onChangeText={handleAnswer}
          multiline
          autoFocus
          textAlignVertical="top"
        />

        <Pressable
          onPress={handleNext}
          disabled={!answer.trim() || isSaving}
          style={({ pressed }) => [
            styles.nextBtn,
            {
              backgroundColor:
                answer.trim() && !isSaving
                  ? colors.primary
                  : colors.muted,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text
            style={[
              styles.nextBtnText,
              {
                color:
                  answer.trim() && !isSaving
                    ? colors.primaryForeground
                    : colors.mutedForeground,
              },
            ]}
          >
            {isSaving
              ? "Kaydediliyor..."
              : isLast
              ? "Spec Oluştur"
              : "Sonraki Soru"}
          </Text>
          <Feather
            name={isLast ? "check" : "arrow-right"}
            size={18}
            color={
              answer.trim() && !isSaving
                ? colors.primaryForeground
                : colors.mutedForeground
            }
          />
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  backBtn: {
    padding: 4,
  },
  stepInfo: {
    flex: 1,
  },
  stepLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  stepDots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  progressBar: {
    height: 3,
    width: "100%",
  },
  progressFill: {
    height: 3,
    borderRadius: 2,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  question: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  hintBox: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  hintText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 19,
  },
  ideaPreview: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  ideaLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  ideaText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  answerInput: {
    minHeight: 130,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 16,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    lineHeight: 24,
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 4,
  },
  nextBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
