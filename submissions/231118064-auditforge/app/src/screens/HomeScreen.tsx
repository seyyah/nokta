import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  onNavigate: (screen: 'IdeaList') => void;
}

export const HomeScreen: React.FC<Props> = ({ onNavigate }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ana Sayfa</Text>
      <Text style={styles.description}>
        Yeni fikirler keşfetmek ve topluluğun neler üzerinde çalıştığını görmek için fikir havuzuna göz atın.
      </Text>
      
      <TouchableOpacity style={styles.button} onPress={() => onNavigate('IdeaList')}>
        <Text style={styles.buttonText}>Fikirleri Gör</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#212529',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#495057',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#28a745',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
