import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GenerateBanner } from '@/components/chat/generate-banner';
import { InputBar } from '@/components/chat/input-bar';
import { MessageBubble } from '@/components/chat/message-bubble';
import { RubricProgress } from '@/components/chat/rubric-progress';
import { SuggestionPanel } from '@/components/chat/suggestion-panel';
import { TypingIndicator } from '@/components/chat/typing-indicator';
import {
  EMPTY_RUBRIC,
  isRubricComplete,
  type ChatTurn,
  type RubricState,
} from '@/constants/schema';
import { colors, fontSize, radius, spacing, typography } from '@/constants/theme';
import { askNokta, TohumAiError } from '@/services/ai';

type Status = 'idle' | 'thinking' | 'error';

export default function Chat() {
  const { seed } = useLocalSearchParams<{ seed: string }>();

  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [rubric, setRubric] = useState<RubricState>(EMPTY_RUBRIC);

  const listRef = useRef<FlatList<ChatTurn>>(null);
  const bootRef = useRef(false);

  const runAi = useCallback(async (history: ChatTurn[]) => {
    setStatus('thinking');
    setErrorMsg(null);
    try {
      const response = await askNokta(history);
      const aiTurn: ChatTurn = {
        role: 'ai',
        content: response.message,
        suggestions: response.suggestions,
        rubric: response.rubric,
        ready: response.ready,
        idea_md: response.idea_md,
        at: Date.now(),
      };
      setTurns((prev) => [...prev, aiTurn]);
      setSuggestions(response.suggestions);
      setRubric(response.rubric);
      setStatus('idle');

      if (response.ready && response.idea_md) {
        router.replace({
          pathname: '/spec',
          params: { md: response.idea_md },
        });
      }
    } catch (err) {
      const message =
        err instanceof TohumAiError
          ? err.message
          : 'Beklenmedik bir hata oluştu.';
      setErrorMsg(message);
      setStatus('error');
    }
  }, []);

  // Seed'i sayfaya gelir gelmez ilk kullanıcı turuna çevir ve AI'ı tetikle.
  useEffect(() => {
    if (bootRef.current) return;
    if (!seed) return;
    bootRef.current = true;
    const initial: ChatTurn = {
      role: 'user',
      content: String(seed),
      at: Date.now(),
    };
    setTurns([initial]);
    void runAi([initial]);
  }, [seed, runAi]);

  // Her mesaj sonrası listeyi en alta kaydır.
  useEffect(() => {
    const id = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 80);
    return () => clearTimeout(id);
  }, [turns.length, status]);

  const handleSend = () => {
    const content = input.trim();
    if (!content || status === 'thinking') return;
    const next: ChatTurn = { role: 'user', content, at: Date.now() };
    const newHistory = [...turns, next];
    setTurns(newHistory);
    setInput('');
    setSuggestions([]);
    void runAi(newHistory);
  };

  const handlePickSuggestion = (suggestion: string) => {
    setInput((prev) => (prev ? `${prev} ${suggestion}` : suggestion));
    setSuggestions([]);
  };

  const handleGenerate = () => {
    if (status === 'thinking') return;
    const next: ChatTurn = {
      role: 'user',
      content: 'Evet, idea.md üret.',
      at: Date.now(),
    };
    const newHistory = [...turns, next];
    setTurns(newHistory);
    setSuggestions([]);
    void runAi(newHistory);
  };

  const handleRetry = () => {
    void runAi(turns);
  };

  const rubricComplete = isRubricComplete(rubric);
  const showGenerateBanner =
    rubricComplete && status === 'idle' && turns.length > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
        style={styles.root}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <Text style={styles.title}>Nokta Chat</Text>
          <View style={styles.headerRight} />
        </View>

        <RubricProgress rubric={rubric} />

        <FlatList
          ref={listRef}
          data={turns}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => (
            <MessageBubble role={item.role} text={item.content} />
          )}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={
            <View>
              {status === 'thinking' && <TypingIndicator />}
              {status === 'error' && errorMsg && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{errorMsg}</Text>
                  <Pressable onPress={handleRetry} style={styles.retryBtn}>
                    <Text style={styles.retryText}>Tekrar dene</Text>
                  </Pressable>
                </View>
              )}
            </View>
          }
        />

        {showGenerateBanner && <GenerateBanner onGenerate={handleGenerate} />}

        {suggestions.length > 0 && (
          <SuggestionPanel
            suggestions={suggestions}
            onPick={handlePickSuggestion}
            onDismiss={() => setSuggestions([])}
          />
        )}

        <InputBar
          value={input}
          onChangeText={setInput}
          onSend={handleSend}
          disabled={status === 'thinking'}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: fontSize.xl,
    color: colors.text,
  },
  title: {
    fontFamily: typography.headlineMedium,
    fontSize: fontSize.lg,
    color: colors.text,
    fontWeight: '600',
  },
  headerRight: { width: 36 },
  listContent: {
    paddingVertical: spacing.md,
    flexGrow: 1,
  },
  errorBox: {
    margin: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.danger,
    gap: spacing.md,
  },
  errorText: {
    fontFamily: typography.body,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  retryBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  retryText: {
    fontFamily: typography.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.text,
  },
});
