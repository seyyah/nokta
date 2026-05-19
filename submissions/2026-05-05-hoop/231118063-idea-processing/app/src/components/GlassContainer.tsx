import React from 'react';
import { StyleSheet, View, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Theme } from '../theme';

interface GlassContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const GlassContainer: React.FC<GlassContainerProps> = ({ children, style }) => {
  return (
    <View style={[styles.container, style]}>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={20} tint="dark" style={styles.blur}>
          {children}
        </BlurView>
      ) : (
        <View style={styles.androidGlass}>
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: Theme.roundness.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  blur: {
    padding: Theme.spacing.md,
  },
  androidGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: Theme.spacing.md,
  },
});
