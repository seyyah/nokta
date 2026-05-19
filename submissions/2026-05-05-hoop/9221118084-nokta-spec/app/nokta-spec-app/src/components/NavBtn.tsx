import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface NavBtnProps {
  onPress: () => void;
  children: React.ReactNode;
  size?: number;
}

export default function NavBtn({ onPress, children, size = 40 }: NavBtnProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.button, { width: size, height: size }]}
    >
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.pill,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
