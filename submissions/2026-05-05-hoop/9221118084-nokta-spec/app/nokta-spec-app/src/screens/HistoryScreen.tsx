import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import NavBtn from '../components/NavBtn';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Svg, Path, Circle } from 'react-native-svg';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'History'>;

const HISTORY = [
  { id: '1', title: 'Study Group Organizer', date: 'Oct 24', time: '14:20', preview: 'An app that helps university students organize...', status: 'Complete' },
  { id: '2', title: 'Fitness Bet Tracker', date: 'Oct 21', time: '09:15', preview: 'A social accountability app where friends put money...', status: 'Complete' },
  { id: '3', title: 'Recipe to Groceries', date: 'Oct 18', time: '18:40', preview: 'Scan a recipe webpage and auto-cart groceries...', status: 'Draft' },
  { id: '4', title: 'AI Code Reviewer', date: 'Oct 12', time: '11:00', preview: 'GitHub bot that checks PRs for security flaws...', status: 'Complete' },
];

export default function HistoryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [q, setQ] = useState('');

  const filtered = HISTORY.filter(h => h.title.toLowerCase().includes(q.toLowerCase()) || h.preview.toLowerCase().includes(q.toLowerCase()));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* nav */}
      <View style={styles.navRow}>
        <NavBtn onPress={() => navigation.goBack()}>
          <Svg width="9" height="15" viewBox="0 0 9 15" fill="none">
            <Path d="M7.5 1.5L2 7.5l5.5 6" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </NavBtn>
        <Text style={styles.navTitle}>My Specs</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* header box / search */}
      <View style={styles.headerBox}>
        <View style={styles.searchBar}>
          <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 6 }}>
            <Circle cx="11" cy="11" r="8" stroke={colors.subText} strokeWidth="2" />
            <Path d="M21 21l-4.35-4.35" stroke={colors.subText} strokeWidth="2" strokeLinecap="round" />
          </Svg>
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search specs..."
            placeholderTextColor="#999"
            style={styles.searchInput}
          />
        </View>
      </View>

      <ScrollView style={styles.scrollContent} contentContainerStyle={{ paddingBottom: 30, paddingTop: 6 }}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 32, marginBottom: 12 }}>🔍</Text>
            <Text style={styles.emptyTitle}>No specs found</Text>
            <Text style={styles.emptySub}>Try a different search term.</Text>
          </View>
        ) : (
          filtered.map((item, i) => (
            <Animated.View key={item.id} entering={FadeInUp.delay(i * 60).duration(350).springify()} style={styles.itemCard}>
              <View style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemPreview}>{item.preview}</Text>
                </View>
                <NavBtn size={36} onPress={() => navigation.navigate('Spec')}>
                  <Svg width="6" height="10" viewBox="0 0 6 10" fill="none">
                    <Path d="M1 1l4 4-4 4" stroke={colors.text} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </NavBtn>
              </View>
              <View style={styles.itemFooterRow}>
                <Text style={styles.itemDate}>{item.date} · {item.time}</Text>
                <View style={[styles.statusTag, { backgroundColor: item.status === 'Complete' ? colors.ok + '1A' : colors.warn + '1A' }]}>
                  <Text style={[styles.statusText, { color: item.status === 'Complete' ? colors.ok : colors.warn }]}>{item.status}</Text>
                </View>
              </View>
            </Animated.View>
          ))
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 4, paddingBottom: 16 },
  navTitle: { fontSize: 18, fontFamily: 'DMSans_800ExtraBold', color: colors.text, letterSpacing: -0.2 },
  headerBox: { paddingHorizontal: 20, paddingBottom: 16 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 14, paddingHorizontal: 12, height: 46, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  searchInput: { flex: 1, paddingHorizontal: 10, fontSize: 14, color: colors.text, fontFamily: 'DMSans_400Regular' },
  scrollContent: { flex: 1, paddingHorizontal: 20 },
  itemCard: { backgroundColor: colors.card, borderRadius: 18, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  itemTitle: { fontSize: 15, fontFamily: 'DMSans_700Bold', color: colors.text, marginBottom: 4 },
  itemPreview: { fontSize: 13, color: colors.subText, lineHeight: 18, fontFamily: 'DMSans_400Regular' },
  itemFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F4EFE6' },
  itemDate: { fontSize: 11, color: '#B5AFA8', fontFamily: 'DMSans_500Medium' },
  statusTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 9, fontFamily: 'DMSans_800ExtraBold', textTransform: 'uppercase', letterSpacing: 0.5 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontFamily: 'DMSans_700Bold', color: colors.text, marginBottom: 4 },
  emptySub: { fontSize: 14, color: colors.subText, fontFamily: 'DMSans_400Regular' },
});
