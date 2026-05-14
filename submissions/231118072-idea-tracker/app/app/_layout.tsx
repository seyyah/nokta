import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuditProvider } from '../nokta-audit/AuditProvider';

export default function RootLayout() {
  return (
    <AuditProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0F0F1A' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="questions" />
        <Stack.Screen name="spec" />
      </Stack>
    </AuditProvider>
  );
}
