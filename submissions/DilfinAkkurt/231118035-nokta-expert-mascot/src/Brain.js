import Groq from "groq-sdk";
import Voice from "./Voice";

const apiKey = import.meta.env.VITE_GROQ_API_KEY;
console.log('🔑 Groq API key loaded:', apiKey ? apiKey.substring(0, 12) + '...' : 'MISSING!');

const groq = new Groq({
  apiKey: apiKey || 'dummy-key-to-prevent-crash',
  dangerouslyAllowBrowser: true,
});

class NoktaBrain {
  constructor() {
    this.history = [];
    this.systemPrompt = `Sen Nokta'sın. Kullanıcının fikirlerini toplayan, organize eden ve ona ilham veren neşeli, hızlı ve zeki bir asistansın.
Cevapların her zaman kısa, öz ve samimi olmalı (2-3 cümle). Uzun paragraflardan kaçın.
Birisi sana bir fikir anlattığında, onu onaylayıp teşvik edici bir soru sor.
Türkçe konuş.`;
    this.expertPrompt = `Sen Nokta'nın Canlı Uzman Desteği sistemisin (Uzman: Dilfin). Kullanıcının karşılaştığı sorunları çözen, profesyonel, yapıcı ve doğrudan bir insan uzmansın.
Kısa, net ve çözüm odaklı cevaplar ver. Kendini 'Ben uzman Dilfin' veya 'Uzman Dilfin olarak...' şeklinde tanıtabilirsin.
Cevaplarında kurumsal ama sıcak bir insan tonu kullan (2-3 cümle).
Türkçe konuş.`;
    this.isExpertMode = false;
  }

  setExpertMode(expertMode) {
    this.isExpertMode = expertMode;
    // Geçmişi temizleyerek bağlamın karışmasını önleyebiliriz
    this.history = [];
  }

  async sendMessage(message, onSpeechEnd = null) {
    let text = "Üzgünüm, şu an bağlantı kuramıyorum.";
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: this.isExpertMode ? this.expertPrompt : this.systemPrompt },
          ...this.history,
          { role: "user", content: message }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 150,
      });
      text = completion.choices[0]?.message?.content || text;
      this.history.push({ role: "user", content: message });
      this.history.push({ role: "assistant", content: text });
      if (this.history.length > 20) this.history = this.history.slice(-20);
    } catch (e) {
      console.error('❌ Groq API error:', e.message, e.status, e);
      Voice.stop();
      throw e; // Re-throw so App.jsx can handle it
    }

    Voice.speak(text, onSpeechEnd);
    return text;
  }
}

export default new NoktaBrain();
