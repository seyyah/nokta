import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';

export default function EscalationReview({ 
  topic, 
  escalationState, 
  onAccept, 
  onDecline, 
  onResolve 
}) {
  if (escalationState === 'suggested') {
    return (
      <View style={styles.card}>
        <Text style={styles.header}>Expert Review Suggested</Text>
        <Text style={styles.subtitle}>
          We noticed your idea involves the complex domain of <Text style={styles.highlight}>"{topic}"</Text>.
        </Text>
        <Text style={styles.description}>
          Would you like to request an optional review from an expert mentor before generating your final spec? This helps ensure compliance, feasibility, and quality.
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.secondaryButton} onPress={onDecline}>
            <Text style={styles.secondaryButtonText}>No, skip review</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.flexButton]} onPress={onAccept}>
            <Text style={styles.buttonText}>Yes, request expert</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (escalationState === 'pending') {
    return (
      <View style={styles.card}>
        <Text style={styles.header}>Waiting for Expert</Text>
        <Text style={styles.subtitle}>
          Your request regarding "{topic}" is currently in the queue.
        </Text>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>A mentor will review your spec soon...</Text>
        </View>

        <View style={styles.mockControls}>
          <Text style={styles.mockLabel}>[Developer / Testing Controls]</Text>
          <TouchableOpacity 
            style={[styles.button, styles.mockButton]} 
            onPress={() => onResolve("This idea looks solid, but make sure you strictly follow the regulatory requirements for " + topic + ". Consider starting with a smaller compliance sandbox.")}
          >
            <Text style={styles.buttonText}>Simulate Expert Approval</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={onDecline}>
            <Text style={styles.secondaryButtonText}>Cancel Request</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginVertical: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  highlight: {
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  description: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  flexButton: {
    flex: 1,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 12,
  },
  secondaryButtonText: {
    color: '#4b5563',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 15,
  },
  mockControls: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
  },
  mockLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  mockButton: {
    backgroundColor: '#10b981', // green for success
    width: '100%',
    marginBottom: 12,
  }
});
