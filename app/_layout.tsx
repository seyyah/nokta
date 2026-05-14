import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { COLORS } from '../constants/theme';

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack
                screenOptions={{
                    headerStyle: { backgroundColor: COLORS.background },
                    headerTintColor: COLORS.primary,
                    headerTitleStyle: { fontWeight: 'bold' },
                    headerShadowVisible: false,
                }}
            >
                <Stack.Screen name="index" options={{ title: 'Nokta' }} />
                <Stack.Screen name="enrich" options={{ title: 'Brainstorm' }} />
                <Stack.Screen name="artifact" options={{ title: 'Spec' }} />
                <Stack.Screen name="escalation" options={{ title: 'Uzman Desteği' }} />
                <Stack.Screen name="video-call" options={{ title: 'Video Görüşme', headerShown: false }} />
                <Stack.Screen name="history" options={{ title: 'Geçmiş' }} />
            </Stack>
        </GestureHandlerRootView>
    );
}
