import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type InputMode = 'text' | 'voice';
type Stage = 'capture' | 'interview' | 'spec';
type DemoPreset = 'none' | 'home' | 'questions' | 'spec';

type Question = {
  id: 'problem' | 'user' | 'scope' | 'constraints' | 'signal';
  prompt: string;
  hint: string;
  placeholder: string;
};

type SpecBundle = {
  title: string;
  oneLiner: string;
  northStar: string;
  sections: Array<{ title: string; body: string }>;
  checklist: string[];
};

type AppState = {
  idea: string;
  inputMode: InputMode;
  stage: Stage;
  questions: Question[];
  answers: Record<Question['id'], string>;
  currentQuestionIndex: number;
  spec: SpecBundle | null;
};

type DomainLens = {
  vertical: string;
  audience: string;
  bias: string;
  scopeSuggestion: string;
  risk: string;
};

const sampleIdea =
  'Kampus kulüpleri için etkinlik fikrini hızla ürünleştiren, öğrenciyi soru sorarak spesifik MVP tanımına götüren mobil koç.';

const sampleAnswers: Record<Question['id'], string> = {
  problem:
    'Öğrenci toplulukları iyi fikir buluyor ama neyin gerçekten çözülecek bir problem olduğunu netleştiremiyor.',
  user: 'Üniversite kulüp liderleri, hackathon takımları ve ilk kez ürün çıkaran öğrenciler.',
  scope:
    'İlk sürüm sadece fikirden spec üretmeli; ekip yönetimi, roadmap ve görev takibi daha sonra gelir.',
  constraints:
    'Bir oturum 3 dakikayı geçmemeli, offline demo çalışmalı ve teknik olmayan biri bile çıktıdaki dili anlayabilmeli.',
  signal:
    'Kulüp liderleri başvuru formu, etkinlik fikri ve sponsorluk decki üretmek için aynı gün içinde en az 3 kez kullanmalı.',
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
  if (demo === 'home' || demo === 'questions' || demo === 'spec') {
    return demo;
  }

  return 'none';
}

function normalizeText(value: string) {
  return value.toLowerCase();
}

function includesAny(source: string, words: string[]) {
  return words.some((word) => source.includes(word));
}

function inferLens(idea: string): DomainLens {
  const normalized = normalizeText(idea);

  if (includesAny(normalized, ['student', 'campus', 'okul', 'öğrenci', 'kulüp', 'hackathon'])) {
    return {
      vertical: 'education workflow',
      audience: 'students and community organizers',
      bias: 'speed beats completeness in early validation',
      scopeSuggestion: 'focus on one repeatable decision instead of a full operating system',
      risk: 'usage may look enthusiastic but collapse after the first cohort unless the output ships faster than Google Docs',
    };
  }

  if (includesAny(normalized, ['restaurant', 'delivery', 'kargo', 'lojistik', 'kurye', 'shop'])) {
    return {
      vertical: 'operations tooling',
      audience: 'frontline operators and small business owners',
      bias: 'friction and reliability matter more than novelty',
      scopeSuggestion: 'start with one high-frequency bottleneck and measure reduced manual coordination',
      risk: 'the product will feel like a nice dashboard unless it removes an existing WhatsApp or spreadsheet loop',
    };
  }

  if (includesAny(normalized, ['doctor', 'health', 'clinic', 'hasta', 'sağlık'])) {
    return {
      vertical: 'health workflow',
      audience: 'care teams and patients',
      bias: 'clarity and compliance outrank cleverness',
      scopeSuggestion: 'keep the first release administrative, not diagnostic',
      risk: 'medical trust collapses if the app sounds authoritative without a traceable source of truth',
    };
  }

  return {
    vertical: 'idea workflow',
    audience: 'founders and builders',
    bias: 'specificity is the moat',
    scopeSuggestion: 'reduce the first version to one sharp loop with visible before/after value',
    risk: 'the app becomes inspirational slop if the generated spec is not operational enough to build from',
  };
}

function buildQuestions(idea: string, inputMode: InputMode): Question[] {
  const lens = inferLens(idea);
  const intakeLabel = inputMode === 'voice' ? 'voice note' : 'idea note';

  return [
    {
      id: 'problem',
      prompt: `What painful moment does this ${intakeLabel} describe inside the ${lens.vertical} space?`,
      hint: 'Write the broken workflow, not the dreamed-up feature.',
      placeholder: 'Teams lose time because...',
    },
    {
      id: 'user',
      prompt: `Who feels that pain first among ${lens.audience}?`,
      hint: 'Name the first buyer or first daily user in plain language.',
      placeholder: 'The first user is...',
    },
    {
      id: 'scope',
      prompt: `What is the smallest v1 worth building if ${lens.bias}?`,
      hint: `AI suggestion: ${lens.scopeSuggestion}.`,
      placeholder: 'Version one does exactly...',
    },
    {
      id: 'constraints',
      prompt: 'Which constraints would kill adoption if ignored?',
      hint: 'Think time, trust, integrations, team size, privacy, or hardware limits.',
      placeholder: 'It fails unless...',
    },
    {
      id: 'signal',
      prompt: 'What behavior would prove this deserves a second sprint?',
      hint: `Risk to test: ${lens.risk}`,
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

function buildSpec(idea: string, inputMode: InputMode, answers: Record<Question['id'], string>): SpecBundle {
  const lens = inferLens(idea);
  const intake = inputMode === 'voice' ? 'voice note transcript' : 'text idea';
  const problem = answers.problem.trim();
  const user = answers.user.trim();
  const scope = answers.scope.trim();
  const constraints = answers.constraints.trim();
  const signal = answers.signal.trim();
  const title = titleCase(idea) || 'SpecForge Draft';

  return {
    title,
    oneLiner: `${title} turns a raw ${intake} into an actionable product brief by forcing specificity before anyone starts building.`,
    northStar: `If this launch works, ${user.toLowerCase()} should move from vague intent to a buildable v1 within one focused session.`,
    sections: [
      {
        title: 'Problem',
        body: `${problem} The idea belongs to the ${lens.vertical} category, so the product must prove it improves a real workflow instead of adding another interface.`,
      },
      {
        title: 'Primary User',
        body: `${user} They will adopt only if the app respects the bias that ${lens.bias}.`,
      },
      {
        title: 'MVP Scope',
        body: `${scope} Everything outside that loop is explicitly deferred until repeat usage appears.`,
      },
      {
        title: 'Constraints',
        body: `${constraints} The first build should treat these as hard product boundaries, not polish tasks.`,
      },
      {
        title: 'Success Signal',
        body: `${signal} This is the proof point that decides whether the concept graduates from student project to real product candidate.`,
      },
      {
        title: 'Build Notes',
        body: `Use a short guided interview, generate a one-page spec, and surface the reasoning that connected the raw idea to the final recommendation. The strongest differentiation comes from specificity, transparent tradeoffs, and a final artifact that can be handed directly to an engineer or mentor.`,
      },
    ],
    checklist: [
      'The user can start from text or a pasted voice transcript.',
      'The app asks five engineering questions with contextual hints.',
      'The final spec fits on one scrollable page and can be read aloud in under a minute.',
      'Each section maps directly back to a user answer or an explicit AI assumption.',
      `A risky assumption is called out: ${lens.risk}`,
    ],
  };
}

function buildInitialState(): AppState {
  const preset = getDemoPreset();
  const questions = buildQuestions(sampleIdea, 'text');

  if (preset === 'questions') {
    return {
      idea: sampleIdea,
      inputMode: 'text',
      stage: 'interview',
      questions,
      answers: { problem: '', user: '', scope: '', constraints: '', signal: '' },
      currentQuestionIndex: 0,
      spec: null,
    };
  }

  if (preset === 'spec') {
    return {
      idea: sampleIdea,
      inputMode: 'text',
      stage: 'spec',
      questions,
      answers: sampleAnswers,
      currentQuestionIndex: questions.length - 1,
      spec: buildSpec(sampleIdea, 'text', sampleAnswers),
    };
  }

  return {
    idea: preset === 'home' ? sampleIdea : '',
    inputMode: 'text',
    stage: 'capture',
    questions: [],
    answers: { problem: '', user: '', scope: '', constraints: '', signal: '' },
    currentQuestionIndex: 0,
    spec: null,
  };
}

export default function App() {
  const [state, setState] = useState<AppState>(buildInitialState);

  const currentQuestion = state.questions[state.currentQuestionIndex];
  const lens = inferLens(state.idea || sampleIdea);

  function updateAnswer(id: Question['id'], value: string) {
    setState((current) => ({
      ...current,
      answers: {
        ...current.answers,
        [id]: value,
      },
    }));
  }

  function startInterview() {
    const trimmedIdea = state.idea.trim();
    if (!trimmedIdea) {
      return;
    }

    setState((current) => ({
      ...current,
      stage: 'interview',
      questions: buildQuestions(trimmedIdea, current.inputMode),
      currentQuestionIndex: 0,
      spec: null,
    }));
  }

  function fillDemo() {
    const questions = buildQuestions(sampleIdea, 'text');
    setState({
      idea: sampleIdea,
      inputMode: 'text',
      stage: 'interview',
      questions,
      answers: { ...sampleAnswers },
      currentQuestionIndex: 0,
      spec: null,
    });
  }

  function nextStep() {
    if (!currentQuestion) {
      return;
    }

    const currentAnswer = state.answers[currentQuestion.id].trim();
    if (!currentAnswer) {
      return;
    }

    if (state.currentQuestionIndex === state.questions.length - 1) {
      const spec = buildSpec(state.idea, state.inputMode, state.answers);
      setState((current) => ({
        ...current,
        stage: 'spec',
        spec,
      }));
      return;
    }

    setState((current) => ({
      ...current,
      currentQuestionIndex: current.currentQuestionIndex + 1,
    }));
  }

  function previousStep() {
    setState((current) => ({
      ...current,
      currentQuestionIndex: Math.max(0, current.currentQuestionIndex - 1),
    }));
  }

  function resetFlow() {
    setState(buildInitialState());
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.backgroundOrbTop} />
      <View style={styles.backgroundOrbBottom} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.eyebrow}>NOKTA / Track 1</Text>
        <Text style={styles.heroTitle}>SpecForge</Text>
        <Text style={styles.heroSubtitle}>
          Raw fikirleri 5 net engineering sorusuyla tek sayfa spec&apos;e çeviren offline Expo demo.
        </Text>

        <View style={styles.metaRow}>
          <InfoPill label={`Lens: ${lens.vertical}`} />
          <InfoPill label={`Bias: ${lens.bias}`} />
        </View>

        {state.stage === 'capture' ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>1. Fikri yakala</Text>
            <Text style={styles.cardBody}>
              Metin ya da ses notu transkripti ile başla. Amaç ilhamı değil, çözülecek işi yakalamak.
            </Text>

            <View style={styles.toggleRow}>
              {(['text', 'voice'] as InputMode[]).map((mode) => (
                <Pressable
                  key={mode}
                  onPress={() => setState((current) => ({ ...current, inputMode: mode }))}
                  style={[styles.modeChip, state.inputMode === mode && styles.modeChipActive]}
                >
                  <Text style={[styles.modeChipText, state.inputMode === mode && styles.modeChipTextActive]}>
                    {mode === 'text' ? 'Text idea' : 'Voice transcript'}
                  </Text>
                </Pressable>
              ))}
            </View>

            <TextInput
              multiline
              placeholder={
                state.inputMode === 'voice'
                  ? 'Voice note transcript: "Kulüp liderleri sponsor deck hazırlarken..."'
                  : 'Ham fikri yaz: "Kulüp liderleri için... "'
              }
              placeholderTextColor="#6d5f95"
              style={styles.textArea}
              value={state.idea}
              onChangeText={(value) => setState((current) => ({ ...current, idea: value }))}
            />

            <View style={styles.callout}>
              <Text style={styles.calloutLabel}>AI read</Text>
              <Text style={styles.calloutText}>
                İlk tahmin: bu fikir {lens.audience} için, ve en kritik risk şu: {lens.risk}
              </Text>
            </View>

            <View style={styles.actionRow}>
              <PrimaryButton label="Ask 5 questions" onPress={startInterview} disabled={!state.idea.trim()} />
              <GhostButton label="Load demo idea" onPress={fillDemo} />
            </View>
          </View>
        ) : null}

        {state.stage === 'interview' && currentQuestion ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              2. Engineering interview {state.currentQuestionIndex + 1}/{state.questions.length}
            </Text>
            <Text style={styles.questionPrompt}>{currentQuestion.prompt}</Text>
            <Text style={styles.questionHint}>{currentQuestion.hint}</Text>

            <TextInput
              multiline
              placeholder={currentQuestion.placeholder}
              placeholderTextColor="#6d5f95"
              style={styles.textArea}
              value={state.answers[currentQuestion.id]}
              onChangeText={(value) => updateAnswer(currentQuestion.id, value)}
            />

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${((state.currentQuestionIndex + 1) / state.questions.length) * 100}%` },
                ]}
              />
            </View>

            <View style={styles.actionRow}>
              <GhostButton label="Back" onPress={previousStep} disabled={state.currentQuestionIndex === 0} />
              <PrimaryButton
                label={state.currentQuestionIndex === state.questions.length - 1 ? 'Generate spec' : 'Next'}
                onPress={nextStep}
                disabled={!state.answers[currentQuestion.id].trim()}
              />
            </View>
          </View>
        ) : null}

        {state.stage === 'spec' && state.spec ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>3. One-page spec</Text>
            <Text style={styles.specTitle}>{state.spec.title}</Text>
            <Text style={styles.specOneLiner}>{state.spec.oneLiner}</Text>

            <View style={styles.callout}>
              <Text style={styles.calloutLabel}>North star</Text>
              <Text style={styles.calloutText}>{state.spec.northStar}</Text>
            </View>

            {state.spec.sections.map((section) => (
              <View key={section.title} style={styles.sectionBlock}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionBody}>{section.body}</Text>
              </View>
            ))}

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Release checklist</Text>
              {state.spec.checklist.map((item) => (
                <Text key={item} style={styles.checklistItem}>
                  • {item}
                </Text>
              ))}
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Decision trace</Text>
              <Text style={styles.sectionBody}>
                The app preserves the user&apos;s original idea, asks targeted questions, and turns each answer into a
                visible spec section so the generated output never feels like detached AI fluff.
              </Text>
            </View>

            <View style={styles.actionRow}>
              <GhostButton label="Ask again" onPress={resetFlow} />
              <PrimaryButton
                label="Restart demo"
                onPress={() => {
                  const questions = buildQuestions(sampleIdea, 'text');
                  setState({
                    idea: sampleIdea,
                    inputMode: 'text',
                    stage: 'spec',
                    questions,
                    answers: { ...sampleAnswers },
                    currentQuestionIndex: questions.length - 1,
                    spec: buildSpec(sampleIdea, 'text', sampleAnswers),
                  });
                }}
              />
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoPill({ label }: { label: string }) {
  return (
    <View style={styles.infoPill}>
      <Text style={styles.infoPillText}>{label}</Text>
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
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.primaryButton, disabled && styles.buttonDisabled]}
    >
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function GhostButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.ghostButton, disabled && styles.buttonDisabled]}>
      <Text style={styles.ghostButtonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#120f1c',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 40,
    gap: 18,
  },
  backgroundOrbTop: {
    position: 'absolute',
    top: -80,
    right: -30,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: '#3d2f77',
    opacity: 0.42,
  },
  backgroundOrbBottom: {
    position: 'absolute',
    bottom: 90,
    left: -70,
    width: 260,
    height: 260,
    borderRadius: 999,
    backgroundColor: '#0f6b71',
    opacity: 0.24,
  },
  eyebrow: {
    color: '#e2c98b',
    fontSize: 13,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  heroTitle: {
    color: '#f8f4ff',
    fontSize: 42,
    lineHeight: 46,
    fontWeight: '700',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  heroSubtitle: {
    color: '#cfc5ea',
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 560,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  infoPill: {
    borderWidth: 1,
    borderColor: '#4f436f',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  infoPillText: {
    color: '#e6def8',
    fontSize: 12,
  },
  card: {
    backgroundColor: 'rgba(19, 17, 29, 0.88)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#342d48',
    padding: 18,
    gap: 14,
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
  },
  cardBody: {
    color: '#c9c2da',
    fontSize: 15,
    lineHeight: 22,
  },
  toggleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  modeChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#43365f',
    backgroundColor: '#171424',
  },
  modeChipActive: {
    backgroundColor: '#e2c98b',
    borderColor: '#e2c98b',
  },
  modeChipText: {
    color: '#dbd2f0',
    fontSize: 13,
    fontWeight: '600',
  },
  modeChipTextActive: {
    color: '#221a09',
  },
  textArea: {
    minHeight: 144,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#47396a',
    backgroundColor: '#140f22',
    color: '#fcfbff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    textAlignVertical: 'top',
    fontSize: 15,
    lineHeight: 22,
  },
  callout: {
    borderRadius: 18,
    backgroundColor: '#181f2f',
    borderWidth: 1,
    borderColor: '#273a54',
    padding: 14,
    gap: 6,
  },
  calloutLabel: {
    color: '#8fd9d5',
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  calloutText: {
    color: '#d9f4f1',
    fontSize: 14,
    lineHeight: 21,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#e2c98b',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: '#211908',
    fontSize: 14,
    fontWeight: '700',
  },
  ghostButton: {
    backgroundColor: '#1a1625',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#45385e',
  },
  ghostButtonText: {
    color: '#ebe4fb',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  questionPrompt: {
    color: '#f7f4ff',
    fontSize: 22,
    lineHeight: 31,
    fontWeight: '700',
  },
  questionHint: {
    color: '#9ed8da',
    fontSize: 14,
    lineHeight: 20,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#2a2339',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#8fd9d5',
  },
  specTitle: {
    color: '#ffffff',
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  specOneLiner: {
    color: '#e7defd',
    fontSize: 16,
    lineHeight: 24,
  },
  sectionBlock: {
    gap: 8,
    paddingVertical: 6,
  },
  sectionTitle: {
    color: '#e2c98b',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  sectionBody: {
    color: '#e9e4f5',
    fontSize: 15,
    lineHeight: 23,
  },
  checklistItem: {
    color: '#d0f2ef',
    fontSize: 14,
    lineHeight: 22,
  },
});
