import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  ScrollView, ActivityIndicator, SafeAreaView, StatusBar, 
  KeyboardAvoidingView, Platform 
} from 'react-native';

const MOCK_RESPONSE = {
  questions: [
    { 
      q: "What exact problem is being solved?", 
      a: "Founders often have sudden flashes of inspiration but struggle to articulate them in a structured way. This app translates brain dumps into actionable specs." 
    },
    { 
      q: "Who is the target user?", 
      a: "Early-stage startup founders, indie hackers, and product managers who need to quickly document ideas." 
    },
    { 
      q: "What is included and NOT included?", 
      a: "Included: Idea structuring and simple export. Excluded: Automated market research, UI design generation." 
    },
    { 
      q: "What are the technical constraints?", 
      a: "High reliance on LLM APIs (OpenAI/Anthropic) for accuracy, which incurs costs and processing time." 
    }
  ],
  spec: {
    productName: "Idea Refiner AI",
    problemStatement: "Founders and creators lose valuable insights because they lack a quick, structured way to document their raw thoughts before forgetting them.",
    targetUsers: "Indie hackers, early-stage founders, product managers, creative professionals.",
    solutionOverview: "An app that captures raw idea descriptions and uses specialized AI prompts to instantly format them into a clean, standardized one-page product specification.",
    coreFeatures: [
      "Quick text/voice capture with automatic transcription.",
      "Intelligent extraction of core problem & target audience.",
      "Automatic formatting into a PRD template.",
      "One-click export to Markdown/PDF."
    ],
    userFlow: "1. Open app -> 2. Record/Type idea -> 3. App processes -> 4. Present 1-page spec -> 5. Export.",
    techStack: "React Native (Frontend), Node.js (Proxy), OpenAI API",
    constraintsRisks: "API costs scaling with usage; potential inaccuracies in structuring very complex ideas.",
    successMetrics: "Ideas recorded per active user/week; Export conversion rate."
  },
  evaluation: {
    feasibility: "High",
    innovation: "Medium",
    slopScore: 15,
    justification: "The technical requirements rely on standard API integrations, making it highly feasible. It provides immediate workflow value without overpromising.",
    improvement: "Allow users to connect the app to GitHub or Jira to automatically convert the spec into project tickets."
  }
};

export default function App() {
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const generateSpec = () => {
    if (!idea.trim()) return;
    setLoading(true);
    setResult(null);
    
    // Simulate AI processing delay (2 seconds)
    setTimeout(() => {
      setResult(MOCK_RESPONSE);
      setLoading(false);
    }, 2000);
  };

  const renderQuestions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Engineering Questions</Text>
      {result.questions.map((item, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.questionText}>Q: {item.q}</Text>
          <Text style={styles.answerText}>A: {item.a}</Text>
        </View>
      ))}
    </View>
  );

  const renderSpec = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Product Specification</Text>
      <View style={styles.card}>
        <Text style={styles.specLabel}>Product Name</Text>
        <Text style={styles.specValue}>{result.spec.productName}</Text>
        
        <Text style={styles.specLabel}>Problem Statement</Text>
        <Text style={styles.specValue}>{result.spec.problemStatement}</Text>

        <Text style={styles.specLabel}>Target Users</Text>
        <Text style={styles.specValue}>{result.spec.targetUsers}</Text>

        <Text style={styles.specLabel}>Solution Overview</Text>
        <Text style={styles.specValue}>{result.spec.solutionOverview}</Text>

        <Text style={styles.specLabel}>Core Features</Text>
        {result.spec.coreFeatures.map((feat, i) => (
          <Text key={i} style={styles.specBullet}>• {feat}</Text>
        ))}

        <Text style={styles.specLabel}>User Flow</Text>
        <Text style={styles.specValue}>{result.spec.userFlow}</Text>

        <Text style={styles.specLabel}>Tech Stack</Text>
        <Text style={styles.specValue}>{result.spec.techStack}</Text>
      </View>
    </View>
  );

  const renderEvaluation = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Evaluation</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.evalLabel}>Feasibility:</Text>
          <View style={styles.badge}><Text style={styles.badgeText}>{result.evaluation.feasibility}</Text></View>
        </View>
        <View style={styles.row}>
          <Text style={styles.evalLabel}>Innovation Level:</Text>
          <View style={[styles.badge, styles.badgeMedium]}><Text style={styles.badgeText}>{result.evaluation.innovation}</Text></View>
        </View>
        <View style={styles.row}>
          <Text style={styles.evalLabel}>Slop Score (0-100):</Text>
          <View style={[styles.badge, styles.badgeLow]}><Text style={styles.badgeText}>{result.evaluation.slopScore}</Text></View>
        </View>
        
        <Text style={[styles.specLabel, {marginTop: 12}]}>Justification</Text>
        <Text style={styles.specValue}>{result.evaluation.justification}</Text>

        <Text style={styles.specLabel}>Critical Improvement</Text>
        <Text style={styles.specValue}>{result.evaluation.improvement}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Idea Refiner</Text>
          <Text style={styles.headerSubtitle}>Raw Idea → AI Spec Generator</Text>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          
          <Text style={styles.label}>Enter your raw idea:</Text>
          <TextInput
            style={styles.input}
            multiline
            placeholder="e.g., I want an app that listens to my voice and makes a product spec..."
            placeholderTextColor="#6b7280"
            value={idea}
            onChangeText={setIdea}
            textAlignVertical="top"
          />

          <TouchableOpacity 
            style={[styles.button, (!idea.trim() || loading) && styles.buttonDisabled]} 
            onPress={generateSpec}
            disabled={!idea.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Generate AI Spec</Text>
            )}
          </TouchableOpacity>

          {result && (
            <View style={styles.resultsContainer}>
              {renderQuestions()}
              {renderSpec()}
              {renderEvaluation()}
            </View>
          )}
          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827', // dark mode background
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: '#1f2937',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 50,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e5e7eb',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 12,
    color: '#ffffff',
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#4b5563',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultsContainer: {
    marginTop: 10,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    paddingBottom: 8,
  },
  card: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  questionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#818cf8',
    marginBottom: 6,
  },
  answerText: {
    fontSize: 15,
    color: '#d1d5db',
    lineHeight: 22,
  },
  specLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9ca3af',
    textTransform: 'uppercase',
    marginTop: 12,
    marginBottom: 4,
  },
  specValue: {
    fontSize: 16,
    color: '#f3f4f6',
    lineHeight: 24,
  },
  specBullet: {
    fontSize: 16,
    color: '#f3f4f6',
    lineHeight: 24,
    marginLeft: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  evalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e5e7eb',
  },
  badge: {
    backgroundColor: '#059669', // green
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  badgeMedium: {
    backgroundColor: '#d97706', // orange
  },
  badgeLow: {
    backgroundColor: '#2563eb', // blue for slop score
  },
  badgeText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  }
});
