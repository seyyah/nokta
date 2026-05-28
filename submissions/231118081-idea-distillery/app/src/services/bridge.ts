export type BridgeCycle = {
  cycle: number;
  reportName: string;
  result: 'success' | 'fail' | 'rollback' | 'stuck';
  hypothesis: string;
};

export type BridgeStatus = {
  stuck: boolean;
  roomUrl: string;
  roomName: string;
  reason: string;
  lastCycles: BridgeCycle[];
  updatedAt: string;
};

export type BridgeTranscriptPayload = {
  summary: string;
  nextCycleContext: string;
};

const FORGE_ENDPOINT = process.env.EXPO_PUBLIC_FORGE_ENDPOINT?.trim();

function forgeBaseUrl() {
  if (!FORGE_ENDPOINT) {
    return '';
  }

  return FORGE_ENDPOINT.replace(/\/audit\/?$/, '');
}

export function hasBridgeEndpoint() {
  return Boolean(forgeBaseUrl());
}

export async function fetchBridgeStatus(): Promise<BridgeStatus | null> {
  const baseUrl = forgeBaseUrl();

  if (!baseUrl) {
    return null;
  }

  const response = await fetch(`${baseUrl}/bridge/status`);

  if (!response.ok) {
    throw new Error(`Bridge status failed: ${response.status}`);
  }

  return response.json() as Promise<BridgeStatus>;
}

export async function postBridgeTranscript(payload: BridgeTranscriptPayload) {
  const baseUrl = forgeBaseUrl();

  if (!baseUrl) {
    throw new Error('Forge endpoint is not configured.');
  }

  const response = await fetch(`${baseUrl}/bridge/transcript`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...payload,
      submittedAt: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Bridge transcript failed: ${response.status}`);
  }

  return response.json() as Promise<{ ok: boolean }>;
}
