import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BulletList } from '../components/BulletList';
import { CategoryRow } from '../components/CategoryRow';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScoreCard } from '../components/ScoreCard';
import { SectionCard } from '../components/SectionCard';
import { VerdictBadge } from '../components/VerdictBadge';
import { samplePitch } from '../data/samplePitch';
import { analyzePitch } from '../lib/scoring/analyzePitch';
import { getPalette } from '../theme/palette';
import { AnalysisResult } from '../types/analysis';

export function AnalyzerScreen() {
  const colorScheme = useColorScheme();
  const palette = getPalette(colorScheme);
  const styles = useMemo(() => createStyles(), []);

  const [pitch, setPitch] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handlePasteExample = () => {
    setPitch(samplePitch);
    setError(null);
  };

  const handleClear = () => {
    setPitch('');
    setAnalysis(null);
    setError(null);
    setIsAnalyzing(false);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleAnalyze = () => {
    if (!pitch.trim()) {
      setError('Paste a pitch paragraph before running analysis.');
      return;
    }

    setError(null);
    setIsAnalyzing(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      try {
        const result = analyzePitch(pitch);
        setAnalysis(result);
      } catch (analysisError) {
        setError(
          analysisError instanceof Error ? analysisError.message : 'Analysis failed. Please adjust the pitch and retry.'
        );
      } finally {
        setIsAnalyzing(false);
      }
    }, 850);
  };

  const handleAnalyzeAnother = () => {
    setAnalysis(null);
    setPitch('');
    setError(null);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: palette.textPrimary }]}>Nokta Slop Detector</Text>
        <Text style={[styles.subtitle, { color: palette.textSecondary }]}>Track B: due diligence style pre-screen for pitch quality.</Text>

        <View style={[styles.inputCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Text style={[styles.inputLabel, { color: palette.textPrimary }]}>Paste Pitch Paragraph</Text>
          <TextInput
            multiline
            placeholder="Paste the startup pitch here..."
            placeholderTextColor={palette.textMuted}
            value={pitch}
            onChangeText={(value) => {
              setPitch(value);
              if (error) {
                setError(null);
              }
            }}
            style={[
              styles.textInput,
              {
                color: palette.textPrimary,
                backgroundColor: palette.cardSoft,
                borderColor: palette.border
              }
            ]}
            textAlignVertical="top"
          />

          <Text style={[styles.helperText, { color: palette.textMuted }]}>
            Checks market-claim rigor, user clarity, feasibility, differentiation, evidence quality, and scope discipline.
          </Text>

          <View style={styles.secondaryButtons}>
            <PrimaryButton label="Paste Example" onPress={handlePasteExample} palette={palette} variant="secondary" />
            <PrimaryButton label="Clear" onPress={handleClear} palette={palette} variant="ghost" />
          </View>

          <View style={styles.analyzeButton}>
            <PrimaryButton
              label={isAnalyzing ? 'Analyzing...' : 'Analyze Pitch'}
              onPress={handleAnalyze}
              palette={palette}
              disabled={isAnalyzing}
              fullWidth
            />
          </View>

          {error ? <Text style={[styles.errorText, { color: palette.danger }]}>{error}</Text> : null}
        </View>

        {isAnalyzing ? (
          <View style={[styles.loadingCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <ActivityIndicator color={palette.accent} />
            <Text style={[styles.loadingText, { color: palette.textSecondary }]}>Scoring claim quality and generating diligence guidance...</Text>
          </View>
        ) : null}

        {analysis ? (
          <View style={styles.resultArea}>
            <ScoreCard score={analysis.score} palette={palette} />
            <VerdictBadge verdict={analysis.verdict} palette={palette} />

            <SectionCard title="Executive Summary" palette={palette}>
              <Text style={[styles.bodyText, { color: palette.textSecondary }]}>{analysis.summary}</Text>
            </SectionCard>

            <SectionCard title="Questionable Claims" palette={palette}>
              <BulletList
                items={analysis.suspiciousClaims}
                palette={palette}
                emptyText="No strongly suspicious claims were detected in this text."
              />
            </SectionCard>

            <SectionCard title="Reasoning by Category" palette={palette}>
              {analysis.categories.map((category) => (
                <CategoryRow
                  key={category.name}
                  name={category.name}
                  score={category.score}
                  explanation={category.explanation}
                  palette={palette}
                />
              ))}
            </SectionCard>

            <SectionCard title="Rewrite Suggestions" palette={palette}>
              <BulletList items={analysis.rewriteSuggestions} palette={palette} />
            </SectionCard>

            <SectionCard title="Due Diligence Checklist" palette={palette}>
              <BulletList items={analysis.diligenceChecklist} palette={palette} checklistMode />
            </SectionCard>

            <View style={styles.analyzeAnotherButton}>
              <PrimaryButton label="Analyze Another Pitch" onPress={handleAnalyzeAnother} palette={palette} variant="secondary" fullWidth />
            </View>

            <Text style={[styles.generatedAt, { color: palette.textMuted }]}>Generated: {new Date(analysis.generatedAt).toLocaleString()}</Text>
          </View>
        ) : null}

        <Text style={[styles.disclaimer, { color: palette.textMuted }]}>Local deterministic analyzer. Use as a diligence pre-screen, not a final investment decision.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles() {
  return StyleSheet.create({
    analyzeAnotherButton: {
      marginTop: 8
    },
    analyzeButton: {
      marginTop: 10
    },
    bodyText: {
      fontSize: 14,
      lineHeight: 21
    },
    content: {
      paddingBottom: 26,
      paddingHorizontal: 16,
      paddingTop: 10
    },
    disclaimer: {
      fontSize: 12,
      lineHeight: 18,
      marginTop: 18,
      textAlign: 'center'
    },
    errorText: {
      fontSize: 13,
      fontWeight: '600',
      marginTop: 10
    },
    generatedAt: {
      fontSize: 12,
      marginTop: 10,
      textAlign: 'right'
    },
    helperText: {
      fontSize: 12,
      lineHeight: 18,
      marginTop: 10
    },
    inputCard: {
      borderRadius: 16,
      borderWidth: 1,
      marginTop: 12,
      padding: 14
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '700',
      marginBottom: 10
    },
    loadingCard: {
      alignItems: 'center',
      borderRadius: 14,
      borderWidth: 1,
      marginTop: 16,
      padding: 16
    },
    loadingText: {
      fontSize: 13,
      marginTop: 10,
      textAlign: 'center'
    },
    resultArea: {
      marginTop: 2
    },
    safeArea: {
      flex: 1
    },
    secondaryButtons: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 6
    },
    subtitle: {
      fontSize: 14,
      lineHeight: 20,
      marginTop: 4
    },
    textInput: {
      borderRadius: 12,
      borderWidth: 1,
      fontSize: 14,
      lineHeight: 21,
      minHeight: 170,
      padding: 12
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      letterSpacing: 0.2
    }
  });
}
