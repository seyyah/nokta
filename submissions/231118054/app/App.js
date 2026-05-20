import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import ChatScreen from './src/screens/ChatScreen';
import MentorDashboard from './src/screens/MentorDashboard';

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Home">
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{ title: 'Nokta Start' }}
                />
                <Stack.Screen
                    name="Chat"
                    component={ChatScreen}
                    options={{ title: 'Idea Chat' }}
                />
                <Stack.Screen
                    name="MentorDashboard"
                    component={MentorDashboard}
                    options={{ title: 'Mentor Queue' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
