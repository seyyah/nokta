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
import { BridgeBrief } from '../services/claudeApi';
import { RootStackParamList } from '../App';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Bridge'>;
  route: RouteProp<RootStackParamList, 'Bridge'>;
};

const PRIORITY_META: Record<
  'high' | 'medium' | 'low',
  { label: string; tint: string; badge: string }
> = {
  high: { label: 'High', tint: '#fb7185', badge: 'rgba(251, 113, 133, 0.16)' },
  medium: { label: 'Medium', tint: '#fbbf24', badge: 'rgba(251, 191, 36, 0.16)' },
  low: { label: 'Low', tint: '#22d3ee', badge: 'rgba(34, 211, 238, 0.16)' },
};

export default function BridgeScreen({ navigation, route }: Props) {
  const { brief } = route.params;

  async function handleShare() {
    const message = [
      brief.title,
      '',
      brief.summary,
      '',
      `Decision: ${brief.humanDecision}`,
      '',
      `Next: ${brief.nextStep}`,
      '',
      'Questions:',
      ...brief.questions.map(question => `- ${question.text}`),
    ].join('\n');

    await Share.share({ message });
  }

  return (
    <View style={styles.container}>
      <View style={styles.bgGlowTop} />
      <View style={styles.bgGlowBottom} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Bridge to human support</Text>
          <Text style={styles.headerSub}>Week 2 slice: human expertise, not just AI output</Text>
        </View>
      </View>

      <FlatList
        data={brief.questions}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.hero}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>{brief.tags.slice(0, 3).join(' • ')}</Text>
            </View>
            <Text style={styles.heroTitle}>{brief.title}</Text>
            <Text style={styles.heroCopy}>{brief.summary}</Text>

            <View style={styles.callout}>
              <Text style={styles.calloutLabel}>Human decision</Text>
              <Text style={styles.calloutText}>{brief.humanDecision}</Text>
            </View>

            <View style={styles.calloutAlt}>
              <Text style={styles.calloutLabel}>Next step</Text>
              <Text style={styles.calloutText}>{brief.nextStep}</Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity onPress={handleShare} style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>Share to expert</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('Forge')}
                style={styles.secondaryBtn}
              >
                <Text style={styles.secondaryBtnText}>Open forge</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const meta = PRIORITY_META[item.priority];

          return (
            <View style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <View style={[styles.badge, { backgroundColor: meta.badge }]}>
                  <Text style={[styles.badgeText, { color: meta.tint }]}>{meta.label}</Text>
                </View>
                <Text style={styles.questionId}>#{item.id}</Text>
              </View>
              <Text style={styles.questionText}>{item.text}</Text>
              <Text style={styles.questionWhy}>{item.why}</Text>
            </View>
          );
        }}
        ListFooterComponent={
          <View style={styles.footer}>
            <Text style={styles.footerTitle}>Bridge note</Text>
            <Text style={styles.footerText}>
              If the expert answer still expands the scope, feed only the updated clarification
              back into the dedup flow. Do not reopen the whole dump.
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07131d',
  },
  bgGlowTop: {
    position: 'absolute',
    top: -120,
    right: -100,
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor: 'rgba(34, 211, 238, 0.10)',
  },
  bgGlowBottom: {
    position: 'absolute',
    left: -90,
    bottom: -100,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: 'rgba(245, 158, 11, 0.10)',
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
  hero: {
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderColor: 'rgba(148, 163, 184, 0.16)',
    borderWidth: 1,
    borderRadius: 28,
    padding: 20,
    marginBottom: 14,
  },
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(34, 211, 238, 0.12)',
    borderColor: 'rgba(34, 211, 238, 0.24)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
  },
  pillText: {
    color: '#67e8f9',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#f8fafc',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
    marginBottom: 10,
  },
  heroCopy: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 22,
  },
  callout: {
    marginTop: 16,
    backgroundColor: 'rgba(248, 250, 252, 0.04)',
    borderColor: 'rgba(251, 191, 36, 0.18)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  calloutAlt: {
    marginTop: 12,
    backgroundColor: 'rgba(248, 250, 252, 0.04)',
    borderColor: 'rgba(34, 211, 238, 0.18)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  calloutLabel: {
    color: '#fcd34d',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  calloutText: {
    color: '#e2e8f0',
    fontSize: 13,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '900',
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: 'rgba(248, 250, 252, 0.06)',
    borderColor: 'rgba(248, 250, 252, 0.12)',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '800',
  },
  questionCard: {
    backgroundColor: 'rgba(8, 15, 33, 0.92)',
    borderColor: 'rgba(148, 163, 184, 0.16)',
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  questionId: {
    color: '#7c8aa6',
    fontSize: 11,
    fontWeight: '700',
  },
  questionText: {
    color: '#f8fafc',
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '900',
    marginBottom: 8,
  },
  questionWhy: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 20,
  },
  footer: {
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    borderColor: 'rgba(148, 163, 184, 0.16)',
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    marginTop: 4,
  },
  footerTitle: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 6,
  },
  footerText: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 18,
  },
});
