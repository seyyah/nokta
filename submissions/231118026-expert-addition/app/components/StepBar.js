import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const STEP_LABELS = ['Specialty', 'Style', 'Features'];

function StepDot({ num, step, accent }) {
  const active = num === step;
  const done = num < step;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (active) {
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.25, duration: 180, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
      ]).start();
    }
  }, [active]);

  const dotColor = active || done ? accent : '#292a2b';
  const borderColor = active || done ? accent : '#343536';
  const labelColor = active ? accent : '#343536';

  return (
    <View style={styles.stepCol}>
      <Animated.View
        style={[
          styles.dot,
          { backgroundColor: dotColor, borderColor },
          active && { transform: [{ scale }] },
        ]}
      >
        {done
          ? <Ionicons name="checkmark" size={10} color="#121415" />
          : <Text style={[styles.dotNum, { color: active ? '#121415' : '#6B6B6B' }]}>{num}</Text>
        }
      </Animated.View>
      <Text style={[styles.stepLabel, { color: labelColor }]}>{STEP_LABELS[num - 1]}</Text>
    </View>
  );
}

export default function StepBar({ step, accent = '#abcbdf' }) {
  return (
    <View style={styles.row}>
      {STEP_LABELS.map((_, i) => {
        const num = i + 1;
        const done = num < step;
        const lineColor = done ? accent + '55' : '#292a2b';
        return (
          <React.Fragment key={num}>
            <StepDot num={num} step={step} accent={accent} />
            {i < STEP_LABELS.length - 1 && (
              <View style={[styles.line, { backgroundColor: lineColor }]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  stepCol: {
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotNum: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  line: {
    flex: 1,
    height: 1.5,
    marginTop: 11,
    marginHorizontal: 4,
  },
});
