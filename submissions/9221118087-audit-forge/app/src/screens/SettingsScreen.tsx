import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export function SettingsScreen() {
  const [requireVerification, setRequireVerification] = useState(true);
  const [rollbackOnFail, setRollbackOnFail] = useState(true);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Track C policy</Text>
        <Text style={styles.title}>Otonomi guardrails</Text>
        <Text style={styles.body}>
          The app treats audit reports as agent instructions, but verification decides whether a repair is accepted.
        </Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Repair loop gates</Text>
        <SettingToggle
          label="Require TEST and VERIFY before commit"
          enabled={requireVerification}
          onPress={() => setRequireVerification((value) => !value)}
        />
        <SettingToggle
          label="Rollback failed repair cycles"
          enabled={rollbackOnFail}
          onPress={() => setRollbackOnFail((value) => !value)}
        />
      </View>

      <View style={styles.rollback}>
        <View style={styles.rollbackHeader}>
          <Text style={styles.rollbackTitle}>Rollback rule</Text>
          <Text style={styles.rollbackBadge}>COMMIT BLOCKER</Text>
        </View>
        <Text style={styles.rollbackBody}>
          A repair that fails verification must be rejected, reverted, or left uncommitted. The failed attempt is then
          written into FORGE.md as a Rollback Cycle.
        </Text>
        <Text style={styles.rollbackGate}>No VERIFY, no COMMIT.</Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Current loop</Text>
        <Text style={styles.loopText}>
          READ - LOCATE - HYPOTHESIZE - REPAIR - TEST - VERIFY - COMMIT/ROLLBACK
        </Text>
      </View>
    </ScrollView>
  );
}

interface SettingToggleProps {
  label: string;
  enabled: boolean;
  onPress: () => void;
}

function SettingToggle({ label, enabled, onPress }: SettingToggleProps) {
  return (
    <Pressable style={styles.toggleRow} onPress={onPress}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <View style={[styles.toggle, enabled && styles.toggleEnabled]}>
        <View style={[styles.toggleKnob, enabled && styles.toggleKnobEnabled]} />
      </View>
    </Pressable>
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
  header: {
    backgroundColor: '#ffffff',
    borderColor: '#d7dee8',
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  kicker: {
    color: '#be123c',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: '#17202a',
    fontSize: 26,
    fontWeight: '900',
  },
  body: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
  },
  panel: {
    backgroundColor: '#ffffff',
    borderColor: '#d7dee8',
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  panelTitle: {
    color: '#17202a',
    fontSize: 18,
    fontWeight: '900',
  },
  toggleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  toggleLabel: {
    color: '#334155',
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  toggle: {
    backgroundColor: '#cbd5e1',
    borderRadius: 18,
    height: 32,
    justifyContent: 'center',
    paddingHorizontal: 3,
    width: 54,
  },
  toggleEnabled: {
    backgroundColor: '#0f4c5c',
  },
  toggleKnob: {
    backgroundColor: '#ffffff',
    borderRadius: 13,
    height: 26,
    width: 26,
  },
  toggleKnobEnabled: {
    alignSelf: 'flex-end',
  },
  rollback: {
    backgroundColor: '#431407',
    borderColor: '#f97316',
    borderRadius: 8,
    borderWidth: 2,
    gap: 10,
    padding: 16,
  },
  rollbackHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  rollbackTitle: {
    color: '#ffedd5',
    fontSize: 20,
    fontWeight: '900',
  },
  rollbackBadge: {
    backgroundColor: '#ffedd5',
    borderRadius: 6,
    color: '#9a3412',
    fontSize: 11,
    fontWeight: '900',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  rollbackBody: {
    color: '#fed7aa',
    fontSize: 14,
    lineHeight: 20,
  },
  rollbackGate: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  loopText: {
    color: '#0f4c5c',
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 20,
  },
});
