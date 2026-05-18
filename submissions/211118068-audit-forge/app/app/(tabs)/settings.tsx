import { View, Text, StyleSheet } from 'react-native';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ayarlar</Text>
      <View style={styles.section}>
        <SettingRow label="Uygulama" value="nokta-audit-forge v1.0.0" />
        <SettingRow label="Track" value="Track A — Sadelik" />
        <SettingRow label="Öğrenci No" value="211118068" />
        <SettingRow label="Audit Widget" value="@xtatistix/mobile-audit@0.1.0" />
      </View>
    </View>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 20 },
  title: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 24 },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  rowLabel: { fontSize: 15, color: '#374151' },
  rowValue: { fontSize: 14, color: '#6B7280', maxWidth: '55%', textAlign: 'right' },
});
