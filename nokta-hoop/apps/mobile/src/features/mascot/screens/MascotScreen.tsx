import type {
  EscalationRequest,
  MascotChatMessage,
} from '@nokta-hoop/hoop-core';
import type { Call } from '@stream-io/video-client';
import {
  callManager,
  type StreamVideoClient,
} from '@stream-io/video-react-native-sdk';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  NoktaAvatar3D,
  type MascotVisualState,
} from '../components/NoktaAvatar3D';
import { MentorLivePanel } from '../components/MentorLivePanel';

type MascotScreenProps = {
  messages: MascotChatMessage[];
  activeEscalation: EscalationRequest | null;
  busy: boolean;
  conversationLocked: boolean;
  error: string | null;
  hasTranscript: boolean;
  lockMessage: string | null;
  pendingExpertOffer: { question: string; topic: string } | null;
  speaking: boolean;
  mentorLive: {
    call: Call;
    client: StreamVideoClient;
    leaving: boolean;
    statusText: string | null;
    onCallEnded: () => Promise<void>;
    onEnd: () => Promise<void>;
  } | null;
  onCancelExpertRequest: () => Promise<void>;
  onConfirmExpertOffer: () => Promise<void>;
  onResetChat: () => void;
  onSendMessage: (message: string) => Promise<void>;
  onRequestExpert: (message?: string) => Promise<void>;
  onOpenMentorQueue: () => void;
  onOpenTranscript: () => void;
};

export function MascotScreen({
  messages,
  activeEscalation,
  busy,
  conversationLocked,
  error,
  hasTranscript,
  lockMessage,
  pendingExpertOffer,
  speaking,
  mentorLive,
  onCancelExpertRequest,
  onConfirmExpertOffer,
  onResetChat,
  onSendMessage,
  onRequestExpert,
  onOpenMentorQueue,
  onOpenTranscript,
}: MascotScreenProps) {
  const [draft, setDraft] = useState('');
  const [listening, setListening] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [showEscalationNotice, setShowEscalationNotice] = useState(false);
  const submittedVoiceRef = useRef<string | null>(null);
  const chatRef = useRef<ScrollView>(null);
  const mentorMode = Boolean(mentorLive);

  const avatarState = getAvatarState({
    activeEscalation,
    busy,
    conversationLocked,
    error: error ?? voiceError,
    listening,
    speaking,
  });
  const statusText = getStatusText({
    activeEscalation,
    busy,
    conversationLocked,
    lockMessage,
    listening,
    mentorMode,
    speaking,
  });

  useEffect(() => {
    if (messages.length > 1) {
      setShowChat(true);
    }
  }, [messages.length]);

  useEffect(() => {
    if (!activeEscalation) {
      setShowEscalationNotice(false);
      return;
    }

    setShowEscalationNotice(true);

    if (activeEscalation.status !== 'accepted') {
      return;
    }

    const timer = setTimeout(() => {
      setShowEscalationNotice(false);
    }, 4200);

    return () => clearTimeout(timer);
  }, [activeEscalation?.id, activeEscalation?.status]);

  useEffect(() => {
    if (conversationLocked && listening) {
      ExpoSpeechRecognitionModule.stop();
      setListening(false);
      setVoiceTranscript('');
    }
  }, [conversationLocked, listening]);

  useEffect(() => {
    if (!showChat) {
      return;
    }

    const scrollTimer = setTimeout(() => {
      chatRef.current?.scrollToEnd({ animated: true });
    }, 50);

    return () => clearTimeout(scrollTimer);
  }, [busy, messages, showChat]);

  useSpeechRecognitionEvent('start', () => {
    setListening(true);
    setVoiceError(null);
  });

  useSpeechRecognitionEvent('end', () => {
    setListening(false);
    if (mentorMode) {
      activateMentorViewerAudio();
    }
  });

  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results[0]?.transcript.trim() ?? '';
    if (!transcript) {
      return;
    }

    setVoiceTranscript(transcript);
    setDraft(transcript);

    if (
      event.isFinal &&
      !conversationLocked &&
      submittedVoiceRef.current !== transcript
    ) {
      submittedVoiceRef.current = transcript;
      setDraft('');
      setVoiceTranscript('');
      setShowChat(true);
      void onSendMessage(transcript);
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    setListening(false);
    if (mentorMode) {
      activateMentorViewerAudio();
    }
    setVoiceError(event.message || 'Ses tanıma başarısız oldu.');
  });

  const submit = async () => {
    const message = draft.trim();
    if (!message || busy || conversationLocked) {
      return;
    }
    setDraft('');
    setShowChat(true);
    await onSendMessage(message);
  };

  const requestExpert = async () => {
    const message = draft.trim();
    if (busy || conversationLocked || mentorMode) {
      return;
    }
    if (message) {
      setDraft('');
    }
    setShowChat(true);
    await onRequestExpert(message || undefined);
  };

  const confirmExpertOffer = async () => {
    if (busy || conversationLocked || mentorMode || !pendingExpertOffer) {
      return;
    }
    setShowChat(true);
    await onConfirmExpertOffer();
  };

  const resetChat = () => {
    if (busy || conversationLocked || activeEscalation) {
      return;
    }

    if (listening) {
      ExpoSpeechRecognitionModule.stop();
      setListening(false);
    }

    setDraft('');
    setVoiceTranscript('');
    setVoiceError(null);
    submittedVoiceRef.current = null;
    setShowChat(true);
    onResetChat();
  };

  const toggleListening = async () => {
    if (busy || conversationLocked) {
      return;
    }

    if (listening) {
      ExpoSpeechRecognitionModule.stop();
      if (mentorMode) {
        activateMentorViewerAudio();
      }
      return;
    }

    submittedVoiceRef.current = null;
    setVoiceTranscript('');
    setVoiceError(null);

    const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permission.granted) {
      setVoiceError('Mikrofon veya konuşma tanıma izni verilmedi.');
      return;
    }

    if (mentorMode) {
      suspendMentorViewerAudio();
    }

    ExpoSpeechRecognitionModule.start({
      addsPunctuation: true,
      contextualStrings: [
        'Nokta',
        'mentor',
        'uzman',
        'pazar doğrulaması',
        'yatırım stratejisi',
        'MVP',
      ],
      continuous: false,
      interimResults: true,
      lang: 'tr-TR',
    });
  };

  const renderComposer = (compact = false) => (
    <View style={[styles.inputWrap, compact ? styles.compactInputWrap : null]}>
      <TextInput
        editable={!busy && !conversationLocked}
        multiline={!compact}
        onChangeText={setDraft}
        onFocus={() => setShowChat(true)}
        placeholder={
          conversationLocked
            ? 'Transkript hazırlanıyor...'
            : mentorMode
              ? 'Mentora yaz...'
              : 'Fikrini yaz...'
        }
        placeholderTextColor="#9ca3af"
        style={[styles.input, compact ? styles.compactInput : null]}
        value={draft}
      />
      <Pressable
        accessibilityRole="button"
        disabled={busy || conversationLocked || draft.trim().length === 0}
        onPress={() => void submit()}
        style={({ pressed }) => [
          styles.sendButton,
          busy || conversationLocked || draft.trim().length === 0
            ? styles.disabledButton
            : null,
          pressed && !busy && !conversationLocked ? styles.buttonPressed : null,
        ]}
      >
        <Text style={styles.sendButtonText}>Gönder</Text>
      </Pressable>
      <Pressable
        accessibilityLabel={listening ? 'Dinlemeyi durdur' : 'Mikrofonu aç'}
        accessibilityRole="button"
        disabled={busy || conversationLocked}
        onPress={() => void toggleListening()}
        style={({ pressed }) => [
          styles.composerMicButton,
          listening ? styles.composerMicButtonActive : null,
          busy || conversationLocked ? styles.disabledButton : null,
          pressed && !busy && !conversationLocked ? styles.buttonPressed : null,
        ]}
      >
        <MicrophoneIcon />
      </Pressable>
    </View>
  );
  const shouldShowEscalationNotice =
    Boolean(activeEscalation) && showEscalationNotice && !conversationLocked;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        {shouldShowEscalationNotice || conversationLocked ? (
          <View style={styles.statusStack}>
            {conversationLocked ? (
              <View style={styles.lockPanel}>
                <ActivityIndicator color="#2563eb" />
                <View style={styles.lockCopy}>
                  <Text style={styles.lockTitle}>Transkript hazırlanıyor</Text>
                  <Text style={styles.lockText}>
                    {lockMessage ??
                      'Uzman görüşmesi işleniyor. Hazır olana kadar maskot konuşması bekletiliyor.'}
                  </Text>
                </View>
              </View>
            ) : null}

            {shouldShowEscalationNotice && activeEscalation ? (
              <View style={styles.escalationPanel}>
                <Text style={styles.escalationTitle}>
                  {mentorMode
                    ? 'Mentor canlı'
                    : activeEscalation.status === 'accepted'
                      ? 'Mentor kabul etti'
                      : 'Mentor bekleniyor'}
                </Text>
                <Text numberOfLines={2} style={styles.escalationText}>
                  {activeEscalation.topic}
                </Text>
                {activeEscalation.status === 'pending' ? (
                  <View style={styles.pendingRow}>
                    <View style={styles.pendingStatus}>
                      <ActivityIndicator color="#2563eb" />
                      <Text style={styles.pendingText}>Uzman yanıtı bekleniyor</Text>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      disabled={busy}
                      onPress={() => void onCancelExpertRequest()}
                      style={({ pressed }) => [
                        styles.pendingCancelButton,
                        busy ? styles.disabledButton : null,
                        pressed && !busy ? styles.buttonPressed : null,
                      ]}
                    >
                      <Text style={styles.pendingCancelText}>İptal</Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.topBar}>
          <View style={styles.brand}>
            <Text style={styles.eyebrow}>nokta-hoop</Text>
            <Text style={styles.title}>Nokta Maskot</Text>
          </View>
          <View style={styles.topActions}>
            <Pressable
              accessibilityRole="button"
              disabled={conversationLocked}
              onPress={onOpenMentorQueue}
              style={({ pressed }) => [
                styles.iconButton,
                conversationLocked ? styles.disabledButton : null,
                pressed && !conversationLocked ? styles.buttonPressed : null,
              ]}
            >
              <Text style={styles.iconButtonText}>Mentor</Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.avatarStage, mentorMode ? styles.avatarStageMentor : null]}>
          <View style={styles.avatarFrame}>
            {mentorLive ? (
              <MentorLivePanel
                call={mentorLive.call}
                client={mentorLive.client}
                leaving={mentorLive.leaving}
                onCallEnded={mentorLive.onCallEnded}
                statusText={mentorLive.statusText}
              />
            ) : (
              <NoktaAvatar3D state={avatarState} />
            )}
          </View>
        </View>

        {mentorLive ? (
          <Pressable
            accessibilityRole="button"
            disabled={mentorLive.leaving}
            onPress={() => void mentorLive.onEnd()}
            style={({ pressed }) => [
              styles.mentorEndFloatingButton,
              mentorLive.leaving ? styles.disabledButton : null,
              pressed && !mentorLive.leaving ? styles.buttonPressed : null,
            ]}
          >
            <Text style={styles.mentorEndFloatingText}>
              {mentorLive.leaving ? 'Bitiyor...' : 'Bitir'}
            </Text>
          </Pressable>
        ) : null}

        <View
          pointerEvents={showChat ? 'auto' : 'none'}
          style={[
            styles.chatOverlay,
            mentorMode ? styles.chatOverlayMentor : null,
            showChat ? styles.chatOverlayActive : null,
          ]}
        >
          <View style={styles.chatHeader}>
            <Text style={styles.chatTitle}>Konuşma</Text>
            <View style={styles.chatHeaderActions}>
              <Pressable
                accessibilityRole="button"
                disabled={busy || conversationLocked || Boolean(activeEscalation)}
                onPress={resetChat}
                style={({ pressed }) => [
                  styles.closeButton,
                  busy || conversationLocked || activeEscalation
                    ? styles.disabledButton
                    : null,
                  pressed && !busy && !conversationLocked && !activeEscalation
                    ? styles.buttonPressed
                    : null,
                ]}
              >
                <Text style={styles.closeButtonText}>Sıfırla</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => setShowChat(false)}
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed ? styles.buttonPressed : null,
                ]}
              >
                <Text style={styles.closeButtonText}>Kapat</Text>
              </Pressable>
            </View>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {voiceError ? <Text style={styles.errorText}>{voiceError}</Text> : null}

          {listening || voiceTranscript ? (
            <View style={styles.voicePanel}>
              <View style={styles.voicePulse}>
                {listening ? <ActivityIndicator color="#2563eb" /> : null}
              </View>
              <View style={styles.voiceCopy}>
                <Text style={styles.voiceTitle}>
                  {listening ? 'Dinliyorum...' : 'Ses algılandı'}
                </Text>
                <Text style={styles.voiceText}>
                  {voiceTranscript || 'Maskot ile konuşmaya başla.'}
                </Text>
              </View>
            </View>
          ) : null}

          <ScrollView
            ref={chatRef}
            style={styles.chat}
            contentContainerStyle={styles.chatBody}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.message,
                  message.role === 'user' ? styles.userMessage : styles.botMessage,
                  message.role === 'system' ? styles.systemMessage : null,
                ]}
              >
                <Text style={styles.messageRole}>
                  {message.role === 'user'
                    ? 'Sen'
                    : message.role === 'system'
                      ? 'Sistem'
                      : 'Maskot'}
                </Text>
                <Text style={styles.messageText}>{message.text}</Text>
              </View>
            ))}
            {busy ? (
              <View style={styles.typing}>
                <Text style={styles.typingText}>...</Text>
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.quickActions}>
            {!mentorMode && pendingExpertOffer ? (
              <Pressable
                accessibilityRole="button"
                disabled={busy || conversationLocked}
                onPress={() => void confirmExpertOffer()}
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.primaryActionButton,
                  busy || conversationLocked ? styles.disabledButton : null,
                  pressed && !busy && !conversationLocked
                    ? styles.buttonPressed
                    : null,
                ]}
              >
                <Text style={styles.primaryActionButtonText}>
                  Uzman desteği oluştur
                </Text>
              </Pressable>
            ) : null}
            {!mentorMode ? (
              <Pressable
                accessibilityRole="button"
                disabled={busy || conversationLocked}
                onPress={requestExpert}
                style={({ pressed }) => [
                  styles.actionButton,
                  busy || conversationLocked ? styles.disabledButton : null,
                  pressed && !busy && !conversationLocked ? styles.buttonPressed : null,
                ]}
              >
                <Text style={styles.actionButtonText}>Uzman iste</Text>
              </Pressable>
            ) : null}
            {hasTranscript ? (
              <Pressable
                accessibilityRole="button"
                onPress={onOpenTranscript}
                style={({ pressed }) => [
                  styles.actionButton,
                  pressed ? styles.buttonPressed : null,
                ]}
              >
                <Text style={styles.actionButtonText}>Transkript</Text>
              </Pressable>
            ) : null}
          </View>

          {renderComposer()}
          <View style={styles.hiddenInputWrap}>
            <TextInput
              editable={!busy && !conversationLocked}
              multiline
              onChangeText={setDraft}
              placeholder={
                conversationLocked ? 'Transkript hazırlanıyor...' : 'Fikrini yaz...'
              }
              placeholderTextColor="#9ca3af"
              style={styles.input}
              value={draft}
            />
            <Pressable
              accessibilityRole="button"
              disabled={busy || conversationLocked}
              onPress={() => void toggleListening()}
              style={({ pressed }) => [
                styles.composerMicButton,
                listening ? styles.composerMicButtonActive : null,
                busy || conversationLocked ? styles.disabledButton : null,
                pressed && !busy && !conversationLocked ? styles.buttonPressed : null,
              ]}
            >
              <Text style={styles.composerMicButtonText}>
                {listening ? 'Dur' : 'Mikrofon'}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={busy || conversationLocked || draft.trim().length === 0}
              onPress={() => void submit()}
              style={({ pressed }) => [
                styles.sendButton,
                busy || conversationLocked || draft.trim().length === 0
                  ? styles.disabledButton
                  : null,
                pressed && !busy && !conversationLocked
                  ? styles.buttonPressed
                  : null,
              ]}
            >
              <Text style={styles.sendButtonText}>Gönder</Text>
            </Pressable>
          </View>
        </View>

        {!showChat ? (
          <View style={styles.compactComposer}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setShowChat(true)}
              style={({ pressed }) => [
                styles.compactChatButton,
                pressed ? styles.buttonPressed : null,
              ]}
            >
              <Text style={styles.compactChatButtonText}>Sohbet</Text>
            </Pressable>
            {renderComposer(true)}
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function suspendMentorViewerAudio() {
  try {
    callManager.stop();
  } catch (error) {
    console.warn('mentor viewer audio suspend failed:', error);
  }
}

function activateMentorViewerAudio() {
  try {
    callManager.stop();
  } catch (error) {
    console.warn('mentor viewer audio restore failed:', error);
  }
}

function MicrophoneIcon() {
  return (
    <View style={styles.micGlyph}>
      <View style={styles.micArc} />
      <View style={styles.micHead} />
      <View style={styles.micStem} />
      <View style={styles.micBase} />
    </View>
  );
}

function getAvatarState({
  activeEscalation,
  busy,
  conversationLocked,
  error,
  listening,
  speaking,
}: {
  activeEscalation: EscalationRequest | null;
  busy: boolean;
  conversationLocked: boolean;
  error: string | null;
  listening: boolean;
  speaking: boolean;
}): MascotVisualState {
  if (error) {
    return 'error';
  }

  if (listening) {
    return 'listening';
  }

  if (speaking) {
    return 'speaking';
  }

  if (busy) {
    return 'thinking';
  }

  if (conversationLocked) {
    return 'waiting';
  }

  if (activeEscalation) {
    return 'waiting';
  }

  return 'idle';
}

function getStatusText({
  activeEscalation,
  busy,
  conversationLocked,
  lockMessage,
  listening,
  mentorMode,
  speaking,
}: {
  activeEscalation: EscalationRequest | null;
  busy: boolean;
  conversationLocked: boolean;
  lockMessage: string | null;
  listening: boolean;
  mentorMode: boolean;
  speaking: boolean;
}) {
  if (conversationLocked) {
    return lockMessage ?? 'Transkript hazırlanıyor.';
  }

  if (listening) {
    return 'Sizi dinliyorum...';
  }

  if (speaking) {
    return 'Nokta konuşuyor...';
  }

  if (busy) {
    return 'Nokta düşünüyor...';
  }

  if (mentorMode) {
    return 'Mentor canlı. Sorunu sohbetten yaz.';
  }

  if (activeEscalation?.status === 'accepted') {
    return 'Mentor kabul etti, görüşme açılıyor.';
  }

  if (activeEscalation?.status === 'pending') {
    return 'Mentor yanıtı bekleniyor.';
  }

  return 'Konuşmak için mikrofona basın';
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#eef2ff',
  },
  keyboard: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  statusStack: {
    gap: 8,
    left: 16,
    position: 'absolute',
    right: 16,
    top: 32,
    zIndex: 20,
    elevation: 20,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingTop: 10,
    zIndex: 4,
  },
  brand: {
    flex: 1,
  },
  eyebrow: {
    color: '#2563eb',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    color: '#1f2937',
    fontSize: 24,
    fontWeight: '900',
  },
  topActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderRadius: 12,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    minWidth: 54,
    paddingHorizontal: 10,
  },
  iconButtonText: {
    color: '#4b5563',
    fontSize: 12,
    fontWeight: '900',
  },
  avatarStage: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginBottom: 252,
    marginTop: -64,
    minHeight: 390,
    zIndex: 2,
  },
  avatarStageMentor: {
    marginBottom: 310,
    marginTop: 8,
  },
  avatarFrame: {
    height: '100%',
    width: '100%',
  },
  mentorEndFloatingButton: {
    alignItems: 'center',
    backgroundColor: '#dc2626',
    borderRadius: 12,
    bottom: 328,
    elevation: 16,
    justifyContent: 'center',
    minHeight: 36,
    minWidth: 60,
    paddingHorizontal: 10,
    position: 'absolute',
    right: 16,
    zIndex: 16,
  },
  mentorEndFloatingText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  escalationPanel: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderColor: '#bfdbfe',
    borderRadius: 18,
    borderWidth: 1,
    gap: 4,
    padding: 12,
  },
  escalationTitle: {
    color: '#1d4ed8',
    fontSize: 13,
    fontWeight: '900',
  },
  escalationText: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '800',
  },
  pendingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  pendingStatus: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    gap: 8,
  },
  pendingText: {
    color: '#2563eb',
    flexShrink: 1,
    fontSize: 12,
    fontWeight: '800',
  },
  pendingCancelButton: {
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 32,
    paddingHorizontal: 14,
  },
  pendingCancelText: {
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: '900',
  },
  lockPanel: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderColor: '#bfdbfe',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 12,
  },
  lockCopy: {
    flex: 1,
    gap: 3,
  },
  lockTitle: {
    color: '#1d4ed8',
    fontSize: 13,
    fontWeight: '900',
  },
  lockText: {
    color: '#1f2937',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  chatOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.86)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    bottom: 16,
    left: 0,
    opacity: 0,
    paddingHorizontal: 16,
    paddingTop: 14,
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: [{ translateY: 18 }],
    zIndex: 8,
  },
  chatOverlayMentor: {
    top: '64%',
  },
  chatOverlayActive: {
    opacity: 1,
    transform: [{ translateY: 0 }],
  },
  chatHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  chatHeaderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  chatTitle: {
    color: '#1f2937',
    fontSize: 15,
    fontWeight: '900',
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    height: 34,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  closeButtonText: {
    color: '#4b5563',
    fontSize: 12,
    fontWeight: '900',
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 13,
    fontWeight: '800',
    paddingBottom: 8,
  },
  voicePanel: {
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
    padding: 10,
  },
  voicePulse: {
    alignItems: 'center',
    backgroundColor: '#dbeafe',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  voiceCopy: {
    flex: 1,
    gap: 2,
  },
  voiceTitle: {
    color: '#1d4ed8',
    fontSize: 13,
    fontWeight: '900',
  },
  voiceText: {
    color: '#1f2937',
    fontSize: 13,
    lineHeight: 18,
  },
  chat: {
    flex: 1,
  },
  chatBody: {
    gap: 10,
    paddingBottom: 10,
  },
  message: {
    borderRadius: 18,
    gap: 5,
    maxWidth: '86%',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#2563eb',
    borderBottomRightRadius: 5,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 5,
  },
  systemMessage: {
    alignSelf: 'center',
    backgroundColor: '#e5e7eb',
  },
  messageRole: {
    color: '#93c5fd',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  messageText: {
    color: '#1f2937',
    fontSize: 14,
    lineHeight: 20,
  },
  typing: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  typingText: {
    color: '#2563eb',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 8,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderColor: '#e5e7eb',
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  primaryActionButton: {
    backgroundColor: '#2563eb',
    borderColor: '#1d4ed8',
  },
  actionButtonText: {
    color: '#4b5563',
    fontSize: 12,
    fontWeight: '900',
  },
  primaryActionButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  inputWrap: {
    alignItems: 'flex-end',
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 6,
    paddingLeft: 14,
    paddingRight: 6,
    paddingTop: 6,
  },
  hiddenInputWrap: {
    display: 'none',
  },
  compactInputWrap: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    flex: 1,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 0,
  },
  input: {
    color: '#111827',
    flex: 1,
    fontSize: 14,
    maxHeight: 82,
    minHeight: 38,
    paddingVertical: 8,
  },
  compactInput: {
    maxHeight: 42,
  },
  composerMicButton: {
    alignItems: 'center',
    backgroundColor: '#0044cc',
    borderRadius: 18,
    height: 38,
    justifyContent: 'center',
    minWidth: 48,
    paddingHorizontal: 10,
  },
  composerMicButtonActive: {
    backgroundColor: '#dc2626',
  },
  composerMicButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  micGlyph: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    position: 'relative',
    width: 24,
  },
  micArc: {
    borderBottomLeftRadius: 9,
    borderBottomRightRadius: 9,
    borderBottomWidth: 2,
    borderColor: '#ffffff',
    borderLeftWidth: 2,
    borderRightWidth: 2,
    height: 12,
    position: 'absolute',
    top: 9,
    width: 18,
  },
  micHead: {
    backgroundColor: 'transparent',
    borderColor: '#ffffff',
    borderRadius: 7,
    borderWidth: 2,
    height: 15,
    position: 'absolute',
    top: 2,
    width: 10,
  },
  micStem: {
    backgroundColor: '#ffffff',
    borderRadius: 1,
    height: 4,
    position: 'absolute',
    top: 20,
    width: 2,
  },
  micBase: {
    backgroundColor: '#ffffff',
    borderRadius: 1,
    bottom: 0,
    height: 2,
    position: 'absolute',
    width: 12,
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 18,
    height: 38,
    justifyContent: 'center',
    paddingHorizontal: 13,
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  compactComposer: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderRadius: 24,
    borderWidth: 1,
    bottom: 16,
    flexDirection: 'row',
    gap: 8,
    left: 16,
    padding: 8,
    position: 'absolute',
    right: 16,
    zIndex: 10,
  },
  compactChatButton: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderColor: '#e5e7eb',
    borderRadius: 16,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  compactChatButtonText: {
    color: '#4b5563',
    fontSize: 12,
    fontWeight: '900',
  },
  floatingBar: {
    display: 'none',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    bottom: 12,
    flexDirection: 'row',
    gap: 12,
    left: 16,
    minHeight: 76,
    paddingHorizontal: 12,
    paddingVertical: 12,
    position: 'absolute',
    right: 16,
    zIndex: 10,
  },
  micCircle: {
    alignItems: 'center',
    backgroundColor: '#0044cc',
    borderRadius: 26,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  micCircleActive: {
    backgroundColor: '#dc2626',
  },
  micIcon: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  statusColumn: {
    flex: 1,
    gap: 2,
  },
  statusEyebrow: {
    color: '#9ca3af',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statusTitle: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  chatToggle: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#f3f4f6',
    borderRadius: 12,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    minWidth: 48,
    paddingHorizontal: 8,
  },
  chatToggleText: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '900',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonPressed: {
    opacity: 0.82,
  },
});
