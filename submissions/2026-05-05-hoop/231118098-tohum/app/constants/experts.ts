export type ExpertVerdict = 'onay' | 'revize';

export type Expert = {
  id: string;
  name: string;
  field: string;
  bio: string;
  rating: number;
  reviewCount: number;
  avatar: string;
  mockReview: {
    comment: string;
    rating: number;
    verdict: ExpertVerdict;
  };
};

export const EXPERTS: Expert[] = [
  {
    id: 'e1',
    name: 'Dr. Mehmet Akar',
    field: 'Ürün Stratejisi',
    bio: 'Ex-Google PM. B2B SaaS & marketplace geçmişi. 12 yıl.',
    rating: 4.8,
    reviewCount: 47,
    avatar: '🧑‍💼',
    mockReview: {
      comment:
        'Tez net ve odaklı. Problem tanımı güçlü; pazar boşluğu iyi seçilmiş. "Neden Şimdi" bölümünü somut pazar verisiyle desteklersen yatırımcı hazırlığı belirgin artar. Scope disiplini mükemmel — "Ne Yapmaz" bölümü gereksiz genişlemeyi erken engellemiş. Genel olarak olgunlaştırılmaya hazır bir çekirdek.',
      rating: 4,
      verdict: 'onay',
    },
  },
  {
    id: 'e2',
    name: 'Ayşe Kaya',
    field: 'Pazar Doğrulama',
    bio: 'Startup danışmanı. 3 başarılı çıkış. Erken sahne uzmanı.',
    rating: 4.6,
    reviewCount: 32,
    avatar: '👩‍🔬',
    mockReview: {
      comment:
        '"Kim Fayda Sağlar" bölümündeki hedef kitle segmentasyonu gerçekçi. Ancak birden fazla segment hedeflenmesi erken fazda odağı dağıtır — ilk sürüm için tek birincil segmenti netleştirmeni öneririm. Genel yön doğru, küçük kalibrasyonla güçlenebilir.',
      rating: 3,
      verdict: 'revize',
    },
  },
  {
    id: 'e3',
    name: 'Can Öztürk',
    field: 'Teknik Mimari',
    bio: 'Kıdemli mühendis. Ölçeklenebilir sistem & API tasarımı.',
    rating: 4.9,
    reviewCount: 61,
    avatar: '👨‍💻',
    mockReview: {
      comment:
        'Mühendislik sınırları açık çizilmiş — bu nadir bir disiplin. "Nasıl Çalışır" akışı implementasyon için doğrudan kullanılabilir. Tek eksik: veri saklama ve gizlilik modeli. Kullanıcı verilerinin nerede tutulduğunu bir paragrafla netleştirirsen teknik spec tamamdır.',
      rating: 4,
      verdict: 'onay',
    },
  },
];

export function renderStars(rating: number): string {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}
