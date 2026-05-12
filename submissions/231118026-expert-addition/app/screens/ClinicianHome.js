import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CATALOG } from '../data/catalog';

const CALCULATOR_IDS = new Set([
  'ascvd-calculator', 'chads2vasc-calculator', 'framingham-calculator', 'wells-dvt',
  'dmft-index', 'das-r', 'braden-scale', 'news2', 'meld', 'meld-na', 'caprini-vte', 'psi-port',
  'phq9', 'gad7', 'koos-score',
  'grace-score', 'timi-risk', 'heart-score', 'ckd-epi', 'mdrd-gfr', 'fena',
]);

const FEATURE_LABELS = {
  booking: { label: 'Book Appointment', icon: 'calendar', primary: true },
  'appointment-reminder': { label: 'Reminders', icon: 'notifications-outline' },
  'patient-education': { label: 'Health Tips', icon: 'book-outline' },
  'follow-up-checklist': { label: 'Follow-Up', icon: 'checkmark-done-outline' },
  'secure-messaging': { label: 'Messages', icon: 'chatbubble-outline' },
  telehealth: { label: 'Video Call', icon: 'videocam-outline' },
  'treatment-plan': { label: 'Treatment Plan', icon: 'list-outline' },
  'oral-health-tips': { label: 'Oral Health', icon: 'bulb-outline' },
  'x-ray-viewer': { label: 'My X-Rays', icon: 'scan-outline' },
  'shift-handoff': { label: 'Shift Notes', icon: 'swap-horizontal-outline' },
  'patient-vitals': { label: 'Vitals', icon: 'pulse-outline' },
  'medication-tracker': { label: 'Medications', icon: 'medkit-outline' },
  'tele-dentistry': { label: 'Photo Consult', icon: 'camera-outline' },
  gamification: { label: 'Oral Habits', icon: 'trophy-outline' },
  'ohat-screening': { label: 'OHAT Screen', icon: 'clipboard-outline' },
  'ascvd-calculator': { label: 'ASCVD Risk', icon: 'calculator-outline', isCalc: true },
  'chads2vasc-calculator': { label: 'CHA₂DS₂-VASc', icon: 'pulse-outline', isCalc: true },
  'framingham-calculator': { label: 'Framingham Risk', icon: 'heart-circle-outline', isCalc: true },
  'wells-dvt': { label: 'Wells DVT', icon: 'fitness-outline', isCalc: true },
  'dmft-index': { label: 'DMFT Index', icon: 'calculator-outline', isCalc: true },
  'das-r': { label: 'Dental Anxiety', icon: 'heart-half-outline', isCalc: true },
  'braden-scale': { label: 'Braden Scale', icon: 'body-outline', isCalc: true },
  news2: { label: 'NEWS2', icon: 'speedometer-outline', isCalc: true },
  meld: { label: 'MELD Score', icon: 'water-outline', isCalc: true },
  'meld-na': { label: 'MELD-Na', icon: 'water-outline', isCalc: true },
  'caprini-vte': { label: 'Caprini VTE', icon: 'fitness-outline', isCalc: true },
  'psi-port': { label: 'PSI/PORT', icon: 'speedometer-outline', isCalc: true },
  phq9: { label: 'PHQ-9', icon: 'calculator-outline', isCalc: true },
  gad7: { label: 'GAD-7', icon: 'heart-half-outline', isCalc: true },
  'koos-score': { label: 'KOOS Score', icon: 'body-outline', isCalc: true },
  'grace-score': { label: 'GRACE Score', icon: 'heart-circle-outline', isCalc: true },
  'timi-risk': { label: 'TIMI Risk', icon: 'analytics-outline', isCalc: true },
  'heart-score': { label: 'HEART Score', icon: 'pulse-outline', isCalc: true },
  'ckd-epi': { label: 'CKD-EPI GFR', icon: 'calculator-outline', isCalc: true },
  'mdrd-gfr': { label: 'MDRD GFR', icon: 'water-outline', isCalc: true },
  fena: { label: 'FENa', icon: 'analytics-outline', isCalc: true },
  'patient-vitals': { label: 'Lab Results', icon: 'pulse-outline' },
  'pre-op-checklist': { label: 'Pre-Op Checklist', icon: 'checkbox-outline' },
  'exercise-tracker': { label: 'Rehab Exercises', icon: 'barbell-outline' },
  'pain-tracker': { label: 'Pain Tracker', icon: 'pulse-outline' },
  'mood-tracker': { label: 'Mood Tracker', icon: 'sunny-outline' },
  'crisis-resources': { label: 'Crisis Resources', icon: 'alert-circle-outline' },
};

const THEMES = [
  { accent: '#abcbdf', bg: '#0d1f2d' },
  { accent: '#ffb4ab', bg: '#1f0d0d' },
  { accent: '#c5e8c5', bg: '#0d1f0d' },
];

export default function ClinicianHome({ navigation, route }) {
  const { appName, selectedComponents = [], specialty, themeIndex } = route.params || {};
  const catalogEntry = specialty ? CATALOG[specialty] : null;
  const theme = themeIndex != null ? THEMES[themeIndex] : null;
  const accent = theme?.accent || catalogEntry?.accentColor || '#abcbdf';

  const primaryFeature = selectedComponents.find((id) => FEATURE_LABELS[id]?.primary);
  const secondaryFeatures = selectedComponents.filter(
    (id) => id !== primaryFeature && FEATURE_LABELS[id]
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.exitBtn}>
        <Ionicons name="close" size={20} color="#e3e2e3" />
        <Text style={styles.exitText}>Exit Preview</Text>
      </TouchableOpacity>

      <View style={styles.previewBanner}>
        <Text style={styles.previewLabel}>PREVIEW MODE</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.appHeader}>
          <View style={[styles.avatar, { backgroundColor: accent + '33' }]}>
            <Ionicons
              name={catalogEntry?.icon || 'medkit-outline'}
              size={28}
              color={accent}
            />
          </View>
          <Text style={styles.appTitle}>{appName ? `${appName} App` : 'My Practice App'}</Text>
          <Text style={styles.appSub}>Welcome, Patient</Text>
        </View>

        {primaryFeature && (
          <TouchableOpacity
            style={[styles.mainAction, { backgroundColor: accent }]}
            onPress={() => navigation.navigate('ClinicianDashboard', { specialty })}
            activeOpacity={0.85}
          >
            <Text style={styles.mainActionText}>
              {FEATURE_LABELS[primaryFeature]?.label}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#121415" />
          </TouchableOpacity>
        )}

        {secondaryFeatures.length > 0 && (
          <View style={styles.grid}>
            {secondaryFeatures.map((id) => {
              const feat = FEATURE_LABELS[id];
              if (!feat) return null;
              const isCalc = feat.isCalc || CALCULATOR_IDS.has(id);
              return (
                <TouchableOpacity
                  key={id}
                  style={[styles.gridItem, isCalc && { borderColor: accent + '44' }]}
                  onPress={isCalc ? () => navigation.navigate('CalculatorScreen', { calculatorId: id, specialty }) : undefined}
                  activeOpacity={isCalc ? 0.8 : 1}
                >
                  <Ionicons name={feat.icon} size={28} color={accent} />
                  <Text style={styles.gridText}>{feat.label}</Text>
                  {isCalc && (
                    <View style={[styles.calcBadge, { backgroundColor: accent + '22' }]}>
                      <Text style={[styles.calcBadgeText, { color: accent }]}>Hesapla</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {selectedComponents.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="apps-outline" size={40} color="#343536" />
            <Text style={styles.emptyText}>No features selected.</Text>
            <Text style={styles.emptyHint}>Go back and include some features.</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.allCalcsBtn, { borderColor: accent + '44' }]}
          onPress={() => navigation.navigate('CalculatorBrowser', { specialty })}
          activeOpacity={0.8}
        >
          <Ionicons name="calculator-outline" size={18} color={accent} />
          <Text style={[styles.allCalcsText, { color: accent }]}>Tüm Hesaplamalar</Text>
          <Ionicons name="chevron-forward" size={16} color={accent} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0e10', padding: 24, paddingTop: 56 },

  exitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#1e2021',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
    gap: 6,
  },
  exitText: { color: '#e3e2e3', fontWeight: 'bold', fontSize: 13 },

  previewBanner: {
    backgroundColor: '#4b3111',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'center',
    marginBottom: 24,
  },
  previewLabel: { color: '#e8bf94', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },

  appHeader: { alignItems: 'center', marginBottom: 32 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  appTitle: { fontSize: 22, fontWeight: 'bold', color: '#e3e2e3', marginBottom: 4 },
  appSub: { fontSize: 14, color: '#6B6B6B' },

  mainAction: {
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mainActionText: { color: '#121415', fontSize: 17, fontWeight: 'bold' },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1e2021',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#292a2b',
    gap: 10,
  },
  gridText: { color: '#e3e2e3', fontWeight: '600', fontSize: 13, textAlign: 'center' },
  calcBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginTop: 2 },
  calcBadgeText: { fontSize: 10, fontWeight: 'bold' },

  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 10 },
  emptyText: { color: '#6B6B6B', fontWeight: '600' },
  emptyHint: { color: '#343536', fontSize: 13 },

  allCalcsBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginTop: 20, marginBottom: 32,
    paddingVertical: 14, borderRadius: 14,
    borderWidth: 1, backgroundColor: '#1e2021',
  },
  allCalcsText: { fontSize: 14, fontWeight: '600' },
});
