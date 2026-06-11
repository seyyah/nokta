import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

export type VoicePersona = 'junior' | 'senior';

interface VoiceVisualizerProps {
  rms: number;
  persona: VoicePersona;
  isActive: boolean;
  /** Bar count for native (default: 5) */
  barCount?: number;
}

// ─── Color maps per persona ────────────────────────────────────────────────────
const JUNIOR_COLORS = ['#ec4899', '#d946ef', '#a855f7', '#8b5cf6', '#6366f1', '#22d3ee', '#06b6d4'];
const SENIOR_COLORS = ['#f59e0b', '#d97706', '#fba924', '#fef08a', '#f97316', '#fb923c', '#fbbf24'];

// ─── Web Canvas Visualizer (Siri waves) ───────────────────────────────────────
function WebCanvasVisualizer({ rms, persona, isActive }: Omit<VoiceVisualizerProps, 'barCount'>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const offsetRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const waveCount = persona === 'junior' ? 4 : 3;
    const colors = persona === 'junior'
      ? ['hsla(180,90%,60%,', 'hsla(220,90%,65%,', 'hsla(280,85%,65%,', 'hsla(320,90%,60%,']
      : ['hsla(38,95%,55%,', 'hsla(28,90%,50%,', 'hsla(48,90%,60%,'];

    let running = true;

    const draw = () => {
      if (!running) return;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const speed = persona === 'junior'
        ? (isActive ? 0.025 : 0.005)
        : (isActive ? 0.014 : 0.003);
      offsetRef.current += speed;

      const amp = isActive ? Math.max(rms * 36 + 6, 4) : 2;

      for (let i = 0; i < waveCount; i++) {
        const factor = (i + 1) / waveCount;
        const alpha = isActive ? (0.75 - i * 0.12) : 0.18;
        ctx.beginPath();
        ctx.strokeStyle = colors[i] + alpha + ')';
        ctx.lineWidth = isActive ? (2.8 - i * 0.5) : 1.0;

        // Add glow
        ctx.shadowBlur = isActive ? 8 + rms * 12 : 0;
        ctx.shadowColor = colors[i] + '0.6)';

        for (let x = 0; x <= w; x++) {
          const t = (x / w) * Math.PI * 2.8 + offsetRef.current + i * 1.6;
          const envelope = Math.sin((x / w) * Math.PI);
          const y = h / 2 + Math.sin(t) * amp * factor * envelope;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [persona, isActive, rms]);

  return (
    // @ts-ignore canvas is fine on web
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
      }}
    />
  );
}

// ─── Native Animated Bar Visualizer ───────────────────────────────────────────
interface BarProps {
  rms: number;
  persona: VoicePersona;
  isActive: boolean;
  index: number;
  total: number;
}

function AnimatedBar({ rms, persona, isActive, index, total }: BarProps) {
  const colors = persona === 'junior' ? JUNIOR_COLORS : SENIOR_COLORS;
  const scaleFactors = [0.45, 0.7, 1.0, 0.85, 0.55, 0.75, 0.5];
  const scale = scaleFactors[index % scaleFactors.length];

  const heightAnim = useSharedValue(6);
  const opacityAnim = useSharedValue(0.25);

  useEffect(() => {
    const minH = 5;
    const maxH = 64;
    const targetH = isActive ? minH + rms * (maxH - minH) * scale : minH;
    const targetOp = isActive ? 0.9 : 0.2;

    heightAnim.value = withTiming(targetH, {
      duration: 80,
      easing: Easing.out(Easing.quad),
    });
    opacityAnim.value = withTiming(targetOp, { duration: 120 });
  }, [rms, isActive, scale]);

  // Idle breathing pulse when not active
  useEffect(() => {
    if (!isActive) {
      heightAnim.value = withRepeat(
        withSequence(
          withTiming(6, { duration: 900 + index * 120 }),
          withTiming(10, { duration: 900 + index * 120 })
        ),
        -1,
        true
      );
    }
  }, [isActive, index]);

  const animStyle = useAnimatedStyle(() => ({
    height: heightAnim.value,
    opacity: opacityAnim.value,
  }));

  return (
    <Animated.View
      style={[
        styles.bar,
        {
          backgroundColor: colors[index % colors.length],
          marginHorizontal: 3,
          borderRadius: 3,
          width: Math.max(4, (200 / total) - 6),
        },
        animStyle,
      ]}
    />
  );
}

// ─── Exported Component ────────────────────────────────────────────────────────
export default function VoiceVisualizer({
  rms,
  persona,
  isActive,
  barCount = 7,
}: VoiceVisualizerProps) {
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <WebCanvasVisualizer rms={rms} persona={persona} isActive={isActive} />
      </View>
    );
  }

  return (
    <View style={styles.nativeContainer}>
      {Array.from({ length: barCount }).map((_, i) => (
        <AnimatedBar
          key={i}
          rms={rms}
          persona={persona}
          isActive={isActive}
          index={i}
          total={barCount}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    width: '100%',
    height: 90,
  },
  nativeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    paddingHorizontal: 8,
  },
  bar: {
    alignSelf: 'center',
  },
});
