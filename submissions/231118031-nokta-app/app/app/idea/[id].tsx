import { Ionicons } from '@expo/vector-icons';
import { Link, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ideas } from '../../src/data';

export default function IdeaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const idea = ideas.find((item) => item.id === id) ?? ideas[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.topBar}>
          <Link href="/ideas" asChild>
            <Pressable style={styles.iconButton}>
              <Ionicons name="chevron-back" size={20} color="#111827" />
            </Pressable>
          </Link>
          <Text style={styles.screen}>{idea.screen}</Text>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>{idea.title}</Text>
          <Text style={styles.subtitle}>{idea.status}</Text>
        </View>

        <Section
          icon="person"
          title="Customer signal"
          body={idea.customerSignal}
          tone="cyan"
        />
        <Section
          icon="construct"
          title="Forge hypothesis"
          body={idea.developerMove}
          tone="green"
        />
        <Section
          icon="checkmark-done"
          title="Verify"
          body="The fixed screen must preserve the app flow, keep the audit widget removable, and resolve only this report."
          tone="amber"
        />

        <Link href="/forge" asChild>
          <Pressable style={styles.primaryAction}>
            <Ionicons name="git-branch" size={18} color="#ffffff" />
            <Text style={styles.primaryActionText}>Inspect cycle</Text>
          </Pressable>
        </Link>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  icon,
  title,
  body,
  tone,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  tone: 'cyan' | 'green' | 'amber';
}) {
  return (
    <View style={styles.section}>
      <View style={[styles.sectionIcon, styles[`${tone}Icon`]]}>
        <Ionicons name={icon} size={18} color="#111827" />
      </View>
      <View style={styles.sectionText}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionBody}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#f8fafc',
    flex: 1,
  },
  page: {
    gap: 14,
    padding: 20,
    paddingBottom: 96,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
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
  screen: {
    color: '#0f766e',
    fontSize: 14,
    fontWeight: '900',
  },
  header: {
    backgroundColor: '#111827',
    borderRadius: 8,
    gap: 8,
    padding: 18,
  },
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 33,
  },
  subtitle: {
    color: '#fbbf24',
    fontSize: 14,
    fontWeight: '800',
  },
  section: {
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  sectionIcon: {
    alignItems: 'center',
    borderRadius: 8,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  cyanIcon: {
    backgroundColor: '#cffafe',
  },
  greenIcon: {
    backgroundColor: '#dcfce7',
  },
  amberIcon: {
    backgroundColor: '#fef3c7',
  },
  sectionText: {
    flex: 1,
    gap: 5,
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '900',
  },
  sectionBody: {
    color: '#4b5563',
    fontSize: 14,
    lineHeight: 20,
  },
  primaryAction: {
    alignItems: 'center',
    backgroundColor: '#0f766e',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 50,
  },
  primaryActionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
});
