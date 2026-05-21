import React, { useState } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import DumpScreen from './screens/DumpScreen';
import CardsScreen from './screens/CardsScreen';
import ReviewScreen from './screens/ReviewScreen';
import { IdeaCard } from './services/claudeApi';
import { AuditWidget } from './audit/index';
import { buildAuditDeps } from './auditDeps';

export type RootStackParamList = {
  Dump: undefined;
  Review: { cards: IdeaCard[] };
  Cards: { cards: IdeaCard[] };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const navigationRef = createNavigationContainerRef();

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('DumpScreen');

  return (
    <NavigationContainer
      ref={navigationRef}
      onStateChange={() => {
        const route = navigationRef.getCurrentRoute();
        if (route?.name) setCurrentScreen(route.name);
      }}
    >
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Dump" component={DumpScreen} />
        <Stack.Screen name="Review" component={ReviewScreen} />
        <Stack.Screen name="Cards" component={CardsScreen} />
      </Stack.Navigator>
      <AuditWidget
        deps={buildAuditDeps(currentScreen)}
        appName="NoteMigrator"
      />
    </NavigationContainer>
  );
}
