import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';
import { colors } from '../theme/colors';

interface MascotProps {
  score: number;
  size?: number;
}

export default function Mascot({ score, size = 100 }: MascotProps) {
  // Score based states
  const isHappy = score >= 75;
  const isSad = score < 50;
  
  const mainColor = isHappy ? colors.success : isSad ? colors.accent : colors.primary;
  const eyeSize = isHappy ? 6 : isSad ? 3 : 5;
  const glowOpacity = isHappy ? 0.6 : isSad ? 0.2 : 0.4;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Outer Glow */}
        <Circle cx="50" cy="50" r="45" fill={mainColor} opacity={glowOpacity * 0.3} />
        
        {/* Main Body (Sphere) */}
        <Circle cx="50" cy="50" r="35" fill={colors.surfaceAlt} stroke={mainColor} strokeWidth="2" />
        
        {/* Eyes / Face Panel */}
        <G>
          <Ellipse cx="38" cy="45" rx={eyeSize} ry={eyeSize} fill={mainColor} />
          <Ellipse cx="62" cy="45" rx={eyeSize} ry={eyeSize} fill={mainColor} />
          
          {/* Mouth / Expression */}
          {isHappy ? (
            <Path
              d="M 40 60 Q 50 70 60 60"
              stroke={mainColor}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          ) : isSad ? (
            <Path
              d="M 42 65 Q 50 60 58 65"
              stroke={mainColor}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          ) : (
            <Path
              d="M 42 62 L 58 62"
              stroke={mainColor}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          )}
        </G>
        
        {/* Tech Details (Small Circles) */}
        <Circle cx="50" cy="25" r="2" fill={mainColor} opacity="0.5" />
        <Circle cx="30" cy="50" r="1.5" fill={mainColor} opacity="0.3" />
        <Circle cx="70" cy="50" r="1.5" fill={mainColor} opacity="0.3" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center' },
});
