class NoktaVoice {
  constructor() {
    this.isPlaying = false;
    this._level = 0;
    this._interval = null;
    this._unlocked = false;
  }

  unlock() {
    if (this._unlocked) return;
    const utter = new SpeechSynthesisUtterance('');
    utter.volume = 0;
    speechSynthesis.speak(utter);
    this._unlocked = true;
  }

  speak(text, onEnd = null, isFemale = false) {
    if (!text?.trim()) { onEnd?.(); return; }
    this.stop();

    const utter = new SpeechSynthesisUtterance(text);
    utter.volume = 1;
    utter.lang = 'tr-TR';
    utter.rate = 1.05;
    utter.pitch = isFemale ? 1.4 : 1.2;

    const voices = speechSynthesis.getVoices();
    let trVoice = null;
    
    if (isFemale) {
      trVoice = voices.find(v => v.lang.startsWith('tr') && 
        (v.name.toLowerCase().includes('female') || 
         v.name.toLowerCase().includes('yelda') || 
         v.name.toLowerCase().includes('kadın')));
    } else {
      trVoice = voices.find(v => v.lang.startsWith('tr') && 
        (v.name.toLowerCase().includes('male') || 
         v.name.toLowerCase().includes('cem') || 
         v.name.toLowerCase().includes('tolga') || 
         v.name.toLowerCase().includes('erkek')));
    }
    
    // Fallback to any TR voice
    if (!trVoice) trVoice = voices.find(v => v.lang.startsWith('tr'));
    
    if (trVoice) utter.voice = trVoice;

    utter.onstart = () => {
      this.isPlaying = true;
      this._startLipSync();
    };
    utter.onend = () => {
      this.isPlaying = false;
      this._stopLipSync();
      onEnd?.();
    };
    utter.onerror = () => {
      this.isPlaying = false;
      this._stopLipSync();
      onEnd?.();
    };

    speechSynthesis.speak(utter);
  }

  _startLipSync() {
    this._stopLipSync();
    this._interval = setInterval(() => {
      this._level = this.isPlaying ? 0.2 + Math.random() * 0.8 : 0;
    }, 80);
  }

  _stopLipSync() {
    clearInterval(this._interval);
    this._interval = null;
    this._level = 0;
  }

  stop() {
    speechSynthesis.cancel();
    this.isPlaying = false;
    this._stopLipSync();
  }

  getLevel() { return this._level; }
}

export default new NoktaVoice();
