import {
    ANGRY_TAP_LIMIT,
    ANGRY_TAP_WINDOW_MS,
    ASSISTANT_STATES
} from "../constants/assistantStates";

export const getCleanTapTimestamps = (tapTimestamps, now = Date.now()) => {
  if (!Array.isArray(tapTimestamps)) {
    return [];
  }

  return tapTimestamps.filter((timestamp) => {
    return now - timestamp <= ANGRY_TAP_WINDOW_MS;
  });
};

export const getStateAfterTap = (tapTimestamps, now = Date.now()) => {
  const cleanTimestamps = getCleanTapTimestamps(tapTimestamps, now);
  const nextTimestamps = [...cleanTimestamps, now];

  if (nextTimestamps.length >= ANGRY_TAP_LIMIT) {
    return {
      state: ASSISTANT_STATES.ANGRY,
      tapTimestamps: []
    };
  }

  return {
    state: ASSISTANT_STATES.HAPPY,
    tapTimestamps: nextTimestamps
  };
};

export const getStateAfterLongPress = () => {
  return ASSISTANT_STATES.LOVE;
};

export const getStateAfterSwipe = () => {
  return ASSISTANT_STATES.LOVE;
};

export const getStateAfterUserMessage = () => {
  return ASSISTANT_STATES.THINKING;
};

export const getStateAfterAssistantReply = () => {
  return ASSISTANT_STATES.SPEAKING;
};

export const getStateAfterSpeechEnd = () => {
  return ASSISTANT_STATES.IDLE;
};

export const getStateAfterListenStart = () => {
  return ASSISTANT_STATES.LISTENING;
};

export const getStateAfterListenEnd = () => {
  return ASSISTANT_STATES.IDLE;
};

export const getStateAfterError = () => {
  return ASSISTANT_STATES.ERROR;
};

export const shouldWakeFromSleep = (currentState) => {
  return currentState === ASSISTANT_STATES.SLEEP;
};

export const getEmotionByText = (text) => {
  const normalizedText = String(text || "").toLowerCase();

  const loveWords = ["teşekkür", "sev", "harika", "mükemmel", "çok iyi", "eline sağlık"];
  const angryWords = ["kötü", "saçma", "yanlış", "sinir", "beğenmedim"];
  const thinkingWords = ["nasıl", "neden", "açıkla", "anlat", "çöz", "yardım"];

  if (loveWords.some((word) => normalizedText.includes(word))) {
    return ASSISTANT_STATES.LOVE;
  }

  if (angryWords.some((word) => normalizedText.includes(word))) {
    return ASSISTANT_STATES.ANGRY;
  }

  if (thinkingWords.some((word) => normalizedText.includes(word))) {
    return ASSISTANT_STATES.THINKING;
  }

  return ASSISTANT_STATES.HAPPY;
};