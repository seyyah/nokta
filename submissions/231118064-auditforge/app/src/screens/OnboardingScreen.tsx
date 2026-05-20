import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  onNavigate: (screen: 'Home') => void;
}

export const OnboardingScreen: React.FC<Props> = ({ onNavigate }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nokta'ya Hoş Geldiniz</Text>
      <Text style={styles.subtitle}>Fikirlerinizi keşfedin, geliştirin ve paylaşın.</Text>
      
      <TouchableOpacity style={styles.button} onPress={() => onNavigate('Home')}>
        <Text style={styles.buttonText}>Başla</Text>
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
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
