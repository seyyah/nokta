import {
  buildMentorSessionReturnMessage,
  normalizeEscalationTopic,
  type EscalationRequest,
  type MascotDecision,
  type MascotChatMessage,
  type MascotChatRole,
  type MentorSessionMessage,
} from '@nokta-hoop/hoop-core';
import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioStatus,
} from 'expo-audio';
import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  MascotScreen,
  MentorLiveScreen,
  MentorQueueScreen,
} from './src/features/mascot';
import {
  TranscriptScreen,
  useVideoCall,
  VideoCallScreen,
} from './src/features/video-call';
import {
  acceptEscalation,
  cancelEscalation,
  createEscalation,
  getEscalation,
  listEscalations,
  resolveEscalation,
} from './src/services/escalations';
import { requestMascotDecision } from './src/services/mascotDecision';
import {
  requestMascotSpeechAudioUrl,
  warmupMascotSpeechCache,
} from './src/services/mascotSpeech';
import {
  createMentorSessionMessage,
  listMentorSessionMessages,
} from './src/services/mentorSessionMessages';
import { rootStyles } from './src/styles/rootStyles';
import type { LeaveOptions, LeaveResult } from './src/features/video-call/types';
import type { AppScreen } from './src/types';

type PendingTranscriptContext = {
  escalationId: string;
  expertName?: string;
  question?: string;
};

type ActiveCallRole = 'requester' | 'mentor';

type PendingExpertOffer = {
  question: string;
  topic: string;
};

const MASCOT_WELCOME_MESSAGE =
  'Merhaba, ben Nokta Maskot. Fikrini birlikte netleştirebiliriz; uzman gerektiğinde seni mentora bağlarım.';

const MASCOT_TTS_WARMUP_TEXTS = [
  MASCOT_WELCOME_MESSAGE,
  'Bu konu için mentor desteği alalım.',
  'Mentor bağlanıyor. Sorularını aynı sohbetten yazabilirsin.',
  'Uzmandan aldığımız bilgiye göre devam edelim.',
];

export default function App() {
  return (
    <GestureHandlerRootView style={rootStyles.root}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AppContent() {
  const [screen, setScreen] = useState<AppScreen>('mascot');
  const [messages, setMessages] = useState<MascotChatMessage[]>(() => [
    createMascotChatMessage('assistant', MASCOT_WELCOME_MESSAGE),
  ]);
  const [activeEscalation, setActiveEscalation] =
    useState<EscalationRequest | null>(null);
  const [escalationBusy, setEscalationBusy] = useState(false);
  const [escalationError, setEscalationError] = useState<string | null>(null);
  const [mentorRequests, setMentorRequests] = useState<EscalationRequest[]>([]);
  const [mentorSessionMessages, setMentorSessionMessages] = useState<
    MentorSessionMessage[]
  >([]);
  const [mentorLoading, setMentorLoading] = useState(false);
  const [acceptingEscalationId, setAcceptingEscalationId] = useState<
    string | null
  >(null);
  const [mascotSpeaking, setMascotSpeaking] = useState(false);
  const [pendingExpertOffer, setPendingExpertOffer] =
    useState<PendingExpertOffer | null>(null);
  const [pendingTranscriptContext, setPendingTranscriptContext] =
    useState<PendingTranscriptContext | null>(null);
  const [activeCallRole, setActiveCallRole] = useState<ActiveCallRole | null>(
    null,
  );
  const acceptedEscalationIdRef = useRef<string | null>(null);
  const completedTranscriptEscalationRef = useRef<string | null>(null);
  const speechRunRef = useRef(0);
  const welcomeSpeechStartedRef = useRef(false);
  const mascotAudioCleanupRef = useRef<(() => void) | null>(null);
  const mascotAudioPlayerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(
    null,
  );
  const videoCall = useVideoCall();

  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'duckOthers',
    });

    const welcomeTimer = setTimeout(() => {
      if (!welcomeSpeechStartedRef.current) {
        welcomeSpeechStartedRef.current = true;
        speakMascotMessage(MASCOT_WELCOME_MESSAGE);
      }
    }, 900);

    const warmupTimer = setTimeout(() => {
      void warmupMascotSpeechCache({
        texts: MASCOT_TTS_WARMUP_TEXTS,
      }).catch((error) => {
        console.warn('Mascot TTS warmup request failed:', error);
      });
    }, 4000);

    return () => {
      clearTimeout(welcomeTimer);
      clearTimeout(warmupTimer);
    };
  }, []);

  useEffect(() => {
    if (!activeEscalation || activeEscalation.status !== 'pending') {
      return;
    }

    let cancelled = false;
    const interval = setInterval(() => {
      void (async () => {
        try {
          const nextEscalation = await getEscalation(activeEscalation.id);
          if (cancelled) {
            return;
          }

          setActiveEscalation(nextEscalation);
          if (
            nextEscalation.status === 'accepted' &&
            acceptedEscalationIdRef.current !== nextEscalation.id
          ) {
            acceptedEscalationIdRef.current = nextEscalation.id;
            appendMascotMessage(
              'system',
              `${nextEscalation.expert?.name ?? 'Mentor'} isteği kabul etti. Mentor canlı olarak bağlanıyor; sorularını aynı sohbetten yazabilirsin.`,
              nextEscalation.id,
            );
            await beginEscalationCall(nextEscalation, 'requester');
          }
        } catch (error) {
          if (!cancelled) {
            setEscalationError(
              error instanceof Error
                ? error.message
                : 'Mentor isteği durumu kontrol edilemedi.',
            );
          }
        }
      })();
    }, 3000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [activeEscalation]);

  useEffect(() => {
    if (screen === 'mentorQueue') {
      void refreshMentorQueue();
    }
  }, [screen]);

  useEffect(() => {
    if (
      !activeEscalation ||
      activeEscalation.status !== 'accepted' ||
      activeCallRole !== 'mentor'
    ) {
      return;
    }

    let cancelled = false;
    const refreshMessages = async () => {
      const nextMessages = await listMentorSessionMessages(activeEscalation.id);
      if (!cancelled) {
        setMentorSessionMessages(nextMessages);
      }
    };

    void refreshMessages().catch((error) => {
      if (!cancelled) {
        setEscalationError(
          error instanceof Error
            ? error.message
            : 'Mentor mesajları yüklenemedi.',
        );
      }
    });

    const interval = setInterval(() => {
      void refreshMessages().catch((error) => {
        if (!cancelled) {
          setEscalationError(
            error instanceof Error
              ? error.message
              : 'Mentor mesajları yüklenemedi.',
          );
        }
      });
    }, 2000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [activeCallRole, activeEscalation]);

  useEffect(() => {
    if (!pendingTranscriptContext) {
      return;
    }

    let cancelled = false;
    const checkTranscript = async () => {
      const result = await videoCall.refreshTranscript();
      if (!cancelled) {
        handlePendingTranscriptResult(pendingTranscriptContext, result);
      }
    };

    const interval = setInterval(() => {
      void checkTranscript();
    }, 5000);

    void checkTranscript();

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [pendingTranscriptContext]);

  function speakMascotMessage(text: string) {
    const runId = speechRunRef.current + 1;
    speechRunRef.current = runId;
    setMascotSpeaking(true);
    disposeMascotAudioPlayer();
    void Speech.stop();

    void playMascotSpeech(runId, text);
  }

  async function playMascotSpeech(runId: number, text: string) {
    const chunks = splitMascotSpeechText(text);
    if (chunks.length === 0) {
      finishMascotSpeech(runId);
      return;
    }

    let nextAudioPromise: Promise<string | null> | null =
      requestMascotSpeechAudioUrl({ text: chunks[0] });

    for (let index = 0; index < chunks.length; index += 1) {
      const chunk = chunks[index];

      try {
        const audioUrl = await nextAudioPromise;
        nextAudioPromise =
          index + 1 < chunks.length
            ? requestMascotSpeechAudioUrl({ text: chunks[index + 1] })
            : null;

        if (speechRunRef.current !== runId) {
          void nextAudioPromise?.catch(() => undefined);
          return;
        }

        if (!audioUrl) {
          speakWithDeviceSpeech(runId, chunks.slice(index).join(' '));
          return;
        }

        const completed = await playMascotAudioUrl(runId, audioUrl, chunk);
        if (!completed || speechRunRef.current !== runId) {
          void nextAudioPromise?.catch(() => undefined);
          return;
        }
      } catch (error) {
        void nextAudioPromise?.catch(() => undefined);
        console.warn(
          'Mascot server TTS failed, falling back to device speech:',
          error,
        );

        if (speechRunRef.current === runId) {
          speakWithDeviceSpeech(runId, chunks.slice(index).join(' '));
        }
        return;
      }
    }

    finishMascotSpeech(runId);
  }

  function speakWithDeviceSpeech(runId: number, text: string) {
    Speech.speak(text, {
      language: 'tr-TR',
      onDone: () => finishMascotSpeech(runId),
      onError: () => finishMascotSpeech(runId),
      onStopped: () => finishMascotSpeech(runId),
      pitch: 1,
      rate: 1.2,
    });
  }

  function playMascotAudioUrl(
    runId: number,
    audioUrl: string,
    text: string,
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const player = createAudioPlayer(audioUrl, { updateInterval: 250 });
      mascotAudioPlayerRef.current = player;
      let settled = false;
      let subscription: { remove: () => void } | null = null;
      let timeout: ReturnType<typeof setTimeout> | null = null;

      const cleanup = () => {
        subscription?.remove();
        if (timeout) {
          clearTimeout(timeout);
        }
        try {
          player.pause();
          player.remove();
        } catch {
          // Player cleanup should not block Mascot state recovery.
        }
      };
      const finishAudio = (completed: boolean) => {
        if (settled) {
          return;
        }
        settled = true;
        if (mascotAudioPlayerRef.current === player) {
          mascotAudioCleanupRef.current = null;
          mascotAudioPlayerRef.current = null;
        }
        cleanup();
        resolve(completed);
      };
      subscription = player.addListener(
        'playbackStatusUpdate',
        (status: AudioStatus) => {
          if (status.didJustFinish) {
            finishAudio(true);
          }
        },
      );
      timeout = setTimeout(
        () => finishAudio(true),
        Math.max(8000, text.length * 120 + 6000),
      );

      mascotAudioCleanupRef.current = () => finishAudio(false);

      try {
        player.play();
      } catch (error) {
        console.warn('Mascot audio playback failed:', error);
        finishAudio(false);
      }
    });
  }

  function finishMascotSpeech(runId: number) {
    if (speechRunRef.current === runId) {
      setMascotSpeaking(false);
    }
  }

  function stopMascotSpeech() {
    speechRunRef.current += 1;
    setMascotSpeaking(false);
    disposeMascotAudioPlayer();
    void Speech.stop();
  }

  function disposeMascotAudioPlayer() {
    const cleanup = mascotAudioCleanupRef.current;
    mascotAudioCleanupRef.current = null;
    mascotAudioPlayerRef.current = null;
    cleanup?.();
  }

  async function leave(options: LeaveOptions = {}) {
    const currentEscalation = activeEscalation;
    const currentRole = activeCallRole;
    const transcriptContext = currentEscalation
      ? {
          escalationId: currentEscalation.id,
          expertName: currentEscalation.expert?.name,
          question: currentEscalation.question,
        }
      : null;
    const leaveResult = videoCall.leave({
      endCall: options.endCall,
      transcriptPollAttempts:
        currentEscalation && currentRole === 'requester' ? 1 : undefined,
    });

    if (currentEscalation && currentRole === 'requester' && transcriptContext) {
      completedTranscriptEscalationRef.current = null;
      setPendingTranscriptContext(transcriptContext);
      appendMascotMessage(
        'assistant',
        'Mentor oturumu bitti. Transkript hazırlanıyor; hazır olana kadar maskot konuşmasını bekletiyorum.',
        currentEscalation.id,
      );
      setActiveEscalation(null);
      setActiveCallRole(null);
      acceptedEscalationIdRef.current = null;
      setScreen('mascot');

      const result = await leaveResult;
      handlePendingTranscriptResult(transcriptContext, result);
      return;
    }

    if (currentEscalation && currentRole === 'mentor') {
      setActiveEscalation(null);
      setActiveCallRole(null);
      setMentorSessionMessages([]);
      acceptedEscalationIdRef.current = null;
      setScreen('mentorQueue');

      const result = await leaveResult;
      if (result.status === 'failed') {
        setEscalationError(result.message);
      }
      void refreshMentorQueue();
      return;
    }

    setScreen('transcript');
    const result = await leaveResult;

    if (result.status === 'failed') {
      setEscalationError(result.message);
    }
  }

  function handlePendingTranscriptResult(
    context: PendingTranscriptContext,
    result: LeaveResult,
  ) {
    if (result.status === 'ready' && result.transcript) {
      finishPendingTranscript(context, result);
      return;
    }

    if (result.status === 'failed') {
      if (completedTranscriptEscalationRef.current === context.escalationId) {
        return;
      }

      completedTranscriptEscalationRef.current = context.escalationId;
      appendMascotMessage(
        'system',
        result.message ??
          'Transkript alınamadı. Maskot konuşması tekrar açıldı.',
        context.escalationId,
      );
      void resolveEscalation(context.escalationId).catch(() => undefined);
      setPendingTranscriptContext(null);
    }
  }

  function finishPendingTranscript(
    context: PendingTranscriptContext,
    result: LeaveResult,
  ) {
    if (
      !result.transcript ||
      completedTranscriptEscalationRef.current === context.escalationId
    ) {
      return;
    }

    completedTranscriptEscalationRef.current = context.escalationId;
    const transcriptLines = result.transcript.items.map((item) => item.text);
    const requesterMessages = [
      context.question ?? '',
      ...messages
        .filter(
          (message) =>
            message.escalationId === context.escalationId &&
            message.role === 'user',
        )
        .map((message) => message.text),
    ];
    const returnMessage = buildMentorSessionReturnMessage({
      expertName: context.expertName,
      requesterMessages,
      transcriptLines,
    });

    appendMascotMessage('assistant', returnMessage, context.escalationId);
    speakMascotMessage(returnMessage);
    void resolveEscalation(context.escalationId).catch(() => undefined);
    setPendingTranscriptContext(null);
  }

  async function refreshTranscript() {
    await videoCall.refreshTranscript();
  }

  function resetMascotChat() {
    if (
      escalationBusy ||
      pendingTranscriptContext ||
      activeEscalation ||
      activeCallRole
    ) {
      return;
    }

    stopMascotSpeech();
    setPendingExpertOffer(null);
    setEscalationError(null);
    setMentorSessionMessages([]);
    setMessages([createMascotChatMessage('assistant', MASCOT_WELCOME_MESSAGE)]);
  }

  async function sendMascotMessage(message: string) {
    if (pendingTranscriptContext) {
      return;
    }

    if (activeEscalation?.status === 'accepted' && activeCallRole === 'requester') {
      await sendMentorSessionMessage(message, activeEscalation);
      return;
    }

    if (activeCallRole) {
      return;
    }

    appendMascotMessage('user', message);
    stopMascotSpeech();
    setPendingExpertOffer(null);
    setEscalationBusy(true);
    setEscalationError(null);

    try {
      const decision = await requestMascotDecision({
        history: messages,
        message,
      });

      appendMascotMessage('assistant', decision.answer);
      speakMascotMessage(decision.answer);

      if (decision.action === 'escalate') {
        if (shouldCreateExpertRequestImmediately(decision)) {
          await requestExpertSupport(
            decision.question ?? message,
            decision.topic ?? message,
          );
        } else {
          setPendingExpertOffer({
            question: decision.question ?? message,
            topic: decision.topic ?? message,
          });
        }
      }
    } catch (error) {
      setEscalationError(
        error instanceof Error
          ? error.message
          : 'Maskot kararı oluşturulamadı.',
      );
    } finally {
      setEscalationBusy(false);
    }
  }

  async function sendMentorSessionMessage(
    message: string,
    escalation: EscalationRequest,
  ) {
    appendMascotMessage('user', message, escalation.id);
    stopMascotSpeech();
    setEscalationBusy(true);
    setEscalationError(null);

    try {
      const savedMessage = await createMentorSessionMessage({
        escalationId: escalation.id,
        authorId: videoCall.userId,
        authorName: videoCall.userName,
        role: 'requester',
        text: message,
      });
      setMentorSessionMessages((current) =>
        mergeMentorSessionMessages(current, [savedMessage]),
      );
    } catch (error) {
      setEscalationError(
        error instanceof Error
          ? error.message
          : 'Mentor mesajı gönderilemedi.',
      );
    } finally {
      setEscalationBusy(false);
    }
  }

  async function confirmPendingExpertOffer() {
    const offer = pendingExpertOffer;
    if (!offer) {
      return;
    }

    setPendingExpertOffer(null);
    await requestExpertSupport(offer.question, offer.topic);
  }

  async function requestExpertSupport(message?: string, topic?: string) {
    if (pendingTranscriptContext || activeCallRole) {
      return;
    }

    const question =
      message?.trim() ||
      [...messages].reverse().find((item) => item.role === 'user')?.text ||
      'Kullanıcı mentor desteği istiyor.';
    const requestTopic = normalizeEscalationTopic(topic ?? question);

    setEscalationBusy(true);
    setEscalationError(null);
    try {
      const request = await createEscalation({
        question,
        requesterId: videoCall.userId,
        requesterName: videoCall.userName,
        topic: requestTopic,
      });
      const mascotMessage = `"${request.topic}" için mentor desteği istedim. Bir uzman kabul ederse mentor canlı olarak avatar alanına bağlanacak.`;

      setActiveEscalation(request);
      setPendingExpertOffer(null);
      appendMascotMessage('assistant', mascotMessage, request.id);
      speakMascotMessage(mascotMessage);
    } catch (error) {
      setEscalationError(
        error instanceof Error
          ? error.message
          : 'Mentor isteği oluşturulamadı.',
      );
    } finally {
      setEscalationBusy(false);
    }
  }

  async function refreshMentorQueue() {
    setMentorLoading(true);
    setEscalationError(null);
    try {
      setMentorRequests(await listEscalations({ status: 'pending' }));
    } catch (error) {
      setEscalationError(
        error instanceof Error
          ? error.message
          : 'Mentor kuyruğu yüklenemedi.',
      );
    } finally {
      setMentorLoading(false);
    }
  }

  async function acceptMentorRequest(request: EscalationRequest) {
    setAcceptingEscalationId(request.id);
    setEscalationError(null);
    try {
      const accepted = await acceptEscalation({
        escalationId: request.id,
        expertId: videoCall.userId,
        expertName: videoCall.userName,
      });
      setActiveEscalation(accepted);
      acceptedEscalationIdRef.current = accepted.id;
      appendMascotMessage(
        'system',
        `Mentor isteği kabul edildi. ${accepted.requester.name} için canlı kamera oturumu açılıyor.`,
        accepted.id,
      );
      setMentorSessionMessages([]);
      await beginEscalationCall(accepted, 'mentor');
    } catch (error) {
      setEscalationError(
        error instanceof Error
          ? error.message
          : 'Mentor isteği kabul edilemedi.',
      );
    } finally {
      setAcceptingEscalationId(null);
    }
  }

  async function cancelExpertRequest() {
    const request = activeEscalation;
    if (!request || request.status !== 'pending') {
      return;
    }

    setEscalationBusy(true);
    setEscalationError(null);
    try {
      await cancelEscalation(request.id);
      if (acceptedEscalationIdRef.current === request.id) {
        acceptedEscalationIdRef.current = null;
      }
      setActiveEscalation(null);
      setPendingExpertOffer(null);
      const message = 'Mentor isteğini iptal ettim. Sohbete devam edebiliriz.';
      appendMascotMessage('assistant', message, request.id);
      speakMascotMessage(message);
    } catch (error) {
      setEscalationError(
        error instanceof Error
          ? error.message
          : 'Mentor isteği iptal edilemedi.',
      );
    } finally {
      setEscalationBusy(false);
    }
  }

  async function beginEscalationCall(
    request: EscalationRequest,
    role: ActiveCallRole,
  ) {
    stopMascotSpeech();
    videoCall.clearMessages();
    videoCall.setCallId(request.callId);
    videoCall.setCallType(request.callType);
    setActiveCallRole(role);
    const joined = await videoCall.join({
      callId: request.callId,
      callType: request.callType,
      mediaMode: role,
    });

    if (!joined) {
      setActiveCallRole(null);
      setScreen(role === 'mentor' ? 'mentorQueue' : 'mascot');
      return;
    }

    setScreen(role === 'mentor' ? 'mentorLive' : 'mascot');
  }

  function appendMascotMessage(
    role: MascotChatRole,
    text: string,
    escalationId?: string,
  ) {
    setMessages((current) => [
      ...current,
      createMascotChatMessage(role, text, escalationId),
    ]);
  }

  async function refreshMentorSessionMessages(
    escalationId = activeEscalation?.id,
  ) {
    if (!escalationId) {
      return;
    }

    try {
      const nextMessages = await listMentorSessionMessages(escalationId);
      setMentorSessionMessages(nextMessages);
    } catch (error) {
      setEscalationError(
        error instanceof Error
          ? error.message
          : 'Mentor mesajları yüklenemedi.',
      );
    }
  }

  if (
    screen === 'mentorLive' &&
    videoCall.client &&
    videoCall.call &&
    activeEscalation
  ) {
    return (
      <MentorLiveScreen
        call={videoCall.call}
        client={videoCall.client}
        escalation={activeEscalation}
        leaving={videoCall.leaving}
        messages={mentorSessionMessages}
        onCallEnded={() => leave({ endCall: false })}
        onEnd={leave}
        onRefreshMessages={refreshMentorSessionMessages}
        statusText={videoCall.statusText}
      />
    );
  }

  if (screen === 'call' && videoCall.client && videoCall.call) {
    return (
      <VideoCallScreen
        call={videoCall.call}
        client={videoCall.client}
        leaving={videoCall.leaving}
        onCallEnded={() => leave({ endCall: false })}
        onLeave={leave}
        statusText={videoCall.statusText}
      />
    );
  }

  if (screen === 'transcript') {
    return (
      <TranscriptScreen
        callId={videoCall.callId}
        message={videoCall.transcriptMessage}
        onBack={() => setScreen('mascot')}
        onNewCall={() => {
          setScreen('mascot');
        }}
        onRefresh={refreshTranscript}
        refreshing={videoCall.transcriptStatus === 'processing'}
        status={videoCall.transcriptStatus}
        transcript={videoCall.transcript}
      />
    );
  }

  if (screen === 'mentorQueue') {
    return (
      <MentorQueueScreen
        acceptingId={acceptingEscalationId}
        error={escalationError}
        loading={mentorLoading}
        onAccept={acceptMentorRequest}
        onBack={() => setScreen('mascot')}
        onRefresh={refreshMentorQueue}
        requests={mentorRequests}
      />
    );
  }

  if (screen === 'mascot') {
    return (
      <MascotScreen
        activeEscalation={activeEscalation}
        busy={escalationBusy}
        conversationLocked={Boolean(pendingTranscriptContext)}
        error={escalationError}
        hasTranscript={Boolean(videoCall.transcript)}
        lockMessage={
          pendingTranscriptContext
            ? 'Transkript hazırlanıyor. Hazır olunca görüşme notları konuşmaya eklenecek.'
            : null
        }
        messages={messages}
        onOpenMentorQueue={() => setScreen('mentorQueue')}
        onOpenTranscript={() => setScreen('transcript')}
        onCancelExpertRequest={cancelExpertRequest}
        onConfirmExpertOffer={confirmPendingExpertOffer}
        onRequestExpert={requestExpertSupport}
        onResetChat={resetMascotChat}
        onSendMessage={sendMascotMessage}
        pendingExpertOffer={pendingExpertOffer}
        speaking={mascotSpeaking}
        mentorLive={
          activeCallRole === 'requester' && videoCall.client && videoCall.call
            ? {
                call: videoCall.call,
                client: videoCall.client,
                leaving: videoCall.leaving,
                onCallEnded: () => leave({ endCall: false }),
                onEnd: leave,
                statusText: videoCall.statusText,
              }
            : null
        }
      />
    );
  }

  return null;
}

function shouldCreateExpertRequestImmediately(decision: MascotDecision): boolean {
  return decision.reason.toLowerCase().includes('expert-help keyword');
}

function splitMascotSpeechText(text: string): string[] {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) {
    return [];
  }

  const sentenceMatches =
    normalized.match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g) ?? [normalized];

  return sentenceMatches
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .flatMap((sentence) => splitLongSpeechChunk(sentence, 180));
}

function splitLongSpeechChunk(text: string, maxLength: number): string[] {
  if (text.length <= maxLength) {
    return [text];
  }

  const chunks: string[] = [];
  let current = '';
  const parts = text.split(/\s+/).filter(Boolean);

  for (const part of parts) {
    const next = current ? `${current} ${part}` : part;
    if (next.length <= maxLength) {
      current = next;
      continue;
    }

    if (current) {
      chunks.push(current);
    }
    current = part;
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
}

function createMascotChatMessage(
  role: MascotChatRole,
  text: string,
  escalationId?: string,
): MascotChatMessage {
  const random = Math.random().toString(36).slice(2, 8);
  return {
    createdAt: new Date().toISOString(),
    escalationId,
    id: `msg-${Date.now()}-${random}`,
    role,
    text,
  };
}

function mergeMentorSessionMessages(
  current: MentorSessionMessage[],
  incoming: MentorSessionMessage[],
): MentorSessionMessage[] {
  const messagesById = new Map<string, MentorSessionMessage>();
  [...current, ...incoming].forEach((message) => {
    messagesById.set(message.id, message);
  });

  return [...messagesById.values()].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );
}
