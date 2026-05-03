import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAppTheme } from '@/lib/theme-context';

export default function TabLayout() {
  const { theme } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.isDark ? '#9B86FF' : '#6A51F8',
        tabBarInactiveTintColor: theme.isDark ? '#7E8BA8' : '#7283A9',
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.isDark ? '#0A1022' : '#F6F8FF',
        },
        headerTintColor: theme.textPrimary,
        headerShadowVisible: false,
        headerRight: () => <ThemeToggleButton />,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: theme.tabBarBackground,
          borderTopColor: theme.tabBarBorder,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 72,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 22 : 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Nokta Analyzer',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="chart.bar.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="paperplane.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="vault"
        options={{
          title: 'Vault',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="archivebox.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
