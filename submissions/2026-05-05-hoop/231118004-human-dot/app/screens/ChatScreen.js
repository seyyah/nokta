import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GlowDot from '../components/GlowDot';
import { colors } from '../constants/colors';
import { generateQuestionsStream } from '../services/geminiService';

// Progress indicator
function ProgressDots({ total, current }) {
  return (
    <View style={styles.progressRow}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.progressDot,
            i < current ? styles.progressDotFilled : styles.progressDotEmpty,
          ]}
        />
      ))}
    </View>
  );
}

// AI bubble with streaming cursor
function AiBubble({ text, isStreaming = false }) {
  const slideAnim = useRef(new Animated.Value(-40)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (!isStreaming) return;
    const interval = setInterval(() => setCursorVisible((v) => !v), 500);
    return () => clearInterval(interval);
  }, [isStreaming]);

  return (
    <Animated.View
      style={[styles.aiBubble, { transform: [{ translateX: slideAnim }], opacity: opacityAnim }]}
    >
      <Text style={styles.aiBubbleText}>
        {text}
        {isStreaming && <Text style={{ color: '#7C6FFF' }}>{cursorVisible ? '▌' : ' '}</Text>}
      </Text>
    </Animated.View>
  );
}

// User bubble
function UserBubble({ text }) {
  const slideAnim = useRef(new Animated.Value(40)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[styles.userBubble, { transform: [{ translateX: slideAnim }], opacity: opacityAnim }]}
    >
      <Text style={styles.userBubbleText}>{text}</Text>
    </Animated.View>
  );
}

export default function ChatScreen({ navigation, route }) {
  const { idea } = route.params;
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [streamingText, setStreamingText] = useState(''); // raw streaming buffer
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  const currentQ = answers.length;
  const isComplete = questions.length > 0 && answers.length >= questions.length;

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [answers, questions, streamingText]);

  const fetchQuestions = async () => {
    try {
      setLoadingQuestions(true);
      setIsStreaming(true);
      setStreamingText('');

      const data = await generateQuestionsStream(idea, (chunk) => {
        setStreamingText((prev) => prev + chunk);
      });

      setQuestions(data.questions);
      setStreamingText('');
    } catch (e) {
      setError('Sorular yüklenemedi. Tekrar dene.');
    } finally {
      setLoadingQuestions(false);
      setIsStreaming(false);
    }
  };

  const handleAnswer = () => {
    if (!currentInput.trim() || isComplete) return;
    setAnswers((prev) => [...prev, currentInput.trim()]);
    setCurrentInput('');
  };

  const handleGoToSpec = () => {
    const qaData = questions.map((q, i) => ({
      dimension: q.dimension,
      question: q.text,
      answer: answers[i] || '',
    }));
    navigation.navigate('Spec', { idea, questionsAndAnswers: qaData });
  };

  const dotSize = Math.round(12 + (answers.length / 5) * 10);
  const dotPhase = isComplete ? 'complete' : answers.length > 0 ? 'active' : 'idle';

  return (
    <LinearGradient colors={['#080814', '#0D0B24', '#080814']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Geri</Text>
        </TouchableOpacity>
        <GlowDot size={dotSize} phase={dotPhase} />
      </View>

      {questions.length > 0 && (
        <View style={styles.progressWrap}>
          <ProgressDots total={questions.length} current={answers.length} />
          <Text style={styles.progressLabel}>
            {isComplete ? 'Tüm sorular cevaplandı ✦' : `${answers.length}/${questions.length} soru`}
          </Text>
        </View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.chatArea}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.ideaRecap}>
            <Text style={styles.ideaLabel}>Fikrin</Text>
            <Text style={styles.ideaText}>"{idea}"</Text>
          </View>

          {/* Streaming indicator while loading */}
          {loadingQuestions && (
            <View style={styles.loadingWrap}>
              {streamingText ? (
                <AiBubble text="Sorular hazırlanıyor..." isStreaming={true} />
              ) : (
                <>
                  <ActivityIndicator color={colors.dotIdle} />
                  <Text style={styles.loadingText}>AI bağlanıyor...</Text>
                </>
              )}
            </View>
          )}

          {error && <Text style={styles.errorText}>{error}</Text>}

          {questions.map((q, i) => (
            <View key={q.id}>
              <View style={styles.dimensionRow}>
                <View style={styles.dimensionBadge}>
                  <Text style={styles.dimensionText}>{q.dimension}</Text>
                </View>
              </View>
              <AiBubble text={q.text} />
              {answers[i] && <UserBubble text={answers[i]} />}
            </View>
          ))}
        </ScrollView>

        {!loadingQuestions && !error && (
          isComplete ? (
            <TouchableOpacity style={styles.ctaBtn} onPress={handleGoToSpec} activeOpacity={0.8}>
              <Text style={styles.ctaBtnText}>Spec'i Üret ✦</Text>
            </TouchableOpacity>
          ) : (
            questions.length > 0 && (
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Cevapla..."
                  placeholderTextColor={colors.textDim}
                  value={currentInput}
                  onChangeText={setCurrentInput}
                  multiline
                  returnKeyType="send"
                  onSubmitEditing={handleAnswer}
                />
                <TouchableOpacity
                  style={[styles.sendBtn, !currentInput.trim() && styles.sendBtnDisabled]}
                  onPress={handleAnswer}
                  disabled={!currentInput.trim()}
                >
                  <Text style={styles.sendBtnText}>→</Text>
                </TouchableOpacity>
              </View>
            )
          )
        )}
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backBtn: { padding: 8 },
  backText: { color: colors.textMuted, fontSize: 14 },
  progressWrap: { alignItems: 'center', paddingVertical: 8 },
  progressRow: { flexDirection: 'row', gap: 8 },
  progressDot: { width: 10, height: 10, borderRadius: 5 },
  progressDotFilled: { backgroundColor: colors.dotIdle },
  progressDotEmpty: { backgroundColor: 'rgba(255,255,255,0.12)' },
  progressLabel: { color: colors.textMuted, fontSize: 12, marginTop: 6 },
  chatArea: { flex: 1 },
  chatContent: { padding: 20, paddingBottom: 10 },
  ideaRecap: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
  },
  ideaLabel: { color: colors.textMuted, fontSize: 11, letterSpacing: 0.5, marginBottom: 4 },
  ideaText: { color: colors.textMuted, fontSize: 14, fontStyle: 'italic', lineHeight: 20 },
  loadingWrap: { alignItems: 'center', marginTop: 20, gap: 10 },
  loadingText: { color: colors.textMuted, fontSize: 14 },
  errorText: { color: colors.error, textAlign: 'center', marginTop: 20 },
  dimensionRow: { flexDirection: 'row', marginBottom: 6, marginTop: 14 },
  dimensionBadge: {
    backgroundColor: 'rgba(124,111,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(124,111,255,0.4)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  dimensionText: { color: '#7C6FFF', fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    borderRadius: 14,
    borderTopLeftRadius: 4,
    padding: 14,
    maxWidth: '85%',
    marginBottom: 8,
  },
  aiBubbleText: { color: colors.text, fontSize: 15, lineHeight: 22 },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(110,231,183,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(110,231,183,0.25)',
    borderRadius: 14,
    borderTopRightRadius: 4,
    padding: 14,
    maxWidth: '85%',
    marginBottom: 8,
  },
  userBubbleText: { color: colors.accent, fontSize: 15, lineHeight: 22 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  input: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 15,
    maxHeight: 120,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: 'rgba(110,231,183,0.25)' },
  sendBtnText: { color: '#080814', fontSize: 20, fontWeight: '700' },
  ctaBtn: {
    margin: 16,
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaBtnText: { color: '#080814', fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
});
