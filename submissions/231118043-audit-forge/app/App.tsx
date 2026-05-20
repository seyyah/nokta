import React, { useRef, useState } from 'react';
import { Text } from 'react-native';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { captureScreen } from 'react-native-view-shot';
import { documentDirectory, writeAsStringAsync, EncodingType } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { AuditWidget } from '@xtatistix/mobile-audit';

import HomeScreen from './src/screens/HomeScreen';
import QuestionFlowScreen from './src/screens/QuestionFlowScreen';
import SpecOutputScreen from './src/screens/SpecOutputScreen';
import { auditStorage } from './src/storage/auditStorage';
import { QA } from './src/services/gemini';

export type RootStackParamList = {
  Home: undefined;
  Questions: { idea: string };
  Spec: { idea: string; qas: QA[] };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  const navRef = useNavigationContainerRef();
  const [currentScreen, setCurrentScreen] = useState('HomeScreen');

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer
        ref={navRef}
        onStateChange={() => {
          const name = (navRef.getCurrentRoute() as { name?: string } | undefined)?.name;
          if (name) setCurrentScreen(name);
        }}
      >
        <StatusBar style="light" />
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: '#0a0a0a' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: '700' },
            cardStyle: { backgroundColor: '#0a0a0a' },
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Questions" component={QuestionFlowScreen} options={{ title: 'Soru Akışı' }} />
          <Stack.Screen name="Spec" component={SpecOutputScreen} options={{ title: 'Spec' }} />
        </Stack.Navigator>

        {/* Track A: tek mount noktası — drop-in, kaldırılabilir */}
        <AuditWidget
          appName="Nokta Audit Forge"
          deps={{
            captureScreen: () => captureScreen({ format: 'png', result: 'tmpfile' }),
            captureRef: (ref) => captureScreen({ format: 'png', result: 'tmpfile' }),
            writeFile: async (filename, content) => {
              const uri = (documentDirectory ?? '') + filename;
              await writeAsStringAsync(uri, content);
              return uri;
            },
            writeFileBinary: async (filename, base64) => {
              const uri = (documentDirectory ?? '') + filename;
              await writeAsStringAsync(uri, base64, { encoding: EncodingType.Base64 });
              return uri;
            },
            shareFile: (uri) => Sharing.shareAsync(uri),
            storage: auditStorage,
            currentScreen,
            reporterId: '231118043',
            BugIcon: <Text style={{ fontSize: 22 }}>🐛</Text>,
          }}
          initialPosition={{ bottom: 110, right: 16 }}
        />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
