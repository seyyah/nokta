import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Idea } from '../types';
import { IDEAS } from '../data/ideas';

interface Props {
  onNavigate: (screen: 'IdeaDetail', params: { idea: Idea }) => void;
  onBack: () => void;
}

export const IdeaListScreen: React.FC<Props> = ({ onNavigate, onBack }) => {
  
  const renderItem = ({ item }: { item: Idea }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => onNavigate('IdeaDetail', { idea: item })}
    >
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.badgeContainer}>
        <View style={styles.categoryBadge}>
          <Text style={styles.badgeText}>{item.category}</Text>
        </View>
        <View style={[styles.statusBadge, item.status === 'Aktif' ? styles.statusActive : styles.statusDone]}>
          <Text style={styles.badgeText}>{item.status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fikirler</Text>
        <View style={{ width: 60 }} />
      </View>
      
      <FlatList
        data={IDEAS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f3f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#212529',
  },
  cardDescription: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: '#e7f5ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusActive: {
    backgroundColor: '#d3f9d8',
  },
  statusDone: {
    backgroundColor: '#f1f3f5',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#495057',
  },
});
