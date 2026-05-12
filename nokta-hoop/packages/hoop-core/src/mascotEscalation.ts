export type MascotChatRole = 'user' | 'assistant' | 'system';

export type MascotChatMessage = {
  id: string;
  role: MascotChatRole;
  text: string;
  createdAt: string;
  escalationId?: string;
};

export type EscalationStatus = 'pending' | 'accepted' | 'resolved' | 'cancelled';

export type EscalationParticipant = {
  id: string;
  name: string;
};

export type EscalationRequest = {
  id: string;
  status: EscalationStatus;
  topic: string;
  question: string;
  requester: EscalationParticipant;
  expert?: EscalationParticipant;
  callType: string;
  callId: string;
  createdAt: string;
  updatedAt: string;
  acceptedAt?: string;
  resolvedAt?: string;
};

export type MentorSessionMessageRole = 'requester' | 'expert';

export type MentorSessionMessage = {
  id: string;
  escalationId: string;
  role: MentorSessionMessageRole;
  author: EscalationParticipant;
  text: string;
  createdAt: string;
};

export type EscalationSignal = {
  topic: string;
  question: string;
  reason: string;
};

export type MascotDecisionAction = 'answer' | 'escalate';

export type MascotDecisionSource = 'deterministic' | 'llm';

export type MascotDecision = {
  action: MascotDecisionAction;
  answer: string;
  confidence: number;
  reason: string;
  source: MascotDecisionSource;
  topic?: string;
  question?: string;
};

export type MascotDecisionInput = {
  message: string;
  history?: MascotChatMessage[];
};

export type CreateEscalationInput = {
  requester: EscalationParticipant;
  topic: string;
  question: string;
  callType?: string;
  now?: Date;
  id?: string;
};

const DEFAULT_CALL_TYPE = 'default';

const escalationKeywords = [
  'uzman',
  'mentor',
  'destek',
  'yardim',
  'yardım',
  'takildim',
  'takıldım',
  'bilmiyorum',
  'emin degilim',
  'emin değilim',
  'bilgiye ihtiyac',
  'bilgiye ihtiyaç',
  'ihtiyacim var',
  'ihtiyacım var',
  'baglan',
  'bağlan',
];

const expertDomainKeywords = [
  'hukuk',
  'hukuki',
  'sozlesme',
  'sözleşme',
  'kvkk',
  'vergi',
  'yatirim',
  'yatırım',
  'finans',
  'saglik',
  'sağlık',
  'medikal',
  'pazar',
  'rakip',
  'regulasyon',
  'regülasyon',
  'patent',
  'guvenlik',
  'güvenlik',
  'mimari karar',
  'teknik dogrulama',
  'teknik doğrulama',
  'algoritma',
  'algoritmalar',
  'veri yapisi',
  'veri yapısı',
  'cizge',
  'çizge',
  'graph',
  'graf',
  'hamilton',
  'hamilton dongusu',
  'hamilton döngüsü',
  'np-complete',
  'np complete',
  'np-hard',
  'np hard',
  'karmaşıklık',
  'karmasiklik',
  'ispat',
  'kanıt',
  'kanit',
];

export function detectEscalationNeed(message: string): EscalationSignal | null {
  const cleanMessage = message.trim();
  if (cleanMessage.length < 4) {
    return null;
  }

  const normalized = normalizeForSearch(cleanMessage);
  const keyword = escalationKeywords.find((candidate) =>
    normalized.includes(normalizeForSearch(candidate)),
  );

  if (!keyword) {
    return null;
  }

  return {
    topic: normalizeEscalationTopic(cleanMessage),
    question: cleanMessage,
    reason: `Detected expert-help keyword: ${keyword}`,
  };
}

export function decideMascotAction(
  input: MascotDecisionInput,
): MascotDecision {
  const cleanMessage = input.message.trim();
  const directSignal = detectEscalationNeed(cleanMessage);

  if (directSignal) {
    return {
      action: 'escalate',
      answer:
        'Bu noktada mentor desteği almak daha doğru olur. Konuyu bir uzmana yönlendiriyorum.',
      confidence: 0.36,
      reason: directSignal.reason,
      source: 'deterministic',
      topic: directSignal.topic,
      question: directSignal.question,
    };
  }

  const domainKeyword = findExpertDomainKeyword(cleanMessage);
  if (domainKeyword) {
    const topic = normalizeEscalationTopic(cleanMessage);
    return {
      action: 'escalate',
      answer: `Bu konuyu bir uzmana danışmak daha iyi olur. İstersen "${topic}" için mentor desteği oluşturabilirim.`,
      confidence: 0.44,
      reason: `Detected expert-domain keyword: ${domainKeyword}`,
      source: 'deterministic',
      topic,
      question: cleanMessage,
    };
  }

  return {
    action: 'answer',
    answer: buildMascotReply(cleanMessage),
    confidence: 0.78,
    reason: 'No expert-help or expert-domain signal detected.',
    source: 'deterministic',
  };
}

export function createEscalationRequest(
  input: CreateEscalationInput,
): EscalationRequest {
  const now = input.now ?? new Date();
  const createdAt = now.toISOString();
  const id = input.id ?? createEscalationId(now);
  const callType = input.callType ?? DEFAULT_CALL_TYPE;

  return {
    id,
    status: 'pending',
    topic: normalizeEscalationTopic(input.topic),
    question: input.question.trim(),
    requester: {
      id: input.requester.id.trim(),
      name: input.requester.name.trim(),
    },
    callType,
    callId: createEscalationCallId(id),
    createdAt,
    updatedAt: createdAt,
  };
}

export function buildExpertInviteText(request: EscalationRequest): string {
  return `${request.requester.name}, "${request.topic}" konusunda mentor desteği istiyor. Sohbete bağlanmak ister misiniz?`;
}

export function buildMascotReply(message: string): string {
  const topic = normalizeEscalationTopic(message);
  return `Bunu birlikte netleştirelim. "${topic}" için önce problemi ve beklenen çıktıyı ayıralım; istersen bir mentor desteği de isteyebilirim.`;
}

export function buildTranscriptReturnMessage(input: {
  expertName?: string;
  transcriptLines: string[];
}): string {
  const expertName = input.expertName?.trim() || 'uzman';
  const lines = input.transcriptLines
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 3);

  if (lines.length === 0) {
    return `${expertName} ile görüşme tamamlandı. Transkriptte konuşma algılanmadı; bu görüşmeden konuşma notu ekleyemiyorum.`;
  }

  return `${expertName} ile görüşme tamamlandı. Uzman görüşmesinden notlar: ${lines.join(' ')}`;
}

export function buildMentorSessionReturnMessage(input: {
  expertName?: string;
  requesterMessages: string[];
  transcriptLines: string[];
}): string {
  const expertName = input.expertName?.trim() || 'uzman';
  const requesterMessages = input.requesterMessages
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(-3);
  const transcriptLines = input.transcriptLines
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 4);

  if (transcriptLines.length === 0) {
    return `${expertName} ile mentor oturumu tamamlandı. Kullanıcı sohbette ${formatCompactList(
      requesterMessages,
    )} yazdı; transkriptte mentor konuşması algılanmadı.`;
  }

  return `${expertName} ile mentor oturumu tamamlandı. Kullanıcı sohbette ${formatCompactList(
    requesterMessages,
  )} yazdı. Mentorun konuşmasından notlar: ${transcriptLines.join(' ')}`;
}

export function normalizeEscalationTopic(value: string): string {
  const cleaned = value
    .replace(/\s+/g, ' ')
    .replace(/[?!.,;:]+$/g, '')
    .trim();

  if (!cleaned) {
    return 'genel destek';
  }

  if (cleaned.length <= 72) {
    return cleaned;
  }

  return `${cleaned.slice(0, 69).trim()}...`;
}

function createEscalationId(now: Date): string {
  const stamp = now
    .toISOString()
    .replace(/[-:.TZ]/g, '')
    .slice(0, 14);
  const random = Math.random().toString(36).slice(2, 8);
  return `esc-${stamp}-${random}`;
}

function formatCompactList(lines: string[]): string {
  if (lines.length === 0) {
    return 'ek bir soru olmadan';
  }

  return lines.map((line) => `"${line}"`).join(', ');
}

function createEscalationCallId(escalationId: string): string {
  return `mentor-${escalationId.replace(/[^a-z0-9_-]+/gi, '-').toLowerCase()}`;
}

function findExpertDomainKeyword(message: string): string | null {
  const normalized = normalizeForSearch(message);
  return (
    expertDomainKeywords.find((candidate) =>
      normalized.includes(normalizeForSearch(candidate)),
    ) ?? null
  );
}

function normalizeForSearch(value: string): string {
  return value
    .toLocaleLowerCase('tr')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}
