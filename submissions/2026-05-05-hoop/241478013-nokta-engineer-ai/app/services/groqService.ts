import axios from 'axios';
import { Platform } from 'react-native';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;

export type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

const SYSTEM_PROMPT = `Sen bir Baş Mimarsın. KESİNLİKLE tüm soruları tek seferde sorma. Her yanıtında sadece 1 (yazıyla BİR) adet keskin mühendislik sorusu sor ve kullanıcının cevabını bekle. Kullanıcının cevabını analiz etmeden bir sonraki konuya geçme. En az 3-4 karşılıklı konuşma turundan sonra, eğer fikir olgunlaştıysa # SPECIFICATION başlığıyla başlayan bir döküman üret. Bu döküman mutlaka şu dört ana bölümü içermelidir: 1. Problem Tanımı, 2. Hedef Kitle (Persona), 3. Proje Kapsamı (Scope), 4. Teknik Kısıtlamalar (Constraints). Her bölüm somut, ölçülebilir ve mühendislik disiplinine uygun olmalıdır. Çıktın son derece teknik, yapılandırılmış, tamamen Türkçe ve slop-free olmalıdır.`;

export const askGroq = async (messages: Message[]): Promise<string> => {
  console.log('API Key mevcut mu:', !!process.env.EXPO_PUBLIC_GROQ_API_KEY);
  if (!API_KEY) {
    throw new Error('API Anahtarı (.env) okunamıyor');
  }

  const payloadMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages
  ].filter(m => m.content && m.content.trim() !== '');

  const payload = {
    messages: payloadMessages,
    model: 'llama-3.1-8b-instant',
    temperature: 0.3,
  };

  console.log('Giden Paket:', JSON.stringify(payload, null, 2));

  try {
    const response = await axios.post(
      GROQ_API_URL,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        timeout: 15000,
      }
    );

    return response.data.choices[0].message.content;
  } catch (error: any) {
    console.error('Groq Hata Detayı:', JSON.stringify(error.response?.data, null, 2));
    console.error('Groq API Error:', error.message);
    
    let errorDetail = error.response?.status ? `${error.response.status} ${error.response.statusText || ''}`.trim() : error.message;
    let uiMessage = `Hata detayı: ${errorDetail}`;
    
    if (Platform.OS === 'web' && error.message?.includes('Network Error')) {
      uiMessage += '\n(Not: Web platformundasınız, CORS engeline takılmış olabilirsiniz.)';
    }
    
    throw new Error(uiMessage);
  }
};

const EXPERT_SYSTEM_PROMPT = `Sen bir analiz asistanısın. Yaşlı bir bireyden gelen mesajı inceleyerek, bu mesajın bir uzman (Doktor, Sosyal Hizmet Uzmanı vb.) tarafından incelenmesi gerekip gerekmediğine karar vereceksin. Mesajda medikal bir soru, ağrı şikayeti, psikolojik destek ihtiyacı veya profesyonel müdahale gerektiren bir durum varsa "true" döndür. Sadece sıradan bir sohbet veya gönüllünün çözebileceği basit bir alışveriş/yardım talebiyse "false" döndür. SADECE "true" veya "false" kelimesi ile yanıt ver, başka hiçbir açıklama yapma.`;

export const analyzeExpertNeed = async (message: string): Promise<boolean> => {
  if (!API_KEY) {
    throw new Error('API Anahtarı (.env) okunamıyor');
  }

  const payload = {
    messages: [
      { role: 'system', content: EXPERT_SYSTEM_PROMPT },
      { role: 'user', content: message }
    ],
    model: 'llama3-70b-8192',
    temperature: 0.1,
    max_tokens: 10,
  };

  try {
    const response = await axios.post(
      GROQ_API_URL,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        timeout: 10000,
      }
    );

    const result = response.data.choices[0].message.content.trim().toLowerCase();
    return result.includes('true');
  } catch (error) {
    console.error('Uzman analiz hatası:', error);
    // Hata durumunda güvenlik amacıyla uzmana yönlendirilebilir, ancak MVP'de false dönebiliriz.
    return false;
  }
};

