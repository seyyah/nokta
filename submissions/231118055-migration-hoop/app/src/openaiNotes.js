import { buildIdeaCards, titleCase } from './noktaEngine';

const DEFAULT_OPENROUTER_MODEL = 'openai/gpt-4o-mini';
const DEFAULT_OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const DEFAULT_OPENAI_MODEL = 'gpt-5.4-mini';
const DEFAULT_OPENAI_BASE_URL = 'https://api.openai.com/v1';
const DEFAULT_APP_TITLE = 'Nokta AI v4';
const PROMPT_CHAR_LIMIT = 6000;

function clamp(value, min, max) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return min;
  }

  return Math.min(max, Math.max(min, numeric));
}

function toText(value, fallback = '') {
  if (typeof value === 'string') {
    const text = value.trim();
    return text || fallback;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return fallback;
}

function toList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => toText(item)).filter(Boolean);
  }

  const text = toText(value);
  return text ? [text] : [];
}

function truncateText(text, limit = PROMPT_CHAR_LIMIT) {
  const value = toText(text);
  if (value.length <= limit) {
    return value;
  }

  return `${value.slice(0, limit - 1).trim()}...`;
}

function compactNotes(notes) {
  return notes.map((note) => ({
    id: note.id,
    source: note.source,
    text: note.text,
  }));
}

function compactCards(cards) {
  return cards.map((card) => ({
    id: card.id,
    title: card.title,
    summary: card.summary,
    noteCount: card.noteCount,
    uniqueSources: card.uniqueSources,
    sourceSummary: card.sourceSummary,
    confidence: Number(card.confidence.toFixed(2)),
    confidenceLabel: card.confidenceLabel,
    keywords: card.keywords,
    anchorText: card.anchorText,
    closeMatch: card.closeMatch
      ? {
          id: card.closeMatch.id,
          title: card.closeMatch.title,
          score: Number(card.closeMatch.score.toFixed(2)),
        }
      : null,
  }));
}

function normalizeRecommendation(value, fallback) {
  const text = toText(value).toLowerCase();

  if (text.includes('merge') || text.includes('birle')) {
    return 'merge';
  }

  if (text.includes('keep') || text.includes('separate') || text.includes('ayri')) {
    return 'keep-separate';
  }

  if (text.includes('human') || text.includes('review') || text.includes('mentor')) {
    return 'needs-human-review';
  }

  return fallback;
}

function buildSystemPrompt() {
  return [
    'Sen Nokta uygulamasinin Turkce not analiz asistanisin.',
    'Gorevin yapistirilmis notlari ve local cluster kartlarini okuyup kullaniciya kisa ve net bir cevap vermek.',
    'Sadece JSON uret. Markdown, aciklama veya kod blogu kullanma.',
    'Veri disinda yeni bilgi uydurma. Kaynak/provenance sinyallerini koru.',
    'Notlar karisiksa bunu acikca soyle.',
    'JSON schemiasi:',
    '{',
    '  "title": string,',
    '  "summary": string,',
    '  "directAnswer": string,',
    '  "nextSteps": string[],',
    '  "riskNotes": string[],',
    '  "mentorHint": string,',
    '  "cards": [',
    '    {',
    '      "cardId": string,',
    '      "answer": string,',
    '      "recommendation": "merge" | "keep-separate" | "needs-human-review",',
    '      "confidence": number,',
    '      "reason": string',
    '    }',
    '  ]',
    '}',
  ].join('\n');
}

function buildUserPrompt({ rawText, source, notes, cards }) {
  return [
    `Kaynak: ${source}`,
    '',
    'Ham notlar:',
    truncateText(rawText),
    '',
    'Local cluster ozeti:',
    JSON.stringify(
      {
        notes: compactNotes(notes),
        cards: compactCards(cards),
      },
      null,
      2
    ),
  ].join('\n');
}

function extractJsonBlock(text) {
  const trimmed = toText(text);
  if (!trimmed) {
    throw new Error('AI response was empty.');
  }

  try {
    return JSON.parse(trimmed);
  } catch (error) {
    const fencedMatch = trimmed.match(/```json\s*([\s\S]*?)```/i) || trimmed.match(/```\s*([\s\S]*?)```/i);
    if (fencedMatch) {
      try {
        return JSON.parse(fencedMatch[1]);
      } catch (innerError) {
        // fall through
      }
    }

    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start >= 0 && end > start) {
      const slice = trimmed.slice(start, end + 1);
      return JSON.parse(slice);
    }

    throw error;
  }
}

function getConfig() {
  const openrouterApiKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY || '';
  const openaiApiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';

  const appTitle = (process.env.EXPO_PUBLIC_OPENROUTER_APP_TITLE || DEFAULT_APP_TITLE).trim();
  const siteUrl = (process.env.EXPO_PUBLIC_OPENROUTER_SITE_URL || '').trim();

  if (openrouterApiKey) {
    return {
      provider: 'openrouter',
      providerLabel: 'OpenRouter',
      apiKey: openrouterApiKey,
      baseUrl: (process.env.EXPO_PUBLIC_OPENROUTER_BASE_URL || DEFAULT_OPENROUTER_BASE_URL).replace(
        /\/$/,
        ''
      ),
      model: process.env.EXPO_PUBLIC_OPENROUTER_MODEL || DEFAULT_OPENROUTER_MODEL,
      enabled: true,
      appTitle,
      siteUrl,
    };
  }

  if (openaiApiKey) {
    return {
      provider: 'openai',
      providerLabel: 'OpenAI',
      apiKey: openaiApiKey,
      baseUrl: (process.env.EXPO_PUBLIC_OPENAI_BASE_URL || DEFAULT_OPENAI_BASE_URL).replace(
        /\/$/,
        ''
      ),
      model: process.env.EXPO_PUBLIC_OPENAI_MODEL || DEFAULT_OPENAI_MODEL,
      enabled: true,
      appTitle,
      siteUrl,
    };
  }

  return {
    provider: 'openrouter',
    providerLabel: 'OpenRouter',
    apiKey: '',
    baseUrl: DEFAULT_OPENROUTER_BASE_URL,
    model: DEFAULT_OPENROUTER_MODEL,
    enabled: false,
    appTitle,
    siteUrl,
  };
}

export function getOpenRouterAnalysisConfig() {
  return getConfig();
}

export function getOpenAIAnalysisConfig() {
  return getOpenRouterAnalysisConfig();
}

function buildDefaultCardInsight(card) {
  return {
    answer: `${card.title} karti ${card.noteCount} notu bir araya getiriyor. ${card.sourceSummary} kaynaklarinda dogrulama yapman faydali olur.`,
    recommendation: card.closeMatch ? 'merge' : 'needs-human-review',
    confidence: card.confidence,
    reason: card.closeMatch
      ? `En yakin eslesme ${card.closeMatch.title} ile ${Math.round(card.closeMatch.score * 100)}% benzer.`
      : 'Yakin eslesme zayif; bu karti ayri tutmak daha guvenli.',
  };
}

function normalizeCardInsight(modelCard, localCard) {
  const fallback = buildDefaultCardInsight(localCard);
  const answer = toText(modelCard?.answer || modelCard?.summary || modelCard?.directAnswer, fallback.answer);
  const reason = toText(modelCard?.reason || modelCard?.why || modelCard?.explanation, fallback.reason);
  const recommendation = normalizeRecommendation(modelCard?.recommendation, fallback.recommendation);
  const confidence = clamp(modelCard?.confidence ?? modelCard?.score ?? localCard.confidence, 0, 1);

  return {
    answer,
    recommendation,
    confidence,
    reason,
  };
}

function buildEmptyAnalysis(source) {
  return {
    mode: 'local',
    provider: 'local',
    providerLabel: 'Local',
    model: null,
    source,
    title: 'Henuz not yok',
    summary: 'Analiz icin en az bir not yapistir.',
    directAnswer: 'Burada henuz analiz edilecek bir sey yok.',
    nextSteps: [],
    riskNotes: [],
    mentorHint: 'Once not alanini doldur ve "Analyze notes" butonuna bas.',
    cards: [],
    stats: {
      totalNotes: 0,
      clusters: 0,
      avgConfidence: 0,
    },
    error: '',
    rawResponse: '',
  };
}

function buildLocalAnalysis(local, source, reason = '') {
  const enrichedCards = local.cards.map((card) => {
    const insight = normalizeCardInsight(null, card);

    return {
      ...card,
      aiAnswer: insight.answer,
      aiRecommendation: insight.recommendation,
      aiConfidence: insight.confidence,
      aiReason: insight.reason,
    };
  });

  const topCard = enrichedCards[0] || null;
  const topTitles = enrichedCards.slice(0, 3).map((card) => card.title).join(', ');

  return {
    mode: 'local',
    provider: 'local',
    providerLabel: 'Local',
    model: null,
    source,
    title: topCard ? titleCase(`${source} local analysis`) : 'Yerel analiz',
    summary: topCard
      ? `${local.stats.totalNotes} not ${enrichedCards.length} kartta toplandi.`
      : 'Analiz icin anlamli not bulunamadi.',
    directAnswer: topCard
      ? `En guclu tema "${topCard.title}". ${topCard.noteCount} not ve ${topCard.uniqueSources} kaynak bir araya gelmis durumda.`
      : 'Notlardan anlamli bir kart cikmadi.',
    nextSteps: topCard
      ? enrichedCards.slice(0, 3).map((card) => `"${card.title}" kartini dogrula ve gerekirse yeni notlarla guclendir.`)
      : [],
    riskNotes:
      enrichedCards.length > 1
        ? ['Kartlar hala birbirine yakin olabilir.', 'AI API aktif degil, local heuristic kullanildi.']
        : ['AI API aktif degil, local heuristic kullanildi.'],
    mentorHint: topCard
      ? `En guclu kartlar: ${topTitles}.`
      : 'Daha fazla not girerek daha net bir cevap alabilirsin.',
    cards: enrichedCards,
    stats: {
      totalNotes: local.stats.totalNotes,
      clusters: local.stats.clusters,
      avgConfidence: local.stats.avgConfidence,
    },
    error: reason,
    rawResponse: '',
  };
}

function normalizeModelAnalysis(payload, local, source, model, rawResponse, provider = 'openrouter') {
  const payloadCards = Array.isArray(payload?.cards) ? payload.cards : [];
  const providerLabel = provider === 'openai' ? 'OpenAI' : 'OpenRouter';

  const enrichedCards = local.cards.map((card, index) => {
    const modelCard =
      payloadCards.find(
        (item) => item?.cardId === card.id || item?.id === card.id || item?.title === card.title
      ) || payloadCards[index] || null;
    const insight = normalizeCardInsight(modelCard, card);

    return {
      ...card,
      aiAnswer: insight.answer,
      aiRecommendation: insight.recommendation,
      aiConfidence: insight.confidence,
      aiReason: insight.reason,
    };
  });

  const title = toText(payload?.title, titleCase(`${source} ai analysis`));
  const summary = toText(
    payload?.summary,
    `${local.stats.totalNotes} not ${local.cards.length} kartta toplandi.`
  );
  const directAnswer = toText(
    payload?.directAnswer,
    enrichedCards[0]
      ? `En guclu tema "${enrichedCards[0].title}" etrafinda toplaniyor.`
      : 'Notlardan anlamli bir cevap cikarilamadi.'
  );
  const nextSteps = toList(payload?.nextSteps);
  const riskNotes = toList(payload?.riskNotes);
  const mentorHint = toText(
    payload?.mentorHint || payload?.followUpQuestion,
    enrichedCards[0]
      ? `Bir sonraki adimda "${enrichedCards[0].title}" kartini dogrula.`
      : 'Daha fazla not ekleyip tekrar analiz et.'
  );

  return {
    mode: provider,
    provider,
    providerLabel,
    model,
    source,
    title,
    summary,
    directAnswer,
    nextSteps,
    riskNotes,
    mentorHint,
    cards: enrichedCards,
    stats: {
      totalNotes: local.stats.totalNotes,
      clusters: local.stats.clusters,
      avgConfidence: local.stats.avgConfidence,
    },
    error: '',
    rawResponse,
  };
}

export async function analyzeNotes({ rawText, source = 'Paste' } = {}) {
  const local = buildIdeaCards(rawText, source);

  if (!local.cards.length) {
    return buildEmptyAnalysis(source);
  }

  const config = getConfig();
  if (!config.enabled) {
    return buildLocalAnalysis(local, source, 'API key not configured.');
  }

  const payload = {
    source,
    rawText: truncateText(rawText),
    notes: compactNotes(local.notes),
    cards: compactCards(local.cards),
  };

  try {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    };

    if (config.provider === 'openrouter') {
      headers['X-OpenRouter-Title'] = config.appTitle || DEFAULT_APP_TITLE;
      headers['X-Title'] = config.appTitle || DEFAULT_APP_TITLE;

      if (config.siteUrl) {
        headers['HTTP-Referer'] = config.siteUrl;
      }
    }

    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          { role: 'user', content: buildUserPrompt(payload) },
        ],
        temperature: 0.2,
      }),
    });

    const responseText = await response.text();
    let responseData = null;

    try {
      responseData = JSON.parse(responseText);
    } catch (error) {
      responseData = null;
    }

    if (!response.ok) {
      const message =
        responseData?.error?.message ||
        responseData?.message ||
        `${config.providerLabel} request failed with status ${response.status}.`;
      return buildLocalAnalysis(local, source, message);
    }

    const content =
      responseData?.choices?.[0]?.message?.content ||
      responseData?.choices?.[0]?.message?.text ||
      '';

    const parsed = extractJsonBlock(content);
    return normalizeModelAnalysis(parsed, local, source, config.model, content, config.provider);
  } catch (error) {
    return buildLocalAnalysis(
      local,
      source,
      error.message || `${config.providerLabel} request failed.`
    );
  }
}

function buildChatSystemPrompt() {
  return [
    'Sen Nokta uygulamasinda notlar uzerine sohbet eden Turkce bir asistansin.',
    'Kullanici sana mevcut not boardunu, analiz sonucunu ve bir soru veriyor.',
    'Kisa, net, sicak ve dogrudan cevap ver.',
    'Not defterine mini bir yorum yaziyormussun gibi davran.',
    'Markdown kullanma. JSON kullanma. Gerekiyorsa en fazla bir iki kisa madde ekle.',
    'Veri disina cikma ve yeni bilgi uydurma.',
  ].join('\n');
}

function buildChatUserPrompt({ question, rawText, source, notes, cards, analysis, history }) {
  const snapshot = {
    source,
    question: truncateText(question, 1200),
    analysis: analysis
      ? {
          title: analysis.title,
          summary: analysis.summary,
          directAnswer: analysis.directAnswer,
          nextSteps: analysis.nextSteps,
          riskNotes: analysis.riskNotes,
          mentorHint: analysis.mentorHint,
        }
      : null,
    notes: compactNotes(notes || []),
    cards: compactCards(cards || []),
    history: Array.isArray(history)
      ? history.slice(-6).map((item) => ({
          role: item.role,
          content: truncateText(item.content, 1200),
        }))
      : [],
    rawText: truncateText(rawText),
  };

  return [
    `Kaynak: ${source}`,
    '',
    'Kullanicinin sorusu:',
    truncateText(question, 1200),
    '',
    'Board ozeti:',
    JSON.stringify(snapshot, null, 2),
  ].join('\n');
}

function buildLocalChatReply({ question, analysis, cards, history }) {
  const topCard = cards?.[0] || null;
  const lastUserMessage = Array.isArray(history)
    ? [...history].reverse().find((item) => item.role === 'user')?.content || ''
    : '';
  const summary = analysis?.summary || 'Henüz analiz edilmemis notlar var.';
  const focus = topCard
    ? `En güçlü kart "${topCard.title}" ve bu kart ${topCard.noteCount} notu bir araya getiriyor.`
    : 'Henüz yeterli kart yok, biraz daha not eklemek iyi olur.';

  return [
    `Soruna kisa cevap: ${truncateText(question, 240)}`,
    focus,
    `Kisa not: ${summary}`,
    lastUserMessage ? `Son istegine göre: ${truncateText(lastUserMessage, 180)}` : '',
    'Istersen bir not daha ekleyip tekrar analiz edelim.',
  ]
    .filter(Boolean)
    .join(' ');
}

export async function chatAboutNotes({
  question,
  rawText = '',
  source = 'Paste',
  notes = [],
  cards = [],
  analysis = null,
  history = [],
} = {}) {
  const trimmedQuestion = toText(question);
  if (!trimmedQuestion) {
    return {
      mode: 'local',
      provider: 'local',
      providerLabel: 'Local',
      model: null,
      reply: 'Bir soru yazip gonder.',
      rawResponse: '',
      error: '',
    };
  }

  const config = getConfig();
  const localReply = buildLocalChatReply({ question: trimmedQuestion, analysis, cards, history });

  if (!config.enabled) {
    return {
      mode: 'local',
      provider: 'local',
      providerLabel: 'Local',
      model: null,
      reply: localReply,
      rawResponse: '',
      error: 'API key not configured.',
    };
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.apiKey}`,
  };

  if (config.provider === 'openrouter') {
    headers['X-OpenRouter-Title'] = config.appTitle || DEFAULT_APP_TITLE;
    headers['X-Title'] = config.appTitle || DEFAULT_APP_TITLE;

    if (config.siteUrl) {
      headers['HTTP-Referer'] = config.siteUrl;
    }
  }

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: buildChatSystemPrompt() },
          {
            role: 'user',
            content: buildChatUserPrompt({
              question: trimmedQuestion,
              rawText,
              source,
              notes,
              cards,
              analysis,
              history,
            }),
          },
        ],
        temperature: 0.35,
      }),
    });

    const responseText = await response.text();
    let responseData = null;

    try {
      responseData = JSON.parse(responseText);
    } catch (error) {
      responseData = null;
    }

    if (!response.ok) {
      const message =
        responseData?.error?.message ||
        responseData?.message ||
        `${config.providerLabel} request failed with status ${response.status}.`;

      return {
        mode: 'local',
        provider: 'local',
        providerLabel: 'Local',
        model: null,
        reply: `${localReply} (${message})`,
        rawResponse: '',
        error: message,
      };
    }

    const content =
      responseData?.choices?.[0]?.message?.content ||
      responseData?.choices?.[0]?.message?.text ||
      '';
    const reply = toText(content, localReply);

    return {
      mode: config.provider,
      provider: config.provider,
      providerLabel: config.providerLabel,
      model: config.model,
      reply,
      rawResponse: content,
      error: '',
    };
  } catch (error) {
    const message = error.message || `${config.providerLabel} request failed.`;
    return {
      mode: 'local',
      provider: 'local',
      providerLabel: 'Local',
      model: null,
      reply: `${localReply} (${message})`,
      rawResponse: '',
      error: message,
    };
  }
}
