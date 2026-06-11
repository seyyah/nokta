import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, useColorScheme, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const handleStart = () => {
    router.push('/ideas');
  };

  // Demo Scenarios Automation navigators
  const runDemoPhaseA = () => {
    Alert.alert(
      'Demo Phase A',
      'Voice Visualizer test edilecek. Avatar ekranına yönlendiriliyorsunuz. Lütfen mikrofon butonuna basarak sesinizi dikte edin veya simüle edin.',
      [
        {
          text: 'Başlat',
          onPress: () => {
            router.push('/avatar');
          },
        },
      ]
    );
  };

  const runDemoPhaseB = () => {
    Alert.alert(
      'Demo Phase B',
      'Avatar Lipsync & Persona test edilecek. Avatar ekranına yönlendiriliyorsunuz. Junior/Senior butonlarına basarak farklı ışık, ses hızı ve viseme lipsync animasyonunu inceleyin.',
      [
        {
          text: 'Başlat',
          onPress: () => {
            router.push('/avatar');
          },
        },
      ]
    );
  };

  const runDemoPhaseC = () => {
    Alert.alert(
      'Demo Phase C',
      'STUCK ve Uzman Köprüsü (WebRTC) test edilecek. Forge Agent ekranına yönlendiriliyorsunuz. Lütfen "Forge Döngüsünü Koştur" butonunu 2 kez üst üste ROLLBACK veya FAIL olarak çalıştırın. STUCK durumu tetiklenecek ve "Uzmana Bağlan" butonu çıkacaktır.',
      [
        {
          text: 'Başlat',
          onPress: () => {
            router.push('/agent');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#0f1115' : '#f8fafc' }]}>
      {/* Hero Header */}
      <View style={[styles.hero, { backgroundColor: isDark ? '#1a1d24' : '#ffffff' }]}>
        <View style={styles.logoContainer}>
          <Ionicons name="location-sharp" size={48} color="#e53e3e" />
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>v2.0</Text>
          </View>
        </View>
        <Text style={[styles.title, { color: isDark ? '#ffffff' : '#0f172a' }]}>
          NOKTA <Text style={{ color: '#e53e3e' }}>AUDIT</Text>
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>
          İki Repo, İki Rol, Bir Kapalı Döngü: Müşteri Yakalar, Agent Onarır, Sen Review Edersin.
        </Text>
      </View>

      {/* Demo Hub Controls Dashboard */}
      <View style={[styles.demoSection, { backgroundColor: isDark ? '#1e1b29' : '#faf5ff', borderColor: isDark ? '#4c1d95' : '#e9d5ff' }]}>
        <View style={styles.demoHeader}>
          <Ionicons name="play-circle" size={20} color="#8b5cf6" />
          <Text style={[styles.demoTitle, { color: isDark ? '#d8b4fe' : '#6b21a8' }]}>Tek Videoluk Demo Kontrol Hub</Text>
        </View>
        <Text style={[styles.demoDesc, { color: isDark ? '#c084fc' : '#7c3aed' }]}>
          Aşağıdaki fazları sırasıyla tıklayarak tüm ödev senaryolarını tek videoda kolayca kaydedebilirsiniz:
        </Text>

        <View style={styles.demoBtnGrid}>
          <TouchableOpacity style={[styles.demoBtn, { backgroundColor: '#3b82f6' }]} onPress={runDemoPhaseA}>
            <Ionicons name="mic" size={16} color="#fff" />
            <Text style={styles.demoBtnText}>Phase A: Voice Viz</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.demoBtn, { backgroundColor: '#a855f7' }]} onPress={runDemoPhaseB}>
            <Ionicons name="body" size={16} color="#fff" />
            <Text style={styles.demoBtnText}>Phase B: Lipsync</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.demoBtn, { backgroundColor: '#ef4444' }]} onPress={runDemoPhaseC}>
            <Ionicons name="warning" size={16} color="#fff" />
            <Text style={styles.demoBtnText}>Phase C: Stuck Jitsi</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Steps List */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#f1f5f9' : '#1e293b' }]}>
          Otonom İş Akışı Nasıl Çalışır?
        </Text>

        <View style={[styles.card, { backgroundColor: isDark ? '#1a1d24' : '#ffffff' }]}>
          <View style={styles.stepHeader}>
            <View style={[styles.stepNumber, { backgroundColor: '#feebc8' }]}>
              <Text style={[styles.stepNumberText, { color: '#c05621' }]}>1</Text>
            </View>
            <Text style={[styles.stepTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>Müşteri Yakalar</Text>
          </View>
          <Text style={[styles.stepDescription, { color: isDark ? '#94a3b8' : '#64748b' }]}>
            Uygulamadaki aksaklık veya yeni istek anında kırmızı <Text style={{ fontWeight: 'bold', color: '#e53e3e' }}>Bug FAB</Text> butonuna dokun. Ekran görüntüsünü yakala, sarı kutuyla işaretle ve notunu ekleyip Markdown raporunu üret.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: isDark ? '#1a1d24' : '#ffffff' }]}>
          <View style={styles.stepHeader}>
            <View style={[styles.stepNumber, { backgroundColor: '#fed7d7' }]}>
              <Text style={[styles.stepNumberText, { color: '#9b2c2c' }]}>2</Text>
            </View>
            <Text style={[styles.stepTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>Agent Onarır (Forge)</Text>
          </View>
          <Text style={[styles.stepDescription, { color: isDark ? '#94a3b8' : '#64748b' }]}>
            Üretilen Markdown raporunu coding agent'a (Claude Code/Antigravity) besle. Agent, <Text style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>READ-LOCATE-REPAIR-TEST</Text> döngüsüyle otonom olarak kod hatasını giderir.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: isDark ? '#1a1d24' : '#ffffff' }]}>
          <View style={styles.stepHeader}>
            <View style={[styles.stepNumber, { backgroundColor: '#c6f6d5' }]}>
              <Text style={[styles.stepNumberText, { color: '#22543d' }]}>3</Text>
            </View>
            <Text style={[styles.stepTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>Sen Review Edersin</Text>
          </View>
          <Text style={[styles.stepDescription, { color: isDark ? '#94a3b8' : '#64748b' }]}>
            Agent, değişiklikleri test edip başarıyla doğrularsa otomatik commit atar veya rollback yapar. Sen sadece Pull Request'i inceleyip onaylarsın.
          </Text>
        </View>
      </View>

      {/* Call to Action Button */}
      <View style={styles.btnContainer}>
        <TouchableOpacity style={styles.button} onPress={handleStart}>
          <Text style={styles.buttonText}>Fikir Havuzunu İncele</Text>
          <Ionicons name="arrow-forward-sharp" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Info Badge */}
      <View style={styles.footer}>
        <Ionicons name="shield-checkmark" size={16} color={isDark ? '#475569' : '#94a3b8'} />
        <Text style={[styles.footerText, { color: isDark ? '#475569' : '#94a3b8' }]}>
          Öğrenci: Sibel Yeter (231118056) • Track B Seçildi
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 16,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  logoBadge: {
    position: 'absolute',
    right: -24,
    top: -4,
    backgroundColor: '#e53e3e',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  logoBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  demoSection: {
    margin: 16,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  demoTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  demoDesc: {
    fontSize: 11,
    lineHeight: 16,
  },
  demoBtnGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  demoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  demoBtnText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  stepDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  btnContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#e53e3e',
    borderRadius: 14,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#e53e3e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 20,
    marginTop: 10,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
