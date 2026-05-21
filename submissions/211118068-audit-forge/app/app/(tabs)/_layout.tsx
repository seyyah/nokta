import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: { borderTopColor: '#E5E7EB' },
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '700', color: '#111827' },
      }}
    >
      <Tabs.Screen
        name="ideas"
        options={{
          title: 'Fikirler',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>💡</Text>,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ayarlar',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>⚙️</Text>,
        }}
      />
    </Tabs>
  );
}
