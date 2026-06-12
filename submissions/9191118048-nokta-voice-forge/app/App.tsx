/**
 * Voice Forge — Root Application Component
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

import { colors, typography } from './src/theme';
import { RootStackParamList } from './src/types';

import HomeScreen from './src/screens/HomeScreen';
import VoiceScreen from './src/screens/VoiceScreen';
import AvatarScreen from './src/screens/AvatarScreen';
import ForgeScreen from './src/screens/ForgeScreen';
import AuditScreen from './src/screens/AuditScreen';
import ExpertCallScreen from './src/screens/ExpertCallScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const DarkNavigationTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.accent,
  },
};

const screenOptions = {
  headerStyle: {
    backgroundColor: colors.surface,
  },
  headerTintColor: colors.text,
  headerTitleStyle: {
    fontWeight: '600' as const,
    fontSize: 18,
  },
  headerShadowVisible: false,
  contentStyle: {
    backgroundColor: colors.background,
  },
  animation: 'slide_from_right' as const,
};

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <NavigationContainer theme={DarkNavigationTheme}>
        <StatusBar style="light" backgroundColor={colors.background} />
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={screenOptions}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Voice"
            component={VoiceScreen}
            options={{
              title: 'Voice Visualizer',
              headerBackTitle: 'Geri',
            }}
          />
          <Stack.Screen
            name="Avatar"
            component={AvatarScreen}
            options={{
              title: 'Avatar Chat',
              headerBackTitle: 'Geri',
            }}
          />
          <Stack.Screen
            name="Forge"
            component={ForgeScreen}
            options={{
              title: 'Forge Dashboard',
              headerBackTitle: 'Geri',
            }}
          />
          <Stack.Screen
            name="Audit"
            component={AuditScreen}
            options={{
              title: 'Audit Reports',
              headerBackTitle: 'Geri',
            }}
          />
          <Stack.Screen
            name="ExpertCall"
            component={ExpertCallScreen}
            options={{
              title: 'Expert Bridge',
              headerBackTitle: 'Geri',
              headerStyle: {
                backgroundColor: colors.surface,
              },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
