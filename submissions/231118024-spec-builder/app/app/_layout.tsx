import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen 
          name="chat" 
          options={{ 
            title: 'Fikri Geliştir', 
            headerTintColor: Colors.light.primary, 
            headerStyle: { backgroundColor: '#ffffff' },
            headerTitleStyle: { fontWeight: '800', color: '#0f172a' },
            headerShadowVisible: false,
            headerBackTitle: 'Geri',
          }} 
        />
        <Stack.Screen 
          name="spec" 
          options={{ 
            title: 'Spesifikasyon Kartı', 
            headerTintColor: Colors.light.primary, 
            headerStyle: { backgroundColor: '#ffffff' },
            headerTitleStyle: { fontWeight: '800', color: '#0f172a' },
            headerShadowVisible: false,
            headerLeft: () => null, // Remove back button to ensure flow completion
            gestureEnabled: false, // Prevent swiping back
          }} 
        />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
