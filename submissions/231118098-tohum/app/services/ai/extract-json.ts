import { MalformedResponseError } from './errors';

/**
 * LLM cevabından ilk geçerli JSON bloğunu ayıklar.
 * Model bazen ```json ... ``` ile sarabilir; bazen başında önsöz ekleyebilir.
 * İki düzey kurtarma denemesi yapılır, hiçbiri tutmazsa MalformedResponseError.
 */
export function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const unfenced = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  try {
    return JSON.parse(unfenced);
  } catch {
    const start = unfenced.indexOf('{');
    const end = unfenced.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) {
      throw new MalformedResponseError(text);
    }
    try {
      return JSON.parse(unfenced.slice(start, end + 1));
    } catch {
      throw new MalformedResponseError(text);
    }
  }
}
