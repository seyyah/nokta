import type { ChatTurn, NoktaAiResponse } from '@/constants/schema';

import {
  AllProvidersFailedError,
  isRetryableError,
  MissingApiKeyError,
} from './errors';
import { geminiProvider } from './providers/gemini';
import { groqProvider } from './providers/groq';
import type { NoktaProvider } from './types';

// Sıra önemli. Gemini primary — daha iyi talimat-takibi ve daha geniş
// free kotası var. Groq fallback — hızlı ve cömert, ama bazen sert JSON
// formatı uymayabiliyor.
const PROVIDERS: NoktaProvider[] = [geminiProvider, groqProvider];

/**
 * UI bu fonksiyonu çağırır. Yapılandırılmış tüm sağlayıcıları sırayla
 * dener, rate-limit/ağ/format hatalarında bir sonrakine geçer. Hepsi
 * düşerse AllProvidersFailedError fırlatır.
 */
export async function askNokta(history: ChatTurn[]): Promise<NoktaAiResponse> {
  const configured = PROVIDERS.filter((p) => p.isConfigured());
  if (configured.length === 0) {
    throw new MissingApiKeyError();
  }

  const attempts: Array<{ provider: string; cause: unknown }> = [];

  for (const provider of configured) {
    try {
      return await provider.ask(history);
    } catch (err) {
      attempts.push({ provider: provider.name, cause: err });
      if (!isRetryableError(err)) {
        // Örn. tamamen anlaşılmayan bir hata — bir sonraki sağlayıcıya
        // gitmek yerine doğrudan yukarı fırlat. Aksi hâlde gerçek nedeni
        // gömüp "tüm sağlayıcılar düştü" hatası vermek yanıltıcı olur.
        throw err;
      }
      // retryable: bir sonraki provider'a geç.
    }
  }

  throw new AllProvidersFailedError(attempts);
}
