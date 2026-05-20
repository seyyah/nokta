import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, TouchableOpacity } from 'react-native';
import { AuditWidget } from '@xtatistix/mobile-audit';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { captureScreen, captureRef } from 'react-native-view-shot';

const dummyStorage = {
  getItem: async (key: string) => null,
  setItem: async (key: string, value: string) => {},
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Home');

  const deps = {
    captureScreen,
    captureRef,
    writeFile: async (path: string, content: string) => {
      const fileUri = FileSystem.documentDirectory + path;
      await FileSystem.writeAsStringAsync(fileUri, content);
      return fileUri;
    },
    writeFileBinary: async (path: string, base64: string) => {
      const fileUri = FileSystem.documentDirectory + path;
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return fileUri;
    },
    shareFile: async (path: string) => {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path);
      }
    },
    storage: dummyStorage,
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Home':
        return (
          <View style={styles.screen}>
            <Text style={styles.title}>Nokta App - Home</Text>
            <Text style={styles.subtitle}>Welcome to the main screen.</Text>
            <TouchableOpacity style={styles.customButton} onPress={() => setCurrentScreen('Features')}>
              <Text style={styles.buttonText}>Go to Features</Text>
            </TouchableOpacity>
          </View>
        );
      case 'Features':
        return (
          <View style={styles.screen}>
            <Text style={styles.title}>Features</Text>
            <Text style={styles.subtitle}>Here is a list of features.</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.customButton} onPress={() => setCurrentScreen('About')}>
                <Text style={styles.buttonText}>Go to About</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.customButton, { marginTop: 15 }]} onPress={() => setCurrentScreen('Home')}>
                <Text style={styles.buttonText}>Back to Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      case 'About':
        return (
          <View style={styles.screen}>
            <Text style={styles.title}>About</Text>
            <Text style={[styles.subtitle, { textAlign: 'center' }]}>This is an application specifically designed for demonstrating the Nokta Audit Widget capabilities.</Text>
            <TouchableOpacity style={styles.customButton} onPress={() => setCurrentScreen('Features')}>
              <Text style={styles.buttonText}>Back to Features</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
      <StatusBar style="auto" />
      <AuditWidget deps={deps} currentScreen={currentScreen} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    marginBottom: 20,
  },
  customButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
