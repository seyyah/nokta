import { getTokenServerUrl } from './transcript';

type EndCallResponse = {
  status?: string;
};

type GoLiveResponse = {
  status?: string;
};

type StartTranscriptionResponse = {
  status?: string;
};

type StopTranscriptionResponse = {
  status?: string;
};

export async function requestEndCall(input: {
  callType: string;
  callId: string;
}): Promise<void> {
  const path = `/calls/${encodeURIComponent(input.callType)}/${encodeURIComponent(
    input.callId,
  )}/end`;
  const response = await fetch(`${getTokenServerUrl()}${path}`, {
    method: 'POST',
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Oturum kapatma isteği başarısız oldu: ${response.status}`);
  }

  const body = (await response.json()) as EndCallResponse;
  if (body.status && body.status !== 'ended') {
    throw new Error('Oturum kapatma yanıtı geçersiz.');
  }
}

export async function requestStartLivestream(input: {
  callType: string;
  callId: string;
}): Promise<void> {
  const path = `/calls/${encodeURIComponent(input.callType)}/${encodeURIComponent(
    input.callId,
  )}/go-live`;
  const response = await fetch(`${getTokenServerUrl()}${path}`, {
    method: 'POST',
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Canlı yayın başlatma isteği başarısız oldu: ${response.status}`);
  }

  const body = (await response.json()) as GoLiveResponse;
  if (body.status && body.status !== 'live') {
    throw new Error('Canlı yayın başlatma yanıtı geçersiz.');
  }
}

export async function requestStartCallTranscription(input: {
  callType: string;
  callId: string;
  language: string;
}): Promise<void> {
  const path = `/calls/${encodeURIComponent(input.callType)}/${encodeURIComponent(
    input.callId,
  )}/start-transcription`;
  const response = await fetch(`${getTokenServerUrl()}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language: input.language }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      message || `Transkripsiyon başlatma isteği başarısız oldu: ${response.status}`,
    );
  }

  const body = (await response.json()) as StartTranscriptionResponse;
  if (body.status && body.status !== 'transcribing') {
    throw new Error('Transkripsiyon başlatma yanıtı geçersiz.');
  }
}

export async function requestStopCallTranscription(input: {
  callType: string;
  callId: string;
}): Promise<void> {
  const path = `/calls/${encodeURIComponent(input.callType)}/${encodeURIComponent(
    input.callId,
  )}/stop-transcription`;
  const response = await fetch(`${getTokenServerUrl()}${path}`, {
    method: 'POST',
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      message || `Transkripsiyon durdurma isteği başarısız oldu: ${response.status}`,
    );
  }

  const body = (await response.json()) as StopTranscriptionResponse;
  if (body.status && body.status !== 'stopped') {
    throw new Error('Transkripsiyon durdurma yanıtı geçersiz.');
  }
}
