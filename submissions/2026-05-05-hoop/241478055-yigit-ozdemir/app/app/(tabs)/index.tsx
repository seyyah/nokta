import React, { useState, useCallback } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NoktaColors } from '@/constants/theme';

import NoktaHeader from '@/components/nokta/NoktaHeader';
import StepIndicator from '@/components/nokta/StepIndicator';
import CaptureView from '@/components/nokta/CaptureView';
import EnrichView from '@/components/nokta/EnrichView';
import ArtifactView from '@/components/nokta/ArtifactView';
import LoadingOverlay from '@/components/nokta/LoadingOverlay';
import ErrorCard from '@/components/nokta/ErrorCard';

import {
  generateQuestions,
  generateArtifact,
  type AIError,
} from '@/services/aiService';
import type { ArtifactData } from '@/components/nokta/ArtifactView';

// ─── Uygulama Durum Tipleri ─────────────────────────────────

type AppState =
  | { phase: 'capture' }
  | { phase: 'loading-questions'; rawIdea: string }
  | { phase: 'error-questions'; rawIdea: string; error: AIError }
  | { phase: 'enrich'; rawIdea: string; questions: string[] }
  | { phase: 'loading-artifact'; rawIdea: string; questions: string[]; answers: string[] }
  | { phase: 'error-artifact'; rawIdea: string; questions: string[]; answers: string[]; error: AIError }
  | { phase: 'artifact'; rawIdea: string; questions: string[]; answers: string[]; artifact: ArtifactData };

function getStepNumber(phase: AppState['phase']): 1 | 2 | 3 {
  switch (phase) {
    case 'capture':
    case 'loading-questions':
    case 'error-questions':
      return 1;
    case 'enrich':
    case 'loading-artifact':
    case 'error-artifact':
      return 2;
    case 'artifact':
      return 3;
  }
}

export default function MainScreen() {
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<AppState>({ phase: 'capture' });

  // ─── Faz 1 → 2: Soru Üret ────────────────────────────────
  const handleCaptureSubmit = useCallback(async (text: string) => {
    setState({ phase: 'loading-questions', rawIdea: text });

    const result = await generateQuestions(text);

    if (result.success) {
      setState({
        phase: 'enrich',
        rawIdea: text,
        questions: result.questions,
      });
    } else {
      setState({
        phase: 'error-questions',
        rawIdea: text,
        error: result.error,
      });
    }
  }, []);

  // ─── Faz 2 → 3: Çıktı Oluştur ────────────────────────────
  const handleEnrichSubmit = useCallback(
    async (answers: string[]) => {
      if (state.phase !== 'enrich') return;

      setState({
        phase: 'loading-artifact',
        rawIdea: state.rawIdea,
        questions: state.questions,
        answers,
      });

      const result = await generateArtifact(state.rawIdea, state.questions, answers);

      if (result.success) {
        setState({
          phase: 'artifact',
          rawIdea: state.rawIdea,
          questions: state.questions,
          answers,
          artifact: result.artifact,
        });
      } else {
        setState({
          phase: 'error-artifact',
          rawIdea: state.rawIdea,
          questions: state.questions,
          answers,
          error: result.error,
        });
      }
    },
    [state]
  );

  // ─── Navigasyon yardımcıları ──────────────────────────────
  const handleBackToCapture = useCallback(() => {
    setState({ phase: 'capture' });
  }, []);

  const handleReset = useCallback(() => {
    setState({ phase: 'capture' });
  }, []);

  const handleRetryQuestions = useCallback(() => {
    if (state.phase === 'error-questions') {
      if (state.error.type === 'SLOP_DETECTED') {
        setState({ phase: 'capture' });
      } else {
        handleCaptureSubmit(state.rawIdea);
      }
    }
  }, [state, handleCaptureSubmit]);

  const handleRetryArtifact = useCallback(() => {
    if (state.phase === 'error-artifact') {
      handleEnrichSubmit(state.answers);
    }
  }, [state, handleEnrichSubmit]);

  // ─── Render ───────────────────────────────────────────────
  const renderContent = () => {
    switch (state.phase) {
      case 'capture':
        return <CaptureView onSubmit={handleCaptureSubmit} />;

      case 'loading-questions':
        return (
          <LoadingOverlay
            message="Noktanız analiz ediliyor..."
            subMessage="AI, fikrinizi rafine etmek için hedefli mühendislik soruları üretiyor."
          />
        );

      case 'error-questions':
        return <ErrorCard error={state.error} onRetry={handleRetryQuestions} />;

      case 'enrich':
        return (
          <EnrichView
            originalIdea={state.rawIdea}
            questions={state.questions}
            onSubmit={handleEnrichSubmit}
            onBack={handleBackToCapture}
          />
        );

      case 'loading-artifact':
        return (
          <LoadingOverlay
            message="Çıktı sentezleniyor..."
            subMessage="Mühendislik soru-cevap verilerinden Proje Anayasanız oluşturuluyor."
          />
        );

      case 'error-artifact':
        return <ErrorCard error={state.error} onRetry={handleRetryArtifact} />;

      case 'artifact':
        return (
          <ArtifactView
            originalIdea={state.rawIdea}
            artifact={state.artifact}
            questionsCount={state.questions.length}
            answeredCount={state.answers.filter(a => a.trim().length > 0).length}
            onReset={handleReset}
          />
        );
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Sabit başlık alanı */}
      <View style={styles.headerArea}>
        <NoktaHeader />
        <View style={styles.divider} />
        <StepIndicator currentStep={getStepNumber(state.phase)} />
        <View style={styles.divider} />
      </View>

      {/* Faz içeriği */}
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={insets.top + 120}
      >
        {renderContent()}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: NoktaColors.bg,
  },
  headerArea: {
    backgroundColor: NoktaColors.bg,
    zIndex: 10,
  },
  divider: {
    height: 1,
    backgroundColor: NoktaColors.borderSubtle,
  },
  content: {
    flex: 1,
  },
});
