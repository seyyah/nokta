import { Tabs } from 'expo-router';
import React from 'react';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#e53e3e',
        tabBarInactiveTintColor: colorScheme === 'dark' ? '#9BA1A6' : '#687076',
        headerShown: true,
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#151718' : '#fff',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          color: colorScheme === 'dark' ? '#fff' : '#11181C',
        },
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#151718' : '#fff',
          borderTopColor: colorScheme === 'dark' ? '#2c2e30' : '#e2e8f0',
          height: Platform.OS === 'ios' ? 88 : 60,
          paddingBottom: Platform.OS === 'ios' ? 30 : 8,
          paddingTop: 8,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Welcome',
          headerTitle: 'Nokta Onboarding',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'rocket' : 'rocket-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ideas"
        options={{
          title: 'Ideas',
          headerTitle: 'Spec & Idea Pool',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'list' : 'list-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="agent"
        options={{
          title: 'Forge Agent',
          headerTitle: 'Autonomous Forge Panel',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'hardware-chip' : 'hardware-chip-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
