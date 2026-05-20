import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.EXPO_PUBLIC_GROQ_API_KEY,
    dangerouslyAllowBrowser: true,
});

export function detectExpertNeed(text: string): "Low" | "Medium" | "High" {
    const riskyWords = [
        "legal", "law", "money", "investment", "health",
        "security", "privacy", "patent", "business", "market",
        "technical", "database", "ai", "yatırım", "hukuk",
        "sağlık", "finans", "güvenlik", "patent", "pazar",
    ];

    const lower = text.toLowerCase();
    const matched = riskyWords.filter((word) => lower.includes(word));

    if (matched.length >= 3) return "High";
    if (matched.length >= 1) return "Medium";
    return "Low";
}

function fallbackReply(risk: "Low" | "Medium" | "High") {
    if (risk === "High") return "Bu fikir hassas konular içeriyor. Uzman desteği önerilir.";
    if (risk === "Medium") return "Bu fikir ilginç ancak bazı kısımlar uzman görüşü gerektirebilir.";
    return "Bu fikir erken aşama geliştirme için uygun görünüyor.";
}

export function fallbackAiReview(text: string) {
    const risk = detectExpertNeed(text);
    return { riskLevel: risk, reply: fallbackReply(risk) };
}

export async function aiReview(text: string) {
    const risk = detectExpertNeed(text);

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content:
                        "Sen Nokta'sın. Kullanıcının fikrini 2-3 cümleyle değerlendir. Uzman gerekiyorsa belirt. Türkçe konuş.",
                },
                { role: "user", content: text },
            ],
            model: "llama-3.3-70b-versatile",
            max_tokens: 150,
            temperature: 0.7,
        });

        return {
            riskLevel: risk,
            reply: completion.choices[0]?.message?.content || fallbackReply(risk),
        };
    } catch {
        return fallbackAiReview(text);
    }
}