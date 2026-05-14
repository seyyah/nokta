import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import ConsultationScreen from './src/screens/ConsultationScreen';

// Root ErrorBoundary for safety
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  componentDidCatch(error, errorInfo) { console.error("Root Error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ padding: 20, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'red' }}>Yazılımsal Bir Hata Oluştu</Text>
          <Text style={{ marginTop: 10 }}>Lütfen sayfayı yenileyin veya konsol hata mesajını iletin.</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <StatusBar style="dark" />
        <ConsultationScreen />
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
