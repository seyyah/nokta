import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import {
  getForgeStatus,
  recordCycleOutcome,
  resetForgeStatus,
} from '../../lib/forgeTracker';

export default function SettingsScreen() {
  const [consecutiveFails, setConsecutiveFails] = useState(0);
  const [isStuck, setIsStuck] = useState(false);

  const refresh = useCallback(async () => {
    const status = await getForgeStatus();
    setConsecutiveFails(status.consecutiveFails);
    setIsStuck(status.isStuck);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

  const simulateFail = async () => {
    const { consecutiveFails: f, isStuck: stuck } =
      await recordCycleOutcome('fail');
    setConsecutiveFails(f);
    setIsStuck(stuck);
    if (stuck) {
      Alert.alert(
        'STUCK',
        '2 ardışık FAIL — Uzmana Bağlan butonu aktif. Demo için forge cycle simülasyonu.'
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ayarlar</Text>
      <View style={styles.section}>
        <SettingRow label="Uygulama" value="nokta-audit-forge v2-final" />
        <SettingRow label="Track" value="Final — Voice + Lipsync" />
        <SettingRow label="Öğrenci No" value="211118068" />
        <SettingRow label="Forge ardışık FAIL" value={String(consecutiveFails)} />
        <SettingRow label="STUCK" value={isStuck ? 'EVET' : 'hayır'} />
      </View>

      <TouchableOpacity style={styles.warnBtn} onPress={() => void simulateFail()}>
        <Text style={styles.warnBtnText}>Forge: FAIL simüle et (STUCK test)</Text>
      </TouchableOpacity>

      {isStuck && (
        <TouchableOpacity
          style={styles.expertBtn}
          onPress={() => router.push('/expert-bridge' as never)}
        >
          <Text style={styles.expertBtnText}>Uzmana Bağlan</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.resetBtn}
        onPress={async () => {
          await resetForgeStatus();
          await refresh();
        }}
      >
        <Text style={styles.resetBtnText}>Forge sayacını sıfırla</Text>
      </TouchableOpacity>
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
    marginBottom: 16,
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
  warnBtn: {
    backgroundColor: '#F59E0B',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  warnBtnText: { color: '#FFF', fontWeight: '700' },
  expertBtn: {
    backgroundColor: '#DC2626',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  expertBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  resetBtn: { padding: 12, alignItems: 'center' },
  resetBtnText: { color: '#64748B' },
});
