import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import CircularProgress from 'react-native-circular-progress-indicator';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  withDelay,
} from 'react-native-reanimated';

import { useAppTheme } from '@/lib/theme-context';

type CircularScoreProps = {
  score: number;
};

function getScoreColor(score: number) {
  if (score >= 66) return '#FE5E73';
  if (score >= 36) return '#FF9F46';
  return '#36D887';
}

function getScoreLabel(score: number) {
  if (score >= 66) return 'AŞIRI RİSKLİ / YÜKSEK SLOP';
  if (score >= 36) return 'RİSKLİ / ORTA SLOP';
  return 'SAĞLIKLI / DÜŞÜK SLOP';
}

export function CircularScore({ score }: CircularScoreProps) {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  const scoreColor = getScoreColor(clampedScore);
  const { theme } = useAppTheme();
  
  const [currentScore, setCurrentScore] = useState(0);

  // 3D Reanimated values
  const rotateX = useSharedValue(50);
  const rotateY = useSharedValue(-30);
  const scale = useSharedValue(0.4);
  const textScale = useSharedValue(0);

  useEffect(() => {
    // Number counter effect
    let start = 0;
    // Step dynamically based on max score to end exactly around 1.5s
    const step = Math.max(1, Math.floor(clampedScore / 30)); 
    const interval = setInterval(() => {
      start += step;
      if (start >= clampedScore) {
        clearInterval(interval);
        setCurrentScore(clampedScore);
      } else {
        setCurrentScore(start);
      }
    }, 1500 / Math.max(clampedScore, 1) * step);

    // Initial 3D pop-in container animation
    scale.value = withSpring(1, { damping: 12, stiffness: 90 });
    
    rotateX.value = withSequence(
      withSpring(0, { damping: 10, stiffness: 80 }),
      withRepeat(
        withSequence(
          withTiming(8, { duration: 2500 }),
          withTiming(-8, { duration: 2500 }),
          withTiming(0, { duration: 2500 })
        ),
        -1,
        false
      )
    );

    rotateY.value = withSequence(
      withSpring(0, { damping: 12, stiffness: 80 }),
      withRepeat(
        withSequence(
          withTiming(6, { duration: 3000 }),
          withTiming(-6, { duration: 3000 }),
          withTiming(0, { duration: 3000 })
        ),
        -1,
        false
      )
    );

    // Spring the text up after a small delay
    textScale.value = withDelay(400, withSpring(1, { damping: 10, stiffness: 120 }));

    return () => clearInterval(interval);
  }, [clampedScore]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { perspective: 800 },
        { rotateX: `${rotateX.value}deg` },
        { rotateY: `${rotateY.value}deg` },
        { scale: scale.value }
      ]
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: textScale.value }]
    };
  });

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[
        styles.glowWrapper,
        {
          shadowColor: scoreColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.9,
          shadowRadius: 25,
          elevation: 12,
        },
        animatedStyle
      ]}>
        
        {/* Inner intense glow layer */}
        <View style={[StyleSheet.absoluteFill, {
          shadowColor: scoreColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6,
          shadowRadius: 10,
        }]} />

        <CircularProgress
          value={clampedScore}
          initialValue={0}
          radius={110}
          duration={1500}
          progressValueColor="transparent"
          titleColor="transparent"
          showProgressValue={false}
          activeStrokeColor={scoreColor}
          inActiveStrokeColor={theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
          inActiveStrokeOpacity={0.8}
          inActiveStrokeWidth={16}
          activeStrokeWidth={20}
        />
        
        {/* Our custom scalable center contents */}
        <Animated.View style={[StyleSheet.absoluteFill, styles.centerTextWrapper, textAnimatedStyle]}>
          <Text style={[styles.scoreText, { color: theme.textPrimary }]}>{currentScore}</Text>
          <Text style={[styles.titleStyle, { color: theme.textSecondary }]}>SLOP SKORU</Text>
        </Animated.View>
        
      </Animated.View>
      <Text style={[styles.label, { color: scoreColor }]}>{getScoreLabel(clampedScore)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 10,
  },
  glowWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 110, // Match radius
    backgroundColor: 'transparent',
  },
  centerTextWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10, // Bring to top
  },
  scoreText: {
    fontWeight: '800',
    fontSize: 54,
  },
  titleStyle: {
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 2,
    marginTop: 4,
  },
  label: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
