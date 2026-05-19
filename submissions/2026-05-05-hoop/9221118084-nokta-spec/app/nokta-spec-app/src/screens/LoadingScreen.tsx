import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { Svg, Path } from 'react-native-svg';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Loading'>;

const steps = ['Analysing your idea…', 'Mapping constraints…', 'Structuring spec…', 'Generating sections…', 'Finalising output…'];

export default function LoadingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setActive(a => {
        if (a < 4) return a + 1;
        return a;
      });
    }, 900);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (active === 4) {
      const wait = setTimeout(() => {
        navigation.replace('Spec');
      }, 1000);
      return () => clearTimeout(wait);
    }
  }, [active, navigation]);

  const rotation1 = useSharedValue(0);
  const rotation2 = useSharedValue(0);

  useEffect(() => {
    rotation1.value = withRepeat(withTiming(360, { duration: 1000, easing: Easing.linear }), -1, false);
    rotation2.value = withRepeat(withTiming(-360, { duration: 1600, easing: Easing.linear }), -1, false);
  }, []);

  const spinStyle1 = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation1.value}deg` }]
    };
  });

  const spinStyle2 = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation2.value}deg` }]
    };
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {/* spinner */}
        <View style={styles.spinnerWrapper}>
          <Animated.View style={[styles.spinnerOuter, spinStyle1]} />
          <Animated.View style={[styles.spinnerInner, spinStyle2]} />
          <View style={styles.iconCenter}>
            <Svg width="26" height="24" viewBox="0 0 26 24" fill="none">
              <Path d="M4 5h18M4 10h12M4 15h8" stroke={colors.accent} strokeWidth="2.2" strokeLinecap="round" />
            </Svg>
          </View>
        </View>

        <View style={styles.textWrapper}>
          <Text style={styles.title}>Generating Your Spec</Text>
          <Text style={styles.subtitle}>AI is processing your answers and building a structured product specification…</Text>
        </View>

        <Animated.View entering={FadeIn.duration(400)} style={styles.stepsCard}>
          {steps.map((s, i) => (
            <View key={i} style={[styles.stepItem, { opacity: i > active + 1 ? 0.3 : 1 }]}>
              <View style={[styles.stepDot, { backgroundColor: i < active ? colors.ok : i === active ? colors.accent : '#EDE6D8' }]}>
                {i < active ? (
                  <Svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <Path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                ) : i === active ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : null}
              </View>
              <Text style={[styles.stepText, { color: i <= active ? colors.text : colors.subText, fontWeight: i === active ? '600' : '400' }]}>{s}</Text>
            </View>
          ))}
        </Animated.View>

        <Text style={styles.footerTag}>TRACK 1 · NOKTA SPEC</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingBottom: 60, gap: 28 },
  spinnerWrapper: { position: 'relative', width: 84, height: 84 },
  spinnerOuter: { position: 'absolute', inset: 0, borderRadius: 42, borderWidth: 3, borderColor: colors.accent + '22', borderTopColor: colors.accent },
  spinnerInner: { position: 'absolute', inset: 12, borderRadius: 30, borderWidth: 2, borderColor: colors.accentLight, borderTopColor: '#8AB840' },
  iconCenter: { position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' },
  textWrapper: { alignItems: 'center' },
  title: { fontSize: 22, fontFamily: 'DMSans_800ExtraBold', color: colors.text, marginBottom: 7, letterSpacing: -0.4 },
  subtitle: { fontSize: 13, color: colors.subText, lineHeight: 21, textAlign: 'center', fontFamily: 'DMSans_400Regular' },
  stepsCard: { backgroundColor: colors.card, borderRadius: 22, paddingVertical: 16, paddingHorizontal: 20, width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 12, elevation: 4 },
  stepItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  stepDot: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  stepText: { fontSize: 14, fontFamily: 'DMSans_400Regular' },
  footerTag: { fontSize: 11, color: '#C5BFB5', fontFamily: 'DMSans_700Bold', letterSpacing: 0.3, marginTop: 20 },
});
