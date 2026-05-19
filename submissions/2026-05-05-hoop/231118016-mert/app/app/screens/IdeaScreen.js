import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

const IdeaScreen = ({ navigation }) => {
  const [idea, setIdea] = useState('');
  const [apiKey, setApiKey] = useState('');

  const handleContinue = () => {
    navigation.navigate('QuestionsScreen', { idea, apiKey });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Nokta</Text>
        <Text style={styles.subtitle}>Dot Capture</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>What is your idea?</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your idea"
            placeholderTextColor="#999"
            multiline
            numberOfLines={6}
            value={idea}
            onChangeText={setIdea}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Gemini API Key (Required for AI)</Text>
          <TextInput
            style={[styles.input, { minHeight: 50, fontSize: 14 }]}
            placeholder="AIzaSy..."
            placeholderTextColor="#999"
            secureTextEntry={true}
            value={apiKey}
            onChangeText={setApiKey}
          />
        </View>

        <TouchableOpacity 
          style={[styles.button, (!idea.trim() || !apiKey.trim()) && styles.buttonDisabled]} 
          onPress={handleContinue}
          disabled={!idea.trim() || !apiKey.trim()}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#1a1a2e',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e94560',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 150,
  },
  button: {
    backgroundColor: '#0f3460',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#0f3460',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#a2a8d3',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default IdeaScreen;
