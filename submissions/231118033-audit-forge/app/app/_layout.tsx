import React from 'react';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#1a1a2e' },
        headerTintColor: '#e2e8f0',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Nokta' }} />
      <Stack.Screen name="idea/[id]" options={{ title: 'Fikir' }} />
      <Stack.Screen name="onboarding" options={{ title: 'Hos Geldin', headerShown: false }} />
    </Stack>
  );
}