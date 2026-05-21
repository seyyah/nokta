import { Link, usePathname } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import type { ScreenModel } from './screens';

type Props = {
  screen: ScreenModel;
};

const tabs = [
  { href: '/', label: 'Capture' },
  { href: '/reports', label: 'Reports' },
  { href: '/forge', label: 'Forge' },
] as const;

export function NoktaScreen({ screen }: Props) {
  const pathname = usePathname();

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 18, gap: 16 }}>
      <View style={{ gap: 6 }}>
        <Text selectable style={{ color: '#6c6258', fontSize: 13 }}>
          Active route: {pathname}
        </Text>
        <Text selectable style={{ color: '#1c1b1a', fontSize: 28, fontWeight: '700' }}>
          {screen.title}
        </Text>
        <Text selectable style={{ color: '#5a5149', fontSize: 16, lineHeight: 22 }}>
          {screen.description}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link key={tab.href} href={tab.href} asChild>
              <Pressable
                style={{
                  flex: 1,
                  minHeight: 42,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 8,
                  backgroundColor: active ? '#1c1b1a' : '#e6ded4',
                }}
              >
                <Text style={{ color: active ? '#fffaf3' : '#1c1b1a', fontWeight: '600' }}>{tab.label}</Text>
              </Pressable>
            </Link>
          );
        })}
      </View>

      <View
        style={{
          gap: 14,
          borderRadius: 8,
          backgroundColor: '#fffaf3',
          padding: 16,
          boxShadow: '0 1px 2px rgba(28, 27, 26, 0.08)',
        }}
      >
        <Text selectable style={{ color: '#1c1b1a', fontSize: 18, fontWeight: '700' }}>
          {screen.cardTitle}
        </Text>
        <Text selectable style={{ color: '#5a5149', fontSize: 15, lineHeight: 21 }}>
          {screen.cardBody}
        </Text>
        <View style={{ gap: 8 }}>
          {screen.bullets.map((bullet) => (
            <View key={bullet} style={{ flexDirection: 'row', gap: 8 }}>
              <Text style={{ color: '#b94632' }}>•</Text>
              <Text selectable style={{ flex: 1, color: '#332f2a', lineHeight: 20 }}>
                {bullet}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

