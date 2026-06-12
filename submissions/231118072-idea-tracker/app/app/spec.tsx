import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ParsedAnswers {
  problem?: string;
  targetUser?: string;
  scope?: string;
  constraints?: string;
  solution?: string;
}

// Scope cevabından inScope / outOfScope parse et
function parseScope(raw: string): { inScope: string[]; outOfScope: string[] } {
  const lines = raw.split(/\n|,|;/).map((l) => l.trim()).filter(Boolean);
  const inScope: string[] = [];
  const outOfScope: string[] = [];
  let mode: 'in' | 'out' | null = null;

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.includes('yapacak') || lower.includes('yapıyor') || lower.includes('içinde') || lower.includes('mvp')) {
      mode = 'in';
      const content = line.replace(/yapacak|mvp|içinde/gi, '').replace(':', '').trim();
      if (content) inScope.push(content);
    } else if (lower.includes('yapmayacak') || lower.includes('dışında') || lower.includes('değil')) {
      mode = 'out';
      const content = line.replace(/yapmayacak|dışında|değil/gi, '').replace(':', '').trim();
      if (content) outOfScope.push(content);
    } else if (mode === 'in') {
      inScope.push(line);
    } else if (mode === 'out') {
      outOfScope.push(line);
    } else {
      inScope.push(line);
    }
  }

  if (inScope.length === 0 && outOfScope.length === 0) {
    return { inScope: [raw], outOfScope: [] };
  }
  return { inScope, outOfScope };
}

function generateSpecText(
  productName: string,
  rawIdea: string,
  answers: ParsedAnswers,
  createdAt: string,
): string {
  const { inScope, outOfScope } = parseScope(answers.scope ?? '');
  const constraints = (answers.constraints ?? '')
    .split(/\n|,|;/)
    .map((c) => c.trim())
    .filter(Boolean);

  const lines = [
    '═══════════════════════════════════════',
    `  ${productName.toUpperCase()} — PRODUCT SPEC v1.0`,
    `  Tarih: ${createdAt}`,
    '═══════════════════════════════════════',
    '',
    'HAM FİKİR',
    `  ${rawIdea}`,
    '',
    'PROBLEM',
    `  ${answers.problem ?? '—'}`,
    '',
    'HEDEF KULLANICI',
    `  ${answers.targetUser ?? '—'}`,
    '',
    'MVP KAPSAMI',
    '  YAPACAKLAR:',
    ...inScope.map((s) => `    ✓ ${s}`),
    ...(outOfScope.length > 0
      ? ['  YAPMAYACAKLAR:', ...outOfScope.map((s) => `    ✗ ${s}`)]
      : []),
    '',
    'KISITLAR',
    ...constraints.map((c) => `  • ${c}`),
    '',
    'ÇÖZÜM YAKLAŞIMI',
    `  ${answers.solution ?? '—'}`,
    '',
    '═══════════════════════════════════════',
    '  Idea Tracker — github.com/zeynepyardimci/nokta',
    '═══════════════════════════════════════',
  ];

  return lines.join('\n');
}

export default function SpecScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    productName: string;
    rawIdea: string;
    answersJson: string;
  }>();

  const productName = params.productName ?? 'Ürünüm';
  const rawIdea = params.rawIdea ?? '';
  const answers: ParsedAnswers = params.answersJson
    ? JSON.parse(params.answersJson)
    : {};

  const createdAt = new Date().toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const [saved, setSaved] = useState(false);
  const { inScope, outOfScope } = parseScope(answers.scope ?? '');
  const constraints = (answers.constraints ?? '')
    .split(/\n|,|;/)
    .map((c) => c.trim())
    .filter(Boolean);

  useEffect(() => {
    // Otomatik kaydet
    saveSpec();
  }, []);

  const saveSpec = async () => {
    try {
      const session = {
        id: Date.now().toString(),
        productName,
        rawIdea,
        answers,
        createdAt,
      };
      const existing = await AsyncStorage.getItem('idea_tracker_sessions');
      const sessions = existing ? JSON.parse(existing) : [];
      sessions.unshift(session);
      await AsyncStorage.setItem('idea_tracker_sessions', JSON.stringify(sessions));
      setSaved(true);
    } catch (e) {
      console.warn('Kayıt hatası:', e);
    }
  };

  const handleShare = async () => {
    const specText = generateSpecText(productName, rawIdea, answers, createdAt);
    try {
      await Share.share({
        message: specText,
        title: `${productName} — Product Spec`,
      });
    } catch (e) {
      Alert.alert('Hata', 'Paylaşım sırasında bir sorun oluştu.');
    }
  };

  const handleNewIdea = () => {
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backBtnText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Spec Belgesi</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
          <Text style={styles.shareBtnText}>Paylaş</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={styles.specBadge}>
              <Text style={styles.specBadgeText}>SPEC v1.0</Text>
            </View>
            {saved && (
              <View style={styles.savedBadge}>
                <Text style={styles.savedBadgeText}>✓ Kaydedildi</Text>
              </View>
            )}
          </View>
          <Text style={styles.productName}>{productName}</Text>
          <Text style={styles.createdAt}>{createdAt}</Text>
        </View>

        {/* Raw Idea */}
        <SpecSection
          icon="🌱"
          title="Ham Fikir"
          color="#8888FF"
          content={<Text style={styles.sectionBody}>{rawIdea}</Text>}
        />

        {/* Problem */}
        <SpecSection
          icon="🎯"
          title="Problem"
          color="#6C63FF"
          content={<Text style={styles.sectionBody}>{answers.problem ?? '—'}</Text>}
        />

        {/* Target User */}
        <SpecSection
          icon="👤"
          title="Hedef Kullanıcı"
          color="#FF6B9D"
          content={<Text style={styles.sectionBody}>{answers.targetUser ?? '—'}</Text>}
        />

        {/* Scope */}
        <SpecSection
          icon="📦"
          title="MVP Kapsamı"
          color="#4ECDC4"
          content={
            <View>
              {inScope.length > 0 && (
                <>
                  <Text style={styles.scopeSubtitle}>✓ Yapacaklar</Text>
                  {inScope.map((item, i) => (
                    <View key={i} style={styles.scopeItem}>
                      <View style={[styles.scopeDot, { backgroundColor: '#4ECDC4' }]} />
                      <Text style={styles.scopeItemText}>{item}</Text>
                    </View>
                  ))}
                </>
              )}
              {outOfScope.length > 0 && (
                <>
                  <Text style={[styles.scopeSubtitle, { marginTop: 12 }]}>✗ Yapmayacaklar</Text>
                  {outOfScope.map((item, i) => (
                    <View key={i} style={styles.scopeItem}>
                      <View style={[styles.scopeDot, { backgroundColor: '#FF6B6B' }]} />
                      <Text style={[styles.scopeItemText, { color: '#AA8888' }]}>{item}</Text>
                    </View>
                  ))}
                </>
              )}
            </View>
          }
        />

        {/* Constraints */}
        <SpecSection
          icon="⛔"
          title="Kısıtlar"
          color="#FFB347"
          content={
            <View style={{ gap: 8 }}>
              {constraints.length > 0
                ? constraints.map((c, i) => (
                    <View key={i} style={styles.constraintRow}>
                      <Text style={styles.constraintBullet}>•</Text>
                      <Text style={styles.constraintText}>{c}</Text>
                    </View>
                  ))
                : <Text style={styles.sectionBody}>{answers.constraints ?? '—'}</Text>}
            </View>
          }
        />

        {/* Solution */}
        <SpecSection
          icon="💡"
          title="Çözüm Yaklaşımı"
          color="#A8E6CF"
          content={<Text style={styles.sectionBody}>{answers.solution ?? '—'}</Text>}
        />

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.shareFullBtn} onPress={handleShare} activeOpacity={0.8}>
            <Text style={styles.shareFullBtnText}>⬆ Spec'i Paylaş</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.newIdeaBtn} onPress={handleNewIdea} activeOpacity={0.8}>
            <Text style={styles.newIdeaBtnText}>+ Yeni Fikir</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>
          Idea Tracker · 231118072 · zeynepyardimci
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ── Sub-component ── */
function SpecSection({
  icon,
  title,
  color,
  content,
}: {
  icon: string;
  title: string;
  color: string;
  content: React.ReactNode;
}) {
  return (
    <View style={[sectionStyles.card, { borderColor: color + '30' }]}>
      <View style={sectionStyles.header}>
        <View style={[sectionStyles.iconBadge, { backgroundColor: color + '20' }]}>
          <Text style={sectionStyles.icon}>{icon}</Text>
        </View>
        <Text style={[sectionStyles.title, { color }]}>{title}</Text>
      </View>
      <View style={sectionStyles.body}>{content}</View>
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  card: {
    backgroundColor: '#14142A',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  body: {},
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: { paddingVertical: 4, paddingHorizontal: 2 },
  backBtnText: { fontSize: 15, color: '#8888AA', fontWeight: '600' },
  topBarTitle: { fontSize: 16, color: '#FFFFFF', fontWeight: '800' },
  shareBtn: {
    backgroundColor: '#6C63FF20',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#6C63FF50',
  },
  shareBtnText: { fontSize: 13, color: '#6C63FF', fontWeight: '700' },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  headerCard: {
    backgroundColor: '#14142A',
    borderWidth: 1.5,
    borderColor: '#6C63FF40',
    borderRadius: 18,
    padding: 22,
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  specBadge: {
    backgroundColor: '#6C63FF25',
    borderWidth: 1,
    borderColor: '#6C63FF50',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  specBadgeText: { fontSize: 11, color: '#6C63FF', fontWeight: '800', letterSpacing: 0.8 },
  savedBadge: {
    backgroundColor: '#4ECDC420',
    borderWidth: 1,
    borderColor: '#4ECDC450',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  savedBadgeText: { fontSize: 11, color: '#4ECDC4', fontWeight: '700' },
  productName: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  createdAt: { fontSize: 13, color: '#666680' },
  sectionBody: { fontSize: 14, color: '#AAAACC', lineHeight: 22 },
  scopeSubtitle: { fontSize: 12, fontWeight: '700', color: '#666680', marginBottom: 8, letterSpacing: 0.5 },
  scopeItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  scopeDot: { width: 6, height: 6, borderRadius: 3, marginTop: 7 },
  scopeItemText: { flex: 1, fontSize: 14, color: '#AAAACC', lineHeight: 21 },
  constraintRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  constraintBullet: { fontSize: 16, color: '#FFB347', lineHeight: 22 },
  constraintText: { flex: 1, fontSize: 14, color: '#AAAACC', lineHeight: 22 },
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 8, marginBottom: 20 },
  shareFullBtn: {
    flex: 1,
    backgroundColor: '#6C63FF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  shareFullBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  newIdeaBtn: {
    flex: 1,
    backgroundColor: '#16162A',
    borderWidth: 1.5,
    borderColor: '#2A2A4A',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  newIdeaBtnText: { color: '#8888AA', fontSize: 15, fontWeight: '700' },
  footerText: { fontSize: 11, color: '#333355', textAlign: 'center', marginTop: 4 },
});
