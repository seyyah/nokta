import type { Href } from 'expo-router';

export type ScreenId = 'Capture' | 'Reports' | 'Forge';

export type Screen = {
  id: ScreenId;
  route: Href;
  title: string;
  eyebrow: string;
  body: string;
  metric: string;
};

export const screens: Screen[] = [
  {
    id: 'Capture',
    route: '/',
    title: 'Nokta Audit Capture',
    eyebrow: 'Phase A',
    body: 'Musteri uygulama icinde sorunu gorur, FAB ile ekran yakalar, sari kutu ile isaretler ve notu Markdown rapora cevirir.',
    metric: '3 burn-in report',
  },
  {
    id: 'Reports',
    route: '/reports',
    title: 'Audit Reports',
    eyebrow: 'Ground truth',
    body: 'Raporlar gorsel kanit, ekran adi, not ve secim koordinatlarini coding agent icin tek bir Markdown input artifacti haline getirir.',
    metric: 'Markdown input',
  },
  {
    id: 'Forge',
    route: '/forge',
    title: 'Forge Loop',
    eyebrow: 'Phase B',
    body: 'Codex raporu okur, dosyayi bulur, hipotez kurar, minimal fix uygular, test eder ve ratchet gecerse commit atar.',
    metric: '18kg ratchet',
  },
];

export function getScreen(screenId: ScreenId) {
  return screens.find((screen) => screen.id === screenId) ?? screens[0];
}

export function screenFromPath(pathname: string) {
  if (pathname.startsWith('/reports')) return 'Reports';
  if (pathname.startsWith('/forge')) return 'Forge';
  return 'Capture';
}
