import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function CalendarPreview({ s, accent }) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.labelRow, { backgroundColor: accent + '18', borderColor: accent + '33' }]}>
        <Ionicons name="calendar-outline" size={13} color={accent} />
        <Text style={[styles.labelText, { color: accent }]} numberOfLines={1}>{s.nextLabel}</Text>
      </View>
      <View style={styles.slotRow}>
        {s.slots.map((slot) => {
          const active = slot === s.confirmed;
          return (
            <View key={slot} style={[styles.slotChip, active && { backgroundColor: accent, borderColor: accent }]}>
              <Text style={[styles.slotText, active && { color: '#121415', fontWeight: 'bold' }]}>{slot}</Text>
            </View>
          );
        })}
      </View>
      <View style={[styles.confirmRow, { backgroundColor: accent + '22' }]}>
        <Ionicons name="checkmark-circle" size={13} color={accent} />
        <Text style={[styles.confirmText, { color: accent }]}>{s.confirmed} confirmed</Text>
      </View>
    </View>
  );
}

function ReminderPreview({ s, accent }) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.notifCard, { borderColor: accent + '33' }]}>
        <View style={[styles.notifIcon, { backgroundColor: accent + '22' }]}>
          <Ionicons name="notifications" size={16} color={accent} />
        </View>
        <View style={styles.notifBody}>
          <Text style={styles.notifTag}>{s.tag}</Text>
          <Text style={[styles.notifMsg, { color: '#e3e2e3' }]} numberOfLines={2}>{s.message}</Text>
        </View>
      </View>
      <View style={styles.timingRow}>
        <Ionicons name="time-outline" size={12} color="#6B6B6B" />
        <Text style={styles.timingText}>{s.timing}</Text>
      </View>
    </View>
  );
}

function ChatPreview({ s, accent }) {
  return (
    <View style={styles.wrap}>
      {s.messages.map((m, i) => {
        const isClinic = m.from === 'clinic';
        return (
          <View key={i} style={[styles.bubbleWrap, isClinic && styles.bubbleWrapRight]}>
            <View style={[
              styles.bubble,
              isClinic ? { backgroundColor: accent, alignSelf: 'flex-end' } : styles.bubblePatient
            ]}>
              <Text style={[styles.bubbleText, isClinic && { color: '#121415' }]} numberOfLines={2}>
                {m.text}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function ChecklistPreview({ s, accent }) {
  return (
    <View style={styles.wrap}>
      <Text style={[styles.checkTitle, { color: accent }]}>{s.title}</Text>
      {s.items.map((item, i) => (
        <View key={i} style={styles.checkRow}>
          <View style={[styles.checkbox, { borderColor: accent + '66' }]} />
          <Text style={styles.checkText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function EducationPreview({ s, accent }) {
  return (
    <View style={styles.wrap}>
      <Text style={[styles.eduTitle, { color: accent }]}>{s.title}</Text>
      {s.bullets.map((b, i) => (
        <View key={i} style={styles.bulletRow}>
          <View style={[styles.bullet, { backgroundColor: accent }]} />
          <Text style={styles.bulletText}>{b}</Text>
        </View>
      ))}
    </View>
  );
}

function VitalsPreview({ s, accent }) {
  return (
    <View style={styles.vitalsGrid}>
      {s.readings.map((r, i) => (
        <View key={i} style={[styles.vitalCard, { borderColor: accent + '33' }]}>
          <Text style={styles.vitalLabel}>{r.label}</Text>
          <Text style={[styles.vitalValue, { color: r.ok ? accent : '#ffb4ab' }]}>{r.value}</Text>
          <Text style={styles.vitalUnit}>{r.unit}</Text>
        </View>
      ))}
    </View>
  );
}

function HandoffPreview({ s, accent }) {
  const rows = [
    { key: 'S', value: s.situation },
    { key: 'A', value: s.assessment },
    { key: 'R', value: s.recommendation },
  ];
  return (
    <View style={styles.wrap}>
      <View style={[styles.patientRow, { backgroundColor: accent + '18', borderColor: accent + '33' }]}>
        <Ionicons name="person-outline" size={13} color={accent} />
        <Text style={[styles.patientText, { color: accent }]}>{s.patient}</Text>
      </View>
      {rows.map((row) => (
        <View key={row.key} style={styles.sbarRow}>
          <Text style={[styles.sbarKey, { color: accent }]}>{row.key}</Text>
          <Text style={styles.sbarValue} numberOfLines={1}>{row.value}</Text>
        </View>
      ))}
    </View>
  );
}

function MedicationPreview({ s, accent }) {
  return (
    <View style={styles.wrap}>
      {s.meds.map((med, i) => (
        <View key={i} style={[styles.medRow, { borderBottomColor: '#292a2b' }]}>
          <View style={[styles.medDot, { backgroundColor: accent + '33' }]}>
            <Ionicons name="medical" size={10} color={accent} />
          </View>
          <View style={styles.medInfo}>
            <Text style={styles.medName}>{med.name}</Text>
            <Text style={styles.medTime}>{med.time}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function VideoPreview({ s, accent }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.videoFrame}>
        <Ionicons name="videocam" size={28} color="#343536" />
      </View>
      <Text style={[styles.videoLabel, { color: '#e3e2e3' }]}>{s.label}</Text>
      <Text style={styles.videoTime}>{s.time}</Text>
      <View style={[styles.joinBtn, { backgroundColor: accent }]}>
        <Text style={styles.joinText}>{s.status}</Text>
      </View>
    </View>
  );
}

function TreatmentPreview({ s, accent }) {
  return (
    <View style={styles.wrap}>
      {s.procedures.map((proc, i) => (
        <View key={i} style={styles.treatRow}>
          <Text style={styles.treatProc}>{proc}</Text>
          <Text style={[styles.treatPrice, { color: accent }]}>{s.prices[i]}</Text>
        </View>
      ))}
      <View style={styles.treatDivider} />
      <View style={styles.treatRow}>
        <Text style={[styles.treatProc, { color: '#e3e2e3', fontWeight: 'bold' }]}>Total</Text>
        <Text style={[styles.treatPrice, { color: accent, fontWeight: 'bold' }]}>{s.total}</Text>
      </View>
      <Text style={styles.treatDate}>{s.date}</Text>
    </View>
  );
}

function XrayPreview({ s, accent }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.xrayBox}>
        <Ionicons name="scan-outline" size={32} color="#343536" />
      </View>
      <Text style={styles.xrayLabel}>{s.label}</Text>
      <Text style={[styles.xrayNote, { color: accent }]} numberOfLines={2}>{s.note}</Text>
    </View>
  );
}

function CalculatorPreview({ s, accent }) {
  return (
    <View style={styles.wrap}>
      <Text style={[styles.calcTitle, { color: accent }]}>{s.title}</Text>
      <View style={styles.calcInputs}>
        {s.inputs.map((input, i) => (
          <View key={i} style={[styles.calcChip, { borderColor: accent + '33' }]}>
            <Text style={styles.calcChipText}>{input}</Text>
          </View>
        ))}
      </View>
      <View style={[styles.calcResult, { backgroundColor: accent + '18', borderColor: accent + '33' }]}>
        <Ionicons name="checkmark-circle-outline" size={13} color={accent} />
        <Text style={[styles.calcResultText, { color: accent }]} numberOfLines={1}>{s.result}</Text>
      </View>
    </View>
  );
}

function PhotoConsultPreview({ s, accent }) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.photoChip, { backgroundColor: accent + '22', borderColor: accent + '44' }]}>
        <Ionicons name="camera-outline" size={14} color={accent} />
        <Text style={[styles.photoChipText, { color: accent }]}>{s.photoCount} photos sent</Text>
      </View>
      <Text style={styles.symptomText} numberOfLines={2}>{s.symptom}</Text>
      <View style={styles.consultDivider} />
      <View style={styles.consultStatusRow}>
        <Ionicons name="time-outline" size={12} color="#6B6B6B" />
        <Text style={styles.consultStatus}>{s.sentTime} · {s.status}</Text>
      </View>
    </View>
  );
}

function GamificationPreview({ s, accent }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.streakRow}>
        <Ionicons name="flame" size={16} color={accent} />
        <Text style={[styles.streakLabel, { color: accent }]}>{s.streak}-day streak</Text>
        {s.todayDone && (
          <View style={[styles.todayBadge, { backgroundColor: accent + '22', borderColor: accent + '44' }]}>
            <Ionicons name="checkmark" size={11} color={accent} />
            <Text style={[styles.todayText, { color: accent }]}>Today done</Text>
          </View>
        )}
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFilled, { width: `${(s.streak / 14) * 100}%`, backgroundColor: accent }]} />
      </View>
      <Text style={styles.gameBadge}>{s.badge}</Text>
      <Text style={styles.gameGoal}>{s.nextGoal}</Text>
    </View>
  );
}

function OhatPreview({ s, accent }) {
  const scoreColor = (score) => {
    if (score === 0) return accent;
    if (score === 1) return '#e8bf94';
    return '#ffb4ab';
  };
  return (
    <View style={styles.wrap}>
      {s.categories.map((cat, i) => (
        <View key={i} style={styles.ohatRow}>
          <Text style={styles.ohatLabel}>{cat.label}</Text>
          <View style={styles.ohatDots}>
            {[0, 1, 2].map((n) => (
              <View
                key={n}
                style={[
                  styles.ohatDot,
                  cat.score === n
                    ? { backgroundColor: scoreColor(n), borderColor: scoreColor(n) }
                    : { backgroundColor: 'transparent', borderColor: '#343536' },
                ]}
              />
            ))}
          </View>
          <Text style={[styles.ohatScore, { color: scoreColor(cat.score) }]}>{cat.score}</Text>
        </View>
      ))}
      <View style={styles.ohatTotal}>
        <Text style={styles.ohatTotalLabel}>Total</Text>
        <Text style={[styles.ohatTotalValue, { color: accent }]}>{s.total}</Text>
      </View>
    </View>
  );
}

export default function ComponentPreview({ pattern, sampleContent: s, accent }) {
  if (!s) return null;
  switch (pattern) {
    case 'calendar':   return <CalendarPreview s={s} accent={accent} />;
    case 'reminder':   return <ReminderPreview s={s} accent={accent} />;
    case 'chat':       return <ChatPreview s={s} accent={accent} />;
    case 'checklist':  return <ChecklistPreview s={s} accent={accent} />;
    case 'education':  return <EducationPreview s={s} accent={accent} />;
    case 'vitals':     return <VitalsPreview s={s} accent={accent} />;
    case 'handoff':    return <HandoffPreview s={s} accent={accent} />;
    case 'medication': return <MedicationPreview s={s} accent={accent} />;
    case 'video':      return <VideoPreview s={s} accent={accent} />;
    case 'treatment':  return <TreatmentPreview s={s} accent={accent} />;
    case 'xray':         return <XrayPreview s={s} accent={accent} />;
    case 'calculator':    return <CalculatorPreview s={s} accent={accent} />;
    case 'photo-consult': return <PhotoConsultPreview s={s} accent={accent} />;
    case 'gamification': return <GamificationPreview s={s} accent={accent} />;
    case 'ohat':         return <OhatPreview s={s} accent={accent} />;
    default:             return null;
  }
}

const styles = StyleSheet.create({
  wrap: { width: '100%', gap: 8 },

  // calendar
  labelRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1,
  },
  labelText: { fontSize: 13, fontWeight: '600', flex: 1 },
  slotRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  slotChip: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
    backgroundColor: '#292a2b', borderWidth: 1, borderColor: '#343536',
  },
  slotText: { fontSize: 12, color: '#c2c7cc' },
  confirmRow: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 8, padding: 8 },
  confirmText: { fontSize: 12, fontWeight: '600' },

  // reminder
  notifCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: '#1a1c1d', borderRadius: 12, padding: 10, borderWidth: 1,
  },
  notifIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  notifBody: { flex: 1 },
  notifTag: { fontSize: 10, color: '#6B6B6B', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 },
  notifMsg: { fontSize: 13, lineHeight: 18 },
  timingRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  timingText: { fontSize: 11, color: '#6B6B6B' },

  // chat
  bubbleWrap: { alignItems: 'flex-start' },
  bubbleWrapRight: { alignItems: 'flex-end' },
  bubble: { maxWidth: '80%', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 7 },
  bubblePatient: { backgroundColor: '#292a2b' },
  bubbleText: { fontSize: 12, color: '#e3e2e3', lineHeight: 17 },

  // checklist
  checkTitle: { fontSize: 13, fontWeight: 'bold', marginBottom: 4 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: { width: 14, height: 14, borderRadius: 3, borderWidth: 1.5 },
  checkText: { fontSize: 12, color: '#c2c7cc', flex: 1 },

  // education
  eduTitle: { fontSize: 13, fontWeight: 'bold', marginBottom: 4 },
  bulletRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bullet: { width: 5, height: 5, borderRadius: 3 },
  bulletText: { fontSize: 12, color: '#c2c7cc', flex: 1 },

  // vitals
  vitalsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  vitalCard: {
    flex: 1, minWidth: '45%', backgroundColor: '#1a1c1d',
    borderRadius: 10, padding: 8, borderWidth: 1,
    alignItems: 'center',
  },
  vitalLabel: { fontSize: 10, color: '#6B6B6B', textTransform: 'uppercase', marginBottom: 2 },
  vitalValue: { fontSize: 16, fontWeight: 'bold' },
  vitalUnit: { fontSize: 9, color: '#6B6B6B', marginTop: 1 },

  // handoff
  patientRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, marginBottom: 4,
  },
  patientText: { fontSize: 12, fontWeight: 'bold' },
  sbarRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  sbarKey: { fontSize: 12, fontWeight: 'bold', width: 16 },
  sbarValue: { fontSize: 12, color: '#c2c7cc', flex: 1 },

  // medication
  medRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 6, borderBottomWidth: 1,
  },
  medDot: { width: 24, height: 24, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  medInfo: { flex: 1 },
  medName: { fontSize: 12, color: '#e3e2e3', fontWeight: '500' },
  medTime: { fontSize: 10, color: '#6B6B6B', marginTop: 1 },

  // video
  videoFrame: {
    height: 72, backgroundColor: '#1a1c1d', borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#292a2b',
  },
  videoLabel: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  videoTime: { fontSize: 11, color: '#6B6B6B', textAlign: 'center' },
  joinBtn: { borderRadius: 8, paddingVertical: 7, alignItems: 'center' },
  joinText: { fontSize: 12, fontWeight: 'bold', color: '#121415' },

  // treatment
  treatRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  treatProc: { fontSize: 12, color: '#c2c7cc' },
  treatPrice: { fontSize: 12, fontWeight: '600' },
  treatDivider: { height: 1, backgroundColor: '#292a2b', marginVertical: 4 },
  treatDate: { fontSize: 11, color: '#6B6B6B', marginTop: 4 },

  // calculator
  calcTitle: { fontSize: 13, fontWeight: 'bold', marginBottom: 8 },
  calcInputs: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 8 },
  calcChip: {
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
    backgroundColor: '#292a2b', borderWidth: 1,
  },
  calcChipText: { fontSize: 11, color: '#c2c7cc' },
  calcResult: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, borderWidth: 1,
  },
  calcResultText: { fontSize: 12, fontWeight: '600', flex: 1 },

  // photo-consult
  photoChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, alignSelf: 'flex-start',
  },
  photoChipText: { fontSize: 12, fontWeight: '600' },
  symptomText: { fontSize: 13, color: '#e3e2e3', lineHeight: 18 },
  consultDivider: { height: 1, backgroundColor: '#292a2b' },
  consultStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  consultStatus: { fontSize: 11, color: '#6B6B6B', flex: 1 },

  // gamification
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  streakLabel: { fontSize: 15, fontWeight: 'bold', flex: 1 },
  todayBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, borderWidth: 1,
  },
  todayText: { fontSize: 10, fontWeight: '600' },
  progressTrack: { height: 6, backgroundColor: '#292a2b', borderRadius: 3, overflow: 'hidden' },
  progressFilled: { height: 6, borderRadius: 3 },
  gameBadge: { fontSize: 12, color: '#c2c7cc', fontWeight: '500' },
  gameGoal: { fontSize: 11, color: '#6B6B6B' },

  // ohat
  ohatRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ohatLabel: { fontSize: 12, color: '#c2c7cc', width: 52 },
  ohatDots: { flexDirection: 'row', gap: 6, flex: 1 },
  ohatDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5 },
  ohatScore: { fontSize: 12, fontWeight: 'bold', width: 16, textAlign: 'right' },
  ohatTotal: {
    flexDirection: 'row', justifyContent: 'space-between',
    borderTopWidth: 1, borderTopColor: '#292a2b', paddingTop: 6, marginTop: 2,
  },
  ohatTotalLabel: { fontSize: 12, color: '#6B6B6B' },
  ohatTotalValue: { fontSize: 12, fontWeight: 'bold' },

  // xray
  xrayBox: {
    height: 72, backgroundColor: '#1a1c1d', borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#292a2b',
  },
  xrayLabel: { fontSize: 11, color: '#6B6B6B' },
  xrayNote: { fontSize: 12, fontWeight: '500', lineHeight: 17 },
});
