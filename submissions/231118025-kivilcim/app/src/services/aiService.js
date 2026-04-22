import {
    SLOP_ANALYSIS_PROMPT,
    PROBLEM_SOLUTION_PROMPT,
    CONSTRAINTS_PROMPT,
    ADAPTIVE_QUESTION_PROMPT,
    BLIND_SPOT_PROMPT,
    SPEC_GENERATION_PROMPT,
    SCOPE_KNIFE_PROMPT,
    RED_TEAM_PROMPT,
    KILL_SWITCH_PROMPT,
} from '../utils/prompts';

// ⚠️ OpenRouter API Key
// https://openrouter.ai/keys adresinden ücretsiz alabilirsiniz
const API_KEY = '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';

// Ücretsiz modeller — kota dolduğunda sıradakine geçer
const MODELS = [
    'google/gemma-3-27b-it:free',
    'nvidia/nemotron-nano-9b-v2:free',
    'meta-llama/llama-3.2-3b-instruct:free',
];
let currentModelIndex = 0;

async function callAI(systemPrompt, userMessage, retries = 3) {
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + API_KEY,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://kivilcim.app',
                'X-Title': 'Kivilcim',
            },
            body: JSON.stringify({
                model: MODELS[currentModelIndex],
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage },
                ],
                temperature: 0.7,
                max_tokens: 2000,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            // Rate limit — sonraki modele geç
            if (response.status === 429 && currentModelIndex < MODELS.length - 1) {
                console.warn('Model ' + MODELS[currentModelIndex] + ' kota doldu, sonraki deneniyor...');
                currentModelIndex++;
                return callAI(systemPrompt, userMessage, retries);
            }
            throw new Error('API Error ' + response.status + ': ' + errorText);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        if (retries > 0) {
            const delay = retries === 3 ? 2000 : retries === 2 ? 4000 : 8000;
            console.warn('Retry in ' + delay + 'ms... (' + retries + ' kalan)');
            await new Promise(r => setTimeout(r, delay));
            return callAI(systemPrompt, userMessage, retries - 1);
        }
        throw error;
    }
}

function parseJSON(text) {
    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return null;
    } catch (e) {
        console.warn('JSON parse error:', e, 'Text:', text);
        return null;
    }
}

// 1. Anlık Slop Analizi (Debounce — hafif)
export async function analyzeSlopScore(text) {
    const response = await callAI(SLOP_ANALYSIS_PROMPT, text);
    const parsed = parseJSON(response);
    return parsed || { score: 50, type: 'vague', reason: 'Analiz yapılamadı, tekrar dene.' };
}

// 2. Problem vs Çözüm Ayrıştırma
export async function analyzeProblemSolution(text) {
    const response = await callAI(PROBLEM_SOLUTION_PROMPT, text);
    const parsed = parseJSON(response);
    return parsed || { type: 'solution', feedback: 'Fikrinizi daha net açıklayabilir misiniz?' };
}

// 3. Kısıt Soruları
export async function getConstraintQuestions(idea) {
    const response = await callAI(CONSTRAINTS_PROMPT, `Fikir: ${idea}`);
    return response;
}

// 4. Adaptif Soru Üretimi
export async function generateAdaptiveQuestion(idea, constraints, previousAnswers) {
    const context = `
FİKİR: ${idea}

KISITLAR: ${constraints}

ÖNCEKİ CEVAPLAR:
${previousAnswers.map((a, i) => `Soru ${i + 1}: ${a.question}\nCevap: ${a.answer}`).join('\n\n')}
`;
    const response = await callAI(ADAPTIVE_QUESTION_PROMPT, context);
    const parsed = parseJSON(response);
    return parsed || { status: 'done', dimension: '', question: '', isFollowUp: false };
}

// 5. Blind Spot Tespiti
export async function detectBlindSpots(idea, allAnswers) {
    const context = `
FİKİR: ${idea}

TÜM CEVAPLAR:
${allAnswers.map((a, i) => `${a.question}: ${a.answer}`).join('\n')}
`;
    const response = await callAI(BLIND_SPOT_PROMPT, context);
    const parsed = parseJSON(response);
    return parsed || { blindSpots: [] };
}

// 6. Spec Üretimi + Güven Skorları
export async function generateSpec(idea, constraints, allAnswers) {
    const context = `
FİKİR: ${idea}

KISITLAR: ${constraints}

TÜM CEVAPLAR:
${allAnswers.map((a, i) => `${a.question}: ${a.answer}`).join('\n')}
`;
    const response = await callAI(SPEC_GENERATION_PROMPT, context);

    const scoresMatch = response.match(/CONFIDENCE_SCORES:(\{[\s\S]*?\})/);
    let confidenceScores = { problem: 50, user: 50, solution: 50, technical: 50, revenue: 50, competition: 50 };
    if (scoresMatch) {
        try {
            confidenceScores = JSON.parse(scoresMatch[1]);
        } catch (e) { }
    }

    const specText = response.replace(/CONFIDENCE_SCORES:\{[\s\S]*?\}/, '').trim();
    return { spec: specText, confidenceScores };
}

// 7. Scope Knife
export async function applyScopeKnife(spec) {
    const response = await callAI(SCOPE_KNIFE_PROMPT, spec);
    const parsed = parseJSON(response);
    return parsed || { mvp: [], later: [], coreQuestion: '' };
}

// 8. Red Team
export async function runRedTeam(spec) {
    const response = await callAI(RED_TEAM_PROMPT, spec);
    const parsed = parseJSON(response);
    return parsed || { attacks: [] };
}

// 9. Kill Switch + İlk Adımlar
export async function evaluateKillSwitch(spec, attacks, defenses) {
    const context = `
SPEC:
${spec}

RED TEAM SALDIRILARI:
${attacks.map((a, i) => `${a.icon} ${a.perspective}: ${a.attack}`).join('\n')}

KULLANICI SAVUNMALARI:
${defenses.map((d, i) => `Saldırı ${i + 1} savunması: ${d}`).join('\n')}
`;
    const response = await callAI(KILL_SWITCH_PROMPT, context);
    const parsed = parseJSON(response);
    return parsed || { viable: true, score: 50, reasoning: 'Değerlendirme yapılamadı.', nextSteps: [] };
}
