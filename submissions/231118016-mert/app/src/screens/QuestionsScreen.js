import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { callGeminiAPI } from '../utils/geminiApi';
import AvatarWidget from '../components/AvatarWidget';
import VoiceWidget from '../components/VoiceWidget';

const QuestionsScreen = ({ route, navigation }) => {
  const { idea, apiKey } = route.params || {};

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [speaking, setSpeaking] = useState(false);
  
  // Voice Recording States
  const [recording, setRecording] = useState(null);
  const [activeQuestionKey, setActiveQuestionKey] = useState(null);

  useEffect(() => {
    generateQuestions();
    return () => {
      window.speechSynthesis?.cancel();
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, []);

  const speakQuestions = (generatedQuestions) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = `Fikrini inceledim. Sana ${generatedQuestions.length} sorum olacak. Lütfen detaylıca cevapla. İstersen klavye ile istersen sesli olarak yanıtlayabilirsin.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'tr-TR';
      utterance.pitch = 1.1;
      utterance.rate = 1.0;
      
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const generateQuestions = async () => {
    setLoading(true);
    setError('');
    
    const prompt = `I have this software idea: "${idea}". 
Please act as an expert technical product manager. Generate EXACTLY 4 highly specific engineering questions directed at the user about the Problem, Target User, Scope, and Constraint to evaluate its feasibility. 
Return the response STRICTLY as a JSON array where each object has a 'key' (string: 'problem', 'user', 'scope', 'constraint'), 'label' (string: 'Problem', 'Target User', 'Scope', 'Constraint'), and a 'desc' (string: the specific engineering question tailored to the idea in Turkish). 
Do NOT enclose the JSON in markdown blocks like \`\`\`json. Return only the raw JSON array string. Make sure the questions are in Turkish.`;

    try {
      const responseText = await callGeminiAPI(prompt, apiKey);
      const cleanJsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const generatedQuestions = JSON.parse(cleanJsonStr);
      
      setQuestions(generatedQuestions);
      
      const initialAnswers = {};
      generatedQuestions.forEach(q => {
        initialAnswers[q.key] = '';
      });
      setAnswers(initialAnswers);
      
      // Speak the intro when questions are ready
      speakQuestions(generatedQuestions);
      
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

  // Audio Recording Toggle
  const toggleRecording = async (qKey) => {
    try {
      if (recording && activeQuestionKey === qKey) {
        // Stop recording
        await recording.stopAndUnloadAsync();
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
        setRecording(null);
        setActiveQuestionKey(null);
        
        // Mock Transcription logic
        const currentAnswer = answers[qKey] || '';
        handleChange(qKey, currentAnswer + (currentAnswer ? ' ' : '') + '[Sesli Yanıt Alındı: Fikir gayet detaylı bir şekilde açıklandı.]');
      } else {
        // Stop any existing recording
        if (recording) {
          await recording.stopAndUnloadAsync();
        }
        
        // Start recording
        const perm = await Audio.requestPermissionsAsync();
        if (perm.status === 'granted') {
          await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
          const { recording: newRec } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
          setRecording(newRec);
          setActiveQuestionKey(qKey);
        }
      }
    } catch (err) {
      console.error('Kayıt hatası:', err);
    }
  };

  const handleGenerate = () => {
    window.speechSynthesis?.cancel();
    if (recording) recording.stopAndUnloadAsync();
    
    // Pass failCount=0 initially to SpecScreen
    navigation.navigate('SpecScreen', { idea, apiKey, answers, questions, failCount: 0 });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#e94560" />
        <Text style={styles.loadingText}>Fikrin Analiz Ediliyor...</Text>
        <Text style={styles.loadingSubText}>Nokta AI sana özel mühendislik soruları hazırlıyor</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={generateQuestions}>
          <Text style={styles.buttonText}>Tekrar Dene</Text>
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
        <View style={styles.headerRow}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Fikrini Tanımla</Text>
            <Text style={styles.headerSubtitle}>Yapay zekanın sorularını cevapla</Text>
          </View>
          <View style={styles.avatarWrapper}>
            <AvatarWidget speaking={speaking} width={80} height={80} />
          </View>
        </View>
        
        {questions.map((q) => (
          <View key={q.key} style={styles.inputBlock}>
            <Text style={styles.label}>{q.label}</Text>
            <Text style={styles.desc}>{q.desc}</Text>
            
            <VoiceWidget 
              isRecording={activeQuestionKey === q.key} 
              onToggleRecord={() => toggleRecording(q.key)} 
            />
            
            <TextInput
              style={styles.input}
              placeholder={`Lütfen ${q.label.toLowerCase()} hakkında detay verin veya sesinizi kaydedin...`}
              placeholderTextColor="#aaa"
              multiline
              value={answers[q.key] || ''}
              onChangeText={(text) => handleChange(q.key, text)}
              onFocus={() => { if (recording) toggleRecording(activeQuestionKey); }}
            />
          </View>
        ))}

        <TouchableOpacity style={styles.button} onPress={handleGenerate}>
          <Text style={styles.buttonText}>Cevapları Gönder ve Spec Üret</Text>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTextContainer: {
    flex: 1,
  },
  avatarWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#3b82f6',
    backgroundColor: '#1e293b',
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
    marginTop: 12,
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
