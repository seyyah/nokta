import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import SectionCard from "../components/SectionCard";
import TextAreaField from "../components/TextAreaField";
import { colors, spacing } from "../constants/theme";

export default function HomeScreen({ initialIdea, onStart }) {
  const [idea, setIdea] = useState(initialIdea || "");
  const [error, setError] = useState("");

  const handleContinue = () => {
    const trimmed = idea.trim();

    if (!trimmed) {
      setError("Devam etmek için önce ham fikrini yaz.");
      return;
    }

    if (trimmed.length < 12) {
      setError("Fikri biraz daha aç. En az birkaç kelime yazman yeterli.");
      return;
    }

    setError("");
    onStart(trimmed);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Track A Submission</Text>
          <Text style={styles.title}>Nokta Capture</Text>
          <Text style={styles.subtitle}>
            Ham fikrini gir, 4 kısa soruyla netleştir ve tek sayfalık ürün özetini anında gör.
          </Text>
        </View>

        <SectionCard>
          <TextAreaField
            label="Ham fikir"
            value={idea}
            onChangeText={(value) => {
              setIdea(value);
              if (error) {
                setError("");
              }
            }}
            placeholder="Örnek: öğrenciler için ortak ders çalışma planlama uygulaması"
            error={error}
            minHeight={140}
          />

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Bu demoda ne olacak?</Text>
            <Text style={styles.infoText}>
              Fikrin alındıktan sonra problem, kullanıcı, MVP kapsamı ve kısıt üzerine 4 soru
              sorulacak. Sonunda tek sayfalık bir spec özeti üretilecek.
            </Text>
          </View>

          <PrimaryButton title="Sorulara Geç" onPress={handleContinue} />
        </SectionCard>

        <SectionCard style={styles.emptyStateCard}>
          <Text style={styles.emptyStateTitle}>Odaklı bir akış</Text>
          <Text style={styles.emptyStateText}>
            Bu uygulama tam Nokta platformu değil. Challenge için yalnızca fikir yakalama ve
            netleştirme akışına odaklanan küçük bir dilim sunuyor.
          </Text>
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
  hero: {
    paddingTop: spacing.md,
    gap: spacing.xs
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.text
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textMuted
  },
  infoBox: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 14,
    padding: spacing.md
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6
  },
  infoText: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted
  },
  emptyStateCard: {
    backgroundColor: "#F9FBFF"
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6
  },
  emptyStateText: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted
  }
});
