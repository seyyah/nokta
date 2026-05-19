import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import HomeScreen from './src/screens/HomeScreen';
import QuestionFlowScreen from './src/screens/QuestionFlowScreen';
import SpecOutputScreen from './src/screens/SpecOutputScreen';
import { QA } from './src/services/claude';

export type RootStackParamList = {
  Home: undefined;
  Questions: { idea: string };
  Spec: { idea: string; qas: QA[] };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
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
          <Stack.Screen
            name="Questions"
            component={QuestionFlowScreen}
            options={{ title: 'Dot Capture' }}
          />
          <Stack.Screen
            name="Spec"
            component={SpecOutputScreen}
            options={{ title: 'Your Spec' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
