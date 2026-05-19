import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  ActivityIndicator,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { generateSpec } from '../services/aiService';
import { saveIdea } from '../services/storageService';

export default function SpecScreen({ navigation, route }) {
  const { rawIdea, answers } = route.params;
  const [spec, setSpec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadSpec();
  }, []);

  const loadSpec = async () => {
    setLoading(true);
    try {
      const result = await generateSpec(rawIdea, answers);
      setSpec(result);

      // Animate entry
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();

      // Animate trust score
      Animated.timing(scoreAnim, {
        toValue: result.trustScore,
        duration: 1500,
        useNativeDriver: false,
      }).start();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!spec) return;
    await saveIdea({
      rawIdea,
      answers,
      spec,
    });
    setSaved(true);
  };

  const handleShare = async () => {
    if (!spec) return;
    const text = `📋 ${spec.title}\n\nProblem: ${spec.problemStatement}\nKullanıcı: ${spec.targetUser}\nDeğer: ${spec.valueProposition}\n\nTrust Score: ${spec.trustScore}/100\n\n— NisaDot ile üretildi ✨`;
    await Share.share({ message: text });
  };

  const getScoreColor = (score) => {
    if (score >= 75) return '#00b894';
    if (score >= 50) return '#fdcb6e';
    return '#d63031';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Mükemmel';
    if (score >= 60) return 'İyi';
    if (score >= 40) return 'Geliştirilmeli';
    return 'Zayıf';
  };

  if (loading) {
    return (
      <LinearGradient colors={['#0a0a1a', '#1a1a3e', '#0a0a1a']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6c5ce7" />
        <Text style={styles.loadingText}>Spesifikasyon üretiliyor...</Text>
        <Text style={styles.loadingSubtext}>Noktanız evrene dönüşüyor ‧→✨</Text>
      </LinearGradient>
    );
  }

  if (!spec) return null;

  return (
    <LinearGradient colors={['#0a0a1a', '#1a1a3e', '#0a0a1a']} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.backText}>← Ana Sayfa</Text>
        </TouchableOpacity>

        {/* Step indicator */}
        <View style={styles.stepIndicator}>
          <View style={styles.stepDot} />
          <View style={styles.stepLine} />
          <View style={styles.stepDot} />
          <View style={styles.stepLine} />
          <View style={[styles.stepDot, styles.stepActive]} />
        </View>
        <Text style={styles.stepLabel}>Adım 3/3 — Spesifikasyon</Text>

        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Trust Score Card */}
          <View style={styles.scoreCard}>
            <Text style={styles.scoreTitle}>Trust Score</Text>
            <Text
              style={[styles.scoreValue, { color: getScoreColor(spec.trustScore) }]}
            >
              {spec.trustScore}
              <Text style={styles.scoreMax}>/100</Text>
            </Text>
            <Text
              style={[styles.scoreLabel, { color: getScoreColor(spec.trustScore) }]}
            >
              {getScoreLabel(spec.trustScore)}
            </Text>
            <Text style={styles.scoreReason}>{spec.trustReason}</Text>
          </View>

          {/* Spec Title */}
          <Text style={styles.specTitle}>{spec.title}</Text>

          {/* Spec Sections */}
          <SpecSection
            emoji="🎯"
            title="Problem Statement"
            content={spec.problemStatement}
          />
          <SpecSection
            emoji="👤"
            title="Target User"
            content={spec.targetUser}
          />
          <SpecSection
            emoji="💎"
            title="Value Proposition"
            content={spec.valueProposition}
          />

          {/* MVP Features */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEmoji}>📐</Text>
              <Text style={styles.sectionTitle}>MVP Features</Text>
            </View>
            {spec.mvpFeatures?.map((f, i) => (
              <View key={i} style={styles.featureItem}>
                <Text style={styles.featureBullet}>▸</Text>
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>

          <SpecSection
            emoji="⚠️"
            title="Constraints"
            content={spec.constraints}
          />
          <SpecSection
            emoji="🚀"
            title="Farklılaşma"
            content={spec.differentiation}
          />

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity onPress={handleSave} activeOpacity={0.8}>
              <LinearGradient
                colors={saved ? ['#00b894', '#00cec9'] : ['#6c5ce7', '#a29bfe']}
                style={styles.saveButton}
              >
                <Text style={styles.saveButtonText}>
                  {saved ? '✅ Kaydedildi' : '💾 Kaydet'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShare}
              activeOpacity={0.8}
            >
              <Text style={styles.shareButtonText}>📤 Paylaş</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.newIdeaButton}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.8}
          >
            <Text style={styles.newIdeaText}>✨ Yeni Fikir Başlat</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

function SpecSection({ emoji, title, content }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionEmoji}>{emoji}</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <Text style={styles.sectionContent}>{content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
  },
  loadingSubtext: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    marginTop: 8,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  stepActive: {
    backgroundColor: '#00b894',
    shadowColor: '#00b894',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 6,
  },
  stepLabel: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    marginBottom: 24,
  },
  scoreCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 28,
    alignItems: 'center',
    marginBottom: 28,
  },
  scoreTitle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: '800',
  },
  scoreMax: {
    fontSize: 24,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.3)',
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 12,
  },
  scoreReason: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  specTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  sectionTitle: {
    color: '#a29bfe',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionContent: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    lineHeight: 22,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  featureBullet: {
    color: '#6c5ce7',
    fontSize: 16,
    marginRight: 8,
    marginTop: 1,
  },
  featureText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    marginBottom: 14,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  shareButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 30,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  newIdeaButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  newIdeaText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#a29bfe',
  },
});
