import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { SessionScreen } from './src/screens/SessionScreen';
import { colors } from './src/theme';

export default function App() {
  const [started, setStarted] = useState(false);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {started ? (
        <SessionScreen onResetToHome={() => setStarted(false)} />
      ) : (
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
          <View style={styles.hero}>
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>Yapay Zeka Hukuk Danışmanı</Text>
            </View>
            <Text style={styles.logo}>Nokta.</Text>
            <Text style={styles.welcomeText}>Hoş Geldiniz.</Text>
            <Text style={styles.tag}>
              Hukuki süreçlerde aklınıza takılan basit soruları anında yanıtlar, durumunuzu analiz eder ve gerektiğinde sizi en doğru şekilde uzman bir avukata yönlendirir.
            </Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Neler Yapabiliriz?</Text>
              <View style={styles.featureRow}>
                <View style={styles.dot} />
                <Text style={styles.cardLine}>Hukuki kavramları ve süreçleri anlaşılır dille açıklar.</Text>
              </View>
              <View style={styles.featureRow}>
                <View style={styles.dot} />
                <Text style={styles.cardLine}>Karmaşık durumlarınızı özetleyip hukuki brif haline getirir.</Text>
              </View>
              <View style={styles.featureRow}>
                <View style={styles.dot} />
                <Text style={styles.cardLine}>Miras, Boşanma, Kira, Ceza, İş Hukuku, İcra ve Vasiyet gibi konularda sorular sorabilirsiniz.</Text>
              </View>
              <View style={styles.featureRow}>
                <View style={styles.dot} />
                <Text style={styles.cardLine}>Riskli ve uzmanlık gerektiren konularda doğru yönlendirme sağlar.</Text>
              </View>
            </View>
            <Pressable 
              style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]} 
              onPress={() => setStarted(true)}
            >
              <Text style={styles.ctaText}>Danışmaya Başla</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  hero: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 24,
    justifyContent: 'center',
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 24,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  logo: {
    fontSize: 56,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -2,
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 30,
    fontWeight: '400',
    color: colors.textMuted,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  tag: {
    fontSize: 16,
    lineHeight: 26,
    color: colors.text,
    marginBottom: 40,
    fontWeight: '400',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 8,
    marginRight: 12,
  },
  cardLine: {
    flex: 1,
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
  },
  cta: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  ctaText: {
    color: colors.userText,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
