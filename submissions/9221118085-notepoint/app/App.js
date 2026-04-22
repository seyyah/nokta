import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import CaptureScreen from './screens/CaptureScreen';
import EnrichScreen from './screens/EnrichScreen';
import ArtifactScreen from './screens/ArtifactScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        initialRouteName="Capture"
        screenOptions={{
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTintColor: '#111111',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: '#F5F5F5' },
        }}
      >
        <Stack.Screen
          name="Capture"
          component={CaptureScreen}
          options={{ title: 'NOKTA — Capture' }}
        />
        <Stack.Screen
          name="Enrich"
          component={EnrichScreen}
          options={{ title: 'Enrich' }}
        />
        <Stack.Screen
          name="Artifact"
          component={ArtifactScreen}
          options={{ title: 'Idea Card' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
