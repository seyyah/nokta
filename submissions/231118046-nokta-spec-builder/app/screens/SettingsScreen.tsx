import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Pressable } from 'react-native';

export default function SettingsScreen() {
  const [voiceActive, setVoiceActive] = React.useState(true);
  const [shadersActive, setShadersActive] = React.useState(true);
  const [hapticFeedback, setHapticFeedback] = React.useState(true);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Nokta Settings</Text>

      {/* Group 1: AI Performance Settings */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>PERFORMANCE & RENDERING</Text>
      </View>

      <View style={styles.settingsCard}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Premium GL Shaders</Text>
            <Text style={styles.settingSub}>Enables realistic glass & lighting</Text>
          </View>
          <Switch
            value={shadersActive}
            onValueChange={setShadersActive}
            trackColor={{ false: '#161622', true: '#00f2fe' }}
            thumbColor={shadersActive ? '#ffffff' : '#3a3a4c'}
          />
        </View>

        <View style={styles.infoDivider} />

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Voice-driven Lipsync</Text>
            <Text style={styles.settingSub}>Animate kafa/boyun in realtime</Text>
          </View>
          <Switch
            value={voiceActive}
            onValueChange={setVoiceActive}
            trackColor={{ false: '#161622', true: '#00f2fe' }}
            thumbColor={voiceActive ? '#ffffff' : '#3a3a4c'}
          />
        </View>
      </View>

      {/* Group 2: User Experience */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>SYSTEM & UX</Text>
      </View>

      <View style={styles.settingsCard}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Haptic Response</Text>
            <Text style={styles.settingSub}>Soft vibrations during interaction</Text>
          </View>
          <Switch
            value={hapticFeedback}
            onValueChange={setHapticFeedback}
            trackColor={{ false: '#161622', true: '#00f2fe' }}
            thumbColor={hapticFeedback ? '#ffffff' : '#3a3a4c'}
          />
        </View>

        <View style={styles.infoDivider} />

        <Pressable style={({ pressed }) => [styles.clickableRow, pressed && styles.rowPressed]}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Reset Assistant Cache</Text>
            <Text style={styles.settingSub}>Clears 3D files & loaded models</Text>
          </View>
          <Text style={styles.chevron}>➔</Text>
        </Pressable>
      </View>

      {/* Footer Info */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Nokta Virtual Assistant • Version 2.4.0</Text>
        <Text style={styles.footerSubText}>Submission Spec-Builder Client</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0c',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'stretch',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
    letterSpacing: 1,
  },
  sectionHeader: {
    marginLeft: 4,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.3)',
    letterSpacing: 1.5,
  },
  settingsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 20,
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
  },
  clickableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
  },
  rowPressed: {
    opacity: 0.7,
  },
  settingInfo: {
    flex: 1,
    paddingRight: 10,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  settingSub: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  chevron: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.3)',
  },
  infoDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.25)',
    marginBottom: 4,
  },
  footerSubText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.15)',
  },
});
