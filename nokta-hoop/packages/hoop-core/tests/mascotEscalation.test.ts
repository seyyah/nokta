import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildExpertInviteText,
  buildMentorSessionReturnMessage,
  buildTranscriptReturnMessage,
  createEscalationRequest,
  decideMascotAction,
  detectEscalationNeed,
} from '../src/index.ts';

test('detects expert escalation requests in Turkish messages', () => {
  const signal = detectEscalationNeed(
    'A konusu hakkında bilgiye ihtiyacım var, mentor bağlanabilir mi?',
  );

  assert.ok(signal);
  assert.equal(signal.topic, 'A konusu hakkında bilgiye ihtiyacım var, mentor bağlanabilir mi');
});

test('creates pending escalation with stable call metadata', () => {
  const request = createEscalationRequest({
    id: 'esc-test',
    now: new Date('2026-05-07T10:00:00.000Z'),
    requester: { id: 'user-1', name: 'User One' },
    topic: 'Pricing model',
    question: 'Pricing için uzman lazım',
  });

  assert.equal(request.status, 'pending');
  assert.equal(request.callType, 'default');
  assert.equal(request.callId, 'mentor-esc-test');
  assert.equal(request.createdAt, '2026-05-07T10:00:00.000Z');
});

test('builds expert invite and mascot return message', () => {
  const request = createEscalationRequest({
    id: 'esc-demo',
    requester: { id: 'student', name: 'Student' },
    topic: 'MVP kapsamı',
    question: 'MVP kapsamı için uzman gerekli',
  });

  assert.match(buildExpertInviteText(request), /Student/);
  assert.match(buildExpertInviteText(request), /MVP kapsamı/);

  const message = buildTranscriptReturnMessage({
    expertName: 'Mentor',
    transcriptLines: ['Önce kullanıcı problemi netleşmeli.', 'Sonra demo akışı.'],
  });
  assert.match(message, /Mentor/);
  assert.match(message, /kullanıcı problemi/);

  const emptyMessage = buildTranscriptReturnMessage({
    expertName: 'Mentor',
    transcriptLines: [],
  });
  assert.match(emptyMessage, /konuşma algılanmadı/);
});

test('builds embedded mentor session return message', () => {
  const message = buildMentorSessionReturnMessage({
    expertName: 'Mentor',
    requesterMessages: ['Hamilton döngüsü nedir?'],
    transcriptLines: ['Hamilton döngüsü çizgedeki her düğümü bir kez gezer.'],
  });

  assert.match(message, /Mentor/);
  assert.match(message, /Hamilton/);
  assert.match(message, /Mentorun/);
});

test('decides when mascot can answer or should escalate', () => {
  const answer = decideMascotAction({
    message: 'MVP kapsamını nasıl daha net yazabilirim?',
  });
  assert.equal(answer.action, 'answer');
  assert.ok(answer.confidence > 0.7);

  const escalation = decideMascotAction({
    message: 'Bu yatırım stratejisi ve pazar doğrulaması için ne yapmalıyım?',
  });
  assert.equal(escalation.action, 'escalate');
  assert.ok(escalation.topic);
  assert.match(escalation.reason, /expert-domain/);

  const technicalEscalation = decideMascotAction({
    message: 'Çizge veri yapısında Hamilton döngüsü nedir?',
  });
  assert.equal(technicalEscalation.action, 'escalate');
  assert.match(technicalEscalation.reason, /expert-domain/);
});
