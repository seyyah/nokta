import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { analyzePitch } from '../services/analyzer';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const EXAMPLES = [
  'Uygulamamız yapay zeka ile 2 yılda 10 milyon kullanıcıya ulaşacak ve 500 milyon dolarlık piyasayı domine edecek. Rakip yok, pazar hazır, sadece fon lazım.',
  'Platform aylık %40 büyüyor. 3 ayda MVP hazır. Sektördeki tek blockchain destekli çözümüz. Pre-seed için 2M$ arıyoruz.',
  'B2B SaaS modeliyle kurumsal müşterilere odaklanıyoruz. İlk 6 müşterimiz var, MRR 8.500$. Yol haritamız net, ekip 4 kişi.',
];

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const [pitch, setPitch] = useState('');
  const [loading, setLoading] = useState(false);
  const btnScale = useRef(new Animated.Value(1)).current;

  const handleAnalyze = async () => {
    if (pitch.trim().length < 20) {
      Alert.alert('Kısa pitch!', 'Lütfen en az 20 karakterlik bir pitch metni gir.');
      return;
    }
    setLoading(true);
    try {
      const result = await analyzePitch(pitch.trim());
      navigation.navigate('Result', { result, pitch: pitch.trim() });
    } catch (e) {
      Alert.alert('Hata', `Analiz sırasında bir sorun oluştu: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const pressIn = () =>
    Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true }).start();
  const pressOut = () =>
    Animated.spring(btnScale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#0F1117', '#1A1025']} style={StyleSheet.absoluteFill} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Logo + Header ── */}
          <View style={styles.header}>
            <LinearGradient
              colors={['#7C3AED', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoBadge}
            >
              <Text style={styles.logoText}>N</Text>
            </LinearGradient>
            <Text style={styles.appName}>Nokta</Text>
            <Text style={styles.tagline}>Due Diligence Engine</Text>
          </View>

          {/* ── Title ── */}
          <View style={styles.titleBlock}>
            <Text style={styles.title}>Slop Dedektörü</Text>
            <Text style={styles.subtitle}>
              Pitch paragrafını yapıştır → AI pazar iddialarını test eder → Slop Skoru üretir
            </Text>
          </View>

          {/* ── Input Card ── */}
          <View style={styles.inputCard}>
            <TextInput
              style={styles.textInput}
              multiline
              placeholder="Pitch'ini buraya yapıştır..."
              placeholderTextColor={colors.textDim}
              value={pitch}
              onChangeText={setPitch}
              textAlignVertical="top"
              maxLength={2000}
            />
            <Text style={styles.charCount}>{pitch.length}/2000</Text>
          </View>

          {/* ── Example Pills ── */}
          <Text style={styles.exampleLabel}>Örnek pitch'ler →</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.pills}
            contentContainerStyle={{ gap: 8 }}
          >
            {EXAMPLES.map((ex, i) => (
              <TouchableOpacity
                key={i}
                style={styles.pill}
                onPress={() => setPitch(ex)}
                activeOpacity={0.7}
              >
                <Text style={styles.pillText} numberOfLines={2}>
                  {ex.slice(0, 70)}…
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* ── Analyze Button ── */}
          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <TouchableOpacity
              onPressIn={pressIn}
              onPressOut={pressOut}
              onPress={handleAnalyze}
              disabled={loading}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#7C3AED', '#EC4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.analyzeBtn}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.analyzeBtnText}>⚡  Analiz Et</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* ── Info Footer ── */}
          <Text style={styles.footer}>
            Gemini 1.5 Flash · Engineering-guided · Anti-Slop 🛡️
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 10 },

  header: { alignItems: 'center', marginBottom: 24 },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#7C3AED',
    shadowRadius: 12,
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 4 },
  },
  logoText: { fontSize: 26, fontWeight: '900', color: '#fff' },
  appName: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
  tagline: { fontSize: 12, color: colors.textMuted, letterSpacing: 1.5, marginTop: 2 },

  titleBlock: { marginBottom: 20 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    marginTop: 6,
  },

  inputCard: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  textInput: {
    color: colors.textPrimary,
    fontSize: 15,
    minHeight: 140,
    lineHeight: 22,
  },
  charCount: {
    textAlign: 'right',
    fontSize: 11,
    color: colors.textDim,
    marginTop: 8,
  },

  exampleLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  pills: { marginBottom: 24 },
  pill: {
    backgroundColor: 'rgba(124,58,237,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.25)',
    borderRadius: 12,
    padding: 10,
    width: 200,
  },
  pillText: { color: colors.textMuted, fontSize: 12, lineHeight: 16 },

  analyzeBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowRadius: 16,
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  analyzeBtnText: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },

  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: colors.textDim,
    marginTop: 20,
    letterSpacing: 0.3,
  },
});
