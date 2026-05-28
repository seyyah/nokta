import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GlowDot from '../components/GlowDot';
import { colors } from '../constants/colors';

// Subtle star particle component
function Star({ x, y, size }) {
  const opacity = useRef(new Animated.Value(Math.random())).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 1500 + Math.random() * 2000, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.1, duration: 1500 + Math.random() * 2000, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return <Animated.View style={{ position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: size / 2, backgroundColor: '#fff', opacity }} />;
}

const STARS = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  x: Math.random() * 400,
  y: Math.random() * 800,
  size: Math.random() < 0.3 ? 2 : 1,
}));

export default function HomeScreen({ navigation }) {
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [stuckCount, setStuckCount] = useState(0);

  const handleStart = async () => {
    if (!idea.trim() || loading) return;
    navigation.navigate('Chat', { idea: idea.trim() });
  };

  return (
    <LinearGradient colors={['#080814', '#0D0B24', '#080814']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Star particles */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {STARS.map((s) => <Star key={s.id} x={s.x} y={s.y} size={s.size} />)}
      </View>

      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Logo + top buttons */}
        <View style={styles.topRow}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Voice')} 
            style={[styles.topBtn, { borderColor: 'rgba(74,222,128,0.4)', backgroundColor: 'rgba(74,222,128,0.05)' }]}
          >
            <Text style={[styles.topBtnText, { color: '#4ade80' }]}>🎙️ Ses Modu</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('History')} style={styles.topBtn}>
            <Text style={styles.topBtnText}>📋 Geçmiş</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Expert', {})} style={styles.topBtn}>
            <Text style={styles.topBtnText}>👨‍🔬 Uzman</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.logo}>nokta</Text>
        <Text style={styles.tagline}>Human-Guided Idea Engine · v2</Text>

        {/* Glow dot */}
        <View style={styles.dotWrap}>
          <GlowDot size={20} phase={idlePhase()} />
        </View>

        {/* Input card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Aklındaki fikri buraya bırak</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn: Üniversite öğrencileri için ders notu paylaşım ağı..."
            placeholderTextColor={colors.textDim}
            multiline
            numberOfLines={4}
            value={idea}
            onChangeText={setIdea}
            maxLength={500}
          />
          <Text style={styles.charCount}>{idea.length}/500</Text>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.btn, !idea.trim() && styles.btnDisabled]}
          onPress={handleStart}
          disabled={!idea.trim() || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={colors.bg} />
          ) : (
            <Text style={styles.btnText}>Fikri Enrich Et →</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.hint}>AI sana 5 mühendislik sorusu soracak</Text>

        {/* Forge Status Widget */}
        <View style={styles.forgeCard}>
          <Text style={styles.forgeTitle}>🛠️ Forge Döngüsü İzleyici</Text>
          <Text style={styles.forgeStatus}>
            Durum: {stuckCount >= 2 ? '🚨 TIKANDI (STUCK - 2x Fail/Rollback)' : '✅ Çalışıyor'}
          </Text>
          <View style={styles.forgeRow}>
            <TouchableOpacity 
              style={styles.forgeBtn} 
              onPress={() => {
                const newVal = stuckCount + 1;
                setStuckCount(newVal);
                if (newVal >= 2) {
                  Alert.alert('STUCK Algılandı!', '2 cycle üst üste başarısız olunduğu için görüntülü uzman köprüsü aktifleşti.');
                }
              }}
            >
              <Text style={styles.forgeBtnText}>⚠️ Fail/Rollback Simüle Et ({stuckCount}/2)</Text>
            </TouchableOpacity>
            
            {stuckCount > 0 && (
              <TouchableOpacity 
                style={styles.forgeResetBtn}
                onPress={() => setStuckCount(0)}
              >
                <Text style={styles.forgeResetBtnText}>Sıfırla</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {stuckCount >= 2 && (
            <TouchableOpacity 
              style={styles.expertBridgeBtn}
              onPress={() => navigation.navigate('ExpertCall')}
            >
              <LinearGradient
                colors={['#ef4444', '#b91c1c']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.expertBridgeGradient}
              >
                <Text style={styles.expertBridgeText}>📞 Uzmana Bağlan (Görüntülü Köprü)</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

// Helper to resolve phase in local scope
function idlePhase() {
  return "idle";
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  topRow: { flexDirection: 'row', gap: 10, marginBottom: 16, alignSelf: 'stretch', justifyContent: 'flex-end' },
  topBtn: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  topBtnText: { color: '#bbb', fontSize: 12, fontWeight: '600' },
  logo: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 6,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 13,
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 40,
  },
  dotWrap: {
    marginBottom: 44,
  },
  card: {
    width: '100%',
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  cardLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  input: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    color: colors.textDim,
    fontSize: 11,
    textAlign: 'right',
    marginTop: 6,
  },
  btn: {
    width: '100%',
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  btnDisabled: {
    backgroundColor: 'rgba(110,231,183,0.3)',
    shadowOpacity: 0,
  },
  btnText: {
    color: '#080814',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  hint: {
    color: colors.textDim,
    fontSize: 12,
    marginTop: 14,
    letterSpacing: 0.3,
  },
  forgeCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    padding: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  forgeTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    opacity: 0.8,
  },
  forgeStatus: {
    color: '#aaa',
    fontSize: 11,
    marginBottom: 8,
  },
  forgeRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  forgeBtn: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  forgeBtnText: {
    color: '#bbb',
    fontSize: 10,
    fontWeight: '600',
  },
  forgeResetBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  forgeResetBtnText: {
    color: '#ef4444',
    fontSize: 10,
    fontWeight: '600',
  },
  expertBridgeBtn: {
    width: '100%',
    marginTop: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  expertBridgeGradient: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expertBridgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

