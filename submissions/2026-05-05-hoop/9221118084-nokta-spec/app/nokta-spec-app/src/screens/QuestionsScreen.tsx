import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import GreenPill from '../components/GreenPill';
import NavBtn from '../components/NavBtn';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Svg, Path } from 'react-native-svg';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Questions'>;

const QS = [
  {id:1,theme:'Problem',q:'What specific problem are students facing today?',hint:'Describe the core pain point.',icon:'🔍'},
  {id:2,theme:'Target User',q:'Who is the primary user — the group leader, or all students?',hint:'Be specific about roles and context.',icon:'👤'},
  {id:3,theme:'MVP Scope',q:'What should version 1 include — and only include?',hint:'List core features only.',icon:'📦'},
  {id:4,theme:'Constraints',q:'What are your technical, time, or resource constraints?',hint:'Platform, deadline, team size…',icon:'⚙️'},
  {id:5,theme:'Exclusions',q:'What should the MVP deliberately exclude?',hint:'Saying no is a design decision.',icon:'🚫'},
];
const SAMPLES = [
  'Students struggle to coordinate study groups — no clear way to divide topics, track who covers what, or set shared deadlines.',
  'All students in the group, but the group leader initiates setup and assigns topics.',
  'Group creation, topic assignment, progress tracking, shared deadline view.',
  'Mobile-first, React Native/Expo. 3-week timeline, team of 2.',
  'No real-time chat, no video, no AI suggestions — keep it focused.',
];

const ThinkingDots = () => {
  return (
    <Animated.View entering={FadeIn} style={styles.thinkingBox}>
      <Text style={styles.thinkingText}>AI is thinking…</Text>
    </Animated.View>
  );
};

export default function QuestionsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [step, setStep] = useState(0);
  const [answers, setAns] = useState<string[]>(Array(5).fill(''));
  const [thinking, setThink] = useState(true);
  
  const q = QS[step];
  const pct = Math.round(((step) / 5) * 100);
  const canNext = answers[step].trim().length > 0;
  const isLast = step === 4;

  useEffect(() => {
    setThink(true);
    const t = setTimeout(() => setThink(false), 1100);
    return () => clearTimeout(t);
  }, [step]);

  const next = () => {
    if (isLast) {
      navigation.navigate('Loading');
    } else {
      setStep(s => s + 1);
    }
  };

  const back = () => {
    if (step > 0) setStep(s => s - 1);
    else navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        {/* nav */}
        <View style={styles.navRow}>
          <NavBtn onPress={back}>
            <Svg width="9" height="15" viewBox="0 0 9 15" fill="none">
              <Path d="M7.5 1.5L2 7.5l5.5 6" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </NavBtn>
          <GreenPill label="Track 1" small />
          <View style={{ width: 40 }} />
        </View>

        {/* progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTextRow}>
            <Text style={styles.progressLabel}>Question {step + 1} of 5</Text>
            <Text style={styles.progressPct}>{Math.round(((step+1)/5)*100)}% complete</Text>
          </View>
          <View style={styles.progressBarBg}>
            <Animated.View style={[styles.progressBarFill, { width: `${Math.round(((step+1)/5)*100)}%` }]} />
          </View>
        </View>

        <ScrollView style={styles.scrollContent} contentContainerStyle={{ paddingBottom: 20 }} keyboardShouldPersistTaps="handled">
          {thinking ? (
            <ThinkingDots />
          ) : (
            <Animated.View entering={FadeInDown.duration(300).springify()} style={{ gap: 12 }}>
              {/* question card */}
              <View style={styles.questionCard}>
                <View style={styles.questionHeader}>
                  <View style={styles.iconBox}>
                    <Text style={{ fontSize: 16 }}>{q.icon}</Text>
                  </View>
                  <Text style={styles.themeTag}>{q.theme}</Text>
                </View>
                <Text style={styles.questionText}>{q.q}</Text>
                <Text style={styles.hintText}>{q.hint}</Text>
              </View>

              {/* prev answers */}
              {step > 0 && (
                <View style={styles.prevAnswersBox}>
                  <Text style={styles.prevAnswersLabel}>Your answers so far</Text>
                  {QS.slice(0, step).map((pq, i) => (
                    <View key={i} style={[styles.prevAnswerRow, { marginBottom: i < step - 1 ? 8 : 0 }]}>
                      <Text style={styles.prevAnswerNum}>{i + 1}.</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.prevTheme}>{pq.theme}</Text>
                        <Text style={styles.prevValue}>{answers[i] || '—'}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* answer input */}
              <View style={[styles.inputCard, { borderColor: answers[step].trim() ? colors.accent + '55' : '#EDE6D8' }]}>
                <TextInput
                  value={answers[step]}
                  onChangeText={txt => {
                    const n = [...answers];
                    n[step] = txt;
                    setAns(n);
                  }}
                  placeholder={`Your answer about ${q.theme.toLowerCase()}…`}
                  placeholderTextColor="#999"
                  multiline
                  textAlignVertical="top"
                  style={styles.textInput}
                />
                <View style={styles.inputFooter}>
                  <TouchableOpacity activeOpacity={0.7} onPress={() => {
                    const n = [...answers];
                    n[step] = SAMPLES[step];
                    setAns(n);
                  }}>
                    <Text style={styles.useSampleBtn}>Use sample answer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          {step > 0 && (
            <TouchableOpacity onPress={() => setStep(s => s - 1)} style={styles.backBtn}>
              <Text style={{ fontSize: 18, color: colors.text }}>←</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            disabled={!canNext || thinking}
            onPress={next}
            style={[styles.nextBtn, { backgroundColor: canNext && !thinking ? colors.accent : '#E8E2D8', shadowOpacity: canNext && !thinking ? 0.3 : 0 }]}
          >
            <Text style={[styles.nextBtnText, { color: canNext && !thinking ? '#fff' : '#B5AFA8' }]}>
              {isLast ? 'Generate Spec ✦' : `Next: ${QS[step + 1]?.theme} →`}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, flexDirection: 'column' },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 4 },
  progressContainer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 6 },
  progressTextRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  progressLabel: { fontSize: 13, fontFamily: 'DMSans_700Bold', color: colors.accent },
  progressPct: { fontSize: 12, color: colors.subText, fontFamily: 'DMSans_400Regular' },
  progressBarBg: { height: 5, backgroundColor: '#E8E2D5', borderRadius: 99, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: colors.accent, borderRadius: 99 },
  scrollContent: { flex: 1, paddingHorizontal: 20, paddingTop: 8 },
  thinkingBox: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: colors.accentLight, borderRadius: 14, alignSelf: 'flex-start' },
  thinkingText: { fontSize: 12, color: colors.accent, fontFamily: 'DMSans_700Bold', marginLeft: 4 },
  questionCard: { backgroundColor: colors.card, borderRadius: 22, padding: 18, borderLeftWidth: 4, borderLeftColor: colors.accent, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 16, elevation: 4 },
  questionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  iconBox: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.accentLight, alignItems: 'center', justifyContent: 'center' },
  themeTag: { fontSize: 10, fontFamily: 'DMSans_800ExtraBold', textTransform: 'uppercase', letterSpacing: 0.7, color: colors.accent },
  questionText: { fontSize: 16, fontFamily: 'DMSans_700Bold', color: colors.text, lineHeight: 22, letterSpacing: -0.2 },
  hintText: { fontSize: 12, color: colors.subText, marginTop: 6, lineHeight: 18, fontFamily: 'DMSans_400Regular' },
  prevAnswersBox: { backgroundColor: colors.pill, borderRadius: 16, padding: 14 },
  prevAnswersLabel: { fontSize: 10, fontFamily: 'DMSans_800ExtraBold', color: '#B5AFA8', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 },
  prevAnswerRow: { flexDirection: 'row', gap: 8 },
  prevAnswerNum: { fontSize: 11, color: colors.accent, fontFamily: 'DMSans_800ExtraBold', minWidth: 14 },
  prevTheme: { fontSize: 10, color: colors.subText, fontFamily: 'DMSans_700Bold' },
  prevValue: { fontSize: 12, color: colors.text, lineHeight: 17, fontFamily: 'DMSans_400Regular' },
  inputCard: { backgroundColor: colors.card, borderRadius: 18, overflow: 'hidden', borderWidth: 1.5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  textInput: { width: '100%', minHeight: 100, padding: 14, fontSize: 14, lineHeight: 22, color: colors.text, fontFamily: 'DMSans_400Regular' },
  inputFooter: { alignItems: 'flex-end', paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#F2EBE0' },
  useSampleBtn: { fontSize: 11, color: '#C5BFB5', fontFamily: 'DMSans_700Bold' },
  footer: { paddingHorizontal: 20, paddingBottom: 36, flexDirection: 'row', gap: 10 },
  backBtn: { width: 50, backgroundColor: colors.card, borderWidth: 1.5, borderColor: '#EDE6D8', borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  nextBtn: { flex: 1, borderRadius: 14, padding: 15, alignItems: 'center', shadowColor: colors.accent, shadowOffset: { width: 0, height: 6 }, shadowRadius: 18, elevation: 4 },
  nextBtnText: { fontSize: 15, fontFamily: 'DMSans_700Bold', letterSpacing: -0.2 },
});
