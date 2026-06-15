/**
 * AvatarFace — Animated 2D SVG avatar face component
 * Core avatar with lipsync mouth, eye blinks, persona styles
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, {
  G,
  Ellipse,
  Circle,
  Path,
  Rect,
  Defs,
  LinearGradient,
  Stop,
  Line,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  cancelAnimation,
  interpolate,
} from 'react-native-reanimated';
import { colors, animation, personaThemes } from '../theme';
import { PersonaId } from '../types';

interface AvatarFaceProps {
  speakingIntensity: number; // 0-1
  persona: PersonaId;
  isActive: boolean;
  style?: ViewStyle;
}

// ─── Mouth Path Generators ───────────────────────────────

function getMouthPath(intensity: number, persona: PersonaId): string {
  // 5 shapes interpolated by intensity
  const cx = 100;
  const cy = persona === 'junior' ? 185 : 190;

  if (intensity < 0.05) {
    // Closed: thin line
    return `M ${cx - 15} ${cy} Q ${cx} ${cy + 3} ${cx + 15} ${cy}`;
  } else if (intensity < 0.25) {
    // Slightly open: small oval
    const openY = 2 + intensity * 16;
    return `M ${cx - 12} ${cy} Q ${cx - 8} ${cy - 2} ${cx} ${cy - 2} Q ${cx + 8} ${cy - 2} ${cx + 12} ${cy} Q ${cx + 8} ${cy + openY} ${cx} ${cy + openY} Q ${cx - 8} ${cy + openY} ${cx - 12} ${cy} Z`;
  } else if (intensity < 0.5) {
    // Half open: medium oval
    const openY = 4 + intensity * 18;
    const w = 14 + intensity * 4;
    return `M ${cx - w} ${cy} Q ${cx - w + 4} ${cy - 4} ${cx} ${cy - 4} Q ${cx + w - 4} ${cy - 4} ${cx + w} ${cy} Q ${cx + w - 4} ${cy + openY} ${cx} ${cy + openY + 2} Q ${cx - w + 4} ${cy + openY} ${cx - w} ${cy} Z`;
  } else if (intensity < 0.75) {
    // Open: larger oval
    const openY = 8 + intensity * 16;
    const w = 16 + intensity * 4;
    return `M ${cx - w} ${cy - 2} Q ${cx - w + 6} ${cy - 6} ${cx} ${cy - 6} Q ${cx + w - 6} ${cy - 6} ${cx + w} ${cy - 2} Q ${cx + w - 4} ${cy + openY} ${cx} ${cy + openY + 4} Q ${cx - w + 4} ${cy + openY} ${cx - w} ${cy - 2} Z`;
  } else {
    // Wide open: full open
    const openY = 14 + intensity * 12;
    const w = 18 + intensity * 4;
    return `M ${cx - w} ${cy - 3} Q ${cx - w + 8} ${cy - 8} ${cx} ${cy - 8} Q ${cx + w - 8} ${cy - 8} ${cx + w} ${cy - 3} Q ${cx + w - 4} ${cy + openY} ${cx} ${cy + openY + 6} Q ${cx - w + 4} ${cy + openY} ${cx - w} ${cy - 3} Z`;
  }
}

// ─── Avatar Face Component ───────────────────────────────

const AvatarFace: React.FC<AvatarFaceProps> = ({
  speakingIntensity,
  persona,
  isActive,
  style,
}) => {
  const theme = personaThemes[persona];

  // Animation states
  const [blinkProgress, setBlinkProgress] = useState(0); // 0 = open, 1 = closed
  const [mouthIntensity, setMouthIntensity] = useState(0);
  const [breathScale, setBreathScale] = useState(1);
  const [headTilt, setHeadTilt] = useState(0);

  const blinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const breathFrameRef = useRef<number | null>(null);
  const mouthFrameRef = useRef<number | null>(null);
  const breathTimeRef = useRef(0);
  const currentMouthRef = useRef(0);

  // Reanimated for container
  const containerScale = useSharedValue(1);
  const containerRotate = useSharedValue(0);

  // ─── Blink animation ──────────────────────────────
  useEffect(() => {
    if (!isActive) return;

    const scheduleBlink = () => {
      const delay = 3000 + Math.random() * 4000; // 3-7 seconds
      blinkTimerRef.current = setTimeout(() => {
        // Blink animation: close then open
        setBlinkProgress(1);
        setTimeout(() => setBlinkProgress(0.5), 60);
        setTimeout(() => setBlinkProgress(0), 140);
        scheduleBlink();
      }, delay);
    };

    scheduleBlink();
    return () => {
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
    };
  }, [isActive]);

  // ─── Breathing animation ──────────────────────────
  useEffect(() => {
    if (!isActive) return;

    const animateBreath = () => {
      breathTimeRef.current += 0.02;
      const scale = 1 + Math.sin(breathTimeRef.current) * 0.008;
      setBreathScale(scale);
      breathFrameRef.current = requestAnimationFrame(animateBreath);
    };

    breathFrameRef.current = requestAnimationFrame(animateBreath);
    return () => {
      if (breathFrameRef.current) cancelAnimationFrame(breathFrameRef.current);
    };
  }, [isActive]);

  // ─── Mouth smooth tracking ────────────────────────
  useEffect(() => {
    const LERP = 0.22;
    const animateMouth = () => {
      const diff = speakingIntensity - currentMouthRef.current;
      if (Math.abs(diff) > 0.005) {
        currentMouthRef.current += diff * LERP;
        setMouthIntensity(currentMouthRef.current);
      }
      mouthFrameRef.current = requestAnimationFrame(animateMouth);
    };

    mouthFrameRef.current = requestAnimationFrame(animateMouth);
    return () => {
      if (mouthFrameRef.current) cancelAnimationFrame(mouthFrameRef.current);
    };
  }, [speakingIntensity]);

  // ─── Head tilt when speaking ──────────────────────
  useEffect(() => {
    if (speakingIntensity > 0.1) {
      const tilt = (Math.random() - 0.5) * 4 * theme.animationIntensity;
      setHeadTilt(tilt);
    } else {
      setHeadTilt(0);
    }
  }, [Math.round(speakingIntensity * 5)]); // Quantize to avoid too many updates

  // Container animation
  useEffect(() => {
    containerScale.value = withSpring(isActive ? 1 : 0.9, animation.springGentle);
  }, [isActive]);

  const containerAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: containerScale.value }],
  }));

  // ─── Persona-specific dimensions ──────────────────
  const isJunior = persona === 'junior';

  const faceRx = isJunior ? 72 : 64;
  const faceRy = isJunior ? 85 : 92;
  const faceCx = 100;
  const faceCy = isJunior ? 140 : 145;

  const eyeY = isJunior ? 130 : 135;
  const eyeSize = isJunior ? 14 : 11;
  const irisSize = isJunior ? 8 : 6;
  const pupilSize = isJunior ? 4 : 3;
  const eyeSpacing = isJunior ? 28 : 25;

  const eyeScaleY = 1 - blinkProgress;

  // Eyebrow positions
  const browY = eyeY - eyeSize - 8;
  const browLen = isJunior ? 18 : 22;

  // Colors
  const skinBase = isJunior ? '#FFD7A8' : '#F0C8A0';
  const skinLight = isJunior ? '#FFE4C4' : '#F5D5B5';
  const hairColor = isJunior ? '#4A3728' : '#2C2C38';
  const eyeColor = isJunior ? '#2E86AB' : '#6B5B95';
  const lipColor = isJunior ? '#E88B8B' : '#C07070';
  const accentColor = theme.primaryColor;

  const mouthPath = getMouthPath(mouthIntensity, persona);

  return (
    <Animated.View style={[styles.container, containerAnimStyle, style]}>
      <View
        style={[
          styles.svgContainer,
          {
            transform: [
              { scale: breathScale },
              { rotate: `${headTilt}deg` },
            ],
          },
        ]}
      >
        <Svg viewBox="0 0 200 280" style={styles.svg}>
          <Defs>
            <LinearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={skinLight} />
              <Stop offset="100%" stopColor={skinBase} />
            </LinearGradient>
            <LinearGradient id="hairGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={hairColor} />
              <Stop offset="100%" stopColor={isJunior ? '#3A2718' : '#1C1C28'} />
            </LinearGradient>
          </Defs>

          {/* ─── Ears ──────────────────────────── */}
          <Ellipse
            cx={faceCx - faceRx + 5}
            cy={faceCy - 5}
            rx={10}
            ry={15}
            fill={skinBase}
            stroke={skinBase}
            strokeWidth={1}
          />
          <Ellipse
            cx={faceCx + faceRx - 5}
            cy={faceCy - 5}
            rx={10}
            ry={15}
            fill={skinBase}
            stroke={skinBase}
            strokeWidth={1}
          />

          {/* ─── Hair (back layer) ─────────────── */}
          {isJunior ? (
            // Junior: messy, voluminous hair
            <G>
              <Path
                d={`M ${faceCx - faceRx - 5} ${faceCy - 30}
                    Q ${faceCx - faceRx + 10} ${faceCy - faceRy - 35} ${faceCx - 20} ${faceCy - faceRy - 25}
                    Q ${faceCx - 5} ${faceCy - faceRy - 40} ${faceCx} ${faceCy - faceRy - 30}
                    Q ${faceCx + 5} ${faceCy - faceRy - 42} ${faceCx + 15} ${faceCy - faceRy - 28}
                    Q ${faceCx + 30} ${faceCy - faceRy - 20} ${faceCx + faceRx - 10} ${faceCy - faceRy - 15}
                    Q ${faceCx + faceRx + 8} ${faceCy - 30} ${faceCx + faceRx + 5} ${faceCy - 15}
                    L ${faceCx + faceRx} ${faceCy - 20}
                    Q ${faceCx + faceRx - 15} ${faceCy - faceRy + 5} ${faceCx} ${faceCy - faceRy + 8}
                    Q ${faceCx - faceRx + 15} ${faceCy - faceRy + 5} ${faceCx - faceRx} ${faceCy - 20}
                    L ${faceCx - faceRx - 5} ${faceCy - 30} Z`}
                fill="url(#hairGrad)"
              />
              {/* Messy strand accent */}
              <Path
                d={`M ${faceCx + 15} ${faceCy - faceRy - 28}
                    Q ${faceCx + 20} ${faceCy - faceRy - 45} ${faceCx + 10} ${faceCy - faceRy - 38}`}
                stroke={hairColor}
                strokeWidth={3}
                fill="none"
                strokeLinecap="round"
              />
            </G>
          ) : (
            // Senior: neat, styled hair
            <G>
              <Path
                d={`M ${faceCx - faceRx - 2} ${faceCy - 25}
                    Q ${faceCx - faceRx + 5} ${faceCy - faceRy - 20} ${faceCx - 15} ${faceCy - faceRy - 18}
                    Q ${faceCx} ${faceCy - faceRy - 22} ${faceCx + 15} ${faceCy - faceRy - 18}
                    Q ${faceCx + faceRx - 5} ${faceCy - faceRy - 15} ${faceCx + faceRx + 2} ${faceCy - 25}
                    L ${faceCx + faceRx} ${faceCy - 20}
                    Q ${faceCx + faceRx - 10} ${faceCy - faceRy + 8} ${faceCx} ${faceCy - faceRy + 10}
                    Q ${faceCx - faceRx + 10} ${faceCy - faceRy + 8} ${faceCx - faceRx} ${faceCy - 20}
                    L ${faceCx - faceRx - 2} ${faceCy - 25} Z`}
                fill="url(#hairGrad)"
              />
              {/* Side part */}
              <Path
                d={`M ${faceCx - 20} ${faceCy - faceRy - 18}
                    Q ${faceCx - 25} ${faceCy - faceRy + 5} ${faceCx - faceRx + 8} ${faceCy - 30}`}
                stroke={isJunior ? '#3A2718' : '#1C1C28'}
                strokeWidth={1.5}
                fill="none"
                strokeLinecap="round"
              />
            </G>
          )}

          {/* ─── Face ──────────────────────────── */}
          <Ellipse
            cx={faceCx}
            cy={faceCy}
            rx={faceRx}
            ry={faceRy}
            fill="url(#skinGrad)"
          />

          {/* ─── Nose ──────────────────────────── */}
          <Path
            d={`M ${faceCx - 3} ${faceCy + 5}
                Q ${faceCx} ${faceCy + 15} ${faceCx + 3} ${faceCy + 5}`}
            stroke={`rgba(0,0,0,0.15)`}
            strokeWidth={1.5}
            fill="none"
            strokeLinecap="round"
          />

          {/* ─── Eyebrows ──────────────────────── */}
          {/* Left brow */}
          <Path
            d={`M ${faceCx - eyeSpacing - browLen / 2} ${browY + (isJunior ? 2 : 0)}
                Q ${faceCx - eyeSpacing} ${browY - 4} ${faceCx - eyeSpacing + browLen / 2} ${browY + (isJunior ? 1 : 0)}`}
            stroke={hairColor}
            strokeWidth={isJunior ? 2.5 : 2}
            fill="none"
            strokeLinecap="round"
          />
          {/* Right brow */}
          <Path
            d={`M ${faceCx + eyeSpacing - browLen / 2} ${browY + (isJunior ? 1 : 0)}
                Q ${faceCx + eyeSpacing} ${browY - 4} ${faceCx + eyeSpacing + browLen / 2} ${browY + (isJunior ? 2 : 0)}`}
            stroke={hairColor}
            strokeWidth={isJunior ? 2.5 : 2}
            fill="none"
            strokeLinecap="round"
          />

          {/* ─── Eyes ──────────────────────────── */}
          {/* Left Eye */}
          <G transform={`translate(0, 0) scale(1, ${Math.max(0.05, eyeScaleY)})`}
             origin={`${faceCx - eyeSpacing}, ${eyeY}`}>
            <Ellipse
              cx={faceCx - eyeSpacing}
              cy={eyeY}
              rx={eyeSize}
              ry={eyeSize}
              fill="white"
            />
            <Circle
              cx={faceCx - eyeSpacing + 1}
              cy={eyeY}
              r={irisSize}
              fill={eyeColor}
            />
            <Circle
              cx={faceCx - eyeSpacing + 1}
              cy={eyeY}
              r={pupilSize}
              fill="#1A1A2E"
            />
            {/* Highlight */}
            <Circle
              cx={faceCx - eyeSpacing - 2}
              cy={eyeY - 3}
              r={2.5}
              fill="white"
              opacity={0.9}
            />
          </G>

          {/* Right Eye */}
          <G transform={`translate(0, 0) scale(1, ${Math.max(0.05, eyeScaleY)})`}
             origin={`${faceCx + eyeSpacing}, ${eyeY}`}>
            <Ellipse
              cx={faceCx + eyeSpacing}
              cy={eyeY}
              rx={eyeSize}
              ry={eyeSize}
              fill="white"
            />
            <Circle
              cx={faceCx + eyeSpacing + 1}
              cy={eyeY}
              r={irisSize}
              fill={eyeColor}
            />
            <Circle
              cx={faceCx + eyeSpacing + 1}
              cy={eyeY}
              r={pupilSize}
              fill="#1A1A2E"
            />
            {/* Highlight */}
            <Circle
              cx={faceCx + eyeSpacing - 2}
              cy={eyeY - 3}
              r={2.5}
              fill="white"
              opacity={0.9}
            />
          </G>

          {/* ─── Glasses (Senior only) ─────────── */}
          {!isJunior && (
            <G>
              {/* Left lens */}
              <Ellipse
                cx={faceCx - eyeSpacing}
                cy={eyeY}
                rx={eyeSize + 5}
                ry={eyeSize + 3}
                fill="none"
                stroke="#888899"
                strokeWidth={1.5}
                opacity={0.7}
              />
              {/* Right lens */}
              <Ellipse
                cx={faceCx + eyeSpacing}
                cy={eyeY}
                rx={eyeSize + 5}
                ry={eyeSize + 3}
                fill="none"
                stroke="#888899"
                strokeWidth={1.5}
                opacity={0.7}
              />
              {/* Bridge */}
              <Line
                x1={faceCx - eyeSpacing + eyeSize + 5}
                y1={eyeY}
                x2={faceCx + eyeSpacing - eyeSize - 5}
                y2={eyeY}
                stroke="#888899"
                strokeWidth={1.5}
                opacity={0.7}
              />
              {/* Left temple */}
              <Line
                x1={faceCx - eyeSpacing - eyeSize - 5}
                y1={eyeY}
                x2={faceCx - faceRx + 2}
                y2={eyeY + 5}
                stroke="#888899"
                strokeWidth={1.5}
                opacity={0.7}
              />
              {/* Right temple */}
              <Line
                x1={faceCx + eyeSpacing + eyeSize + 5}
                y1={eyeY}
                x2={faceCx + faceRx - 2}
                y2={eyeY + 5}
                stroke="#888899"
                strokeWidth={1.5}
                opacity={0.7}
              />
            </G>
          )}

          {/* ─── Mouth ─────────────────────────── */}
          <Path
            d={mouthPath}
            fill={mouthIntensity > 0.05 ? lipColor : 'none'}
            stroke={lipColor}
            strokeWidth={mouthIntensity > 0.05 ? 0.5 : 2}
            strokeLinecap="round"
          />
          {/* Teeth hint for wide open */}
          {mouthIntensity > 0.5 && (
            <Path
              d={`M ${faceCx - 10} ${(persona === 'junior' ? 185 : 190) - 1}
                  L ${faceCx + 10} ${(persona === 'junior' ? 185 : 190) - 1}`}
              stroke="white"
              strokeWidth={2}
              opacity={0.5}
              strokeLinecap="round"
            />
          )}

          {/* ─── Accent glow ring ──────────────── */}
          {isActive && speakingIntensity > 0.1 && (
            <Ellipse
              cx={faceCx}
              cy={faceCy}
              rx={faceRx + 8}
              ry={faceRy + 8}
              fill="none"
              stroke={accentColor}
              strokeWidth={1.5}
              opacity={0.2 + speakingIntensity * 0.3}
            />
          )}
        </Svg>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgContainer: {
    width: 220,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    width: '100%',
    height: '100%',
  },
});

export default AvatarFace;
