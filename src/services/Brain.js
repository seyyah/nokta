import Groq from "groq-sdk";

class NoktaBrain {
    constructor() {
        this.history = [];
        this.groq = null;
        this.isDemoMode = true;
        this.systemPrompt = `Sen Nokta Uzman Destek asistanısın. 
Görevin: Kullanıcının dağınık fikirlerini (noktaları) mühendislik disipliniyle yapılandırılmış artifactlere dönüştürmek.

ÜSLUP:
- Neşeli, zeki ve profesyonel ol.
- Kısa ve öz konuş.
- Türkçe konuş.`;
    }

    setApiKey(apiKey) {
        if (!apiKey) {
            this.groq = null;
            this.isDemoMode = true;
            return;
        }
        this.groq = new Groq({
            apiKey: apiKey,
            dangerouslyAllowBrowser: true,
        });
        this.isDemoMode = false;
    }

    async sendMessage(message) {
        if (this.isDemoMode) {
            // Mock responses if NO API KEY
            return new Promise((resolve) => {
                setTimeout(() => {
                    const mockAnswers = [
                        "Harika bir fikir! Bu projeyi bir mühendislik disipliniyle nasıl yapılandırabiliriz?",
                        "Fikrinizi 'Nokta' felsefesiyle bir artifact'e dönüştürmek için önce temel problemi tanımlayalım.",
                        "Bu noktada sizi bir uzman danışmana bağlamamı ister misiniz? Teknik detayları o daha iyi açıklayabilir.",
                        "Anladım. Peki bu çözümün hedef kitlesi tam olarak kimler olacak?",
                        "Nokta olarak bu fikri çok potansiyelli görüyorum!"
                    ];
                    resolve(mockAnswers[Math.floor(Math.random() * mockAnswers.length)]);
                }, 1000);
            });
        }

        try {
            const completion = await this.groq.chat.completions.create({
                messages: [
                    { role: "system", content: this.systemPrompt },
                    ...this.history,
                    { role: "user", content: message }
                ],
                model: "llama-3.3-70b-versatile",
                temperature: 0.7,
            });

            const reply = completion.choices[0]?.message?.content || "Üzgünüm, şu an yanıt veremiyorum.";
            this.history.push({ role: "user", content: message });
            this.history.push({ role: "assistant", content: reply });
            return reply;
        } catch (error) {
            console.error("Groq Error:", error);
            throw error;
        }
    }

    resetHistory() {
        this.history = [];
    }
}

export default new NoktaBrain();
