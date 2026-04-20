import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import ExampleIdeaCard from "../components/ExampleIdeaCard";
import PrimaryButton from "../components/PrimaryButton";
import SectionCard from "../components/SectionCard";
import TextAreaField from "../components/TextAreaField";
import { colors, spacing } from "../constants/theme";

const EXAMPLE_IDEA =
  "Kampüste öğrencilerin boş sınıf bulmasını kolaylaştıran ve uygun saatleri gösteren mobil uygulama";

export default function HomeScreen({ initialIdea, onStart }) {
  const [idea, setIdea] = useState(initialIdea || "");
  const [error, setError] = useState("");

  const handleIdeaChange = (value) => {
    setIdea(value);

    if (error) {
      setError("");
    }
  };

  const handleUseExample = (value) => {
    setIdea(value);
    setError("");
  };

  const handleContinue = () => {
    const trimmed = idea.trim();

    if (!trimmed) {
      setError("Devam etmek için önce ham fikrini yaz.");
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
          <Text style={styles.eyebrow}>Track A</Text>
          <Text style={styles.title}>Nokta Capture</Text>
          <Text style={styles.subtitle}>
            Ham ürün fikrini birkaç cümleyle yaz. Sonraki adımda uygulama sana kısa takip
            soruları sorarak fikri daha net bir ürün özetine dönüştürecek.
          </Text>
        </View>

        <SectionCard>
          <TextAreaField
            label="Ham fikir"
            value={idea}
            onChangeText={handleIdeaChange}
            placeholder="Örnek: öğrenciler için ortak ders çalışma planlama uygulaması"
            error={error}
            minHeight={150}
          />

          <ExampleIdeaCard
            title="Hızlı başlamak istersen"
            description="Örnek bir fikir metniyle giriş alanını otomatik doldurabilirsin."
            exampleText={EXAMPLE_IDEA}
            onPress={handleUseExample}
          />

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Bu adımda ne oluyor?</Text>
            <Text style={styles.infoText}>
              Önce ham fikir alınır. Devam ettiğinde uygulama problem, kullanıcı, kapsam ve
              kısıt tarafını netleştirmek için 4 kısa soru sorar.
            </Text>
          </View>

          <PrimaryButton title="Devam Et" onPress={handleContinue} />
        </SectionCard>

        <SectionCard style={styles.noteCard}>
          <Text style={styles.noteTitle}>Odaklı başlangıç</Text>
          <Text style={styles.noteText}>
            Bu ekran özellikle ilk adımı hızlı ve anlaşılır tutmak için tasarlandı. Amaç uzun form
            doldurtmak değil, fikir girişindeki sürtünmeyi azaltmak.
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
  noteCard: {
    backgroundColor: "#F9FBFF"
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6
  },
  noteText: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted
  }
});
