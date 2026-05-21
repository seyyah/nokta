import React, { useRef, useState, useEffect } from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { captureScreen, captureRef } from 'react-native-view-shot';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';

// @ts-ignore
import { AuditWidget } from '../../../../nokta-audit';

const Stack = createNativeStackNavigator();

export default function App() {
  const navigationRef = useNavigationContainerRef();
  const [currentScreen, setCurrentScreen] = useState('Home');

  useEffect(() => {
    const unsubscribe = navigationRef.addListener('state', () => {
      const currentRouteName = (navigationRef.getCurrentRoute() as any)?.name;
      if (currentRouteName) setCurrentScreen(currentRouteName);
    });
    return unsubscribe;
  }, [navigationRef]);

  const auditDeps = {
    captureScreen: async () => {
      return await captureScreen({ format: 'png', quality: 0.8 });
    },
    captureRef: async (ref: React.RefObject<any>) => {
      return await captureRef(ref, { format: 'png', quality: 0.8 });
    },
    writeFile: async (filename: string, content: string) => {
      const uri = FileSystem.documentDirectory + filename;
      await FileSystem.writeAsStringAsync(uri, content);
      return uri;
    },
    writeFileBinary: async (filename: string, base64: string) => {
      const uri = FileSystem.documentDirectory + filename;
      await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
      return uri;
    },
    shareFile: async (uri: string) => {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      }
    },
    storage: {
      loadNotes: async () => {
        const data = await AsyncStorage.getItem('@audit_notes');
        return data ? JSON.parse(data) : [];
      },
      saveNotes: async (notes: any[]) => {
        await AsyncStorage.setItem('@audit_notes', JSON.stringify(notes));
      }
    },
    currentScreen: currentScreen,
    reporterId: 'Agent_007',
    BugIcon: <Text style={{ fontSize: 24 }}>🐛</Text>
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
        <AuditWidget deps={auditDeps} appName="SpecBuilder App" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
