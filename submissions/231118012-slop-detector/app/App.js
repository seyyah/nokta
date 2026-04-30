import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Animated,
  Platform,
  ActivityIndicator,
  Keyboard
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';

const COLORS = {
  background: '#0c0e12',
  surface: '#0c0e12',
  surfaceContainerLowest: '#0f1115',
  surfaceContainerLow: '#111318',
  surfaceContainer: '#171a1f',
  surfaceContainerHigh: '#1d2025',
  surfaceContainerHighest: '#23262c',
  primary: '#86adff',
  primaryDim: '#006fef',
  primaryFixed: '#6f9fff',
  secondary: '#00fd93',
  secondaryContainer: '#006d3c',
  tertiary: '#ff8199',
  onSurface: '#f6f6fc',
  onSurfaceVariant: '#aaabb0',
  outlineVariant: 'rgba(70, 72, 77, 0.4)',
};

const callGemini = async (prompt, modelName, apiKey) => {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  let textResponse = data.candidates[0].content.parts[0].text;
  return JSON.parse(textResponse);
};

const analyzePitch = async (pitch) => {
  try {
    const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

    if (!API_KEY) {
      throw new Error("API_KEY bulunamadı! Lütfen .env dosyanızı kontrol edin.");
    }

    if (pitch.trim().length < 30) {
      return {
        score: 0, techDepth: 0, marketRationality: 0, feasibility: 0, originality: 0,
        redFlagReport: "Girdi dizisi çok kısa. Veri uzunluğunda anormallikler tespit edildi.",
        pivotSuggestions: "Veri yoğunluğunu artırın. Kapsamlı bir mimari veya pazar tezi sunun."
      };
    }

    const chunkSize = 400;
    const maxChunks = 5;
    const chunks = [];
    for (let i = 0; i < pitch.length && chunks.length < maxChunks; i += chunkSize) {
      chunks.push(pitch.slice(i, i + chunkSize));
    }

    let totals = { score: 0, techDepth: 0, marketRationality: 0, feasibility: 0, originality: 0 };
    let combinedRedFlags = [];
    let combinedPivots = [];

    for (let i = 0; i < chunks.length; i++) {
      let partText = chunks[i];
      let contextualNote = chunks.length > 1
        ? `\n\n[SYSTEM NOTE: Multi-node processing active. Part ${i + 1}/${chunks.length}.]`
        : "";

      const prompt = `Sen ANALYSIS_HUD_v1.0 (Nokta Slop Detector Otonom Ajanı) sistemisinin çekirdeğisin.
Aşağıdaki metni analiz et ve JSON dön.
İstenen format:
{
  "score": 92,
  "techDepth": 80,
  "marketRationality": 62,
  "feasibility": 90,
  "originality": 40,
  "redFlagReport": "Tespit Edilen Anomaliler: ...",
  "pivotSuggestions": "Yapısal Pivot: ..."
}
(Değerler 0-100 arası integer. Tüm açıklamaları SADECE TÜRKÇE, çok profesyonel, mekanik, teknik ve kısa tut.)
Girişim Metni:
${partText}
${contextualNote}`;

      const resultObj = await callGemini(prompt, "gemini-2.5-flash", API_KEY);

      totals.score += resultObj.score || 50;
      totals.techDepth += resultObj.techDepth || 50;
      totals.marketRationality += resultObj.marketRationality || 50;
      totals.feasibility += resultObj.feasibility || 50;
      totals.originality += resultObj.originality || 50;

      if (resultObj.redFlagReport) combinedRedFlags.push(`[NODE X${i + 1}] ${resultObj.redFlagReport}`);
      if (resultObj.pivotSuggestions) combinedPivots.push(`[PVT-${880 + i}] ${resultObj.pivotSuggestions}`);
    }

    const avg = val => Math.round(val / chunks.length);
    return {
      score: avg(totals.score),
      techDepth: avg(totals.techDepth),
      marketRationality: avg(totals.marketRationality),
      feasibility: avg(totals.feasibility),
      originality: avg(totals.originality),
      redFlagReport: combinedRedFlags.join("\n\n"),
      pivotSuggestions: combinedPivots.join("\n\n")
    };
  } catch (error) {
    console.error("SYS Error:", error.message);
    return {
      score: 0, techDepth: 0, marketRationality: 0, feasibility: 0, originality: 0,
      redFlagReport: "KRİTİK HATA: " + error.message,
      pivotSuggestions: "SİSTEM DURDURULDU. Ağ bağlantılarını kontrol edin."
    };
  }
};

export default function App() {
  const [pitch, setPitch] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const resultFadeAnim = useRef(new Animated.Value(0)).current;

  const handleAnalyze = async () => {
    if (pitch.trim().length === 0) return;
    Keyboard.dismiss();
    setIsAnalyzing(true);

    Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();

    const analysisResult = await analyzePitch(pitch);
    setResult(analysisResult);
    setIsAnalyzing(false);

    Animated.timing(resultFadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  };

  const reset = () => {
    Animated.timing(resultFadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
      setResult(null);
      setPitch('');
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    });
  };

  const ProgressBar = ({ label, desc, color, value }) => (
    <View style={[styles.agentCard, { borderLeftColor: color }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.agentTitle}>{label}</Text>
          <Text style={styles.agentDesc}>{desc}</Text>
        </View>
        <Text style={[styles.agentPercentage, { color }]}>{value}%</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { backgroundColor: color, width: `${value}%` }]} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor={COLORS.background} />

      {/* HUD Header */}
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          <MaterialIcons name="analytics" size={24} color={COLORS.primary} />
          <Text style={styles.appBarTitle}>ANALYSIS_HUD_v1.0</Text>
        </View>
        <MaterialIcons name="settings-ethernet" size={24} color={COLORS.primary} />
      </View>

      <View style={{ flex: 1 }}>
        {!result && (
          <Animated.View style={[styles.content, { opacity: fadeAnim, flex: 1, justifyContent: 'center' }]}>
            <View style={{ marginBottom: 40, alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View style={[styles.statusDot, { backgroundColor: COLORS.secondary }]} />
                <Text style={styles.statusLabel}>SİSTEM HAZIR</Text>
              </View>
              <Text style={styles.heroText}>Özel Olarak Tasarlandı:</Text>
              <Text style={[styles.heroText, { color: COLORS.primary }]}>Slop Tespiti İçin.</Text>
            </View>

            <TextInput
              style={styles.textInput}
              multiline
              placeholder="Proje tezini girerek sinir ağını başlatın..."
              placeholderTextColor={COLORS.onSurfaceVariant}
              value={pitch}
              onChangeText={setPitch}
              textAlignVertical="top"
              keyboardAppearance="dark"
            />

            <TouchableOpacity
              style={[styles.analyzeButton, isAnalyzing && { opacity: 0.7 }]}
              onPress={handleAnalyze}
              disabled={isAnalyzing || pitch.trim().length === 0}
              activeOpacity={0.8}
            >
              {isAnalyzing ? (
                <ActivityIndicator color={COLORS.surfaceContainerLowest} size="small" />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.analyzeButtonText}>SİSTEMİ BAŞLAT</Text>
                  <MaterialIcons name="rocket-launch" size={18} color={COLORS.surfaceContainerLowest} style={{ marginLeft: 8 }} />
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        )}

        {result && (
          <Animated.ScrollView style={{ flex: 1, opacity: resultFadeAnim, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>

            {/* HERO SCORE SECTION */}
            <View style={styles.heroScoreSection}>
              <Text style={styles.precisionLabel}>HASSAS ÇIKTI GÜVENİ</Text>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: 12 }}>
                <Text style={styles.heroScoreValue}>{result.score}</Text>
                <Text style={styles.heroScoreSuffix}>/100</Text>
              </View>
              <View style={styles.certificationBadge}>
                <View style={[styles.statusDot, { backgroundColor: result.score > 85 ? COLORS.secondary : result.score > 50 ? COLORS.primaryDim : COLORS.tertiary }]} />
                <Text style={[styles.certificationText, { color: result.score > 85 ? COLORS.secondary : result.score > 50 ? COLORS.primaryDim : COLORS.tertiary }]}>
                  {result.score > 85 ? "MÜHENDİSLİK ONAYLI" : result.score > 50 ? "MİMARİ İNCELEME GEREKLİ" : "KRİTİK SLOP TESPİT EDİLDİ"}
                </Text>
              </View>
            </View>

            {/* SWARM ORCHESTRATOR / AGENTS */}
            <View style={{ marginTop: 32 }}>
              <Text style={styles.sectionHeader}>PARALEL DENETİM SÜRÜSÜ</Text>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                <View style={{ width: '48%', marginBottom: 16 }}>
                  <ProgressBar label="Teknik Derinlik" desc="Mimari Analiz" color={COLORS.primary} value={result.techDepth} />
                </View>
                <View style={{ width: '48%', marginBottom: 16 }}>
                  <ProgressBar label="Rasyonellik" desc="Ekonomik Sim." color={COLORS.secondary} value={result.marketRationality} />
                </View>
                <View style={{ width: '48%', marginBottom: 16 }}>
                  <ProgressBar label="Kapsam/Uyg." desc="Kaynak Dağılımı" color={COLORS.tertiary} value={result.feasibility} />
                </View>
                <View style={{ width: '48%', marginBottom: 16 }}>
                  <ProgressBar label="Özgünlük" desc="Konsept Doğrulama" color={COLORS.primaryFixed} value={result.originality} />
                </View>
              </View>
            </View>

            {/* BENTO GRID: RED FLAGS & PIVOTS */}
            <View style={styles.bentoContainer}>
              <View style={styles.redFlagCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <MaterialIcons name="warning" size={20} color={COLORS.tertiary} />
                  <Text style={styles.bentoHeader}>Tespit Edilen Anomaliler</Text>
                </View>
                <View style={styles.redFlagInner}>
                  <MaterialIcons name="error-outline" size={16} color={COLORS.tertiary} style={{ marginTop: 2, marginRight: 8 }} />
                  <Text style={styles.bentoText}>{result.redFlagReport}</Text>
                </View>
              </View>

              <View style={styles.pivotCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialIcons name="build" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
                    <Text style={[styles.bentoHeader, { color: COLORS.onSurface }]}>Yapısal Pivot</Text>
                  </View>
                  <View style={styles.idBadge}>
                    <Text style={styles.idBadgeText}>PVT-882</Text>
                  </View>
                </View>
                <Text style={styles.bentoText}>{result.pivotSuggestions}</Text>

                <TouchableOpacity style={styles.applyButton} onPress={reset}>
                  <Text style={styles.applyButtonText}>MATRİSİ YENİDEN DERLE</Text>
                  <MaterialIcons name="settings-backup-restore" size={16} color={COLORS.onSurface} style={{ marginLeft: 8 }} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ height: 40 }} />
          </Animated.ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: 'rgba(12, 14, 18, 0.85)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(134, 173, 255, 0.1)',
    zIndex: 10,
  },
  appBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appBarTitle: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
    marginLeft: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  content: {
    paddingHorizontal: 24,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusLabel: {
    color: COLORS.secondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginLeft: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  heroText: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.onSurface,
    textAlign: 'center',
    letterSpacing: -1,
  },
  textInput: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 12,
    color: COLORS.onSurface,
    padding: 24,
    height: 200,
    fontSize: 15,
    lineHeight: 24,
  },
  analyzeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 4,
  },
  analyzeButtonText: {
    color: COLORS.surfaceContainerLowest,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
  },

  heroScoreSection: {
    backgroundColor: COLORS.surfaceContainerHigh,
    borderRadius: 16,
    padding: 32,
    marginTop: 24,
    overflow: 'hidden',
  },
  precisionLabel: {
    color: COLORS.onSurfaceVariant,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  heroScoreValue: {
    fontSize: 84,
    fontWeight: '900',
    color: COLORS.primary,
    lineHeight: 90,
  },
  heroScoreSuffix: {
    fontSize: 24,
    fontWeight: '300',
    color: COLORS.primaryDim,
    marginBottom: 8,
  },
  certificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 253, 147, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 253, 147, 0.2)',
  },
  certificationText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginLeft: 8,
  },

  sectionHeader: {
    color: COLORS.onSurface,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0,
    marginBottom: 16,
  },
  agentCard: {
    backgroundColor: 'rgba(29, 32, 37, 0.3)',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    height: 110,
    justifyContent: 'space-between',
  },
  agentTitle: {
    color: COLORS.onSurface,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  agentDesc: {
    color: COLORS.onSurfaceVariant,
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textTransform: 'uppercase',
  },
  agentPercentage: {
    fontSize: 14,
    fontWeight: '900',
  },
  progressTrack: {
    height: 3,
    backgroundColor: COLORS.surfaceContainerHighest,
    borderRadius: 2,
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },

  bentoContainer: {
    marginTop: 24,
    gap: 16,
  },
  redFlagCard: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
    padding: 24,
    borderTopWidth: 2,
    borderTopColor: COLORS.tertiary,
  },
  redFlagInner: {
    backgroundColor: 'rgba(250, 108, 137, 0.1)',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
  },
  bentoHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 8,
  },
  bentoText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },

  pivotCard: {
    backgroundColor: 'rgba(29, 32, 37, 0.3)',
    borderRadius: 16,
    padding: 24,
  },
  idBadge: {
    backgroundColor: 'rgba(134, 173, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  idBadgeText: {
    color: COLORS.primary,
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceContainerHighest,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 24,
  },
  applyButtonText: {
    color: COLORS.onSurface,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  }
});
