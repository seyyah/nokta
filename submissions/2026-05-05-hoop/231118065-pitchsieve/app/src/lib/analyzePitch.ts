export type PitchAnalysis = {
  score: number;
  tags: string[];
  reasons: string[];
  rewrite: string;
};

const genericAudienceWords = [
  'everyone',
  'businesses',
  'people',
  'teams',
  'companies',
  'users',
  'organizations',
  'professionals',
  'consumers',
  'founders',
];

const inflatedVerbPatterns = [
  /\btransform(?:ing|s|ed)?\b/i,
  /\brevolutioni[sz](?:e|es|ed|ing)\b/i,
  /\bdisrupt(?:ing|s|ed)?\b/i,
  /\breinvent(?:ing|s|ed)?\b/i,
  /\bunlock(?:ing|s|ed)?\b/i,
  /\bsupercharge(?:s|d|ing)?\b/i,
  /\bempower(?:s|ed|ing)?\b/i,
];

const buzzwordPatterns = [
  /\bai-powered\b/i,
  /\bseamless\b/i,
  /\bend-to-end\b/i,
  /\bsmart\b/i,
  /\binnovative\b/i,
  /\bnext-?gen\b/i,
  /\bcutting-edge\b/i,
  /\bfrictionless\b/i,
  /\bscalable\b/i,
  /\bdata-driven\b/i,
  /\bgame-?changing\b/i,
];

const marketClaimPatterns = [
  /\$\s?\d+(?:\.\d+)?\s?(?:[mbtk]|million|billion|trillion)\b/i,
  /\bhuge market\b/i,
  /\bmassive opportunity\b/i,
  /\bmassive market\b/i,
  /\b(?:tam|sam|som)\b/i,
  /\bfast-growing market\b/i,
];

const unverifiableClaimPatterns = [
  /\b10x\b/i,
  /\bbest-in-class\b/i,
  /\bworld-class\b/i,
  /\bindustry-leading\b/i,
  /\bguarantee(?:d|s)?\b/i,
  /\bproven\b/i,
  /\binstantly\b/i,
  /\bfor everyone\b/i,
];

const genericProblemPatterns = [
  /\bin today'?s fast-paced world\b/i,
  /\bpeople struggle\b/i,
  /\bbusinesses struggle\b/i,
  /\bteams struggle\b/i,
  /\bthere (?:is|are) no easy way\b/i,
  /\bmanual processes are broken\b/i,
  /\bcurrent solutions fall short\b/i,
  /\btraditional tools\b/i,
];

const differentiationPatterns = [
  /\bunlike\b/i,
  /\binstead of\b/i,
  /\bcompared to\b/i,
  /\breplaces?\b/i,
  /\bfor [a-z0-9/&-]+(?: [a-z0-9/&-]+){0,4}\b/i,
];

const workflowNounPatterns = [
  /\binvoices?\b/i,
  /\bschedul(?:e|ing)\b/i,
  /\binventory\b/i,
  /\bclaims?\b/i,
  /\bprocurement\b/i,
  /\bdispatch\b/i,
  /\bwarehouse\b/i,
  /\bclinic\b/i,
  /\bcontracts?\b/i,
  /\bfield sales\b/i,
  /\brecruit(?:ing|er|ers)\b/i,
  /\bspreadsheets?\b/i,
  /\binbox(?:es)?\b/i,
  /\bshift(?:s| swaps?)\b/i,
  /\bcompliance\b/i,
  /\bcrm\b/i,
  /\bdenied-claim\b/i,
  /\bqueue\b/i,
];

const proofLikePatterns = [
  /\bminutes?\b/i,
  /\bhours?\b/i,
  /\bdays?\b/i,
  /\bper week\b/i,
  /\bnext action\b/i,
  /\bwithout\b/i,
  /\bby\b/i,
  /\bso that\b/i,
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function unique<T>(values: T[]) {
  return Array.from(new Set(values));
}

function countMatches(text: string, patterns: RegExp[]) {
  return patterns.reduce((count, pattern) => (pattern.test(text) ? count + 1 : count), 0);
}

function splitSentences(text: string) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function normalizeText(text: string) {
  return text.replace(/\s+/g, ' ').trim();
}

function lowercaseFirst(text: string) {
  if (text.length === 0) {
    return text;
  }

  return text.charAt(0).toLowerCase() + text.slice(1);
}

function capitalizeFirst(text: string) {
  if (text.length === 0) {
    return text;
  }

  return text.charAt(0).toUpperCase() + text.slice(1);
}

function containsGenericAudience(phrase: string) {
  const lowerPhrase = phrase.toLowerCase();
  return genericAudienceWords.some((word) => lowerPhrase.includes(word));
}

function extractAudience(text: string) {
  const match = text.match(/\bfor ([a-z0-9/&-]+(?: [a-z0-9/&-]+){0,4})/i);

  if (!match) {
    return null;
  }

  const audience = match[1].trim();
  return containsGenericAudience(audience) ? null : audience;
}

function extractComparator(text: string) {
  const unlikeMatch = text.match(/\bunlike ([^.?!,;]+)/i);
  if (unlikeMatch) {
    return unlikeMatch[1].trim();
  }

  const insteadMatch = text.match(/\binstead of ([^.?!,;]+)/i);
  if (insteadMatch) {
    return insteadMatch[1].trim();
  }

  return null;
}

function extractByPhrase(text: string) {
  const match = text.match(/\bby ([^.?!]+)/i);
  return match?.[1]?.trim() ?? null;
}

function extractHelpPhrase(text: string) {
  const match = text.match(/\b(?:helps?|allows?|lets?|enables?) ([^.?!]+)/i);
  return match?.[1]?.trim() ?? null;
}

function cleanSentence(sentence: string) {
  return normalizeText(
    sentence
      .replace(/\bAI-powered\b/gi, '')
      .replace(/\bend-to-end\b/gi, '')
      .replace(/\bseamless\b/gi, '')
      .replace(/\binnovative\b/gi, '')
      .replace(/\bsmart\b/gi, '')
      .replace(/\bmassive opportunity\b/gi, '')
      .replace(/\bmassive market\b/gi, '')
      .replace(/\bhuge market\b/gi, '')
      .replace(/\$\s?\d+(?:\.\d+)?\s?(?:[mbtk]|million|billion|trillion)\b/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim(),
  );
}

function buildRewrite(text: string, hasDifferentiation: boolean) {
  const audience = extractAudience(text) ?? 'a specific user group';
  const helpPhrase = extractHelpPhrase(text);
  const byPhrase = extractByPhrase(text);
  const comparator = extractComparator(text) ?? 'the current manual workaround';
  const cleanedFirstSentence = cleanSentence(splitSentences(text)[0] ?? '');

  const opening =
    audience === 'a specific user group'
      ? 'A focused product'
      : `For ${audience}, this is a focused product`;

  const outcome = helpPhrase
    ? lowercaseFirst(helpPhrase.replace(/\b(?:everyone|businesses|people|teams)\b/gi, 'a defined user'))
    : 'solves one repeated, measurable workflow problem';

  const mechanism = byPhrase
    ? ` by ${lowercaseFirst(byPhrase)}`
    : cleanedFirstSentence.length > 0
      ? ` with a narrower promise than "${cleanedFirstSentence}"`
      : '';

  const differentiator = hasDifferentiation
    ? ` It wins against ${comparator} with a specific wedge instead of a broad platform claim.`
    : ` State what it replaces today and why this narrow workflow wins over ${comparator}.`;

  return `${opening} that ${outcome}${mechanism}.${differentiator}`;
}

export function analyzePitch(text: string): PitchAnalysis {
  const normalizedText = normalizeText(text);
  const words = normalizedText.split(/\s+/).filter(Boolean);

  const vagueAudienceMatch = genericAudienceWords.filter((word) =>
    new RegExp(`\\b${word}\\b`, 'i').test(normalizedText),
  );
  const inflatedVerbCount = countMatches(normalizedText, inflatedVerbPatterns);
  const buzzwordCount = countMatches(normalizedText, buzzwordPatterns);
  const marketClaimCount = countMatches(normalizedText, marketClaimPatterns);
  const unverifiableClaimCount = countMatches(normalizedText, unverifiableClaimPatterns);
  const genericProblemCount = countMatches(normalizedText, genericProblemPatterns);
  const workflowSpecificityCount = countMatches(normalizedText, workflowNounPatterns);
  const proofLikeCount = countMatches(normalizedText, proofLikePatterns);

  const explicitAudience = extractAudience(normalizedText);
  const hasDifferentiation = differentiationPatterns.some((pattern) => pattern.test(normalizedText));
  const hasSpecificity = Boolean(explicitAudience) || workflowSpecificityCount >= 2 || proofLikeCount >= 2;

  let score = 18;
  const tags: string[] = [];
  const reasons: string[] = [];

  const addIssue = (weight: number, tag: string, reason: string) => {
    score += weight;
    tags.push(tag);
    reasons.push(reason);
  };

  if (words.length < 22) {
    addIssue(
      8,
      'Thin detail',
      'The pitch is short on concrete detail, which makes it easier to hide weak assumptions behind broad language.',
    );
  }

  if (vagueAudienceMatch.length > 0 && !explicitAudience) {
    addIssue(
      14,
      'Vague audience',
      'It gestures at generic users like people, businesses, or teams without bounding who specifically has the problem.',
    );
  }

  if (inflatedVerbCount > 0) {
    addIssue(
      8 + Math.min(6, (inflatedVerbCount - 1) * 2),
      'Hype verbs',
      'Words like transform, revolutionize, or disrupt add ambition but not evidence about what the product actually does.',
    );
  }

  if (buzzwordCount > 0) {
    addIssue(
      8 + Math.min(10, (buzzwordCount - 1) * 2),
      'Buzzword-heavy',
      'Buzzwords like AI-powered, seamless, or end-to-end make the pitch sound polished while reducing precision.',
    );
  }

  if (marketClaimCount > 0) {
    addIssue(
      14,
      'Market handwave',
      'Market-size references appear without proof that this product has a credible wedge inside that market.',
    );
  }

  if (unverifiableClaimCount > 0) {
    addIssue(
      10 + Math.min(4, (unverifiableClaimCount - 1) * 2),
      'Unverifiable claims',
      'Claims like best-in-class, proven, or 10x read as confidence signals unless they are backed by data.',
    );
  }

  if (genericProblemCount > 0) {
    addIssue(
      10,
      'Generic problem',
      'The problem framing sounds reusable across many decks instead of tied to a sharp operational pain point.',
    );
  }

  if (!hasDifferentiation) {
    addIssue(
      12,
      'No wedge',
      'The pitch does not clearly say what existing alternative it beats or what narrow segment it serves better.',
    );
  }

  if (!hasSpecificity) {
    addIssue(
      12,
      'Low specificity',
      'There are not enough concrete workflow details, constraints, or user cues to test the claim in due diligence.',
    );
  }

  if (explicitAudience) {
    score -= 10;
    tags.push('Focused user');
    reasons.push(
      `It does at least point toward a bounded audience: ${explicitAudience}. That lowers the slop risk.`,
    );
  }

  if (workflowSpecificityCount >= 2) {
    score -= 8;
    tags.push('Concrete workflow');
    reasons.push(
      'Specific operational nouns make the pitch easier to test because they imply a real workflow, not just a category.',
    );
  }

  if (proofLikeCount >= 2) {
    score -= 6;
    tags.push('Mechanism visible');
    reasons.push(
      'The draft hints at a mechanism or constraint, which is more credible than only describing an outcome.',
    );
  }

  if (hasDifferentiation) {
    score -= 10;
    tags.push('Clear wedge');
    reasons.push(
      'The pitch includes a differentiating cue, which helps anchor the claim against an alternative instead of sounding universal.',
    );
  }

  if (score <= 24 && reasons.length === 0) {
    reasons.push(
      'This pitch is relatively concrete already. The language names a user, a workflow, and a wedge rather than leaning on generic startup rhetoric.',
    );
    tags.push('Relatively concrete');
  }

  const finalScore = clamp(Math.round(score), 0, 100);

  return {
    score: finalScore,
    tags: unique(tags).slice(0, 6),
    reasons: unique(reasons).slice(0, 6),
    rewrite: buildRewrite(normalizedText, hasDifferentiation),
  };
}
