import {
  parseStreamJsonlTranscript,
  type CallTranscript,
} from './transcript.ts';

export type StreamTranscriptionAsset = {
  url?: string;
  download_url?: string;
  asset_url?: string;
  transcription_url?: string;
  filename?: string;
  session_id?: string;
  sessionId?: string;
  created_at?: string;
  createdAt?: string;
  start_time?: string;
  stop_time?: string;
};

export type FetchTranscriptOptions = {
  callId: string;
  callType?: string;
  language?: string;
  fetchImpl?: typeof fetch;
};

export function extractTranscriptionAssets(
  response: unknown,
): StreamTranscriptionAsset[] {
  if (Array.isArray(response)) {
    return response.filter(isTranscriptionAsset);
  }

  if (!response || typeof response !== 'object') {
    return [];
  }

  const value = response as Record<string, unknown>;
  const candidates = [
    value.transcriptions,
    value.transcription,
    value.results,
    value.data,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter(isTranscriptionAsset);
    }
  }

  return isTranscriptionAsset(response) ? [response] : [];
}

export function pickLatestTranscription(
  assets: StreamTranscriptionAsset[],
): StreamTranscriptionAsset | null {
  const withUrls = assets.filter((asset) => getTranscriptionUrl(asset));
  if (withUrls.length === 0) {
    return null;
  }

  return [...withUrls].sort((a, b) => getAssetTimeMs(b) - getAssetTimeMs(a))[0];
}

export function getTranscriptionUrl(
  asset: StreamTranscriptionAsset,
): string | null {
  return (
    asset.url ??
    asset.download_url ??
    asset.asset_url ??
    asset.transcription_url ??
    null
  );
}

export function getTranscriptionSessionId(
  asset: StreamTranscriptionAsset,
): string | undefined {
  return asset.session_id ?? asset.sessionId;
}

export async function fetchTranscriptFromAsset(
  asset: StreamTranscriptionAsset,
  options: FetchTranscriptOptions,
): Promise<CallTranscript> {
  const url = getTranscriptionUrl(asset);
  if (!url) {
    throw new Error('Transcription asset is missing a download URL.');
  }

  const fetcher = options.fetchImpl ?? fetch;
  const response = await fetcher(url);
  if (!response.ok) {
    throw new Error(`Transcript download failed with status ${response.status}`);
  }

  const jsonl = await response.text();
  return parseStreamJsonlTranscript(jsonl, {
    callId: options.callId,
    callType: options.callType,
    language: options.language,
    sourceUrl: url,
    sessionId: getTranscriptionSessionId(asset),
  });
}

function isTranscriptionAsset(value: unknown): value is StreamTranscriptionAsset {
  return Boolean(value && typeof value === 'object');
}

function getAssetTimeMs(asset: StreamTranscriptionAsset): number {
  const raw = asset.created_at ?? asset.createdAt ?? asset.stop_time ?? asset.start_time;
  if (!raw) {
    return 0;
  }
  const parsed = Date.parse(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}
