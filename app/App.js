import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Appbar,
  Button,
  Card,
  Chip,
  MD3DarkTheme,
  PaperProvider,
  ProgressBar,
  Snackbar,
  Surface,
  Text as PaperText,
  TextInput,
} from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { SAMPLE_PASTE, SOURCE_OPTIONS } from './src/noktaEngine';
import { analyzeNotes, chatAboutNotes, getOpenRouterAnalysisConfig } from './src/openaiNotes';

const theme = {
  ...MD3DarkTheme,
  roundness: 18,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#7c5cff',
    secondary: '#22c7a2',
    tertiary: '#ffb84d',
    background: '#07101d',
    surface: '#10192c',
    surfaceVariant: '#18233d',
    onSurface: '#f5f7ff',
    onSurfaceVariant: '#b2bddf',
  },
};

function App() {
  const aiConfig = useMemo(() => getOpenRouterAnalysisConfig(), []);
  const [currentSource, setCurrentSource] = useState('WhatsApp');
  const [rawText, setRawText] = useState(SAMPLE_PASTE);
  const [noteDraft, setNoteDraft] = useState('');
  const [noteItems, setNoteItems] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatting, setIsChatting] = useState(false);
  const [notice, setNotice] = useState('');

  const composedText = useMemo(() => {
    const chunks = [rawText.trim(), ...noteItems].filter(Boolean);
    return chunks.join('\n\n');
  }, [noteItems, rawText]);

  const selectedCard = useMemo(() => {
    if (!analysis?.cards?.length) {
      return null;
    }

    return (
      analysis.cards.find((card) => card.id === selectedCardId) || analysis.cards[0] || null
    );
  }, [analysis, selectedCardId]);

  const stats = analysis?.stats || {
    totalNotes: 0,
    clusters: 0,
    avgConfidence: 0,
  };

  const configLabel = aiConfig.enabled ? `${aiConfig.providerLabel} ${aiConfig.model}` : 'Local fallback';
  const modeLabel =
    analysis?.providerLabel === 'Local'
      ? 'Local fallback'
      : analysis?.providerLabel
      ? `${analysis.providerLabel} ${analysis.model}`
      : configLabel;

  const selectedDecisionLabel = selectedCard
    ? selectedCard.aiRecommendation === 'merge'
      ? 'Merge'
      : selectedCard.aiRecommendation === 'keep-separate'
      ? 'Keep separate'
      : 'Review'
    : 'Review';

  const noteCountLabel = noteItems.length ? `${noteItems.length} ek not` : 'Hazır';

  const buildNoteSources = () =>
    noteItems.map((text, index) => ({
      id: `note-${index}`,
      source: currentSource,
      text,
    }));

  const handleLoadSample = () => {
    setRawText(SAMPLE_PASTE);
    setNoteDraft('');
    setNoteItems([]);
    setChatInput('');
    setChatMessages([]);
    setCurrentSource('WhatsApp');
    setAnalysis(null);
    setSelectedCardId(null);
    setNotice('Sample notes loaded.');
  };

  const handleReset = () => {
    setRawText('');
    setNoteDraft('');
    setNoteItems([]);
    setChatInput('');
    setChatMessages([]);
    setAnalysis(null);
    setSelectedCardId(null);
    setCurrentSource('WhatsApp');
    setNotice('Workspace cleared.');
  };

  const handleAddNote = () => {
    const trimmed = noteDraft.trim();

    if (!trimmed) {
      setNotice('Eklemek için kısa bir not yaz.');
      return;
    }

    setNoteItems((prev) => [...prev, trimmed]);
    setNoteDraft('');
    setNotice('Ek not eklendi.');
  };

  const handleRemoveNote = (indexToRemove) => {
    setNoteItems((prev) => prev.filter((_, index) => index !== indexToRemove));
    setNotice('Ek not silindi.');
  };

  const handleAnalyze = async () => {
    if (!composedText.trim()) {
      setNotice('Paste some notes first.');
      return;
    }

    setIsAnalyzing(true);

    try {
      const result = await analyzeNotes({ rawText: composedText, source: currentSource });
      setAnalysis(result);
      setSelectedCardId(result.cards[0]?.id || null);
      setChatMessages([]);
      setChatInput('');

      if (result.provider && result.provider !== 'local') {
        setNotice(`${result.providerLabel} cevap verdi: ${result.model}.`);
      } else if (result.error) {
        setNotice(`Local fallback kullanildi: ${result.error}`);
      } else {
        setNotice('Local analiz hazir.');
      }
    } catch (error) {
      setNotice(error.message || 'Analysis failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendChat = async () => {
    const question = chatInput.trim();

    if (!question) {
      setNotice('Sohbet icin bir soru yaz.');
      return;
    }

    const nextHistory = [...chatMessages, { role: 'user', content: question }];
    setChatMessages(nextHistory);
    setChatInput('');
    setIsChatting(true);

    try {
      const reply = await chatAboutNotes({
        question,
        rawText: composedText,
        source: currentSource,
        notes: buildNoteSources(),
        cards: analysis?.cards || [],
        analysis,
        history: nextHistory,
      });

      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: reply.reply,
          meta: reply.providerLabel ? `${reply.providerLabel}${reply.model ? ` ${reply.model}` : ''}` : '',
        },
      ]);

      if (reply.error && reply.provider === 'local') {
        setNotice(`Sohbet yerel modda: ${reply.error}`);
      } else if (reply.providerLabel) {
        setNotice(`${reply.providerLabel} sohbet cevabi hazir.`);
      }
    } catch (error) {
      setNotice(error.message || 'Chat failed.');
    } finally {
      setIsChatting(false);
    }
  };

  const handleShare = async () => {
    if (!analysis) {
      setNotice('No analysis to share.');
      return;
    }

    const lines = [
      'Nokta AI note analysis',
      `Mode: ${modeLabel}`,
      `Title: ${analysis.title}`,
      '',
      analysis.summary,
      '',
      analysis.directAnswer,
      '',
      'Next steps:',
      ...(analysis.nextSteps.length
        ? analysis.nextSteps.map((step) => `- ${step}`)
        : ['- No next steps yet.']),
    ];

    await Share.share({
      message: lines.join('\n'),
    });
  };

  const heroDescription = aiConfig.enabled
    ? `Notlari yapistir, local dedup kartlarini gor ve ${aiConfig.providerLabel} cevabini ayni ekranda al.`
    : 'Notlari yapistir, local dedup kartlarini gor ve API yoksa yerel cevapla devam et.';

  return (
    <PaperProvider theme={theme}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.backdropOne} />
        <View style={styles.backdropTwo} />

        <Appbar.Header style={styles.appbar}>
          <Appbar.Content
            title="Nokta AI"
            subtitle="Track C note analysis"
            titleStyle={styles.appbarTitle}
            subtitleStyle={styles.appbarSubtitle}
          />
          <Appbar.Action icon="book-open-variant" onPress={handleLoadSample} />
          <Appbar.Action icon="share-variant" onPress={handleShare} disabled={!analysis} />
          <Appbar.Action icon="refresh" onPress={handleReset} />
        </Appbar.Header>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <Surface style={styles.heroCard} elevation={1}>
              <View style={styles.heroHeader}>
                <View style={styles.heroCopy}>
                  <PaperText variant="headlineSmall" style={styles.heroTitle}>
                    Yapistir, analiz et, cevap al.
                  </PaperText>
                  <PaperText style={styles.heroSubtitle}>{heroDescription}</PaperText>
                </View>
                <Chip
                  icon={aiConfig.enabled ? 'robot' : 'cloud-off-outline'}
                  style={styles.heroChip}
                >
                  {configLabel}
                </Chip>
              </View>

              <View style={styles.metricGrid}>
                <MetricTile
                  label="Notes"
                  value={stats.totalNotes}
                  hint="raw input"
                  accent="primary"
                />
                <MetricTile
                  label="Cards"
                  value={analysis?.cards?.length || 0}
                  hint="dedup output"
                  accent="secondary"
                />
                <MetricTile
                  label="Confidence"
                  value={`${Math.round((stats.avgConfidence || 0) * 100)}%`}
                  hint="board average"
                  accent="tertiary"
                />
                <MetricTile label="Mode" value={modeLabel} hint="analysis source" accent="primary" />
              </View>
            </Surface>

            <Surface style={styles.panelCard} elevation={1}>
              <View style={styles.panelHeader}>
                <View>
                  <PaperText variant="titleLarge" style={styles.panelTitle}>
                    Capture workspace
                  </PaperText>
                  <PaperText style={styles.panelSubtitle}>
                    Prefixes like `wa:` or `mail:` override the selected source.
                  </PaperText>
                </View>
                <Chip icon="information-outline" style={styles.helperChip}>
                  Single-screen flow
                </Chip>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.sourceRail}
              >
                {SOURCE_OPTIONS.map((option) => (
                  <Chip
                    key={option.key}
                    selected={currentSource === option.key}
                    icon={option.icon}
                    style={[
                      styles.sourceChip,
                      currentSource === option.key && styles.sourceChipSelected,
                    ]}
                    onPress={() => setCurrentSource(option.key)}
                  >
                    {option.label}
                  </Chip>
                ))}
              </ScrollView>

              <TextInput
                value={rawText}
                onChangeText={setRawText}
                mode="outlined"
                multiline
                numberOfLines={10}
                placeholder="Paste WhatsApp exports, bullet notes, email snippets, or voice note transcriptions..."
                style={styles.input}
                outlineStyle={styles.inputOutline}
                textColor={theme.colors.onSurface}
                activeOutlineColor={theme.colors.primary}
              />

              <View style={styles.noteBlock}>
                <View style={styles.panelHeader}>
                  <View>
                    <PaperText variant="titleMedium" style={styles.sectionTitle}>
                      Ek not kuyruğu
                    </PaperText>
                    <PaperText style={styles.panelSubtitle}>
                      Birden fazla kısa not ekle. Analiz hepsini birlikte işler.
                    </PaperText>
                  </View>
                  <Chip icon="plus-circle-outline" style={styles.helperChip}>
                    {noteCountLabel}
                  </Chip>
                </View>

                <View style={styles.noteComposerRow}>
                  <TextInput
                    value={noteDraft}
                    onChangeText={setNoteDraft}
                    mode="outlined"
                    placeholder="Kisa bir ek not yaz..."
                    style={styles.noteDraftInput}
                    outlineStyle={styles.inputOutline}
                    textColor={theme.colors.onSurface}
                    activeOutlineColor={theme.colors.primary}
                  />
                  <Button
                    mode="contained"
                    icon="plus"
                    onPress={handleAddNote}
                    style={styles.noteAddButton}
                  >
                    Add note
                  </Button>
                </View>

                {noteItems.length ? (
                  <View style={styles.noteStack}>
                    {noteItems.map((note, index) => (
                      <Surface key={`${index}-${note.slice(0, 12)}`} style={styles.noteCard} elevation={0}>
                        <View style={styles.noteCardHeader}>
                          <Chip icon="note-text-outline" style={styles.metaChip}>
                            Note {index + 1}
                          </Chip>
                          <Button
                            mode="text"
                            compact
                            icon="close"
                            onPress={() => handleRemoveNote(index)}
                            textColor={theme.colors.onSurfaceVariant}
                          >
                            Sil
                          </Button>
                        </View>
                        <PaperText style={styles.noteCardText}>{note}</PaperText>
                      </Surface>
                    ))}
                  </View>
                ) : (
                  <PaperText style={styles.panelSubtitle}>
                    Buraya tek tek not ekleyebilir veya ana kutuya uzun bir blok yapıştırabilirsin.
                  </PaperText>
                )}
              </View>

              <View style={styles.actionRow}>
                <Button
                  mode="contained"
                  icon="auto-fix"
                  onPress={handleAnalyze}
                  loading={isAnalyzing}
                  disabled={isAnalyzing || !composedText.trim()}
                  style={styles.primaryButton}
                >
                  Analyze notes
                </Button>
                <Button
                  mode="outlined"
                  icon="book-open-variant"
                  onPress={handleLoadSample}
                  style={styles.secondaryButton}
                >
                  Load sample
                </Button>
                <Button
                  mode="text"
                  icon="restart"
                  onPress={handleReset}
                  textColor={theme.colors.onSurfaceVariant}
                >
                  Reset
                </Button>
              </View>

              {isAnalyzing ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <PaperText style={styles.loadingText}>Analyzing notes with AI...</PaperText>
                </View>
              ) : null}
            </Surface>

            {analysis ? (
              <Surface style={styles.panelCard} elevation={1}>
                <View style={styles.panelHeader}>
                  <View>
                    <PaperText variant="titleLarge" style={styles.panelTitle}>
                      AI answer
                    </PaperText>
                    <PaperText style={styles.panelSubtitle}>
                      The same request returns a short summary, next steps, and per-card reasoning.
                    </PaperText>
                  </View>
                  <Chip
                    icon={analysis.provider !== 'local' ? 'robot-outline' : 'cloud-off-outline'}
                    style={styles.helperChip}
                  >
                    {modeLabel}
                  </Chip>
                </View>

                <PaperText variant="titleLarge" style={styles.answerTitle}>
                  {analysis.title}
                </PaperText>
                <PaperText style={styles.answerSummary}>{analysis.summary}</PaperText>

                <Surface style={styles.answerBubble} elevation={0}>
                  <PaperText style={styles.answerText}>{analysis.directAnswer}</PaperText>
                </Surface>

                <View style={styles.sectionBlock}>
                  <PaperText style={styles.sectionTitle}>Next steps</PaperText>
                  {analysis.nextSteps.length ? (
                    analysis.nextSteps.map((step) => (
                      <PaperText key={step} style={styles.bulletText}>
                        {'\u2022'} {step}
                      </PaperText>
                    ))
                  ) : (
                    <PaperText style={styles.panelSubtitle}>No next steps yet.</PaperText>
                  )}
                </View>

                <View style={styles.sectionBlock}>
                  <PaperText style={styles.sectionTitle}>Risk notes</PaperText>
                  {analysis.riskNotes.length ? (
                    analysis.riskNotes.map((note) => (
                      <PaperText key={note} style={styles.bulletText}>
                        {'\u2022'} {note}
                      </PaperText>
                    ))
                  ) : (
                    <PaperText style={styles.panelSubtitle}>No risk notes returned.</PaperText>
                  )}
                </View>

                <View style={styles.sessionFooter}>
                  <Chip icon="badge-account-horizontal-outline" style={styles.helperChip}>
                    {analysis.mentorHint}
                  </Chip>
                  {analysis.error ? (
                    <Chip icon="alert-outline" style={styles.helperChip}>
                      {analysis.error}
                    </Chip>
                  ) : null}
                </View>
              </Surface>
            ) : (
              <Surface style={styles.panelCard} elevation={1}>
                <PaperText variant="titleMedium" style={styles.emptyTitle}>
                  No analysis yet.
                </PaperText>
                <PaperText style={styles.panelSubtitle}>
                  Paste notes and press Analyze notes to get the AI summary and answers.
                </PaperText>
              </Surface>
            )}

            <Surface style={styles.panelCard} elevation={1}>
              <View style={styles.panelHeader}>
                <View>
                  <PaperText variant="titleLarge" style={styles.panelTitle}>
                    Idea cards
                  </PaperText>
                  <PaperText style={styles.panelSubtitle}>
                    Local clustering keeps source provenance visible before the AI answer lands.
                  </PaperText>
                </View>
                <Chip icon="shape-outline" style={styles.helperChip}>
                  {analysis?.cards?.length ? `${analysis.cards.length} cards` : 'No cards yet'}
                </Chip>
              </View>

              {!analysis?.cards?.length ? (
                <View style={styles.emptyState}>
                  <PaperText variant="titleMedium" style={styles.emptyTitle}>
                    Nothing has been clustered yet.
                  </PaperText>
                  <PaperText style={styles.panelSubtitle}>
                    Use the sample notes or paste your own text, then run Analyze notes.
                  </PaperText>
                </View>
              ) : (
                <View style={styles.cardStack}>
                  {analysis.cards.map((card) => {
                    const isActive = card.id === selectedCard?.id;
                    const recommendationLabel =
                      card.aiRecommendation === 'merge'
                        ? 'Merge'
                        : card.aiRecommendation === 'keep-separate'
                        ? 'Keep separate'
                        : 'Review';

                    return (
                      <Pressable
                        key={card.id}
                        onPress={() => setSelectedCardId(card.id)}
                        style={({ pressed }) => [
                          styles.ideaPressable,
                          pressed && styles.ideaPressablePressed,
                        ]}
                      >
                        <Card
                          style={[
                            styles.ideaCard,
                            isActive && styles.ideaCardActive,
                          ]}
                        >
                          <Card.Content>
                            <View style={styles.ideaTopRow}>
                              <Chip icon="source-branch" style={styles.metaChip}>
                                {card.sourceSummary}
                              </Chip>
                              <Chip icon="sparkles" style={styles.metaChip}>
                                {recommendationLabel}
                              </Chip>
                            </View>

                            <PaperText variant="titleLarge" style={styles.ideaTitle}>
                              {card.title}
                            </PaperText>
                            <PaperText style={styles.ideaSummary}>{card.summary}</PaperText>

                            <View style={styles.progressHeader}>
                              <PaperText style={styles.progressLabel}>Confidence</PaperText>
                              <PaperText style={styles.progressValue}>
                                {Math.round(card.confidence * 100)}% - {card.confidenceLabel}
                              </PaperText>
                            </View>
                            <ProgressBar
                              progress={card.confidence}
                              style={styles.progressBar}
                              color={
                                card.confidence >= 0.78
                                  ? theme.colors.secondary
                                  : theme.colors.primary
                              }
                            />

                            <View style={styles.keywordWrap}>
                              {card.keywords.map((keyword) => (
                                <Chip key={keyword} compact style={styles.keywordChip}>
                                  {keyword}
                                </Chip>
                              ))}
                            </View>

                            <View style={styles.detailGrid}>
                              <InfoTile label="Notes" value={card.noteCount} />
                              <InfoTile label="Sources" value={card.uniqueSources} />
                              <InfoTile label="Match" value={`${Math.round((card.avgMatchScore || 0) * 100)}%`} />
                            </View>

                            <View style={styles.matchBox}>
                              <PaperText style={styles.matchLabel}>AI answer</PaperText>
                              <PaperText style={styles.feedbackText} numberOfLines={3}>
                                {card.aiAnswer}
                              </PaperText>
                            </View>

                            <View style={styles.matchBox}>
                              <PaperText style={styles.matchLabel}>AI reason</PaperText>
                              <PaperText style={styles.historyText}>{card.aiReason}</PaperText>
                            </View>

                            <View style={styles.matchBox}>
                              <PaperText style={styles.matchLabel}>Closest merge candidate</PaperText>
                              <PaperText style={styles.matchValue}>
                                {card.closeMatch
                                  ? `${card.closeMatch.title} (${Math.round(card.closeMatch.score * 100)}%)`
                                  : 'No close match'}
                              </PaperText>
                            </View>
                          </Card.Content>
                        </Card>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </Surface>

            {selectedCard ? (
              <Surface style={styles.panelCard} elevation={1}>
                <View style={styles.panelHeader}>
                  <View>
                    <PaperText variant="titleLarge" style={styles.panelTitle}>
                      Selected card details
                    </PaperText>
                    <PaperText style={styles.panelSubtitle}>
                      Tap a card above to inspect the full AI answer and why it grouped this way.
                    </PaperText>
                  </View>
                  <Chip icon="book-open-variant" style={styles.helperChip}>
                    {selectedCard.title}
                  </Chip>
                </View>

                <PaperText variant="titleLarge" style={styles.answerTitle}>
                  {selectedCard.title}
                </PaperText>
                <PaperText style={styles.answerSummary}>{selectedCard.summary}</PaperText>

                <Surface style={styles.answerBubble} elevation={0}>
                  <PaperText style={styles.answerText}>{selectedCard.aiAnswer}</PaperText>
                </Surface>

                <View style={styles.detailGrid}>
                  <InfoTile label="Decision" value={selectedDecisionLabel} />
                  <InfoTile label="Confidence" value={`${Math.round(selectedCard.aiConfidence * 100)}%`} />
                  <InfoTile label="Sources" value={selectedCard.uniqueSources} />
                </View>

                <View style={styles.matchBox}>
                  <PaperText style={styles.matchLabel}>Why it grouped here</PaperText>
                  <PaperText style={styles.feedbackText}>{selectedCard.aiReason}</PaperText>
                </View>

                <View style={styles.keywordWrap}>
                  {selectedCard.provenance.map((entry) => (
                    <Chip key={entry.source} compact style={styles.keywordChip}>
                      {entry.source} x{entry.count}
                    </Chip>
                  ))}
                </View>
              </Surface>
            ) : null}

            <Surface style={styles.panelCard} elevation={1}>
              <View style={styles.panelHeader}>
                <View>
                  <PaperText variant="titleLarge" style={styles.panelTitle}>
                    AI sohbeti
                  </PaperText>
                  <PaperText style={styles.panelSubtitle}>
                    Notların hakkında soru sor, AI cevapları aynı ekranda alt alta biriktirsin.
                  </PaperText>
                </View>
                <Chip icon="chat-processing-outline" style={styles.helperChip}>
                  {chatMessages.length ? `${chatMessages.length} mesaj` : 'Hazır'}
                </Chip>
              </View>

              {chatMessages.length ? (
                <View style={styles.chatStack}>
                  {chatMessages.map((message, index) => {
                    const isUser = message.role === 'user';
                    return (
                      <View
                        key={`${message.role}-${index}-${message.content.slice(0, 12)}`}
                        style={[styles.chatRow, isUser ? styles.chatRowUser : styles.chatRowAssistant]}
                      >
                        <Surface
                          style={[
                            styles.chatBubble,
                            isUser ? styles.chatBubbleUser : styles.chatBubbleAssistant,
                          ]}
                          elevation={0}
                        >
                          <View style={styles.chatBubbleHeader}>
                            <Chip
                              compact
                              icon={isUser ? 'account' : 'robot-outline'}
                              style={isUser ? styles.userChip : styles.aiChip}
                            >
                              {isUser ? 'Sen' : 'Nokta AI'}
                            </Chip>
                            {message.meta ? (
                              <PaperText style={styles.chatMeta}>{message.meta}</PaperText>
                            ) : null}
                          </View>
                          <PaperText style={styles.chatText}>{message.content}</PaperText>
                        </Surface>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <PaperText variant="titleMedium" style={styles.emptyTitle}>
                    Henüz sohbet yok.
                  </PaperText>
                  <PaperText style={styles.panelSubtitle}>
                    Birden fazla not ekledikten sonra bir soru yaz ve AI ile konuşmaya başla.
                  </PaperText>
                </View>
              )}

              <View style={styles.chatComposerRow}>
                <TextInput
                  value={chatInput}
                  onChangeText={setChatInput}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  placeholder="Notlar hakkında soru sor..."
                  style={styles.chatInput}
                  outlineStyle={styles.inputOutline}
                  textColor={theme.colors.onSurface}
                  activeOutlineColor={theme.colors.primary}
                />
                <Button
                  mode="contained"
                  icon="send"
                  onPress={handleSendChat}
                  loading={isChatting}
                  disabled={isChatting || !chatInput.trim()}
                  style={styles.chatSendButton}
                >
                  Gönder
                </Button>
              </View>
            </Surface>

            <Surface style={styles.footerCard} elevation={0}>
              <PaperText style={styles.footerText}>
                Set `EXPO_PUBLIC_OPENROUTER_API_KEY` and optionally
                `EXPO_PUBLIC_OPENROUTER_MODEL=openai/gpt-4o-mini` in `app/.env`. If you only have the
                legacy OpenAI vars, the app still accepts them, and if no key is present it falls back
                to local clustering and answers.
              </PaperText>
            </Surface>
          </ScrollView>
        </KeyboardAvoidingView>

        <Snackbar
          visible={Boolean(notice)}
          onDismiss={() => setNotice('')}
          duration={2400}
          style={styles.snackbar}
        >
          {notice}
        </Snackbar>
      </SafeAreaView>
    </PaperProvider>
  );
}

function MetricTile({ label, value, hint, accent }) {
  return (
    <Surface style={[styles.metricTile, styles[`metricTile${accent}`]]} elevation={0}>
      <PaperText style={styles.metricLabel}>{label}</PaperText>
      <PaperText variant="headlineSmall" style={styles.metricValue}>
        {value}
      </PaperText>
      <PaperText style={styles.metricHint}>{hint}</PaperText>
    </Surface>
  );
}

function InfoTile({ label, value }) {
  return (
    <Surface style={styles.infoTile} elevation={0}>
      <PaperText style={styles.infoLabel}>{label}</PaperText>
      <PaperText style={styles.infoValue}>{value}</PaperText>
    </Surface>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  flex: {
    flex: 1,
  },
  backdropOne: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(124, 92, 255, 0.16)',
  },
  backdropTwo: {
    position: 'absolute',
    bottom: 120,
    left: -110,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(34, 199, 162, 0.12)',
  },
  appbar: {
    backgroundColor: 'rgba(7, 16, 29, 0.96)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  appbarTitle: {
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  appbarSubtitle: {
    color: theme.colors.onSurfaceVariant,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  heroCard: {
    borderRadius: 28,
    padding: 18,
    backgroundColor: 'rgba(16, 25, 44, 0.94)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  heroHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  heroCopy: {
    flex: 1,
  },
  heroTitle: {
    color: theme.colors.onSurface,
    fontWeight: '800',
  },
  heroSubtitle: {
    color: theme.colors.onSurfaceVariant,
    marginTop: 8,
    lineHeight: 20,
  },
  heroChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(34, 199, 162, 0.12)',
  },
  metricGrid: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricTile: {
    borderRadius: 18,
    padding: 14,
    minWidth: '47%',
    flexGrow: 1,
    backgroundColor: theme.colors.surface,
  },
  metricTilePrimary: {
    borderWidth: 1,
    borderColor: 'rgba(124, 92, 255, 0.22)',
  },
  metricTileSecondary: {
    borderWidth: 1,
    borderColor: 'rgba(34, 199, 162, 0.22)',
  },
  metricTileTertiary: {
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 77, 0.22)',
  },
  metricLabel: {
    color: theme.colors.onSurfaceVariant,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  metricValue: {
    color: theme.colors.onSurface,
    fontWeight: '800',
    marginTop: 6,
  },
  metricHint: {
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  panelCard: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: 'rgba(16, 25, 44, 0.94)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: 14,
  },
  panelHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  panelTitle: {
    color: theme.colors.onSurface,
    fontWeight: '800',
  },
  panelSubtitle: {
    color: theme.colors.onSurfaceVariant,
    marginTop: 6,
    lineHeight: 20,
  },
  noteBlock: {
    gap: 12,
  },
  noteComposerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  noteDraftInput: {
    flex: 1,
    backgroundColor: 'rgba(8, 13, 23, 0.7)',
  },
  noteAddButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  noteStack: {
    gap: 10,
  },
  noteCard: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    gap: 10,
  },
  noteCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  noteCardText: {
    color: theme.colors.onSurface,
    lineHeight: 20,
  },
  helperChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(124, 92, 255, 0.12)',
  },
  sourceRail: {
    gap: 10,
    paddingBottom: 6,
  },
  sourceChip: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  sourceChipSelected: {
    backgroundColor: 'rgba(124, 92, 255, 0.24)',
  },
  input: {
    backgroundColor: 'rgba(8, 13, 23, 0.7)',
  },
  inputOutline: {
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    alignItems: 'center',
  },
  primaryButton: {
    minWidth: 150,
  },
  secondaryButton: {
    minWidth: 120,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 4,
  },
  loadingText: {
    color: theme.colors.onSurfaceVariant,
  },
  answerTitle: {
    color: theme.colors.onSurface,
    fontWeight: '800',
  },
  answerSummary: {
    color: theme.colors.onSurfaceVariant,
    lineHeight: 20,
  },
  answerBubble: {
    borderRadius: 18,
    backgroundColor: 'rgba(124, 92, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(124, 92, 255, 0.18)',
    padding: 14,
  },
  answerText: {
    color: theme.colors.onSurface,
    lineHeight: 21,
  },
  sectionBlock: {
    gap: 6,
  },
  sectionTitle: {
    color: theme.colors.onSurface,
    fontWeight: '700',
    marginBottom: 2,
  },
  bulletText: {
    color: theme.colors.onSurfaceVariant,
    lineHeight: 20,
  },
  sessionFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  emptyState: {
    borderRadius: 18,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'flex-start',
    gap: 8,
  },
  emptyTitle: {
    color: theme.colors.onSurface,
    fontWeight: '700',
  },
  cardStack: {
    gap: 12,
  },
  ideaPressable: {
    borderRadius: 20,
  },
  ideaPressablePressed: {
    opacity: 0.9,
  },
  ideaCard: {
    borderRadius: 20,
    backgroundColor: 'rgba(8, 13, 23, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  ideaCardActive: {
    borderColor: 'rgba(124, 92, 255, 0.6)',
    shadowColor: '#7c5cff',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  ideaTopRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  metaChip: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  ideaTitle: {
    color: theme.colors.onSurface,
    fontWeight: '800',
  },
  ideaSummary: {
    color: theme.colors.onSurfaceVariant,
    marginTop: 8,
    lineHeight: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  progressLabel: {
    color: theme.colors.onSurfaceVariant,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  progressValue: {
    color: theme.colors.onSurfaceVariant,
    fontSize: 12,
  },
  progressBar: {
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  keywordWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  keywordChip: {
    backgroundColor: 'rgba(34, 199, 162, 0.12)',
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  infoTile: {
    minWidth: '31%',
    flexGrow: 1,
    borderRadius: 14,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  infoLabel: {
    color: theme.colors.onSurfaceVariant,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  infoValue: {
    color: theme.colors.onSurface,
    marginTop: 4,
    fontWeight: '700',
  },
  matchBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  matchLabel: {
    color: theme.colors.onSurfaceVariant,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  matchValue: {
    color: theme.colors.onSurface,
    lineHeight: 19,
  },
  feedbackText: {
    color: theme.colors.onSurface,
    lineHeight: 19,
  },
  historyText: {
    color: theme.colors.onSurfaceVariant,
    lineHeight: 19,
  },
  footerCard: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  footerText: {
    color: theme.colors.onSurfaceVariant,
    lineHeight: 20,
  },
  chatStack: {
    gap: 10,
  },
  chatRow: {
    flexDirection: 'row',
  },
  chatRowUser: {
    justifyContent: 'flex-end',
  },
  chatRowAssistant: {
    justifyContent: 'flex-start',
  },
  chatBubble: {
    maxWidth: '92%',
    borderRadius: 18,
    padding: 14,
    gap: 8,
  },
  chatBubbleUser: {
    backgroundColor: 'rgba(124, 92, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(124, 92, 255, 0.24)',
  },
  chatBubbleAssistant: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  chatBubbleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
  userChip: {
    backgroundColor: 'rgba(124, 92, 255, 0.22)',
  },
  aiChip: {
    backgroundColor: 'rgba(34, 199, 162, 0.14)',
  },
  chatMeta: {
    color: theme.colors.onSurfaceVariant,
    fontSize: 11,
  },
  chatText: {
    color: theme.colors.onSurface,
    lineHeight: 20,
  },
  chatComposerRow: {
    gap: 10,
    marginTop: 12,
  },
  chatInput: {
    backgroundColor: 'rgba(8, 13, 23, 0.7)',
  },
  chatSendButton: {
    alignSelf: 'flex-start',
  },
  snackbar: {
    backgroundColor: theme.colors.surfaceVariant,
  },
});

export default App;
