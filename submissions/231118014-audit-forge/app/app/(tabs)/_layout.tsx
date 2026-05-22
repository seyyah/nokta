import { Tabs } from "expo-router";
import { Activity, FileText, Settings as SettingsIcon } from "lucide-react-native";
import React from "react";

import Colors from "@/constants/colors";

const { palette } = Colors;

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: palette.yellow,
        tabBarInactiveTintColor: palette.textMuted,
        tabBarStyle: {
          backgroundColor: palette.ink,
          borderTopColor: palette.border,
          borderTopWidth: 1,
          height: 78,
          paddingTop: 8,
          paddingBottom: 22,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          letterSpacing: 1.2,
        },
        headerStyle: { backgroundColor: palette.ink },
        headerShadowVisible: false,
        headerTitleStyle: {
          color: palette.text,
          fontWeight: "800",
          letterSpacing: 0.5,
        },
        headerTintColor: palette.text,
        sceneStyle: { backgroundColor: palette.ink },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "PULSE",
          headerTitle: "Nokta",
          tabBarIcon: ({ color }) => <Activity color={color} size={22} strokeWidth={2.4} />,
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: "NOTES",
          headerTitle: "Notes",
          tabBarIcon: ({ color }) => <FileText color={color} size={22} strokeWidth={2.4} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "SETTINGS",
          headerTitle: "Settings",
          tabBarIcon: ({ color }) => <SettingsIcon color={color} size={22} strokeWidth={2.4} />,
        }}
      />
    </Tabs>
  );
}
