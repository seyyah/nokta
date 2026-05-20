// Nokta AI katmanının dış dünyaya gösterdiği hata yüzeyi.
// UI bunlardan birini yakalayıp kullanıcı dostu mesaj gösterir.

export class TohumAiError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'TohumAiError';
  }
}

export class MissingApiKeyError extends TohumAiError {
  constructor() {
    super(
      'Hiçbir AI sağlayıcı anahtarı bulunamadı. app/.env dosyasına EXPO_PUBLIC_GEMINI_API_KEY veya EXPO_PUBLIC_GROQ_API_KEY ekleyip Expo\'yu yeniden başlat.',
    );
    this.name = 'MissingApiKeyError';
  }
}

export class AllProvidersFailedError extends TohumAiError {
  constructor(public attempts: Array<{ provider: string; cause: unknown }>) {
    super('Tüm AI sağlayıcıları yanıt vermedi. Birkaç saniye sonra tekrar dene.');
    this.name = 'AllProvidersFailedError';
  }
}

export class NetworkError extends TohumAiError {
  constructor(cause: unknown) {
    super('AI servisine ulaşılamadı. İnternet bağlantını kontrol et.', cause);
    this.name = 'NetworkError';
  }
}

export class MalformedResponseError extends TohumAiError {
  constructor(public raw: string) {
    super('AI beklenmedik bir format döndü. Tekrar dene.');
    this.name = 'MalformedResponseError';
  }
}

export class RateLimitError extends TohumAiError {
  constructor(public provider: string) {
    super(`${provider} şu an yoğun.`);
    this.name = 'RateLimitError';
  }
}

// Orchestrator için: hata retryable mi (diğer sağlayıcıya düşelim mi) yoksa
// fatal mi (kullanıcıya çık) — sınıflandırır.
export function isRetryableError(err: unknown): boolean {
  if (err instanceof RateLimitError) return true;
  if (err instanceof NetworkError) return true;
  if (err instanceof MalformedResponseError) return true;
  return false;
}
