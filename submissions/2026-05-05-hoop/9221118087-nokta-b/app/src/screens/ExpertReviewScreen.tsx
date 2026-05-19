import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BulletList } from '../components/BulletList';
import { ExpertProfileCard } from '../components/ExpertProfileCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { SectionCard } from '../components/SectionCard';
import { StatusChip, mapStatusToTone } from '../components/StatusChip';
import { REVIEW_STATUS_LABEL, REVIEW_STATUS_ORDER } from '../mock/expertReviewSeeds';
import { AppPalette } from '../theme/palette';
import { ExpertReviewRequest, GoNoGoRecommendation } from '../types/expertReview';

type ExpertReviewScreenProps = {
  palette: AppPalette;
  review: ExpertReviewRequest | null;
  onBack: () => void;
  onSaveCaseNote: (review: ExpertReviewRequest) => Promise<void> | void;
  isSavingCaseNote: boolean;
  saveFeedback: string | null;
};

function goNoGoTone(value: GoNoGoRecommendation): 'danger' | 'warning' | 'success' {
  if (value === 'Not ready') {
    return 'danger';
  }

  if (value === 'Needs revision') {
    return 'warning';
  }

  return 'success';
}

export function ExpertReviewScreen({
  palette,
  review,
  onBack,
  onSaveCaseNote,
  isSavingCaseNote,
  saveFeedback
}: ExpertReviewScreenProps) {
  if (!review) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
        <View style={styles.emptyStateWrap}>
          <Text style={[styles.emptyTitle, { color: palette.textPrimary }]}>No expert request yet</Text>
          <Text style={[styles.emptySubtitle, { color: palette.textSecondary }]}>Submit an expert request from the AI analysis screen to start human review.</Text>
          <View style={styles.emptyButton}>
            <PrimaryButton label="Back to AI analysis" onPress={onBack} palette={palette} variant="secondary" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topActions}>
          <PrimaryButton label="Back to AI analysis" onPress={onBack} palette={palette} variant="ghost" />
        </View>

        <Text style={[styles.title, { color: palette.textPrimary }]}>Human Expert Review</Text>
        <Text style={[styles.subtitle, { color: palette.textSecondary }]}>Expert escalation workspace for this pitch case.</Text>

        <View style={[styles.statusCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Text style={[styles.statusLabel, { color: palette.textMuted }]}>Request Status</Text>
          <StatusChip label={REVIEW_STATUS_LABEL[review.status]} palette={palette} tone={mapStatusToTone(review.status)} />

          <View style={styles.timelineWrap}>
            {REVIEW_STATUS_ORDER.map((statusItem, index) => {
              const reached = REVIEW_STATUS_ORDER.indexOf(review.status) >= index;
              return (
                <View key={statusItem} style={styles.timelineRow}>
                  <View
                    style={[
                      styles.timelineDot,
                      {
                        backgroundColor: reached ? palette.accent : palette.cardSoft,
                        borderColor: reached ? palette.accent : palette.border
                      }
                    ]}
                  />
                  <Text style={[styles.timelineText, { color: reached ? palette.textPrimary : palette.textMuted }]}>
                    {REVIEW_STATUS_LABEL[statusItem]}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <SectionCard title="Escalation Request" palette={palette}>
          <Text style={[styles.body, { color: palette.textSecondary }]}>Reason: {review.reason}</Text>
          <Text style={[styles.body, { color: palette.textSecondary }]}>Note: {review.note || 'No additional note provided.'}</Text>
          <Text style={[styles.bodyMuted, { color: palette.textMuted }]}>Created: {new Date(review.createdAt).toLocaleString()}</Text>
        </SectionCard>

        <SectionCard title="Original Pitch" palette={palette}>
          <Text style={[styles.body, { color: palette.textSecondary }]}>{review.pitch}</Text>
        </SectionCard>

        <SectionCard title="AI First-Pass Summary" palette={palette}>
          <Text style={[styles.body, { color: palette.textSecondary }]}>{review.aiSummary}</Text>
        </SectionCard>

        <SectionCard title="Assigned Reviewer" palette={palette}>
          <ExpertProfileCard reviewer={review.reviewer} palette={palette} />
        </SectionCard>

        <SectionCard title="Expert Comments" palette={palette}>
          <BulletList items={review.expertComments} palette={palette} />
          {review.status !== 'completed' ? (
            <View style={styles.pendingBox}>
              <ActivityIndicator color={palette.accent} />
              <Text style={[styles.pendingText, { color: palette.textSecondary }]}>Review is in progress. Findings will appear once completed.</Text>
            </View>
          ) : null}
        </SectionCard>

        {review.outcome ? (
          <>
            <SectionCard title="Final Expert Verdict" palette={palette}>
              <Text style={[styles.body, { color: palette.textSecondary }]}>{review.outcome.verdict}</Text>
              <View style={styles.goNoGoWrap}>
                <Text style={[styles.bodyMuted, { color: palette.textMuted }]}>Go / No-Go</Text>
                <StatusChip label={review.outcome.goNoGo} palette={palette} tone={goNoGoTone(review.outcome.goNoGo)} />
              </View>
            </SectionCard>

            <SectionCard title="Top 3 Concerns" palette={palette}>
              <BulletList items={review.outcome.topConcerns} palette={palette} />
            </SectionCard>

            <SectionCard title="Top 3 Improvements" palette={palette}>
              <BulletList items={review.outcome.topImprovements} palette={palette} />
            </SectionCard>

            <SectionCard title="AI Said vs Expert Added" palette={palette}>
              <Text style={[styles.bodyLabel, { color: palette.textMuted }]}>AI said</Text>
              <Text style={[styles.body, { color: palette.textSecondary }]}>{review.aiSummary}</Text>
              <Text style={[styles.bodyLabel, styles.spacingTop, { color: palette.textMuted }]}>Expert added</Text>
              <Text style={[styles.body, { color: palette.textSecondary }]}>{review.outcome.expertAdded}</Text>
            </SectionCard>

            <SectionCard title="Case Notes Writeback" palette={palette}>
              <Text style={[styles.body, { color: palette.textSecondary }]}>Store this expert outcome as reusable diligence context for future evaluations.</Text>
              <View style={styles.saveButtonWrap}>
                <PrimaryButton
                  label={review.savedToCaseNotes ? 'Already saved to case notes' : isSavingCaseNote ? 'Saving...' : 'Save expert review to case notes'}
                  onPress={() => onSaveCaseNote(review)}
                  palette={palette}
                  variant="secondary"
                  disabled={review.savedToCaseNotes || isSavingCaseNote}
                  fullWidth
                />
              </View>
              {saveFeedback ? <Text style={[styles.saveFeedback, { color: palette.textMuted }]}>{saveFeedback}</Text> : null}
            </SectionCard>
          </>
        ) : null}

        <View style={styles.bottomAction}>
          <PrimaryButton label="Back to AI analysis" onPress={onBack} palette={palette} variant="primary" fullWidth />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6
  },
  bodyLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
    textTransform: 'uppercase'
  },
  bodyMuted: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2
  },
  bottomAction: {
    marginTop: 18
  },
  content: {
    paddingBottom: 24,
    paddingHorizontal: 16,
    paddingTop: 10
  },
  emptyButton: {
    marginTop: 16
  },
  emptyStateWrap: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24
  },
  emptySubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center'
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800'
  },
  goNoGoWrap: {
    marginTop: 10
  },
  pendingBox: {
    alignItems: 'center',
    marginTop: 10
  },
  pendingText: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
    textAlign: 'center'
  },
  safeArea: {
    flex: 1
  },
  saveButtonWrap: {
    marginTop: 10
  },
  saveFeedback: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 8
  },
  spacingTop: {
    marginTop: 10
  },
  statusCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
    padding: 14
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginBottom: 8,
    textTransform: 'uppercase'
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4
  },
  timelineDot: {
    borderRadius: 999,
    borderWidth: 1,
    height: 10,
    marginRight: 8,
    width: 10
  },
  timelineRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 6
  },
  timelineText: {
    fontSize: 13,
    fontWeight: '600'
  },
  timelineWrap: {
    marginTop: 8
  },
  title: {
    fontSize: 28,
    fontWeight: '800'
  },
  topActions: {
    alignSelf: 'flex-start'
  }
});
