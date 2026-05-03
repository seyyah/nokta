import { useState } from 'react';
import { LayoutAnimation, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAppTheme } from '@/lib/theme-context';
import type { PropsWithChildren } from 'react';

type SectionAccordionProps = PropsWithChildren<{
  title: string;
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
}>;

export function SectionAccordion({ title, iconName, children }: SectionAccordionProps) {
  const [expanded, setExpanded] = useState(false);
  const { theme } = useAppTheme();

  const toggleAccordion = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
      <Pressable style={styles.headerRow} onPress={toggleAccordion}>
        <View style={styles.leftContent}>
          <MaterialCommunityIcons name={iconName} size={22} color={theme.textPrimary} />
          <Text style={[styles.titleText, { color: theme.textPrimary }]}>{title}</Text>
        </View>
        <MaterialCommunityIcons name={expanded ? 'chevron-up' : 'chevron-down'} size={24} color={theme.textSecondary} />
      </Pressable>
      
      {expanded && (
        <View style={styles.bodyContent}>
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '800',
  },
  bodyContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 4,
  },
});
