import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import PitchInputScreen from '../screens/PitchInputScreen';
import LoadingScreen from '../screens/LoadingScreen';
import AnalysisDashboard from '../screens/AnalysisDashboard';
import { COLORS } from '../theme/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="PitchInput"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
          animation: 'fade_from_bottom',
        }}
      >
        <Stack.Screen name="PitchInput" component={PitchInputScreen} />
        <Stack.Screen name="Loading" component={LoadingScreen} />
        <Stack.Screen name="Dashboard" component={AnalysisDashboard} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
