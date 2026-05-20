import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { detectEscalationNeed } from './utils/escalation';
import EscalationReview from './components/EscalationReview';

export default function App() {
  const [step, setStep] = useState(1);
  const [idea, setIdea] = useState("");
  const [answers, setAnswers] = useState({
    q1: "",
    q2: "",
    q3: "",
    q4: ""
  });
  const [escalationState, setEscalationState] = useState(null);
  const [escalationTopic, setEscalationTopic] = useState(null);
  const [mentorFeedback, setMentorFeedback] = useState(null);

  const renderStep1 = () => (
    <View style={styles.card}>
      <Text style={styles.header}>NOKTA Spec Builder</Text>
      <Text style={styles.subtitle}>Pitch your raw idea below</Text>
      <TextInput
        style={styles.largeInput}
        multiline
        placeholder="e.g., An AI app that helps students manage their assignments and sends WhatsApp reminders..."
        placeholderTextColor="#9ca3af"
        value={idea}
        onChangeText={setIdea}
      />
      <TouchableOpacity 
        style={[styles.button, !idea.trim() && styles.buttonDisabled]} 
        disabled={!idea.trim()}
        onPress={() => setStep(2)}>
        <Text style={styles.buttonText}>Next: Clarify</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.card}>
      <Text style={styles.header}>Let's Clarify</Text>
      <Text style={styles.subtitle}>Answer these 4 questions to generate your spec.</Text>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.questionBlock}>
          <Text style={styles.questionText}>1. What specific problem does this solve?</Text>
          <TextInput
            style={styles.input}
            multiline
            placeholder="Problem..."
            placeholderTextColor="#9ca3af"
            value={answers.q1}
            onChangeText={(text) => setAnswers({...answers, q1: text})}
          />
        </View>

        <View style={styles.questionBlock}>
          <Text style={styles.questionText}>2. Who is the exact target user?</Text>
          <TextInput
            style={styles.input}
            multiline
            placeholder="Target User..."
            placeholderTextColor="#9ca3af"
            value={answers.q2}
            onChangeText={(text) => setAnswers({...answers, q2: text})}
          />
        </View>

        <View style={styles.questionBlock}>
          <Text style={styles.questionText}>3. What is the absolute minimum feature set?</Text>
          <TextInput
            style={styles.input}
            multiline
            placeholder="Core Features..."
            placeholderTextColor="#9ca3af"
            value={answers.q3}
            onChangeText={(text) => setAnswers({...answers, q3: text})}
          />
        </View>

        <View style={styles.questionBlock}>
          <Text style={styles.questionText}>4. What is the biggest constraint or risk?</Text>
          <TextInput
            style={styles.input}
            multiline
            placeholder="Constraints & Risks..."
            placeholderTextColor="#9ca3af"
            value={answers.q4}
            onChangeText={(text) => setAnswers({...answers, q4: text})}
          />
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep(1)}>
            <Text style={styles.secondaryButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.flexButton]} 
            onPress={() => {
              const allText = `${idea} ${answers.q1} ${answers.q2} ${answers.q3} ${answers.q4}`;
              const topic = detectEscalationNeed(allText);
              if (topic) {
                setEscalationTopic(topic);
                setEscalationState('suggested');
                setStep('review');
              } else {
                setStep(3);
              }
            }}>
            <Text style={styles.buttonText}>Generate Spec</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  const renderReview = () => (
    <EscalationReview 
      topic={escalationTopic}
      escalationState={escalationState}
      onAccept={() => setEscalationState('pending')}
      onDecline={() => {
        setEscalationState(null);
        setStep(3);
      }}
      onResolve={(feedback) => {
        setMentorFeedback(feedback);
        setEscalationState('resolved');
        setStep(3);
      }}
    />
  );

  const renderStep3 = () => (
    <View style={styles.card}>
      <Text style={styles.header}>One-Page Product Spec</Text>
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.specSection}>
          <Text style={styles.specLabel}>Elevator Pitch</Text>
          <Text style={styles.specValue}>{idea}</Text>
        </View>

        {mentorFeedback && (
          <View style={[styles.specSection, styles.mentorSection]}>
            <Text style={[styles.specLabel, styles.mentorLabel]}>Expert Mentor Feedback</Text>
            <Text style={styles.specValue}>{mentorFeedback}</Text>
          </View>
        )}

        <View style={styles.specSection}>
          <Text style={styles.specLabel}>Problem Statement</Text>
          <Text style={styles.specValue}>{answers.q1 || "Not specified"}</Text>
        </View>

        <View style={styles.specSection}>
          <Text style={styles.specLabel}>Target User</Text>
          <Text style={styles.specValue}>{answers.q2 || "Not specified"}</Text>
        </View>

        <View style={styles.specSection}>
          <Text style={styles.specLabel}>Core MVP Features</Text>
          <Text style={styles.specValue}>{answers.q3 || "Not specified"}</Text>
        </View>

        <View style={styles.specSection}>
          <Text style={styles.specLabel}>Constraints / Risks</Text>
          <Text style={styles.specValue}>{answers.q4 || "Not specified"}</Text>
        </View>

        <View style={styles.specSection}>
          <Text style={styles.specLabel}>Next Steps</Text>
          <Text style={styles.specValue}>Build a quick MVP using Expo and test with 5 users.</Text>
        </View>

        <TouchableOpacity 
          style={styles.button} 
          onPress={() => {
            setStep(1);
            setIdea("");
            setAnswers({q1: "", q2: "", q3: "", q4: ""});
            setEscalationState(null);
            setEscalationTopic(null);
            setMentorFeedback(null);
          }}>
          <Text style={styles.buttonText}>Start Over</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 'review' && renderReview()}
        {step === 3 && renderStep3()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6', // Light gray background
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    maxHeight: '95%',
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  largeInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1f2937',
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#1f2937',
    minHeight: 80,
    textAlignVertical: 'top',
    marginTop: 8,
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 12,
  },
  secondaryButtonText: {
    color: '#4b5563',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 16,
  },
  flexButton: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  questionBlock: {
    marginBottom: 20,
  },
  questionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  specSection: {
    marginBottom: 16,
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  specLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  specValue: {
    fontSize: 16,
    color: '#0f172a',
    lineHeight: 24,
  },
  mentorSection: {
    backgroundColor: '#ecfdf5',
    borderLeftColor: '#10b981',
  },
  mentorLabel: {
    color: '#047857',
  }
});
