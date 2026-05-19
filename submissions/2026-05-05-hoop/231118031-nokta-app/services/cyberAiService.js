const GROQ_API_KEY = '';
// 1. Sorunun hangi alana ait olduğunu tespit eden fonksiyon
export const detectDomain = async (userMessage) => {
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: "Sen bir analizcisin. Kullanıcının cümlesine bak ve SADECE sorunun ait olduğu siber güvenlik alanını yaz (Örn: SQL Injection, Ağ Güvenliği, Oltalama, Zararlı Yazılım). Başka hiçbir kelime kullanma." },
                    { role: "user", content: userMessage }
                ],
                temperature: 0.1,
            })
        });
        const data = await response.json();
        return data.choices[0].message.content.trim();
    } catch (error) {
        return "Siber Güvenlik";
    }
};

// 2. Uzman olarak cevap veren fonksiyon
export const fetchAIResponse = async (userMessage, domain) => {
    const systemPrompt = `Sen bir ${domain} uzmanısın. Kullanıcıya ${domain} sorunu hakkında pratik ve çözüm odaklı destek ver. Eğer sesli moddaysan kısa ve öz konuş.`;

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage }
                ],
                temperature: 0.5,
            })
        });
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        return "Bağlantı hatası oluştu.";
    }
};

// 3. Ses kaydını yazıya çeviren fonksiyon (Groq Whisper)
export const transcribeAudio = async (audioUri) => {
    let formData = new FormData();
    formData.append('file', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'audio.m4a',
    });
    formData.append('model', 'whisper-large-v3');

    try {
        const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'multipart/form-data',
            },
            body: formData
        });
        const data = await response.json();
        return data.text;
    } catch (error) {
        console.error("Transkript hatası:", error);
        return "Ses anlaşılamadı.";
    }
};