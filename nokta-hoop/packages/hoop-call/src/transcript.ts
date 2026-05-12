export type TranscriptStatus = 'ready' | 'processing' | 'not_found' | 'failed';

export type TranscriptItem = {
  id: string;
  speakerLabel: string;
  text: string;
  startedAt?: string;
  endedAt?: string;
  startedAtMs: number;
  endedAtMs: number;
  confidence?: number;
};

export type CallTranscript = {
  id: string;
  callId: string;
  callType: string;
  status: 'ready';
  language: string;
  generatedAt: string;
  sourceUrl?: string;
  sessionId?: string;
  items: TranscriptItem[];
};

export type TranscriptUnavailable = {
  callId: string;
  callType: string;
  status: Exclude<TranscriptStatus, 'ready'>;
  message: string;
};

export type ParseTranscriptOptions = {
  callId: string;
  callType?: string;
  language?: string;
  sourceUrl?: string;
  sessionId?: string;
  generatedAt?: string;
};

type StreamSpeechFragment = {
  type?: string;
  start_time?: string;
  stop_time?: string;
  end_time?: string;
  started_at?: string;
  ended_at?: string;
  speaker?: string | { id?: string; name?: string };
  speaker_id?: string;
  user_id?: string;
  user?: { id?: string; name?: string };
  text?: string;
  transcript?: string;
  caption?: string;
  alternatives?: Array<{ transcript?: string; text?: string; confidence?: number }>;
  confidence?: number;
};

export function parseStreamJsonlTranscript(
  jsonl: string,
  options: ParseTranscriptOptions,
): CallTranscript {
  const fragments = jsonl
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map(parseJsonLine)
    .filter(isSpeechFragment)
    .filter((fragment) => getFragmentText(fragment).trim());

  const firstStartMs = fragments.reduce<number | null>((earliest, fragment) => {
    const startedAt = fragment.start_time ?? fragment.started_at;
    const startedAtMs = startedAt ? Date.parse(startedAt) : Number.NaN;
    if (!Number.isFinite(startedAtMs)) {
      return earliest;
    }
    return earliest === null ? startedAtMs : Math.min(earliest, startedAtMs);
  }, null);

  const items = fragments.map((fragment, index) => {
    const startedAt = fragment.start_time ?? fragment.started_at;
    const endedAt = fragment.stop_time ?? fragment.end_time ?? fragment.ended_at;
    const absoluteStartMs = startedAt ? Date.parse(startedAt) : Number.NaN;
    const absoluteEndMs = endedAt ? Date.parse(endedAt) : Number.NaN;
    const startedAtMs =
      firstStartMs !== null && Number.isFinite(absoluteStartMs)
        ? Math.max(0, absoluteStartMs - firstStartMs)
        : index * 1000;
    const endedAtMs =
      firstStartMs !== null && Number.isFinite(absoluteEndMs)
        ? Math.max(startedAtMs, absoluteEndMs - firstStartMs)
        : startedAtMs;

    return {
      id: `${options.callId}-${index + 1}`,
      speakerLabel: getFragmentSpeaker(fragment) ?? `speaker-${index + 1}`,
      text: getFragmentText(fragment).trim(),
      startedAt,
      endedAt,
      startedAtMs,
      endedAtMs,
      confidence:
        fragment.confidence ?? fragment.alternatives?.find(Boolean)?.confidence,
    };
  });

  return {
    id: `${options.callType ?? 'default'}:${options.callId}:transcript`,
    callId: options.callId,
    callType: options.callType ?? 'default',
    status: 'ready',
    language: options.language ?? 'tr',
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    sourceUrl: options.sourceUrl,
    sessionId: options.sessionId,
    items,
  };
}

export function formatTranscriptAsText(transcript: CallTranscript): string {
  if (transcript.items.length === 0) {
    return 'Transkript satırı bulunamadı.';
  }

  return transcript.items
    .map(
      (item) =>
        `[${formatOffset(item.startedAtMs)}] ${item.speakerLabel}: ${item.text}`,
    )
    .join('\n');
}

export function formatTranscriptAsMarkdown(transcript: CallTranscript): string {
  const lines = [
    `# Transkript: ${transcript.callType}:${transcript.callId}`,
    '',
    `- Dil: ${transcript.language}`,
    `- Oluşturulma zamanı: ${transcript.generatedAt}`,
    transcript.sessionId ? `- Oturum: ${transcript.sessionId}` : null,
    '',
    '## Konuşma',
    '',
  ].filter((line): line is string => line !== null);

  if (transcript.items.length === 0) {
    lines.push('Transkript satırı bulunamadı.');
    return lines.join('\n');
  }

  for (const item of transcript.items) {
    lines.push(
      `- **${formatOffset(item.startedAtMs)} ${item.speakerLabel}:** ${item.text}`,
    );
  }

  return lines.join('\n');
}

export function formatTranscriptAsJson(transcript: CallTranscript): string {
  return JSON.stringify(transcript, null, 2);
}

export function formatOffset(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function parseJsonLine(line: string): unknown {
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
}

function isSpeechFragment(value: unknown): value is StreamSpeechFragment {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const fragment = value as StreamSpeechFragment;
  const text = getFragmentText(fragment);
  return typeof text === 'string' && text.trim().length > 0;
}

function getFragmentText(fragment: StreamSpeechFragment): string {
  return (
    fragment.text ??
    fragment.transcript ??
    fragment.caption ??
    fragment.alternatives?.find((alternative) => alternative.transcript || alternative.text)
      ?.transcript ??
    fragment.alternatives?.find((alternative) => alternative.text)?.text ??
    ''
  );
}

function getFragmentSpeaker(fragment: StreamSpeechFragment): string | undefined {
  if (fragment.speaker_id) {
    return fragment.speaker_id;
  }
  if (fragment.user_id) {
    return fragment.user_id;
  }
  if (typeof fragment.speaker === 'string') {
    return fragment.speaker;
  }
  if (fragment.speaker?.name || fragment.speaker?.id) {
    return fragment.speaker.name ?? fragment.speaker.id;
  }
  if (fragment.user?.name || fragment.user?.id) {
    return fragment.user.name ?? fragment.user.id;
  }
  return undefined;
}
