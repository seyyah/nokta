import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { CircularScore } from '@/components/circular-score';
import { AnalysisBottomSheet } from '@/components/analysis-bottom-sheet';
import type { SavedAnalysis } from '@/lib/slop-storage';
import { getSavedAnalyses, deleteAnalysis } from '@/lib/slop-storage';
import { useAppTheme } from '@/lib/theme-context';

export default function VaultScreen() {
  const { theme } = useAppTheme();
  const [items, setItems] = useState<SavedAnalysis[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<SavedAnalysis | null>(null);

  const bottomSheetRef = useRef<BottomSheet>(null);

  useFocusEffect(
    useCallback(() => {
      void getSavedAnalyses().then(setItems);
    }, [])
  );

  const handleOpenDetail = (entry: SavedAnalysis) => {
    setSelectedEntry(entry);
    bottomSheetRef.current?.expand();
  };

  const handleDelete = async (id: string) => {
    await deleteAnalysis(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <LinearGradient colors={theme.gradientColors} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={[styles.header, { color: theme.textPrimary }]}>Vault</Text>
          <Text style={[styles.subHeader, { color: theme.textSecondary }]}>
            Kaydedilen analizler burada tutulur.
          </Text>

          {items.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
              <MaterialCommunityIcons name="treasure-chest" size={54} color={theme.textSecondary} style={{ marginBottom: 10 }} />
              <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>Kasa şu an boş</Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                Dünyayı değiştirecek (veya slop olan) fikirlerini buraya kaydet!
              </Text>
            </View>
          ) : (
            items.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => handleOpenDetail(item)}
                style={({ pressed }) => [
                  styles.ideaCard,
                  { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder },
                  pressed && styles.ideaCardPressed,
                ]}>
                <View style={styles.ideaHeaderRow}>
                  <Text numberOfLines={1} style={[styles.ideaTitle, { color: theme.textPrimary }]}>
                    {item.ideaText}
                  </Text>
                  <Text style={styles.scorePill}>{item.result.slop_score}</Text>
                  <Pressable hitSlop={10} onPress={() => handleDelete(item.id)}>
                    <MaterialCommunityIcons name="trash-can-outline" size={20} color="#FE5E73" />
                  </Pressable>
                </View>
                <Text style={[styles.ideaDate, { color: theme.textSecondary }]}>
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
                <Text numberOfLines={2} style={[styles.ideaSummary, { color: theme.textSecondary }]}>
                  {item.result.analysis}
                </Text>
              </Pressable>
            ))
          )}
        </ScrollView>
      </SafeAreaView>

      <AnalysisBottomSheet
        ref={bottomSheetRef}
        result={selectedEntry?.result ?? null}
        ideaText={selectedEntry?.ideaText ?? ''}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 34,
    gap: 12,
  },
  header: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subHeader: {
    fontSize: 16,
    lineHeight: 22,
  },
  emptyCard: {
    marginTop: 10,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  ideaCard: {
    marginTop: 10,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  ideaCardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  ideaHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ideaTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
  },
  scorePill: {
    color: '#FFE1E1',
    backgroundColor: '#3A171C',
    borderWidth: 1,
    borderColor: '#B94150',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 13,
    fontWeight: '800',
  },
  ideaDate: {
    fontSize: 13,
  },
  ideaSummary: {
    fontSize: 14,
    lineHeight: 20,
  },
});
