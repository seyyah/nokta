import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ShieldAlert, Cpu, Lightbulb } from 'lucide-react-native';

import { analyzeIdea, AnalysisResult } from '../services/aiService';
import Gauge from '../components/Gauge';

export default function ResultScreen() {
  const params = useLocalSearchParams();
  const ideaText = params.idea as string;
  const q1 = params.q1 as string;
  const q2 = params.q2 as string;
  const q3 = params.q3 as string;

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await analyzeIdea(ideaText || "", q1, q2, q3);
        setResult(res);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, [ideaText, q1, q2, q3]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00E5FF" />
        <Text style={styles.loadingText}>Otonom Analiz Raporlanıyor...</Text>
      </View>
    );
  }

  if (!result) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.ideaTextHeader}>TARANAN PROFİL:</Text>
        <Text style={styles.ideaText}>"{ideaText}"</Text>
      </View>

      <View style={styles.gaugeContainer}>
        <Gauge score={result.score} size={220} strokeWidth={20} />
        <Text style={[styles.summaryText, { color: result.score > 50 ? '#FF003C' : '#00FF41' }]}>
          KARAR: {result.decision}
        </Text>
        {result.gerekce && (
          <Text style={styles.gerekceText}>GEREKÇE: {result.gerekce}</Text>
        )}
      </View>

      <View style={styles.metricsContainer}>
        <MetricCard
          icon={<Cpu color="#00E5FF" size={24} />}
          title="Teknik Derinlik"
          description={result.teknikDerinlik}
        />
        <MetricCard
          icon={<ShieldAlert color="#FF003C" size={24} />}
          title="Savunulabilirlik"
          description={result.savunulabilirlik}
        />
        <MetricCard
          icon={<Lightbulb color="#00FF41" size={24} />}
          title="Pazar Gerçekliği"
          description={result.pazarGercekligi}
        />
      </View>
    </ScrollView>
  );
}

function MetricCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        {icon}
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      <Text style={styles.metricDescription}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#00E5FF',
    marginTop: 20,
    fontFamily: 'monospace',
    letterSpacing: 2,
    opacity: 0.8,
  },
  header: {
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#00E5FF',
    marginBottom: 30,
  },
  ideaTextHeader: {
    color: '#555',
    fontFamily: 'monospace',
    fontSize: 10,
    marginBottom: 8,
  },
  ideaText: {
    color: '#ccc',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  gaugeContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  summaryText: {
    marginTop: 30,
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'monospace',
    paddingHorizontal: 20,
    fontWeight: 'bold',
  },
  gerekceText: {
    marginTop: 15,
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    fontFamily: 'monospace',
    fontStyle: 'italic',
    paddingHorizontal: 30,
    lineHeight: 18,
  },
  metricsContainer: {
    gap: 16,
  },
  metricCard: {
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  metricTitle: {
    color: '#fff',
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  metricDescription: {
    color: '#888',
    lineHeight: 20,
    fontFamily: 'monospace',
    fontSize: 12,
  },
});
