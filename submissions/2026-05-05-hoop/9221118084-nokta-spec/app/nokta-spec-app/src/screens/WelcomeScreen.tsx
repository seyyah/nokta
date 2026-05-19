import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import GreenPill from '../components/GreenPill';
import { Svg, Path, Circle } from 'react-native-svg';
import Animated, { FadeInUp } from 'react-native-reanimated';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {/* hero */}
        <Animated.View entering={FadeInUp.duration(500).springify()} style={styles.hero}>
          {/* track badge */}
          <View style={{ marginBottom: 24 }}>
            <GreenPill label="Track 1 · AI Spec Generator" />
          </View>
          
          {/* logo card */}
          <View style={styles.logoCard}>
            <Svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <Path d="M8 11h24M8 17h18M8 23h12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
              <Circle cx="30" cy="30" r="6" fill="rgba(255,255,255,.22)" stroke="#fff" strokeWidth="2" />
              <Path d="M27.5 30h5M30 27.5v5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            </Svg>
          </View>
          <Text style={styles.title}>NOKTA Spec</Text>
          <Text style={styles.subtitle}>Turn rough ideas into clear, structured product specs</Text>

          {/* flow steps card */}
          <View style={styles.stepsCard}>
            {[
              { n: '01', t: 'Enter your rough idea', s: 'Text or voice — raw is fine' },
              { n: '02', t: 'Answer 5 AI questions', s: 'Problem, scope, constraints…' },
              { n: '03', t: 'Get your product spec', s: 'Structured, readable, exportable' },
            ].map((row, i) => (
              <View key={i} style={[styles.stepRow, i < 2 && styles.stepRowBorder]}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>{row.n}</Text>
                </View>
                <View>
                  <Text style={styles.stepTitle}>{row.t}</Text>
                  <Text style={styles.stepSub}>{row.s}</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* CTA */}
        <Animated.View entering={FadeInUp.delay(150).duration(500).springify()} style={styles.ctaContainer}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('Input')} style={styles.startBtn}>
            <Text style={styles.startBtnText}>Start — Enter Your Idea</Text>
          </TouchableOpacity>
          <View style={styles.rowBtns}>
            <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('Spec')} style={styles.secondaryBtn}>
              <Text style={styles.secondaryBtnText}>View Sample</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('History')} style={styles.secondaryBtn}>
              <Text style={styles.secondaryBtnText}>My Specs</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5EFE0' },
  container: { flex: 1, backgroundColor: '#F5EFE0', flexDirection: 'column', paddingBottom: 32 },
  hero: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 },
  logoCard: { width: 80, height: 80, borderRadius: 24, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 18, shadowColor: colors.accent, shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.27, shadowRadius: 36, elevation: 8 },
  title: { fontSize: 30, fontFamily: 'DMSans_800ExtraBold', color: colors.text, letterSpacing: -0.6, marginBottom: 6 },
  subtitle: { fontSize: 14, color: colors.subText, textAlign: 'center', maxWidth: 240, lineHeight: 22, fontFamily: 'DMSans_400Regular' },
  stepsCard: { marginTop: 28, backgroundColor: colors.card, borderRadius: 22, paddingVertical: 18, paddingHorizontal: 20, width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 16, elevation: 4 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepRowBorder: { paddingBottom: 14, marginBottom: 14, borderBottomWidth: 1, borderBottomColor: '#F0EBE2' },
  stepNum: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.accentLight, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { fontSize: 11, fontFamily: 'DMSans_800ExtraBold', color: colors.accent },
  stepTitle: { fontSize: 14, fontFamily: 'DMSans_700Bold', color: colors.text, lineHeight: 18 },
  stepSub: { fontSize: 12, color: colors.subText, marginTop: 1, fontFamily: 'DMSans_400Regular' },
  ctaContainer: { paddingHorizontal: 24, flexDirection: 'column', gap: 10 },
  startBtn: { backgroundColor: colors.accent, borderRadius: 16, padding: 16, alignItems: 'center', shadowColor: colors.accent, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.31, shadowRadius: 24, elevation: 6 },
  startBtnText: { color: '#fff', fontSize: 16, fontFamily: 'DMSans_700Bold', letterSpacing: -0.2 },
  rowBtns: { flexDirection: 'row', gap: 10 },
  secondaryBtn: { flex: 1, backgroundColor: colors.card, borderRadius: 16, padding: 13, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  secondaryBtnText: { color: colors.text, fontSize: 14, fontFamily: 'DMSans_700Bold' },
});
