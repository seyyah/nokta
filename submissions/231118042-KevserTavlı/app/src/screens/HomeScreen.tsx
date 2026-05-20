import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';

const DATA = [
  { id: '1', title: 'Finish Audit Forge Challenge', status: 'In Progress' },
  { id: '2', title: 'Integrate AuditWidget', status: 'Done' },
  { id: '3', title: 'Document Bugs', status: 'To Do' },
  { id: '4', title: 'Submit PR', status: 'To Do' },
];

export const HomeScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Welcome back, Auditor!</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <View style={styles.buttonRow}>
          {/* BUG #1: Broken Save Button - Missing onPress */}
          <TouchableOpacity style={[styles.button, { backgroundColor: '#4A90E2' }]}>
            <Text style={styles.buttonText}>Save Report</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { backgroundColor: '#50E3C2' }]}>
            <Text style={styles.buttonText}>New Audit</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Upcoming Tasks</Text>
      {DATA.map((item) => (
        <View key={item.id} style={styles.taskItem}>
          <View>
            <Text style={styles.taskTitle}>{item.title}</Text>
            <Text style={styles.taskStatus}>{item.status}</Text>
          </View>
          <View style={styles.dot} />
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
    color: '#333',
  },
  taskItem: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  taskStatus: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5A5F',
  },
});
