import { useState, useRef, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  Switch,
} from 'react-native';
import type { AiMode } from '@/lib/ai-service';

import BottomSheet from '@gorhom/bottom-sheet';

import { CircularScore } from '@/components/circular-score';
import { PremiumButton } from '@/components/premium-button';
import { AnalysisBottomSheet } from '@/components/analysis-bottom-sheet';
import type { SlopResult } from '@/constants/slop-types';
import { useAppTheme } from '@/lib/theme-context';
import { analyzeIdeaWithAiService } from '@/lib/ai-service';
import { saveAnalysis } from '@/lib/slop-storage';

export default function AnalyzeScreen() {
  const { theme } = useAppTheme();
  const [ideaText, setIdeaText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [latestResult, setLatestResult] = useState<SlopResult | null>(null);
  const [aiMode, setAiMode] = useState<AiMode>('mentor');
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { idea } = useLocalSearchParams<{ idea?: string }>();

  useEffect(() => {
    if (idea) {
      setIdeaText(idea);
    }
  }, [idea]);

  const loadingSteps = [
    "Checking technical feasibility...",
    "Scanning for buzzwords...",
    "Calculating Slop Score...",
    "Pivoting to AI...",
    "Destroying your dreams..."
  ];
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingStepIndex((prev) => (prev + 1) % loadingSteps.length);
      }, 1500);
      return () => clearInterval(interval);
    } else {
      setLoadingStepIndex(0);
    }
  }, [isLoading]);

  const handleOpenDetail = () => {
    bottomSheetRef.current?.expand();
  };

  const handleAnalyze = async () => {
    if (!ideaText.trim()) {
      Alert.alert('Fikir gerekli', 'Lutfen analiz etmek icin bir fikir metni gir.');
      return;
    }

    setIsLoading(true);
    const id = Date.now().toString();

    try {
      console.log('AI service istegi basladi...');
      const result = await analyzeIdeaWithAiService(ideaText.trim(), aiMode);
      console.log('AI service yaniti alindi.');

      await saveAnalysis({
        id,
        ideaText: ideaText.trim(),
        createdAt: new Date().toISOString(),
        result,
      });
      setLatestResult(result);
    } catch (error) {
      console.error('Analyze akisi hatasi:', error);
      Alert.alert('Baglanti hatasi, lutfen tekrar deneyin');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={theme.gradientColors} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.heroSection}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <MaterialCommunityIcons name="radar" size={28} color={theme.textPrimary} />
              <Text style={[styles.header, { color: theme.textPrimary }]}>Slop</Text>
            </View>
            <View style={styles.toggleWrapper}>
              <Text style={[styles.toggleLabel, { color: aiMode === 'roast' ? '#FE5E73' : '#36D887' }]}>
                {aiMode === 'roast' ? 'Y-Combinator' : 'Mentor Mode'}
              </Text>
              <Switch
                value={aiMode === 'roast'}
                onValueChange={(val) => setAiMode(val ? 'roast' : 'mentor')}
                trackColor={{ false: '#36D887', true: '#FE5E73' }}
                thumbColor={'#fff'}
              />
            </View>
          </View>
          <Text style={[styles.subHeader, { color: theme.textSecondary }]}>
            Yapay zeka ile girişim fikrindeki aşırı mühendislik ve buzzword riskini analiz et.
          </Text>

          {latestResult && (
            <View
              style={[
                styles.resultCard,
                { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder },
              ]}>
              <Text style={[styles.resultTitle, { color: theme.textPrimary }]}>Slop Skoru</Text>
              <CircularScore score={latestResult.slop_score} />
              <Text style={[styles.analysisText, { color: theme.textSecondary }]}>
                {latestResult.analysis}
              </Text>
              <PremiumButton
                onPress={handleOpenDetail}
                title="Açıklamaları Gör"
              />
            </View>
          )}

          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <View style={styles.inputHeaderRow}>
              <Text style={[styles.sectionTitle, { color: theme.textSecondary, marginBottom: 0 }]}>GIRISIM FIKRI</Text>
              {(ideaText.length > 0 || latestResult) ? (
                <Pressable onPress={() => { setIdeaText(''); setLatestResult(null); }} style={styles.clearBtn}>
                  <MaterialCommunityIcons name="trash-can-outline" size={16} color={theme.textSecondary} />
                  <Text style={[styles.clearBtnText, { color: theme.textSecondary }]}>Temizle</Text>
                </Pressable>
              ) : null}
            </View>
            <TextInput
              value={ideaText}
              onChangeText={setIdeaText}
              placeholder="Fikrini buraya yaz veya yapistir..."
              placeholderTextColor={theme.isDark ? '#7C88A8' : '#7081A7'}
              multiline
              textAlignVertical="top"
              style={[
                styles.input,
                {
                  color: theme.textPrimary,
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.inputBorder,
                },
              ]}
            />
            <PremiumButton
              onPress={handleAnalyze}
              disabled={isLoading}
              loading={isLoading}
              title="Analiz Et"
            />
            {isLoading && (
              <View style={styles.loadingInline}>
                <ActivityIndicator size="small" color={theme.textPrimary} />
                <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                  {loadingSteps[loadingStepIndex]}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      <AnalysisBottomSheet
        ref={bottomSheetRef}
        result={latestResult}
        ideaText={ideaText}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 14,
  },
  heroSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  toggleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleLabel: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subHeader: {
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    marginTop: 8,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  inputHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  input: {
    minHeight: 220,
    borderRadius: 16,
    borderWidth: 1,
    fontSize: 16,
    lineHeight: 23,
    paddingHorizontal: 15,
    paddingVertical: 14,
  },
  loadingInline: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '500',
  },
  resultCard: {
    marginTop: 8,
    borderRadius: 28,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  analysisText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
