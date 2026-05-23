import { GEMINI_API_KEY, GEMINI_API_URL } from '../constants/Config';

export interface IdeaCard {
  id: string;
  title: string;
  summary: string;
  mergedFrom: number[];
  tags: string[];
  score: number;
  category: 'idea' | 'task' | 'decision' | 'risk' | 'other';
}

type Group = {
  category: IdeaCard['category'];
  lineNumbers: number[];
  lines: string[];
  keywords: string[];
};

const SYSTEM_PROMPT = `You turn messy note dumps into clean idea cards.

The input may include WhatsApp exports, bullet notes, mixed language fragments, and repeated lines.
Return only a JSON array. No markdown fences. No prose.

Rules:
- Merge near-duplicate lines into a single card.
- Keep the dominant language of each cluster.
- Use one of these categories: idea, task, decision, risk, other.
- mergedFrom must contain the original 1-based line numbers that were merged.
- title must be short, clear, and action-oriented.
- summary must be 1-2 sentences and preserve meaning without filler.
- tags must be 2-4 lowercase keywords.
- score must be 0-100 based on specificity and usefulness.

Output schema:
[
  {
    "id": "card_1",
    "title": "Short title",
    "summary": "Clean summary",
    "mergedFrom": [1, 3, 7],
    "tags": ["keyword", "keyword"],
    "score": 82,
    "category": "idea"
  }
]`;

const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'this',
  'that',
  'from',
  'your',
  'have',
  'will',
  'just',
  'about',
  'into',
  'need',
  'what',
  'when',
  'where',
  'why',
  'how',
  'yang',
  'dan',
  'ini',
  'itu',
  'untuk',
  've',
  'ile',
  'ben',
  'sen',
  'we',
  'our',
  'you',
  'to',
  'of',
  'in',
  'on',
  'at',
  'a',
  'an',
  'is',
  'are',
]);

function splitLines(rawText: string) {
  return rawText
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .filter(line => !/^[-*_]{3,}$/.test(line));
}

function normalize(line: string) {
  return line
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[^a-z0-9\u00C0-\u024f\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(line: string) {
  return normalize(line)
    .split(' ')
    .map(token => token.trim())
    .filter(token => token.length > 2 && !STOP_WORDS.has(token));
}

function pickCategory(line: string, tokens: string[]): IdeaCard['category'] {
  const text = `${line.toLowerCase()} ${tokens.join(' ')}`;

  if (
    /(^|\s)(todo|follow up|followup|deadline|remind|schedule|book|send|assign|plan|review|checklist)(\s|$)/.test(
      text,
    )
  ) {
    return 'task';
  }

  if (
    /(^|\s)(decide|decision|chosen|approved|use|pick|selected|locked|agreed|final|confirmed)(\s|$)/.test(
      text,
    )
  ) {
    return 'decision';
  }

  if (
    /(^|\s)(risk|blocked|issue|problem|constraint|limit|cannot|can't|need to|warning|dependency|delay)(\s|$)/.test(
      text,
    )
  ) {
    return 'risk';
  }

  if (
    /(^|\s)(idea|feature|build|ship|launch|prototype|product|solution|app)(\s|$)/.test(text)
  ) {
    return 'idea';
  }

  return 'other';
}

function overlapScore(left: string[], right: string[]) {
  const rightSet = new Set(right);
  let overlap = 0;
  for (const token of left) {
    if (rightSet.has(token)) {
      overlap += 1;
    }
  }
  return overlap;
}

function addToGroup(groups: Group[], line: string, lineNumber: number) {
  const tokens = tokenize(line);
  const category = pickCategory(line, tokens);
  let bestGroup: Group | null = null;
  let bestScore = 0;

  for (const group of groups) {
    if (group.category !== category) {
      continue;
    }

    const score = overlapScore(group.keywords, tokens);
    if (score >= 2 && score > bestScore) {
      bestScore = score;
      bestGroup = group;
    }
  }

  if (!bestGroup) {
    groups.push({
      category,
      lineNumbers: [lineNumber],
      lines: [line],
      keywords: tokens.slice(0, 6),
    });
    return;
  }

  bestGroup.lineNumbers.push(lineNumber);
  bestGroup.lines.push(line);
  const mergedTokens = new Set([...bestGroup.keywords, ...tokens]);
  bestGroup.keywords = Array.from(mergedTokens).slice(0, 8);
}

function buildTitle(group: Group) {
  const filtered = group.keywords.filter(token => !/^\d+$/.test(token));
  const titleWords = filtered.slice(0, 3);
  if (titleWords.length === 0) {
    return group.lines[0].slice(0, 36);
  }

  return titleWords
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function buildSummary(group: Group) {
  const primary = group.lines[0].replace(/\s+/g, ' ').trim();
  if (group.lines.length === 1) {
    return primary;
  }

  const secondary = group.lines[1].replace(/\s+/g, ' ').trim();
  return `${primary} Synthesized with ${group.lines.length - 1} related line${
    group.lines.length - 1 > 1 ? 's' : ''
  }, including: ${secondary}`;
}

function buildTags(group: Group) {
  const tags = group.keywords
    .filter(token => token.length > 2)
    .slice(0, 4)
    .map(token => token.toLowerCase());

  if (tags.length > 0) {
    return tags;
  }

  return [group.category];
}

function buildScore(group: Group) {
  const detailBoost = Math.min(25, group.keywords.length * 4);
  const mergeBoost = Math.min(25, (group.lineNumbers.length - 1) * 8);
  const base =
    group.category === 'decision' ? 70 : group.category === 'task' ? 68 : group.category === 'idea' ? 66 : 58;

  return Math.max(35, Math.min(98, base + detailBoost + mergeBoost));
}

function buildFallbackCards(rawText: string): IdeaCard[] {
  const lines = splitLines(rawText);
  if (lines.length === 0) {
    return [];
  }

  const groups: Group[] = [];
  lines.forEach((line, index) => addToGroup(groups, line, index + 1));

  return groups.map((group, index) => ({
    id: `card_${index + 1}`,
    title: buildTitle(group),
    summary: buildSummary(group),
    mergedFrom: group.lineNumbers.sort((a, b) => a - b),
    tags: buildTags(group),
    score: buildScore(group),
    category: group.category,
  }));
}

function extractText(response: any): string {
  const candidate = response?.candidates?.[0];
  const parts = candidate?.content?.parts ?? [];
  return parts
    .map((part: { text?: string }) => part.text ?? '')
    .join('')
    .trim();
}

async function callGemini(rawText: string): Promise<IdeaCard[]> {
  const lines = splitLines(rawText);
  if (lines.length === 0) {
    return [];
  }

  const numberedText = lines.map((line, index) => `${index + 1}. ${line}`).join('\n');

  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': GEMINI_API_KEY,
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Deduplicate and extract idea cards from the following notes. Return only JSON.\n\n${numberedText}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1800,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const text = extractText(data);
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('No JSON array found in model response');
  }

  return JSON.parse(jsonMatch[0]) as IdeaCard[];
}

export async function analyzeNotes(rawText: string): Promise<IdeaCard[]> {
  if (!rawText.trim()) {
    return [];
  }

  if (!GEMINI_API_KEY) {
    return buildFallbackCards(rawText);
  }

  try {
    return await callGemini(rawText);
  } catch (error) {
    console.warn('Falling back to local dedup logic:', error);
    return buildFallbackCards(rawText);
  }
}
