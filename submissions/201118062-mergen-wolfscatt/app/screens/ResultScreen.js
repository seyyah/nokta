import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import SectionCard from "../components/SectionCard";
import { colors, spacing } from "../constants/theme";

function BulletList({ items }) {
  return (
    <View style={styles.list}>
      {items.map((item, index) => (
        <View key={`${item}-${index}`} style={styles.listItem}>
          <View style={styles.bullet} />
          <Text style={styles.listText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function SpecSection({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export default function ResultScreen({ idea, spec, onRestart, onBackToQuestions }) {
  if (!spec) {
    return (
      <View style={styles.emptyContainer}>
        <SectionCard>
          <Text style={styles.emptyTitle}>Henüz spec oluşturulmadı</Text>
          <Text style={styles.emptyText}>
            Önce fikir girip soru akışını tamamladığında bu ekranda ürün özeti görünecek.
          </Text>
          <PrimaryButton title="Başa Dön" onPress={onRestart} />
        </SectionCard>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.caption}>Tek sayfalık ürün özeti</Text>
        <Text style={styles.title}>{spec.title}</Text>
        <Text style={styles.subtitle}>{spec.summary}</Text>
      </View>

      <SectionCard style={styles.highlightCard}>
        <Text style={styles.badge}>{spec.category}</Text>
        <Text style={styles.highlightTitle}>Ham fikir</Text>
        <Text style={styles.highlightText}>{idea}</Text>
      </SectionCard>

      <SectionCard>
        <SpecSection title="Problem">
          <Text style={styles.bodyText}>{spec.problem}</Text>
        </SpecSection>

        <SpecSection title="Hedef kullanıcı">
          <Text style={styles.bodyText}>{spec.targetUser}</Text>
        </SpecSection>

        <SpecSection title="Değer önerisi">
          <Text style={styles.bodyText}>{spec.valueProposition}</Text>
        </SpecSection>

        <SpecSection title="MVP kapsamı">
          <BulletList items={spec.mvpItems.length ? spec.mvpItems : ["Tek temel kullanıcı akışı ile başlanmalı"]} />
        </SpecSection>

        <SpecSection title="Kısıt / risk">
          <Text style={styles.bodyText}>{spec.constraints}</Text>
        </SpecSection>

        <SpecSection title="İlk başarı sinyali">
          <Text style={styles.bodyText}>{spec.successMetric}</Text>
        </SpecSection>
      </SectionCard>

      <View style={styles.buttonGroup}>
        <PrimaryButton title="Yeniden Başlat" onPress={onRestart} />
        <PrimaryButton title="Cevapları Düzenle" variant="ghost" onPress={onBackToQuestions} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.lg
  },
  header: {
    paddingTop: spacing.sm,
    gap: spacing.xs
  },
  caption: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary
  },
  title: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "800",
    color: colors.text
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.textMuted
  },
  highlightCard: {
    backgroundColor: "#F9FBFF"
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.primarySoft,
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: spacing.sm
  },
  highlightTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6
  },
  highlightText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text
  },
  section: {
    marginBottom: spacing.lg
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.xs
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.textMuted
  },
  list: {
    gap: spacing.sm
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.accent,
    marginTop: 7
  },
  listText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 23,
    color: colors.textMuted
  },
  buttonGroup: {
    gap: spacing.sm,
    paddingBottom: spacing.md
  },
  emptyContainer: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: "center"
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing.sm
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.textMuted,
    marginBottom: spacing.lg
  }
});
