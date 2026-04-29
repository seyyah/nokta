import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../theme/colors';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Cpu } from 'lucide-react-native';
import { analyzePitch } from '../services/gemini';

type LoadingScreenRouteProp = RouteProp<RootStackParamList, 'Loading'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Loading'>;

const MESSAGES = [
  "Pazar iddiaları ayrıştırılıyor...",
  "Teknik kısıtlamalar test ediliyor...",
  "Sektörel klişeler ve jargon (slop) aranıyor...",
  "Venture Capital 'roast' motoru ısıtılıyor...",
  "Pazar gerçekliği simüle ediliyor..."
];

const LoadingScreen = () => {
  const route = useRoute<LoadingScreenRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    // Message cycling logic
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 2500);

    // Dynamic analysis call
    const runAnalysis = async () => {
      try {
        const result = await analyzePitch(route.params.pitch);
        // Ensure a minimum loading time for better UX
        setTimeout(() => {
          navigation.replace('Dashboard', { result });
        }, 5000);
      } catch (error) {
        console.error("Analysis failed:", error);
      }
    };

    runAnalysis();

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Cpu color={COLORS.secondary} size={64} />
        </View>

        <Text style={styles.title}>Agent at Work</Text>
        
        <View style={styles.messageBox}>
          <Text style={styles.message}>
            {MESSAGES[messageIndex]}
          </Text>
        </View>

        <View style={styles.progressContainer}>
           <View style={styles.progressBar}>
              <View style={styles.progressFill} />
           </View>
        </View>

        <Text style={styles.disclaimer}>
          Analiz sonuçları pazar verileri ve LLM simulasyonlarına dayanmaktadır.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  iconContainer: {
    marginBottom: SPACING.xl,
    padding: SPACING.lg,
    borderRadius: 100,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  messageBox: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 16,
    color: COLORS.secondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  progressContainer: {
    width: '80%',
    marginTop: SPACING.xxl,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.surface,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '50%', // Static or simple animation can be added later if needed
    backgroundColor: COLORS.secondary,
  },
  disclaimer: {
    position: 'absolute',
    bottom: SPACING.xl,
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    opacity: 0.6,
  }
});

export default LoadingScreen;
