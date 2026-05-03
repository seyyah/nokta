import { LinearGradient } from 'expo-linear-gradient';
import type { PropsWithChildren } from 'react';
import { StyleSheet } from 'react-native';

import { useAppTheme } from '@/lib/theme-context';

export function GradientScreen({ children }: PropsWithChildren) {
  const { theme } = useAppTheme();

  return (
    <LinearGradient colors={theme.gradientColors} style={styles.root}>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
