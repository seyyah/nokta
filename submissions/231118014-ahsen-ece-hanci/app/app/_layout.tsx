import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AnalysisProvider } from "@/providers/AnalysisProvider";
import { theme } from "@/constants/theme";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.bg },
        headerTintColor: theme.text,
        headerTitleStyle: { color: theme.text },
        contentStyle: { backgroundColor: theme.bg },
        headerShadowVisible: false,
        headerBackTitle: "Back",
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="analyzing" options={{ headerShown: false, presentation: "modal", animation: "fade" }} />
      <Stack.Screen name="result/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="history" options={{ title: "ARCHIVE" }} />
      <Stack.Screen name="compare" options={{ title: "COMPARE", presentation: "modal" }} />
      <Stack.Screen name="settings" options={{ title: "SETTINGS", presentation: "modal" }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AnalysisProvider>
          <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.bg }}>
            <StatusBar style="light" />
            <RootLayoutNav />
          </GestureHandlerRootView>
        </AnalysisProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
