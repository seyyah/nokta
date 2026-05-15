const STOPWORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'but',
  'by',
  'for',
  'from',
  'if',
  'in',
  'into',
  'is',
  'it',
  'its',
  'of',
  'on',
  'or',
  'our',
  'so',
  'that',
  'the',
  'their',
  'this',
  'to',
  'was',
  'we',
  'with',
  'your',
  'you',
  'note',
  'notes',
  'idea',
  'ideas',
  'project',
  'app',
  'mobile',
  'track',
  'group',
  'merge',
  'separate',
  'mentor',
  'human',
  'review',
  'hoop',
  'stream',
]);

const SOURCE_ALIASES = {
  wa: 'WhatsApp',
  whatsapp: 'WhatsApp',
  note: 'Notion',
  notion: 'Notion',
  voice: 'Voice',
  call: 'Voice',
  mail: 'Email',
  email: 'Email',
  inbox: 'Email',
  stream: 'Stream',
  paste: 'Paste',
};

const SOURCE_OPTIONS = [
  { key: 'Paste', label: 'Paste', icon: 'content-paste' },
  { key: 'WhatsApp', label: 'WhatsApp', icon: 'whatsapp' },
  { key: 'Notion', label: 'Notion', icon: 'notebook-outline' },
  { key: 'Voice', label: 'Voice', icon: 'microphone' },
  { key: 'Email', label: 'Email', icon: 'email-outline' },
];

const SAMPLE_PASTE = `wa: mentor review should happen only when a card feels risky
notion: keep source provenance visible so we can trust the writeback
voice: merge duplicate ideas but preserve the original note as evidence
mail: if a card asks for live support, route it to the Hoop room
wa: write the transcript back into the idea card after the session
note: keep separate when two notes clearly target different users`;

function stripDiacritics(text) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function titleCase(text) {
  return String(text || '')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function normalizeText(text) {
  return stripDiacritics(String(text || ''))
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text) {
  return normalizeText(text)
    .split(' ')
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !STOPWORDS.has(token) && !/^\d+$/.test(token));
}

function makeBigrams(tokens) {
  const bigrams = [];
  for (let index = 0; index < tokens.length - 1; index += 1) {
    bigrams.push(`${tokens[index]} ${tokens[index + 1]}`);
  }
  return bigrams;
}

function toSet(values) {
  return new Set(values);
}

function jaccard(leftSet, rightSet) {
  if (!leftSet.size || !rightSet.size) {
    return 0;
  }

  let intersection = 0;
  leftSet.forEach((value) => {
    if (rightSet.has(value)) {
      intersection += 1;
    }
  });

  const union = leftSet.size + rightSet.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function parseFragment(fragment, fallbackSource) {
  const cleaned = String(fragment || '').trim().replace(/^[>*\-\u2022\s\d.)]+/, '').trim();
  if (!cleaned) {
    return null;
  }

  const sourceMatch = cleaned.match(
    /^(wa|whatsapp|note|notion|voice|call|mail|email|inbox|stream|paste)\s*[:\-]\s*(.+)$/i
  );

  if (sourceMatch) {
    const sourceKey = sourceMatch[1].toLowerCase();
    return {
      source: SOURCE_ALIASES[sourceKey] || titleCase(sourceKey),
      text: sourceMatch[2].trim(),
    };
  }

  return {
    source: fallbackSource,
    text: cleaned,
  };
}

function splitFragments(rawText, fallbackSource) {
  const text = String(rawText || '').replace(/\r/g, '\n');
  const lines = text
    .split(/\n+/)
    .flatMap((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return [];
      }

      if (trimmed.length > 140 && !/https?:\/\//i.test(trimmed)) {
        return trimmed
          .split(/[.;]+/)
          .map((part) => part.trim())
          .filter(Boolean);
      }

      return [trimmed];
    });

  const fragments = [];

  lines.forEach((line) => {
    const parsed = parseFragment(line, fallbackSource);
    if (!parsed) {
      return;
    }

    const normalized = normalizeText(parsed.text);
    const tokens = tokenize(parsed.text);
    if (normalized.length < 4 || !tokens.length) {
      return;
    }

    fragments.push({
      id: `note-${fragments.length + 1}`,
      source: parsed.source,
      text: parsed.text,
      normalized,
      tokens,
      tokenSet: toSet(tokens),
      bigramSet: toSet(makeBigrams(tokens)),
    });
  });

  return fragments;
}

function scoreNoteAgainstCluster(note, cluster) {
  const tokenScore = jaccard(note.tokenSet, cluster.tokenSet);
  const bigramScore = jaccard(note.bigramSet, cluster.bigramSet);
  const sharedAnchors = note.tokens.filter(
    (token) => token.length >= 5 && cluster.tokenSet.has(token)
  );
  const anchorScore = sharedAnchors.length / Math.max(1, Math.min(3, note.tokens.length));
  const prefixOverlap = note.normalized.slice(0, 30) === cluster.normalized.slice(0, 30) ? 0.2 : 0;

  return clamp(tokenScore * 0.52 + bigramScore * 0.28 + anchorScore * 0.2 + prefixOverlap, 0, 1);
}

function summarizeTexts(texts) {
  if (!texts.length) {
    return '';
  }

  if (texts.length === 1) {
    return texts[0];
  }

  return `${texts[0]} + ${texts.length - 1} more`;
}

function buildKeywordFrequency(notes) {
  const frequency = new Map();
  notes.forEach((note) => {
    note.tokens.forEach((token) => {
      frequency.set(token, (frequency.get(token) || 0) + 1);
    });
  });
  return frequency;
}

function buildSourceCounts(notes) {
  const counts = {};
  notes.forEach((note) => {
    counts[note.source] = (counts[note.source] || 0) + 1;
  });
  return counts;
}

function buildTitle(keywords, fallbackText) {
  if (keywords.length >= 2) {
    return titleCase(`${keywords[0]} ${keywords[1]}`);
  }

  if (keywords.length === 1) {
    return titleCase(keywords[0]);
  }

  const trimmed = fallbackText.length > 48 ? `${fallbackText.slice(0, 45).trim()}...` : fallbackText;
  return titleCase(trimmed);
}

function buildCardFromNotes(notes, matchScores, index, meta = {}) {
  const keywordFrequency = buildKeywordFrequency(notes);
  const keywords = Array.from(keywordFrequency.entries())
    .sort((left, right) => right[1] - left[1] || right[0].length - left[0].length)
    .map(([keyword]) => keyword)
    .filter((keyword) => !STOPWORDS.has(keyword))
    .slice(0, 5);

  const sourceCounts = buildSourceCounts(notes);
  const uniqueSourceCount = Object.keys(sourceCounts).length;
  const avgMatchScore = matchScores.length
    ? matchScores.reduce((sum, score) => sum + score, 0) / matchScores.length
    : 0;

  const confidence = clamp(
    0.52 +
      avgMatchScore * 0.26 +
      Math.min(notes.length, 4) * 0.06 +
      (uniqueSourceCount > 1 ? 0.07 : 0.03),
    0.58,
    0.97
  );

  const provenance = Object.entries(sourceCounts)
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([source, count]) => ({ source, count }));

  const sourceSummary = provenance.map(({ source, count }) => `${source} x${count}`).join(', ');

  return {
    id: meta.id || `card-${index + 1}`,
    title: meta.title || buildTitle(keywords, notes[0]?.text || 'Untitled idea'),
    summary: meta.summary || summarizeTexts(notes.map((note) => note.text)),
    notes,
    keywords,
    provenance,
    sourceSummary,
    confidence,
    confidenceLabel: confidence >= 0.78 ? 'Strong' : confidence >= 0.66 ? 'Medium' : 'Loose',
    locked: Boolean(meta.locked),
    decision: meta.decision || 'auto',
    history: meta.history || [],
    mentorFeedback: meta.mentorFeedback || '',
    mentorTranscript: meta.mentorTranscript || '',
    mentorMode: meta.mentorMode || '',
    mentorRole: meta.mentorRole || '',
    reviewState: meta.reviewState || 'idle',
    matchScores,
    anchorText: keywords.slice(0, 3).map(titleCase).join(' / '),
    noteCount: notes.length,
    uniqueSources: uniqueSourceCount,
    avgMatchScore,
    closeMatch: null,
  };
}

function compareCards(left, right) {
  const keywordScore = jaccard(toSet(left.keywords), toSet(right.keywords));
  const sourceScore = jaccard(
    toSet(left.provenance.map((entry) => entry.source)),
    toSet(right.provenance.map((entry) => entry.source))
  );
  const summaryScore = jaccard(toSet(tokenize(left.summary)), toSet(tokenize(right.summary)));

  return clamp(keywordScore * 0.5 + summaryScore * 0.35 + sourceScore * 0.15, 0, 1);
}

function attachClosestMatch(cards) {
  return cards.map((card) => {
    const candidates = cards
      .filter((candidate) => candidate.id !== card.id && !candidate.locked)
      .map((candidate) => ({
        card: candidate,
        score: compareCards(card, candidate),
      }))
      .sort((left, right) => right.score - left.score);

    const best = candidates[0];
    return {
      ...card,
      closeMatch: best && best.score >= 0.2 ? { id: best.card.id, title: best.card.title, score: best.score } : null,
    };
  });
}

function cloneNotesFromCards(cards) {
  return cards.flatMap((card) =>
    card.notes.map((note, index) => ({
      ...note,
      id: `${card.id}-${index + 1}`,
    }))
  );
}

export function buildIdeaCards(rawText, fallbackSource = 'Paste') {
  const notes = splitFragments(rawText, fallbackSource);
  if (!notes.length) {
    return { notes: [], cards: [], stats: { totalNotes: 0, clusters: 0, avgConfidence: 0 } };
  }

  const clusters = [];

  notes.forEach((note) => {
    let bestCluster = null;
    let bestScore = 0;

    clusters.forEach((cluster) => {
      const score = scoreNoteAgainstCluster(note, cluster);
      if (score > bestScore) {
        bestCluster = cluster;
        bestScore = score;
      }
    });

    if (bestCluster && bestScore >= 0.26) {
      bestCluster.notes.push(note);
      bestCluster.matchScores.push(bestScore);
      bestCluster.tokenSet = new Set([...bestCluster.tokenSet, ...note.tokenSet]);
      bestCluster.bigramSet = new Set([...bestCluster.bigramSet, ...note.bigramSet]);
      bestCluster.normalized = `${bestCluster.normalized} ${note.normalized}`.trim();
      return;
    }

    clusters.push({
      notes: [note],
      tokenSet: new Set(note.tokenSet),
      bigramSet: new Set(note.bigramSet),
      normalized: note.normalized,
      matchScores: [0.42],
    });
  });

  const cards = attachClosestMatch(
    clusters.map((cluster, index) => buildCardFromNotes(cluster.notes, cluster.matchScores, index))
  );

  const avgConfidence = cards.length
    ? cards.reduce((sum, card) => sum + card.confidence, 0) / cards.length
    : 0;

  return {
    notes,
    cards,
    stats: {
      totalNotes: notes.length,
      clusters: cards.length,
      avgConfidence,
    },
  };
}

export function markCardSeparate(cards, cardId) {
  return attachClosestMatch(
    cards.map((card) =>
      card.id === cardId
        ? {
            ...card,
            locked: true,
            decision: 'keep-separate',
            history: [...card.history, 'User marked the card as keep separate.'],
          }
        : card
    )
  );
}

export function mergeCardWithClosest(cards, cardId) {
  const sourceCard = cards.find((card) => card.id === cardId);
  if (!sourceCard || sourceCard.locked || !sourceCard.closeMatch) {
    return { cards, merged: false, message: 'No merge candidate found.' };
  }

  const targetCard = cards.find((card) => card.id === sourceCard.closeMatch.id);
  if (!targetCard || targetCard.locked) {
    return { cards, merged: false, message: 'Target card is locked.' };
  }

  const mergedNotes = cloneNotesFromCards([sourceCard, targetCard]);
  const mergedCard = buildCardFromNotes(mergedNotes, [], 0, {
    id: sourceCard.id,
    locked: sourceCard.locked || targetCard.locked,
    decision: 'merged',
    history: [
      ...sourceCard.history,
      ...targetCard.history,
      `Merged with ${targetCard.title} (${Math.round(sourceCard.closeMatch.score * 100)}% similarity).`,
    ],
  });

  const nextCards = attachClosestMatch(
    cards
      .filter((card) => card.id !== sourceCard.id && card.id !== targetCard.id)
      .concat(mergedCard)
  );

  return {
    cards: nextCards,
    merged: true,
    message: `Merged into ${mergedCard.title}.`,
    mergedCard,
  };
}

export function attachMentorReview(cards, cardId, review) {
  return attachClosestMatch(
    cards.map((card) => {
      if (card.id !== cardId) {
        return card;
      }

      const note = review.note || review.summary || 'Mentor review completed.';
      return {
        ...card,
        mentorFeedback: note,
        mentorTranscript: review.transcript || '',
        mentorMode: review.mode || card.mentorMode,
        mentorRole: review.role || card.mentorRole,
        reviewState: review.reviewState || 'written-back',
        locked: review.approved === false ? true : card.locked || review.mode === 'HITL',
        decision: review.recommendation || card.decision,
        history: [...card.history, `Mentor review completed in ${review.mode || 'HOTL'} mode.`],
      };
    })
  );
}

function recommendReviewMode(card) {
  if (card.confidence >= 0.82 && card.closeMatch && card.closeMatch.score >= 0.36) {
    return 'HOTL';
  }

  if (card.confidence <= 0.64) {
    return 'HITL';
  }

  return 'HOOTL';
}

function recommendationSummary(card) {
  if (card.confidence >= 0.8 && card.closeMatch) {
    return `Merge ${card.title} with ${card.closeMatch.title} after provenance check.`;
  }

  if (card.confidence <= 0.64) {
    return `Keep ${card.title} separate until more evidence arrives.`;
  }

  return `Use mentor guidance to decide whether ${card.title} should merge or remain separate.`;
}

export function buildMentorSession(card, options = {}) {
  const mode = options.mode || recommendReviewMode(card);
  const role = options.role || 'mentor';
  const bridgeState = options.streamConfigured ? 'Stream bridge ready' : 'Local rehearsal mode';
  const recommendation = card.confidence >= 0.78 && card.closeMatch ? 'merge' : 'keep-separate';

  const transcriptLines = [
    `System: ${bridgeState}. Reviewing ${card.title} in ${mode} mode.`,
    `Mentor (${role}): I can see ${card.noteCount} note(s) and ${card.sourceSummary}.`,
    `Mentor (${role}): The strongest keywords are ${card.keywords.slice(0, 3).join(', ') || 'not enough signal yet'}.`,
    'You: I want the card to keep source provenance while still reducing duplicate ideas.',
    `Mentor (${role}): ${recommendationSummary(card)}`,
    `Decision: ${recommendation === 'merge' ? 'write back a merged card summary' : 'write back a separate-card note and keep the provenance gate visible'}.`,
  ];

  return {
    mode,
    role,
    bridgeState,
    recommendation,
    summary: recommendationSummary(card),
    transcript: transcriptLines.join('\n\n'),
    writeback: `${recommendationSummary(card)} The review was captured in ${mode} mode via ${bridgeState.toLowerCase()}.`,
    timeline: [
      { step: 'Request', detail: `Card queued for ${mode} review.` },
      { step: 'Room', detail: bridgeState },
      { step: 'Transcript', detail: 'Mentor feedback captured as writeback-ready text.' },
      { step: 'Decision', detail: recommendation === 'merge' ? 'Merge candidate' : 'Keep separate candidate' },
    ],
  };
}

export function getBoardStats(cards) {
  return {
    cards: cards.length,
    locked: cards.filter((card) => card.locked).length,
    reviewed: cards.filter((card) => card.reviewState === 'written-back').length,
    confident: cards.filter((card) => card.confidence >= 0.78).length,
  };
}

export {
  SOURCE_OPTIONS,
  SAMPLE_PASTE,
  normalizeText,
  tokenize,
  titleCase,
};
