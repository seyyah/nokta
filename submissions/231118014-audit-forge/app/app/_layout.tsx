import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import AuditWidget from "@/components/audit";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.palette.ink },
        headerTintColor: Colors.palette.text,
        headerTitleStyle: { fontWeight: "800" },
        contentStyle: { backgroundColor: Colors.palette.ink },
        headerBackTitle: "Back",
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.palette.ink }}>
          <StatusBar style="light" />
          <View style={{ flex: 1 }}>
            <RootLayoutNav />
            {/* Drop-in: one line, mounted at root. Works across every screen. */}
            <AuditWidget />
          </View>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
