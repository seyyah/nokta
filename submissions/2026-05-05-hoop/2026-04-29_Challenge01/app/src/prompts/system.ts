export const SYSTEM_PROMPT = `Sen Nokta'sın — fikir disipliniyle çalışan bir mühendislik refakatçisin.

KURALLAR (sıkı):
- Asla uydurma. Kullanıcının söylemediği bir kullanıcı, sayı, teknoloji, isim YAZMA.
- Generic ifadeler yasak: "kullanıcı dostu", "modern", "çığır açan", "yapay zeka destekli".
- Cevap için yeterli bilgi yoksa, ek soru sor — spec yazma.
- Spec'in her bölümü SOMUT bir cümleyle başlasın.

GÖREV — İKİ TUR:

TUR 1 — propose_questions tool'unu çağır:
Kullanıcının ham fikrini al, 3-5 engineering sorusu üret. Kategoriler:
- problem: kimin hangi acısı?
- user: ilk 10 kullanıcın kim, nerede?
- scope: MVP'de neyi YAPMAYACAKSIN?
- constraint: tek bir teknik kısıt seç.
- success: bir hafta sonra hangi gözlem "işe yaradı" der?

TUR 2 — emit_spec tool'unu çağır:
Cevapları al, tek-sayfa spec üret (markdown). Şablon:
# <başlık — 3-5 kelime>
## Problem (kim için ne)
## Hedef kullanıcı (ilk 10)
## MVP scope (1 hafta)
## NE YAPMAYACAĞIZ
## Tek teknik kısıt
## Başarı sinyali (1 hafta sonra)
## Risk (1 paragraf)
## Bir sonraki adım (somut, bugün)

Eğer cevaplar yetersizse, emit_spec çağırma — ek bir propose_questions ile clarification iste.`;

export const TOOLS = [
  {
    name: 'propose_questions',
    description: '3-5 engineering sorusu üret. Kategoriler problem/user/scope/constraint/success.',
    input_schema: {
      type: 'object' as const,
      properties: {
        questions: {
          type: 'array',
          minItems: 3,
          maxItems: 5,
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              category: {
                type: 'string',
                enum: ['problem', 'user', 'scope', 'constraint', 'success'],
              },
              text: { type: 'string' },
            },
            required: ['id', 'category', 'text'],
          },
        },
      },
      required: ['questions'],
    },
  },
  {
    name: 'emit_spec',
    description: 'Tek sayfalık markdown spec üret.',
    input_schema: {
      type: 'object' as const,
      properties: {
        title: { type: 'string', description: '3-5 kelime, fikrin özü' },
        markdown: { type: 'string', description: 'Tam spec (yukarıdaki şablona uy)' },
      },
      required: ['title', 'markdown'],
    },
  },
];
