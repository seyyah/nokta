import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import IdeaScreen from './app/screens/IdeaScreen';
import QuestionsScreen from './app/screens/QuestionsScreen';
import SpecScreen from './app/screens/SpecScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="IdeaScreen"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#1a1a2e',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            headerBackTitleVisible: false,
          }}
        >
          <Stack.Screen 
            name="IdeaScreen" 
            component={IdeaScreen} 
            options={{ title: 'Nokta - Dot Capture' }} 
          />
          <Stack.Screen 
            name="QuestionsScreen" 
            component={QuestionsScreen} 
            options={{ title: 'Define Idea' }} 
          />
          <Stack.Screen 
            name="SpecScreen" 
            component={SpecScreen} 
            options={{ title: 'Idea Specification' }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
