import { StatusBar } from 'expo-status-bar';
import * as Speech from 'expo-speech';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type InputMode = 'text' | 'voice-transcript';
type Step = 'capture' | 'questions' | 'spec' | 'human-support';
type MascotMood = 'idle' | 'listening' | 'thinking' | 'speaking' | 'support' | 'sleepy';
type DemoPreset = 'none' | 'capture' | 'questions' | 'spec' | 'support';
type QuestionId = 'problem' | 'user' | 'scope' | 'constraint' | 'signal';

type Question = {
  id: QuestionId;
  prompt: string;
  hint: string;
  placeholder: string;
};

type SpecSection = {
  title: string;
  body: string;
};

type HumanSupportPacket = {
  queueId: string;
  reason: string;
  summary: string;
  recommendedAction: string;
  eta: string;
  handoffNotes: string[];
};

type SpecBundle = {
  title: string;
  oneLiner: string;
  confidence: string;
  sections: SpecSection[];
  nextSteps: string[];
  supportPacket: HumanSupportPacket;
};

type Answers = Record<QuestionId, string>;

const defaultAnswers: Answers = {
  problem: '',
  user: '',
  scope: '',
  constraint: '',
  signal: '',
};

const sampleIdea =
  'Kampus kulüp liderleri için 3D maskotlu bir fikir asistanı; önce kullanıcıyı konuşturuyor, sonra belirsiz kalırsa insan desteğine devir yapıyor.';

const sampleAnswers: Answers = {
  problem:
    'Kulüp liderleri etkinlik, sponsor ve başvuru fikirlerini netleştiremiyor; aynı konuşma WhatsApp içinde dönüp duruyor.',
  user: 'Üniversite kulüp başkanları, etkinlik koordinatörleri ve hackathon takımları.',
  scope:
    'İlk sürüm sadece ham fikir almalı, 5 soru sormalı, kısa spec üretmeli ve gerektiğinde insan desteğine eskalasyon açmalı.',
  constraint:
    'Mobilde tek elde kullanılmalı, bir oturum 3 dakikayı geçmemeli ve insan desteği butonu güven hissi vermeli.',
  signal:
    'Aynı ekip bir hafta içinde birden fazla fikir için uygulamayı tekrar açıyor ve çıkan spec’i toplantıda kullanıyorsa ürün işe yarıyor.',
};

function getDemoPreset(): DemoPreset {
  if (Platform.OS !== 'web') {
    return 'none';
  }

  const maybeSearch =
    typeof globalThis === 'object' &&
    'location' in globalThis &&
    typeof globalThis.location === 'object' &&
    globalThis.location &&
    'search' in globalThis.location
      ? String(globalThis.location.search ?? '')
      : '';

  const demo = new URLSearchParams(maybeSearch).get('demo');
  if (demo === 'capture' || demo === 'questions' || demo === 'spec' || demo === 'support') {
    return demo;
  }

  return 'none';
}

function normalizeText(text: string) {
  return text.trim().toLowerCase();
}

function inferDomainLens(idea: string) {
  const normalized = normalizeText(idea);

  if (
    normalized.includes('kulüp') ||
    normalized.includes('kampus') ||
    normalized.includes('öğrenci') ||
    normalized.includes('hackathon')
  ) {
    return {
      audience: 'students and community organizers',
      risk: 'the product becomes a fun mascot unless it shortens a real planning loop',
      bias: 'specific workflow help beats broad inspiration',
    };
  }

  if (normalized.includes('müşteri') || normalized.includes('destek') || normalized.includes('çağrı')) {
    return {
      audience: 'support teams and end users',
      risk: 'handoff quality breaks if the AI summary is vague',
      bias: 'trust matters more than novelty',
    };
  }

  return {
    audience: 'builders with an unstructured idea',
    risk: 'the output feels impressive but not buildable',
    bias: 'clarity beats cleverness',
  };
}

function buildQuestions(idea: string, inputMode: InputMode): Question[] {
  const lens = inferDomainLens(idea);
  const sourceLabel = inputMode === 'voice-transcript' ? 'voice transcript' : 'idea note';

  return [
    {
      id: 'problem',
      prompt: `What broken moment does this ${sourceLabel} actually describe?`,
      hint: 'Describe the pain point, not the shiny feature.',
      placeholder: 'The current workflow breaks because...',
    },
    {
      id: 'user',
      prompt: `Who feels that pain first among ${lens.audience}?`,
      hint: 'Name the first daily user or buyer in plain language.',
      placeholder: 'The first user is...',
    },
    {
      id: 'scope',
      prompt: `What is the smallest v1 worth building if ${lens.bias}?`,
      hint: 'Cut until one repeatable loop remains.',
      placeholder: 'Version one only does...',
    },
    {
      id: 'constraint',
      prompt: 'Which constraint would quietly kill adoption if ignored?',
      hint: 'Time, trust, privacy, integrations, or device context.',
      placeholder: 'It fails unless...',
    },
    {
      id: 'signal',
      prompt: 'What signal proves this deserves a second sprint?',
      hint: `Risk to watch: ${lens.risk}`,
      placeholder: 'We know it works when...',
    },
  ];
}

function titleCase(text: string) {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 5)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function createSupportPacket(idea: string, answers: Answers): HumanSupportPacket {
  return {
    queueId: `HD-${Math.abs(idea.length * 41 + answers.user.length * 7).toString().slice(0, 4)}`,
    reason: 'Model confidence is moderate; human validation is recommended before build commitment.',
    summary: `${answers.user} need a narrow workflow tool. Main ambiguity remains around ${answers.constraint.toLowerCase()}.`,
    recommendedAction:
      'Connect the user with a human reviewer who can challenge scope, verify the first user, and approve the escalation path.',
    eta: '12 minutes',
    handoffNotes: [
      `Original idea: ${idea}`,
      `Core problem: ${answers.problem}`,
      `Scope line: ${answers.scope}`,
      `Success signal: ${answers.signal}`,
    ],
  };
}

function buildSpec(idea: string, inputMode: InputMode, answers: Answers): SpecBundle {
  const title = titleCase(idea) || 'Nokta Human Support';
  const packet = createSupportPacket(idea, answers);

  return {
    title,
    oneLiner: `${title} turns a raw ${inputMode === 'voice-transcript' ? 'voice transcript' : 'text idea'} into a buildable mobile spec and opens human support when confidence drops.`,
    confidence: '72 / 100 - enough to prototype, not enough to skip human review',
    sections: [
      { title: 'Problem', body: answers.problem },
      { title: 'Primary User', body: answers.user },
      { title: 'MVP Scope', body: answers.scope },
      { title: 'Constraint', body: answers.constraint },
      { title: 'Validation Signal', body: answers.signal },
      { title: 'Human Support Trigger', body: packet.reason },
    ],
    nextSteps: [
      'Build the smallest capture and follow-up loop first.',
      'Keep the mascot expressive, but never let it hide the actual product decision.',
      'Expose the human handoff package before the user loses trust.',
    ],
    supportPacket: packet,
  };
}

function makeInitialState() {
  const preset = getDemoPreset();
  const questions = buildQuestions(sampleIdea, 'text');

  if (preset === 'questions') {
    return {
      step: 'questions' as Step,
      inputMode: 'text' as InputMode,
      mascotMood: 'listening' as MascotMood,
      idea: sampleIdea,
      questions,
      answers: { ...defaultAnswers },
      questionIndex: 0,
      spec: null as SpecBundle | null,
      supportRequested: false,
    };
  }

  if (preset === 'spec') {
    return {
      step: 'spec' as Step,
      inputMode: 'text' as InputMode,
      mascotMood: 'speaking' as MascotMood,
      idea: sampleIdea,
      questions,
      answers: { ...sampleAnswers },
      questionIndex: questions.length - 1,
      spec: buildSpec(sampleIdea, 'text', sampleAnswers),
      supportRequested: false,
    };
  }

  if (preset === 'support') {
    return {
      step: 'human-support' as Step,
      inputMode: 'text' as InputMode,
      mascotMood: 'support' as MascotMood,
      idea: sampleIdea,
      questions,
      answers: { ...sampleAnswers },
      questionIndex: questions.length - 1,
      spec: buildSpec(sampleIdea, 'text', sampleAnswers),
      supportRequested: true,
    };
  }

  return {
    step: 'capture' as Step,
    inputMode: 'text' as InputMode,
    mascotMood: 'idle' as MascotMood,
    idea: preset === 'capture' ? sampleIdea : '',
    questions: [] as Question[],
    answers: { ...defaultAnswers },
    questionIndex: 0,
    spec: null as SpecBundle | null,
    supportRequested: false,
  };
}

export default function App() {
  const initial = useMemo(() => makeInitialState(), []);
  const [step, setStep] = useState<Step>(initial.step);
  const [inputMode, setInputMode] = useState<InputMode>(initial.inputMode);
  const [idea, setIdea] = useState(initial.idea);
  const [questions, setQuestions] = useState<Question[]>(initial.questions);
  const [answers, setAnswers] = useState<Answers>(initial.answers);
  const [questionIndex, setQuestionIndex] = useState(initial.questionIndex);
  const [spec, setSpec] = useState<SpecBundle | null>(initial.spec);
  const [supportRequested, setSupportRequested] = useState(initial.supportRequested);
  const [mascotMood, setMascotMood] = useState<MascotMood>(initial.mascotMood);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const currentQuestion = questions[questionIndex];

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.04,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -6,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 6,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    floatLoop.start();

    return () => {
      pulseLoop.stop();
      floatLoop.stop();
      Speech.stop();
    };
  }, [floatAnim, pulseAnim]);

  function setAnswer(id: QuestionId, value: string) {
    setAnswers((current) => ({ ...current, [id]: value }));
  }

  function startInterview() {
    const trimmed = idea.trim();
    if (!trimmed) {
      return;
    }

    setQuestions(buildQuestions(trimmed, inputMode));
    setAnswers({ ...defaultAnswers });
    setQuestionIndex(0);
    setSpec(null);
    setSupportRequested(false);
    setMascotMood('listening');
    setStep('questions');
  }

  function loadDemo() {
    const demoQuestions = buildQuestions(sampleIdea, 'text');
    setIdea(sampleIdea);
    setInputMode('text');
    setQuestions(demoQuestions);
    setAnswers({ ...sampleAnswers });
    setQuestionIndex(demoQuestions.length - 1);
    setSpec(buildSpec(sampleIdea, 'text', sampleAnswers));
    setSupportRequested(false);
    setMascotMood('speaking');
    setStep('spec');
  }

  function goNext() {
    if (!currentQuestion) {
      return;
    }

    const value = answers[currentQuestion.id].trim();
    if (!value) {
      return;
    }

    if (questionIndex === questions.length - 1) {
      const nextSpec = buildSpec(idea, inputMode, answers);
      setSpec(nextSpec);
      setMascotMood('speaking');
      setStep('spec');
      return;
    }

    setQuestionIndex((current) => current + 1);
    setMascotMood('thinking');
    setTimeout(() => setMascotMood('listening'), 180);
  }

  function goBack() {
    setQuestionIndex((current) => Math.max(current - 1, 0));
  }

  function requestHumanSupport() {
    setSupportRequested(true);
    setMascotMood('support');
    setStep('human-support');
    Speech.stop();
    Speech.speak('İnsan desteği paketi hazır. Kısa özet ve önerilen aksiyonları ekranda açtım.', {
      language: 'tr-TR',
    });
  }

  function playVoiceSummary() {
    if (!spec) {
      return;
    }

    setMascotMood('speaking');
    Speech.stop();
    Speech.speak(
      `${spec.title}. Problem: ${answers.problem}. Kullanıcı: ${answers.user}. İnsan desteği tetikleyicisi: ${spec.supportPacket.reason}`,
      {
        language: 'tr-TR',
        onDone: () => setMascotMood('idle'),
        onStopped: () => setMascotMood('idle'),
        onError: () => setMascotMood('idle'),
      }
    );
  }

  function resetFlow() {
    Speech.stop();
    setIdea('');
    setInputMode('text');
    setQuestions([]);
    setAnswers({ ...defaultAnswers });
    setQuestionIndex(0);
    setSpec(null);
    setSupportRequested(false);
    setMascotMood('idle');
    setStep('capture');
  }

  const mascotFace =
    mascotMood === 'support'
      ? '◕◡◕'
      : mascotMood === 'speaking'
        ? '◠◠'
        : mascotMood === 'thinking'
          ? '•ᴗ•'
          : mascotMood === 'sleepy'
            ? '˘˘'
            : '•◡•';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.backgroundTop} />
      <View style={styles.backgroundBottom} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.eyebrow}>NOKTA / Track A</Text>
        <Text style={styles.title}>Nokta Human Assist</Text>
        <Text style={styles.subtitle}>
          Eski maskot fikrini Expo mobil deneyimine taşıyan, spec üretirken gerektiğinde insan desteğine devir yapan akış.
        </Text>

        <View style={styles.heroPanel}>
          <Animated.View
            style={[
              styles.mascotWrap,
              {
                transform: [{ translateY: floatAnim }, { scale: pulseAnim }],
                backgroundColor:
                  mascotMood === 'support'
                    ? '#14532D'
                    : mascotMood === 'speaking'
                      ? '#0F4C81'
                      : mascotMood === 'thinking'
                        ? '#583B8C'
                        : '#1E293B',
              },
            ]}
          >
            <Text style={styles.mascotFace}>{mascotFace}</Text>
            <Text style={styles.mascotLabel}>{mascotMood.toUpperCase()}</Text>
          </Animated.View>

          <View style={styles.signalCard}>
            <Text style={styles.signalLabel}>Human support</Text>
            <Text style={styles.signalValue}>{supportRequested ? 'Escalation ready' : 'Standby'}</Text>
            <Text style={styles.signalCopy}>
              Kullanıcı belirsiz kaldığında AI tek başına zorlamaz; devir paketi hazırlar.
            </Text>
          </View>
        </View>

        {step === 'capture' ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>1. Raw idea capture</Text>
            <Text style={styles.cardBody}>
              Ham fikri yaz veya voice transcript olarak yapıştır. Nokta önce daraltır, sonra gerekiyorsa insana devir eder.
            </Text>

            <View style={styles.toggleRow}>
              {(['text', 'voice-transcript'] as InputMode[]).map((mode) => (
                <Pressable
                  key={mode}
                  onPress={() => setInputMode(mode)}
                  style={[styles.chip, inputMode === mode && styles.chipActive]}
                >
                  <Text style={[styles.chipText, inputMode === mode && styles.chipTextActive]}>
                    {mode === 'text' ? 'Text idea' : 'Voice transcript'}
                  </Text>
                </Pressable>
              ))}
            </View>

            <TextInput
              multiline
              value={idea}
              onChangeText={setIdea}
              placeholder={
                inputMode === 'text'
                  ? 'Örnek: Üniversite kulüpleri için fikir toparlayan mobil asistan...'
                  : 'Örnek transcript: Kulüp başkanları sponsorluk ve etkinlik kararlarını toparlayamıyor...'
              }
              placeholderTextColor="#7D7A99"
              style={styles.textArea}
            />

            <InfoBlock
              title="Why this is original"
              body="Track A çekirdeğini koruyor, ama buna maskot tabanlı güven katmanı ve insan desteği eskalasyonu ekliyor."
            />

            <View style={styles.buttonRow}>
              <PrimaryButton label="Ask 5 questions" onPress={startInterview} disabled={!idea.trim()} />
              <SecondaryButton label="Load demo" onPress={loadDemo} />
            </View>
          </View>
        ) : null}

        {step === 'questions' && currentQuestion ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>2. Engineering interview {questionIndex + 1}/5</Text>
            <Text style={styles.questionPrompt}>{currentQuestion.prompt}</Text>
            <Text style={styles.questionHint}>{currentQuestion.hint}</Text>

            <TextInput
              multiline
              value={answers[currentQuestion.id]}
              onChangeText={(value) => setAnswer(currentQuestion.id, value)}
              placeholder={currentQuestion.placeholder}
              placeholderTextColor="#7D7A99"
              style={styles.textArea}
            />

            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${((questionIndex + 1) / questions.length) * 100}%` }]} />
            </View>

            <View style={styles.buttonRow}>
              <SecondaryButton label="Back" onPress={goBack} disabled={questionIndex === 0} />
              <PrimaryButton
                label={questionIndex === questions.length - 1 ? 'Generate spec' : 'Next'}
                onPress={goNext}
                disabled={!answers[currentQuestion.id].trim()}
              />
            </View>
          </View>
        ) : null}

        {step === 'spec' && spec ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>3. One-page spec</Text>
            <Text style={styles.specTitle}>{spec.title}</Text>
            <Text style={styles.specLead}>{spec.oneLiner}</Text>

            <View style={styles.metricRow}>
              <MetricPill label={`Confidence: ${spec.confidence}`} />
              <MetricPill label={supportRequested ? 'Support engaged' : 'Support optional'} />
            </View>

            {spec.sections.map((section) => (
              <View key={section.title} style={styles.sectionBlock}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionBody}>{section.body}</Text>
              </View>
            ))}

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Next steps</Text>
              {spec.nextSteps.map((item) => (
                <Text key={item} style={styles.bulletText}>
                  • {item}
                </Text>
              ))}
            </View>

            <View style={styles.buttonRow}>
              <PrimaryButton label="Play voice summary" onPress={playVoiceSummary} />
              <SecondaryButton label="Request human support" onPress={requestHumanSupport} />
            </View>
          </View>
        ) : null}

        {step === 'human-support' && spec ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>4. Human support handoff</Text>
            <InfoBlock title={spec.supportPacket.queueId} body={spec.supportPacket.reason} accent="green" />

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Summary for human reviewer</Text>
              <Text style={styles.sectionBody}>{spec.supportPacket.summary}</Text>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Recommended action</Text>
              <Text style={styles.sectionBody}>{spec.supportPacket.recommendedAction}</Text>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>ETA</Text>
              <Text style={styles.sectionBody}>{spec.supportPacket.eta}</Text>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Handoff notes</Text>
              {spec.supportPacket.handoffNotes.map((note) => (
                <Text key={note} style={styles.bulletText}>
                  • {note}
                </Text>
              ))}
            </View>

            <View style={styles.buttonRow}>
              <SecondaryButton label="Restart flow" onPress={resetFlow} />
              <PrimaryButton label="Return to spec" onPress={() => setStep('spec')} />
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricPill({ label }: { label: string }) {
  return (
    <View style={styles.metricPill}>
      <Text style={styles.metricText}>{label}</Text>
    </View>
  );
}

function InfoBlock({
  title,
  body,
  accent = 'blue',
}: {
  title: string;
  body: string;
  accent?: 'blue' | 'green';
}) {
  return (
    <View style={[styles.infoBlock, accent === 'green' ? styles.infoBlockGreen : styles.infoBlockBlue]}>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoBody}>{body}</Text>
    </View>
  );
}

function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.primaryButton, disabled && styles.buttonDisabled]}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function SecondaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.secondaryButton, disabled && styles.buttonDisabled]}>
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B1020',
  },
  backgroundTop: {
    position: 'absolute',
    top: -80,
    right: -20,
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: '#2E1B68',
    opacity: 0.5,
  },
  backgroundBottom: {
    position: 'absolute',
    bottom: 40,
    left: -90,
    width: 260,
    height: 260,
    borderRadius: 999,
    backgroundColor: '#083344',
    opacity: 0.45,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 40,
    gap: 18,
  },
  eyebrow: {
    color: '#F8D57E',
    fontSize: 13,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 36,
    fontWeight: '800',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  subtitle: {
    color: '#CBD5E1',
    fontSize: 16,
    lineHeight: 24,
  },
  heroPanel: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    alignItems: 'stretch',
  },
  mascotWrap: {
    width: 160,
    minHeight: 182,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderWidth: 1,
    borderColor: '#475569',
  },
  mascotFace: {
    color: '#F8FAFC',
    fontSize: 42,
    fontWeight: '700',
    marginBottom: 10,
  },
  mascotLabel: {
    color: '#BFDBFE',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  signalCard: {
    flex: 1,
    minWidth: 180,
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#243041',
    padding: 18,
    gap: 8,
  },
  signalLabel: {
    color: '#86EFAC',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  signalValue: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: '800',
  },
  signalCopy: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 21,
  },
  card: {
    backgroundColor: 'rgba(9, 14, 29, 0.88)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#1F2A44',
    padding: 18,
    gap: 14,
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: '800',
  },
  cardBody: {
    color: '#CBD5E1',
    fontSize: 15,
    lineHeight: 22,
  },
  toggleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#2F3A55',
    backgroundColor: '#11182C',
  },
  chipActive: {
    backgroundColor: '#F8D57E',
    borderColor: '#F8D57E',
  },
  chipText: {
    color: '#DCE7FF',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#1E293B',
  },
  textArea: {
    minHeight: 148,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#F8FAFC',
    fontSize: 15,
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  infoBlock: {
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    gap: 6,
  },
  infoBlockBlue: {
    backgroundColor: '#0F1B34',
    borderColor: '#22416C',
  },
  infoBlockGreen: {
    backgroundColor: '#10281E',
    borderColor: '#1C6B45',
  },
  infoTitle: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '700',
  },
  infoBody: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 21,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#F8D57E',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: '#1E293B',
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  secondaryButtonText: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  questionPrompt: {
    color: '#F8FAFC',
    fontSize: 22,
    lineHeight: 31,
    fontWeight: '800',
  },
  questionHint: {
    color: '#93C5FD',
    fontSize: 14,
    lineHeight: 20,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#172033',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#5EEAD4',
  },
  specTitle: {
    color: '#F8FAFC',
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '900',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  specLead: {
    color: '#E2E8F0',
    fontSize: 16,
    lineHeight: 24,
  },
  metricRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#28435B',
    backgroundColor: '#102132',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  metricText: {
    color: '#C7D2FE',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionBlock: {
    gap: 8,
  },
  sectionTitle: {
    color: '#F8D57E',
    fontSize: 15,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionBody: {
    color: '#E2E8F0',
    fontSize: 15,
    lineHeight: 23,
  },
  bulletText: {
    color: '#D5DEEE',
    fontSize: 14,
    lineHeight: 22,
  },
});
