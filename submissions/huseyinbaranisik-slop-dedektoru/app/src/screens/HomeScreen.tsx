import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { getColors } from '../theme/colors';
import { usePitchAnalysis } from '../hooks/usePitchAnalysis';
import { useMicrophone } from '../hooks/useMicrophone';
import { useAnalysisHistory } from '../hooks/useAnalysisHistory';
import { Button } from '../components/common/Button';
import { InputField } from '../components/common/InputField';
import { ResultModal } from '../components/features/ResultModal';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../types';
import { transcribeAudio } from '../api/analyzer';
import { Card } from '../components/common/Card';
import * as Haptics from 'expo-haptics';

const EXAMPLES = [
  'Uygulamamız yapay zeka ile 2 yılda 10 milyon kullanıcıya ulaşacak ve 500 milyon dolarlık piyasayı domine edecek. Rakip yok, pazar hazır, sadece fon lazım.',
  'Platform aylık %40 büyüyor. 3 ayda MVP hazır. Sektördeki tek blockchain destekli çözümüz. Pre-seed için 2M$ arıyoruz.',
  'B2B SaaS modeliyle kurumsal müşterilere odaklanıyoruz. İlk 6 müşterimiz var, MRR 8.500$. Yol haritamız net, ekip 4 kişi.',
];

export default function HomeScreen() {
  const { themeMode, accentColor } = useTheme();
  const colors = getColors(themeMode, accentColor);
  const navigation = useNavigation<NavigationProp>();
  
  const { 
    pitch, 
    setPitch, 
    loading, 
    handleAnalyze,
    handleFileUpload,
    result,
    showResult,
    setShowResult,
    showSpecificResult
  } = usePitchAnalysis();

  const inputRef = useRef<TextInput>(null);

  const { isRecording, startRecording, stopRecording } = useMicrophone();
  const { history, refreshHistory, clearHistory } = useAnalysisHistory();
  const [transcribing, setTranscribing] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshHistory();
    });
    return unsubscribe;
  }, [navigation]);

  const handleMicPress = useCallback(async () => {
    if (isRecording) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const uri = await stopRecording();
      if (uri) {
        try {
          setTranscribing(true);
          const text = await transcribeAudio(uri);
          setPitch(prev => prev ? prev + " " + text : text);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          
          // Kayıt bitince cursor'ı geri getir
          setTimeout(() => {
            inputRef.current?.focus();
          }, 100);
        } catch (error) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          Alert.alert("Hata", "Ses yazıya dökülemedi: " + (error as Error).message);
        } finally {
          setTranscribing(false);
        }
      }
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await startRecording();
    }
  }, [isRecording, stopRecording, startRecording, transcribeAudio]);

  const onAnalyzePress = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await handleAnalyze();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [handleAnalyze]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Üst Menü */}
          <View style={styles.topActions}>
             <TouchableOpacity 
               onPress={() => navigation.navigate('Settings')}
               style={[styles.iconButton, { backgroundColor: colors.bgCard, borderColor: colors.bgCardBorder }]}
             >
               <Ionicons name="settings-outline" size={22} color={colors.textPrimary} />
             </TouchableOpacity>
          </View>

          {/* Logo + Başlık */}
          <View style={styles.header}>
            <View style={[styles.logoBadge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.logoText, { marginTop: -4 }]}>.</Text>
            </View>
            <Text style={[styles.appName, { color: colors.textPrimary }]}>Nokta</Text>
            <Text style={[styles.tagline, { color: colors.textMuted }]}>Girişim Analiz Motoru</Text>
          </View>

          {/* Başlık Bloğu */}
          <View style={styles.titleBlock}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Slop Dedektörü</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Pitch metnini yapıştır veya PDF yükle → AI riskleri analiz eder
            </Text>
          </View>

          {/* Giriş Alanı */}
          <View style={[styles.mainInputCard, { backgroundColor: colors.bgCard, borderColor: colors.bgCardBorder }]}>
            <TextInput
              ref={inputRef}
              style={[styles.mainInput, { color: colors.textPrimary }]}
              placeholder="Girişim fikrini anlat veya bir PDF yükle..."
              placeholderTextColor={colors.textDim}
              value={pitch}
              onChangeText={setPitch}
              multiline
              maxLength={2000}
              textAlignVertical="top"
            />
            
            <View style={styles.inputFooter}>
              <View style={styles.footerLeft}>
                <TouchableOpacity
                  onPress={handleFileUpload}
                  style={[styles.toolIconBtn, { backgroundColor: colors.bg + '88', borderColor: colors.bgCardBorder }]}
                >
                  <Ionicons name="document-attach-outline" size={20} color={colors.primary} />
                  <Text style={[styles.toolIconText, { color: colors.textPrimary }]}>PDF</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={handleMicPress}
                  style={[
                    styles.toolIconBtn,
                    { 
                      backgroundColor: isRecording ? colors.error + '22' : colors.bg + '88', 
                      borderColor: isRecording ? colors.error : colors.bgCardBorder 
                    }
                  ]}
                >
                  {transcribing ? (
                    <ActivityIndicator color={colors.primary} size="small" />
                  ) : (
                    <Ionicons 
                      name={isRecording ? "stop" : "mic-outline"} 
                      size={20} 
                      color={isRecording ? colors.error : colors.primary} 
                    />
                  )}
                  <Text style={[styles.toolIconText, { color: isRecording ? colors.error : colors.textPrimary }]}>
                    {isRecording ? 'Dur' : 'Ses'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.charLimit, { color: colors.textDim }]}>
                {pitch.length}/2000
              </Text>
            </View>
          </View>

          {(isRecording || transcribing) && (
            <View style={[styles.statusBadge, { backgroundColor: isRecording ? colors.error + '11' : colors.primary + '11' }]}>
              <View style={[styles.statusDot, { backgroundColor: isRecording ? colors.error : colors.primary }]} />
              <Text style={[styles.statusText, { color: isRecording ? colors.error : colors.primary }]}>
                {isRecording ? 'Ses kaydediliyor...' : 'Metne dönüştürülüyor...'}
              </Text>
            </View>
          )}

          {/* Örnekler */}
          <Text style={[styles.sectionLabel, { color: colors.textMuted, marginTop: 10 }]}>Örnek Pitch'ler →</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.pills}
            contentContainerStyle={{ gap: 8 }}
          >
            {EXAMPLES.map((ex, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.pill, { backgroundColor: colors.bgCard, borderColor: colors.bgCardBorder }]}
                onPress={() => setPitch(ex)}
              >
                <Text style={[styles.pillText, { color: colors.textMuted }]} numberOfLines={2}>
                  {ex.slice(0, 60)}…
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Analiz Butonu */}
          <Button
            text={loading ? "Analiz Ediliyor..." : "⚡  Şimdi Analiz Et"}
            onPress={onAnalyzePress}
            loading={loading}
            style={{ marginTop: 10 }}
          />

          {/* Analiz Geçmişi */}
          {history.length > 0 && (
            <View style={styles.historySection}>
              <View style={styles.historyHeader}>
                <Text style={[styles.sectionLabel, { color: colors.textMuted, marginBottom: 0 }]}>Geçmiş Analizler</Text>
                <TouchableOpacity 
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    Alert.alert(
                      "Geçmişi Temizle",
                      "Tüm analiz geçmişiniz silinecektir. Emin misiniz?",
                      [
                        { text: "Vazgeç", style: "cancel" },
                        { 
                          text: "Sil", 
                          style: "destructive", 
                          onPress: async () => {
                            await clearHistory();
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                          } 
                        }
                      ]
                    );
                  }}
                  style={styles.clearBtn}
                >
                  <Ionicons name="trash-outline" size={14} color={colors.error} />
                  <Text style={[styles.clearBtnText, { color: colors.error }]}>Temizle</Text>
                </TouchableOpacity>
              </View>
              {history.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  onPress={() => showSpecificResult(item.pitch, item.result)}
                >
                  <Card style={styles.historyCard}>
                    <View style={styles.historyInfo}>
                      <Text style={[styles.historyTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                        {item.pitch.slice(0, 35)}...
                      </Text>
                      <Text style={[styles.historyDate, { color: colors.textDim }]}>
                        {new Date(item.timestamp).toLocaleDateString('tr-TR')}
                      </Text>
                    </View>
                    <View style={[styles.historyScore, { backgroundColor: item.result.slopScore > 60 ? colors.error + '22' : colors.success + '22' }]}>
                      <Text style={[styles.historyScoreText, { color: item.result.slopScore > 60 ? colors.error : colors.success }]}>
                        {item.result.slopScore}
                      </Text>
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Alt Bilgi */}
          <Text style={[styles.footer, { color: colors.textDim }]}>
            Groq & Gemini Destekli · Slop Dedektörü 🛡️
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      <ResultModal
        visible={showResult}
        result={result}
        pitch={pitch}
        onClose={() => setShowResult(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 10 },
  topActions: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 5 },
  iconButton: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  header: { alignItems: 'center', marginBottom: 25 },
  logoBadge: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 10, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  logoText: { fontSize: 28, fontWeight: '900', color: '#fff' },
  appName: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  tagline: { fontSize: 12, letterSpacing: 2, marginTop: 4, opacity: 0.7, textTransform: 'uppercase' },
  titleBlock: { marginBottom: 25 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -1 },
  subtitle: { fontSize: 15, lineHeight: 22, marginTop: 8, opacity: 0.8 },
  
  mainInputCard: { borderRadius: 24, borderWidth: 1, padding: 16, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  mainInput: { fontSize: 16, minHeight: 160, lineHeight: 24, paddingBottom: 60 },
  inputFooter: { position: 'absolute', bottom: 12, left: 12, right: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  footerLeft: { flexDirection: 'row', gap: 8 },
  toolIconBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, gap: 6 },
  toolIconText: { fontSize: 12, fontWeight: '700' },
  charLimit: { fontSize: 11, fontWeight: '600', opacity: 0.5 },
  
  statusBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100, marginBottom: 15, gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },

  sectionLabel: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5, marginBottom: 12, textTransform: 'uppercase' },
  pills: { marginBottom: 25 },
  pill: { borderWidth: 1, borderRadius: 16, padding: 12, width: 200, marginRight: 10 },
  pillText: { fontSize: 13, lineHeight: 18, opacity: 0.8 },
  
  historySection: { marginTop: 35 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 4 },
  clearBtnText: { fontSize: 12, fontWeight: '600' },
  historyCard: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 10, borderRadius: 20 },
  historyInfo: { flex: 1 },
  historyTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  historyDate: { fontSize: 12, opacity: 0.6 },
  historyScore: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  historyScoreText: { fontSize: 15, fontWeight: '900' },
  footer: { textAlign: 'center', fontSize: 12, marginTop: 50, opacity: 0.5, letterSpacing: 0.5 },
});
