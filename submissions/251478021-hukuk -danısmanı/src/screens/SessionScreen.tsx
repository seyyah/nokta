import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ExpertModal } from '../components/ExpertModal';
import { ENGINEERING_QUESTIONS } from '../flow/questions';
import { shouldSuggestExpert } from '../flow/escalation';
import type { EngineeringQuestion } from '../flow/questions';
import { colors } from '../theme';
import {
  buildAcknowledgmentSnippet,
  buildAnswersBulletSummary,
  coachOnUserTurn,
  getOfflineClarificationReply,
  isLikelyClarificationQuestion,
  isOpenAIConfigured,
  type CoachResult,
} from '../lib/assistant';

type ChatMsg = {
  id: string;
  kind: 'text' | 'escalation_hint';
  role: 'assistant' | 'user';
  text: string;
};

type SessionAnswers = {
  idea: string;
  problem: string;
  user_segment: string;
  scope: string;
  constraints: string;
  success: string;
};

const emptyAnswers = (): SessionAnswers => ({
  idea: '',
  problem: '',
  user_segment: '',
  scope: '',
  constraints: '',
  success: '',
});

function specFromAnswers(a: SessionAnswers): string {
  return [
    '## Hukuki brif özeti (Nokta)',
    '*Bağlayıcı hukuki görüş değildir; uzman avukata dosya tesliminde yardımcı çerçeve.*',
    '',
    '### Durum özeti',
    a.idea || '—',
    '',
    '### Olay / ihtiyaç',
    a.problem || '—',
    '',
    '### Taraflar ve sıfat',
    a.user_segment || '—',
    '',
    '### Süreç ve aşama',
    a.scope || '—',
    '',
    '### Deliller ve riskler',
    a.constraints || '—',
    '',
    '### Talep ve hedef',
    a.success || '—',
    '',
    '### Karmaşıklık notu',
    'Ceza, velayet, ciddi tazminat, sıkışık süre veya karmaşık olaylarda mutlaka baroya kayıtlı uzman avukattan görüş alınır.',
  ].join('\n');
}

type Phase = 'chat' | 'spec';

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export type SessionScreenProps = {
  onResetToHome: () => void;
};

export function SessionScreen({ onResetToHome }: SessionScreenProps) {
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [phase, setPhase] = useState<Phase>('chat');
  const [answers, setAnswers] = useState<SessionAnswers>(emptyAnswers);
  const [messages, setMessages] = useState<ChatMsg[]>(() => [
    {
      id: uid(),
      kind: 'text',
      role: 'assistant',
      text:
        'Merhaba, ben Nokta asistanıyım. Basit hukuk kavramı ve süreç sorularına genel bilgilendirme yaparım. Ceza sıfatı, velayet, ciddi tazminat veya karmaşık dosyalarda doğrudan uzman avukata yönlendiririm ve bağlayıcı hukuki görüş veya dilekçe metni vermem. Önce olayını birkaç cümleyle özetle.',
    },
  ]);
  const [input, setInput] = useState('');
  const [humanTakeover, setHumanTakeover] = useState(false);
  const [longForm, setLongForm] = useState('');
  const [expertOpen, setExpertOpen] = useState(false);
  const [qIndex, setQIndex] = useState(-1);
  const [busy, setBusy] = useState(false);
  const listRef = useRef<FlatList<ChatMsg>>(null);

  useEffect(() => {
    const show =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hide =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const s = Keyboard.addListener(show, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const h = Keyboard.addListener(hide, () => setKeyboardHeight(0));
    return () => {
      s.remove();
      h.remove();
    };
  }, []);

  const scrollChatToEnd = useCallback(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }, []);

  const awaitingIdea = qIndex === -1;

  const lastAssistantHint = useMemo(() => {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    return lastUser?.text?.slice(0, 200) ?? '';
  }, [messages]);

  const appendMessages = useCallback((next: ChatMsg[]) => {
    setMessages((prev) => [...prev, ...next]);
  }, []);

  const askQuestion = useCallback(
    (q: EngineeringQuestion) => {
      const hint = q.hint ? `\n\n(${q.hint})` : '';
      appendMessages([
        {
          id: uid(),
          kind: 'text',
          role: 'assistant',
          text: q.prompt + hint,
        },
      ]);
    },
    [appendMessages],
  );

  const finishSession = useCallback(
    (final: SessionAnswers) => {
      appendMessages([
        {
          id: uid(),
          kind: 'text',
          role: 'assistant',
          text:
            'Brif tamam. Aşağıda avukatla paylaşabileceğin tek sayfa özet çerçevesi var. Bağlayıcı hukuk görüşü değildir; riskli konularda mutlaka uzman avukata danış.',
        },
      ]);
      setAnswers(final);
      setPhase('spec');
    },
    [appendMessages],
  );

  const runSend = useCallback(async () => {
    const raw = humanTakeover ? longForm.trim() : input.trim();
    if (!raw || busy) return;

    if (humanTakeover) {
      appendMessages([
        { id: uid(), kind: 'text', role: 'user', text: raw },
        {
          id: uid(),
          kind: 'text',
          role: 'assistant',
          text:
            'Notu aldım; brif sorularına geri dönüyorum. Uzun anlatımı özet brife yansıtacağım.',
        },
      ]);
      setLongForm('');
      setHumanTakeover(false);
      if (qIndex < 0) {
        setAnswers((a) => ({ ...a, idea: raw }));
        setQIndex(0);
        askQuestion(ENGINEERING_QUESTIONS[0]);
        return;
      }
      const currentQ = ENGINEERING_QUESTIONS[qIndex];
      if (currentQ) askQuestion(currentQ);
      return;
    }

    setInput('');

    const clarification =
      !humanTakeover && isLikelyClarificationQuestion(raw);

    if (clarification) {
      appendMessages([{ id: uid(), kind: 'text', role: 'user', text: raw }]);
      setBusy(true);
      const ctxQuestion = awaitingIdea
        ? null
        : ENGINEERING_QUESTIONS[qIndex] ?? null;
      let ai: CoachResult = { reply: null };
      try {
        if (isOpenAIConfigured()) {
          ai = await coachOnUserTurn({
            awaitingIdea,
            currentQuestionId: ctxQuestion?.id ?? null,
            currentQuestionPrompt: ctxQuestion?.prompt ?? null,
            ideaSummary: answers.idea,
            collectedSoFarLines: buildAnswersBulletSummary(answers),
            userMessage: raw,
            willAdvanceFlow: false,
            isLikelyPureQuestionOrHelp: true,
          });
        }
      } finally {
        setBusy(false);
      }
      const text =
        ai.reply ??
        getOfflineClarificationReply({
          awaitingIdea,
          question: ctxQuestion,
          ideaSummary: answers.idea,
          userMessage: raw,
        });
      const toAppend: ChatMsg[] = [
        { id: uid(), kind: 'text', role: 'assistant', text },
      ];
      /* if (isOpenAIConfigured() && !ai.reply && ai.httpError) {
        toAppend.push({
          id: uid(),
          kind: 'text',
          role: 'assistant',
          text: `[API uyarısı: ${ai.httpError}]`,
        });
      } */
      appendMessages(toAppend);
      return;
    }

    appendMessages([{ id: uid(), kind: 'text', role: 'user', text: raw }]);

    if (awaitingIdea) {
      const nextAnswers: SessionAnswers = { ...answers, idea: raw };
      setAnswers(nextAnswers);
      setQIndex(0);
      let opener: string;
      if (isOpenAIConfigured()) {
        setBusy(true);
        let ai: CoachResult = { reply: null };
        try {
          ai = await coachOnUserTurn({
            awaitingIdea: false,
            currentQuestionId: ENGINEERING_QUESTIONS[0].id,
            currentQuestionPrompt: ENGINEERING_QUESTIONS[0].prompt,
            ideaSummary: raw,
            collectedSoFarLines: buildAnswersBulletSummary(nextAnswers),
            userMessage: raw,
            willAdvanceFlow: true,
            isLikelyPureQuestionOrHelp: false,
            flowHint: 'initial_idea',
          });
        } finally {
          setBusy(false);
        }
        const ack = buildAcknowledgmentSnippet(raw);
        opener = ai.reply ?? `Anladım: ${ack}\n\nSıradaki soru:`;
        const openMsgs: ChatMsg[] = [{ id: uid(), kind: 'text', role: 'assistant', text: opener }];
        if (!ai.reply && ai.httpError) {
          openMsgs.push({
            id: uid(),
            kind: 'text',
            role: 'assistant',
            text: `[API uyarısı: ${ai.httpError}]`,
          });
        }
        appendMessages(openMsgs);
      } else {
        const ack = buildAcknowledgmentSnippet(raw);
        appendMessages([
          {
            id: uid(),
            kind: 'text',
            role: 'assistant',
            text: `Anladım: ${ack}\n\nSıradaki soru:`,
          },
        ]);
      }
      askQuestion(ENGINEERING_QUESTIONS[0]);
      return;
    }

    const idx = qIndex;
    if (!ENGINEERING_QUESTIONS[idx]) return;

    const keys: (keyof SessionAnswers)[] = [
      'problem',
      'user_segment',
      'scope',
      'constraints',
      'success',
    ];
    const key = keys[idx];
    const updated: SessionAnswers = { ...answers, [key]: raw };

    if (shouldSuggestExpert(raw)) {
      appendMessages([
        {
          id: uid(),
          kind: 'escalation_hint',
          role: 'assistant',
          text:
            'Bu yanıt bağlayıcı hukuk gerektiren veya yüksek riskli bir tema içeriyor (ör. ceza, velayet, ağır zarar, karmaşık süreç). Kesin görüşüm yoktur; işlemlere devam etmek için baroya kayıtlı uzman avukattan randevu almanı şiddetle öneriyorum.',
        },
      ]);
    }

    if (idx >= ENGINEERING_QUESTIONS.length - 1) {
      let closing: string;
      if (isOpenAIConfigured()) {
        const cur = ENGINEERING_QUESTIONS[idx];
        setBusy(true);
        let ai: CoachResult = { reply: null };
        try {
          ai = await coachOnUserTurn({
            awaitingIdea: false,
            currentQuestionId: cur.id,
            currentQuestionPrompt: cur.prompt,
            ideaSummary: updated.idea,
            collectedSoFarLines: buildAnswersBulletSummary(updated),
            userMessage: raw,
            willAdvanceFlow: true,
            isLikelyPureQuestionOrHelp: false,
            flowHint: 'last_answer',
          });
        } finally {
          setBusy(false);
        }
        const ack = buildAcknowledgmentSnippet(raw);
        closing = ai.reply ?? `Son notu kaydettim: ${ack}`;
        const endMsgs: ChatMsg[] = [{ id: uid(), kind: 'text', role: 'assistant', text: closing }];
        if (!ai.reply && ai.httpError) {
          endMsgs.push({
            id: uid(),
            kind: 'text',
            role: 'assistant',
            text: `[API uyarısı: ${ai.httpError}]`,
          });
        }
        appendMessages(endMsgs);
      } else {
        const ack = buildAcknowledgmentSnippet(raw);
        appendMessages([
          {
            id: uid(),
            kind: 'text',
            role: 'assistant',
            text: `Son notu kaydettim: ${ack}`,
          },
        ]);
      }
      finishSession(updated);
      return;
    }

    setAnswers(updated);
    const next = idx + 1;
    setQIndex(next);
    const curQ = ENGINEERING_QUESTIONS[idx];
    const ack = buildAcknowledgmentSnippet(raw);
    let transition: string;
    if (isOpenAIConfigured()) {
      setBusy(true);
      let ai: CoachResult = { reply: null };
      try {
        ai = await coachOnUserTurn({
          awaitingIdea: false,
          currentQuestionId: curQ.id,
          currentQuestionPrompt: curQ.prompt,
          ideaSummary: updated.idea,
          collectedSoFarLines: buildAnswersBulletSummary(updated),
          userMessage: raw,
          willAdvanceFlow: true,
          isLikelyPureQuestionOrHelp: false,
        });
      } finally {
        setBusy(false);
      }
      transition = ai.reply ?? `Tamam — ${ack}\n\nSıradaki soru:`;
      const midMsgs: ChatMsg[] = [
        { id: uid(), kind: 'text', role: 'assistant', text: transition },
      ];
      if (!ai.reply && ai.httpError) {
        midMsgs.push({
          id: uid(),
          kind: 'text',
          role: 'assistant',
          text: `[API uyarısı: ${ai.httpError}]`,
        });
      }
      appendMessages(midMsgs);
    } else {
      appendMessages([
        {
          id: uid(),
          kind: 'text',
          role: 'assistant',
          text: `Tamam — ${ack}\n\nSıradaki soru:`,
        },
      ]);
    }
    askQuestion(ENGINEERING_QUESTIONS[next]);
  }, [
    answers,
    appendMessages,
    askQuestion,
    awaitingIdea,
    busy,
    finishSession,
    humanTakeover,
    input,
    longForm,
    qIndex,
  ]);

  const onSend = useCallback(() => {
    void runSend();
  }, [runSend]);

  const startHumanTakeover = useCallback(() => {
    setHumanTakeover(true);
    appendMessages([
      {
        id: uid(),
        kind: 'text',
        role: 'assistant',
        text:
          'Şu an sen anlatıyorsun; brif için serbest yaz. Gönder diyince sıradaki soruya döneriz; karmaşık/kritik dosyada avukatla devam etmen gerekir.',
      },
    ]);
  }, [appendMessages]);

  const openExpert = useCallback(() => setExpertOpen(true), []);

  if (phase === 'spec') {
    const specText = specFromAnswers(answers);
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.specHeader}>
          <Pressable onPress={onResetToHome} hitSlop={12}>
            <Text style={styles.link}>Ana sayfa</Text>
          </Pressable>
          <Text style={styles.specTitle}>Brif özeti</Text>
          <Pressable onPress={openExpert} hitSlop={12}>
            <Text style={styles.link}>Avukat</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.specScroll}>
          <Text style={styles.specMono}>{specText}</Text>
        </ScrollView>
        <ExpertModal
          visible={expertOpen}
          onClose={() => setExpertOpen(false)}
          summarySnippet={answers.idea + ' — ' + answers.constraints}
        />
      </SafeAreaView>
    );
  }

  const keyboardVerticalOffset = insets.top + 54;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        enabled={Platform.OS === 'ios'}
        behavior="padding"
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        <View style={styles.topBar}>
          <Pressable onPress={onResetToHome} hitSlop={12}>
            <Text style={styles.link}>Kapat</Text>
          </Pressable>
          <View style={styles.centerTitle}>
            <Text style={styles.brand}>Nokta</Text>
            {isOpenAIConfigured() ? (
              <Text style={styles.aiPill}>Yapay Zeka Aktif</Text>
            ) : (
              <Text style={styles.aiPillMuted}>Çevrimdışı şablon</Text>
            )}
          </View>
          <View style={{ width: 48 }} />
        </View>

        {humanTakeover ? (
          <View style={styles.hitlBanner}>
            <Text style={styles.hitlText}>Serbest anlatım — brif sorusu yok</Text>
          </View>
        ) : null}

        <FlatList
          style={styles.flex}
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          onContentSizeChange={scrollChatToEnd}
          onLayout={scrollChatToEnd}
          contentContainerStyle={[
            styles.list,
            {
              paddingBottom:
                Platform.OS === 'ios' && keyboardHeight > 0
                  ? Math.min(keyboardHeight, 160)
                  : 12,
            },
          ]}
          renderItem={({ item }) => {
            const mine = item.role === 'user';
            const escalation = item.kind === 'escalation_hint';
            return (
              <View
                style={[
                  styles.bubbleWrap,
                  mine ? styles.bubbleMine : styles.bubbleTheirs,
                ]}
              >
                <Text style={styles.bubbleMeta}>{mine ? 'Sen' : 'Nokta'}</Text>
                <View
                  style={[
                    styles.bubble,
                    mine ? styles.bubbleUser : styles.bubbleAssistant,
                    escalation && styles.bubbleEscalation,
                  ]}
                >
                  <Text
                    style={[
                      styles.bubbleText,
                      mine && styles.bubbleTextUser,
                      escalation && styles.bubbleTextEscalation,
                    ]}
                  >
                    {item.text}
                  </Text>
                </View>
              </View>
            );
          }}
        />

        <View
          style={[
            styles.composerDock,
            {
              paddingBottom:
                Platform.OS === 'ios' && keyboardHeight > 0
                  ? 6
                  : Math.max(insets.bottom, 6),
            },
          ]}
        >
        <View style={styles.actionsRow}>
          <Pressable style={styles.outlineBtn} onPress={startHumanTakeover}>
            <Text style={styles.outlineText}>Ben devralıyorum</Text>
          </Pressable>
          <Pressable style={styles.outlineBtn} onPress={openExpert}>
            <Text style={styles.outlineText}>Uzman avukat</Text>
          </Pressable>
        </View>

        <View style={styles.inputBar}>
          {humanTakeover ? (
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="Serbest anlatım…"
              placeholderTextColor={colors.textMuted}
              multiline
              value={longForm}
              onChangeText={setLongForm}
              onFocus={scrollChatToEnd}
            />
          ) : (
            <TextInput
              style={styles.input}
              placeholder={awaitingIdea ? 'Olayı kısaca özetle…' : 'Bu adımın yanıtı…'}
              placeholderTextColor={colors.textMuted}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={onSend}
              onFocus={scrollChatToEnd}
            />
          )}
          <Pressable
            style={[styles.sendBtn, busy && styles.sendBtnDisabled]}
            onPress={onSend}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.sendText}>Gönder</Text>
            )}
          </Pressable>
        </View>
        </View>
      </KeyboardAvoidingView>

      <ExpertModal
        visible={expertOpen}
        onClose={() => setExpertOpen(false)}
        summarySnippet={lastAssistantHint}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  centerTitle: { alignItems: 'center' },
  brand: { fontSize: 17, fontWeight: '700', color: colors.text },
  aiPill: {
    fontSize: 11,
    fontWeight: '600',
    color: '#15803D',
    marginTop: 2,
  },
  aiPillMuted: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 2,
  },
  link: { color: colors.primary, fontWeight: '600', fontSize: 16 },
  hitlBanner: {
    backgroundColor: colors.primaryMuted,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  hitlText: { color: colors.primary, fontWeight: '600', textAlign: 'center' },
  list: { padding: 16, paddingBottom: 8 },
  bubbleWrap: { marginBottom: 14, maxWidth: '100%' },
  bubbleMine: { alignSelf: 'flex-end' },
  bubbleTheirs: { alignSelf: 'flex-start' },
  bubbleMeta: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 4,
    marginHorizontal: 4,
  },
  bubble: {
    maxWidth: '92%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleUser: { backgroundColor: colors.userBubble },
  bubbleAssistant: { backgroundColor: colors.assistantBubble },
  bubbleEscalation: {
    backgroundColor: colors.warningBg,
    borderWidth: 1,
    borderColor: colors.warningBorder,
  },
  bubbleText: { fontSize: 16, lineHeight: 22, color: colors.text },
  bubbleTextUser: { color: colors.userText },
  bubbleTextEscalation: { color: colors.danger },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  outlineBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  outlineText: { color: colors.primary, fontWeight: '600', fontSize: 14 },
  composerDock: {
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 10,
    backgroundColor: colors.card,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
  },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  sendBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
    minWidth: 88,
    minHeight: 44,
    alignItems: 'center',
  },
  sendBtnDisabled: { opacity: 0.75 },
  sendText: { color: colors.userText, fontWeight: '700' },
  specHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  specTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  specScroll: { padding: 16 },
  specMono: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
  },
});
