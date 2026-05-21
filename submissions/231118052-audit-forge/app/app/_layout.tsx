import { Stack, usePathname } from 'expo-router';
import { Text } from 'react-native';
import * as MobileAudit from '@xtatistix/mobile-audit';
import { createAuditDeps } from '@/src/audit-deps';

export default function RootLayout() {
  const pathname = usePathname();

  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#f6f3ee' },
          headerShadowVisible: false,
          headerTitleStyle: { color: '#1c1b1a' },
          contentStyle: { backgroundColor: '#f6f3ee' },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Capture' }} />
        <Stack.Screen name="reports" options={{ title: 'Reports' }} />
        <Stack.Screen name="forge" options={{ title: 'Forge' }} />
      </Stack>
      <MobileAudit.AuditWidget appName="Nokta Forge" deps={createAuditDeps(pathname, <Text style={{ fontSize: 20 }}>!</Text>)} initialPosition={{ bottom: 88, right: 18 }} />
    </>
  );
}
