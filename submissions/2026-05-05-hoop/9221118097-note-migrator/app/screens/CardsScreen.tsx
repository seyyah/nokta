import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Share,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { IdeaCard } from '../services/claudeApi';
import { RootStackParamList } from '../App';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Cards'>;
  route: RouteProp<RootStackParamList, 'Cards'>;
};

const CATEGORY_EMOJI: Record<IdeaCard['category'], string> = {
  recipe: '🍳',
  study: '📚',
  reminder: '⏰',
  tip: '💡',
  other: '📌',
};

const CATEGORY_COLOR: Record<IdeaCard['category'], string> = {
  recipe: '#ff6b35',
  study: '#4a9eff',
  reminder: '#f5c518',
  tip: '#4caf50',
  other: '#9e9e9e',
};

function ScoreBar({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  return (
    <View style={styles.scoreRow}>
      <Text style={styles.scoreLabel}>Quality</Text>
      <View style={styles.scoreTrack}>
        <View style={[styles.scoreFill, { flex: clamped }]} />
        <View style={{ flex: 100 - clamped }} />
      </View>
      <Text style={styles.scoreNum}>{score}</Text>
    </View>
  );
}

function CardItem({ card }: { card: IdeaCard }) {
  const emoji = CATEGORY_EMOJI[card.category];
  const color = CATEGORY_COLOR[card.category];

  async function handleShare() {
    await Share.share({ message: `${card.title}\n\n${card.summary}` });
  }

  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardEmoji}>{emoji}</Text>
        <View style={styles.cardTitleBlock}>
          <Text style={styles.cardTitle}>{card.title}</Text>
          <Text style={[styles.cardCategory, { color }]}>{card.category.toUpperCase()}</Text>
        </View>
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
          <Text style={styles.shareBtnText}>↑</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.cardSummary}>{card.summary}</Text>

      <ScoreBar score={card.score} />

      <View style={styles.tagsRow}>
        {card.tags.map(tag => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>#{tag}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.mergedFrom}>
        🔗 Merged from lines: {card.mergedFrom.join(', ')}
      </Text>
    </View>
  );
}

export default function CardsScreen({ navigation, route }: Props) {
  const { cards } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{cards.length} Ideas Extracted</Text>
      </View>

      <FlatList
        data={cards}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <CardItem card={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f14' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 52,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
  },
  backBtn: { marginRight: 12 },
  backText: { color: '#6c47ff', fontSize: 15 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  list: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#1a1a24',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderLeftWidth: 4,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardEmoji: { fontSize: 28, marginRight: 10 },
  cardTitleBlock: { flex: 1 },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cardCategory: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  shareBtn: {
    backgroundColor: '#2a2a38',
    borderRadius: 8,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtnText: { color: '#aaa', fontSize: 16 },
  cardSummary: { color: '#ccc', fontSize: 14, lineHeight: 20, marginBottom: 12 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  scoreLabel: { color: '#666', fontSize: 11, width: 42 },
  scoreTrack: {
    flex: 1,
    height: 4,
    flexDirection: 'row',
    backgroundColor: '#2a2a38',
    borderRadius: 2,
    marginHorizontal: 8,
  },
  scoreFill: { height: 4, backgroundColor: '#6c47ff', borderRadius: 2 },
  scoreNum: { color: '#888', fontSize: 11, width: 24, textAlign: 'right' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  tag: { backgroundColor: '#2a2a38', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginRight: 6, marginBottom: 4 },
  tagText: { color: '#888', fontSize: 11 },
  mergedFrom: { color: '#555', fontSize: 11 },
});
