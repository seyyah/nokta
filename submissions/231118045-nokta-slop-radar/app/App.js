import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';

const THEME = {
  background: '#0A0A0B',
  surface: '#161618',
  surfaceLight: '#1C1C1E',
  primary: '#7DF9FF', // Electric Cyan
  secondary: '#FF3131', // Neon Red
  success: '#39FF14', // Neon Green
  textMain: '#FFFFFF',
  textDim: '#B0B0B0',
};

export default function App() {
  const [pitch, setPitch] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const analyzeSlop = () => {
    if (!pitch.trim()) return;
    
    setIsAnalyzing(true);
    setResult(null);

    // Simulate AI Analysis Delay
    setTimeout(() => {
      const score = Math.floor(Math.random() * 100);
      const isSlop = score > 60;
      
      setResult({
        score: score,
        verdict: isSlop ? 'SLOP DETECTED' : 'SOLID IDEA',
        reasoning: isSlop 
          ? 'Too many generic AI buzzwords. No clear technical architecture or competitive edge mentioned.'
          : 'Highly specific technical constraints and clear user problem identified. Low generic buzzword density.',
        risks: [
          'Extreme market saturation in the current niche.',
          'Scalability bottleneck in the proposed architecture.',
          'High user acquisition cost for this specific demographic.'
        ],
        roadmap: !isSlop ? [
          'Initialize: Setup a PostgreSQL instance with Row Level Security (RLS).',
          'Architecture: Design a micro-services layer using Node.js/Fastify for high-throughput.',
          'Frontend: Implement a cross-platform mobile UI using React Native + Expo.',
          'AI Audit: Integrate a vector-database (Pinecone) for RAG-based context analysis.',
          'Scaling: Deploy on Dockerized containers with Kubernetes for auto-scaling.'
        ] : null,
        penalty: isSlop ? {
          hours: Math.floor(Math.random() * 2000) + 500,
          money: (Math.floor(Math.random() * 50) + 10) * 1000
        } : null,
        opportunities: score < 30 ? 'ELIGIBLE FOR NOKTA INCUBATION' : 'NEEDS REFINEMENT'
      });
      setIsAnalyzing(false);
    }, 2500);
  };

  const reset = () => {
    setPitch('');
    setResult(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>NOKTA</Text>
            <Text style={styles.subtitle}>SLOP RADAR</Text>
          </View>

          {!result ? (
            <View style={styles.inputSection}>
              <Text style={styles.label}>Paste your pitch/idea below</Text>
              <TextInput
                style={styles.input}
                multiline
                placeholder="Ex: We are building a revolutionary AI-powered platform that disrupts the blockchain space using synergy..."
                placeholderTextColor={THEME.textDim}
                value={pitch}
                onChangeText={setPitch}
              />
              
              <TouchableOpacity 
                style={[styles.button, !pitch.trim() && { opacity: 0.5 }]} 
                onPress={analyzeSlop}
                disabled={isAnalyzing || !pitch.trim()}
              >
                {isAnalyzing ? (
                  <ActivityIndicator color={THEME.background} />
                ) : (
                  <Text style={styles.buttonText}>AUDIT SPECIFICATION</Text>
                )}
              </TouchableOpacity>
              
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Why Slop Detection?</Text>
                <Text style={styles.infoText}>
                  AI-generated slop is devaluing real engineering. Our radar scans for generic artifacts and missing technical constraints.
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.resultSection}>
              <View style={[styles.scoreCard, { borderColor: result.score > 60 ? THEME.secondary : THEME.success }]}>
                <Text style={styles.scoreLabel}>SLOP SCORE</Text>
                <Text style={[styles.scoreValue, { color: result.score > 60 ? THEME.secondary : THEME.success }]}>
                  {result.score}%
                </Text>
                <Text style={[styles.verdictText, { color: result.score > 60 ? THEME.secondary : THEME.success }]}>
                  {result.verdict}
                </Text>
              </View>

              {result.roadmap && (
                <View style={styles.roadmapCard}>
                  <Text style={[styles.cardHeader, { color: THEME.primary }]}>🚀 ENGINEERING SKELETON (ROADMAP)</Text>
                  {result.roadmap.map((step, index) => (
                    <View key={index} style={styles.roadmapItem}>
                      <View style={styles.roadmapNumber}><Text style={styles.roadmapNumberText}>{index + 1}</Text></View>
                      <Text style={styles.roadmapText}>{step}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              {result.penalty && (
                <View style={styles.penaltyCard}>
                  <Text style={styles.penaltyHeader}>⚠️ SLOP PENALTY (ESTIMATED LOSS)</Text>
                  <Text style={styles.penaltyText}>
                    Eğer bu içi boş fikri hayata geçirmeye çalışırsan, yaklaşık 
                    <Text style={{fontWeight: 'bold', color: '#FFF'}}> {result.penalty.hours} saat</Text> ve 
                    <Text style={{fontWeight: 'bold', color: '#FFF'}}> {result.penalty.money.toLocaleString()}$</Text> kaybedeceksin. 
                    Lütfen hemen dur ve bir mühendislik dökümanı (Nokta) oluştur.
                  </Text>
                </View>
              )}

              <View style={styles.reasoningCard}>
                <Text style={styles.cardHeader}>AI REASONING</Text>
                <Text style={styles.reasoningText}>{result.reasoning}</Text>
              </View>

              <View style={styles.risksCard}>
                <Text style={styles.cardHeader}>CRITICAL RISKS</Text>
                {result.risks.map((risk, index) => (
                  <Text key={index} style={styles.riskItem}>• {risk}</Text>
                ))}
              </View>

              {result.score < 40 && (
                <TouchableOpacity 
                  style={styles.noktaButton}
                  onPress={() => alert('🚀 Fikir Nokta Labs\'e kabul edildi! Kuluçka süreci başlıyor...')}
                >
                  <Text style={styles.noktaButtonText}>ADOPT TO NOKTA LABS</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.resetButton} onPress={reset}>
                <Text style={styles.resetButtonText}>NEW AUDIT</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.shareButton} 
                onPress={() => {
                  const message = `NOKTA Slop Radar Report\nScore: ${result.score}%\nVerdict: ${result.verdict}\n\n${result.reasoning}`;
                  import('react-native').then(({ Share }) => Share.share({ message }));
                }}
              >
                <Text style={styles.shareButtonText}>ANALİZ RAPORUNU PAYLAŞ</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  logo: {
    fontSize: 42,
    fontWeight: '900',
    color: THEME.textMain,
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 14,
    color: THEME.primary,
    letterSpacing: 8,
    fontWeight: 'bold',
    marginTop: -5,
  },
  inputSection: {
    width: '100%',
  },
  label: {
    color: THEME.textMain,
    fontSize: 16,
    marginBottom: 12,
    fontWeight: '600',
  },
  input: {
    backgroundColor: THEME.surface,
    borderRadius: 16,
    padding: 20,
    color: THEME.textMain,
    fontSize: 16,
    minHeight: 200,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#333',
  },
  button: {
    backgroundColor: THEME.primary,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonText: {
    color: THEME.background,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  infoCard: {
    marginTop: 40,
    backgroundColor: THEME.surfaceLight,
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: THEME.primary,
  },
  infoTitle: {
    color: THEME.primary,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    color: THEME.textDim,
    fontSize: 13,
    lineHeight: 20,
  },
  resultSection: {
    width: '100%',
  },
  scoreCard: {
    backgroundColor: THEME.surface,
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 20,
  },
  scoreLabel: {
    color: THEME.textDim,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  scoreValue: {
    fontSize: 72,
    fontWeight: '900',
    marginVertical: 10,
  },
  verdictText: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  roadmapCard: {
    backgroundColor: '#0D1117',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(125, 249, 255, 0.2)',
  },
  roadmapItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  roadmapNumber: {
    backgroundColor: THEME.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  roadmapNumberText: {
    color: THEME.background,
    fontSize: 12,
    fontWeight: '900',
  },
  roadmapText: {
    color: THEME.textMain,
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  penaltyCard: {
    backgroundColor: '#3D0000',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: THEME.secondary,
  },
  penaltyHeader: {
    color: THEME.secondary,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 1,
  },
  penaltyText: {
    color: '#FFB8B8',
    fontSize: 14,
    lineHeight: 22,
  },
  reasoningCard: {
    backgroundColor: THEME.surface,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  cardHeader: {
    color: THEME.primary,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 12,
    letterSpacing: 1,
  },
  reasoningText: {
    color: THEME.textMain,
    fontSize: 15,
    lineHeight: 24,
  },
  risksCard: {
    backgroundColor: THEME.surface,
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  riskItem: {
    color: '#FF6B6B',
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  noktaButton: {
    backgroundColor: THEME.success,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  noktaButtonText: {
    color: THEME.background,
    fontWeight: '900',
  },
  resetButton: {
    padding: 18,
    alignItems: 'center',
  },
  resetButtonText: {
    color: THEME.textDim,
    fontSize: 14,
    fontWeight: 'bold',
  },
  shareButton: {
    marginTop: 10,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.primary,
    alignItems: 'center',
  },
  shareButtonText: {
    color: THEME.primary,
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1,
  }
});
