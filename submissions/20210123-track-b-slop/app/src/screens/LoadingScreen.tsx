import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  FadeIn, 
  FadeOut, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  useSharedValue,
  withDelay
} from 'react-native-reanimated';
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
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    // Pulsing animation for the icon
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.4, { duration: 1000 })
      ),
      -1,
      true
    );

    // Message cycling logic
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 2500);

    // Dynamic analysis call
    const runAnalysis = async () => {
      const result = await analyzePitch(route.params.pitch);
      
      // Delay slightly if the analysis was too fast, to ensure the "wow" factor of the animations
      const minAnalysisTime = 5000;
      setTimeout(() => {
        navigation.replace('Dashboard', { result });
      }, Math.max(0, minAnalysisTime));
    };

    runAnalysis();

    return () => {
      clearInterval(interval);
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[styles.iconContainer, animatedStyle]}>
          <Cpu color={COLORS.secondary} size={64} />
        </Animated.View>

        <Text style={styles.title}>Agent at Work</Text>
        
        <View style={styles.messageBox}>
          <Animated.Text 
            key={messageIndex}
            entering={FadeIn.duration(500)}
            exiting={FadeOut.duration(500)}
            style={styles.message}
          >
            {MESSAGES[messageIndex]}
          </Animated.Text>
        </View>

        <View style={styles.progressContainer}>
           <View style={styles.progressBar}>
              <Animated.View 
                entering={FadeIn.delay(100)}
                style={styles.progressFill} 
              />
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
    width: '100%',
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
