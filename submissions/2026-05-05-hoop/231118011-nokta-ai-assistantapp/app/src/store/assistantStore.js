import { create } from "zustand";
import {
    ASSISTANT_STATES,
    DEFAULT_ASSISTANT_STATE,
    INACTIVITY_SLEEP_DELAY_MS,
    TEMPORARY_EMOTION_DURATION_MS
} from "../constants/assistantStates";
import { askGroq } from "../services/groqService";
import {
    getEmotionByText,
    getStateAfterAssistantReply,
    getStateAfterError,
    getStateAfterListenEnd,
    getStateAfterListenStart,
    getStateAfterLongPress,
    getStateAfterSpeechEnd,
    getStateAfterSwipe,
    getStateAfterTap,
    getStateAfterUserMessage
} from "../utils/emotionMachine";
import { createMessage, createWelcomeMessage } from "../utils/promptBuilder";

let sleepTimer = null;
let temporaryEmotionTimer = null;

const clearSleepTimer = () => {
  if (sleepTimer) {
    clearTimeout(sleepTimer);
    sleepTimer = null;
  }
};

const clearTemporaryEmotionTimer = () => {
  if (temporaryEmotionTimer) {
    clearTimeout(temporaryEmotionTimer);
    temporaryEmotionTimer = null;
  }
};

export const useAssistantStore = create((set, get) => ({
  assistantState: DEFAULT_ASSISTANT_STATE,
  messages: [createWelcomeMessage()],
  inputText: "",
  lastTranscript: "",
  isListening: false,
  isThinking: false,
  isSpeaking: false,
  lastError: "",
  tapTimestamps: [],

  setInputText: (text) => {
    set({
      inputText: String(text || "")
    });

    get().resetInactivityTimer();
  },

  setAssistantState: (nextState) => {
    set({
      assistantState: nextState
    });
  },

  resetInactivityTimer: () => {
    clearSleepTimer();

    const currentState = get().assistantState;

    if (
      currentState === ASSISTANT_STATES.THINKING ||
      currentState === ASSISTANT_STATES.LISTENING ||
      currentState === ASSISTANT_STATES.SPEAKING
    ) {
      return;
    }

    sleepTimer = setTimeout(() => {
      const stateNow = get().assistantState;

      if (
        stateNow !== ASSISTANT_STATES.THINKING &&
        stateNow !== ASSISTANT_STATES.LISTENING &&
        stateNow !== ASSISTANT_STATES.SPEAKING
      ) {
        set({
          assistantState: ASSISTANT_STATES.SLEEP
        });
      }
    }, INACTIVITY_SLEEP_DELAY_MS);
  },

  wakeUp: () => {
    clearSleepTimer();

    set({
      assistantState: ASSISTANT_STATES.IDLE,
      lastError: ""
    });

    get().resetInactivityTimer();
  },

  applyTemporaryEmotion: (emotionState) => {
    clearTemporaryEmotionTimer();

    set({
      assistantState: emotionState
    });

    temporaryEmotionTimer = setTimeout(() => {
      const currentState = get().assistantState;

      if (
        currentState === ASSISTANT_STATES.ANGRY ||
        currentState === ASSISTANT_STATES.LOVE ||
        currentState === ASSISTANT_STATES.HAPPY ||
        currentState === ASSISTANT_STATES.ERROR
      ) {
        set({
          assistantState: ASSISTANT_STATES.IDLE
        });

        get().resetInactivityTimer();
      }
    }, TEMPORARY_EMOTION_DURATION_MS);
  },

  handleAvatarTap: () => {
    const currentState = get().assistantState;

    if (currentState === ASSISTANT_STATES.SLEEP) {
      get().wakeUp();
      return;
    }

    const result = getStateAfterTap(get().tapTimestamps);

    set({
      tapTimestamps: result.tapTimestamps
    });

    get().applyTemporaryEmotion(result.state);
  },

  handleAvatarLongPress: () => {
    get().applyTemporaryEmotion(getStateAfterLongPress());
  },

  handleAvatarSwipe: () => {
    get().applyTemporaryEmotion(getStateAfterSwipe());
  },

  startListeningState: () => {
    clearSleepTimer();

    set({
      assistantState: getStateAfterListenStart(),
      isListening: true,
      lastError: ""
    });
  },

  stopListeningState: () => {
    set({
      assistantState: getStateAfterListenEnd(),
      isListening: false
    });

    get().resetInactivityTimer();
  },

  setTranscript: (text) => {
    set({
      lastTranscript: String(text || ""),
      inputText: String(text || "")
    });

    get().resetInactivityTimer();
  },

  addMessage: (role, content) => {
    const message = createMessage(role, content);

    set((state) => ({
      messages: [...state.messages, message]
    }));

    get().resetInactivityTimer();

    return message;
  },

  clearConversation: () => {
    set({
      messages: [createWelcomeMessage()],
      inputText: "",
      lastTranscript: "",
      lastError: "",
      assistantState: ASSISTANT_STATES.IDLE,
      isListening: false,
      isThinking: false,
      isSpeaking: false,
      tapTimestamps: []
    });

    get().resetInactivityTimer();
  },

  sendMessageToAssistant: async (text) => {
    const userText = String(text || get().inputText || "").trim();

    if (!userText) {
      get().applyTemporaryEmotion(ASSISTANT_STATES.ERROR);

      set({
        lastError: "Boş mesaj gönderilemez."
      });

      return null;
    }

    clearSleepTimer();
    clearTemporaryEmotionTimer();

    const userMessage = createMessage("user", userText);

    set((state) => ({
      messages: [...state.messages, userMessage],
      inputText: "",
      lastTranscript: userText,
      assistantState: getStateAfterUserMessage(),
      isThinking: true,
      isSpeaking: false,
      isListening: false,
      lastError: ""
    }));

    try {
      const currentMessages = get().messages;

      const replyText = await askGroq({
        messages: currentMessages
      });

      const assistantMessage = createMessage("assistant", replyText);
      const emotionFromReply = getEmotionByText(replyText);

      set((state) => ({
        messages: [...state.messages, assistantMessage],
        assistantState:
          emotionFromReply === ASSISTANT_STATES.THINKING
            ? getStateAfterAssistantReply()
            : emotionFromReply,
        isThinking: false,
        isSpeaking: true,
        lastError: ""
      }));

      return assistantMessage;
    } catch (error) {
      const errorMessage = error?.message || "Bilinmeyen bir hata oluştu.";
      const assistantErrorMessage = createMessage("assistant", errorMessage);

      set((state) => ({
        messages: [...state.messages, assistantErrorMessage],
        assistantState: getStateAfterError(),
        isThinking: false,
        isSpeaking: false,
        lastError: errorMessage
      }));

      return assistantErrorMessage;
    }
  },

  finishSpeaking: () => {
    set({
      assistantState: getStateAfterSpeechEnd(),
      isSpeaking: false
    });

    get().resetInactivityTimer();
  },

  setError: (message) => {
    set({
      assistantState: ASSISTANT_STATES.ERROR,
      lastError: String(message || "Bilinmeyen hata."),
      isThinking: false,
      isListening: false,
      isSpeaking: false
    });

    get().applyTemporaryEmotion(ASSISTANT_STATES.ERROR);
  }
}));