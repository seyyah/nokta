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
import { EscalationSuggestionCard } from '../components/EscalationSuggestionCard';
import { ExpertRequestModal } from '../components/ExpertRequestModal';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScoreCard } from '../components/ScoreCard';
import { SectionCard } from '../components/SectionCard';
import { StatusChip, mapStatusToTone } from '../components/StatusChip';
import { VerdictBadge } from '../components/VerdictBadge';
import { samplePitch } from '../data/samplePitch';
import { REVIEW_STATUS_LABEL } from '../mock/expertReviewSeeds';
import { analyzePitch } from '../lib/scoring/analyzePitch';
import { ExpertReviewScreen } from './ExpertReviewScreen';
import { submitExpertReviewRequest, advanceExpertReviewStatus } from '../services/expertReviewService';
import { getPalette } from '../theme/palette';
import { AnalysisResult } from '../types/analysis';
import { ExpertCaseNote } from '../types/caseNotes';
import { ExpertReviewRequest } from '../types/expertReview';
import { saveExpertReviewToCaseNotes, listCaseNotes } from '../storage/caseNotesService';
import { deriveEscalationSignal } from '../utils/escalationOrchestrator';

type AppView = 'analysis' | 'expert';

const AUTO_ADVANCE_DELAY_MS: Record<'queued' | 'accepted' | 'in_review', number> = {
  queued: 2400,
  accepted: 2700,
  in_review: 3200
};

export function AnalyzerScreen() {
  const colorScheme = useColorScheme();
  const palette = getPalette(colorScheme);
  const styles = useMemo(() => createStyles(), []);

  const [pitch, setPitch] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeView, setActiveView] = useState<AppView>('analysis');

  const [manualDeeperReviewRequested, setManualDeeperReviewRequested] = useState(false);
  const [isRequestModalVisible, setIsRequestModalVisible] = useState(false);
  const [isSubmittingExpertRequest, setIsSubmittingExpertRequest] = useState(false);
  const [expertRequestError, setExpertRequestError] = useState<string | null>(null);

  const [expertReview, setExpertReview] = useState<ExpertReviewRequest | null>(null);
  const [expertFlowError, setExpertFlowError] = useState<string | null>(null);

  const [caseNotes, setCaseNotes] = useState<ExpertCaseNote[]>([]);
  const [isSavingCaseNote, setIsSavingCaseNote] = useState(false);
  const [caseNoteFeedback, setCaseNoteFeedback] = useState<string | null>(null);

  const analysisTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reviewTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const escalationSignal = useMemo(() => {
    if (!analysis) {
      return null;
    }

    return deriveEscalationSignal(analysis, manualDeeperReviewRequested);
  }, [analysis, manualDeeperReviewRequested]);

  useEffect(() => {
    const loadNotes = async () => {
      const notes = await listCaseNotes();
      setCaseNotes(notes);
    };

    void loadNotes();
  }, []);

  useEffect(() => {
    return () => {
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
      if (reviewTimeoutRef.current) {
        clearTimeout(reviewTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!expertReview) {
      return;
    }

    if (expertReview.status === 'completed') {
      return;
    }

    const delay = AUTO_ADVANCE_DELAY_MS[expertReview.status];

    reviewTimeoutRef.current = setTimeout(() => {
      const advance = async () => {
        try {
          const nextReview = await advanceExpertReviewStatus(expertReview);
          setExpertReview(nextReview);
          setExpertFlowError(null);
        } catch (flowError) {
          setExpertFlowError(flowError instanceof Error ? flowError.message : 'Unable to update expert review status.');
        }
      };

      void advance();
    }, delay);

    return () => {
      if (reviewTimeoutRef.current) {
        clearTimeout(reviewTimeoutRef.current);
      }
    };
  }, [expertReview]);

  const handlePasteExample = () => {
    setPitch(samplePitch);
    setError(null);
  };

  const resetExpertLayer = () => {
    setManualDeeperReviewRequested(false);
    setIsRequestModalVisible(false);
    setIsSubmittingExpertRequest(false);
    setExpertRequestError(null);
    setExpertReview(null);
    setExpertFlowError(null);
    setCaseNoteFeedback(null);
    setActiveView('analysis');
  };

  const handleClear = () => {
    setPitch('');
    setAnalysis(null);
    setError(null);
    setIsAnalyzing(false);
    resetExpertLayer();

    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current);
    }
  };

  const handleAnalyze = () => {
    if (!pitch.trim()) {
      setError('Paste a pitch paragraph before running analysis.');
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    resetExpertLayer();

    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current);
    }

    analysisTimeoutRef.current = setTimeout(() => {
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
    resetExpertLayer();
  };

  const handleNeedDeeperReview = () => {
    if (!analysis) {
      setError('Run AI analysis before requesting deeper review.');
      return;
    }

    setManualDeeperReviewRequested(true);
  };

  const handleOpenExpertRequestModal = () => {
    if (!analysis) {
      setError('Run AI analysis before requesting expert support.');
      return;
    }

    setExpertRequestError(null);
    setIsRequestModalVisible(true);
  };

  const handleSubmitExpertRequest = async (payload: { reason: ExpertReviewRequest['reason']; note: string }) => {
    if (!analysis) {
      return;
    }

    setIsSubmittingExpertRequest(true);
    setExpertRequestError(null);

    try {
      const request = await submitExpertReviewRequest({
        analysis,
        reason: payload.reason,
        note: payload.note,
        orchestrationReasons: escalationSignal?.reasons ?? []
      });

      setExpertReview(request);
      setIsRequestModalVisible(false);
      setActiveView('expert');
    } catch (submitError) {
      setExpertRequestError(
        submitError instanceof Error ? submitError.message : 'Failed to submit expert review request. Please retry.'
      );
    } finally {
      setIsSubmittingExpertRequest(false);
    }
  };

  const handleSaveCaseNote = async (review: ExpertReviewRequest) => {
    if (review.savedToCaseNotes || !review.outcome) {
      return;
    }

    setIsSavingCaseNote(true);
    setCaseNoteFeedback(null);

    try {
      await saveExpertReviewToCaseNotes(review);
      const notes = await listCaseNotes();

      setCaseNotes(notes);
      setCaseNoteFeedback('Saved to case notes and available for future evaluation context.');
      setExpertReview((previous) => {
        if (!previous || previous.id !== review.id) {
          return previous;
        }

        return {
          ...previous,
          savedToCaseNotes: true
        };
      });
    } catch (saveError) {
      setCaseNoteFeedback(saveError instanceof Error ? saveError.message : 'Failed to save case note.');
    } finally {
      setIsSavingCaseNote(false);
    }
  };

  if (activeView === 'expert') {
    return (
      <ExpertReviewScreen
        palette={palette}
        review={expertReview}
        onBack={() => setActiveView('analysis')}
        onSaveCaseNote={handleSaveCaseNote}
        isSavingCaseNote={isSavingCaseNote}
        saveFeedback={caseNoteFeedback}
      />
    );
  }

  const latestNotes = caseNotes.slice(0, 2);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: palette.textPrimary }]}>Nokta Slop Detector</Text>
        <Text style={[styles.subtitle, { color: palette.textSecondary }]}>Track B: AI first-pass analysis with human expert escalation.</Text>

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

          <Text style={[styles.helperText, { color: palette.textMuted }]}>Checks market claims, user clarity, feasibility, differentiation, evidence quality, and scope discipline.</Text>

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
            <Text style={[styles.loadingText, { color: palette.textSecondary }]}>Scoring claim quality and generating due diligence structure...</Text>
          </View>
        ) : null}

        {analysis ? (
          <View style={styles.resultArea}>
            <View style={styles.layerRow}>
              <StatusChip label="AI Analysis Layer" palette={palette} tone="info" />
              {expertReview ? (
                <StatusChip
                  label={`Human Review: ${REVIEW_STATUS_LABEL[expertReview.status]}`}
                  palette={palette}
                  tone={mapStatusToTone(expertReview.status)}
                />
              ) : null}
            </View>

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

            <SectionCard title="Human Expert Support" palette={palette}>
              <Text style={[styles.bodyText, { color: palette.textSecondary }]}>Nokta can escalate this analysis to a human expert for investor-grade review and deeper claim validation.</Text>

              {escalationSignal?.recommended ? (
                <EscalationSuggestionCard
                  palette={palette}
                  reasons={escalationSignal.reasons}
                  onRequestExpertReview={handleOpenExpertRequestModal}
                  onNeedDeeperReview={handleNeedDeeperReview}
                />
              ) : (
                <View style={[styles.manualHint, { backgroundColor: palette.cardSoft, borderColor: palette.border }]}>
                  <Text style={[styles.manualHintText, { color: palette.textSecondary }]}>No automatic escalation triggered. You can still request expert review manually.</Text>
                </View>
              )}

              <View style={styles.expertActionRow}>
                <PrimaryButton label="Request Expert Review" onPress={handleOpenExpertRequestModal} palette={palette} variant="primary" />
                <PrimaryButton label="Need deeper review" onPress={handleNeedDeeperReview} palette={palette} variant="secondary" />
              </View>

              {expertReview ? (
                <View style={[styles.reviewStatusBox, { backgroundColor: palette.cardSoft, borderColor: palette.border }]}>
                  <Text style={[styles.reviewStatusTitle, { color: palette.textPrimary }]}>Expert request in progress</Text>
                  <StatusChip
                    label={REVIEW_STATUS_LABEL[expertReview.status]}
                    palette={palette}
                    tone={mapStatusToTone(expertReview.status)}
                  />
                  <Text style={[styles.reviewStatusText, { color: palette.textSecondary }]}>Reason: {expertReview.reason}</Text>
                  <View style={styles.openReviewButton}>
                    <PrimaryButton label="Open Expert Review" onPress={() => setActiveView('expert')} palette={palette} variant="ghost" />
                  </View>
                </View>
              ) : null}

              {expertFlowError ? <Text style={[styles.errorText, { color: palette.danger }]}>{expertFlowError}</Text> : null}
            </SectionCard>

            {latestNotes.length > 0 ? (
              <SectionCard title="Case Notes" palette={palette}>
                <Text style={[styles.bodyText, { color: palette.textSecondary }]}>Latest saved expert writebacks:</Text>
                {latestNotes.map((note) => (
                  <View key={note.id} style={styles.noteRow}>
                    <Text style={[styles.noteLine, { color: palette.textSecondary }]} numberOfLines={2}>
                      {new Date(note.timestamp).toLocaleString()} | {note.goNoGo} | {note.expertName}
                    </Text>
                    <Text style={[styles.noteLineSmall, { color: palette.textMuted }]} numberOfLines={2}>
                      {note.expertVerdict}
                    </Text>
                  </View>
                ))}
              </SectionCard>
            ) : null}

            <View style={styles.analyzeAnotherButton}>
              <PrimaryButton label="Analyze Another Pitch" onPress={handleAnalyzeAnother} palette={palette} variant="secondary" fullWidth />
            </View>

            <Text style={[styles.generatedAt, { color: palette.textMuted }]}>Generated: {new Date(analysis.generatedAt).toLocaleString()}</Text>
          </View>
        ) : null}

        <Text style={[styles.disclaimer, { color: palette.textMuted }]}>AI provides first-pass structure. Human expert review is recommended for high-stakes diligence decisions.</Text>
      </ScrollView>

      <ExpertRequestModal
        visible={isRequestModalVisible}
        palette={palette}
        onClose={() => setIsRequestModalVisible(false)}
        onSubmit={handleSubmitExpertRequest}
        isSubmitting={isSubmittingExpertRequest}
        errorMessage={expertRequestError}
      />
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
    expertActionRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 12
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
    layerRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 6,
      marginTop: 10
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
    manualHint: {
      borderRadius: 12,
      borderWidth: 1,
      marginTop: 12,
      padding: 10
    },
    manualHintText: {
      fontSize: 13,
      lineHeight: 19
    },
    noteLine: {
      fontSize: 13,
      lineHeight: 18
    },
    noteLineSmall: {
      fontSize: 12,
      lineHeight: 17,
      marginTop: 4
    },
    noteRow: {
      marginTop: 10
    },
    openReviewButton: {
      marginTop: 10
    },
    resultArea: {
      marginTop: 2
    },
    reviewStatusBox: {
      borderRadius: 12,
      borderWidth: 1,
      marginTop: 12,
      padding: 12
    },
    reviewStatusText: {
      fontSize: 13,
      lineHeight: 19,
      marginTop: 8
    },
    reviewStatusTitle: {
      fontSize: 14,
      fontWeight: '700',
      marginBottom: 8
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
