import { Slot, usePathname } from 'expo-router';
import { useMemo } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createAuditDeps } from '../src/auditDeps';
import { AuditWidget } from '../src/mobile-audit';

export default function RootLayout() {
  const pathname = usePathname();
  const auditDeps = useMemo(() => createAuditDeps(), []);
  const currentScreen = screenNameFromPath(pathname);

  return (
    <SafeAreaProvider>
      <Slot />
      <AuditWidget deps={auditDeps} currentScreen={currentScreen} />
    </SafeAreaProvider>
  );
}

function screenNameFromPath(pathname: string) {
  if (pathname === '/') return 'Onboarding';
  if (pathname.startsWith('/idea/')) return 'IdeaDetail';
  if (pathname === '/ideas') return 'IdeaList';
  if (pathname === '/forge') return 'ForgeBoard';
  return pathname.replace('/', '') || 'Unknown';
}
