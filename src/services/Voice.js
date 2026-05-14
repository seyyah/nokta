import * as Speech from 'expo-speech';

class NoktaVoice {
    constructor() {
        this.isPlaying = false;
        this._level = 0;
        this._interval = null;
    }

    speak(text, onEnd = null) {
        if (!text?.trim()) {
            onEnd?.();
            return;
        }

        this.stop();
        this.isPlaying = true;
        this._startLipSync();

        Speech.speak(text, {
            language: 'tr-TR',
            pitch: 1.1,
            rate: 1.0,
            onDone: () => {
                this.isPlaying = false;
                this._stopLipSync();
                onEnd?.();
            },
            onError: (error) => {
                console.error("Speech Error:", error);
                this.isPlaying = false;
                this._stopLipSync();
                onEnd?.();
            }
        });
    }

    _startLipSync() {
        this._stopLipSync();
        this._interval = setInterval(() => {
            // Mocking audio level for animation since expo-speech doesn't provide real-time levels
            this._level = this.isPlaying ? 0.3 + Math.random() * 0.7 : 0;
        }, 100);
    }

    _stopLipSync() {
        if (this._interval) {
            clearInterval(this._interval);
            this._interval = null;
        }
        this._level = 0;
    }

    getLevel() {
        return this._level;
    }

    stop() {
        Speech.stop();
        this.isPlaying = false;
        this._stopLipSync();
    }
}

export default new NoktaVoice();
