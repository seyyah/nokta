import { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import Markdown from 'react-native-markdown-display';
import { Button } from '@/components/Button';
import { StatusBadge } from '@/components/StatusBadge';
import { useSession, session } from '@/state/sessionStore';
import { analyzeSlopScore } from '@/services/slopAnalyzer';
import { analyzeInvestorRisk } from '@/services/investorAnalyzer';
import type { InvestorMemo } from '@/services/investorAnalyzer';

const DimensionBar = ({ label, value }: { label: string; value: number }) => (
  <View style={styles.dimensionRow}>
    <Text style={styles.dimensionLabel}>{label}</Text>
    <View style={styles.barContainer}>
      <View style={[styles.barFill, { width: `${value}%` }]} />
    </View>
    <Text style={styles.dimensionValue}>{value}</Text>
  </View>
);

export default function SpecScreen() {
  const s = useSession();
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);

  if (!s.spec) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>Henüz spec yok.</Text>
      </View>
    );
  }

  const slopScore = analyzeSlopScore(s.spec, s.idea || '', s.answers || {});
  
  // Investor mode: analyze investment risk
  const investorRisk = s.mode === 'investor' 
    ? analyzeInvestorRisk(s.spec as unknown as InvestorMemo, s.idea || '', s.answers || {})
    : null;

  const onCopy = async () => {
    await Clipboard.setStringAsync(s.spec!.markdown);
    Alert.alert('Kopyalandı', 'Spec panoya kopyalandı');
  };

  const onShare = async () => {
    try {
      const can = await Sharing.isAvailableAsync();
      if (!can) {
        await Clipboard.setStringAsync(s.spec!.markdown);
        Alert.alert('Paylaşım yok', 'Pano kullanıldı');
        return;
      }
      await Clipboard.setStringAsync(s.spec!.markdown);
      Alert.alert('Hazır', 'Spec markdown formatında panoda. WhatsApp/Notion/Slack\'e yapıştır.');
    } catch (e) {
      Alert.alert('Hata', e instanceof Error ? e.message : String(e));
    }
  };

  const onNew = () => {
    session.reset();
    router.replace('/');
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'SHARP': return '#00FF88';
      case 'GROUNDED': return '#00E5FF';
      case 'MIXED': return '#FFB020';
      case 'SLOPPY': return '#FF8800';
      case 'PURE SLOP': return '#FF3355';
      default: return '#888';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {s.provider ? <StatusBadge provider={s.provider} attempts={s.attempts} /> : null}
      <Text style={styles.title}>{s.spec.title}</Text>
      
      {/* Score Card - Entrepreneur or Investor */}
      <View style={styles.slopCard}>
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreNumber}>
            {s.mode === 'investor' && investorRisk ? investorRisk.overall : slopScore.overall}
          </Text>
          <Text style={styles.scoreLabel}>
            {s.mode === 'investor' ? 'INVESTMENT SCORE' : 'SLOP SCORE'}
          </Text>
        </View>
        <Text style={[styles.verdict, { color: getVerdictColor(
          s.mode === 'investor' && investorRisk ? investorRisk.verdict : slopScore.verdict
        ) }]}>
          {s.mode === 'investor' && investorRisk ? investorRisk.verdict : slopScore.verdict}
        </Text>
        
        <Pressable 
          onPress={() => setShowDetails(!showDetails)}
          style={styles.toggleButton}
        >
          <Text style={styles.toggleText}>
            {showDetails ? '▼ Hide Details' : '▶ Show Details'}
          </Text>
        </Pressable>

        {showDetails && (
          <>
            {s.mode === 'investor' && investorRisk ? (
              <>
                {/* Investor Risk Dimensions */}
                <View style={styles.dimensionsBox}>
                  <DimensionBar label="Market Risk" value={investorRisk.marketRisk} />
                  <DimensionBar label="Execution Risk" value={investorRisk.executionRisk} />
                  <DimensionBar label="Competitive Risk" value={investorRisk.competitiveRisk} />
                  <DimensionBar label="Timing Risk" value={investorRisk.timingRisk} />
                  <DimensionBar label="Team Risk" value={investorRisk.teamRisk} />
                </View>

                {/* Deal Breakers */}
                {investorRisk.dealBreakers.length > 0 && (
                  <View style={styles.flagsBox}>
                    <Text style={styles.flagsTitle}>⛔ Deal Breakers</Text>
                    {investorRisk.dealBreakers.map((item, i) => (
                      <Text key={i} style={styles.flagText}>• {item}</Text>
                    ))}
                  </View>
                )}

                {/* Strengths */}
                {investorRisk.strengths.length > 0 && (
                  <View style={styles.strengthsBox}>
                    <Text style={styles.strengthsTitle}>✅ Strengths</Text>
                    {investorRisk.strengths.map((item, i) => (
                      <Text key={i} style={styles.strengthText}>• {item}</Text>
                    ))}
                  </View>
                )}

                {/* Exit Potential */}
                <View style={styles.exitBox}>
                  <Text style={styles.exitTitle}>🎯 Exit Potential</Text>
                  <Text style={styles.exitText}>{investorRisk.exitPotential}</Text>
                </View>
              </>
            ) : (
              <>
                {/* Entrepreneur Dimensions */}
                <View style={styles.dimensionsBox}>
                  <DimensionBar label="Technical Depth" value={slopScore.technicalDepth} />
                  <DimensionBar label="Market Reality" value={slopScore.marketReality} />
                  <DimensionBar label="Defensibility" value={slopScore.defensibility} />
                  <DimensionBar label="Feasibility" value={slopScore.feasibility} />
                  <DimensionBar label="Novelty" value={slopScore.novelty} />
                </View>

                {/* Red Flags */}
                {slopScore.redFlags.length > 0 && (
                  <View style={styles.flagsBox}>
                    <Text style={styles.flagsTitle}>🚩 Red Flags</Text>
                    {slopScore.redFlags.map((flag, i) => (
                      <Text key={i} style={styles.flagText}>• {flag}</Text>
                    ))}
                  </View>
                )}

                {/* Claims to Verify */}
                {slopScore.claimsToVerify.length > 0 && (
                  <View style={styles.claimsBox}>
                    <Text style={styles.claimsTitle}>🔍 Claims to Verify</Text>
                    {slopScore.claimsToVerify.map((claim, i) => (
                      <Text key={i} style={styles.claimText}>• {claim}</Text>
                    ))}
                  </View>
                )}
              </>
            )}
          </>
        )}
      </View>

      <View style={styles.specBox}>
        <Markdown style={mdStyles}>{s.spec.markdown}</Markdown>
      </View>
      <View style={styles.row}>
        <Button onPress={onCopy} variant="ghost" style={styles.flex1}>
          Kopyala
        </Button>
        <Button onPress={onShare} variant="ghost" style={styles.flex1}>
          Paylaş
        </Button>
      </View>
      <Button onPress={onNew}>Yeni nokta yakala</Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  content: { padding: 20, gap: 16, paddingTop: 60 },
  title: { color: '#fff', fontSize: 26, fontWeight: '800' },
  slopCard: {
    backgroundColor: 'rgba(0, 229, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  scoreCircle: {
    alignSelf: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 3,
    borderColor: '#00E5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNumber: {
    color: '#00E5FF',
    fontSize: 42,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  scoreLabel: {
    color: '#888',
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 4,
  },
  verdict: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  dimensionsBox: {
    gap: 12,
    marginTop: 8,
  },
  dimensionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dimensionLabel: {
    color: '#aaa',
    fontSize: 12,
    width: 110,
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#00E5FF',
  },
  dimensionValue: {
    color: '#00E5FF',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
    width: 30,
    textAlign: 'right',
  },
  flagsBox: {
    backgroundColor: 'rgba(255, 51, 85, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#FF3355',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  flagsTitle: {
    color: '#FF3355',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  flagText: {
    color: '#FFA1A1',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  claimsBox: {
    backgroundColor: 'rgba(255, 176, 32, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#FFB020',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  claimsTitle: {
    color: '#FFB020',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  claimText: {
    color: '#FFD699',
    fontSize: 12,
    lineHeight: 18,
  },
  strengthsBox: {
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#00FF88',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  strengthsTitle: {
    color: '#00FF88',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  strengthText: {
    color: '#99FFD6',
    fontSize: 12,
    lineHeight: 18,
  },
  exitBox: {
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#00E5FF',
    padding: 12,
    borderRadius: 8,
  },
  exitTitle: {
    color: '#00E5FF',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'monospace',
    marginBottom: 6,
  },
  exitText: {
    color: '#99E5FF',
    fontSize: 12,
    lineHeight: 18,
  },
  toggleButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
    alignItems: 'center',
  },
  toggleText: {
    color: '#00E5FF',
    fontSize: 14,
    fontWeight: '600',
  },
  specBox: { 
    backgroundColor: '#1a1a1a', 
    padding: 20, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#333',
    marginTop: 8,
  },
  row: { flexDirection: 'row', gap: 10 },
  flex1: { flex: 1 },
  empty: { color: '#aaa', textAlign: 'center', marginTop: 100, fontSize: 16 },
});

const mdStyles = {
  body: { color: '#e5e5e5', fontSize: 14, lineHeight: 22 },
  heading1: { color: '#fff', fontSize: 20, fontWeight: '800' as const, marginTop: 12 },
  heading2: { color: '#fff', fontSize: 16, fontWeight: '700' as const, marginTop: 12 },
  paragraph: { color: '#d4d4d4', marginVertical: 4 },
  code_inline: { color: '#fbbf24', backgroundColor: '#222', paddingHorizontal: 4, borderRadius: 4 },
  bullet_list_icon: { color: '#888' },
  hr: { backgroundColor: '#333' },
};
