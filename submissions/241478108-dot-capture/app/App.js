import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer, DarkTheme, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { captureScreen, captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import CaptureScreen from './src/screens/CaptureScreen';
import ProcessingScreen from './src/screens/ProcessingScreen';
import InsightScreen from './src/screens/InsightScreen';
import ClarifyScreen from './src/screens/ClarifyScreen';
import IdeaResultScreen from './src/screens/IdeaResultScreen';
import AssistantScreen from './src/screens/AssistantScreen';
import VisionScreen from './src/screens/VisionScreen';
import { AuditWidget } from './src/nokta-audit';
import { auditStorage } from './src/nokta-audit/auditStorage';

const Stack = createNativeStackNavigator();
const navigationRef = createNavigationContainerRef();

const EtherealTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#09090b',
    card: '#0a0a0c',
    text: '#ffffff',
    border: '#27272a',
    primary: '#a855f7',
  },
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Capture');

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={EtherealTheme}
      onReady={() => {
        const route = navigationRef.getCurrentRoute();
        if (route?.name) setCurrentScreen(route.name);
      }}
      onStateChange={() => {
        const route = navigationRef.getCurrentRoute();
        if (route?.name) setCurrentScreen(route.name);
      }}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <Stack.Navigator
        initialRouteName="Capture"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="Capture" component={CaptureScreen} />
        <Stack.Screen name="Processing" component={ProcessingScreen} />
        <Stack.Screen name="Insight" component={InsightScreen} />
        <Stack.Screen name="Clarify" component={ClarifyScreen} options={{ presentation: 'transparentModal' }} />
        <Stack.Screen name="IdeaResult" component={IdeaResultScreen} />
        <Stack.Screen name="Assistant" component={AssistantScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="Vision" component={VisionScreen} />
      </Stack.Navigator>

      <AuditWidget
        appName="NoktaApp"
        deps={{
          captureScreen: () => captureScreen({ format: 'png', result: 'data-uri' }),
          captureRef: (ref) => captureRef(ref, { format: 'png', result: 'data-uri' }),
          writeFile: async (filename, content) => {
            const dir = FileSystem.documentDirectory || '';
            const uri = dir + filename;
            await FileSystem.writeAsStringAsync(uri, content);
            return uri;
          },
          shareFile: (uri) => Sharing.shareAsync(uri),
          storage: auditStorage,
          currentScreen: currentScreen,
          reporterId: 'nokta-user',
        }}
        initialPosition={{ bottom: 100, right: 20 }}
      />
    </NavigationContainer>
  );
}
