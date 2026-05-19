import * as Speech from 'expo-speech';

export const Voice = {
  speak: async (text, onStart, onDone) => {
    try {
      console.log("Voice: Speaking ->", text);
      const voices = await Speech.getAvailableVoicesAsync();
      const hasTurkish = voices.some(v => v.language.startsWith('tr'));
      console.log("Voice: Available voices count:", voices.length, "Turkish available:", hasTurkish);
      
      Speech.speak(text, {
        language: 'tr-TR',
        pitch: 1.1,
        rate: 0.9,
        onStart: () => {
          console.log("Voice: Started speaking");
          if (onStart) onStart();
        },
        onDone: () => {
          console.log("Voice: Finished speaking");
          if (onDone) onDone();
        },
        onStopped: () => {
          console.log("Voice: Stopped speaking");
          if (onDone) onDone();
        },
        onError: (error) => {
          console.error("Voice Error:", error);
          if (onDone) onDone();
        }
      });
    } catch (e) {
      console.error("Voice: Failed to initiate speech", e);
      if (onDone) onDone();
    }
  },
  stop: () => {
    console.log("Voice: Stopping");
    Speech.stop();
  }
};
