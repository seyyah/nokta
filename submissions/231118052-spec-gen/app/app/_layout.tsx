import { Stack } from "expo-router";

export default function RootLayout() {
    return (
        <Stack>
            {/* Sadece index sayfamızı göster ve üstteki varsayılan başlığı gizle */}
            <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
    );
}