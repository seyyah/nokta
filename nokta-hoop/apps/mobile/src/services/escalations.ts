import type { EscalationRequest } from '@nokta-hoop/hoop-core';

import { getTokenServerUrl } from './transcript';

type EscalationResponse = {
  escalation: EscalationRequest;
  inviteText?: string;
};

type EscalationListResponse = {
  escalations: EscalationRequest[];
};

export async function createEscalation(input: {
  requesterId: string;
  requesterName: string;
  topic: string;
  question: string;
}): Promise<EscalationRequest> {
  const response = await fetch(`${getTokenServerUrl()}/escalations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requester_id: input.requesterId,
      requester_name: input.requesterName,
      topic: input.topic,
      question: input.question,
    }),
  });

  return readEscalationResponse(response);
}

export async function listEscalations(input: {
  status?: EscalationRequest['status'];
} = {}): Promise<EscalationRequest[]> {
  const query = input.status
    ? `?status=${encodeURIComponent(input.status)}`
    : '';
  const response = await fetch(`${getTokenServerUrl()}/escalations${query}`);

  if (!response.ok) {
    throw new Error(await getResponseMessage(response, 'Mentor isteği listesi yüklenemedi.'));
  }

  const body = (await response.json()) as EscalationListResponse;
  if (!Array.isArray(body.escalations)) {
    throw new Error('Mentor isteği listesi yanıtı geçersiz.');
  }

  return body.escalations;
}

export async function getEscalation(
  escalationId: string,
): Promise<EscalationRequest> {
  const response = await fetch(
    `${getTokenServerUrl()}/escalations/${encodeURIComponent(escalationId)}`,
  );

  return readEscalationResponse(response);
}

export async function acceptEscalation(input: {
  escalationId: string;
  expertId: string;
  expertName: string;
}): Promise<EscalationRequest> {
  const response = await fetch(
    `${getTokenServerUrl()}/escalations/${encodeURIComponent(
      input.escalationId,
    )}/accept`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        expert_id: input.expertId,
        expert_name: input.expertName,
      }),
    },
  );

  return readEscalationResponse(response);
}

export async function cancelEscalation(
  escalationId: string,
): Promise<EscalationRequest> {
  const response = await fetch(
    `${getTokenServerUrl()}/escalations/${encodeURIComponent(
      escalationId,
    )}/cancel`,
    { method: 'POST' },
  );

  return readEscalationResponse(response);
}

export async function resolveEscalation(
  escalationId: string,
): Promise<EscalationRequest> {
  const response = await fetch(
    `${getTokenServerUrl()}/escalations/${encodeURIComponent(
      escalationId,
    )}/resolve`,
    { method: 'POST' },
  );

  return readEscalationResponse(response);
}

async function readEscalationResponse(
  response: Response,
): Promise<EscalationRequest> {
  if (!response.ok) {
    throw new Error(await getResponseMessage(response, 'Mentor isteği başarısız oldu.'));
  }

  const body = (await response.json()) as EscalationResponse;
  if (!body.escalation?.id) {
    throw new Error('Mentor isteği yanıtı geçersiz.');
  }

  return body.escalation;
}

async function getResponseMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? `${fallback} ${response.status}`;
  } catch {
    return `${fallback} ${response.status}`;
  }
}
