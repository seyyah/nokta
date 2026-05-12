/**
 * Nokta — Expert Review Service Layer
 * Mock data with API-ready structure for human expert validation.
 */

// ─── Types ───────────────────────────────────────────────────

export type ExpertType = 'architect' | 'vc-analyst' | 'product-strategist';

export interface Expert {
  id: string;
  type: ExpertType;
  title: string;
  subtitle: string;
  description: string;
  icon: string; // Emoji for now, replaceable with image URI
  accentColor: string;
  hourlyRate: string;
  responseTime: string;
}

export interface ExpertFeedback {
  expertId: string;
  expertType: ExpertType;
  expertTitle: string;
  score: number; // 0-100
  feedback: string;
  verifiedAt: string;
  isHumanVerified: boolean;
}

// ─── Mock Expert Profiles ────────────────────────────────────

export const EXPERT_PROFILES: Expert[] = [
  {
    id: 'exp-arch-001',
    type: 'architect',
    title: 'Sr. Software Architect',
    subtitle: 'Teknik Mimari Analizi',
    description:
      'Sistem mimarisi, ölçeklenebilirlik ve teknik fizibilite konularında derinlemesine analiz sağlar.',
    icon: '🏗️',
    accentColor: '#3b82f6',
    hourlyRate: '₺2,500',
    responseTime: '~24 saat',
  },
  {
    id: 'exp-vc-001',
    type: 'vc-analyst',
    title: 'Venture Capital Analyst',
    subtitle: 'Yatırım Uygunluğu',
    description:
      'Pazar büyüklüğü, rekabet avantajı ve yatırım potansiyeli açısından projeyi değerlendirir.',
    icon: '📊',
    accentColor: '#8b5cf6',
    hourlyRate: '₺3,200',
    responseTime: '~48 saat',
  },
  {
    id: 'exp-prod-001',
    type: 'product-strategist',
    title: 'Product Strategy Expert',
    subtitle: 'Pazar Uyumu',
    description:
      'Product-market fit, kullanıcı deneyimi ve go-to-market stratejisi konusunda uzman görüşü sunar.',
    icon: '🎯',
    accentColor: '#f59e0b',
    hourlyRate: '₺2,800',
    responseTime: '~36 saat',
  },
];

// ─── Mock Expert Feedback Data ───────────────────────────────

const MOCK_FEEDBACKS: Record<ExpertType, Omit<ExpertFeedback, 'expertId' | 'expertType' | 'expertTitle' | 'verifiedAt'>> = {
  architect: {
    score: 78,
    feedback:
      'Mimari yaklaşım genel olarak sağlam ancak mikroservis sınırları daha net tanımlanmalı. Veritabanı şeması normalizasyon açısından gözden geçirilmeli ve cache stratejisi eklenmeli. Ölçeklenebilirlik planında yatay ölçekleme senaryoları eksik.',
    isHumanVerified: true,
  },
  'vc-analyst': {
    score: 65,
    feedback:
      'Pazar büyüklüğü (TAM/SAM/SOM) analizi yetersiz — somut rakamlarla desteklenmeli. Rekabet avantajı net değil, mevcut oyunculardan farklılaşma stratejisi zayıf. Ancak hedef segment doğru seçilmiş, unit economics modeli eklenirse yatırım tezi güçlenir.',
    isHumanVerified: true,
  },
  'product-strategist': {
    score: 82,
    feedback:
      'Kullanıcı problemi iyi tanımlanmış ve çözüm önerisi tutarlı. Ancak MVP kapsamı fazla geniş — ilk lansmanı 3 temel özelliğe daraltmanızı öneriyorum. Kullanıcı edinme kanalları ve retention stratejisi daha detaylı planlanmalı.',
    isHumanVerified: true,
  },
};

// ─── Service Functions (API-ready) ───────────────────────────

/**
 * Fetches available expert profiles.
 * In production, this would be an API call to the expert marketplace.
 */
export async function getAvailableExperts(): Promise<Expert[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  return EXPERT_PROFILES;
}

/**
 * Requests expert review for a given artifact.
 * In production, this sends the artifact to the expert via API.
 * @param expertId - The expert's unique ID
 * @param _artifactData - The artifact data to review (unused in mock)
 */
export async function requestExpertReview(
  expertId: string,
  _artifactData: unknown
): Promise<ExpertFeedback> {
  const expert = EXPERT_PROFILES.find((e) => e.id === expertId);
  if (!expert) {
    throw new Error('Expert not found');
  }

  // Simulate expert review time (5 seconds for demo)
  await new Promise((resolve) => setTimeout(resolve, 5000));

  const mockFeedback = MOCK_FEEDBACKS[expert.type];

  return {
    expertId: expert.id,
    expertType: expert.type,
    expertTitle: expert.title,
    score: mockFeedback.score,
    feedback: mockFeedback.feedback,
    verifiedAt: new Date().toISOString(),
    isHumanVerified: mockFeedback.isHumanVerified,
  };
}
