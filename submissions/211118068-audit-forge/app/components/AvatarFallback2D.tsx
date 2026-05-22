import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  mouthOpen: number;
  hint?: string;
};

export function AvatarFallback2D({ mouthOpen, hint }: Props) {
  const jawScale = useMemo(
    () => 1 + Math.min(0.4, mouthOpen * 0.5),
    [mouthOpen]
  );

  return (
    <View style={styles.wrap}>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      <View style={styles.face}>
        <View style={styles.eyes}>
          <View style={styles.eye} />
          <View style={styles.eye} />
        </View>
        <View style={[styles.mouth, { transform: [{ scaleY: jawScale }] }]} />
      </View>
      <Text style={styles.label}>Sen · lipsync</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B1220',
    padding: 16,
  },
  hint: {
    color: '#94A3B8',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 12,
  },
  face: {
    width: 150,
    height: 170,
    borderRadius: 75,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyes: { flexDirection: 'row', gap: 32, marginBottom: 20 },
  eye: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#F8FAFC',
  },
  mouth: {
    width: 52,
    height: 11,
    borderRadius: 8,
    backgroundColor: '#38BDF8',
  },
  label: { marginTop: 14, color: '#E2E8F0', fontWeight: '600' },
});
