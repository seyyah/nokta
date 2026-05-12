const TOKEN_SERVER_URL = process.env.EXPO_PUBLIC_TOKEN_SERVER_URL;

export type StreamTokenUser = {
  id: string;
  name: string;
};

export type StreamTokenResponse = {
  token: string;
  user: StreamTokenUser;
  expiresIn: number;
};

export async function requestStreamUserToken(
  userId: string,
  userName: string,
): Promise<StreamTokenResponse> {
  if (!TOKEN_SERVER_URL) {
    throw new Error('EXPO_PUBLIC_TOKEN_SERVER_URL is not configured');
  }

  const response = await fetch(`${TOKEN_SERVER_URL}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, user_name: userName }),
  });

  if (!response.ok) {
    const message = await response.text();
    const looksLikeHtml = message.trim().startsWith('<!DOCTYPE html');
    throw new Error(
      looksLikeHtml
        ? `Token server returned HTML instead of JSON. Check EXPO_PUBLIC_TOKEN_SERVER_URL and confirm /health is reachable. Status: ${response.status}`
        : message || `Token server returned ${response.status}`,
    );
  }

  const body = (await response.json()) as Partial<StreamTokenResponse>;
  if (!body.token || typeof body.token !== 'string') {
    throw new Error('Token response is missing token');
  }
  if (!body.user?.id || !body.user?.name) {
    throw new Error('Token response is missing user');
  }

  return {
    token: body.token,
    user: body.user,
    expiresIn: typeof body.expiresIn === 'number' ? body.expiresIn : 3600,
  };
}

export async function requestStreamToken(userId: string, userName: string) {
  const response = await requestStreamUserToken(userId, userName);
  return response.token;
}
