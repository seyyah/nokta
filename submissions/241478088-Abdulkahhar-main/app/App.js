import React, { useRef, useState } from 'react';
import { View, Text } from 'react-native';
import { captureScreen, captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { AuditWidget } from '@xtatistix/mobile-audit';
import { auditStorage } from './src/services/auditStorage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from './src/theme';
import HomeScreen from './src/screens/HomeScreen';
import QuestionsScreen from './src/screens/QuestionsScreen';
import SpecSheetScreen from './src/screens/SpecSheetScreen';
import ExpertScreen from './src/screens/ExpertScreen';

const Stack = createStackNavigator();

export default function App() {
  const routeNameRef = useRef();
  const navigationRef = useRef();
  const [currentScreen, setCurrentScreen] = useState('Home');

  return (
    <View style={{ flex: 1 }}>
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
        <StatusBar style="light" />
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: COLORS.bg },
            gestureEnabled: true,
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Questions" component={QuestionsScreen} />
          <Stack.Screen name="SpecSheet" component={SpecSheetScreen} />
          <Stack.Screen name="Expert" component={ExpertScreen} />
        </Stack.Navigator>
      </NavigationContainer>

      <AuditWidget
        appName="SpecArchitect"
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
          shareFile: async (uri) => {
            try {
              console.log('\n=== MD RAPORU BASTA ===\n');
              const text = await FileSystem.readAsStringAsync(uri);
              console.log(text);
              console.log('\n=== MD RAPORU SONU ===\n');
            } catch (e) {
              console.log('Dosya okunamadi:', e);
            }
            try {
              await Sharing.shareAsync(uri);
            } catch (e) {
              console.error('Paylasma hatasi:', e);
            }
          },
          storage: auditStorage,
          currentScreen: currentScreen,
          reporterId: 'UnchaineD-TrackB',
          BugIcon: <Text style={{ fontSize: 22 }}>🐛</Text>,
        }}
        initialPosition={{ bottom: 110, right: 16 }}
      />
    </View>
  );
}
