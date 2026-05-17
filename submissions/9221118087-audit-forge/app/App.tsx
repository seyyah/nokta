import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuditWidget } from './src/components/AuditWidget';
import { HomeScreen } from './src/screens/HomeScreen';
import { ReportsScreen } from './src/screens/ReportsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import type { AuditReport, ScreenName } from './src/types/audit';

const tabs: { name: ScreenName; label: string }[] = [
  { name: 'HomeScreen', label: 'Home' },
  { name: 'ReportsScreen', label: 'Reports' },
  { name: 'SettingsScreen', label: 'Settings' },
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('HomeScreen');
  const [generatedReports, setGeneratedReports] = useState<AuditReport[]>([]);

  const activeScreen = useMemo(() => {
    if (currentScreen === 'ReportsScreen') {
      return <ReportsScreen generatedReports={generatedReports} />;
    }

    if (currentScreen === 'SettingsScreen') {
      return <SettingsScreen />;
    }

    return <HomeScreen />;
  }, [currentScreen, generatedReports]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.shell}>
        <StatusBar style="dark" />
        <View style={styles.content}>{activeScreen}</View>
        <View style={styles.tabs}>
          {tabs.map((tab) => {
            const active = tab.name === currentScreen;
            return (
              <Pressable
                key={tab.name}
                style={[styles.tab, active && styles.tabActive]}
                onPress={() => setCurrentScreen(tab.name)}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <AuditWidget
          currentScreen={currentScreen}
          onReportGenerated={(report) => setGeneratedReports((reports) => [report, ...reports])}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  shell: {
    backgroundColor: '#edf2f7',
    flex: 1,
  },
  content: {
    flex: 1,
  },
  tabs: {
    backgroundColor: '#ffffff',
    borderColor: '#d7dee8',
    borderRadius: 8,
    borderWidth: 1,
    bottom: 14,
    flexDirection: 'row',
    gap: 6,
    left: 14,
    padding: 6,
    position: 'absolute',
    right: 88,
  },
  tab: {
    alignItems: 'center',
    borderRadius: 6,
    flex: 1,
    paddingVertical: 10,
  },
  tabActive: {
    backgroundColor: '#0f4c5c',
  },
  tabText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '900',
  },
  tabTextActive: {
    color: '#ffffff',
  },
});
