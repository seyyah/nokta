import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import GreenPill from '../components/GreenPill';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Svg, Rect, Path, Line } from 'react-native-svg';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Input'>;

export default function InputScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [idea, setIdea] = useState('');
  const [rec, setRec] = useState(false);
  const [err, setErr] = useState(false);

  const go = () => {
    if (!idea.trim()) { setErr(true); return; }
    navigation.navigate('Questions');
  };

  const mic = () => {
    setRec(true);
    setTimeout(() => {
      setIdea('I want to build an app that helps university students organize study groups and divide revision topics fairly.');
      setRec(false);
    }, 2200);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        {/* nav row */}
        <View style={styles.navRow}>
          <Text style={styles.title}>New Idea</Text>
          <GreenPill label="Track 1" small />
        </View>
        <Text style={styles.subtitle}>Paste, type, or speak your rough idea below.</Text>

        <ScrollView style={styles.scrollContent} contentContainerStyle={{ gap: 13, paddingBottom: 20 }} keyboardShouldPersistTaps="handled">
          {/* textarea card */}
          <View style={[styles.textAreaCard, { borderColor: err && !idea.trim() ? '#e05555' : idea.trim() ? colors.accent + '44' : '#ece6db' }]}>
            <TextInput
              style={styles.textInput}
              value={idea}
              onChangeText={(txt) => { setIdea(txt.slice(0, 500)); setErr(false); }}
              placeholder="Describe your app, startup, project, or rough idea…"
              placeholderTextColor="#999"
              multiline
              textAlignVertical="top"
            />
            {/* bottom toolbar */}
            <View style={styles.toolbar}>
              <Text style={styles.charCount}>{idea.length}/500</Text>
              <TouchableOpacity activeOpacity={0.7} onPress={mic} style={[styles.micBtn, { backgroundColor: rec ? '#e05555' : colors.accentLight }]}>
                {rec ? (
                  <>
                    <Animated.View exiting={FadeOut} style={styles.recordingDot} />
                    <Text style={[styles.micBtnText, { color: '#fff' }]}>Recording…</Text>
                  </>
                ) : (
                  <>
                    <Svg width="10" height="13" viewBox="0 0 10 13" fill="none">
                      <Rect x="2" y="0" width="6" height="8.5" rx="3" fill={colors.accent} />
                      <Path d="M1 7c0 2.2 1.8 4 4 4s4-1.8 4-4" stroke={colors.accent} strokeWidth="1.4" strokeLinecap="round" />
                      <Line x1="5" y1="11" x2="5" y2="13" stroke={colors.accent} strokeWidth="1.4" strokeLinecap="round" />
                    </Svg>
                    <Text style={styles.micBtnText}>Voice Input</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {err && !idea.trim() && (
            <Animated.View entering={FadeIn} style={styles.errBox}>
              <Text style={styles.errText}>Please enter your idea first.</Text>
            </Animated.View>
          )}

          {/* tip card */}
          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>💡</Text>
            <Text style={styles.tipText}>
              <Text style={{ fontFamily: 'DMSans_700Bold' }}>Raw ideas are fine.</Text> The AI will ask 5 focused engineering questions before generating your spec.
            </Text>
          </View>

          {/* example */}
          <View style={styles.exampleCard}>
            <Text style={styles.exampleLabel}>Example</Text>
            <Text style={styles.exampleText}>"An app that helps university students organize study groups and divide revision topics…"</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => { setIdea('I want to build an app that helps university students organize study groups and divide revision topics fairly.'); setErr(false); }}>
              <Text style={styles.exampleBtn}>Use this example →</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={idea.trim() ? 0.8 : 1}
            onPress={go}
            style={[styles.generateBtn, { backgroundColor: idea.trim() ? colors.accent : '#E8E2D8', shadowOpacity: idea.trim() ? 0.3 : 0 }]}
          >
            <Text style={[styles.generateBtnText, { color: idea.trim() ? '#fff' : '#B5AFA8' }]}>Generate Questions →</Text>
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
  title: { fontSize: 20, fontFamily: 'DMSans_800ExtraBold', color: colors.text, letterSpacing: -0.4 },
  subtitle: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 14, fontSize: 13, color: colors.subText, fontFamily: 'DMSans_400Regular' },
  scrollContent: { flex: 1, paddingHorizontal: 20 },
  textAreaCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  textInput: {
    width: '100%',
    minHeight: 150,
    padding: 16,
    fontSize: 15,
    lineHeight: 24,
    color: colors.text,
    fontFamily: 'DMSans_400Regular',
  },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingBottom: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F2EBE0' },
  charCount: { fontSize: 11, color: '#ccc', fontFamily: 'DMSans_400Regular' },
  micBtn: { borderRadius: 10, paddingVertical: 7, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 6 },
  micBtnText: { color: colors.accent, fontSize: 12, fontFamily: 'DMSans_700Bold' },
  recordingDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#fff' },
  errBox: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14 },
  errText: { fontSize: 13, color: '#DC2626', fontFamily: 'DMSans_500Medium' },
  tipCard: { backgroundColor: colors.accentLight, borderRadius: 18, paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', gap: 12 },
  tipIcon: { fontSize: 20 },
  tipText: { flex: 1, fontSize: 13, color: '#3A5018', lineHeight: 20, fontFamily: 'DMSans_400Regular' },
  exampleCard: { backgroundColor: colors.card, borderRadius: 18, paddingVertical: 14, paddingHorizontal: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  exampleLabel: { fontSize: 10, fontFamily: 'DMSans_800ExtraBold', color: '#C5BFB5', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 },
  exampleText: { fontSize: 13, color: colors.subText, fontStyle: 'italic', lineHeight: 20, fontFamily: 'DMSans_400Regular' },
  exampleBtn: { marginTop: 8, fontSize: 12, color: colors.accent, fontFamily: 'DMSans_700Bold' },
  footer: { paddingHorizontal: 20, paddingVertical: 14, paddingBottom: 36 },
  generateBtn: { borderRadius: 16, padding: 16, alignItems: 'center', shadowColor: colors.accent, shadowOffset: { width: 0, height: 6 }, shadowRadius: 20, elevation: 4 },
  generateBtnText: { fontSize: 16, fontFamily: 'DMSans_700Bold', letterSpacing: -0.2 },
});
