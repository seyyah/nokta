import { Tabs } from 'expo-router';
import { Compass, Radar, Terminal, MessageCircle, ShieldCheck } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#0a0a0a', borderBottomWidth: 1, borderBottomColor: '#222' },
        headerTintColor: '#00E5FF',
        headerTitleStyle: { fontFamily: 'monospace', fontWeight: 'bold' },
        tabBarStyle: {
          backgroundColor: '#0a0a0a',
          borderTopWidth: 1,
          borderTopColor: '#222',
          paddingBottom: 5,
        },
        tabBarActiveTintColor: '#00FF41',
        tabBarInactiveTintColor: '#555',
        tabBarLabelStyle: { fontFamily: 'monospace', fontSize: 10 },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Fikir Keşfi',
          tabBarIcon: ({ color }) => <Compass color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="analyze"
        options={{
          title: 'Radar Analiz',
          tabBarIcon: ({ color }) => <Radar color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'AI Chat',
          headerTitle: '⚡ RADAR AI',
          tabBarIcon: ({ color }) => <MessageCircle color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="manifesto"
        options={{
          title: 'Manifesto',
          tabBarIcon: ({ color }) => <Terminal color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admin',
          headerTitle: '🛡 ADMIN PANELİ',
          tabBarIcon: ({ color }) => <ShieldCheck color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}
