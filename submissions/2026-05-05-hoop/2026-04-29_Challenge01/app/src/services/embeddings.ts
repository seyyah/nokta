const DIM = 256;

function hash32(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 3);
}

function ngrams(tok: string[], n: number): string[] {
  const out: string[] = [];
  for (let i = 0; i <= tok.length - n; i++) out.push(tok.slice(i, i + n).join(' '));
  return out;
}

export function embed(text: string): number[] {
  const tok = tokens(text);
  const grams = [...tok, ...ngrams(tok, 2)];
  const v = new Array<number>(DIM).fill(0);
  for (const g of grams) {
    const idx = hash32(g) % DIM;
    v[idx]! += 1;
  }
  let norm = 0;
  for (const x of v) norm += x * x;
  norm = Math.sqrt(norm) || 1;
  return v.map((x) => x / norm);
}

export function cosine(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i]! * b[i]!;
  return dot;
}

export function findMostSimilar(
  query: number[],
  corpus: { id: string; embedding: number[] }[]
): { id: string; score: number } | null {
  if (corpus.length === 0) return null;
  let bestId = corpus[0]!.id;
  let bestScore = cosine(query, corpus[0]!.embedding);
  for (let i = 1; i < corpus.length; i++) {
    const s = cosine(query, corpus[i]!.embedding);
    if (s > bestScore) {
      bestScore = s;
      bestId = corpus[i]!.id;
    }
  }
  return { id: bestId, score: bestScore };
}

export const DUPLICATE_THRESHOLD = 0.85;
