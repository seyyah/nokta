// AI ile yaptığımız kontratın TypeScript tarafı.
// Nokta AI her turda tam olarak NoktaAiResponse döner; client bunu
// doğrular, UI render eder, depo katmanı saklar.

import { RUBRIC_KEYS } from './prompt';

export type RubricKey = (typeof RUBRIC_KEYS)[number];

export type SignalStrength = 'empty' | 'partial' | 'strong';

export type RubricState = Record<RubricKey, SignalStrength>;

export type NoktaAiResponse = {
  /** Kullanıcıya gösterilecek tek mesaj. 1-2 cümle. */
  message: string;
  /**
   * Opsiyonel yön önerileri. Boş dizi sık kullanılır.
   * Maksimum her 2 turda 1 kez doldurulur.
   */
  suggestions: string[];
  /** 7 sinyalin mevcut doluluk durumu. */
  rubric: RubricState;
  /**
   * Kullanıcı onayı alındıktan sonra üretim yapılabildi ise true.
   * true ise aynı turda idea_md alanı doludur.
   */
  ready: boolean;
  /** Ready=true olduğunda final 7-bölüm manifestosu (markdown). */
  idea_md: string | null;
};

/** Chat geçmişindeki tek turun yerel temsili. */
export type ChatTurn =
  | {
      role: 'user';
      content: string;
      at: number;
    }
  | {
      role: 'ai';
      content: string;
      suggestions: string[];
      rubric: RubricState;
      ready: boolean;
      idea_md: string | null;
      at: number;
    };

/** Bir fikir oturumunun (bir noktanın büyüme seansının) kalıcı kaydı. */
export type IdeaSession = {
  id: string;
  createdAt: number;
  updatedAt: number;
  title: string | null; // ilk kullanıcı mesajından türetilir
  turns: ChatTurn[];
  finalIdeaMd: string | null;
  finished: boolean;
};

/** Başlangıç rubric durumu; yeni bir oturum için. */
export const EMPTY_RUBRIC: RubricState = {
  tez: 'empty',
  problem: 'empty',
  nasil_calisir: 'empty',
  ne_yapmaz: 'empty',
  neden_simdi: 'empty',
  kim_fayda_saglar: 'empty',
  ozet: 'empty',
};

/** AI cevabı JSON'u elde ettikten sonra hızlı bir şekil doğrulaması yapar. */
export function isNoktaAiResponse(value: unknown): value is NoktaAiResponse {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;

  if (typeof v.message !== 'string') return false;
  if (!Array.isArray(v.suggestions)) return false;
  if (!v.suggestions.every((s) => typeof s === 'string')) return false;
  if (typeof v.ready !== 'boolean') return false;
  if (v.idea_md !== null && typeof v.idea_md !== 'string') return false;

  if (!v.rubric || typeof v.rubric !== 'object') return false;
  const rubric = v.rubric as Record<string, unknown>;
  for (const key of RUBRIC_KEYS) {
    const signal = rubric[key];
    if (signal !== 'empty' && signal !== 'partial' && signal !== 'strong') {
      return false;
    }
  }

  return true;
}

/** Rubric'te kaç sinyalin strong olduğunu sayar (ilerleme göstergesi). */
export function rubricProgress(rubric: RubricState): number {
  let strong = 0;
  for (const key of RUBRIC_KEYS) {
    if (rubric[key] === 'strong') strong += 1;
  }
  return strong;
}

/** Rubric tam dolmuş mu? Üretim onayı için ön şart. */
export function isRubricComplete(rubric: RubricState): boolean {
  return rubricProgress(rubric) === RUBRIC_KEYS.length;
}
