import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { getColors } from '../../theme/colors';

interface ButtonProps {
  text: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export function Button({
  text,
  onPress,
  loading = false,
  variant = 'primary',
  style,
  textStyle,
  disabled = false,
}: ButtonProps) {
  const { themeMode, accentColor } = useTheme();
  const colors = getColors(themeMode, accentColor);
  const btnScale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true }).start();
  const pressOut = () =>
    Animated.spring(btnScale, { toValue: 1, useNativeDriver: true }).start();

  const isPrimary = variant === 'primary';

  return (
    <Animated.View style={[{ transform: [{ scale: btnScale }] }, style]}>
      <TouchableOpacity
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={onPress}
        disabled={loading || disabled}
        activeOpacity={0.9}
        style={[
          styles.btn,
          isPrimary ? { backgroundColor: colors.primary } : { backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.bgCardBorder },
          isPrimary && styles.primaryShadow,
          style
        ]}
      >
        {loading ? (
          <ActivityIndicator color={isPrimary ? colors.white : colors.primary} size="small" />
        ) : (
          <Text style={[
            styles.btnText, 
            { color: isPrimary ? colors.white : colors.textPrimary }, 
            textStyle
          ]}>
            {text}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryShadow: {
    shadowColor: '#000',
    shadowRadius: 8,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
