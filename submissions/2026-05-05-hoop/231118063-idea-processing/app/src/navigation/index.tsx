import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { QuestionScreen } from '../screens/QuestionScreen';
import { SpecScreen } from '../screens/SpecScreen';
import { Theme } from '../theme';

export type RootStackParamList = {
  Home: undefined;
  Questions: { dot: string };
  Spec: { answers: Record<string, string>, dot: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Theme.colors.background,
        },
        headerTintColor: Theme.colors.primary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: Theme.colors.background,
        },
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'NOKTA' }} 
      />
      <Stack.Screen 
        name="Questions" 
        component={QuestionScreen} 
        options={{ title: 'ENRICH' }} 
      />
      <Stack.Screen 
        name="Spec" 
        component={SpecScreen} 
        options={{ title: 'SPEC ARTIFACT' }} 
      />
    </Stack.Navigator>
  );
};
