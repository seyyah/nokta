import { StyleSheet, Text, View } from 'react-native';
import { palette, shadows } from '../theme';
import { LockedBrief } from '../types/draft';

type LockedBriefCardProps = {
  brief: LockedBrief;
};

function Field({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

export function LockedBriefCard({ brief }: LockedBriefCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Bonus Capability</Text>
        </View>
        <Text style={styles.progress}>
          {brief.resolvedCount}/{brief.totalDecisionCount} decisions locked
        </Text>
      </View>

      <Text style={styles.title}>{brief.title}</Text>
      <Text style={styles.summary}>{brief.lockedSummary}</Text>

      <View style={styles.fieldGrid}>
        <Field label="Genre Direction" value={brief.labels.genreDirection} />
        <Field label="Prototype Platform" value={brief.labels.prototypePlatform} />
        <Field label="Combat Direction" value={brief.labels.combatDirection} />
        <Field label="Multiplayer" value={brief.labels.multiplayerDirection} />
        <Field label="Scope Metric" value={brief.labels.scopeMetric} />
      </View>

      <View style={styles.subsection}>
        <Text style={styles.subsectionTitle}>Locked Direction</Text>
        {brief.directionItems.map((item) => (
          <View key={item} style={styles.itemRow}>
            <View style={styles.bullet} />
            <Text style={styles.itemText}>{item}</Text>
          </View>
        ))}
      </View>

      <View style={styles.subsection}>
        <Text style={styles.subsectionTitle}>Handoff Focus</Text>
        {brief.featureFocus.map((item) => (
          <View key={item} style={styles.itemRow}>
            <View style={styles.bullet} />
            <Text style={styles.itemText}>{item}</Text>
          </View>
        ))}
      </View>

      <View style={styles.subsection}>
        <Text style={styles.subsectionTitle}>What Changed</Text>
        {brief.changeLog.map((item) => (
          <View key={item} style={styles.itemRow}>
            <View style={[styles.bullet, styles.changeBullet]} />
            <Text style={styles.itemText}>{item}</Text>
          </View>
        ))}
      </View>

      {brief.mentorFeedback ? (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Mentor Feedback Applied</Text>
          {[brief.mentorFeedback.summary, ...brief.mentorFeedback.nextActions].map((item) => (
            <View key={item} style={styles.itemRow}>
              <View style={[styles.bullet, styles.changeBullet]} />
              <Text style={styles.itemText}>{item}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {brief.unresolvedQuestions.length > 0 ? (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Still Open</Text>
          {brief.unresolvedQuestions.map((item) => (
            <View key={item} style={styles.itemRow}>
              <View style={[styles.bullet, styles.openBullet]} />
              <Text style={styles.itemText}>{item}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 14,
    ...shadows,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    backgroundColor: palette.blueSoft,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: palette.blueDeep,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  progress: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
    color: palette.muted,
  },
  title: {
    fontFamily: 'Newsreader_700Bold',
    fontSize: 30,
    lineHeight: 32,
    color: palette.ink,
    letterSpacing: -0.6,
  },
  summary: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 15,
    lineHeight: 23,
    color: palette.inkSoft,
  },
  fieldGrid: {
    gap: 10,
  },
  field: {
    backgroundColor: palette.surfaceMuted,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  fieldLabel: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
    color: palette.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  fieldValue: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 14,
    color: palette.ink,
  },
  subsection: {
    gap: 10,
  },
  subsectionTitle: {
    fontFamily: 'Newsreader_700Bold',
    fontSize: 24,
    color: palette.ink,
    letterSpacing: -0.4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 999,
    marginTop: 8,
    backgroundColor: palette.amber,
  },
  changeBullet: {
    backgroundColor: palette.success,
  },
  openBullet: {
    backgroundColor: palette.rust,
  },
  itemText: {
    flex: 1,
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    lineHeight: 22,
    color: palette.inkSoft,
  },
});
