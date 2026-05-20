import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';

export const ProfileScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>KT</Text>
          </View>
        </View>
        <Text style={styles.userName}>Kevser Tavlı</Text>
        <Text style={styles.userRole}>Senior Audit Engineer</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>24</Text>
          <Text style={styles.statLabel}>Audits</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Found</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>8</Text>
          <Text style={styles.statLabel}>Fixed</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About Me</Text>
        {/* BUG #2: Text Overflow - Container doesn't wrap long strings correctly */}
        <View style={styles.bioContainer}>
          <Text style={styles.bioText}>
            I am a senior React Native engineer specializing in auditing and visual quality assurance. My passion is to find even the smallest UI glitches that humans might miss but AI agents can fix efficiently. I love working with the Audit Forge Loop to maintain high-quality codebases. This bio is intentionally long to test the text overflow issues in some mobile devices where the text might cut off or look messy if not handled with numberOfLines or proper wrapping.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Certifications</Text>
        <View style={styles.certItem}>
          <Text style={styles.certTitle}>Audit Forge Specialist</Text>
          <Text style={styles.certDate}>May 2026</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#4A90E2',
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  userRole: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
    color: '#333',
  },
  bioContainer: {
    // BUG: Missing flexWrap or width constraint for nested text if it was in a Row, 
    // but here I'll just make it look tight.
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 12,
  },
  bioText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    // No number of lines makes it go forever, but we'll see how it renders.
  },
  certItem: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEE',
    marginBottom: 10,
  },
  certTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  certDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});
