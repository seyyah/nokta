import type { SlopResult } from '@/constants/slop-types';

export const mockSlopData = {
  slop_score: 88,
  is_slop: true,
  analysis:
    'Fikir cok yuzeysel. Pazar boyutu mantiksiz derecede abartilmis ve teknik mimari tamamen belirsiz. Bu haliyle fonlanamaz.',
  flaws: [
    {
      type: 'Market Size Inflation',
      description:
        "'Herkesin kullanacagi devasa bir platform' varsayimi gercekci degil. Nis hedef kitle netlesmemis.",
      severity: 'Critical',
    },
    {
      type: 'Technical Vague',
      description:
        "'Yapay zeka ile halledecegiz' cumlesi bir spesifikasyon degildir. Hangi model, nasil bir mimari kullanilacak belli degil.",
      severity: 'High',
    },
    {
      type: 'No Moat (Rekabet Engeli Yok)',
      description:
        'Rakiplerin bu ozelligi kendi sistemlerine 1 haftada eklememesi icin hicbir teknik engel (moat) sunulmamis.',
      severity: 'Medium',
    },
  ],
  engineering_questions: [
    {
      question: 'Bu projenin MVP asamasinda kullanacaginiz core framework nedir?',
      why_critical:
        'Framework secimi, gelistirme hizi, ekip verimliligi ve ilk 3 ayda teknik borcun ne kadar birikecegini dogrudan etkiler.',
      severity: 'Critical',
    },
    {
      question: '100k kullaniciya ulastiginizda veritabani okuma maliyetlerini nasil optimize edeceksiniz?',
      why_critical:
        'Olceklenme stratejisi erkenden netlesmezse trafik arttiginda maliyetler patlar ve performans dususu urun buyumesini frenler.',
      severity: 'High',
    },
  ],
} satisfies SlopResult;
