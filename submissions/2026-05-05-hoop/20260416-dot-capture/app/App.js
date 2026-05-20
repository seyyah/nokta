import * as React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CaptureScreen from './src/screens/CaptureScreen';
import ProcessingScreen from './src/screens/ProcessingScreen';
import InsightScreen from './src/screens/InsightScreen';
import ClarifyScreen from './src/screens/ClarifyScreen';
import IdeaResultScreen from './src/screens/IdeaResultScreen';
import AssistantScreen from './src/screens/AssistantScreen';

const Stack = createNativeStackNavigator();

const EtherealTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#09090b', 
    card: '#0a0a0c',
    text: '#ffffff',
    border: '#27272a',
    primary: '#a855f7', // Amethyst purple
  },
};

export default function App() {
  return (
    <NavigationContainer theme={EtherealTheme}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <Stack.Navigator 
        initialRouteName="Capture"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'fade', // Smooth fading across all states
        }}
      >
        <Stack.Screen name="Capture" component={CaptureScreen} />
        <Stack.Screen name="Processing" component={ProcessingScreen} />
        <Stack.Screen name="Insight" component={InsightScreen} />
        <Stack.Screen name="Clarify" component={ClarifyScreen} options={{ presentation: 'transparentModal' }} />
        <Stack.Screen name="IdeaResult" component={IdeaResultScreen} />
        <Stack.Screen name="Assistant" component={AssistantScreen} options={{ presentation: 'modal' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

