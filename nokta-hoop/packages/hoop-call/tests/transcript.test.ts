import test from 'node:test';
import assert from 'node:assert/strict';

import {
  extractTranscriptionAssets,
  formatTranscriptAsMarkdown,
  formatTranscriptAsText,
  parseStreamJsonlTranscript,
  pickLatestTranscription,
} from '../src/index.ts';

const jsonl = [
  JSON.stringify({
    type: 'speech',
    start_time: '2026-05-06T10:00:00.000Z',
    stop_time: '2026-05-06T10:00:03.000Z',
    speaker_id: 'user-a',
    text: 'Merhaba, fikri konusalim.',
  }),
  JSON.stringify({
    type: 'speech',
    start_time: '2026-05-06T10:00:04.000Z',
    stop_time: '2026-05-06T10:00:07.000Z',
    speaker_id: 'user-b',
    text: 'Olur, once hedefi netlestirelim.',
  }),
].join('\n');

test('parses Stream JSONL transcript lines', () => {
  const transcript = parseStreamJsonlTranscript(jsonl, {
    callId: 'room-123',
    callType: 'default',
    language: 'tr',
  });

  assert.equal(transcript.status, 'ready');
  assert.equal(transcript.items.length, 2);
  assert.equal(transcript.items[0]?.speakerLabel, 'user-a');
  assert.equal(transcript.items[1]?.startedAtMs, 4000);
});

test('formats transcript as text and markdown', () => {
  const transcript = parseStreamJsonlTranscript(jsonl, {
    callId: 'room-123',
    callType: 'default',
  });

  assert.match(formatTranscriptAsText(transcript), /\[00:00\] user-a:/);
  assert.match(formatTranscriptAsMarkdown(transcript), /# Transkript/);
});

test('picks latest transcription asset with a URL', () => {
  const assets = extractTranscriptionAssets({
    transcriptions: [
      { url: 'https://example.com/old.jsonl', created_at: '2026-05-06T09:00:00Z' },
      { url: 'https://example.com/new.jsonl', created_at: '2026-05-06T10:00:00Z' },
    ],
  });

  assert.equal(pickLatestTranscription(assets)?.url, 'https://example.com/new.jsonl');
});

test('parses transcript-shaped fragments from alternative providers', () => {
  const transcript = parseStreamJsonlTranscript(
    JSON.stringify({
      type: 'transcript',
      start_time: '2026-05-06T10:00:00.000Z',
      end_time: '2026-05-06T10:00:02.000Z',
      user: { id: 'user-c', name: 'User C' },
      alternatives: [{ transcript: 'Alternatif format satiri.' }],
    }),
    {
      callId: 'room-123',
      callType: 'default',
    },
  );

  assert.equal(transcript.items.length, 1);
  assert.equal(transcript.items[0]?.speakerLabel, 'User C');
  assert.equal(transcript.items[0]?.text, 'Alternatif format satiri.');
});
