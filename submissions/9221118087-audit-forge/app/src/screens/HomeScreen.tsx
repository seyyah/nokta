import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenCard } from '../components/ScreenCard';
import type { ScreenSummary } from '../types/audit';

const screens: ScreenSummary[] = [
  {
    name: 'HomeScreen',
    title: 'Human report entry',
    description: 'The user starts from a normal product screen and reports the issue through the floating widget.',
    risk: 'Touch point: the human decides what is wrong and marks the area.',
  },
  {
    name: 'ReportsScreen',
    title: 'Markdown artifact review',
    description: 'Generated reports are visible as Markdown so a coding agent can consume them directly.',
    risk: 'Ratchet: every accepted report can become a verified repair cycle.',
  },
  {
    name: 'SettingsScreen',
    title: 'Repair policy',
    description: 'Track C rules make commit and rollback visible parts of the same loop.',
    risk: 'Rollback: failed fixes are rejected and logged instead of being accepted silently.',
  },
];

export function HomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Track C - Otonomi</Text>
        <Text style={styles.title}>Audit Forge</Text>
        <Text style={styles.body}>
          A minimal Expo host app for turning human audit notes into coding-agent repair input.
        </Text>
      </View>

      <View style={styles.loop}>
        <Text style={styles.loopTitle}>Closed repair loop</Text>
        <Text style={styles.loopText}>
          Human report - Markdown report - coding agent repair - test - verify - commit or rollback.
        </Text>
      </View>

      <View style={styles.auditAction}>
        <View style={styles.auditActionText}>
          <Text style={styles.auditActionTitle}>Create an audit report</Text>
          <Text style={styles.auditActionBody}>
            Tap the red floating button, mark the problem area, and generate Markdown for the coding agent.
          </Text>
        </View>
        <Text style={styles.auditActionCue}>!</Text>
      </View>

      <View style={styles.cards}>
        {screens.map((screen) => (
          <ScreenCard key={screen.name} screen={screen} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#edf2f7',
    flex: 1,
  },
  content: {
    gap: 14,
    padding: 16,
    paddingBottom: 120,
  },
  hero: {
    backgroundColor: '#ffffff',
    borderColor: '#d7dee8',
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 18,
  },
  kicker: {
    color: '#be123c',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: '#17202a',
    fontSize: 30,
    fontWeight: '900',
  },
  body: {
    color: '#334155',
    fontSize: 16,
    lineHeight: 23,
  },
  loop: {
    backgroundColor: '#0f4c5c',
    borderRadius: 8,
    gap: 8,
    padding: 16,
  },
  loopTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },
  loopText: {
    color: '#d7f9ff',
    fontSize: 14,
    lineHeight: 20,
  },
  auditAction: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#be123c',
    borderRadius: 8,
    borderWidth: 2,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  auditActionText: {
    flex: 1,
    gap: 5,
  },
  auditActionTitle: {
    color: '#17202a',
    fontSize: 18,
    fontWeight: '900',
  },
  auditActionBody: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
  },
  auditActionCue: {
    backgroundColor: '#be123c',
    borderRadius: 20,
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
    height: 40,
    lineHeight: 40,
    textAlign: 'center',
    width: 40,
  },
  cards: {
    gap: 12,
  },
});
