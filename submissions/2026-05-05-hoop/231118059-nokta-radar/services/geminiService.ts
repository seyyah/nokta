/**
 * geminiService.ts
 * Gemini 2.0 Flash API entegrasyonu + HITL yönlendirme mantığı.
 *
 * Akış:
 *  1. Knowledge base'i tara → eşleşme varsa direkt cevap ver
 *  2. Gemini'ye gönder (Nokta Radar system prompt ile)
 *  3. Yanıtta [HITL_REQUIRED] varsa HITL kuyruğuna ekle
 */

import { GEMINI_API_KEY, GEMINI_MODEL, GEMINI_API_BASE, HITL_TRIGGER_PHRASE } from '../constants/config';
import { searchKnowledge } from './knowledgeService';
import { addToQueue, HitlItem } from './hitlService';

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export type GeminiResponseType = 'direct' | 'knowledge' | 'hitl';

export interface GeminiResult {
  type: GeminiResponseType;
  text: string;             // AI cevabı (HITL durumunda boş olabilir)
  hitlItem?: HitlItem;      // HITL'e düşerse kuyruktaki item
  knowledgeUsed?: boolean;  // Knowledge base'den mi geldi
}

const SYSTEM_PROMPT = `Sen Nokta Radar'ın yapay zeka asistanısın. Görevin:
- Girişim fikri analizi, slop tespiti, pazar araştırması ve due diligence konularında rehberlik etmek
- "Mühendislik rehberliğinde" düşünmek: belirsiz ifadeleri kabul etmemek, somut kanıt istemek
- Nokta ekosistemini (Slop Score, Anti-Slop mimari, fikir kuluçkası) bilmek ve bu çerçevede yanıt vermek
- Türkçe yanıt vermek

KRİTİK KURAL — HITL Tetikleme:
Aşağıdaki durumlarda kesinlikle [HITL_REQUIRED] yaz ve açıkla:
1. Belirli bir şirketin güncel verisi soruluyorsa (fiyat, kullanıcı sayısı, finansal durum)
2. Yasal, hukuki veya patent konuları
3. Belirli bir kişinin görüşü veya biyografisi
4. Son 6 ay içinde gerçekleşmiş piyasa olayları
5. Kesinlikle bilmediğin ve %70 altında güvende olduğun herhangi bir spesifik olgu

[HITL_REQUIRED] kullandığında format şu şekilde olmalı:
[HITL_REQUIRED]: Bu soru [neden emin olamıyorum] içerdiğinden bir uzmana yönlendiriyorum.

Genel yazılım mühendisliği, girişimcilik, slop analizi, iş modelleri gibi konularda özgürce cevap ver.
Kısa ve net cevaplar ver. Gerekmedikçe liste kullanma.`;

/**
 * Gemini API'ye mesaj gönderir
 */
async function callGeminiAPI(
  history: ChatMessage[],
  userMessage: string
): Promise<string> {
  const url = `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  // System prompt'u ilk kullanıcı mesajına prefix olarak ekle
  const contents: ChatMessage[] = [
    {
      role: 'user',
      parts: [{ text: `[SYSTEM]\n${SYSTEM_PROMPT}\n[/SYSTEM]\n\n${history.length === 0 ? userMessage : history[0]?.parts[0]?.text}` }],
    },
    ...(history.length > 0
      ? [
        { role: 'model' as const, parts: [{ text: 'Anlaşıldı. Nokta Radar asistanı olarak hazırım.' }] },
        ...history.slice(1),
        { role: 'user' as const, parts: [{ text: userMessage }] },
      ]
      : []),
  ];

  const body = {
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API Hatası: ${response.status} — ${err}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini boş yanıt döndürdü.');
  return text;
}

/**
 * Ana servis fonksiyonu — Chat ekranından çağrılır.
 *
 * @param userMessage  Kullanıcının mesajı
 * @param chatId       Mesajın ID'si (HITL takibi için)
 * @param history      Önceki konuşma geçmişi
 * @param context      HITL için bağlam özeti
 */
export async function sendMessage(
  userMessage: string,
  chatId: string,
  history: ChatMessage[] = [],
  context?: string
): Promise<GeminiResult> {

  // --- 1. Knowledge Base Kontrolü ---
  try {
    const knowledgeAnswer = await searchKnowledge(userMessage);
    if (knowledgeAnswer) {
      return {
        type: 'knowledge',
        text: `📚 *Uzman Bilgi Tabanından:*\n\n${knowledgeAnswer}`,
        knowledgeUsed: true,
      };
    }
  } catch {
    // Knowledge hatası kritik değil, devam et
  }

  // --- 2. Gemini API Çağrısı ---
  let geminiText: string;
  try {
    geminiText = await callGeminiAPI(history, userMessage);
  } catch (error: any) {
    return {
      type: 'direct',
      text: `⚠️ Bağlantı hatası: ${error.message}. Lütfen tekrar dene.`,
    };
  }

  // --- 3. HITL Kontrolü ---
  if (geminiText.includes(HITL_TRIGGER_PHRASE)) {
    const hitlItem = await addToQueue(chatId, userMessage, context);
    return {
      type: 'hitl',
      text: geminiText,
      hitlItem,
    };
  }

  // --- 4. Normal Cevap ---
  return {
    type: 'direct',
    text: geminiText,
  };
}
