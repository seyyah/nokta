import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import ScoreCard from '../components/ScoreCard';
import MissingFields from '../components/MissingFields';
import { callGeminiAPI } from '../utils/geminiApi';

const SpecScreen = ({ route, navigation }) => {
  const { idea, apiKey, answers, questions } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [specData, setSpecData] = useState({ score: 0, missingFields: [], specSections: [] });

  useEffect(() => {
    generateSpecification();
  }, []);

  const generateSpecification = async () => {
    setLoading(true);
    setError('');

    const formattedQnA = questions.map(q => `Q: ${q.desc}\nA: ${answers[q.key] || 'No answer provided'}`).join('\n\n');

    const prompt = `Here is a software idea: "${idea}".
Here are the technical engineering questions asked and the user's answers:
${formattedQnA}

Based on this information, act as an expert technical Product Manager. Please analyze the feasibility and depth of the idea.
Provide:
1. A 'score' between 0 and 100 based on the quality and completeness of the user's answers.
2. A 'missingFields' array of short string descriptions pointing out what is vague or entirely missing.
3. A 'specSections' array containing the final 1-page Product Specification. Each section needs a 'title' and 'content' (paragraph length).

Return the result STRICTLY as a raw JSON object. Do NOT wrap it in \`\`\`json markdown blocks.
Example format:
{
  "score": 75,
  "missingFields": ["Monetization strategy", "Security constraints"],
  "specSections": [
    {"title": "Overview", "content": "The app is a..."},
    {"title": "Target Audience", "content": "Aimed at..."}
  ]
}`;

    try {
      const responseText = await callGeminiAPI(prompt, apiKey);
      const cleanJsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const generatedSpec = JSON.parse(cleanJsonStr);
      
      setSpecData(generatedSpec);
    } catch (err) {
      console.error(err);
      setError('Failed to generate specification. The AI returned an invalid format or API request failed.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0f3460" />
        <Text style={styles.loadingText}>Synthesizing your Specification...</Text>
        <Text style={styles.loadingSubText}>AI is calculating readiness score and generating the PRD</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={generateSpecification}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Specification</Text>
        <Text style={styles.headerSubtitle}>Generated directly by Gemini</Text>
      </View>

      <ScoreCard score={specData.score || 0} />
      <MissingFields fields={specData.missingFields || []} />

      <View style={styles.specContainer}>
        <Text style={styles.specTitleIntro}>Original Idea:</Text>
        <Text style={styles.specTextIntro}>{idea || 'No idea provided.'}</Text>

        <View style={styles.divider} />

        {(specData.specSections || []).map((section, index) => (
          <View key={index} style={styles.sectionBlock}>
            <Text style={styles.specTitle}>{section.title}</Text>
            <Text style={styles.specText}>{section.content}</Text>
          </View>
        ))}
      </View>
      
      {/* HITL — Uzman İncelemesi Butonu */}
      <TouchableOpacity
        style={styles.expertButton}
        onPress={() =>
          navigation.navigate('ExpertScreen', {
            idea,
            score: specData.score || 0,
            specSections: specData.specSections || [],
          })
        }
      >
        <Text style={styles.expertButtonText}>👨‍⚖️  Uzmana Gönder (HITL)</Text>
        <Text style={styles.expertButtonSub}>Kıdemli danışman spec'ini incelesin</Text>
      </TouchableOpacity>

      <View style={{height: 40}} />
    </ScrollView>
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
  header: {
    marginBottom: 10,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8a2be2',
    marginTop: 5,
    fontWeight: '600',
    backgroundColor: '#f0e6ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    overflow: 'hidden',
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
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#0f3460',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  specContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  specTitleIntro: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 5,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  specTextIntro: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 15,
  },
  sectionBlock: {
    marginBottom: 15,
  },
  specTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f3460',
    marginBottom: 6,
  },
  specText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 24,
  },
  expertButton: {
    backgroundColor: '#0f3460',
    borderRadius: 12,
    padding: 18,
    marginTop: 12,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#0f3460',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  expertButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  expertButtonSub: {
    color: '#a0b4d0',
    fontSize: 12,
    marginTop: 2,
  },
});

export default SpecScreen;
