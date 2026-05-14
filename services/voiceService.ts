import Voice from '@react-native-voice/voice';
import * as Speech from 'expo-speech';

class VoiceService {
    constructor() {
        Voice.onSpeechResults = this.onSpeechResults.bind(this);
        Voice.onSpeechError = (e) => console.error('Voice Error:', e);
        this.speechHandler = null;
    }

    onSpeechResults(e) {
        if (this.speechHandler) {
            this.speechHandler(e.value[0]);
        }
    }

    async startListening(onResult) {
        this.speechHandler = onResult;
        try {
            await Voice.start('tr-TR');
        } catch (e) {
            console.error(e);
        }
    }

    async stopListening() {
        try {
            await Voice.stop();
        } catch (e) {
            console.error(e);
        }
    }

    speak(text, onDone) {
        Speech.speak(text, {
            language: 'tr-TR',
            pitch: 1.1,
            rate: 1.0,
            onDone: onDone,
        });
    }

    stopSpeaking() {
        Speech.stop();
    }
}

export default new VoiceService();
