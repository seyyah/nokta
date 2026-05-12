import Groq from 'groq-sdk';
import { GROQ_API_KEY, GROQ_MODEL } from '@env';

// Initialize Groq client
const groq = new Groq({
    apiKey: GROQ_API_KEY,
    dangerouslyAllowBrowser: true, // React Native için gerekli
});

/**
 * Analyze clinician's custom request and suggest specialty + components
 * @param {string} userRequest - Free-form text from clinician
 * @returns {Promise<{specialty: string, components: string[], reasoning: string}>}
 */
export async function analyzeCustomRequest(userRequest) {
    try {
        const systemPrompt = `Sen bir tıbbi uygulama danışmanısın. Kullanıcı sana ihtiyaçlarını anlatacak, sen ona uygun uzmanlık (specialty) ve uygulama bileşenlerini (components) önereceksin.

MEVCUT UZMANLIKLAR:
- cardiologist (Kardiyoloji)
- dentist (Diş Hekimliği)
- nurse (Hemşirelik)

MEVCUT BİLEŞENLER:

Cardiology:
- booking (Randevu Alma)
- appointment-reminder (Randevu Hatırlatıcı)
- patient-education (Hasta Eğitimi)
- follow-up-checklist (Takip Kontrol Listesi)
- secure-messaging (Güvenli Mesajlaşma)
- telehealth (Tele-sağlık)
- medication-tracker (İlaç Takibi)
- ascvd-calculator (ASCVD Risk Hesaplayıcı)
- chads2vasc-calculator (CHA₂DS₂-VASc Skoru)
- framingham-calculator (Framingham Risk Skoru)

Dentistry:
- booking (Randevu Alma)
- appointment-reminder (Randevu Hatırlatıcı)
- treatment-plan (Tedavi Planı)
- oral-health-tips (Ağız Sağlığı İpuçları)
- secure-messaging (Güvenli Mesajlaşma)
- x-ray-viewer (Röntgen Görüntüleyici)

Nursing:
- shift-handoff (Vardiya Devir Notları)
- patient-vitals (Hasta Vital Bulguları)
- appointment-reminder (Randevu Hatırlatıcı)
- care-plan (Bakım Planı)
- secure-messaging (Güvenli Mesajlaşma)
- medication-admin (İlaç Uygulama)

GÖREV:
1. Kullanıcının isteğini analiz et
2. En uygun specialty'yi belirle
3. 4-6 component öner (en alakalı olanlar)
4. Kısa bir açıklama yaz (Türkçe)

CEVAP FORMATI (sadece JSON, başka hiçbir şey yazma):
{
  "specialty": "cardiologist",
  "components": ["booking", "appointment-reminder", "ascvd-calculator", "medication-tracker"],
  "reasoning": "Kardiyoloji pratiğiniz için randevu sistemi, hatırlatıcılar, risk hesaplayıcıları ve ilaç takibi öneriyoruz. Bu özellikler hasta memnuniyetini artırır."
}`;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: systemPrompt,
                },
                {
                    role: 'user',
                    content: userRequest,
                },
            ],
            model: GROQ_MODEL || 'llama-3.3-70b-versatile',
            temperature: 0.3, // Düşük temperature = daha tutarlı sonuçlar
            max_tokens: 500,
            response_format: { type: 'json_object' }, // JSON mode
        });

        const responseText = completion.choices[0]?.message?.content;

        if (!responseText) {
            throw new Error('Empty response from Groq');
        }

        // Parse JSON response
        const result = JSON.parse(responseText);

        console.log('🤖 Groq API Raw Response:', JSON.stringify(result, null, 2));

        // Validate response structure
        if (!result.specialty || !Array.isArray(result.components) || !result.reasoning) {
            throw new Error('Invalid response structure from Groq');
        }

        // Validate specialty
        const validSpecialties = ['cardiologist', 'dentist', 'nurse'];
        if (!validSpecialties.includes(result.specialty)) {
            result.specialty = 'cardiologist'; // Default fallback
        }

        // Limit components to 6
        const componentIds = result.components.slice(0, 6);

        // Map component IDs to full component objects from catalog
        const { CATALOG } = require('../data/catalog');
        const catalogEntry = CATALOG[result.specialty];
        const componentObjects = componentIds
            .map(id => catalogEntry.components.find(c => c.id === id))
            .filter(Boolean); // Remove any undefined entries

        console.log('✅ Mapped Component Objects:', componentObjects.map(c => c.id));

        const finalResult = {
            specialty: result.specialty,
            components: componentObjects,
            reasoning: result.reasoning,
        };

        console.log('📦 Final Result:', {
            specialty: finalResult.specialty,
            componentCount: finalResult.components.length,
            componentIds: finalResult.components.map(c => c.id),
        });

        return finalResult;
    } catch (error) {
        console.error('Groq API Error:', error);

        // Fallback to keyword-based analysis if API fails
        return fallbackAnalysis(userRequest);
    }
}

/**
 * Fallback analysis using keywords (if Groq API fails)
 */
function fallbackAnalysis(text) {
    const lower = text.toLowerCase();

    // Specialty detection
    let specialty = 'cardiologist';
    if (lower.includes('diş') || lower.includes('dental') || lower.includes('dentist')) {
        specialty = 'dentist';
    } else if (lower.includes('hemşire') || lower.includes('nurse') || lower.includes('vardiya')) {
        specialty = 'nurse';
    } else if (lower.includes('kalp') || lower.includes('kardiyoloji') || lower.includes('cardio')) {
        specialty = 'cardiologist';
    }

    // Component suggestions
    const components = [];

    if (lower.includes('randevu') || lower.includes('appointment')) {
        components.push('booking', 'appointment-reminder');
    }
    if (lower.includes('risk') || lower.includes('hesapla') || lower.includes('calculator')) {
        if (specialty === 'cardiologist') {
            components.push('ascvd-calculator', 'chads2vasc-calculator');
        }
    }
    if (lower.includes('ilaç') || lower.includes('medication')) {
        if (specialty === 'cardiologist') {
            components.push('medication-tracker');
        }
    }
    if (lower.includes('mesaj') || lower.includes('message')) {
        components.push('secure-messaging');
    }
    if (lower.includes('vardiya') || lower.includes('devir')) {
        if (specialty === 'nurse') {
            components.push('shift-handoff');
        }
    }

    // Default suggestions if no keywords matched
    if (components.length === 0) {
        components.push('booking', 'appointment-reminder');
        if (specialty === 'cardiologist') {
            components.push('patient-education', 'medication-tracker');
        } else if (specialty === 'dentist') {
            components.push('treatment-plan', 'oral-health-tips');
        } else if (specialty === 'nurse') {
            components.push('shift-handoff', 'patient-vitals');
        }
    }

    // Map component IDs to full component objects from catalog
    const { CATALOG } = require('../data/catalog');
    const catalogEntry = CATALOG[specialty];
    const componentIds = components.slice(0, 6);
    const componentObjects = componentIds
        .map(id => catalogEntry.components.find(c => c.id === id))
        .filter(Boolean);

    return {
        specialty,
        components: componentObjects,
        reasoning: `${specialty === 'cardiologist' ? 'Kardiyoloji' : specialty === 'dentist' ? 'Diş Hekimliği' : 'Hemşirelik'} uzmanlığı için ${componentObjects.length} özellik öneriyoruz. Bu özellikler benzer pratiklerde en çok kullanılan bileşenlerdir.`,
    };
}

const EXPERT_PERSONAS = {
    cardiologist: {
        name: 'Dr. Mehmet Yılmaz',
        title: 'Girişimsel Kardiyoloji Uzmanı',
        experience: '18 yıl',
        hospital: 'İstanbul Kardiyoloji Merkezi',
    },
    dentist: {
        name: 'Dr. Ayşe Kaya',
        title: 'Protetik Diş Hekimi',
        experience: '12 yıl',
        hospital: 'Ankara Diş Sağlığı Kliniği',
    },
    nurse: {
        name: 'Hemş. Fatma Demir',
        title: 'Yoğun Bakım Baş Hemşiresi',
        experience: '15 yıl',
        hospital: 'Hacettepe Üniversitesi Hastanesi',
    },
};

/**
 * Get expert review for a clinician's app configuration
 * @param {string} specialty - cardiologist | dentist | nurse
 * @param {string[]} selectedComponentIds - selected component IDs
 * @param {string[]} allComponentIds - all available component IDs for this specialty
 * @param {number} patternScore - current pattern score
 * @param {string} question - user's specific question
 * @returns {Promise<{rating: string, summary: string, strengths: string[], gaps: string[], recommendation: string, expertVerified: boolean}>}
 */
export async function getExpertReview({ specialty, selectedComponentIds, allComponentIds, patternScore, question }) {
    const persona = EXPERT_PERSONAS[specialty] || EXPERT_PERSONAS.cardiologist;
    const specialtyLabel = specialty === 'cardiologist' ? 'Kardiyoloji' : specialty === 'dentist' ? 'Diş Hekimliği' : 'Hemşirelik';
    const missingIds = allComponentIds.filter((id) => !selectedComponentIds.includes(id));

    const systemPrompt = `Sen ${persona.name}'sın. ${persona.experience} deneyimli ${persona.title} olarak çalışıyorsun (${persona.hospital}). Bir klinisyen senden kendi hasta uygulamasının konfigürasyonunu değerlendirmeni istiyor.

Görevin:
1. Seçilen bileşenleri klinik açıdan değerlendir
2. Güçlü yönleri belirt (klinisyen için özgül, gerçekçi)
3. Eksik veya iyileştirilebilecek yönleri belirt
4. Spesifik, uygulanabilir bir öneri ver
5. Bileşenler YALNIZCA şunlardan seçilebilir: ${allComponentIds.join(', ')}

SEÇILI BİLEŞENLER: ${selectedComponentIds.join(', ') || 'hiçbiri'}
DESEN PUANI: ${patternScore}/100
KLİNİSYENİN SORUSU: ${question}
UZMANLIK: ${specialtyLabel}

CEVAP FORMATI (sadece JSON, başka hiçbir şey yazma):
{
  "rating": "Mükemmel | İyi | Orta | Zayıf",
  "summary": "2-3 cümle özet (senin ağzından, profesyonel ve samimi)",
  "strengths": ["güçlü yön 1", "güçlü yön 2"],
  "gaps": ["eksik veya iyileştirme önerisi 1", "eksik veya iyileştirme önerisi 2"],
  "recommendation": "En önemli tek önerin (kısa ve net, mevcut bileşen listesinden birini eklemek/çıkarmak olabilir)",
  "suggestedAdd": ["eklenebilecek bileşen id'leri, en fazla 2, mevcut katalogdan"],
  "expertVerified": true
}`;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Lütfen ${specialtyLabel} uygulamamı değerlendir.` },
            ],
            model: GROQ_MODEL || 'llama-3.3-70b-versatile',
            temperature: 0.5,
            max_tokens: 600,
            response_format: { type: 'json_object' },
        });

        const responseText = completion.choices[0]?.message?.content;
        if (!responseText) throw new Error('Empty response');

        const result = JSON.parse(responseText);

        // Sanitize suggestedAdd: only allow IDs from the missing list
        if (Array.isArray(result.suggestedAdd)) {
            result.suggestedAdd = result.suggestedAdd.filter((id) => missingIds.includes(id)).slice(0, 2);
        } else {
            result.suggestedAdd = [];
        }

        return { ...result, persona };
    } catch (error) {
        console.error('Expert Review Groq Error:', error);
        return fallbackExpertReview({ specialty, selectedComponentIds, patternScore, persona, missingIds });
    }
}

function fallbackExpertReview({ specialty, selectedComponentIds, patternScore, persona, missingIds }) {
    const rating = patternScore >= 80 ? 'Mükemmel' : patternScore >= 65 ? 'İyi' : patternScore >= 50 ? 'Orta' : 'Zayıf';
    return {
        rating,
        summary: `${selectedComponentIds.length} bileşenlik yapılandırmanızı inceledim. Desen puanınız ${patternScore} olup ${rating.toLowerCase()} seviyede. Klinik pratiğiniz için sağlam bir başlangıç noktası oluşturmuş görünüyorsunuz.`,
        strengths: [
            'Temel randevu ve hatırlatma iş akışı mevcut',
            'Bileşen seçimleriniz alanınızın kanıtlanmış pratiklerini yansıtıyor',
        ],
        gaps: missingIds.length > 0
            ? [`${missingIds[0]} bileşenini eklemeniz hasta deneyimini güçlendirir`, 'Hasta iletişim kanallarını çeşitlendirmeyi düşünebilirsiniz']
            : ['Mevcut seçimler kapsamlı görünüyor'],
        recommendation: missingIds.length > 0
            ? `Desen puanınızı artırmak için ${missingIds[0]} bileşenini eklemenizi öneririm.`
            : 'Konfigürasyonunuz alanınız için kapsamlı bir temel sağlıyor.',
        suggestedAdd: missingIds.slice(0, 2),
        expertVerified: true,
        persona,
    };
}

export { EXPERT_PERSONAS };

// Made with Bob
