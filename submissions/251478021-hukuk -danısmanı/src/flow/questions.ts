export type LegalBriefStep = {
  id: string;
  prompt: string;
  hint?: string;
};

/** Avukata brif için yapılandırılmış soru seti */
export const LEGAL_BRIEF_STEPS: LegalBriefStep[] = [
  {
    id: 'facts',
    prompt:
      'Olay özeti nedir? Tarihler, yazışmalar, anlaşmazlığın çıkışı… Kısa ama sıralı yaz (3–10 cümle).',
    hint: 'Şahit isimleri gerekmez; olay zinciri önemli.',
  },
  {
    id: 'parties',
    prompt:
      'Sen kimin sıfatındasın ve karşı taraf kim? Örn. işçi/şirket, kiracı/malik, müşteri/satıcı, mağdur/şüpheli sıfatında değilsen yaz.',
    hint: 'Ceza sıfatında mı olduğundan emin misin netleştir.',
  },
  {
    id: 'phase',
    prompt:
      'Süreç hangi aşamada? (ör. daha dava yok, ihtar var, iş mahkemesinde ilk duruşma, icra takibi başladı) ve yaklaşan bir süre tarihi var mı?',
    hint: 'Süresi yakınsa mutlaka avukata erken danışmak gerekir.',
  },
  {
    id: 'proof',
    prompt:
      'Elindeki deliller: sözleşme, dekont, e-posta, kayıtlar… ve bilinen riskler neler? (eksik delil de yazılabilir)',
  },
  {
    id: 'remedy',
    prompt:
      'Nihai hedefin ne? (ör. alacak tahsili, iade, fesih, uzlaşma, bilgi edinme) tek cümlede ölçülebilir bir hedef yaz.',
  },
];

/** Geriye dönük uyumluluk */
export type EngineeringQuestion = LegalBriefStep;
export const ENGINEERING_QUESTIONS = LEGAL_BRIEF_STEPS;
