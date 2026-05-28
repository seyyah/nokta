import type { PersonaKey } from '../../src/store/usePersonaStore';

export interface MarkdownPayload {
  transcript: string;
  persona: PersonaKey;
  timestamp: string;
}

export const MarkdownService = {
  generateAuditNote(payload: MarkdownPayload) {
    return `# NOKTA Audit Kayıt

- timestamp: ${payload.timestamp}
- persona: ${payload.persona}
- transcript: ${payload.transcript}

## Özet

${this.generateAssistantSummary(payload)}
`;
  },

  generateAssistantSummary(payload: MarkdownPayload) {
    return `Nokta, kullanıcıdan alınan sesli girdiyi değerlendirdi ve önerilen eylemlere göre güvenli bir üretim yanıtı oluşturdu. Bu başlangıç yanıtı, konuşma tonunu **${payload.persona}** personasına göre uyarladı.`;
  },

  buildResponse(transcript: string, persona: PersonaKey) {
    const greeting = persona === 'senior-sen'
      ? 'Tamam, bunu derinlemesine ele alalım.'
      : 'Harika, hemen bakıyorum.';
    const highlights = transcript.length > 120
      ? 'Uzun ve detaylı bir kayıt aldı.'
      : 'Hızlı bir kayıt alındı.';

    return `Selam! ${greeting} ${highlights} Aşağıdaki çıkarımlar öncelikli:

- Kaydedilen konuşma: «${transcript.slice(0, 200)}»
- Öneri: Bu konuyu demo güvenli şekilde özetle ve next step çıkar.

Nokta, yanıtını üretirken teklif edilen çözümleri ve demo stabilitesini önceliklendirdi.`;
  },
};
