import { useMemo, useState } from 'react';
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
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ContradictionCard } from './src/components/ContradictionCard';
import { DraftSectionCard } from './src/components/DraftSectionCard';
import { InputPanel } from './src/components/InputPanel';
import { LockedBriefCard } from './src/components/LockedBriefCard';
import { NextDecisionCard } from './src/components/NextDecisionCard';
import { ResultHeader } from './src/components/ResultHeader';
import { UndefinedAreaCard } from './src/components/UndefinedAreaCard';
import { sampleInput } from './src/data/sampleInput';
import { buildLockedBrief, distill } from './src/engine/distill';
import { palette } from './src/theme';
import {
  DistillationResult,
  DraftSection,
  NextDecision,
} from './src/types/draft';

function getSection(result: DistillationResult, title: DraftSection['title']) {
  return result.sections.find((section) => section.title === title);
}

export default function App() {
  const [rawInput, setRawInput] = useState('');
  const [result, setResult] = useState<DistillationResult | null>(null);
  const [isSummarySharpened, setIsSummarySharpened] = useState(false);
  const [isScopeTightened, setIsScopeTightened] = useState(false);
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

  const resolvedSelections = useMemo(
    () =>
      resolvedDecisionIds.reduce<Record<string, string>>((current, decisionId) => {
        const option = selectedDecisionOptions[decisionId];

        if (option) {
          current[decisionId] = option;
        }

        return current;
      }, {}),
    [resolvedDecisionIds, selectedDecisionOptions]
  );

  const lockedBrief = useMemo(
    () => (result ? buildLockedBrief(result, resolvedSelections) : null),
    [resolvedSelections, result]
  );

  const displayedResult = useMemo(() => {
    if (!result) {
      return null;
    }

    const summarySection = getSection(result, 'Concept Summary');
    const directionSection = getSection(result, 'Core Product Direction');
    const featureSection = getSection(result, 'Key Features');
    const constraintSection = getSection(result, 'Constraints and Boundaries');
    const hasLockedSelections = Boolean(lockedBrief && lockedBrief.resolvedCount > 0);

    return {
      summaryItems:
        hasLockedSelections && lockedBrief
          ? [lockedBrief.lockedSummary, ...(summarySection?.items.slice(1) ?? [])]
          : isSummarySharpened
            ? [result.refinements.sharpenedSummary]
            : summarySection?.items ?? [],
      directionItems:
        hasLockedSelections && lockedBrief
          ? lockedBrief.directionItems
          : directionSection?.items ?? [],
      featureItems: isScopeTightened
        ? result.refinements.focusedFeatures
        : hasLockedSelections && lockedBrief
          ? lockedBrief.featureFocus
        : featureSection?.items ?? [],
      constraintItems: isScopeTightened
        ? [
            result.refinements.scopeBoundary,
            ...(hasLockedSelections && lockedBrief ? lockedBrief.boundaryItems : []),
            ...(constraintSection?.items ?? []),
          ]
        : hasLockedSelections && lockedBrief
          ? [...lockedBrief.boundaryItems, ...(constraintSection?.items ?? [])]
        : constraintSection?.items ?? [],
    };
  }, [isScopeTightened, isSummarySharpened, lockedBrief, result]);

  if (!fontsLoaded) {
    return <View style={styles.loadingScreen} />;
  }

  const handleDistill = () => {
    const trimmed = rawInput.trim();

    if (!trimmed) {
      return;
    }

    setResult(distill(trimmed));
    setIsSummarySharpened(false);
    setIsScopeTightened(false);
    setResolvedDecisionIds([]);
    setSelectedDecisionOptions({});
  };

  const handleLoadSample = () => {
    setRawInput(sampleInput);
    setResult(null);
    setResolvedDecisionIds([]);
    setSelectedDecisionOptions({});
  };

  const handleClear = () => {
    setRawInput('');
    setResult(null);
    setResolvedDecisionIds([]);
    setSelectedDecisionOptions({});
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

  const problemSection = result ? getSection(result, 'Problem and Intent') : undefined;
  const hasLockedSelections = Boolean(lockedBrief && lockedBrief.resolvedCount > 0);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        {result ? (
          <ScrollView
            contentContainerStyle={styles.resultContent}
            showsVerticalScrollIndicator={false}
          >
            <ResultHeader
              title={result.title}
              metrics={result.metrics}
              onBack={() => setResult(null)}
            />

            <DraftSectionCard
              title="Concept Summary"
              items={displayedResult?.summaryItems ?? []}
              helperText={
                hasLockedSelections
                  ? 'This summary has been tightened by the resolved decisions below.'
                  : 'Structured from repeated signals across the raw notes.'
              }
              actionLabel={
                hasLockedSelections
                  ? undefined
                  : isSummarySharpened
                    ? 'Show Full'
                    : 'Sharpen Summary'
              }
              onAction={
                hasLockedSelections
                  ? undefined
                  : () => setIsSummarySharpened((current) => !current)
              }
            />

            <DraftSectionCard
              title="Problem and Intent"
              items={problemSection?.items ?? []}
              helperText="Why this concept should exist in its current form."
              tone="muted"
            />

            <DraftSectionCard
              title="Core Product Direction"
              items={displayedResult?.directionItems ?? []}
              helperText="The strongest product direction after overlap cleanup."
            />

            <DraftSectionCard
              title="Key Features"
              items={displayedResult?.featureItems ?? []}
              helperText="Only the feature ideas that survived deduplication."
              actionLabel={isScopeTightened ? 'Show Expanded' : 'Tighten Scope'}
              onAction={() => setIsScopeTightened((current) => !current)}
            />

            <DraftSectionCard
              title="Constraints and Boundaries"
              items={displayedResult?.constraintItems ?? []}
              helperText="Explicit limits help keep the draft decision-ready."
              tone="muted"
            />

            <View style={styles.diagnosticSection}>
              <Text style={styles.diagnosticTitle}>Contradictions and Tensions</Text>
              <Text style={styles.diagnosticSubtitle}>
                Signals that point in competing directions.
              </Text>
              {result.contradictions.length > 0 ? (
                result.contradictions.map((contradiction) => (
                  <ContradictionCard
                    key={contradiction.id}
                    contradiction={contradiction}
                  />
                ))
              ) : (
                <DraftSectionCard
                  title="No direct contradictions found"
                  items={[
                    'The current note dump stays mostly aligned around one direction.',
                  ]}
                  compact
                  tone="muted"
                />
              )}
            </View>

            <View style={styles.diagnosticSection}>
              <Text style={styles.diagnosticTitle}>Undefined Areas</Text>
              <Text style={styles.diagnosticSubtitle}>
                Gaps that still weaken the draft or make decisions harder.
              </Text>
              {result.undefinedAreas.map((area) => (
                <UndefinedAreaCard key={area.id} area={area} />
              ))}
            </View>

            <View style={styles.diagnosticSection}>
              <Text style={styles.diagnosticTitle}>Recommended Next Decisions</Text>
              <Text style={styles.diagnosticSubtitle}>
                Lightweight review actions stay inside the result screen.
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

            {lockedBrief ? (
              <View style={styles.diagnosticSection}>
                <Text style={styles.diagnosticTitle}>Decision-Locked Handoff</Text>
                <Text style={styles.diagnosticSubtitle}>
                  Bonus capability: resolved decisions tighten the concept into a handoff-ready v1 brief.
                </Text>
                <LockedBriefCard brief={lockedBrief} />
              </View>
            ) : null}
          </ScrollView>
        ) : (
          <InputPanel
            value={rawInput}
            onChangeText={setRawInput}
            onLoadSample={handleLoadSample}
            onClear={handleClear}
            onDistill={handleDistill}
          />
        )}
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
    letterSpacing: -0.5,
  },
  diagnosticSubtitle: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: palette.muted,
  },
});
