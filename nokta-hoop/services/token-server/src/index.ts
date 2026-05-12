import 'dotenv/config';

import cors from 'cors';
import express from 'express';
import {
  buildExpertInviteText,
  createEscalationRequest,
  type EscalationParticipant,
  type EscalationRequest,
  type EscalationStatus,
  type MascotChatMessage,
  type MentorSessionMessage,
  type MentorSessionMessageRole,
} from '@nokta-hoop/hoop-core';
import { StreamClient } from '@stream-io/node-sdk';
import {
  extractTranscriptionAssets,
  fetchTranscriptFromAsset,
  formatTranscriptAsJson,
  formatTranscriptAsMarkdown,
  formatTranscriptAsText,
  normalizeCallId,
  normalizeCallType,
  pickLatestTranscription,
  type CallTranscript,
} from '@nokta-hoop/hoop-call';

import { DEMO_USERS, getDemoUser } from './demoUsers.ts';
import { decideMascotActionWithAi } from './mascotAi.ts';

type HealthResponse = {
  status: 'ok';
  service: 'nokta-hoop-token-server';
};

type TokenRequest = {
  user_id?: string;
  user_name?: string;
};

type TokenResponse = {
  token: string;
  user: {
    id: string;
    name: string;
  };
  expiresIn: number;
};

type StreamVideoCall = {
  end: () => Promise<unknown>;
  getOrCreate?: () => Promise<unknown>;
  goLive?: () => Promise<unknown>;
  listTranscriptions: () => Promise<unknown>;
  startTranscription?: (options?: { language?: string }) => Promise<unknown>;
  stopTranscription?: () => Promise<unknown>;
};

type StreamVideoFacade = {
  call: (callType: string, callId: string) => StreamVideoCall;
};

type TranscriptExportFormat = 'json' | 'md' | 'txt';

type CreateEscalationRequestBody = {
  requester_id?: string;
  requester_name?: string;
  topic?: string;
  question?: string;
};

type AcceptEscalationRequestBody = {
  expert_id?: string;
  expert_name?: string;
};

type CreateMentorSessionMessageBody = {
  author_id?: string;
  author_name?: string;
  role?: MentorSessionMessageRole;
  text?: string;
};

type MascotDecisionRequestBody = {
  message?: string;
  history?: MascotChatMessage[];
};

type MascotTtsRequestBody = {
  text?: string;
  language_id?: string;
};

type MascotTtsWarmupRequestBody = {
  texts?: string[];
  language_id?: string;
};

type TtsServerResponse = {
  audioPath?: string;
  filename?: string;
  languageId?: string;
  provider?: string;
};

class TranscriptPendingError extends Error {
  constructor(message = 'Transkript henüz hazır değil.') {
    super(message);
    this.name = 'TranscriptPendingError';
  }
}

const app = express();
const port = Number.parseInt(process.env.PORT ?? '8787', 10);
const host = process.env.HOST ?? '0.0.0.0';
const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;
const allowedOrigins = process.env.ALLOWED_ORIGINS ?? '*';
const transcriptionLanguage = process.env.STREAM_TRANSCRIPTION_LANGUAGE ?? 'tr';
const mentorStreamCallType = normalizeCallType(
  process.env.MENTOR_STREAM_CALL_TYPE ?? 'livestream',
) || 'livestream';
const ttsServerUrl = normalizeOptionalUrl(process.env.TTS_SERVER_URL);
const mascotTtsLanguage = process.env.MASCOT_TTS_LANGUAGE_ID ?? 'tr';
const remoteTtsProvider = 'tts-server';
const maxMascotTtsWarmupTexts = Number.parseInt(
  process.env.MASCOT_TTS_WARMUP_MAX_TEXTS ?? '12',
  10,
);

const streamClient =
  apiKey && apiSecret ? new StreamClient(apiKey, apiSecret) : null;
const escalations = new Map<string, EscalationRequest>();
const mentorSessionMessages = new Map<string, MentorSessionMessage[]>();

const corsOrigins =
  allowedOrigins === '*' || allowedOrigins.trim() === ''
    ? true
    : allowedOrigins
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);

app.use(cors({ origin: corsOrigins, methods: ['GET', 'POST'], maxAge: 86400 }));
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    service: 'nokta-hoop-token-server',
    health: '/health',
    token: '/token',
    users: '/users',
    mascotDecision: '/mascot/decide',
    escalations: '/escalations',
    mascotTts: '/tts/mascot',
    mascotTtsWarmup: '/tts/warmup',
    mentorMessages: '/escalations/{id}/messages',
    transcript: '/calls/default/{callId}/transcript',
    export: '/calls/default/{callId}/export?format=md',
  });
});

app.get('/health', (_req, res) => {
  const body: HealthResponse = {
    status: 'ok',
    service: 'nokta-hoop-token-server',
  };
  res.json(body);
});

app.get('/users', (_req, res) => {
  res.json({
    users: DEMO_USERS,
    dynamicUsers: {
      enabled: true,
      idPattern: '^[a-z0-9_-]{3,64}$',
      nameLength: '2-80',
    },
  });
});

app.post('/mascot/decide', async (req, res) => {
  const body = req.body as MascotDecisionRequestBody;
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (message.length < 2) {
    res.status(400).json({ error: 'Invalid message.' });
    return;
  }

  const decision = await decideMascotActionWithAi({
    message,
    history: Array.isArray(body.history) ? body.history.slice(-12) : undefined,
  });

  res.json({ decision });
});

app.post('/tts/mascot', async (req, res): Promise<void> => {
  const body = req.body as MascotTtsRequestBody;
  const text = typeof body.text === 'string' ? body.text.trim() : '';

  if (text.length < 1) {
    res.status(400).json({ error: 'Invalid text.' });
    return;
  }

  if (!ttsServerUrl) {
    res.status(503).json({
      error: 'TTS_SERVER_URL is not configured.',
      provider: 'device',
    });
    return;
  }

  try {
    const response = await fetch(`${ttsServerUrl}/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        language_id:
          typeof body.language_id === 'string' && body.language_id.trim()
            ? body.language_id.trim()
            : mascotTtsLanguage,
      }),
    });

    if (!response.ok) {
      res.status(response.status).json({
        error: await readTtsError(response),
        provider: remoteTtsProvider,
      });
      return;
    }

    const ttsBody = (await response.json()) as TtsServerResponse;
    const filename = getAudioFilename(ttsBody);
    if (!filename) {
      res.status(502).json({ error: 'TTS server response is invalid.' });
      return;
    }

    res.json({
      audioPath: `/tts/audio/${filename}`,
      filename,
      languageId: ttsBody.languageId ?? mascotTtsLanguage,
      provider: ttsBody.provider ?? remoteTtsProvider,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'TTS request failed.';
    res.status(502).json({ error: message, provider: remoteTtsProvider });
  }
});

app.post('/tts/warmup', (req, res): void => {
  const body = req.body as MascotTtsWarmupRequestBody;
  const texts = getMascotWarmupTexts(body.texts);

  if (texts.length === 0) {
    res.status(400).json({ error: 'No warmup texts provided.' });
    return;
  }

  if (!ttsServerUrl) {
    res.status(503).json({
      error: 'TTS_SERVER_URL is not configured.',
      provider: 'device',
    });
    return;
  }

  const languageId =
    typeof body.language_id === 'string' && body.language_id.trim()
      ? body.language_id.trim()
      : mascotTtsLanguage;

  void warmupMascotTts(texts, languageId).catch((error) => {
    console.warn('Mascot TTS warmup failed:', error);
  });

  res.status(202).json({
    count: texts.length,
    provider: remoteTtsProvider,
    status: 'queued',
  });
});

app.get('/tts/audio/:filename', async (req, res): Promise<void> => {
  const filename = req.params.filename;

  if (!isSafeAudioFilename(filename)) {
    res.status(400).json({ error: 'Invalid audio filename.' });
    return;
  }

  if (!ttsServerUrl) {
    res.status(503).json({ error: 'TTS_SERVER_URL is not configured.' });
    return;
  }

  try {
    const response = await fetch(`${ttsServerUrl}/audio/${filename}`);
    if (!response.ok) {
      res.status(response.status).json({ error: await readTtsError(response) });
      return;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader(
      'Cache-Control',
      response.headers.get('cache-control') ?? 'public, max-age=86400',
    );
    res.send(buffer);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'TTS audio proxy failed.';
    res.status(502).json({ error: message });
  }
});

app.get('/escalations', (req, res) => {
  const status = getEscalationStatus(req.query.status);
  let items = [...escalations.values()].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );

  if (status) {
    items = items.filter((request) => request.status === status);
  }

  res.json({ escalations: items });
});

app.post('/escalations', (req, res) => {
  const body = req.body as CreateEscalationRequestBody;
  const requester = getRequestParticipant(
    body.requester_id,
    body.requester_name,
  );
  const topic = typeof body.topic === 'string' ? body.topic.trim() : '';
  const question =
    typeof body.question === 'string' ? body.question.trim() : '';

  if (!requester) {
    res.status(400).json({
      error:
        'Invalid requester. Send requester_id and requester_name with valid values.',
    });
    return;
  }

  if (topic.length < 2 || question.length < 4) {
    res.status(400).json({
      error: 'Invalid escalation. Send topic and question.',
    });
    return;
  }

  const request = createEscalationRequest({
    requester,
    topic,
    question,
    callType: mentorStreamCallType,
  });
  escalations.set(request.id, request);

  res.status(201).json({
    escalation: request,
    inviteText: buildExpertInviteText(request),
  });
});

app.get('/escalations/:id', (req, res) => {
  const request = escalations.get(req.params.id);
  if (!request) {
    res.status(404).json({ error: 'Escalation not found.' });
    return;
  }

  res.json({ escalation: request, inviteText: buildExpertInviteText(request) });
});

app.post('/escalations/:id/accept', async (req, res): Promise<void> => {
  const request = escalations.get(req.params.id);
  if (!request) {
    res.status(404).json({ error: 'Escalation not found.' });
    return;
  }

  if (request.status !== 'pending') {
    res.status(409).json({
      error: `Escalation is already ${request.status}.`,
      escalation: request,
    });
    return;
  }

  const body = req.body as AcceptEscalationRequestBody;
  const expert = getRequestParticipant(body.expert_id, body.expert_name);
  if (!expert) {
    res.status(400).json({
      error: 'Invalid expert. Send expert_id and expert_name with valid values.',
    });
    return;
  }

  const now = new Date().toISOString();
  const accepted: EscalationRequest = {
    ...request,
    status: 'accepted',
    expert,
    acceptedAt: now,
    updatedAt: now,
  };
  escalations.set(accepted.id, accepted);

  await prepareAcceptedEscalationCall(accepted);

  res.json({
    escalation: accepted,
    inviteText: buildExpertInviteText(accepted),
  });
});

app.post('/escalations/:id/cancel', (req, res) => {
  const request = escalations.get(req.params.id);
  if (!request) {
    res.status(404).json({ error: 'Escalation not found.' });
    return;
  }

  if (request.status === 'cancelled') {
    res.json({ escalation: request });
    return;
  }

  if (request.status !== 'pending') {
    res.status(409).json({
      error: `Escalation is already ${request.status}.`,
      escalation: request,
    });
    return;
  }

  const now = new Date().toISOString();
  const cancelled: EscalationRequest = {
    ...request,
    status: 'cancelled',
    updatedAt: now,
  };
  escalations.set(cancelled.id, cancelled);

  res.json({ escalation: cancelled });
});

app.post('/escalations/:id/resolve', (req, res) => {
  const request = escalations.get(req.params.id);
  if (!request) {
    res.status(404).json({ error: 'Escalation not found.' });
    return;
  }

  const now = new Date().toISOString();
  const resolved: EscalationRequest = {
    ...request,
    status: 'resolved',
    resolvedAt: now,
    updatedAt: now,
  };
  escalations.set(resolved.id, resolved);

  res.json({ escalation: resolved });
});

app.get('/escalations/:id/messages', (req, res) => {
  const request = escalations.get(req.params.id);
  if (!request) {
    res.status(404).json({ error: 'Escalation not found.' });
    return;
  }

  res.json({
    messages: mentorSessionMessages.get(request.id) ?? [],
  });
});

app.post('/escalations/:id/messages', (req, res) => {
  const request = escalations.get(req.params.id);
  if (!request) {
    res.status(404).json({ error: 'Escalation not found.' });
    return;
  }

  if (request.status !== 'accepted') {
    res.status(409).json({
      error: 'Mentor session messages can only be added after acceptance.',
      escalation: request,
    });
    return;
  }

  const body = req.body as CreateMentorSessionMessageBody;
  const author = getRequestParticipant(body.author_id, body.author_name);
  const role = getMentorSessionMessageRole(body.role);
  const text = typeof body.text === 'string' ? body.text.trim() : '';

  if (!author || !role || text.length < 1) {
    res.status(400).json({
      error: 'Invalid message. Send author_id, author_name, role, and text.',
    });
    return;
  }

  const message: MentorSessionMessage = {
    id: createMentorSessionMessageId(),
    escalationId: request.id,
    role,
    author,
    text,
    createdAt: new Date().toISOString(),
  };
  const messages = mentorSessionMessages.get(request.id) ?? [];
  messages.push(message);
  mentorSessionMessages.set(request.id, messages);

  res.status(201).json({ message });
});

app.post('/token', async (req, res): Promise<void> => {
  const { user_id: userId, user_name: userName } = req.body as TokenRequest;
  if (typeof userId !== 'string') {
    res.status(400).json({ error: 'Invalid request. Send { user_id }.' });
    return;
  }

  if (!streamClient) {
    res
      .status(500)
      .json({ error: 'STREAM_API_KEY/STREAM_API_SECRET not configured' });
    return;
  }

  const user = getDemoUser(
    userId,
    typeof userName === 'string' ? userName : undefined,
  );
  if (!user) {
    res.status(400).json({
      error:
        'Invalid demo user. Use id 3-64 chars with lowercase letters, numbers, underscores, or hyphens. Name must be 2-80 chars.',
    });
    return;
  }

  try {
    await streamClient.upsertUsers([{ id: user.id, name: user.name }]);
    const token = streamClient.generateUserToken({
      user_id: user.id,
      validity_in_seconds: 3600,
    });

    const body: TokenResponse = {
      token,
      user,
      expiresIn: 3600,
    };
    res.json(body);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Token generation failed';
    res.status(500).json({ error: message });
  }
});

app.get('/calls/:callType/:callId/transcriptions', async (req, res) => {
  const callType = normalizeCallType(req.params.callType ?? '');
  const callId = normalizeCallId(req.params.callId ?? '');

  if (!callType || !callId) {
    res.status(400).json({ error: 'Invalid call type or call ID.' });
    return;
  }

  try {
    const call = getStreamVideoCall(callType, callId);
    const response = await call.listTranscriptions();
    res.json({
      callType,
      callId,
      transcriptions: extractTranscriptionAssets(response),
      raw: response,
    });
  } catch (err) {
    const { status, message } = normalizeStreamError(err);
    res.status(status).json({ error: message });
  }
});

app.post('/calls/:callType/:callId/end', async (req, res) => {
  const callType = normalizeCallType(req.params.callType ?? '');
  const callId = normalizeCallId(req.params.callId ?? '');

  if (!callType || !callId) {
    res.status(400).json({ error: 'Invalid call type or call ID.' });
    return;
  }

  try {
    const call = getStreamVideoCall(callType, callId);
    await call.end();
    res.json({
      callType,
      callId,
      status: 'ended',
    });
  } catch (err) {
    const { status, message } = normalizeStreamError(err);
    res.status(status).json({ error: message });
  }
});

app.post('/calls/:callType/:callId/go-live', async (req, res) => {
  const callType = normalizeCallType(req.params.callType ?? '');
  const callId = normalizeCallId(req.params.callId ?? '');

  if (!callType || !callId) {
    res.status(400).json({ error: 'Invalid call type or call ID.' });
    return;
  }

  try {
    const call = getStreamVideoCall(callType, callId);
    if (!call.goLive) {
      res.status(502).json({ error: 'Stream goLive is not available.' });
      return;
    }

    await call.getOrCreate?.();
    await call.goLive();
    res.json({
      callType,
      callId,
      status: 'live',
    });
  } catch (err) {
    const { status, message } = normalizeStreamError(err);
    res.status(status).json({ error: message });
  }
});

app.post('/calls/:callType/:callId/start-transcription', async (req, res) => {
  const callType = normalizeCallType(req.params.callType ?? '');
  const callId = normalizeCallId(req.params.callId ?? '');
  const language = getTranscriptionLanguage(req.body);

  if (!callType || !callId) {
    res.status(400).json({ error: 'Invalid call type or call ID.' });
    return;
  }

  try {
    const call = getStreamVideoCall(callType, callId);
    if (!call.startTranscription) {
      res.status(502).json({ error: 'Stream startTranscription is not available.' });
      return;
    }

    await call.startTranscription({ language });
    res.json({
      callType,
      callId,
      status: 'transcribing',
    });
  } catch (err) {
    const { status, message } = normalizeStreamError(err);
    res.status(status).json({ error: message });
  }
});

app.post('/calls/:callType/:callId/stop-transcription', async (req, res) => {
  const callType = normalizeCallType(req.params.callType ?? '');
  const callId = normalizeCallId(req.params.callId ?? '');

  if (!callType || !callId) {
    res.status(400).json({ error: 'Invalid call type or call ID.' });
    return;
  }

  try {
    const call = getStreamVideoCall(callType, callId);
    if (!call.stopTranscription) {
      res.status(502).json({ error: 'Stream stopTranscription is not available.' });
      return;
    }

    await call.stopTranscription();
    res.json({
      callType,
      callId,
      status: 'stopped',
    });
  } catch (err) {
    const { status, message } = normalizeStreamError(err);
    res.status(status).json({ error: message });
  }
});

app.get('/calls/:callType/:callId/transcript', async (req, res) => {
  const callType = normalizeCallType(req.params.callType ?? '');
  const callId = normalizeCallId(req.params.callId ?? '');
  const language =
    typeof req.query.language === 'string'
      ? req.query.language
      : transcriptionLanguage;

  if (!callType || !callId) {
    res.status(400).json({ error: 'Invalid call type or call ID.' });
    return;
  }

  try {
    const transcript = await getReadyTranscript({
      callId,
      callType,
      language,
    });
    res.json(transcript);
  } catch (err) {
    if (err instanceof TranscriptPendingError) {
      res.status(404).json({
        error: err.message,
        status: 'processing',
      });
      return;
    }

    const { status, message } = normalizeStreamError(err);
    res.status(status).json({ error: message });
  }
});

app.get('/calls/:callType/:callId/export', async (req, res) => {
  const callType = normalizeCallType(req.params.callType ?? '');
  const callId = normalizeCallId(req.params.callId ?? '');
  const language =
    typeof req.query.language === 'string'
      ? req.query.language
      : transcriptionLanguage;
  const format = getExportFormat(req.query.format);

  if (!callType || !callId) {
    res.status(400).json({ error: 'Invalid call type or call ID.' });
    return;
  }

  if (!format) {
    res.status(400).json({ error: 'Invalid export format. Use md, txt, or json.' });
    return;
  }

  try {
    const transcript = await getReadyTranscript({
      callId,
      callType,
      language,
    });
    const body = formatTranscriptExport(transcript, format);
    const filename = `${sanitizeFilenamePart(callType)}-${sanitizeFilenamePart(
      callId,
    )}-transcript.${format}`;

    res.setHeader('Content-Type', getExportContentType(format));
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(body);
  } catch (err) {
    if (err instanceof TranscriptPendingError) {
      res.status(404).json({
        error: err.message,
        status: 'processing',
      });
      return;
    }

    const { status, message } = normalizeStreamError(err);
    res.status(status).json({ error: message });
  }
});

app.listen(port, host, () => {
  console.log(`nokta-hoop token server running at http://${host}:${port}`);
  if (!apiKey || !apiSecret) {
    console.error(
      'Missing STREAM_API_KEY and/or STREAM_API_SECRET in environment. Set in .env.',
    );
  }
});

function getStreamVideoCall(callType: string, callId: string): StreamVideoCall {
  if (!streamClient) {
    throw new Error('STREAM_API_KEY/STREAM_API_SECRET not configured');
  }

  const video = (streamClient as unknown as { video?: StreamVideoFacade }).video;
  if (!video?.call) {
    throw new Error('Stream video client is not available in this SDK version.');
  }

  return video.call(callType, callId);
}

async function getReadyTranscript(input: {
  callId: string;
  callType: string;
  language: string;
}): Promise<CallTranscript> {
  const call = getStreamVideoCall(input.callType, input.callId);
  const response = await call.listTranscriptions();
  const asset = pickLatestTranscription(extractTranscriptionAssets(response));

  if (!asset) {
    throw new TranscriptPendingError('Transkript henüz hazır değil.');
  }

  const transcript = await fetchTranscriptFromAsset(asset, input);

  if (transcript.items.length === 0) {
    return transcript;
  }

  return transcript;
}

async function prepareAcceptedEscalationCall(
  request: EscalationRequest,
): Promise<void> {
  if (request.callType !== 'livestream') {
    return;
  }

  try {
    const call = getStreamVideoCall(request.callType, request.callId);
    await call.getOrCreate?.();
    await call.goLive?.();
  } catch (error) {
    console.warn('prepare accepted escalation livestream failed:', error);
  }
}

function getTranscriptionLanguage(body: unknown): string {
  if (
    body &&
    typeof body === 'object' &&
    'language' in body &&
    typeof body.language === 'string' &&
    body.language.trim()
  ) {
    return body.language.trim();
  }

  return transcriptionLanguage;
}

function getExportFormat(value: unknown): TranscriptExportFormat | null {
  if (value === undefined || value === null) {
    return 'md';
  }
  if (value === 'json' || value === 'md' || value === 'txt') {
    return value;
  }
  return null;
}

function formatTranscriptExport(
  transcript: CallTranscript,
  format: TranscriptExportFormat,
): string {
  if (format === 'json') {
    return formatTranscriptAsJson(transcript);
  }
  if (format === 'txt') {
    return formatTranscriptAsText(transcript);
  }
  return formatTranscriptAsMarkdown(transcript);
}

function getExportContentType(format: TranscriptExportFormat): string {
  if (format === 'json') {
    return 'application/json; charset=utf-8';
  }
  if (format === 'txt') {
    return 'text/plain; charset=utf-8';
  }
  return 'text/markdown; charset=utf-8';
}

function sanitizeFilenamePart(value: string): string {
  return value.replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '') || 'call';
}

function normalizeOptionalUrl(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }
  return trimmed.replace(/\/+$/, '');
}

function getAudioFilename(body: TtsServerResponse): string | null {
  const filename = body.filename ?? body.audioPath?.split('/').pop();
  if (!filename || !isSafeAudioFilename(filename)) {
    return null;
  }
  return filename;
}

function isSafeAudioFilename(filename: string): boolean {
  return /^[a-f0-9]{32}\.wav$/.test(filename);
}

async function readTtsError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { detail?: string; error?: string };
    return body.error ?? body.detail ?? `TTS request failed: ${response.status}`;
  } catch {
    return `TTS request failed: ${response.status}`;
  }
}

function getEscalationStatus(value: unknown): EscalationStatus | null {
  if (
    value === 'pending' ||
    value === 'accepted' ||
    value === 'resolved' ||
    value === 'cancelled'
  ) {
    return value;
  }
  return null;
}

function getMascotWarmupTexts(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<string>();
  const texts: string[] = [];

  for (const item of value) {
    if (typeof item !== 'string') {
      continue;
    }

    const text = item.replace(/\s+/g, ' ').trim();
    if (!text || seen.has(text)) {
      continue;
    }

    seen.add(text);
    texts.push(text);

    if (texts.length >= maxMascotTtsWarmupTexts) {
      break;
    }
  }

  return texts;
}

async function warmupMascotTts(
  texts: string[],
  languageId: string,
): Promise<void> {
  if (!ttsServerUrl) {
    return;
  }

  for (const text of texts) {
    const response = await fetch(`${ttsServerUrl}/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language_id: languageId,
        text,
      }),
    });

    if (!response.ok) {
      throw new Error(await readTtsError(response));
    }
  }
}

function getMentorSessionMessageRole(
  value: unknown,
): MentorSessionMessageRole | null {
  if (value === 'requester' || value === 'expert') {
    return value;
  }
  return null;
}

function getRequestParticipant(
  idValue: unknown,
  nameValue: unknown,
): EscalationParticipant | null {
  if (typeof idValue !== 'string' || typeof nameValue !== 'string') {
    return null;
  }

  const id = idValue.trim();
  const name = nameValue.trim();
  if (!/^[a-z0-9_-]{3,64}$/i.test(id) || name.length < 2 || name.length > 80) {
    return null;
  }

  return { id, name };
}

function createMentorSessionMessageId(): string {
  const random = Math.random().toString(36).slice(2, 8);
  return `mentor-msg-${Date.now()}-${random}`;
}

function normalizeStreamError(err: unknown): {
  status: number;
  message: string;
} {
  const message = err instanceof Error ? err.message : 'Stream request failed';
  if (message.includes('not configured')) {
    return { status: 500, message };
  }
  if (message.includes('not available')) {
    return { status: 502, message };
  }
  return { status: 502, message };
}
