import { Pressable, Text, StyleSheet, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

interface Props {
  onPress: () => void;
  children: ReactNode;
  variant?: 'primary' | 'ghost' | 'danger';
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ onPress, children, variant = 'primary', disabled, style }: Props) {
  const styleObj = StyleSheet.flatten(style);
  const customBg = styleObj?.backgroundColor;
  
  const bg = customBg || (variant === 'primary' ? '#fff' : variant === 'danger' ? '#ef4444' : 'transparent');
  const fg = customBg ? '#000' : (variant === 'primary' ? '#0a0a0a' : '#fff');
  const border = variant === 'ghost' ? '#444' : 'transparent';
  
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: bg, borderColor: border, opacity: disabled ? 0.4 : pressed ? 0.8 : 1 },
        style,
      ]}
    >
      <Text style={[styles.txt, { color: fg }]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txt: { fontSize: 16, fontWeight: '600' },
});
