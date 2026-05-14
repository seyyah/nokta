import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ideas } from '../src/data';

export default function IdeaListScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.topBar}>
          <Link href="/" asChild>
            <Pressable style={styles.iconButton}>
              <Ionicons name="chevron-back" size={20} color="#111827" />
            </Pressable>
          </Link>
          <Text style={styles.title}>Idea list</Text>
        </View>

        {ideas.map((idea) => (
          <Link key={idea.id} href={`/idea/${idea.id}`} asChild>
            <Pressable style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.screenPill}>
                  <Text style={styles.screenPillText}>{idea.screen}</Text>
                </View>
                <Text style={styles.kg}>{idea.kg}kg</Text>
              </View>
              <Text style={styles.cardTitle}>{idea.title}</Text>
              <Text style={styles.cardBody}>{idea.customerSignal}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.status}>{idea.status}</Text>
                <Ionicons name="arrow-forward" size={18} color="#0f766e" />
              </View>
            </Pressable>
          </Link>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#f8fafc',
    flex: 1,
  },
  page: {
    gap: 12,
    padding: 20,
    paddingBottom: 96,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
    borderRadius: 8,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  title: {
    color: '#111827',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0,
  },
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 14,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  screenPill: {
    backgroundColor: '#ecfeff',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  screenPillText: {
    color: '#155e75',
    fontSize: 12,
    fontWeight: '800',
  },
  kg: {
    color: '#991b1b',
    fontSize: 13,
    fontWeight: '900',
  },
  cardTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '900',
  },
  cardBody: {
    color: '#4b5563',
    fontSize: 14,
    lineHeight: 20,
  },
  cardFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  status: {
    color: '#14532d',
    fontSize: 13,
    fontWeight: '800',
  },
});
