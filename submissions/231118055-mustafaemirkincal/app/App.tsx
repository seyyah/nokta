import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import DumpScreen from './screens/DumpScreen';
import CardsScreen from './screens/CardsScreen';
import BridgeScreen from './screens/BridgeScreen';
import ForgeScreen from './screens/ForgeScreen';
import { BridgeBrief, IdeaCard } from './services/claudeApi';

export type RootStackParamList = {
  Dump: undefined;
  Cards: { cards: IdeaCard[] };
  Bridge: { brief: BridgeBrief };
  Forge: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Dump" component={DumpScreen} />
        <Stack.Screen name="Cards" component={CardsScreen} />
        <Stack.Screen name="Bridge" component={BridgeScreen} />
        <Stack.Screen name="Forge" component={ForgeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
