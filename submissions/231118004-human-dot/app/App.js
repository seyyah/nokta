import React, { useRef, useState } from 'react';
import { Text, Share, Alert } from 'react-native';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { captureScreen, captureRef } from 'react-native-view-shot';
import { AuditWidget } from '@xtatistix/mobile-audit';
import { auditStorage } from './services/auditStorage';

import HomeScreen from './screens/HomeScreen';
import ChatScreen from './screens/ChatScreen';
import SpecScreen from './screens/SpecScreen';
import HistoryScreen from './screens/HistoryScreen';
import ExpertScreen from './screens/ExpertScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const navRef = useNavigationContainerRef();
  const [currentScreen, setCurrentScreen] = useState('Home');

  // ─── AuditWidget deps (host application boundary) ───────────────────────────
  // Native paketler BURADAN inject edilir — widget içine import yapılmaz.
  const auditDeps = {
    captureScreen: () => captureScreen({ format: 'png', result: 'data-uri' }),
    captureRef: (ref) => captureRef(ref, { format: 'png', result: 'data-uri' }),
    writeFile: async (filename, content) => {
      try {
        const dir = FileSystem.cacheDirectory || FileSystem.documentDirectory || 'file:///tmp/';
        const uri = dir.endsWith('/') ? dir + filename : dir + '/' + filename;
        await FileSystem.writeAsStringAsync(uri, content, { encoding: 'utf8' });
        return uri;
      } catch (e) {
        Alert.alert('Write Error', String(e));
        throw e;
      }
    },
    writeFileBinary: async (filename, base64) => {
      try {
        const dir = FileSystem.cacheDirectory || FileSystem.documentDirectory || 'file:///tmp/';
        const uri = dir.endsWith('/') ? dir + filename : dir + '/' + filename;
        await FileSystem.writeAsStringAsync(uri, base64, {
          encoding: 'base64',
        });
        return uri;
      } catch (e) {
        Alert.alert('Write Binary Error', String(e));
        throw e;
      }
    },
    shareFile: async (uri) => {
      try {
        if (!uri) {
          Alert.alert('Hata', 'Dosya URI tanımsız!');
          return;
        }
        const available = await Sharing.isAvailableAsync();
        if (available) {
          await Sharing.shareAsync(uri, { 
            dialogTitle: 'Audit Raporunu Paylaş',
            mimeType: uri.endsWith('.md') ? 'text/markdown' : 'application/octet-stream',
            UTI: uri.endsWith('.md') ? 'public.plain-text' : 'public.data',
          });
        } else {
          Alert.alert('Hata', 'Paylaşım desteklenmiyor.');
        }
      } catch (e) {
        Alert.alert('Share Error', String(e));
        console.warn('[AuditWidget] shareFile error:', e);
      }
    },
    storage: auditStorage,
    currentScreen,
    reporterId: 'student-231118004',
    BugIcon: <Text style={{ fontSize: 22 }}>🐛</Text>,
  };
  // ────────────────────────────────────────────────────────────────────────────

  return (
    <NavigationContainer
      ref={navRef}
      onStateChange={() => {
        const name = navRef.getCurrentRoute()?.name;
        if (name) setCurrentScreen(name);
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#080814' },
        }}
        initialRouteName="Home"
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="Spec" component={SpecScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="Expert" component={ExpertScreen} />
      </Stack.Navigator>

      {/* AuditWidget — tek satır mount, drop-in primitive */}
      <AuditWidget
        appName="nokta-human-dot"
        deps={auditDeps}
        initialPosition={{ bottom: 650, right: 16 }}
      />
    </NavigationContainer>
  );
}
