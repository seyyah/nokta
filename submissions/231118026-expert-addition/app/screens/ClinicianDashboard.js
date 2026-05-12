import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CATALOG } from '../data/catalog';

const MOCK_SLOTS = [
  { time: '09:00', available: true },
  { time: '09:30', available: false },
  { time: '10:00', available: true },
  { time: '10:30', available: true },
  { time: '11:00', available: false },
  { time: '11:30', available: true },
  { time: '14:00', available: true },
  { time: '14:30', available: true },
];

const MOCK_UPCOMING = [
  { date: 'Mon, 12 May', time: '10:00', label: 'Check-up' },
  { date: 'Fri, 23 May', time: '14:30', label: 'Follow-up' },
];

export default function ClinicianDashboard({ navigation, route }) {
  const { specialty } = route.params || {};
  const catalogEntry = specialty ? CATALOG[specialty] : null;
  const accent = catalogEntry?.accentColor || '#abcbdf';

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [patientName, setPatientName] = useState('');
  const [booked, setBooked] = useState(false);

  const handleBook = () => {
    if (selectedSlot !== null && patientName.trim()) setBooked(true);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Ionicons name="arrow-back" size={22} color="#e3e2e3" />
        <Text style={styles.backText}>Back to App</Text>
      </TouchableOpacity>

      <View style={styles.previewBanner}>
        <Text style={styles.previewLabel}>PREVIEW MODE</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {booked ? (
          <View style={styles.successState}>
            <View style={[styles.successIcon, { backgroundColor: accent }]}>
              <Ionicons name="checkmark-sharp" size={32} color="#121415" />
            </View>
            <Text style={styles.successTitle}>Appointment Booked!</Text>
            <Text style={styles.successSub}>
              {patientName} · {MOCK_SLOTS[selectedSlot]?.time} today
            </Text>
            <TouchableOpacity
              style={[styles.resetBtn, { borderColor: accent }]}
              onPress={() => { setBooked(false); setSelectedSlot(null); setPatientName(''); }}
            >
              <Text style={[styles.resetText, { color: accent }]}>Book Another</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
            {MOCK_UPCOMING.map((appt, i) => (
              <View key={i} style={styles.upcomingRow}>
                <View style={[styles.upcomingDot, { backgroundColor: accent + '33' }]}>
                  <Ionicons name="calendar-outline" size={16} color={accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.upcomingLabel}>{appt.label}</Text>
                  <Text style={styles.upcomingMeta}>{appt.date} · {appt.time}</Text>
                </View>
                <View style={[styles.statusChip, { backgroundColor: accent + '22' }]}>
                  <Text style={[styles.statusChipText, { color: accent }]}>Confirmed</Text>
                </View>
              </View>
            ))}

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Book New Appointment</Text>

            <Text style={styles.fieldLabel}>Patient Name</Text>
            <TextInput
              style={styles.input}
              value={patientName}
              onChangeText={setPatientName}
              placeholder="Enter patient name"
              placeholderTextColor="#6B6B6B"
              returnKeyType="done"
            />

            <Text style={styles.fieldLabel}>Select Time — Today</Text>
            <View style={styles.slotsGrid}>
              {MOCK_SLOTS.map((slot, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.slot,
                    !slot.available && styles.slotUnavailable,
                    selectedSlot === i && { backgroundColor: accent, borderColor: accent },
                  ]}
                  onPress={() => slot.available && setSelectedSlot(i)}
                  disabled={!slot.available}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.slotText,
                    !slot.available && styles.slotTextUnavailable,
                    selectedSlot === i && { color: '#121415' },
                  ]}>
                    {slot.time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.bookBtn,
                { backgroundColor: accent },
                (selectedSlot === null || !patientName.trim()) && styles.bookBtnDisabled,
              ]}
              onPress={handleBook}
              activeOpacity={0.85}
            >
              <Text style={styles.bookBtnText}>Confirm Appointment</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0e10', padding: 24, paddingTop: 56 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  backText: { color: '#e3e2e3', fontSize: 15, fontWeight: '600' },

  previewBanner: {
    backgroundColor: '#4b3111',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'center',
    marginBottom: 24,
  },
  previewLabel: { color: '#e8bf94', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },

  sectionTitle: {
    fontSize: 13, color: '#6B6B6B', fontWeight: 'bold',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12,
  },

  upcomingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#1e2021', borderRadius: 14, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: '#292a2b',
  },
  upcomingDot: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  upcomingLabel: { fontSize: 14, fontWeight: '600', color: '#e3e2e3', marginBottom: 2 },
  upcomingMeta: { fontSize: 12, color: '#6B6B6B' },
  statusChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusChipText: { fontSize: 11, fontWeight: 'bold' },

  fieldLabel: {
    fontSize: 12, color: '#c2c7cc', fontWeight: 'bold',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 16,
  },
  input: {
    backgroundColor: '#1e2021', color: '#e3e2e3', padding: 14,
    borderRadius: 12, fontSize: 15, borderWidth: 1, borderColor: '#292a2b',
  },

  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  slot: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10,
    backgroundColor: '#1e2021', borderWidth: 1, borderColor: '#292a2b',
    minWidth: '22%', alignItems: 'center',
  },
  slotUnavailable: { opacity: 0.3 },
  slotText: { fontSize: 13, fontWeight: '600', color: '#e3e2e3' },
  slotTextUnavailable: { color: '#6B6B6B' },

  bookBtn: { padding: 16, borderRadius: 14, alignItems: 'center', marginBottom: 40 },
  bookBtnDisabled: { opacity: 0.5 },
  bookBtnText: { color: '#121415', fontSize: 16, fontWeight: 'bold' },

  successState: { alignItems: 'center', paddingVertical: 48, gap: 14 },
  successIcon: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center' },
  successTitle: { fontSize: 22, fontWeight: 'bold', color: '#e3e2e3' },
  successSub: { fontSize: 14, color: '#6B6B6B' },
  resetBtn: { marginTop: 8, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  resetText: { fontWeight: '600', fontSize: 14 },
});
