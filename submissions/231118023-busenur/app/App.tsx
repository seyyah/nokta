import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { captureScreen, captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

// Local Widget Import
import { AuditWidget } from '@xtatistix/mobile-audit';
import { auditStorage } from './src/utils/auditStorage';

// Local Components & Utils
import Dashboard from './src/components/Dashboard';
import History from './src/components/History';
import Settings from './src/components/Settings';
import { storage, WaterLog } from './src/utils/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<'DashboardScreen' | 'HistoryScreen' | 'SettingsScreen'>('DashboardScreen');
  
  // App-level States
  const [logs, setLogs] = useState<WaterLog[]>([]);
  const [currentWater, setCurrentWater] = useState(0);
  const [targetWater, setTargetWater] = useState(2500);
  const [weight, setWeight] = useState(70);
  const [reminders, setReminders] = useState(true);

  // Load state on mount
  useEffect(() => {
    const initApp = async () => {
      const storedLogs = await storage.getWaterLogs();
      const storedGoal = await storage.getGoal();
      const storedWeight = await storage.getWeight();
      const storedReminders = await storage.getReminders();

      setLogs(storedLogs);
      setTargetWater(storedGoal);
      setWeight(storedWeight);
      setReminders(storedReminders);

      // Calculate total
      const total = storedLogs.reduce((sum, log) => sum + log.amount, 0);
      setCurrentWater(total);
    };

    initApp();
  }, []);

  // Log new water intake
  const handleAddWater = async (amount: number) => {
    const todayLogs = await storage.addWaterLog(amount);
    setLogs(todayLogs);
    const newTotal = todayLogs.reduce((sum, log) => sum + log.amount, 0);
    setCurrentWater(newTotal);
  };

  // Fixed deletion state sync (Bug 3 Fix)
  const handleDeleteLog = async (id: string) => {
    const todayLogs = await storage.deleteWaterLog(id);
    setLogs(todayLogs);
    
    // Fix state sync: recalculate and update currentWater
    const newTotal = todayLogs.reduce((sum, log) => sum + log.amount, 0);
    setCurrentWater(newTotal);
  };

  // Save profile settings
  const handleSaveSettings = async (goal: number, weightVal: number, remindersVal: boolean) => {
    await storage.setGoal(goal);
    await storage.setWeight(weightVal);
    await storage.setReminders(remindersVal);

    setTargetWater(goal);
    setWeight(weightVal);
    setReminders(remindersVal);
  };

  // Render active tab content
  const renderContent = () => {
    switch (activeTab) {
      case 'DashboardScreen':
        return (
          <Dashboard 
            currentWater={currentWater} 
            targetWater={targetWater} 
            onAddWater={handleAddWater} 
          />
        );
      case 'HistoryScreen':
        return (
          <History 
            logs={logs} 
            targetWater={targetWater} 
            onDeleteLog={handleDeleteLog}
            pastDaysData={storage.getPastSevenDaysLogs(currentWater)}
          />
        );
      case 'SettingsScreen':
        return (
          <Settings 
            currentGoal={targetWater} 
            currentWeight={weight} 
            remindersEnabled={reminders} 
            onSaveSettings={handleSaveSettings}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      
      {/* App Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>💧 HydroFlow</Text>
        <Text style={styles.headerSubtitle}>Su İçme Takipçisi</Text>
      </View>

      {/* Main Content Area */}
      <View style={styles.content}>
        {renderContent()}
      </View>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'DashboardScreen' && styles.activeTabItem]}
          onPress={() => setActiveTab('DashboardScreen')}
        >
          <Text style={styles.tabEmoji}>📊</Text>
          <Text style={[styles.tabLabel, activeTab === 'DashboardScreen' && styles.activeTabLabel]}>Panel</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'HistoryScreen' && styles.activeTabItem]}
          onPress={() => setActiveTab('HistoryScreen')}
        >
          <Text style={styles.tabEmoji}>📅</Text>
          <Text style={[styles.tabLabel, activeTab === 'HistoryScreen' && styles.activeTabLabel]}>Geçmiş</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'SettingsScreen' && styles.activeTabItem]}
          onPress={() => setActiveTab('SettingsScreen')}
        >
          <Text style={styles.tabEmoji}>⚙️</Text>
          <Text style={[styles.tabLabel, activeTab === 'SettingsScreen' && styles.activeTabLabel]}>Ayarlar</Text>
        </TouchableOpacity>
      </View>

      {/* CRITICAL: nokta-audit Widget Integration */}
      {/* Track A rules require this to be self-contained and drop-in. 
          Deleting this component tag should be the only change needed to uninstall it. */}
      <AuditWidget
        appName="HydroFlow"
        deps={{
          captureScreen: () => captureScreen({ format: 'png', result: 'tmpfile' }),
          captureRef: (ref) => captureRef(ref, { format: 'png', result: 'tmpfile' }),
          writeFile: async (filename, content) => {
            const uri = FileSystem.documentDirectory + filename;
            await FileSystem.writeAsStringAsync(uri, content);
            return uri;
          },
          writeFileBinary: async (filename, base64) => {
            const uri = FileSystem.documentDirectory + filename;
            await FileSystem.writeAsStringAsync(uri, base64, {
              encoding: FileSystem.EncodingType.Base64,
            });
            return uri;
          },
          shareFile: (uri) => Sharing.shareAsync(uri),
          storage: auditStorage,
          currentScreen: activeTab,
          reporterId: 'qa-busenur',
          BugIcon: <Text style={{ fontSize: 22 }}>🐛</Text>,
        }}
        initialPosition={{ bottom: 100, right: 16 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A', // Dark slate background
  },
  header: {
    paddingTop: 16,
    paddingBottom: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  logo: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  tabBar: {
    flexDirection: 'row',
    height: 70,
    backgroundColor: '#1E293B',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingBottom: 10,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
  },
  activeTabItem: {
    borderTopWidth: 3,
    borderTopColor: '#38BDF8',
  },
  tabEmoji: {
    fontSize: 20,
  },
  tabLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  activeTabLabel: {
    color: '#38BDF8',
    fontWeight: '700',
  },
});
