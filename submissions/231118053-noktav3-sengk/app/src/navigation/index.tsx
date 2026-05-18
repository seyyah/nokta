import React from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import PitchInputScreen from '../screens/PitchInputScreen';
import LoadingScreen from '../screens/LoadingScreen';
import AnalysisDashboard from '../screens/AnalysisDashboard';
import ExpertHubScreen from '../screens/ExpertHubScreen';
import { COLORS } from '../theme/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();

interface Props {
  onScreenChange?: (screen: string) => void;
}

const AppNavigator = ({ onScreenChange }: Props) => {
  const navigationRef = useNavigationContainerRef();

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        onScreenChange?.(navigationRef.getCurrentRoute()?.name || 'Unknown');
      }}
      onStateChange={() => {
        onScreenChange?.(navigationRef.getCurrentRoute()?.name || 'Unknown');
      }}
    >
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
        <Stack.Screen name="ExpertHub" component={ExpertHubScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
