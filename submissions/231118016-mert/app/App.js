import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import IdeaScreen from './src/screens/IdeaScreen';
import QuestionsScreen from './src/screens/QuestionsScreen';
import SpecScreen from './src/screens/SpecScreen';
import ExpertScreen from './src/screens/ExpertScreen';
import VoiceScreen from './src/screens/VoiceScreen';
import AvatarScreen from './src/screens/AvatarScreen';
import ExpertBridgeScreen from './src/screens/ExpertBridgeScreen';

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
          <Stack.Screen 
            name="ExpertScreen" 
            component={ExpertScreen} 
            options={{ title: 'HITL Uzman Onay Paneli' }} 
          />
          <Stack.Screen 
            name="VoiceScreen" 
            component={VoiceScreen} 
            options={{ title: '🎙️ Ses Görselleştirici' }} 
          />
          <Stack.Screen 
            name="AvatarScreen" 
            component={AvatarScreen} 
            options={{ title: '🪞 Avatar' }} 
          />
          <Stack.Screen 
            name="ExpertBridgeScreen" 
            component={ExpertBridgeScreen} 
            options={{ title: '📞 Uzman Köprüsü' }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
