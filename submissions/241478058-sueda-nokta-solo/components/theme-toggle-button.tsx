import { Pressable, StyleSheet, Text } from 'react-native';

import { useAppTheme } from '@/lib/theme-context';

export function ThemeToggleButton() {
  const { mode, toggleTheme } = useAppTheme();
  const isDark = mode === 'dark';

  return (
    <Pressable
      onPress={toggleTheme}
      style={({ pressed }) => [
        styles.button,
        isDark ? styles.buttonDark : styles.buttonLight,
        pressed && styles.buttonPressed,
      ]}>
      <Text style={styles.icon}>{isDark ? '☀️' : '🌙'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  buttonLight: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderColor: 'rgba(129,143,175,0.45)',
  },
  buttonDark: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(129,143,175,0.35)',
  },
  buttonPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.85,
  },
  icon: {
    fontSize: 18,
  },
});
