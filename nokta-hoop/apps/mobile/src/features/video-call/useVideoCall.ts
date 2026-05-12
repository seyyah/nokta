import { useRef, useState } from 'react';
import type { Call } from '@stream-io/video-client';
import {
  callManager,
  StreamVideoClient,
} from '@stream-io/video-react-native-sdk';
import {
  DEFAULT_CALL_ID,
  DEFAULT_USER_NAME,
  createGuestId,
  normalizeCallId,
  normalizeCallType,
  normalizeUserId,
  type CallTranscript,
} from '@nokta-hoop/hoop-call';

import {
  CALL_JOIN_TIMEOUT_MS,
  CALL_TYPE,
  TOKEN_TIMEOUT_MS,
  TRANSCRIPT_POLL_ATTEMPTS,
  TRANSCRIPT_POLL_INTERVAL_MS,
} from './constants';
import { requestStreamToken } from './services/token';
import type {
  DemoUser,
  JoinMediaMode,
  JoinStatus,
  LeaveOptions,
  LeaveResult,
  TranscriptFetchStatus,
} from './types';
import {
  isTranscriptNotReadyError,
  requestCallTranscript,
} from '../../services/transcript';
import {
  requestEndCall,
  requestStartCallTranscription,
  requestStartLivestream,
  requestStopCallTranscription,
} from '../../services/calls';

const API_KEY = process.env.EXPO_PUBLIC_STREAM_API_KEY;
const ENABLE_TRANSCRIPTION =
  process.env.EXPO_PUBLIC_STREAM_ENABLE_TRANSCRIPTION !== 'false';
const TRANSCRIPTION_LANGUAGE =
  process.env.EXPO_PUBLIC_STREAM_TRANSCRIPTION_LANGUAGE || 'tr';

type TranscriptionCall = Call & {
  startTranscription: (options?: { language?: string }) => Promise<unknown>;
  stopTranscription: () => Promise<unknown>;
};

type LivestreamCall = Call & {
  goLive?: () => Promise<unknown>;
};

export function useVideoCall() {
  const [joinStatus, setJoinStatus] = useState<JoinStatus>('idle');
  const [userName, setUserName] = useState<string>(DEFAULT_USER_NAME);
  const [userId, setUserId] = useState<string>(() => createGuestId());
  const [callId, setCallId] = useState<string>(DEFAULT_CALL_ID);
  const [callType, setCallType] = useState<string>(CALL_TYPE);
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<CallTranscript | null>(null);
  const [transcriptStatus, setTranscriptStatus] =
    useState<TranscriptFetchStatus>('idle');
  const [transcriptMessage, setTranscriptMessage] = useState<string | null>(
    null,
  );
  const transcriptionStartedRef = useRef(false);

  const cleanupConnection = async (
    currentCall: Call | null = call,
    currentClient: StreamVideoClient | null = client,
  ) => {
    try {
      await currentCall?.leave();
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      if (!message.includes('already been left')) {
        console.warn('call leave failed:', e);
      }
    }
    try {
      callManager.stop();
    } catch (e) {
      console.warn('call manager stop failed:', e);
    }
    try {
      await currentClient?.disconnectUser(5_000);
    } catch (e) {
      console.warn('disconnectUser failed:', e);
    }

    setCall(null);
    setClient(null);
    setJoinStatus('idle');
    setStatusText(null);
  };

  const join = async (
    input: { callId?: string; callType?: string; mediaMode?: JoinMediaMode } = {},
  ) => {
    if (joinStatus !== 'idle' || (client && call)) {
      return false;
    }
    if (!API_KEY) {
      setError('EXPO_PUBLIC_STREAM_API_KEY is not configured');
      return false;
    }

    setError(null);
    setTranscript(null);
    setTranscriptStatus('idle');
    setTranscriptMessage(null);
    setStatusText('Getting token...');
    setJoinStatus('joining');

    const nextUserName = userName.trim();
    const nextUserId = normalizeUserId(userId);
    if (nextUserName.length < 2) {
      setError('Enter a display name with at least 2 characters.');
      setJoinStatus('idle');
      setStatusText(null);
      return false;
    }
    if (nextUserId.length < 3) {
      setError(
        'Enter a user ID with at least 3 letters, numbers, underscores, or hyphens.',
      );
      setJoinStatus('idle');
      setStatusText(null);
      return false;
    }

    const user: DemoUser = { id: nextUserId, name: nextUserName };
    const targetCallId = normalizeCallId(input.callId ?? callId) || DEFAULT_CALL_ID;
    const targetCallType =
      normalizeCallType(input.callType ?? callType) || CALL_TYPE;
    const tokenProvider = async () =>
      withTimeout(
        requestStreamToken(user.id, user.name),
        TOKEN_TIMEOUT_MS,
        'Token request timed out. Check token server URL and phone network access.',
      );
    let nextClient: StreamVideoClient | null = null;
    let nextCall: Call | null = null;

    try {
      nextClient = StreamVideoClient.getOrCreateInstance({
        apiKey: API_KEY,
        user,
        tokenProvider,
      });

      setStatusText('Joining call...');
      nextCall = nextClient.call(targetCallType, targetCallId);
      await withTimeout(
        joinStreamCall(nextCall, {
          callType: targetCallType,
          mediaMode: input.mediaMode ?? 'default',
        }),
        CALL_JOIN_TIMEOUT_MS,
        'Stream call join timed out. Check internet access, Stream app settings, and Metro logs.',
      );

      await configureCallMedia(nextCall, input.mediaMode ?? 'default');
      await startLivestreamIfNeeded(
        nextCall,
        targetCallType,
        targetCallId,
        input.mediaMode ?? 'default',
      );
      await startCallTranscription(
        nextCall,
        targetCallType,
        targetCallId,
        input.mediaMode ?? 'default',
      );

      setClient(nextClient);
      setCall(nextCall);
      setUserName(nextUserName);
      setUserId(nextUserId);
      setCallId(targetCallId);
      setCallType(targetCallType);
      setStatusText(null);
      setJoinStatus('idle');
      return true;
    } catch (joinError) {
      const message =
        joinError instanceof Error ? joinError.message : 'Failed to join call';
      setError(message);
      await cleanupConnection(nextCall, nextClient);
      return false;
    }
  };

  const leave = async (options: LeaveOptions = {}): Promise<LeaveResult> => {
    if (!call || !client) {
      return {
        transcript,
        status: transcriptStatus,
        message: transcriptMessage,
      };
    }

    const targetCall = call;
    const targetClient = client;
    const targetCallId = callId;
    const targetCallType = callType;
    setJoinStatus('leaving');
    setStatusText('Transkripsiyon durduruluyor...');
    setTranscriptStatus('processing');
    setTranscriptMessage('Transkript hazırlanıyor.');

    try {
      await stopCallTranscription(targetCall, targetCallType, targetCallId);
      if (options.endCall !== false) {
        setStatusText('Oturum herkes için kapatılıyor...');
        await endCallForEveryone(targetCall, targetCallType, targetCallId);
      }
    } finally {
      await cleanupConnection(targetCall, targetClient);
    }

    setStatusText('Transkript bekleniyor...');
    const result = await pollTranscript(
      targetCallType,
      targetCallId,
      options.transcriptPollAttempts,
    );
    setStatusText(null);
    return result;
  };

  const refreshTranscript = async (): Promise<LeaveResult> => {
    setTranscriptStatus('processing');
    setTranscriptMessage('Transkript durumu kontrol ediliyor...');
    return pollTranscript(callType, callId, 1);
  };

  const newCallId = () => {
    setCallId(`room-${Math.floor(100000 + Math.random() * 900000)}`);
    setTranscript(null);
    setTranscriptStatus('idle');
    setTranscriptMessage(null);
  };

  const updateUserName = (value: string) => {
    setUserName(value);
    if (!userId) {
      setUserId(createGuestId());
    }
  };

  const clearMessages = () => {
    setError(null);
    setStatusText(null);
  };

  const startCallTranscription = async (
    targetCall: Call,
    targetCallType: string,
    targetCallId: string,
    mediaMode: JoinMediaMode,
  ) => {
    if (!ENABLE_TRANSCRIPTION || mediaMode === 'requester') {
      return;
    }

    try {
      await requestStartCallTranscription({
        callId: targetCallId,
        callType: targetCallType,
        language: TRANSCRIPTION_LANGUAGE,
      });
      transcriptionStartedRef.current = true;
      return;
    } catch (serverError) {
      console.warn('server startTranscription failed:', serverError);
    }

    try {
      await (targetCall as TranscriptionCall).startTranscription({
        language: TRANSCRIPTION_LANGUAGE,
      });
      transcriptionStartedRef.current = true;
    } catch (transcriptionError) {
      transcriptionStartedRef.current = false;
      console.warn('startTranscription failed:', transcriptionError);
      setTranscriptStatus('failed');
      setTranscriptMessage(
        'Transkripsiyon başlatılamadı. Stream transkripsiyon ayarlarını kontrol edin.',
      );
    }
  };

  const startLivestreamIfNeeded = async (
    targetCall: Call,
    targetCallType: string,
    targetCallId: string,
    mediaMode: JoinMediaMode,
  ) => {
    if (targetCallType !== 'livestream' || mediaMode !== 'mentor') {
      return;
    }

    try {
      await requestStartLivestream({
        callId: targetCallId,
        callType: targetCallType,
      });
      return;
    } catch (serverError) {
      console.warn('server go-live failed:', serverError);
    }

    try {
      await (targetCall as LivestreamCall).goLive?.();
    } catch (livestreamError) {
      console.warn('goLive failed:', livestreamError);
    }
  };

  const configureCallMedia = async (
    targetCall: Call,
    mediaMode: JoinMediaMode,
  ) => {
    try {
      if (mediaMode === 'requester') {
        await targetCall.camera.disable(true);
        await targetCall.microphone.disable(true);
        callManager.stop();
        return;
      }

      if (mediaMode === 'mentor') {
        callManager.stop();
        callManager.start({
          audioRole: 'communicator',
          deviceEndpointType: 'speaker',
        });
        await targetCall.microphone.enable();
        await targetCall.camera.enable();
      }
    } catch (mediaError) {
      console.warn('configure call media failed:', mediaError);
    }
  };

  const stopCallTranscription = async (
    targetCall: Call,
    targetCallType: string,
    targetCallId: string,
  ) => {
    if (!transcriptionStartedRef.current) {
      return;
    }

    try {
      await requestStopCallTranscription({
        callId: targetCallId,
        callType: targetCallType,
      });
      transcriptionStartedRef.current = false;
      return;
    } catch (serverError) {
      console.warn('server stopTranscription failed:', serverError);
    }

    try {
      await (targetCall as TranscriptionCall).stopTranscription();
    } catch (transcriptionError) {
      console.warn('stopTranscription failed:', transcriptionError);
    } finally {
      transcriptionStartedRef.current = false;
    }
  };

  const endCallForEveryone = async (
    targetCall: Call,
    targetCallType: string,
    targetCallId: string,
  ) => {
    try {
      await requestEndCall({
        callId: targetCallId,
        callType: targetCallType,
      });
      return;
    } catch (serverError) {
      console.warn('server end call failed:', serverError);
    }

    try {
      await targetCall.endCall();
    } catch (clientError) {
      console.warn('client end call failed:', clientError);
      setError(
        'Oturum herkes için kapatılamadı. Diğer cihazdan da çıkmanız gerekebilir.',
      );
    }
  };

  const pollTranscript = async (
    targetCallType: string,
    targetCallId: string,
    attempts = TRANSCRIPT_POLL_ATTEMPTS,
  ): Promise<LeaveResult> => {
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        const readyTranscript = await requestCallTranscript({
          callType: targetCallType,
          callId: targetCallId,
          language: TRANSCRIPTION_LANGUAGE,
        });
        setTranscript(readyTranscript);
        setTranscriptStatus('ready');
        setTranscriptMessage(null);
        return {
          transcript: readyTranscript,
          status: 'ready',
          message: null,
        };
      } catch (pollError) {
        if (isTranscriptNotReadyError(pollError)) {
          if (attempt < attempts) {
            await delay(TRANSCRIPT_POLL_INTERVAL_MS);
            continue;
          }

          const message =
            'Transkript hâlâ hazırlanıyor. Biraz sonra yenileyin.';
          setTranscriptStatus('not_ready');
          setTranscriptMessage(message);
          return {
            transcript: null,
            status: 'not_ready',
            message,
          };
        }

        const message =
          pollError instanceof Error
            ? pollError.message
            : 'Transkript isteği başarısız oldu.';
        setTranscriptStatus('failed');
        setTranscriptMessage(message);
        return {
          transcript: null,
          status: 'failed',
          message,
        };
      }
    }

    const message = 'Transkript hâlâ hazırlanıyor.';
    setTranscriptStatus('not_ready');
    setTranscriptMessage(message);
    return {
      transcript: null,
      status: 'not_ready',
      message,
    };
  };

  return {
    call,
    callId,
    callType,
    client,
    error,
    joining: joinStatus === 'joining',
    leaving: joinStatus === 'leaving',
    statusText,
    transcript,
    transcriptMessage,
    transcriptStatus,
    transcriptionLanguage: TRANSCRIPTION_LANGUAGE,
    userId,
    userName,
    clearMessages,
    join,
    leave,
    newCallId,
    refreshTranscript,
    setCallId,
    setCallType,
    setUserId,
    updateUserName,
  };
}

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  message: string,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(message));
    }, timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timeout);
        resolve(value);
      })
      .catch((error: unknown) => {
        clearTimeout(timeout);
        reject(error);
      });
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function joinStreamCall(
  targetCall: Call,
  input: { callType: string; mediaMode: JoinMediaMode },
): Promise<void> {
  const shouldRetryBackstage =
    input.callType === 'livestream' && input.mediaMode === 'requester';
  const maxAttempts = shouldRetryBackstage ? 8 : 1;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await targetCall.join({
        create: true,
        video: input.mediaMode === 'mentor',
      });
      return;
    } catch (error) {
      if (
        !shouldRetryBackstage ||
        attempt >= maxAttempts ||
        !isLivestreamBackstageJoinError(error)
      ) {
        throw error;
      }

      await delay(1500);
    }
  }
}

function isLivestreamBackstageJoinError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('JoinBackstage') || message.includes('backstage');
}
