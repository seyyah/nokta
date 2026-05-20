import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from './src/screens/HomeScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { AuditWidget } from '@xtatistix/mobile-audit';
import { auditStorage } from './src/components/AuditStorage';
import { captureScreen, captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Text } from 'react-native';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#4A90E2',
          tabBarInactiveTintColor: 'gray',
          headerStyle: { backgroundColor: '#FFF' },
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>

      {/* AuditWidget Integrated Globally */}
      <AuditWidget
        appName="AuditForge-Kevser"
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
          shareFile: (uri) => Sharing.shareAsync(uri),
          storage: auditStorage,
          currentScreen: 'DynamicScreen', // In real app, get this from navigation state
          BugIcon: <Text style={{ fontSize: 24 }}>🛡️</Text>,
        }}
        initialPosition={{ bottom: 100, right: 20 }}
      />
    </NavigationContainer>
  );
}
