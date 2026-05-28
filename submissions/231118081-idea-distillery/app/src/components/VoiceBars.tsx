import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { palette } from '../theme';

type VoiceBarsProps = {
  bands: number[];
  level: number;
};

const BAR_COUNT = 13;
const BAR_WEIGHTS = [0.34, 0.46, 0.62, 0.78, 0.94, 1, 0.9, 0.74, 0.58, 0.72, 0.84, 0.54, 0.4];

export function VoiceBars({ bands, level }: VoiceBarsProps) {
  const [phase, setPhase] = useState(0);
  const active = level > 0.035;
  const visualBands = useMemo(
    () =>
      Array.from({ length: BAR_COUNT }, (_, index) => {
        const band = bands[index] ?? level;
        const idleBreath = active ? 0 : 0.08 + Math.sin(phase + index * 0.7) * 0.025;
        return Math.max(idleBreath, Math.min(1, band));
      }),
    [active, bands, level, phase],
  );
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setPhase((value) => value + 0.18);
    }, 80);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <View style={styles.stage}>
      <View style={[styles.glow, { opacity: 0.08 + level * 0.24 }]} />
      <View style={styles.row}>
        {visualBands.map((band, index) => {
          const height = 28 + band * 118 * BAR_WEIGHTS[index];
          const hot = band > 0.56;
          return (
            <View
              key={`${index}-${BAR_WEIGHTS[index]}`}
              style={[
                styles.bar,
                {
                  backgroundColor: hot ? palette.blue : palette.blueSoft,
                  height,
                  opacity: 0.5 + Math.min(1, band + level) * 0.5,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderRadius: 999,
    width: 11,
  },
  glow: {
    backgroundColor: palette.blueSoft,
    borderRadius: 78,
    height: 156,
    position: 'absolute',
    width: 308,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
  },
  stage: {
    alignItems: 'center',
    height: 178,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
});
