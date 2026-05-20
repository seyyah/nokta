import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1A73E8',
        tabBarInactiveTintColor: '#5F6368',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Yeni Nokta',
          tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={24} name={focused ? 'bulb' : 'bulb-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Fikirlerim',
          tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={24} name={focused ? 'document-text' : 'document-text-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
