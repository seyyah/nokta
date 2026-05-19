import { useEffect, useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import {
  Newsreader_600SemiBold,
  Newsreader_700Bold,
} from '@expo-google-fonts/newsreader';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ContradictionCard } from './src/components/ContradictionCard';
import { DraftSectionCard } from './src/components/DraftSectionCard';
import { InputPanel } from './src/components/InputPanel';
import { LockedBriefCard } from './src/components/LockedBriefCard';
import { NextDecisionCard } from './src/components/NextDecisionCard';
import { ResultHeader } from './src/components/ResultHeader';
import { UndefinedAreaCard } from './src/components/UndefinedAreaCard';
import { sampleInput } from './src/data/sampleInput';
import {
  buildLockedBrief,
  buildMentorFeedbackWriteback,
  distill,
} from './src/engine/distill';
import {
  loadGamePitchStore,
  saveGamePitchStore,
} from './src/services/gamePitchStore';
import { distillGamePitchWithGroq, hasGroqKey } from './src/services/groqGamePitch';
import { palette, shadows } from './src/theme';
import {
  DistillationResult,
  DraftSection,
  DraftSectionTitle,
  GamePitchStore,
  NextDecision,
  ReviewTicket,
  SavedGameBrief,
} from './src/types/draft';

type Screen = 'home' | 'user' | 'newBrief' | 'mentor' | 'savedBrief';

function getSection(result: DistillationResult, title: DraftSectionTitle) {
  return result.sections.find((section) => section.title === title);
}

function sectionItems(result: DistillationResult, title: DraftSection['title']) {
  return getSection(result, title)?.items ?? [];
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [store, setStore] = useState<GamePitchStore>({ briefs: [], tickets: [] });
  const [activeBriefId, setActiveBriefId] = useState<string | null>(null);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [mentorTicketFeedback, setMentorTicketFeedback] = useState('');
  const [rawInput, setRawInput] = useState('');
  const [result, setResult] = useState<DistillationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [resolvedDecisionIds, setResolvedDecisionIds] = useState<string[]>([]);
  const [selectedDecisionOptions, setSelectedDecisionOptions] = useState<
    Record<string, string>
  >({});
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Newsreader_600SemiBold,
    Newsreader_700Bold,
  });

  useEffect(() => {
    loadGamePitchStore().then(setStore).catch(() => {
      setStore({ briefs: [], tickets: [] });
    });
  }, []);

  const pendingTickets = useMemo(
    () => store.tickets.filter((ticket) => ticket.status === 'pending'),
    [store.tickets]
  );

  const activeBrief = useMemo(
    () => store.briefs.find((brief) => brief.id === activeBriefId) ?? null,
    [activeBriefId, store.briefs]
  );

  const activeTicket = useMemo(
    () => store.tickets.find((ticket) => ticket.id === activeTicketId) ?? null,
    [activeTicketId, store.tickets]
  );

  const lockedBrief = useMemo(
    () => (result ? buildLockedBrief(result, selectedDecisionOptions) : null),
    [selectedDecisionOptions, result]
  );

  if (!fontsLoaded) {
    return <View style={styles.loadingScreen} />;
  }

  const persistStore = async (nextStore: GamePitchStore) => {
    setStore(nextStore);
    await saveGamePitchStore(nextStore);
  };

  const resetDraftState = () => {
    setRawInput('');
    setResult(null);
    setErrorText(null);
    setResolvedDecisionIds([]);
    setSelectedDecisionOptions({});
  };

  const openHome = () => {
    setScreen('home');
    setActiveBriefId(null);
    setActiveTicketId(null);
    setMentorTicketFeedback('');
  };

  const openUserWorkspace = () => {
    setActiveBriefId(null);
    setActiveTicketId(null);
    setMentorTicketFeedback('');
    setScreen('user');
  };

  const startNewBrief = () => {
    resetDraftState();
    setScreen('newBrief');
  };

  const startMentorFlow = () => {
    setActiveTicketId(null);
    setMentorTicketFeedback('');
    setScreen('mentor');
  };

  const handleDistill = async () => {
    const trimmed = rawInput.trim();

    if (!trimmed || isLoading) {
      return;
    }

    setIsLoading(true);
    setErrorText(null);
    setResolvedDecisionIds([]);
    setSelectedDecisionOptions({});

    try {
      const nextResult = hasGroqKey()
        ? await distillGamePitchWithGroq(trimmed)
        : distill(trimmed);
      setResult(nextResult);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Groq distillation failed.';
      setErrorText(`${message} Local fallback was used.`);
      setResult(distill(trimmed));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSample = () => {
    setRawInput(sampleInput);
    setResult(null);
    setErrorText(null);
    setResolvedDecisionIds([]);
    setSelectedDecisionOptions({});
  };

  const handleClear = () => {
    resetDraftState();
  };

  const toggleDecision = (decision: NextDecision) => {
    if (!selectedDecisionOptions[decision.id]) {
      return;
    }

    setResolvedDecisionIds((current) =>
      current.includes(decision.id)
        ? current.filter((id) => id !== decision.id)
        : [...current, decision.id]
    );
  };

  const selectDecisionOption = (decision: NextDecision, option: string) => {
    setSelectedDecisionOptions((current) => ({
      ...current,
      [decision.id]: option,
    }));
  };

  const saveCurrentBrief = async () => {
    if (!result || !lockedBrief) {
      return;
    }

    const now = new Date().toISOString();
    const briefId = createId('brief');
    const needsMentor = result.readiness.mode !== 'HOOTL';
    const savedBrief: SavedGameBrief = {
      id: briefId,
      title: result.title,
      rawInput,
      result,
      selections: selectedDecisionOptions,
      finalBrief: lockedBrief,
      status: needsMentor ? 'mentor_review' : 'saved',
      createdAt: now,
      updatedAt: now,
      futurePlan: lockedBrief.featureFocus,
    };

    const ticket: ReviewTicket | null = needsMentor
      ? {
          id: createId('ticket'),
          briefId,
          title: result.title,
          status: 'pending',
          mentorPacket: result.mentorPacket,
          readiness: result.readiness,
          createdAt: now,
          updatedAt: now,
        }
      : null;

    await persistStore({
      briefs: [savedBrief, ...store.briefs],
      tickets: ticket ? [ticket, ...store.tickets] : store.tickets,
    });

    resetDraftState();
    openUserWorkspace();
  };

  const resolveTicket = async () => {
    if (!activeTicket || !mentorTicketFeedback.trim()) {
      return;
    }

    const brief = store.briefs.find((item) => item.id === activeTicket.briefId);
    if (!brief) {
      return;
    }

    const now = new Date().toISOString();
    const writeback = buildMentorFeedbackWriteback(mentorTicketFeedback);
    const finalBrief = buildLockedBrief(brief.result, brief.selections, writeback);
    const updatedBrief: SavedGameBrief = {
      ...brief,
      finalBrief,
      mentorFeedback: writeback,
      futurePlan: writeback.nextActions,
      status: 'reviewed',
      updatedAt: now,
    };
    const updatedTicket: ReviewTicket = {
      ...activeTicket,
      status: 'resolved',
      feedbackText: mentorTicketFeedback,
      resolvedAt: now,
      updatedAt: now,
    };

    await persistStore({
      briefs: store.briefs.map((item) =>
        item.id === updatedBrief.id ? updatedBrief : item
      ),
      tickets: store.tickets.map((item) =>
        item.id === updatedTicket.id ? updatedTicket : item
      ),
    });

    setMentorTicketFeedback('');
    setActiveTicketId(null);
  };

  const renderTopBar = (
    title: string,
    subtitle?: string,
    backLabel = 'Home',
    onBack = openHome
  ) => (
    <View style={styles.topBar}>
      <Pressable onPress={onBack} style={styles.backChip}>
        <Text style={styles.backChipText}>{backLabel}</Text>
      </Pressable>
      <Text style={styles.topTitle}>{title}</Text>
      {subtitle ? <Text style={styles.topSubtitle}>{subtitle}</Text> : null}
    </View>
  );

  const renderSavedBriefCard = (brief: SavedGameBrief) => (
    <View key={brief.id} style={styles.savedCard}>
      <View style={styles.savedHeader}>
        <Text style={styles.savedTitle}>{brief.title}</Text>
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>{brief.status.replace('_', ' ')}</Text>
        </View>
      </View>
      <Text style={styles.savedMeta}>
        {brief.result.readiness.mode} / {brief.result.readiness.score} readiness
      </Text>
      <Text style={styles.savedSummary}>{brief.finalBrief.lockedSummary}</Text>
      <Pressable
        style={styles.secondaryButton}
        onPress={() => {
          setActiveBriefId(brief.id);
          setScreen('savedBrief');
        }}
      >
        <Text style={styles.secondaryButtonText}>Open Saved Brief</Text>
      </Pressable>
    </View>
  );

  const renderHome = () => (
    <ScrollView contentContainerStyle={styles.homeContent} showsVerticalScrollIndicator={false}>
      <View style={styles.homeHero}>
        <Text style={styles.homeEyebrow}>Nokta Game Pitch</Text>
        <Text style={styles.homeTitle}>Indie game ideas, reviewed into buildable briefs.</Text>
        <Text style={styles.homeSubtitle}>
          Choose User to create and manage briefs, or Mentor to review tickets.
        </Text>
        <View style={styles.roleRow}>
          <Pressable style={styles.primaryButton} onPress={openUserWorkspace}>
            <Text style={styles.primaryButtonText}>User Login</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={startMentorFlow}>
            <Text style={styles.secondaryButtonText}>
              Mentor Login ({pendingTickets.length})
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );

  const renderUserDashboard = () => (
    <ScrollView contentContainerStyle={styles.homeContent} showsVerticalScrollIndicator={false}>
      {renderTopBar('User Workspace', 'Add a new idea or continue from a saved brief.')}

      <View style={styles.quickStartCard}>
        <Text style={styles.sectionTitle}>New Notes</Text>
        <Text style={styles.sectionSubtitle}>
          Paste messy game notes and turn them into a GDD-lite brief.
        </Text>
        <Pressable style={styles.primaryButton} onPress={startNewBrief}>
          <Text style={styles.primaryButtonText}>Add Notes / Idea</Text>
        </Pressable>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Saved Briefs</Text>
        <Text style={styles.sectionSubtitle}>
          User briefs, mentor-reviewed plans, and waiting review drafts stay here.
        </Text>
      </View>

      {store.briefs.length > 0 ? (
        store.briefs.map(renderSavedBriefCard)
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No saved briefs yet</Text>
          <Text style={styles.emptyText}>
            Add your first game idea, select the key decisions, then save the brief.
          </Text>
        </View>
      )}
    </ScrollView>
  );

  const renderUserResult = () => {
    if (!result || !lockedBrief) {
      return null;
    }

    return (
      <ScrollView
        contentContainerStyle={styles.resultContent}
        showsVerticalScrollIndicator={false}
      >
        {renderTopBar(
          'New Game Brief',
          'Distill, select decisions, then save.',
          'User',
          openUserWorkspace
        )}

        <ResultHeader
          title={result.title}
          metrics={result.metrics}
          readiness={result.readiness}
          source={result.source}
          onBack={() => setResult(null)}
        />

        <DraftSectionCard
          title={`Prototype Readiness: ${result.readiness.status}`}
          items={result.readiness.rationale}
          helperText={`${result.readiness.mode} decides whether saving creates a mentor ticket.`}
        />

        <DraftSectionCard
          title="Game Summary"
          items={sectionItems(result, 'Game Summary')}
          helperText="The pitch compressed into a buildable game direction."
        />

        <DraftSectionCard
          title="Core Loop"
          items={sectionItems(result, 'Core Loop')}
          helperText="The repeatable minute-to-minute player activity."
        />

        <DraftSectionCard
          title="Player Fantasy"
          items={sectionItems(result, 'Player Fantasy')}
          helperText="What the player gets to feel or become."
          tone="muted"
        />

        <DraftSectionCard
          title="Core Mechanics"
          items={sectionItems(result, 'Core Mechanics')}
          helperText="Only the mechanics that support the first playable loop."
        />

        <DraftSectionCard
          title="Scope Boundary"
          items={sectionItems(result, 'Scope Boundary')}
          helperText="The cut line between prototype and future wishlist."
          tone="muted"
        />

        <DraftSectionCard
          title="Feature Creep Warnings"
          items={sectionItems(result, 'Feature Creep Warnings')}
          helperText="Large systems that can break a solo indie prototype."
        />

        <DraftSectionCard
          title="Prototype Plan"
          items={sectionItems(result, 'Prototype Plan')}
          helperText="A small playable build plan, not a full production roadmap."
          tone="muted"
        />

        <View style={styles.diagnosticSection}>
          <Text style={styles.diagnosticTitle}>Game Design Tensions</Text>
          <Text style={styles.diagnosticSubtitle}>
            Conflicts that make the game harder to prototype.
          </Text>
          {result.contradictions.length > 0 ? (
            result.contradictions.map((contradiction) => (
              <ContradictionCard key={contradiction.id} contradiction={contradiction} />
            ))
          ) : (
            <DraftSectionCard
              title="No direct game tension found"
              items={['The notes mostly support one prototype direction.']}
              compact
              tone="muted"
            />
          )}
        </View>

        <View style={styles.diagnosticSection}>
          <Text style={styles.diagnosticTitle}>Missing Design Inputs</Text>
          <Text style={styles.diagnosticSubtitle}>
            Gaps that still weaken the GDD-lite brief.
          </Text>
          {result.undefinedAreas.map((area) => (
            <UndefinedAreaCard key={area.id} area={area} />
          ))}
        </View>

        <View style={styles.diagnosticSection}>
          <Text style={styles.diagnosticTitle}>Game Decisions</Text>
          <Text style={styles.diagnosticSubtitle}>
            Select options before saving. Marking is optional, but useful for review.
          </Text>
          {result.nextDecisions.map((decision) => (
            <NextDecisionCard
              key={decision.id}
              decision={decision}
              resolved={resolvedDecisionIds.includes(decision.id)}
              selectedOption={selectedDecisionOptions[decision.id]}
              onToggle={() => toggleDecision(decision)}
              onSelectOption={(option) => selectDecisionOption(decision, option)}
            />
          ))}
        </View>

        <View style={styles.mentorCard}>
          <View style={styles.mentorHeader}>
            <View style={styles.mentorBadge}>
              <Text style={styles.mentorBadgeText}>Ticket Preview</Text>
            </View>
            <Text style={styles.mentorMode}>{result.readiness.mode}</Text>
          </View>
          <Text style={styles.mentorTitle}>{result.mentorPacket.recommendedMentor}</Text>
          <Text style={styles.mentorSubtitle}>
            {result.readiness.mode === 'HOOTL'
              ? 'This brief can be saved without mentor review.'
              : 'Saving this brief will create a mentor review ticket.'}
          </Text>
          <View style={styles.mentorGroup}>
            <Text style={styles.mentorGroupTitle}>Ask mentor</Text>
            {result.mentorPacket.questions.map((item, index) => (
              <Text key={item} style={styles.questionText}>
                {index + 1}. {item}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.diagnosticSection}>
          <Text style={styles.diagnosticTitle}>Brief Before Save</Text>
          <Text style={styles.diagnosticSubtitle}>
            This is what will be saved now. Mentor feedback can update it later.
          </Text>
          <LockedBriefCard brief={lockedBrief} />
        </View>

        <Pressable style={styles.saveButton} onPress={saveCurrentBrief}>
          <Text style={styles.saveButtonText}>
            {result.readiness.mode === 'HOOTL'
              ? 'Save Brief'
              : 'Save Brief and Create Mentor Ticket'}
          </Text>
        </Pressable>
      </ScrollView>
    );
  };

  const renderNewBriefFlow = () =>
    result ? (
      renderUserResult()
    ) : (
      <View style={styles.screenShell}>
        {renderTopBar(
          'New Game Brief',
          'Paste game notes and create a brief.',
          'User',
          openUserWorkspace
        )}
        <InputPanel
          value={rawInput}
          onChangeText={setRawInput}
          onLoadSample={handleLoadSample}
          onClear={handleClear}
          onDistill={handleDistill}
          isLoading={isLoading}
          errorText={errorText}
          groqEnabled={hasGroqKey()}
        />
      </View>
    );

  const renderTicketSummary = (ticket: ReviewTicket) => (
    <View key={ticket.id} style={styles.ticketCard}>
      <View style={styles.savedHeader}>
        <Text style={styles.savedTitle}>{ticket.title}</Text>
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>{ticket.readiness.mode}</Text>
        </View>
      </View>
      <Text style={styles.savedMeta}>{ticket.mentorPacket.recommendedMentor}</Text>
      <Text style={styles.savedSummary}>{ticket.mentorPacket.why[0]}</Text>
      <Pressable
        style={styles.primaryButton}
        onPress={() => {
          setActiveTicketId(ticket.id);
          setMentorTicketFeedback(ticket.feedbackText ?? '');
        }}
      >
        <Text style={styles.primaryButtonText}>Review Ticket</Text>
      </Pressable>
    </View>
  );

  const renderMentorTicketDetail = () => {
    if (!activeTicket) {
      return null;
    }

    const brief = store.briefs.find((item) => item.id === activeTicket.briefId);

    return (
      <ScrollView contentContainerStyle={styles.resultContent} showsVerticalScrollIndicator={false}>
        {renderTopBar('Mentor Review', 'Resolve this ticket with feedback.')}

        <View style={styles.mentorCard}>
          <View style={styles.mentorHeader}>
            <View style={styles.mentorBadge}>
              <Text style={styles.mentorBadgeText}>Pending Ticket</Text>
            </View>
            <Text style={styles.mentorMode}>{activeTicket.readiness.mode}</Text>
          </View>
          <Text style={styles.mentorTitle}>{activeTicket.title}</Text>
          <Text style={styles.mentorSubtitle}>{activeTicket.mentorPacket.recommendedMentor}</Text>

          <View style={styles.mentorGroup}>
            <Text style={styles.mentorGroupTitle}>Why this needs review</Text>
            {activeTicket.mentorPacket.why.map((item) => (
              <View key={item} style={styles.itemRow}>
                <View style={styles.bullet} />
                <Text style={styles.itemText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.mentorGroup}>
            <Text style={styles.mentorGroupTitle}>Questions from user brief</Text>
            {activeTicket.mentorPacket.questions.map((item, index) => (
              <Text key={item} style={styles.questionText}>
                {index + 1}. {item}
              </Text>
            ))}
          </View>
        </View>

        {brief ? (
          <DraftSectionCard
            title="Current Brief Context"
            items={[
              brief.finalBrief.lockedSummary,
              ...brief.finalBrief.boundaryItems.slice(0, 3),
            ]}
            helperText="Mentor feedback will update this saved brief."
          />
        ) : null}

        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackTitle}>Mentor Feedback</Text>
          <Text style={styles.feedbackHelper}>
            Paste review notes. They will be written back into the saved brief as future plan.
          </Text>
          <TextInput
            multiline
            value={mentorTicketFeedback}
            onChangeText={setMentorTicketFeedback}
            placeholder="Example: Keep v1 single-player. Cut pets and base building. Focus on one island exploration loop with one resource and one upgrade."
            placeholderTextColor={palette.muted}
            style={styles.feedbackInput}
            textAlignVertical="top"
          />
          <Pressable
            style={[
              styles.feedbackAction,
              !mentorTicketFeedback.trim() ? styles.feedbackActionDisabled : undefined,
            ]}
            onPress={resolveTicket}
            disabled={!mentorTicketFeedback.trim()}
          >
            <Text style={styles.feedbackActionText}>Resolve Ticket and Update Brief</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  };

  const renderMentorFlow = () =>
    activeTicketId ? (
      renderMentorTicketDetail()
    ) : (
      <ScrollView contentContainerStyle={styles.homeContent} showsVerticalScrollIndicator={false}>
        {renderTopBar('Mentor Queue', 'Only pending review tickets are shown here.')}
        {pendingTickets.length > 0 ? (
          pendingTickets.map(renderTicketSummary)
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No pending tickets</Text>
            <Text style={styles.emptyText}>
              User-saved HOTL/HITL briefs will appear here for mentor review.
            </Text>
          </View>
        )}
      </ScrollView>
    );

  const renderSavedBrief = () => {
    if (!activeBrief) {
      return (
        <ScrollView contentContainerStyle={styles.homeContent}>
          {renderTopBar('Saved Brief', 'Brief not found.', 'User', openUserWorkspace)}
        </ScrollView>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.resultContent} showsVerticalScrollIndicator={false}>
        {renderTopBar(
          'Saved Brief',
          activeBrief.status.replace('_', ' '),
          'User',
          openUserWorkspace
        )}
        <LockedBriefCard brief={activeBrief.finalBrief} />
        <DraftSectionCard
          title="Future Plan"
          items={activeBrief.futurePlan}
          helperText={
            activeBrief.status === 'reviewed'
              ? 'Updated from mentor feedback.'
              : activeBrief.status === 'mentor_review'
                ? 'Waiting for mentor feedback.'
                : 'Saved without mentor review.'
          }
        />
        <DraftSectionCard
          title="Original Readiness"
          items={activeBrief.result.readiness.rationale}
          helperText={`${activeBrief.result.readiness.mode} / ${activeBrief.result.readiness.score}`}
          tone="muted"
        />
      </ScrollView>
    );
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        {screen === 'home' ? renderHome() : null}
        {screen === 'user' ? renderUserDashboard() : null}
        {screen === 'newBrief' ? renderNewBriefFlow() : null}
        {screen === 'mentor' ? renderMentorFlow() : null}
        {screen === 'savedBrief' ? renderSavedBrief() : null}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  screenShell: {
    flex: 1,
  },
  homeContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 34,
    gap: 18,
  },
  homeHero: {
    backgroundColor: palette.surface,
    borderRadius: 30,
    paddingHorizontal: 22,
    paddingVertical: 24,
    gap: 12,
    ...shadows,
  },
  homeEyebrow: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: palette.blueDeep,
    textTransform: 'uppercase',
  },
  homeTitle: {
    fontFamily: 'Newsreader_700Bold',
    fontSize: 38,
    lineHeight: 40,
    color: palette.ink,
  },
  homeSubtitle: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 15,
    lineHeight: 23,
    color: palette.inkSoft,
  },
  roleRow: {
    gap: 10,
    paddingTop: 6,
  },
  primaryButton: {
    backgroundColor: palette.blue,
    borderRadius: 18,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  primaryButtonText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: palette.blueSoft,
    borderRadius: 18,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  secondaryButtonText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 14,
    color: palette.blueDeep,
  },
  sectionHeader: {
    gap: 6,
  },
  quickStartCard: {
    backgroundColor: palette.surface,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 14,
    ...shadows,
  },
  sectionTitle: {
    fontFamily: 'Newsreader_700Bold',
    fontSize: 30,
    color: palette.ink,
  },
  sectionSubtitle: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    lineHeight: 21,
    color: palette.muted,
  },
  savedCard: {
    backgroundColor: palette.surface,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 12,
    ...shadows,
  },
  ticketCard: {
    backgroundColor: palette.amberSoft,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 12,
  },
  savedHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  savedTitle: {
    flex: 1,
    fontFamily: 'Newsreader_700Bold',
    fontSize: 26,
    lineHeight: 28,
    color: palette.ink,
  },
  statusPill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 10,
    color: palette.blueDeep,
    textTransform: 'uppercase',
  },
  savedMeta: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: palette.muted,
    textTransform: 'uppercase',
  },
  savedSummary: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    lineHeight: 22,
    color: palette.inkSoft,
  },
  emptyCard: {
    backgroundColor: palette.surfaceMuted,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 8,
  },
  emptyTitle: {
    fontFamily: 'Newsreader_700Bold',
    fontSize: 26,
    color: palette.ink,
  },
  emptyText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    lineHeight: 22,
    color: palette.inkSoft,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    gap: 8,
    backgroundColor: palette.background,
  },
  backChip: {
    alignSelf: 'flex-start',
    backgroundColor: palette.surfaceMuted,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backChipText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: palette.inkSoft,
  },
  topTitle: {
    fontFamily: 'Newsreader_700Bold',
    fontSize: 32,
    color: palette.ink,
  },
  topSubtitle: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    lineHeight: 20,
    color: palette.muted,
  },
  resultContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 34,
    gap: 18,
  },
  diagnosticSection: {
    gap: 12,
  },
  diagnosticTitle: {
    fontFamily: 'Newsreader_700Bold',
    fontSize: 28,
    color: palette.ink,
  },
  diagnosticSubtitle: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: palette.muted,
  },
  mentorCard: {
    backgroundColor: palette.surface,
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 14,
    ...shadows,
  },
  mentorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  mentorBadge: {
    backgroundColor: palette.blueSoft,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  mentorBadgeText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
    color: palette.blueDeep,
    textTransform: 'uppercase',
  },
  mentorMode: {
    fontFamily: 'Newsreader_700Bold',
    fontSize: 24,
    color: palette.ink,
  },
  mentorTitle: {
    fontFamily: 'Newsreader_700Bold',
    fontSize: 30,
    lineHeight: 32,
    color: palette.ink,
  },
  mentorSubtitle: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    lineHeight: 22,
    color: palette.inkSoft,
  },
  mentorGroup: {
    gap: 10,
  },
  mentorGroupTitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: palette.muted,
    textTransform: 'uppercase',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 999,
    marginTop: 8,
    backgroundColor: palette.amber,
  },
  itemText: {
    flex: 1,
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    lineHeight: 22,
    color: palette.inkSoft,
  },
  questionText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 14,
    lineHeight: 22,
    color: palette.ink,
  },
  feedbackCard: {
    backgroundColor: palette.surface,
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 12,
    ...shadows,
  },
  feedbackTitle: {
    fontFamily: 'Newsreader_700Bold',
    fontSize: 28,
    color: palette.ink,
  },
  feedbackHelper: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    lineHeight: 20,
    color: palette.muted,
  },
  feedbackInput: {
    minHeight: 132,
    backgroundColor: palette.surfaceMuted,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    lineHeight: 21,
    color: palette.ink,
  },
  feedbackAction: {
    backgroundColor: palette.blue,
    borderRadius: 18,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackActionDisabled: {
    opacity: 0.45,
  },
  feedbackActionText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: palette.success,
    borderRadius: 20,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
});
