import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { AuditWidget } from '@xtatistix/mobile-audit';
import { buildAuditDeps } from '../services/auditDeps';

export default function RootLayout() {
  const pathname = usePathname();

  return (
    <ThemeProvider value={DarkTheme}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0a0a0a' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold', fontFamily: 'monospace' },
          contentStyle: { backgroundColor: '#000' },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="result" options={{ title: 'Analysis Result', presentation: 'card' }} />
      </Stack>
      <StatusBar style="light" />
      {/* AUDIT WIDGET — drop-in mount. Tek satır. Kaldırmak için sadece bu satırı sil. */}
      <AuditWidget appName="NOKTA RADAR" deps={buildAuditDeps(pathname)} />
    </ThemeProvider>
  );
}
