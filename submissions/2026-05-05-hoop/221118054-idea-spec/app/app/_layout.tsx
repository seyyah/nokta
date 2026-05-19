import { Stack } from 'expo-router';
export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'NOKTA ·' }} />
      <Stack.Screen name="chat" options={{ title: 'Fikri Olgunlaştır' }} />
      <Stack.Screen name="spec" options={{ title: 'Spec Kartı' }} />
      <Stack.Screen name="expert" options={{ title: 'Uzman Desteği' }} />
    </Stack>
  );
}
