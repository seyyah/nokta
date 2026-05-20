import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Idea } from '../types';

interface Props {
  idea: Idea;
  onBack: () => void;
}

export const IdeaDetailScreen: React.FC<Props> = ({ idea, onBack }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Listeye Dön</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{idea.title}</Text>
        
        <View style={styles.metaContainer}>
          <Text style={styles.metaLabel}>Kategori:</Text>
          <Text style={styles.metaValue}>{idea.category}</Text>
        </View>
        
        <View style={styles.metaContainer}>
          <Text style={styles.metaLabel}>Durum:</Text>
          <Text style={styles.metaValue}>{idea.status}</Text>
        </View>

        <View style={styles.divider} />
        
        <Text style={styles.descriptionLabel}>Açıklama</Text>
        <Text style={styles.description}>{idea.description}</Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Destekle</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#212529',
  },
  metaContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  metaLabel: {
    width: 80,
    fontSize: 15,
    color: '#868e96',
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 15,
    color: '#495057',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 20,
  },
  descriptionLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#343a40',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#495057',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f5',
    backgroundColor: '#fff',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
