import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IdeaCard } from "@/components/IdeaCard";
import { useIdeas } from "@/context/IdeaContext";
import { useColors } from "@/hooks/useColors";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { ideas, removeIdea, isLoading } = useIdeas();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const completedCount = ideas.filter((i) => i.answers.filter((a) => a.answer.trim()).length === 5).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 16,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>Fikir Defteri</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>
            {ideas.length === 0 ? "İlk fikrini ekle" : `${ideas.length} fikir`}
          </Text>
        </View>
        {ideas.length > 0 && (
          <View style={[styles.statsChip, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.statsText, { color: colors.primary }]}>
              {completedCount} spec hazır
            </Text>
          </View>
        )}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Yükleniyor...</Text>
        </View>
      ) : ideas.length === 0 ? (
        <ScrollView contentContainerStyle={styles.emptyContainer}>
          <View style={[styles.emptyIconWrap, { backgroundColor: colors.secondary }]}>
            <Feather name="zap" size={36} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            Aklında bir fikir mi var?
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
            Ham fikrini gir, 5 engineering sorusu yanıtla, tek sayfalık spec al.
          </Text>
          <Pressable
            style={[styles.emptyButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/new")}
          >
            <Feather name="plus" size={18} color={colors.primaryForeground} />
            <Text style={[styles.emptyButtonText, { color: colors.primaryForeground }]}>
              Yeni Fikir Ekle
            </Text>
          </Pressable>
        </ScrollView>
      ) : (
        <FlatList
          data={ideas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <IdeaCard idea={item} onDelete={removeIdea} />
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: bottomPad + 100 },
          ]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={ideas.length > 0}
        />
      )}

      <Pressable
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: colors.primary,
            bottom: bottomPad + 24,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
        onPress={() => router.push("/new")}
      >
        <Feather name="plus" size={24} color={colors.primaryForeground} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  greeting: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  statsChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statsText: {
    fontSize: 13,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 15,
  },
  fab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6c63ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
});
