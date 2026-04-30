export async function* sseLines(response: Response): AsyncGenerator<string> {
  if (!response.body) throw new Error('Response body yok — streaming yapılamıyor');
  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buf = '';
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop() ?? '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data:')) yield trimmed.slice(5).trim();
      }
    }
    if (buf.trim().startsWith('data:')) yield buf.trim().slice(5).trim();
  } finally {
    reader.releaseLock();
  }
}

export function isRetryableStatus(status: number): boolean {
  return status === 429 || (status >= 500 && status < 600);
}

export async function backoff(attempt: number): Promise<void> {
  const base = Math.min(2 ** attempt * 500, 8000);
  const jitter = Math.random() * 250;
  await new Promise((r) => setTimeout(r, base + jitter));
}
