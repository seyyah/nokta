import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIdea, IdeaSession } from "@/context/IdeaContext";
import { useColors } from "@/hooks/useColors";

function IdeaCard({
  session,
  onDelete,
  onView,
}: {
  session: IdeaSession;
  onDelete: (id: string) => void;
  onView: (session: IdeaSession) => void;
}) {
  const colors = useColors();
  const date = new Date(session.createdAt).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Pressable
      onPress={() => onView(session)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <View
          style={[styles.iconWrap, { backgroundColor: colors.secondary }]}
        >
          <Feather name="zap" size={16} color={colors.primary} />
        </View>
        <Text style={[styles.cardDate, { color: colors.mutedForeground }]}>
          {date}
        </Text>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert("Sil", "Bu fikri silmek istiyor musun?", [
              { text: "Vazgeç", style: "cancel" },
              {
                text: "Sil",
                style: "destructive",
                onPress: () => onDelete(session.id),
              },
            ]);
          }}
          hitSlop={12}
        >
          <Feather name="trash-2" size={16} color={colors.mutedForeground} />
        </Pressable>
      </View>
      <Text
        numberOfLines={2}
        style={[styles.cardIdea, { color: colors.foreground }]}
      >
        {session.rawIdea}
      </Text>
      <Text
        numberOfLines={1}
        style={[styles.cardProblem, { color: colors.mutedForeground }]}
      >
        Problem: {session.answers.problem}
      </Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { sessions, deleteSession, setCurrentRawIdea, resetCurrent, isLoading } =
    useIdea();
  const [idea, setIdea] = useState("");

  const topPad =
    Platform.OS === "web" ? 67 : insets.top;
  const bottomPad =
    Platform.OS === "web" ? 34 : 0;

  const handleStart = () => {
    const trimmed = idea.trim();
    if (!trimmed) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    resetCurrent();
    setCurrentRawIdea(trimmed);
    setIdea("");
    router.push("/questions");
  };

  const handleView = (session: IdeaSession) => {
    router.push({ pathname: "/spec", params: { sessionId: session.id } });
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Feather name="book-open" size={40} color={colors.mutedForeground} />
      <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
        Henüz fikir yok
      </Text>
      <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
        Aklındaki ham fikri yaz ve spec'e dönüştür
      </Text>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: topPad,
          paddingBottom: bottomPad,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Idea Tracker
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Fikrini yaz, spec'e dönüştür
        </Text>
      </View>

      <View
        style={[
          styles.inputBox,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <TextInput
          style={[styles.input, { color: colors.foreground }]}
          placeholder="Ham fikrini buraya yaz..."
          placeholderTextColor={colors.mutedForeground}
          value={idea}
          onChangeText={setIdea}
          multiline
          maxLength={500}
          returnKeyType="done"
        />
        <View style={styles.inputFooter}>
          <Text
            style={[styles.charCount, { color: colors.mutedForeground }]}
          >
            {idea.length}/500
          </Text>
          <Pressable
            onPress={handleStart}
            disabled={!idea.trim()}
            style={({ pressed }) => [
              styles.startBtn,
              {
                backgroundColor: idea.trim()
                  ? colors.primary
                  : colors.muted,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Feather
              name="arrow-right"
              size={18}
              color={idea.trim() ? colors.primaryForeground : colors.mutedForeground}
            />
          </Pressable>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Geçmiş Fikirler
        </Text>
        {sessions.length > 0 && (
          <View
            style={[styles.badge, { backgroundColor: colors.secondary }]}
          >
            <Text style={[styles.badgeText, { color: colors.primary }]}>
              {sessions.length}
            </Text>
          </View>
        )}
      </View>

      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <IdeaCard
            session={item}
            onDelete={deleteSession}
            onView={handleView}
          />
        )}
        ListEmptyComponent={!isLoading ? renderEmpty : null}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  inputBox: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 24,
  },
  input: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    minHeight: 80,
    lineHeight: 24,
  },
  inputFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  charCount: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  startBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  badge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cardDate: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  cardIdea: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    lineHeight: 22,
    marginBottom: 6,
  },
  cardProblem: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 40,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 20,
  },
});
