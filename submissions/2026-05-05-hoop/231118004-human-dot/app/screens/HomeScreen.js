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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Logo + top buttons */}
        <View style={styles.topRow}>
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
          <GlowDot size={20} phase="idle" />
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
      </KeyboardAvoidingView>
    </LinearGradient>
  );
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
});
