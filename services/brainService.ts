import Groq from 'groq-sdk';

const API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;

class BrainService {
    private history: any[] = [];
    private groq: Groq | null = null;
    private isDemoMode: boolean = false;
    private systemPrompt: string;

    constructor() {
        if (!API_KEY) {
            console.warn("GROQ_API_KEY is missing. Running in Demo Mode.");
            this.isDemoMode = true;
        } else {
            this.groq = new Groq({
                apiKey: API_KEY,
                dangerouslyAllowBrowser: true,
            });
        }

        this.systemPrompt = ` Sen Nokta'nın uzman mascotusun. 
    Görevin: Kullanıcının dağınık fikrini ("nokta") slop-free, halüsinasyonsuz ve mühendislik rehberliğinde bir spesifikasyona (artifact) dönüştürmek.
    
    KURALLAR:
    1. Her zaman Türkçe konuş.
    2. Engineering-guided yaklaşımı benimse. Fikri anlamak için 3 ila 5 adet keskin ve yönlendirici soru sor.
    3. Sorular şunları kapsamalı: Hedef kitle, teknik kısıtlar, temel kullanıcı yolculuğu ve kapsam (scope).
    4. Cevapların kısa ve enerjik olsun (2-3 cümle).
    5. Her konuşmada mascotu "talking" moduna geçirecek metinler üret.
    
    AKIŞ:
    - Kullanıcı fikri söyler.
    - Sen sorularını sorarsın.
    - Sonunda bir "Artifact" (spec) ve bir "Confidence Score" (0-100) üretirsin. `;
    }

    async sendMessage(message: string) {
        if (this.isDemoMode) {
            return new Promise<string>((resolve) => {
                setTimeout(() => {
                    const mockAnswers = [
                        "Harika bir başlangıç! Bu fikrin hedef kitlesi tam olarak kimler?",
                        "Nokta olarak bu fikri çok potansiyelli görüyorum! Teknik kısıtlarınız var mı?",
                        "Bu konsepti bir mühendislik disipliniyle kurgulayalım. Temel kullanıcı yolculuğu nasıl olacak?",
                        "Anladım. Peki bu çözümün en kritik özelliği ne olmalı?",
                        "İlginç bir nokta! Bunu daha detaylı incelememizi ister misin?"
                    ];
                    resolve(mockAnswers[Math.floor(Math.random() * mockAnswers.length)]);
                }, 1000);
            });
        }

        try {
            const completion = await this.groq!.chat.completions.create({
                messages: [
                    { role: 'system', content: this.systemPrompt },
                    ...this.history,
                    { role: 'user', content: message },
                ],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.6,
                max_tokens: 500,
            });

            const response = completion.choices[0]?.message?.content || "";
            this.history.push({ role: 'user', content: message });
            this.history.push({ role: 'assistant', content: response });

            return response;
        } catch (e) {
            console.error('Brain Error:', e);
            return "Üzgünüm, şu an bağlantı kuramıyorum. Lütfen API anahtarını kontrol et.";
        }
    }

    resetHistory() {
        this.history = [];
    }
}

export default new BrainService();
