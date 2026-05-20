import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { callGeminiAPI } from '../utils/geminiApi';

const QuestionsScreen = ({ route, navigation }) => {
  const { idea, apiKey } = route.params || {};

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    generateQuestions();
  }, []);

  const generateQuestions = async () => {
    setLoading(true);
    setError('');
    
    const prompt = `I have this software idea: "${idea}". 
Please act as an expert technical product manager. Generate EXACTLY 4 highly specific engineering questions directed at the user about the Problem, Target User, Scope, and Constraint to evaluate its feasibility. 
Return the response STRICTLY as a JSON array where each object has a 'key' (string: 'problem', 'user', 'scope', 'constraint'), 'label' (string: 'Problem', 'Target User', 'Scope', 'Constraint'), and a 'desc' (string: the specific engineering question tailored to the idea). 
Do NOT enclose the JSON in markdown blocks like \`\`\`json. Return only the raw JSON array string.`;

    try {
      const responseText = await callGeminiAPI(prompt, apiKey);
      // Clean up markdown syntax if AI accidentally adds it
      const cleanJsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const generatedQuestions = JSON.parse(cleanJsonStr);
      
      setQuestions(generatedQuestions);
      
      // Initialize answer states dynamically
      const initialAnswers = {};
      generatedQuestions.forEach(q => {
        initialAnswers[q.key] = '';
      });
      setAnswers(initialAnswers);
      
    } catch (err) {
      console.error(err);
      setError('Failed to generate AI questions. Please check your API key or try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = () => {
    navigation.navigate('SpecScreen', { idea, apiKey, answers, questions });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#e94560" />
        <Text style={styles.loadingText}>AI is analyzing your idea...</Text>
        <Text style={styles.loadingSubText}>Generating targeted engineering questions</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={generateQuestions}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.headerTitle}>Define Your Idea</Text>
        <Text style={styles.headerSubtitle}>Answer the AI-generated questions</Text>
        
        {questions.map((q) => (
          <View key={q.key} style={styles.inputBlock}>
            <Text style={styles.label}>{q.label}</Text>
            <Text style={styles.desc}>{q.desc}</Text>
            <TextInput
              style={styles.input}
              placeholder={`Enter details about the ${q.label.toLowerCase()}`}
              placeholderTextColor="#aaa"
              multiline
              value={answers[q.key] || ''}
              onChangeText={(text) => handleChange(q.key, text)}
            />
          </View>
        ))}

        <TouchableOpacity style={styles.button} onPress={handleGenerate}>
          <Text style={styles.buttonText}>Generate Specification</Text>
        </TouchableOpacity>
        
        <View style={{height: 40}} /> 
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollContainer: {
    padding: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e94560',
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginTop: 20,
  },
  loadingSubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputBlock: {
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  desc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#333',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#0f3460',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#0f3460',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default QuestionsScreen;
