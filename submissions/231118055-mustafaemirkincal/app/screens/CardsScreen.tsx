import React from 'react';
import {
  FlatList,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { IdeaCard } from '../services/claudeApi';
import { RootStackParamList } from '../App';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Cards'>;
  route: RouteProp<RootStackParamList, 'Cards'>;
};

const CATEGORY_META: Record<
  IdeaCard['category'],
  { label: string; tint: string; badge: string; surface: string }
> = {
  idea: {
    label: 'Idea',
    tint: '#f59e0b',
    badge: 'rgba(245, 158, 11, 0.16)',
    surface: 'rgba(245, 158, 11, 0.05)',
  },
  task: {
    label: 'Task',
    tint: '#22d3ee',
    badge: 'rgba(34, 211, 238, 0.16)',
    surface: 'rgba(34, 211, 238, 0.05)',
  },
  decision: {
    label: 'Decision',
    tint: '#a78bfa',
    badge: 'rgba(167, 139, 250, 0.16)',
    surface: 'rgba(167, 139, 250, 0.05)',
  },
  risk: {
    label: 'Risk',
    tint: '#fb7185',
    badge: 'rgba(251, 113, 133, 0.16)',
    surface: 'rgba(251, 113, 133, 0.05)',
  },
  other: {
    label: 'Other',
    tint: '#94a3b8',
    badge: 'rgba(148, 163, 184, 0.16)',
    surface: 'rgba(148, 163, 184, 0.05)',
  },
};

function scoreLabel(score: number) {
  if (score >= 85) return 'strong';
  if (score >= 70) return 'good';
  if (score >= 55) return 'usable';
  return 'rough';
}

function CardItem({ card }: { card: IdeaCard }) {
  const meta = CATEGORY_META[card.category];

  async function handleShare() {
    await Share.share({
      message: `${card.title}\n\n${card.summary}\n\nMerged from lines: ${card.mergedFrom.join(
        ', ',
      )}`,
    });
  }

  return (
    <View style={[styles.card, { borderColor: meta.tint, backgroundColor: meta.surface }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.badge, { backgroundColor: meta.badge }]}>
          <Text style={[styles.badgeText, { color: meta.tint }]}>{meta.label}</Text>
        </View>

        <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
          <Text style={styles.shareBtnText}>Share</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.cardTitle}>{card.title}</Text>
      <Text style={styles.cardSummary}>{card.summary}</Text>

      <View style={styles.scoreRow}>
        <View style={styles.scoreMeta}>
          <Text style={styles.scoreLabel}>Score</Text>
          <Text style={[styles.scoreValue, { color: meta.tint }]}>{card.score}</Text>
        </View>
        <Text style={styles.scoreHint}>{scoreLabel(card.score)}</Text>
      </View>

      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${Math.min(100, Math.max(0, card.score))}%`, backgroundColor: meta.tint }]} />
      </View>

      <View style={styles.tagsRow}>
        {card.tags.map(tag => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>#{tag}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.lineInfo}>Merged from lines {card.mergedFrom.join(', ')}</Text>
    </View>
  );
}

export default function CardsScreen({ navigation, route }: Props) {
  const { cards } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.bgGlowTop} />
      <View style={styles.bgGlowBottom} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>{cards.length} idea cards</Text>
          <Text style={styles.headerSub}>Deduplicated and grouped from the original dump</Text>
        </View>
      </View>

      <FlatList
        data={cards}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <CardItem card={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No cards yet</Text>
            <Text style={styles.emptyText}>Go back and paste a note dump first.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07111f',
  },
  bgGlowTop: {
    position: 'absolute',
    top: -120,
    left: -110,
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor: 'rgba(245, 158, 11, 0.10)',
  },
  bgGlowBottom: {
    position: 'absolute',
    right: -80,
    bottom: -120,
    width: 240,
    height: 240,
    borderRadius: 240,
    backgroundColor: 'rgba(34, 211, 238, 0.08)',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  backBtn: {
    backgroundColor: 'rgba(248, 250, 252, 0.08)',
    borderColor: 'rgba(248, 250, 252, 0.12)',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  backText: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '800',
  },
  headerCopy: {
    flex: 1,
  },
  headerTitle: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '900',
  },
  headerSub: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  shareBtn: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderColor: 'rgba(148, 163, 184, 0.18)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  shareBtnText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '800',
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '900',
    marginBottom: 10,
  },
  cardSummary: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 14,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  scoreMeta: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  scoreLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  scoreHint: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
  barTrack: {
    backgroundColor: 'rgba(148, 163, 184, 0.14)',
    borderRadius: 999,
    height: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  barFill: {
    height: 8,
    borderRadius: 999,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  tag: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderColor: 'rgba(148, 163, 184, 0.15)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#dbe4ff',
    fontSize: 11,
    fontWeight: '700',
  },
  lineInfo: {
    color: '#7c8aa6',
    fontSize: 11,
  },
  emptyState: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderColor: 'rgba(148, 163, 184, 0.16)',
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    marginTop: 20,
  },
  emptyTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 6,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 20,
  },
});
