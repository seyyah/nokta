import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0a0a0a' },
          headerTintColor: '#fff',
          headerTitle: '',
          contentStyle: { backgroundColor: '#0a0a0a' },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="questions" options={{ title: '' }} />
        <Stack.Screen name="question-flow" options={{ title: '' }} />
        <Stack.Screen name="word-cloud" options={{ title: '' }} />
        <Stack.Screen name="content-builder" options={{ title: '' }} />
        <Stack.Screen name="spec" options={{ title: '' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
