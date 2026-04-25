import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0A0A0A',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: '#0A0A0A',
          },
        }}>
        <Stack.Screen name="index" options={{ title: 'NOKTA', headerShown: false }} />
        <Stack.Screen name="interview" options={{ title: 'Mühendislik Sorgusu' }} />
        <Stack.Screen name="artifact" options={{ title: 'Spesifikasyon' }} />
      </Stack>
    </>
  );
}
