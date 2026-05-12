import type { CallTranscript } from '@nokta-hoop/hoop-call';

const TOKEN_SERVER_URL = process.env.EXPO_PUBLIC_TOKEN_SERVER_URL;

export type TranscriptExportFormat = 'md' | 'txt' | 'json';

export class TranscriptNotReadyError extends Error {
  constructor(message = 'Transkript henüz hazır değil.') {
    super(message);
    this.name = 'TranscriptNotReadyError';
  }
}

export async function requestCallTranscript(input: {
  callType: string;
  callId: string;
  language: string;
}): Promise<CallTranscript> {
  const path = `/calls/${encodeURIComponent(input.callType)}/${encodeURIComponent(
    input.callId,
  )}/transcript?language=${encodeURIComponent(input.language)}`;
  const response = await fetch(`${getTokenServerUrl()}${path}`);

  if (response.status === 404) {
    throw new TranscriptNotReadyError();
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Transkript isteği başarısız oldu: ${response.status}`);
  }

  const body = (await response.json()) as CallTranscript;
  if (body.status !== 'ready' || !Array.isArray(body.items)) {
    throw new Error('Transkript yanıtı geçersiz.');
  }

  return body;
}

export function isTranscriptNotReadyError(
  error: unknown,
): error is TranscriptNotReadyError {
  return error instanceof TranscriptNotReadyError;
}

export function getTranscriptExportUrl(input: {
  callType: string;
  callId: string;
  language: string;
  format: TranscriptExportFormat;
}): string {
  const path = `/calls/${encodeURIComponent(input.callType)}/${encodeURIComponent(
    input.callId,
  )}/export?format=${encodeURIComponent(input.format)}&language=${encodeURIComponent(
    input.language,
  )}`;
  return `${getTokenServerUrl()}${path}`;
}

export function getTokenServerUrl(): string {
  if (!TOKEN_SERVER_URL) {
    throw new Error('EXPO_PUBLIC_TOKEN_SERVER_URL yapılandırılmamış.');
  }

  return TOKEN_SERVER_URL.replace(/\/+$/, '');
}
