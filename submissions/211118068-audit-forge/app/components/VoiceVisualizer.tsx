import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

type Props = {
  levels: number[];
  isActive: boolean;
};

function VoiceVisualizerComponent({ levels, isActive }: Props) {
  return (
    <View style={[styles.wrap, isActive ? styles.wrapActive : styles.wrapIdle]}>
      {levels.map((level, index) => {
        const height = 6 + level * 72;
        const opacity = isActive ? 0.45 + level * 0.55 : 0.12 + level * 0.2;
        return (
          <View
            key={`bar-${index}`}
            style={[
              styles.bar,
              {
                height,
                opacity,
                backgroundColor: isActive ? '#38BDF8' : '#64748B',
              },
            ]}
          />
        );
      })}
    </View>
  );
}

export const VoiceVisualizer = memo(VoiceVisualizerComponent);

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
    height: 88,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#0F172A',
  },
  wrapActive: {
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  wrapIdle: {
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  bar: {
    width: 6,
    borderRadius: 3,
    minHeight: 4,
  },
});
