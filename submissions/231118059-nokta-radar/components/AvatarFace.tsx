/**
 * AvatarFace.tsx
 * SVG tabanlı 2D avatar yüz animasyonu.
 * react-three-fiber React Native'de Expo Go uyumlu değil,
 * bu yüzden react-native-svg ile lipsync animasyonu yapıyoruz.
 *
 * Viseme sistemi: 5 temel ağız pozisyonu
 *   IDLE, A, E, O, M (kapalı)
 *
 * Ses seviyesine göre ağız açılır/kapanır.
 * Konuşmada göz kırpma + baş hareketi eklenir.
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { Animated, Easing, View, StyleSheet } from 'react-native';
import Svg, {
  Ellipse,
  Circle,
  Path,
  Defs,
  RadialGradient,
  Stop,
  LinearGradient,
  G,
} from 'react-native-svg';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Viseme = 'IDLE' | 'A' | 'E' | 'O' | 'M';

interface Props {
  audioLevel: number;   // 0.0 – 1.0, RMS normalize
  isListening: boolean;
  style?: any;
}

export default function AvatarFace({ audioLevel, isListening, style }: Props) {
  const mouthOpen = useRef(new Animated.Value(0)).current;
  const headBobY  = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0.3)).current;
  const blinkInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const eyeOpenL = useRef(new Animated.Value(1)).current;
  const eyeOpenR = useRef(new Animated.Value(1)).current;
  const [eyeRyL, setEyeRyL] = React.useState(8);
  const [eyeRyR, setEyeRyR] = React.useState(8);
  const headBobAnim = useRef<Animated.CompositeAnimation | null>(null);

  // Göz kırpma listener — animated value → state → SVG
  useEffect(() => {
    const idL = eyeOpenL.addListener(({ value }) => setEyeRyL(Math.max(0.4, value * 8)));
    const idR = eyeOpenR.addListener(({ value }) => setEyeRyR(Math.max(0.4, value * 8)));
    return () => {
      eyeOpenL.removeListener(idL);
      eyeOpenR.removeListener(idR);
    };
  }, [eyeOpenL, eyeOpenR]);

  // Göz kırpma
  const blink = useCallback(() => {
    Animated.sequence([
      Animated.timing(eyeOpenL, { toValue: 0.05, duration: 60, useNativeDriver: false }),
      Animated.timing(eyeOpenL, { toValue: 1,    duration: 80, useNativeDriver: false }),
    ]).start();
    Animated.sequence([
      Animated.timing(eyeOpenR, { toValue: 0.05, duration: 60, useNativeDriver: false }),
      Animated.timing(eyeOpenR, { toValue: 1,    duration: 80, useNativeDriver: false }),
    ]).start();
  }, [eyeOpenL, eyeOpenR]);

  // Konuşma animasyonları başlat
  useEffect(() => {
    if (isListening) {
      // Baş hareketi
      headBobAnim.current = Animated.loop(
        Animated.sequence([
          Animated.timing(headBobY, {
            toValue: -3,
            duration: 400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(headBobY, {
            toValue: 3,
            duration: 400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
      headBobAnim.current.start();

      // Glow efekti güçlen
      Animated.timing(glowOpacity, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Daha sık kırpma
      blinkInterval.current = setInterval(blink, 1500 + Math.random() * 1000);
    } else {
      headBobAnim.current?.stop();
      Animated.spring(headBobY, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
      Animated.timing(glowOpacity, {
        toValue: 0.3,
        duration: 500,
        useNativeDriver: true,
      }).start();
      blinkInterval.current = setInterval(blink, 3000 + Math.random() * 2000);
    }

    return () => {
      if (blinkInterval.current) clearInterval(blinkInterval.current);
      headBobAnim.current?.stop();
    };
  }, [isListening, blink, headBobY, glowOpacity]);

  // İlk blink setup
  useEffect(() => {
    blinkInterval.current = setInterval(blink, 3000 + Math.random() * 2000);
    return () => {
      if (blinkInterval.current) clearInterval(blinkInterval.current);
    };
  }, [blink]);

  // Ses seviyesi → ağız
  useEffect(() => {
    const targetOpen = Math.min(1, audioLevel * 1.5);
    Animated.timing(mouthOpen, {
      toValue: targetOpen,
      duration: 80,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [audioLevel, mouthOpen]);

  // Interpolate ağız açıklığı → path (SVG path animasyonu yoktur,
  // bunun yerine ağız Ellipse'in yüksekliğini animate edeceğiz)
  const mouthHeight = mouthOpen.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 12],
  });

  const mouthY = mouthOpen.interpolate({
    inputRange: [0, 1],
    outputRange: [93, 89],
  });

  return (
    <View style={[styles.wrapper, style]}>
      <Animated.View
        style={[
          styles.avatarContainer,
          { transform: [{ translateY: headBobY }] },
        ]}
      >
        {/* Glow hale */}
        <Animated.View
          style={[
            styles.glow,
            { opacity: glowOpacity },
          ]}
        />

        <Svg
          width={160}
          height={200}
          viewBox="0 0 160 200"
        >
          <Defs>
            {/* Yüz gradyanı */}
            <RadialGradient id="faceGrad" cx="50%" cy="40%" r="55%">
              <Stop offset="0%"   stopColor="#2a2a3a" />
              <Stop offset="100%" stopColor="#0d0d18" />
            </RadialGradient>
            {/* Göz parlaklığı */}
            <RadialGradient id="eyeGrad" cx="35%" cy="30%" r="60%">
              <Stop offset="0%"   stopColor="#00E5FF" />
              <Stop offset="100%" stopColor="#0066AA" />
            </RadialGradient>
            {/* Saç gradyanı */}
            <LinearGradient id="hairGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%"   stopColor="#1a1a2e" />
              <Stop offset="100%" stopColor="#0d0d18" />
            </LinearGradient>
          </Defs>

          {/* Boyun */}
          <Ellipse cx={80} cy={178} rx={18} ry={12} fill="#1a1a2a" />
          <Ellipse cx={80} cy={182} rx={22} ry={8}  fill="#141420" />

          {/* Yüz ana gövde */}
          <Ellipse cx={80} cy={95} rx={52} ry={62} fill="url(#faceGrad)" />

          {/* Saç */}
          <Path
            d="M 28 75 Q 30 20 80 18 Q 130 20 132 75 Q 125 30 80 28 Q 35 30 28 75 Z"
            fill="url(#hairGrad)"
          />
          {/* Saç detay */}
          <Path
            d="M 34 60 Q 40 25 80 22 Q 55 30 48 55 Z"
            fill="#0d0d18"
            opacity={0.6}
          />
          <Path
            d="M 126 60 Q 120 25 80 22 Q 105 30 112 55 Z"
            fill="#0d0d18"
            opacity={0.6}
          />

          {/* Kaşlar */}
          <Path
            d="M 48 68 Q 60 63 68 67"
            stroke="#334"
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d="M 92 67 Q 100 63 112 68"
            stroke="#334"
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
          />

          {/* Sol göz */}
          <G>
            <Ellipse cx={58} cy={80} rx={11} ry={eyeRyL} fill="#111122" />
            <Circle cx={58} cy={80} r={7}   fill="url(#eyeGrad)" opacity={eyeRyL > 2 ? 1 : 0} />
            <Circle cx={58} cy={80} r={4}   fill="#001830" opacity={eyeRyL > 2 ? 1 : 0} />
            <Circle cx={55} cy={77} r={1.5} fill="white" opacity={eyeRyL > 4 ? 0.9 : 0} />
          </G>

          {/* Sağ göz */}
          <G>
            <Ellipse cx={102} cy={80} rx={11} ry={eyeRyR} fill="#111122" />
            <Circle cx={102} cy={80} r={7}   fill="url(#eyeGrad)" opacity={eyeRyR > 2 ? 1 : 0} />
            <Circle cx={102} cy={80} r={4}   fill="#001830" opacity={eyeRyR > 2 ? 1 : 0} />
            <Circle cx={99}  cy={77} r={1.5} fill="white" opacity={eyeRyR > 4 ? 0.9 : 0} />
          </G>

          {/* Burun */}
          <Path
            d="M 75 100 Q 80 112 85 100"
            stroke="#334"
            strokeWidth={1.5}
            fill="none"
            strokeLinecap="round"
            opacity={0.6}
          />

          {/* Ağız — animated */}
          <AnimatedEllipseMouth
            cx={80}
            mouthHeight={mouthHeight}
            mouthY={mouthY}
            isListening={isListening}
          />

          {/* Kulaklar */}
          <Ellipse cx={28} cy={95} rx={7} ry={10} fill="#1e1e30" />
          <Ellipse cx={28} cy={95} rx={4} ry={7}  fill="#141424" />
          <Ellipse cx={132} cy={95} rx={7} ry={10} fill="#1e1e30" />
          <Ellipse cx={132} cy={95} rx={4} ry={7}  fill="#141424" />

          {/* Yüz parlaklık efekti */}
          <Ellipse
            cx={80}
            cy={65}
            rx={30}
            ry={20}
            fill="white"
            opacity={0.03}
          />
        </Svg>
      </Animated.View>

      {/* Holografik halkalar */}
      {isListening && (
        <>
          <Animated.View style={[styles.ring, styles.ring1, { opacity: glowOpacity }]} />
          <Animated.View style={[styles.ring, styles.ring2, { opacity: glowOpacity }]} />
        </>
      )}
    </View>
  );
}

/**
 * AnimatedEllipseMouth — Animated değerleri SVG'ye bağlar
 */
function AnimatedEllipseMouth({
  cx,
  mouthHeight,
  mouthY,
  isListening,
}: {
  cx: number;
  mouthHeight: Animated.AnimatedInterpolation<number>;
  mouthY: Animated.AnimatedInterpolation<number>;
  isListening: boolean;
}) {
  const [h, setH] = React.useState(1);
  const [y, setY] = React.useState(93);

  useEffect(() => {
    const idH = (mouthHeight as any).addListener(({ value }: { value: number }) => setH(value));
    const idY = (mouthY as any).addListener(({ value }: { value: number }) => setY(value));
    return () => {
      (mouthHeight as any).removeListener(idH);
      (mouthY as any).removeListener(idY);
    };
  }, [mouthHeight, mouthY]);

  return (
    <>
      {/* Ağız iç */}
      <Ellipse
        cx={cx}
        cy={y}
        rx={14}
        ry={Math.max(1, h)}
        fill={isListening ? '#1a0a0a' : '#1a1a2a'}
      />
      {/* Dudak çizgisi */}
      <Path
        d={`M ${cx - 14} ${y} Q ${cx} ${y - 3} ${cx + 14} ${y}`}
        stroke={isListening ? '#FF6B8A' : '#445'}
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
      />
      {/* Alt dudak */}
      <Path
        d={`M ${cx - 12} ${y + Math.max(1, h)} Q ${cx} ${y + Math.max(1, h) + 2} ${cx + 12} ${y + Math.max(1, h)}`}
        stroke={isListening ? '#FF4466' : '#334'}
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
        opacity={0.7}
      />
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 200,
    height: 240,
    borderRadius: 100,
    backgroundColor: '#00E5FF',
    opacity: 0.3,
    // Spread efekti için transform
    transform: [{ scaleX: 0.85 }, { scaleY: 0.75 }],
  },
  ring: {
    position: 'absolute',
    borderRadius: 200,
    borderWidth: 1,
    borderColor: '#00E5FF',
  },
  ring1: {
    width: 200,
    height: 200,
    opacity: 0.3,
  },
  ring2: {
    width: 250,
    height: 250,
    opacity: 0.15,
  },
});
