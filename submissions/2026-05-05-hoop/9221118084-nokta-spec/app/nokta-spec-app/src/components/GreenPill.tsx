import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface GreenPillProps {
  label: string;
  small?: boolean;
}

export default function GreenPill({ label, small }: GreenPillProps) {
  return (
    <View style={[styles.container, { paddingVertical: small ? 3 : 4, paddingHorizontal: small ? 10 : 12 }]}>
      <Text style={[styles.text, { fontSize: small ? 10 : 11 }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.accent,
    borderRadius: 99,
    alignSelf: 'flex-start',
  },
  text: {
    color: '#fff',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    fontFamily: 'DMSans_700Bold',
  },
});
