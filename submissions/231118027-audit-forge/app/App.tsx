import React, { useState } from 'react';
import { Text } from 'react-native';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { captureScreen, captureRef } from 'react-native-view-shot';

// Ekranlarımız
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';

// Audit Widget ve Storage
import { AuditWidget } from '@xtatistix/mobile-audit';
import { auditStorage } from './auditStorage';

const Stack = createNativeStackNavigator();

export default function App() {
  const navigationRef = useNavigationContainerRef();
  const [routeName, setRouteName] = useState('Home');

  return (
    <>
      <NavigationContainer
        ref={navigationRef}
        onStateChange={() => {
          // @ts-ignore - TypeScript navigasyon ismini bulamadığı için susturuyoruz
          const currentRouteName = navigationRef.getCurrentRoute()?.name;
          if (currentRouteName) {
            setRouteName(currentRouteName);
          }
        }}
      >
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Ana Sayfa' }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil Ekranı' }} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Ayarlar' }} />
        </Stack.Navigator>
      </NavigationContainer>

      <AuditWidget
        appName="NoktaForge"
        initialPosition={{ bottom: 100, right: 16 }}
        deps={{
          // WEB HACK: Ekran görüntüsü alamıyorsan çökme, sahte bir boş resim gönder!
          captureScreen: async () => {
            try {
              return await captureScreen({ format: 'png', result: 'tmpfile' });
            } catch (error) {
              return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="; 
            }
          },
          captureRef: async (ref) => {
            try {
              return await captureRef(ref, { format: 'png', result: 'tmpfile' });
            } catch (error) {
              return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
            }
          },
          writeFile: async (filename, content) => {
            // WEB HACK: Dosyayı kaydetmeye çalışma, doğrudan terminale yazdır!
            console.log("\n\n====== 🚀 BULDĞUN HATANIN MD RAPORU ======\n");
            console.log(content);
            console.log("\n==========================================\n\n");
            
            return "web-dummy-uri";
          },
          writeFileBinary: async (filename, base64) => {
            const dir = FileSystem.documentDirectory || '';
            const uri = dir + filename;
            // @ts-ignore - Web uyarısını susturuyoruz
            await FileSystem.writeAsStringAsync(uri, base64, {
              encoding: FileSystem.EncodingType?.Base64 || 'base64',
            });
            return uri;
          },
          shareFile: (uri) => Sharing.shareAsync(uri),
          storage: auditStorage,
          currentScreen: routeName,
          reporterId: '231118027-Efe',
          BugIcon: <Text style={{ fontSize: 22 }}>🐛</Text>,
        }}
      />
    </>
  );
}