import React from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';

export default function App() {
  // Local development URL (Vite default is 5173)
  // In production, this would be your hosted web URL
  const localUrl = 'http://192.168.1.100:5173'; // Fallback example
  
  // Try to get the debugger host to automatically find the local server
  const host = Constants.expoConfig?.hostUri?.split(':')[0] || 'localhost';
  const url = `http://${host}:5173`;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <View style={styles.content}>
        <WebView 
          source={{ uri: url }} 
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
});
