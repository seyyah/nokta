import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]}>
      {/* Premium Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.welcomeText, { color: isDark ? '#94a3b8' : '#64748b' }]}>Welcome back,</Text>
          <Text style={[styles.userName, { color: isDark ? '#f8fafc' : '#0f172a' }]}>Eslen Gül Akbulut</Text>
        </View>
        <TouchableOpacity style={[styles.bellButton, { backgroundColor: isDark ? '#1e293b' : '#e2e8f0' }]}>
          <Text style={{ fontSize: 18 }}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* FIXED: High Contrast Banner Text */}
      <View style={[styles.contrastBanner, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9', borderWidth: 1, borderColor: isDark ? '#f43f5e' : '#fda4af' }]}>
        <Text style={[styles.contrastTitle, { color: isDark ? '#f43f5e' : '#e11d48' }]}>
          ⚠️ URGENT: System Update Required immediately to prevent sync failures.
        </Text>
      </View>

      {/* Main Feature Card with Gradient */}
      <LinearGradient
        colors={isDark ? ['#4f46e5', '#3b82f6'] : ['#6366f1', '#60a5fa']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientCard}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Audit Forge Challenge</Text>
          <Text style={styles.cardBadge}>Active</Text>
        </View>
        <Text style={styles.cardDesc}>
          Phase A: Audit Widget Integration. Catch UI bugs dynamically using the floating action button.
        </Text>
        <View style={styles.cardStats}>
          <View>
            <Text style={styles.statVal}>3 / 3</Text>
            <Text style={styles.statLabel}>Screens Ready</Text>
          </View>
          <View>
            <Text style={styles.statVal}>Active</Text>
            <Text style={styles.statLabel}>Nokta Widget</Text>
          </View>
        </View>
      </LinearGradient>

      {/* FIXED: Clean Layout spacing instead of absolute overlap */}
      <View style={styles.overlapSection}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
          Recent Activity & Logs
        </Text>
        <Text style={[styles.overlappingSubtitle, { color: isDark ? '#64748b' : '#94a3b8' }]}>
          Bug reporting details and activity logs for audit verification.
        </Text>
      </View>

      {/* Premium UI Component: Activity List */}
      <View style={styles.activityList}>
        {[
          { id: 1, title: 'Settings Screen Configured', time: '10 mins ago', icon: '🛠️' },
          { id: 2, title: 'Nokta-Audit Widget Mounted', time: '1 hour ago', icon: '📦' },
          { id: 3, title: 'Profile Screen Created', time: '2 hours ago', icon: '👤' },
        ].map((item) => (
          <View key={item.id} style={[styles.activityItem, { backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: isDark ? '#334155' : '#e2e8f0' }]}>
            <Text style={styles.activityIcon}>{item.icon}</Text>
            <View style={styles.activityContent}>
              <Text style={[styles.activityTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>{item.title}</Text>
              <Text style={[styles.activityTime, { color: isDark ? '#64748b' : '#94a3b8' }]}>{item.time}</Text>
            </View>
            <TouchableOpacity style={styles.arrowButton}>
              <Text style={{ color: isDark ? '#60a5fa' : '#3b82f6' }}>View</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Navigation Shortcuts */}
      <View style={styles.shortcuts}>
        <TouchableOpacity 
          style={[styles.shortcutBtn, { backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: isDark ? '#334155' : '#e2e8f0' }]}
          onPress={() => router.push('/profile')}
        >
          <Text style={{ fontSize: 24, marginBottom: 8 }}>👤</Text>
          <Text style={[styles.shortcutText, { color: isDark ? '#f8fafc' : '#0f172a' }]}>Go to Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.shortcutBtn, { backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: isDark ? '#334155' : '#e2e8f0' }]}
          onPress={() => router.push('/settings')}
        >
          <Text style={{ fontSize: 24, marginBottom: 8 }}>⚙️</Text>
          <Text style={[styles.shortcutText, { color: isDark ? '#f8fafc' : '#0f172a' }]}>Go to Settings</Text>
        </TouchableOpacity>
      </View>
      
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contrastBanner: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  contrastTitle: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  gradientCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 25,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  cardBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 11,
    fontWeight: '600',
  },
  cardDesc: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  cardStats: {
    flexDirection: 'row',
    gap: 32,
  },
  statVal: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 12,
  },
  overlapSection: {
    marginBottom: 8,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  overlappingSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  activityList: {
    gap: 12,
    marginBottom: 24,
    marginTop: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  activityTime: {
    fontSize: 12,
    marginTop: 2,
  },
  arrowButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  shortcuts: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  shortcutBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  shortcutText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
