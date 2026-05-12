import type { MascotChatMessage, MascotDecision } from '@nokta-hoop/hoop-core';

import { getTokenServerUrl } from './transcript';

type MascotDecisionResponse = {
  decision: MascotDecision;
};

export async function requestMascotDecision(input: {
  message: string;
  history: MascotChatMessage[];
}): Promise<MascotDecision> {
  const response = await fetch(`${getTokenServerUrl()}/mascot/decide`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: input.message,
      history: input.history.slice(-12),
    }),
  });

  if (!response.ok) {
    throw new Error(await getResponseMessage(response));
  }

  const body = (await response.json()) as MascotDecisionResponse;
  if (
    !body.decision ||
    (body.decision.action !== 'answer' && body.decision.action !== 'escalate')
  ) {
    throw new Error('Maskot karar yanıtı geçersiz.');
  }

  return body.decision;
}

async function getResponseMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? `Maskot kararı başarısız oldu: ${response.status}`;
  } catch {
    return `Maskot kararı başarısız oldu: ${response.status}`;
  }
}
