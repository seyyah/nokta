import React, { useState, useRef } from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { captureScreen, captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { AuditWidget } from './nokta-audit';
import { auditStorage } from './auditStorage';

import IdeaScreen from './app/screens/IdeaScreen';
import QuestionsScreen from './app/screens/QuestionsScreen';
import SpecScreen from './app/screens/SpecScreen';
import ExpertScreen from './app/screens/ExpertScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('IdeaScreen');
  const navigationRef = useRef();
  const routeNameRef = useRef();

  return (
    <SafeAreaProvider>
      <NavigationContainer
        ref={navigationRef}
        onReady={() => {
          routeNameRef.current = navigationRef.current.getCurrentRoute().name;
          setCurrentScreen(routeNameRef.current);
        }}
        onStateChange={async () => {
          const previousRouteName = routeNameRef.current;
          const currentRouteName = navigationRef.current.getCurrentRoute().name;
          if (previousRouteName !== currentRouteName) {
            setCurrentScreen(currentRouteName);
          }
          routeNameRef.current = currentRouteName;
        }}
      >
        <Stack.Navigator
          initialRouteName="IdeaScreen"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#1a1a2e',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            headerBackTitleVisible: false,
          }}
        >
          <Stack.Screen 
            name="IdeaScreen" 
            component={IdeaScreen} 
            options={{ title: 'Nokta - Dot Capture' }} 
          />
          <Stack.Screen 
            name="QuestionsScreen" 
            component={QuestionsScreen} 
            options={{ title: 'Define Idea' }} 
          />
          <Stack.Screen 
            name="SpecScreen" 
            component={SpecScreen} 
            options={{ title: 'Idea Specification' }} 
          />
          <Stack.Screen 
            name="ExpertScreen" 
            component={ExpertScreen} 
            options={{ title: 'Uzman İncelemesi (HITL)' }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
      
      <AuditWidget
        appName="Nokta App"
        deps={{
          captureScreen: () => captureScreen({ format: 'png', result: 'tmpfile' }),
          captureRef: (ref) => captureRef(ref, { format: 'png', result: 'tmpfile' }),
          writeFile: async (filename, content) => {
            const uri = FileSystem.documentDirectory + filename;
            await FileSystem.writeAsStringAsync(uri, content);
            return uri;
          },
          writeFileBinary: async (filename, base64) => {
            const uri = FileSystem.documentDirectory + filename;
            await FileSystem.writeAsStringAsync(uri, base64, {
              encoding: FileSystem.EncodingType.Base64,
            });
            return uri;
          },
          shareFile: (uri) => Sharing.shareAsync(uri, { mimeType: 'text/plain', dialogTitle: 'Raporu Paylaş' }),
          storage: auditStorage,
          currentScreen: currentScreen,
          reporterId: 'mert-tester',
          BugIcon: <Text style={{ fontSize: 22 }}>🐛</Text>,
        }}
        initialPosition={{ bottom: 100, right: 16 }}
      />
    </SafeAreaProvider>
  );
}
