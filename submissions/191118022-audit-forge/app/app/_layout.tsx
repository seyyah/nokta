import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuditMount } from '../components/AuditMount';
import { palette } from '../lib/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: palette.canvas },
          headerShadowVisible: false,
          headerTintColor: palette.ink,
          contentStyle: { backgroundColor: palette.canvas },
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Forge Home' }} />
        <Stack.Screen name="backlog" options={{ title: 'Backlog' }} />
        <Stack.Screen name="insights" options={{ title: 'Insights' }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      </Stack>
      <AuditMount />
    </>
  );
}
