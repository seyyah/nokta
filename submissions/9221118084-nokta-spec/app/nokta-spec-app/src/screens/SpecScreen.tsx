import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import GreenPill from '../components/GreenPill';
import NavBtn from '../components/NavBtn';
import SectionCard from '../components/SectionCard';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Svg, Path, Rect } from 'react-native-svg';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Spec'>;

const SPEC = [
  { theme: 'Problem', content: 'Students struggle to coordinate study groups effectively. There is no clear way to divide revision topics, track who has covered what, or set shared deadlines.', accent: '#C97A30' },
  { theme: 'Target User', content: 'All students in the group are the primary users. However, the group leader specifically initiates the workspace setup and assigns initial topics.', accent: '#4A7A28' },
  { theme: 'MVP Scope', content: 'Core features limited to: Group creation and link sharing. Topic assignment and individual status marking. Overall progress tracking and a shared deadline countdown view.', accent: '#8C6C30' },
  { theme: 'Constraints', content: 'Must be a mobile-first experience built with React Native/Expo. Requires completion within a 3-week timeline by a team of 2 developers.', accent: '#A05C5C' },
  { theme: 'Exclusions', content: 'Deliberately excluding real-time chat, video conferencing, and AI-driven study suggestions to maintain focus on core coordination.', accent: '#5C5CA0' }
];

export default function SpecScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [copied, setCopied] = useState(false);

  const copy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* nav */}
      <View style={styles.navRow}>
        <NavBtn onPress={() => navigation.navigate('Welcome')}>
          <Svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <Path d="M7 1v12M1 7h12" stroke={colors.text} strokeWidth="2" strokeLinecap="round" transform="rotate(45 7 7)" />
          </Svg>
        </NavBtn>
        <Text style={styles.navTitle}>Product Spec</Text>
        <NavBtn onPress={() => navigation.navigate('History')}>
          <Svg width="14" height="12" viewBox="0 0 14 12" fill="none">
            <Path d="M1 3h12M1 9h8" stroke={colors.text} strokeWidth="2" strokeLinecap="round" />
          </Svg>
        </NavBtn>
      </View>

      <ScrollView style={styles.scrollContent} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {/* head card */}
        <Animated.View entering={FadeInUp.duration(400).springify()} style={styles.headCard}>
          <View style={styles.headRow}>
            <GreenPill label="Study Group Organizer" />
            <Text style={styles.headDate}>Just now</Text>
          </View>
          <Text style={styles.ideaText}>"An app that helps university students organize study groups and divide revision topics…"</Text>
        </Animated.View>

        {/* sections */}
        <View style={styles.sectionsWrapper}>
          {SPEC.map((s, i) => (
            <SectionCard key={i} index={i} title={s.theme} content={s.content} accent={s.accent} />
          ))}
        </View>

        {/* actions */}
        <Animated.View entering={FadeIn.delay(400).duration(400)} style={styles.actionsBox}>
          <TouchableOpacity activeOpacity={0.8} onPress={copy} style={[styles.copyBtn, { backgroundColor: copied ? colors.ok : colors.accent }]}>
            <Text style={styles.copyBtnText}>{copied ? 'Copied to Clipboard ✓' : 'Copy Spec Text'}</Text>
          </TouchableOpacity>
          <View style={styles.rowBtns}>
            <TouchableOpacity style={styles.secondaryBtn}>
              <Text style={styles.secondaryBtnText}>Save to 'My Specs'</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <Path d="M12 4v12M12 4L8 8M12 4l4 4M20 20H4" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* final links */}
        <Animated.View entering={FadeIn.delay(500).duration(400)} style={styles.finalLinks}>
          <TouchableOpacity onPress={() => navigation.navigate('Input')} style={{ padding: 10 }}>
            <Text style={styles.newIdeaTxt}>← Start a New Idea</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Questions')} style={{ padding: 10 }}>
            <Text style={styles.regenTxt}>Regenerate</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 4, paddingBottom: 12 },
  navTitle: { fontSize: 16, fontFamily: 'DMSans_800ExtraBold', color: colors.text },
  scrollContent: { flex: 1, paddingHorizontal: 20 },
  headCard: { backgroundColor: colors.accentLight, borderRadius: 18, padding: 16, marginBottom: 16 },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  headDate: { fontSize: 11, color: colors.accent, fontFamily: 'DMSans_500Medium' },
  ideaText: { fontSize: 13, color: '#3A5018', fontStyle: 'italic', lineHeight: 20, fontFamily: 'DMSans_400Regular' },
  sectionsWrapper: { marginBottom: 20 },
  actionsBox: { backgroundColor: colors.card, borderRadius: 20, padding: 14, gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  copyBtn: { borderRadius: 14, padding: 14, alignItems: 'center' },
  copyBtnText: { color: '#fff', fontSize: 14, fontFamily: 'DMSans_700Bold' },
  rowBtns: { flexDirection: 'row', gap: 10 },
  secondaryBtn: { flex: 1, backgroundColor: colors.bg, borderRadius: 12, padding: 12, alignItems: 'center' },
  secondaryBtnText: { color: colors.text, fontSize: 13, fontFamily: 'DMSans_700Bold' },
  iconBtn: { width: 44, height: 44, backgroundColor: colors.bg, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  finalLinks: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  newIdeaTxt: { fontSize: 13, color: colors.subText, fontFamily: 'DMSans_700Bold' },
  regenTxt: { fontSize: 13, color: colors.subText, fontFamily: 'DMSans_700Bold', textDecorationLine: 'underline' },
});
