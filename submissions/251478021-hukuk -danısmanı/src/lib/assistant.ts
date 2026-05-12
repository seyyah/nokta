import type { LegalBriefStep } from '../flow/questions';
import { searchLegalKnowledgeBase } from './knowledge';

export function getOpenAIApiKey(): string | undefined {
  try {
    const k = typeof process !== 'undefined' ? process.env?.EXPO_PUBLIC_OPENAI_API_KEY : undefined;
    const t = typeof k === 'string' ? k.trim() : '';
    return t.length >= 12 ? t : undefined;
  } catch {
    return undefined;
  }
}

export function isOpenAIConfigured(): boolean {
  return false; // !!getOpenAIApiKey();
}

/** Kullanıcı aslında soru soruyorsa akışı ilerletme */
export function isLikelyClarificationQuestion(text: string): boolean {
  const s = text.trim();
  if (s.length === 0) return false;
  if (s.length > 200) return false;

  const lower = s.toLowerCase();
  const startsQuestion =
    /^(nedir|nasıl|ne\s|niçin|niye|kim|hangi|kaç|ne zaman|nerede|açıkla|anlamadım|ne demek|ne yap|yardım|help|what|how|why|can you|could you)\b/i.test(
      lower,
    );
  if (startsQuestion) return true;

  const hasQ = s.includes('?');
  if (hasQ) {
    return true;
  }

  if (
    /\b(anlamadım|şunu merak|örnek ver|örneğin|açıklar mısın|soru sor|cevap ver)\b/i.test(
      lower,
    )
  ) {
    return true;
  }

  return false;
}

function getLocalLegalAdvice(text: string): string | null {
  const bookAnswer = searchLegalKnowledgeBase(text);
  if (bookAnswer) {
    return bookAnswer;
  }

  const lower = text.toLowerCase();
  
  if (lower.includes('miras') || lower.includes('vasiyet')) {
    return 'Miras Hukuku: Miras paylaşımı yasal mirasçılar arasında zümre sistemine göre yapılır. İlk zümre altsoydur (çocuklar ve torunlar). Eşin miras payı, hangi zümreyle birlikte mirasçı olduğuna göre değişir (altsoyla ise 1/4). Mirasın reddi için yasal süre ölümün öğrenilmesinden itibaren 3 aydır. Detaylı pay hesabı veya tenkis davası gibi karmaşık durumlar için bir avukattan destek almanızı tavsiye ederim.';
  }
  if (lower.includes('boşanma') || lower.includes('nafaka') || lower.includes('velayet')) {
    return 'Aile Hukuku: Boşanma davaları anlaşmalı veya çekişmeli olabilir. Anlaşmalı boşanma için evliliğin en az 1 yıl sürmüş olması ve tarafların her konuda (nafaka, velayet, tazminat) mutabık kalması gerekir. Velayet kararlarında çocuğun üstün yararı gözetilir. Çekişmeli boşanmalarda süreç uzayabilir ve delillerin (tanık, mesaj, darp raporu vb.) usulüne uygun sunulması hayati önem taşır.';
  }
  if (lower.includes('kira') || lower.includes('tahliye') || lower.includes('ev sahibi')) {
    return 'Kira Hukuku: Kiracının tahliyesi için kanunda sayılan haklı sebeplerin (iki haklı ihtar, ihtiyaç, 10 yıllık uzama süresinin dolması vb.) oluşması gerekir. Kiracı kirayı ödemezse, icra takibi yoluyla tahliye istenebilir. Tahliye taahhütnamesi varsa, taahhüt edilen tarihte tahliye dava yoluyla sağlanabilir. İhtar süreleri çok sıkı olduğu için uzman yardımı önemlidir.';
  }
  if (lower.includes('iş') || lower.includes('kıdem') || lower.includes('ihbar') || lower.includes('kovul')) {
    return 'İş Hukuku: İşçinin haklı nedenle derhal fesih hakkı yoksa ve işveren haksız yere çıkarırsa kıdem ve ihbar tazminatına hak kazanılır. En az 1 yıllık çalışma süresi kıdem tazminatı için şarttır. İşe iade davası açmak için fesih bildiriminden itibaren 1 aylık hak düşürücü süre vardır. Arabuluculuk iş davalarında zorunlu dava şartıdır.';
  }
  if (lower.includes('ceza') || lower.includes('şikayet') || lower.includes('hapis') || lower.includes('dolandır')) {
    return 'Ceza Hukuku: Suç isnadı, şikayet veya soruşturma süreçleri son derece hassastır. Şikayete tabi suçlarda şikayet süresi fiilin ve failin öğrenilmesinden itibaren 6 aydır. Karakolda veya savcılıkta vereceğiniz ilk ifade dosyanın kaderini belirler. Ceza dosyalarında kesinlikle bir avukatın hukuki yardımından (müdafi) faydalanmanız yasal haklarınızı korumak adına elzemdir.';
  }
  if (lower.includes('icra') || lower.includes('haciz') || lower.includes('borç')) {
    return 'İcra Hukuku: Hakkınızda başlatılan ilamsız bir icra takibine (ödeme emrine) itiraz süresi, tebliğden itibaren 7 gündür. İtiraz takibi durdurur. Eğer haksız yere itiraz ederseniz %20 icra inkar tazminatı ödemek zorunda kalabilirsiniz. Süreler kesin olduğu için e-Devlet üzerinden takipleri düzenli kontrol etmelisiniz.';
  }
  if (lower.includes('arabulucu')) {
    return 'Arabuluculuk: İş, ticaret ve tüketici uyuşmazlıkları ile bazı kira davalarında arabuluculuk dava şartıdır. Yani arabulucuya gitmeden doğrudan dava açılamaz. Arabuluculuk görüşmelerinde taraflar esnektir, ancak imzalanan anlaşma belgesi mahkeme ilamı hükmündedir.';
  }
  if (lower.includes('nedir') || lower.includes('hukuk') || lower.includes('avukat') || lower.includes('dava') || lower.includes('mahkeme') || lower.includes('şikayet') || lower.includes('nasıl')) {
    return 'Genel Hukuk ve Yargı: Türk hukuk sisteminde süreler kesindir. Bir iddianızı ancak kanuna uygun delillerle ispatlayabilirsiniz (sözleşme, yazışmalar, dekontlar, tanık vb.). Ufak hatalar bile telafisi imkansız hak kayıplarına yol açabilir. Bu yüzden hukuki süreç başlatmadan veya tarafınıza açılan bir davaya cevap vermeden önce mutlaka uzman bir avukattan profesyonel danışmanlık almalısınız.';
  }

  return null;
}

export function getOfflineClarificationReply(params: {
  awaitingIdea: boolean;
  question: LegalBriefStep | null;
  ideaSummary: string;
  userMessage?: string;
}): string {
  if (params.userMessage) {
    const advice = getLocalLegalAdvice(params.userMessage);
    if (advice) {
      return advice + '\n\nŞimdi hukuki brif sürecimize geri dönelim. Eğer isterseniz, durumu detaylandırmak için soruyu yanıtlayabilirsiniz.';
    }
  }

  const defaultMsg = 'Maalesef sorduğunuz detay şu anki hukuki bilgi veritabanımda (Kitapta) tam olarak bulunmuyor. Sizi yanıltmamak ve hak kaybına uğramamanız adına, bu spesifik durumu mutlaka uzman bir avukata danışmanızı tavsiye ederim.\n\nDilerseniz sisteme eklediğimiz kitaptaki diğer konuları (Miras payları, Vasiyet, Boşanma vb.) sorabilir veya aşağıdaki brif sorusunu yanıtlayarak vaka özetinize devam edebilirsiniz:';

  if (params.awaitingIdea || !params.question) {
    return defaultMsg;
  }

  const ctx = params.ideaSummary.trim()
    ? `Durum özeti: “${params.ideaSummary.slice(0, 100)}…”`
    : '';

  return [defaultMsg, ctx, params.question.prompt].filter(Boolean).join('\n\n');
}

export type CoachResult = {
  reply: string | null;
  httpError?: string;
};

export async function fetchLmStudioStyleReply(params: {
  userMessage: string;
  context: string;
}): Promise<CoachResult> {
  const apiKey = getOpenAIApiKey();
  if (!apiKey) return { reply: null };

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.35,
        max_tokens: 600,
        messages: [
          {
            role: 'system',
            content:
              'Sen Nokta isimli avukat danışmanı asistanısın. Türkçe yaz. Kullanıcıların yönelttiği basit hukuk sorularını ve süreçleri öğretici, doyurucu ve net bir şekilde kendin çöz/cevapla. Ancak, kesin bağlayıcı hukuki görüş, dilekçe metni veya dava zafer taahhüdü verme. Çok karmaşık olaylarda "baroya kayıtlı uzman avukata başvur" uyarısını kibarca sonuna ekle.',
          },
          {
            role: 'user',
            content: `Bağlam:\n${params.context}\n\nKullanıcı mesajı:\n${params.userMessage}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      let detail = `${res.status}`;
      try {
        const body = (await res.json()) as { error?: { message?: string } };
        if (body.error?.message) detail = `${res.status}: ${body.error.message}`;
      } catch {
        /**/
      }
      return { reply: null, httpError: detail };
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    return text && text.length > 0 ? { reply: text } : { reply: null };
  } catch {
    return { reply: null, httpError: 'Ağ isteği başarısız' };
  }
}

/** Anahtar varken: hem netleştirme hem akış içi cevaplar için doğal Türkçe koç çıktısı */
export async function coachOnUserTurn(params: {
  awaitingIdea: boolean;
  currentQuestionId: string | null;
  currentQuestionPrompt: string | null;
  ideaSummary: string;
  collectedSoFarLines: string;
  userMessage: string;
  willAdvanceFlow: boolean;
  isLikelyPureQuestionOrHelp: boolean;
  flowHint?: 'initial_idea' | 'last_answer';
}): Promise<CoachResult> {
  const apiKey = getOpenAIApiKey();
  if (!apiKey) return { reply: null };

  let phaseName = params.awaitingIdea
    ? '1) ilk durum özeti / vaka özeti bekleniyor (2–5 cümleyle)'
    : `2) brif adımı (${params.currentQuestionId ?? 'bilinmiyor'}): ${params.currentQuestionPrompt ?? ''}`;

  if (params.flowHint === 'initial_idea') {
    phaseName =
      'Kullanıcı ilk hukuki bağlam özeti yazdı; sıradaki ekranda uygulama brif için ilk soruyu gösterecek.';
  }

  let mode = params.willAdvanceFlow
    ? 'Bu adım için yanıtı kabul et. 2–4 cümle: teşekkür + uygun bir “genel uyarı/brif eksikleri” düzeyinde yorum yap; bağlayıcı sonuç söyleme. Son soruyu/asistan metnini SEN yazma.'
    : 'Kullanıcı muhtemelen genel hukuk veya süreç sorusu soruyorsa öğretici ama sığ yanıt ver; bağlayıcı görüş dileme veya karmaşıklıkta mutlaka “uzman avukat” uyarısı ekle; sonraki uygulama sorusunun metnini yazma.';

  if (params.flowHint === 'initial_idea') {
    mode =
      'Durumu insan dili ile 2–3 cümlede onaylı tonla özle; netleştirme sorularına geçeceğimizi ima et (son soru metni uygulamada gelecek); bağlayıcı hukuk görüşü verme.';
  }

  if (params.flowHint === 'last_answer') {
    mode =
      'Son brif cevabını aldık; 2–4 cümle teşekkür + gerekiyorsa özeti avukata taşıması gerektiğini ima et; son soruyu yazma.';
  }

  const clarifyHint = params.isLikelyPureQuestionOrHelp
    ? 'Kullanıcı muhtemelen yardım/ne demek soruyor: soruya odaklan.'
    : 'Kullanıcı hem soru soruyor hem cevap vermiş olabilir: önce kısa cevap, sonra gerekiyorsa bir netleştirme sorusu (tek cümle).';

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.38,
        max_tokens: 600,
        messages: [
          {
            role: 'system',
            content:
              'Sen Nokta isimli hukuki danışman asistanısın. Türkçe yaz. Basit hukuki soruları detaylıca ve çok güzel bir üslupla kendin çöz. Ancak, dilekçe taslağı yazma veya kesin süre/zafer garantisi verme. Kullanıcıları bilgilendir, yardımcı ol, karmaşık durumlarda en sonda uzman avukat tavsiyesi ver.',
          },
          {
            role: 'user',
            content: [
              phaseName,
              '',
              mode,
              '',
              clarifyHint,
              '',
              'Durum özeti:',
              params.ideaSummary || '(yok)',
              '',
              'Toplanan başlıklar:',
              params.collectedSoFarLines || '(boş)',
              '',
              'Kullanıcı mesajı:',
              params.userMessage,
            ].join('\n'),
          },
        ],
      }),
    });

    if (!res.ok) {
      let detail = `${res.status}`;
      try {
        const body = (await res.json()) as { error?: { message?: string } };
        if (body.error?.message) detail = `${res.status}: ${body.error.message}`;
      } catch {
        /**/
      }
      return { reply: null, httpError: detail };
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    return text && text.length > 0 ? { reply: text } : { reply: null };
  } catch {
    return { reply: null, httpError: 'Ağ isteği başarısız' };
  }
}

export function buildAnswersBulletSummary(a: {
  idea: string;
  problem: string;
  user_segment: string;
  scope: string;
  constraints: string;
  success: string;
}): string {
  const lines: string[] = [];
  if (a.idea.trim()) lines.push(`- durum özeti: ${truncate(a.idea, 120)}`);
  if (a.problem.trim()) lines.push(`- olay: ${truncate(a.problem, 120)}`);
  if (a.user_segment.trim())
    lines.push(`- taraflar: ${truncate(a.user_segment, 120)}`);
  if (a.scope.trim()) lines.push(`- süreç aşaması: ${truncate(a.scope, 120)}`);
  if (a.constraints.trim())
    lines.push(`- delil / risk: ${truncate(a.constraints, 120)}`);
  if (a.success.trim())
    lines.push(`- talep/hedef: ${truncate(a.success, 120)}`);
  return lines.join('\n') || '(henüz toplanmadı)';
}

function truncate(t: string, n: number) {
  const s = t.replace(/\s+/g, ' ').trim();
  if (s.length <= n) return s;
  return `${s.slice(0, n)}…`;
}

export function buildAcknowledgmentSnippet(answer: string): string {
  const t = answer.replace(/\s+/g, ' ').trim();
  if (t.length <= 60) return t;
  return `${t.slice(0, 60)}…`;
}
