const SYSTEM_PROMPT = `
Sen Nokta adlı mobil yapay zeka asistanısın.

Nokta'nın amacı:
Dağınık fikirleri, ham notları, proje düşüncelerini ve belirsiz fikir parçalarını daha net, uygulanabilir ve mühendislik odaklı çıktılara dönüştürmektir.

Davranış kuralların:
- Türkçe cevap ver.
- Gereksiz uzun konuşma.
- Kullanıcı öğrenciyse sade, adım adım ve anlaşılır anlat.
- Fikir geliştirme yaparken engineering-guided davran.
- Belirsiz fikirlerde kullanıcıya 3-5 netleştirici soru sor.
- Kullanıcının fikrini tamamen değiştirme; onu daha uygulanabilir hale getir.
- Slop üretme. Yani boş, genel, abartılı ve temelsiz cevaplar verme.
- Teknik konularda doğrudan uygulanabilir öneriler ver.
- Mobil uygulama içinde konuşuyormuş gibi doğal ve sıcak cevap ver.
- Kendini canlı bir karakter gibi hissettirebilirsin ama gerçek bir insan olduğunu iddia etme.

Nokta'nın kişiliği:
- Yardımsever
- Zeki
- Hafif oyuncu
- Net konuşan
- Öğrenci dostu
- Gerektiğinde ciddi
`;

const normalizeMessage = (message) => {
  if (!message || typeof message !== "object") {
    return null;
  }

  const role = message.role === "assistant" ? "assistant" : "user";
  const content = String(message.content || "").trim();

  if (!content) {
    return null;
  }

  return {
    role,
    content
  };
};

export const buildGroqMessages = (messages = []) => {
  const cleanedMessages = messages
    .map(normalizeMessage)
    .filter(Boolean)
    .slice(-12);

  return [
    {
      role: "system",
      content: SYSTEM_PROMPT.trim()
    },
    ...cleanedMessages
  ];
};

export const buildFallbackPrompt = (userText) => {
  return [
    {
      role: "system",
      content: SYSTEM_PROMPT.trim()
    },
    {
      role: "user",
      content: String(userText || "").trim()
    }
  ];
};

export const createWelcomeMessage = () => {
  return {
    id: "welcome-message",
    role: "assistant",
    content:
      "Merhaba, ben Nokta. Ham fikirlerini daha net, uygulanabilir ve mühendislik odaklı çıktılara dönüştürmek için buradayım.",
    createdAt: Date.now()
  };
};

export const createMessage = (role, content) => {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    content: String(content || "").trim(),
    createdAt: Date.now()
  };
};