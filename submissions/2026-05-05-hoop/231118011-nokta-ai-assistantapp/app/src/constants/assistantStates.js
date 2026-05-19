export const ASSISTANT_STATES = {
  IDLE: "idle",
  SLEEP: "sleep",
  LISTENING: "listening",
  THINKING: "thinking",
  SPEAKING: "speaking",
  ANGRY: "angry",
  LOVE: "love",
  HAPPY: "happy",
  ERROR: "error"
};

export const ASSISTANT_STATE_LABELS = {
  [ASSISTANT_STATES.IDLE]: "Bekliyor",
  [ASSISTANT_STATES.SLEEP]: "Uyuyor",
  [ASSISTANT_STATES.LISTENING]: "Dinliyor",
  [ASSISTANT_STATES.THINKING]: "Düşünüyor",
  [ASSISTANT_STATES.SPEAKING]: "Konuşuyor",
  [ASSISTANT_STATES.ANGRY]: "Kızgın",
  [ASSISTANT_STATES.LOVE]: "Sevgi dolu",
  [ASSISTANT_STATES.HAPPY]: "Mutlu",
  [ASSISTANT_STATES.ERROR]: "Hata"
};

export const ASSISTANT_STATE_DESCRIPTIONS = {
  [ASSISTANT_STATES.IDLE]: "Nokta hazır ve etkileşim bekliyor.",
  [ASSISTANT_STATES.SLEEP]: "Nokta uzun süre işlem yapılmadığı için uykuya geçti.",
  [ASSISTANT_STATES.LISTENING]: "Nokta seni dinliyor.",
  [ASSISTANT_STATES.THINKING]: "Nokta cevabını düşünüyor.",
  [ASSISTANT_STATES.SPEAKING]: "Nokta cevabını sesli söylüyor.",
  [ASSISTANT_STATES.ANGRY]: "Nokta üst üste hızlı dokunulduğu için sinirlendi.",
  [ASSISTANT_STATES.LOVE]: "Nokta sevildiğini hissetti.",
  [ASSISTANT_STATES.HAPPY]: "Nokta mutlu ve enerjik.",
  [ASSISTANT_STATES.ERROR]: "Nokta bir sorunla karşılaştı."
};

export const DEFAULT_ASSISTANT_STATE = ASSISTANT_STATES.IDLE;

export const INACTIVITY_SLEEP_DELAY_MS = 10000;

export const ANGRY_TAP_LIMIT = 3;

export const ANGRY_TAP_WINDOW_MS = 1200;

export const TEMPORARY_EMOTION_DURATION_MS = 2500;