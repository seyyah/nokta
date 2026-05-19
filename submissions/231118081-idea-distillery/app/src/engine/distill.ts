import {
  Contradiction,
  DistillationResult,
  DraftSection,
  DraftSectionTitle,
  FragmentCategory,
  IdeaUnit,
  LockedBrief,
  MentorFeedbackWriteback,
  MentorPacket,
  NextDecision,
  NoteFragment,
  OverlapGroup,
  ReadinessReview,
  ResultSource,
  SignalId,
  UndefinedArea,
} from '../types/draft';

export type GamePitchAiDraft = {
  title?: string;
  gameSummary?: string | string[];
  coreLoop?: string[];
  playerFantasy?: string | string[];
  mechanics?: string[];
  scopeBoundary?: string[];
  featureCreepWarnings?: string[];
  contradictions?: Array<{
    topic?: Contradiction['topic'];
    claimA?: string;
    claimB?: string;
    rationale?: string;
    severity?: Contradiction['severity'];
  }>;
  prototypePlan?: string[];
  nextDecisions?: Array<string | NextDecision>;
  recommendedMentor?: string;
  mentorQuestions?: string[];
};

const stopwords = new Set([
  'a',
  'an',
  'and',
  'as',
  'at',
  'be',
  'but',
  'by',
  'for',
  'from',
  'game',
  'has',
  'have',
  'in',
  'into',
  'is',
  'it',
  'its',
  'like',
  'maybe',
  'more',
  'not',
  'of',
  'on',
  'or',
  'should',
  'that',
  'the',
  'this',
  'to',
  'up',
  'very',
  'with',
]);

const synonymRules: Array<[RegExp, string]> = [
  [/\bco-op\b/g, 'multiplayer'],
  [/\bcoop\b/g, 'multiplayer'],
  [/\bmmo\b/g, 'multiplayer online large scope'],
  [/\bopen-world\b/g, 'open world'],
  [/\bbasebuilding\b/g, 'base building'],
  [/\bbossfight\b/g, 'boss fight'],
  [/\bprototype\b/g, 'demo'],
  [/\bvertical slice\b/g, 'demo'],
];

const categoryRules: Array<[FragmentCategory, RegExp[]]> = [
  ['genre', [/\bgenre\b/, /\bcozy\b/, /\bhorror\b/, /\bsurvival\b/, /\bfarming\b/, /\broguelike\b/]],
  ['playerFantasy', [/\bfantasy\b/, /\bfeel\b/, /\bplayer\b/, /\bexperience\b/, /\bvibe\b/]],
  ['coreLoop', [/\bloop\b/, /\bexplore\b/, /\bcollect\b/, /\bupgrade\b/, /\breturn\b/, /\bsurvive\b/]],
  ['mechanic', [/\bcraft\b/, /\bfishing\b/, /\bcombat\b/, /\bboss\b/, /\bpet\b/, /\bbuilding\b/, /\bstealth\b/]],
  ['reference', [/\breference\b/, /\binspired\b/, /\bstardew\b/, /\bdredge\b/, /\bdon.t starve\b/, /\bhades\b/]],
  ['scope', [/\bscope\b/, /\bcut\b/, /\bnot in v1\b/, /\blater\b/, /\btoo big\b/, /\bfeature creep\b/]],
  ['prototype', [/\bdemo\b/, /\bweek\b/, /\bday\b/, /\bmvp\b/, /\bprototype\b/, /\bvertical slice\b/]],
  ['platform', [/\bpc\b/, /\bsteam\b/, /\bmobile\b/, /\bweb\b/, /\bconsole\b/]],
  ['production', [/\bsolo\b/, /\bteam\b/, /\bdeveloper\b/, /\bbudget\b/, /\btime\b/, /\b2d\b/, /\b3d\b/]],
  ['future', [/\bfuture\b/, /\blater\b/, /\beventually\b/, /\bphase 2\b/]],
  ['output', [/\bgdd\b/, /\bbrief\b/, /\bpitch\b/, /\bplan\b/]],
];

const signalRules: Array<[SignalId, RegExp[]]> = [
  ['cozy', [/\bcozy\b/, /\brelaxing\b/, /\bwholesome\b/]],
  ['horror', [/\bhorror\b/, /\bscary\b/, /\bcreepy\b/, /\bdread\b/]],
  ['survival', [/\bsurvival\b/, /\bsurvive\b/, /\bhunger\b/, /\bthirst\b/]],
  ['farming', [/\bfarming\b/, /\bfarm\b/, /\bcrops?\b/]],
  ['exploration', [/\bexplore\b/, /\bexploration\b/, /\bisland\b/, /\bdungeon\b/]],
  ['combat', [/\bcombat\b/, /\bfight\b/, /\battack\b/, /\bweapon\b/]],
  ['noCombat', [/\bno combat\b/, /\bcombat olmasin\b/, /\bcombat olmasin\b/, /\bwithout combat\b/]],
  ['boss', [/\bboss\b/, /\bboss fight\b/]],
  ['multiplayer', [/\bmultiplayer\b/, /\bonline\b/, /\bco-?op\b/, /\bmmo\b/]],
  ['offline', [/\boffline\b/, /\bsingle player\b/, /\bsingle-player\b/]],
  ['soloDev', [/\bsolo\b/, /\bone dev\b/, /\btek kisi\b/, /\btek kiÅŸi\b/, /\bindie\b/]],
  ['shortPrototype', [/\b1 week\b/, /\b2 week\b/, /\bweekend\b/, /\b7 day\b/, /\b14 day\b/, /\bhafta\b/]],
  ['largeScope', [/\bopen world\b/, /\bprocedural\b/, /\bmultiplayer\b/, /\bmmo\b/, /\blive service\b/, /\bbase building\b/]],
  ['pc', [/\bpc\b/, /\bsteam\b/, /\bdesktop\b/]],
  ['mobile', [/\bmobile\b/, /\bios\b/, /\bandroid\b/]],
  ['web', [/\bweb\b/, /\bbrowser\b/]],
  ['crafting', [/\bcraft\b/, /\bcrafting\b/]],
  ['baseBuilding', [/\bbase building\b/, /\bbuild base\b/, /\bsettlement\b/]],
  ['pets', [/\bpet\b/, /\bpets\b/, /\bcompanion\b/]],
  ['openWorld', [/\bopen world\b/]],
  ['procedural', [/\bprocedural\b/, /\bgenerated\b/, /\brandom world\b/]],
  ['story', [/\bstory\b/, /\bnarrative\b/, /\bquest\b/]],
  ['future', [/\blater\b/, /\bfuture\b/, /\beventually\b/, /\bnot now\b/]],
  ['cut', [/\bcut\b/, /\bremove\b/, /\bnot in v1\b/, /\bavoid\b/]],
  ['mentor', [/\bmentor\b/, /\bexpert\b/, /\bproducer\b/, /\bdesigner\b/]],
];

const featureCreepCatalog: Array<{ label: string; pattern: RegExp; warning: string }> = [
  {
    label: 'Online multiplayer',
    pattern: /\bmultiplayer\b|\bco-?op\b|\bonline\b|\bmmo\b/,
    warning: 'Online multiplayer should stay out of the first solo prototype unless it is the only core mechanic.',
  },
  {
    label: 'Open world',
    pattern: /\bopen world\b/,
    warning: 'Open world scope is too large for a first playable slice; use one bounded area instead.',
  },
  {
    label: 'Procedural generation',
    pattern: /\bprocedural\b|\brandom world\b|\bgenerated world\b/,
    warning: 'Procedural systems add design and debugging cost before the core loop is proven.',
  },
  {
    label: 'Base building',
    pattern: /\bbase building\b|\bsettlement\b|\bbuild base\b/,
    warning: 'Base building is a secondary system; cut it unless building is the main loop.',
  },
  {
    label: 'Pet or companion system',
    pattern: /\bpet\b|\bpets\b|\bcompanion\b/,
    warning: 'Pet systems add AI, animation, UI, and balancing work that can wait until after the demo.',
  },
  {
    label: 'Crafting economy',
    pattern: /\bcraft\b|\bcrafting\b|\beconomy\b/,
    warning: 'Crafting can explode into inventory, recipes, and balance work; keep one recipe in the prototype.',
  },
  {
    label: 'Boss encounters',
    pattern: /\bboss\b|\bboss fight\b/,
    warning: 'Boss fights require combat rules, telegraphs, tuning, and content; avoid them if combat is not core.',
  },
  {
    label: 'Quest/story system',
    pattern: /\bquest\b|\bstory system\b|\bnarrative system\b/,
    warning: 'A full quest or story system should be replaced with one scripted playable moment in the first demo.',
  },
];

const canonicalTitles: Record<FragmentCategory, string> = {
  genre: 'Genre Signal',
  playerFantasy: 'Player Fantasy Signal',
  coreLoop: 'Core Loop Signal',
  mechanic: 'Mechanic Signal',
  reference: 'Reference Signal',
  scope: 'Scope Signal',
  prototype: 'Prototype Signal',
  platform: 'Platform Signal',
  production: 'Production Signal',
  future: 'Future Signal',
  output: 'Output Signal',
  unknown: 'General Signal',
};

function splitIntoFragments(input: string) {
  const prepared = input
    .replace(/\r/g, '\n')
    .replace(/[•*]/g, '\n')
    .replace(/->/g, '\n')
    .replace(/\b\d+\.\s/g, '\n')
    .replace(/;/g, '\n');

  return prepared
    .split(/\n+/)
    .flatMap((line) => line.split(/(?<=[.!?])\s+/))
    .map((fragment) =>
      fragment
        .replace(/^[\-\u2013\u2014]+\s*/, '')
        .replace(/\s+/g, ' ')
        .trim()
    )
    .filter((fragment) => fragment.length > 4);
}

function normalizeText(value: string) {
  const normalized = synonymRules.reduce((current, [pattern, replacement]) => {
    return current.replace(pattern, replacement);
  }, value.toLowerCase().normalize('NFKC'));

  return normalized
    .replace(/[“”"]/g, '')
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function keywordTokens(normalized: string) {
  return normalized
    .split(' ')
    .filter((token) => token.length > 2 && !stopwords.has(token));
}

function detectCategory(normalized: string) {
  let winner: FragmentCategory = 'unknown';
  let highestScore = 0;

  categoryRules.forEach(([category, patterns]) => {
    const score = patterns.reduce(
      (total, pattern) => total + (pattern.test(normalized) ? 1 : 0),
      0
    );

    if (score > highestScore) {
      winner = category;
      highestScore = score;
    }
  });

  return winner;
}

function detectSignals(normalized: string) {
  return signalRules.reduce<SignalId[]>((signals, [signal, patterns]) => {
    if (patterns.some((pattern) => pattern.test(normalized))) {
      signals.push(signal);
    }

    return signals;
  }, []);
}

function similarityScore(a: NoteFragment, b: NoteFragment) {
  if (a.normalized === b.normalized) {
    return 1;
  }

  const setA = new Set(a.keywords);
  const setB = new Set(b.keywords);
  const union = new Set([...setA, ...setB]);
  const overlap = [...setA].filter((token) => setB.has(token)).length;
  const jaccard = union.size > 0 ? overlap / union.size : 0;
  const containment =
    a.normalized.includes(b.normalized) || b.normalized.includes(a.normalized)
      ? 0.18
      : 0;
  const categoryBonus = a.category === b.category ? 0.08 : 0;
  const signalBonus = a.signals.some((signal) => b.signals.includes(signal)) ? 0.12 : 0;

  return Math.min(1, jaccard * 0.72 + containment + categoryBonus + signalBonus);
}

function cleanSentence(text: string) {
  const sentence = text.replace(/\s+/g, ' ').trim();
  if (!sentence) {
    return '';
  }

  const capitalized = sentence.charAt(0).toUpperCase() + sentence.slice(1);
  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
}

function buildFragments(input: string): NoteFragment[] {
  return splitIntoFragments(input).map((raw, index) => {
    const normalized = normalizeText(raw);

    return {
      id: `fragment-${index + 1}`,
      raw,
      cleaned: cleanSentence(raw),
      normalized,
      keywords: keywordTokens(normalized),
      category: detectCategory(normalized),
      signals: detectSignals(normalized),
    };
  });
}

function groupFragments(fragments: NoteFragment[]): OverlapGroup[] {
  const groups: OverlapGroup[] = [];
  const used = new Set<string>();

  fragments.forEach((fragment) => {
    if (used.has(fragment.id)) {
      return;
    }

    const related = fragments
      .filter((candidate) => !used.has(candidate.id))
      .map((candidate) => ({
        candidate,
        score: similarityScore(fragment, candidate),
      }))
      .filter(({ score }) => score >= 0.68)
      .sort((left, right) => right.score - left.score);

    related.forEach(({ candidate }) => used.add(candidate.id));

    const canonical = related
      .map(({ candidate }) => candidate)
      .sort((left, right) => right.keywords.length - left.keywords.length)[0];

    groups.push({
      id: `group-${groups.length + 1}`,
      fragmentIds: related.map(({ candidate }) => candidate.id),
      canonicalFragmentId: canonical.id,
      similarity:
        related.reduce((total, entry) => total + entry.score, 0) / related.length,
    });
  });

  return groups;
}

function buildIdeaUnits(groups: OverlapGroup[], fragments: NoteFragment[]): IdeaUnit[] {
  return groups.map((group, index) => {
    const relatedFragments = group.fragmentIds
      .map((fragmentId) => fragments.find((fragment) => fragment.id === fragmentId))
      .filter((fragment): fragment is NoteFragment => Boolean(fragment));
    const canonical =
      relatedFragments.find(
        (fragment) => fragment.id === group.canonicalFragmentId
      ) ?? relatedFragments[0];
    const distinctCategories = new Set(relatedFragments.map((fragment) => fragment.category));

    return {
      id: `idea-${index + 1}`,
      title: `${canonicalTitles[canonical.category]} ${index + 1}`,
      canonicalStatement: canonical.cleaned,
      category: canonical.category,
      fragmentIds: relatedFragments.map((fragment) => fragment.id),
      strength:
        distinctCategories.size >= 2 || relatedFragments.length >= 3
          ? 'strong'
          : relatedFragments.length === 2
            ? 'medium'
            : 'weak',
    };
  });
}

function uniqueById<T extends { id: string }>(items: T[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }

    seen.add(item.id);
    return true;
  });
}

function uniqueStrings(items: string[]) {
  return items
    .map(cleanSentence)
    .filter(Boolean)
    .filter((item, index, list) => list.indexOf(item) === index);
}

function createContradiction(
  id: string,
  topic: Contradiction['topic'],
  left: NoteFragment | undefined,
  right: NoteFragment | undefined,
  rationale: string,
  severity: Contradiction['severity']
) {
  if (!left || !right || left.id === right.id) {
    return null;
  }

  return {
    id,
    topic,
    claimA: left.cleaned,
    claimB: right.cleaned,
    rationale,
    severity,
    fragmentIds: [left.id, right.id],
  } satisfies Contradiction;
}

function findBySignal(fragments: NoteFragment[], signal: SignalId) {
  return fragments.find((fragment) => fragment.signals.includes(signal));
}

function detectContradictions(fragments: NoteFragment[]) {
  const contradictions = [
    createContradiction(
      'contradiction-tone',
      'tone',
      findBySignal(fragments, 'cozy'),
      findBySignal(fragments, 'horror'),
      'The pitch mixes a cozy promise with horror tension; the prototype needs one dominant tone.',
      'medium'
    ),
    createContradiction(
      'contradiction-combat',
      'combat',
      findBySignal(fragments, 'noCombat'),
      findBySignal(fragments, 'boss') ?? findBySignal(fragments, 'combat'),
      'The notes avoid combat but still mention boss or fight content.',
      'high'
    ),
    createContradiction(
      'contradiction-scope',
      'scope',
      findBySignal(fragments, 'soloDev') ?? findBySignal(fragments, 'shortPrototype'),
      findBySignal(fragments, 'largeScope'),
      'The production constraint is small, but the requested systems point to a large game scope.',
      'high'
    ),
    createContradiction(
      'contradiction-multiplayer',
      'multiplayer',
      findBySignal(fragments, 'offline'),
      findBySignal(fragments, 'multiplayer'),
      'The game is framed as offline or single-player while also asking for multiplayer.',
      'medium'
    ),
  ].filter((item): item is Contradiction => Boolean(item));

  return uniqueById(contradictions);
}

function detectFeatureCreep(input: string) {
  const normalized = normalizeText(input);
  return featureCreepCatalog
    .filter((entry) => entry.pattern.test(normalized))
    .map((entry) => entry.warning);
}

function detectUndefinedAreas(
  fragments: NoteFragment[],
  contradictions: Contradiction[]
) {
  const undefinedAreas: UndefinedArea[] = [];

  const hasCoreLoop = fragments.some((fragment) => fragment.category === 'coreLoop');
  const hasFantasy =
    fragments.some((fragment) => fragment.category === 'playerFantasy') ||
    fragments.some((fragment) => fragment.signals.includes('cozy') || fragment.signals.includes('horror'));
  const hasPlatform = fragments.some((fragment) => fragment.category === 'platform');
  const hasPrototype = fragments.some((fragment) => fragment.category === 'prototype');
  const hasScopeBoundary =
    fragments.some((fragment) => fragment.category === 'scope') ||
    fragments.some((fragment) => fragment.signals.includes('cut'));

  if (!hasCoreLoop) {
    undefinedAreas.push({
      id: 'undefined-loop',
      area: 'Core Loop',
      explanation:
        'The notes do not yet name the repeatable play loop: what the player does every minute.',
      severity: 'high',
      fragmentIds: [],
    });
  }

  if (!hasFantasy) {
    undefinedAreas.push({
      id: 'undefined-fantasy',
      area: 'Player Fantasy',
      explanation:
        'The pitch needs one clear player fantasy, such as being a careful explorer, clever survivor, or cozy collector.',
      severity: 'medium',
      fragmentIds: [],
    });
  }

  if (!hasPlatform) {
    undefinedAreas.push({
      id: 'undefined-platform',
      area: 'Target Platform',
      explanation:
        'The notes do not commit to PC, mobile, or web, which makes controls and prototype scope fuzzy.',
      severity: 'medium',
      fragmentIds: [],
    });
  }

  if (!hasPrototype) {
    undefinedAreas.push({
      id: 'undefined-prototype',
      area: 'Prototype Constraint',
      explanation:
        'The prototype timebox is missing; without it, feature cuts are harder to defend.',
      severity: 'medium',
      fragmentIds: [],
    });
  }

  if (!hasScopeBoundary || contradictions.some((entry) => entry.topic === 'scope')) {
    undefinedAreas.push({
      id: 'undefined-scope',
      area: 'Scope Boundary',
      explanation:
        'The first playable build needs a firm cut line between core loop and later wishlist systems.',
      severity: contradictions.some((entry) => entry.topic === 'scope') ? 'high' : 'medium',
      fragmentIds: contradictions
        .filter((entry) => entry.topic === 'scope')
        .flatMap((entry) => entry.fragmentIds),
    });
  }

  return undefinedAreas;
}

function collectStatements(
  ideaUnits: IdeaUnit[],
  categories: FragmentCategory[],
  limit: number
) {
  return ideaUnits
    .filter((unit) => categories.includes(unit.category))
    .sort((left, right) => right.fragmentIds.length - left.fragmentIds.length)
    .slice(0, limit)
    .map((unit) => unit.canonicalStatement);
}

function fallbackStatement(statements: string[], fallback: string) {
  return statements.length > 0 ? statements : [fallback];
}

function hasSignal(fragments: NoteFragment[], signal: SignalId) {
  return fragments.some((fragment) => fragment.signals.includes(signal));
}

function chooseGenreDirection(fragments: NoteFragment[]) {
  const parts: string[] = [];
  if (hasSignal(fragments, 'cozy')) {
    parts.push('cozy');
  }
  if (hasSignal(fragments, 'horror')) {
    parts.push('horror');
  }
  if (hasSignal(fragments, 'survival')) {
    parts.push('survival');
  }
  if (hasSignal(fragments, 'farming')) {
    parts.push('farming');
  }
  if (hasSignal(fragments, 'exploration')) {
    parts.push('exploration');
  }

  return parts.length > 0 ? parts.join(' ') : 'focused indie prototype';
}

function choosePlatform(fragments: NoteFragment[]) {
  if (hasSignal(fragments, 'pc')) {
    return 'PC prototype';
  }
  if (hasSignal(fragments, 'mobile')) {
    return 'mobile prototype';
  }
  if (hasSignal(fragments, 'web')) {
    return 'web prototype';
  }
  return 'platform undecided';
}

function buildTitle(fragments: NoteFragment[]) {
  const direction = chooseGenreDirection(fragments);
  return direction === 'focused indie prototype'
    ? 'Indie Game Pitch Brief'
    : `${direction
        .split(' ')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')} Brief`;
}

function buildSummary(fragments: NoteFragment[], contradictions: Contradiction[]) {
  const genre = chooseGenreDirection(fragments);
  const platform = choosePlatform(fragments);
  const constraint = hasSignal(fragments, 'soloDev')
    ? 'for a solo developer'
    : hasSignal(fragments, 'shortPrototype')
      ? 'for a short prototype window'
      : 'for a constrained indie build';
  const tensionLine =
    contradictions.length > 0
      ? 'The current notes contain design tensions that should be resolved before locking the prototype.'
      : 'The current notes point toward one playable prototype direction.';

  return [
    `This pitch should become a ${genre} ${platform} ${constraint}.`,
    tensionLine,
  ];
}

function buildPrototypePlan(fragments: NoteFragment[], featureCreepWarnings: string[]) {
  const loopFocus = hasSignal(fragments, 'exploration')
    ? 'Build a tiny playable exploration space with one interactable objective.'
    : 'Build one room-scale playable scene that proves the core interaction.';
  const mechanicFocus = hasSignal(fragments, 'crafting')
    ? 'Add one collect-and-craft interaction, limited to a single recipe.'
    : hasSignal(fragments, 'farming')
      ? 'Add one repeatable resource action and one visible state change.'
      : 'Add one repeatable mechanic that can be tested in under two minutes.';
  const cutLine =
    featureCreepWarnings.length > 0
      ? 'Cut every secondary system that does not support this first loop.'
      : 'Keep the demo to one loop, one space, and one clear finish condition.';

  return [
    loopFocus,
    mechanicFocus,
    'Add a simple fail, success, or completion condition so the prototype can be judged.',
    cutLine,
  ];
}

function buildNextDecisions(
  contradictions: Contradiction[],
  undefinedAreas: UndefinedArea[],
  featureCreepWarnings: string[]
) {
  const decisions: NextDecision[] = [];

  if (contradictions.some((entry) => entry.topic === 'tone')) {
    decisions.push({
      id: 'decision-genre',
      question: 'What is the dominant tone for the first prototype?',
      recommendation:
        'Pick one lead tone and let the other become flavor, not a second design direction.',
      options: ['Cozy exploration first', 'Survival horror first', 'Quiet mystery first'],
      priority: 'Now',
    });
  }

  if (undefinedAreas.some((entry) => entry.area === 'Core Loop')) {
    decisions.push({
      id: 'decision-loop',
      question: 'What is the single repeatable core loop?',
      recommendation:
        'Use a four-beat loop that can be played repeatedly in the prototype.',
      options: ['Explore -> collect -> upgrade -> return', 'Talk -> choose -> consequence -> reflect', 'Gather -> craft -> survive -> expand'],
      priority: 'Now',
    });
  }

  if (contradictions.some((entry) => entry.topic === 'combat')) {
    decisions.push({
      id: 'decision-combat',
      question: 'How should combat work in v1?',
      recommendation:
        'Avoid boss fights unless combat is the main prototype promise.',
      options: ['No combat in v1', 'One light encounter', 'Boss prototype only'],
      priority: 'Now',
    });
  }

  if (
    contradictions.some((entry) => entry.topic === 'multiplayer') ||
    featureCreepWarnings.some((warning) => warning.includes('multiplayer'))
  ) {
    decisions.push({
      id: 'decision-multiplayer',
      question: 'Should multiplayer exist in the first prototype?',
      recommendation:
        'Keep multiplayer out of v1 unless the whole idea fails without it.',
      options: ['Single-player v1', 'Local co-op later', 'Online multiplayer later'],
      priority: 'Now',
    });
  }

  if (undefinedAreas.some((entry) => entry.area === 'Target Platform')) {
    decisions.push({
      id: 'decision-platform',
      question: 'Which platform is the prototype targeting first?',
      recommendation:
        'Choose one platform so input design and prototype scope stay consistent.',
      options: ['PC prototype', 'Mobile prototype', 'Web prototype'],
      priority: 'Soon',
    });
  }

  if (undefinedAreas.some((entry) => entry.area === 'Prototype Constraint')) {
    decisions.push({
      id: 'decision-scope',
      question: 'What is the prototype timebox?',
      recommendation:
        'Choose a short timebox and cut features until it feels realistic.',
      options: ['Weekend build', 'Two-week prototype', 'One-month vertical slice'],
      priority: 'Soon',
    });
  }

  if (decisions.length === 0) {
    decisions.push({
      id: 'decision-scope',
      question: 'What should be cut from the first playable build?',
      recommendation:
        'Lock the prototype around one loop and move secondary systems into later milestones.',
      options: ['Cut multiplayer', 'Cut base building', 'Cut boss fights'],
      priority: 'Soon',
    });
  }

  return decisions;
}

function buildReadiness(input: {
  contradictions: Contradiction[];
  undefinedAreas: UndefinedArea[];
  nextDecisions: NextDecision[];
  featureCreepWarnings: string[];
  fragments: NoteFragment[];
}): ReadinessReview {
  let score = 100;
  const rationale: string[] = [];
  const highContradictions = input.contradictions.filter(
    (entry) => entry.severity === 'high'
  ).length;

  score -= highContradictions * 18;
  score -= (input.contradictions.length - highContradictions) * 10;
  score -= input.undefinedAreas.filter((area) => area.severity === 'high').length * 14;
  score -= input.undefinedAreas.filter((area) => area.severity !== 'high').length * 8;
  score -= Math.min(30, input.featureCreepWarnings.length * 7);

  if (hasSignal(input.fragments, 'soloDev')) {
    rationale.push('Solo developer constraint detected.');
  }
  if (hasSignal(input.fragments, 'shortPrototype')) {
    rationale.push('Short prototype timebox detected.');
  }
  if (input.featureCreepWarnings.length > 0) {
    rationale.push(`${input.featureCreepWarnings.length} feature creep risk(s) detected.`);
  }
  if (input.contradictions.length > 0) {
    rationale.push(`${input.contradictions.length} game design tension(s) need review.`);
  }
  if (input.undefinedAreas.length > 0) {
    rationale.push(`${input.undefinedAreas.length} missing area(s) weaken the pitch.`);
  }
  if (rationale.length === 0) {
    rationale.push('The pitch has a clear direction and a manageable prototype surface.');
  }

  const boundedScore = Math.max(0, Math.min(100, score));

  if (boundedScore < 50 || highContradictions > 0) {
    return {
      score: boundedScore,
      mode: 'HITL',
      status: 'Mentor Required',
      rationale,
    };
  }

  if (boundedScore < 78 || input.featureCreepWarnings.length >= 2) {
    return {
      score: boundedScore,
      mode: 'HOTL',
      status: 'Mentor Recommended',
      rationale,
    };
  }

  return {
    score: boundedScore,
    mode: 'HOOTL',
    status: 'Buildable Prototype',
    rationale,
  };
}

function buildMentorPacket(input: {
  title: string;
  summary: string[];
  contradictions: Contradiction[];
  undefinedAreas: UndefinedArea[];
  featureCreepWarnings: string[];
  nextDecisions: NextDecision[];
}): MentorPacket {
  const needsTechnicalProducer =
    input.featureCreepWarnings.length >= 2 ||
    input.contradictions.some((entry) => entry.topic === 'scope' || entry.topic === 'production');
  const recommendedMentor = needsTechnicalProducer
    ? 'Game designer / technical producer'
    : 'Game designer mentor';
  const topRisk =
    input.contradictions[0]?.rationale ??
    input.featureCreepWarnings[0] ??
    input.undefinedAreas[0]?.explanation ??
    'The pitch is mostly stable, but a mentor can still sharpen the playable slice.';
  const questions = input.nextDecisions.slice(0, 3).map((decision) => decision.question);

  while (questions.length < 3) {
    const fallbackQuestions = [
      'What should be the single playable core loop?',
      'Which mechanic must be cut from the first prototype?',
      'What would make the first two-minute demo feel complete?',
    ];
    const next = fallbackQuestions.find((question) => !questions.includes(question));
    if (!next) {
      break;
    }
    questions.push(next);
  }

  return {
    recommendedMentor,
    topic: input.title,
    why: uniqueStrings([
      topRisk,
      ...input.featureCreepWarnings.slice(0, 2),
      ...input.undefinedAreas.slice(0, 1).map((area) => area.explanation),
    ]),
    questions,
  };
}

function buildSections(input: {
  fragments: NoteFragment[];
  ideaUnits: IdeaUnit[];
  contradictions: Contradiction[];
  undefinedAreas: UndefinedArea[];
  featureCreepWarnings: string[];
  nextDecisions: NextDecision[];
  aiDraft?: GamePitchAiDraft;
}) {
  const summary = toList(input.aiDraft?.gameSummary);
  const fantasy = toList(input.aiDraft?.playerFantasy);
  const sections: DraftSection[] = [
    {
      title: 'Game Summary',
      items:
        summary.length > 0
          ? uniqueStrings(summary)
          : buildSummary(input.fragments, input.contradictions),
    },
    {
      title: 'Core Loop',
      items: fallbackStatement(
        uniqueStrings([
          ...(input.aiDraft?.coreLoop ?? []),
          ...collectStatements(input.ideaUnits, ['coreLoop'], 4),
        ]),
        'The prototype should prove one repeatable loop before adding secondary systems.'
      ),
    },
    {
      title: 'Player Fantasy',
      items:
        fantasy.length > 0
          ? uniqueStrings(fantasy)
          : fallbackStatement(
              collectStatements(input.ideaUnits, ['playerFantasy', 'genre'], 3),
              'The player fantasy still needs one clear sentence: who the player becomes and why it feels compelling.'
            ),
    },
    {
      title: 'Core Mechanics',
      items: fallbackStatement(
        uniqueStrings([
          ...(input.aiDraft?.mechanics ?? []),
          ...collectStatements(input.ideaUnits, ['mechanic', 'coreLoop'], 5),
        ]),
        'Keep the first prototype to one movement verb, one interaction verb, and one feedback loop.'
      ),
    },
    {
      title: 'Scope Boundary',
      items: fallbackStatement(
        uniqueStrings([
          ...(input.aiDraft?.scopeBoundary ?? []),
          ...collectStatements(input.ideaUnits, ['scope', 'prototype', 'production', 'future'], 5),
          ...input.undefinedAreas
            .filter((area) => area.area === 'Scope Boundary')
            .map((area) => area.explanation),
        ]),
        'The first build should be one scene, one loop, and one visible success condition.'
      ),
    },
    {
      title: 'Feature Creep Warnings',
      items:
        input.featureCreepWarnings.length > 0
          ? uniqueStrings(input.featureCreepWarnings)
          : ['No major feature creep signal was detected from the current notes.'],
    },
    {
      title: 'Prototype Plan',
      items:
        input.aiDraft?.prototypePlan && input.aiDraft.prototypePlan.length > 0
          ? uniqueStrings(input.aiDraft.prototypePlan)
          : buildPrototypePlan(input.fragments, input.featureCreepWarnings),
    },
  ];

  return sections;
}

function buildRefinements(sections: DraftSection[], featureCreepWarnings: string[]) {
  const summarySection = sections.find((section) => section.title === 'Game Summary');
  const mechanicSection = sections.find((section) => section.title === 'Core Mechanics');

  return {
    sharpenedSummary:
      summarySection?.items[0] ??
      'This game pitch needs one clearer prototype promise before it becomes buildable.',
    focusedFeatures: (mechanicSection?.items ?? []).slice(0, 3),
    scopeBoundary:
      featureCreepWarnings.length > 0
        ? 'Lock v1 to one playable loop and explicitly move feature-creep systems into later milestones.'
        : 'Lock v1 to one playable loop, one bounded space, and one completion condition.',
  };
}

function buildFinalBrief(
  result: DistillationResult,
  selections: Record<string, string>,
  feedback?: MentorFeedbackWriteback
) {
  const genre =
    selections['decision-genre'] ?? result.sections.find((section) => section.title === 'Game Summary')?.items[0] ?? 'Focused indie prototype';
  const platform = selections['decision-platform'] ?? choosePlatform(result.fragments);
  const combat = selections['decision-combat'] ?? 'No combat in v1';
  const multiplayer = selections['decision-multiplayer'] ?? 'Single-player v1';
  const scope = selections['decision-scope'] ?? 'Two-week prototype';
  const loop =
    selections['decision-loop'] ??
    result.sections.find((section) => section.title === 'Core Loop')?.items[0] ??
    'one repeatable core loop';

  const directionItems = [
    cleanSentence(`Ship the prototype as ${genre}`),
    cleanSentence(`Core loop: ${loop}`),
    cleanSentence(`Target platform: ${platform}`),
  ];

  const featureFocus = [
    cleanSentence(`Combat direction: ${combat}`),
    cleanSentence(`Multiplayer direction: ${multiplayer}`),
    cleanSentence(`Prototype timebox: ${scope}`),
  ];

  const boundaryItems = uniqueStrings([
    result.refinements.scopeBoundary,
    ...result.featureCreepWarnings.slice(0, 3),
    ...(feedback?.newConstraints ?? []),
  ]);

  const changeLog = Object.entries(selections).map(([decisionId, value]) =>
    cleanSentence(`${decisionId.replace('decision-', '')} locked to ${value}`)
  );

  if (feedback) {
    changeLog.push(cleanSentence(`Mentor feedback applied: ${feedback.summary}`));
  }

  if (changeLog.length === 0) {
    changeLog.push(
      'No decisions are locked yet. Resolve at least one game decision or add mentor feedback to tighten the brief.'
    );
  }

  return {
    title:
      Object.keys(selections).length >= 3 || feedback
        ? 'Final GDD-lite Brief'
        : 'Partial Game Pitch Brief',
    lockedSummary: cleanSentence(
      `Nokta Game Pitch should focus this idea into ${platform.toLowerCase()} with ${loop.toLowerCase()}. ${combat} and ${multiplayer.toLowerCase()} keep the first build manageable.`
    ),
    directionItems,
    featureFocus,
    boundaryItems,
    changeLog,
    resolvedCount: Object.keys(selections).length,
    totalDecisionCount: result.nextDecisions.length,
    unresolvedQuestions: result.nextDecisions
      .filter((decision) => !selections[decision.id])
      .map((decision) => decision.question),
    mentorFeedback: feedback,
    labels: {
      genreDirection: genre,
      prototypePlatform: platform,
      combatDirection: combat,
      multiplayerDirection: multiplayer,
      scopeMetric: scope,
    },
  } satisfies LockedBrief;
}

function buildResult(input: string, source: ResultSource, aiDraft?: GamePitchAiDraft): DistillationResult {
  const fragments = buildFragments(input);
  const groups = groupFragments(fragments);
  const ideaUnits = buildIdeaUnits(groups, fragments);
  const localContradictions = detectContradictions(fragments);
  const aiContradictions = normalizeAiContradictions(aiDraft?.contradictions);
  const contradictions = uniqueById([...localContradictions, ...aiContradictions]);
  const featureCreepWarnings = uniqueStrings([
    ...detectFeatureCreep(input),
    ...(aiDraft?.featureCreepWarnings ?? []),
  ]);
  const undefinedAreas = detectUndefinedAreas(fragments, contradictions);
  const nextDecisions = mergeNextDecisions(
    buildNextDecisions(contradictions, undefinedAreas, featureCreepWarnings),
    aiDraft?.nextDecisions
  );
  const sections = buildSections({
    fragments,
    ideaUnits,
    contradictions,
    undefinedAreas,
    featureCreepWarnings,
    nextDecisions,
    aiDraft,
  });
  const title = aiDraft?.title ? cleanSentence(aiDraft.title).replace(/[.]$/, '') : buildTitle(fragments);
  const readiness = buildReadiness({
    contradictions,
    undefinedAreas,
    nextDecisions,
    featureCreepWarnings,
    fragments,
  });
  const mentorPacket = buildMentorPacket({
    title,
    summary: sections.find((section) => section.title === 'Game Summary')?.items ?? [],
    contradictions,
    undefinedAreas,
    featureCreepWarnings,
    nextDecisions,
  });

  return {
    title,
    sections,
    contradictions,
    undefinedAreas,
    nextDecisions,
    fragments,
    ideaUnits,
    featureCreepWarnings,
    readiness,
    mentorPacket: aiDraft?.recommendedMentor || aiDraft?.mentorQuestions?.length
      ? {
          recommendedMentor: aiDraft.recommendedMentor ?? mentorPacket.recommendedMentor,
          topic: mentorPacket.topic,
          why: mentorPacket.why,
          questions:
            aiDraft.mentorQuestions && aiDraft.mentorQuestions.length > 0
              ? uniqueStrings(aiDraft.mentorQuestions).slice(0, 3)
              : mentorPacket.questions,
        }
      : mentorPacket,
    source,
    metrics: {
      fragmentCount: fragments.length,
      duplicatesCollapsed: Math.max(0, fragments.length - groups.length),
      ideaUnitCount: ideaUnits.length,
      featureCreepCount: featureCreepWarnings.length,
    },
    refinements: buildRefinements(sections, featureCreepWarnings),
  };
}

function toList(value: string | string[] | undefined) {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function normalizeAiContradictions(
  contradictions: GamePitchAiDraft['contradictions']
): Contradiction[] {
  return (contradictions ?? [])
    .filter((entry) => entry.claimA && entry.claimB)
    .map((entry, index) => ({
      id: `ai-contradiction-${index + 1}`,
      topic: entry.topic ?? 'scope',
      claimA: cleanSentence(entry.claimA ?? ''),
      claimB: cleanSentence(entry.claimB ?? ''),
      rationale: cleanSentence(entry.rationale ?? 'The AI analysis found a game design tension.'),
      severity: entry.severity ?? 'medium',
      fragmentIds: [],
    }));
}

function mergeNextDecisions(
  localDecisions: NextDecision[],
  aiDecisions: GamePitchAiDraft['nextDecisions']
) {
  const normalizedAi = (aiDecisions ?? []).map((entry, index): NextDecision => {
    if (typeof entry === 'string') {
      return {
        id: `ai-decision-${index + 1}`,
        question: cleanSentence(entry),
        recommendation: 'Resolve this before calling the prototype brief stable.',
        options: ['Lock for v1', 'Move to later', 'Ask mentor'],
        priority: index === 0 ? 'Now' : 'Soon',
      };
    }

    return {
      id: entry.id ?? `ai-decision-${index + 1}`,
      question: entry.question,
      recommendation: entry.recommendation,
      options: entry.options,
      priority: entry.priority,
    };
  });

  return uniqueById([...localDecisions, ...normalizedAi]).slice(0, 6);
}

function extractFeedbackLines(feedback: string) {
  return splitIntoFragments(feedback)
    .map(cleanSentence)
    .filter(Boolean);
}

export function buildMentorFeedbackWriteback(
  feedback: string
): MentorFeedbackWriteback {
  const lines = extractFeedbackLines(feedback);
  const acceptedDecisions = lines.filter((line) =>
    /\bkeep\b|\bconfirm\b|\bshould\b|\bfocus\b|\bstay\b|\block\b|\bonay\b|\bkalsin\b/i.test(line)
  );
  const rejectedAssumptions = lines.filter((line) =>
    /\bcut\b|\bremove\b|\bnot\b|\bavoid\b|\bwait\b|\blater\b|\bskip\b|\bexclude\b/i.test(line)
  );
  const newConstraints = lines.filter((line) =>
    /\bconstraint\b|\blimit\b|\btimebox\b|\bsolo\b|\btwo-week\b|\bweekend\b|\bscope\b/i.test(line)
  );
  const nextActions = lines.filter((line) =>
    /\bbuild\b|\bprototype\b|\btest\b|\bcreate\b|\bimplement\b|\bnext\b|\bstart\b/i.test(line)
  );

  return {
    summary:
      lines[0] ??
      'Mentor feedback was added, but it needs clearer decisions before it can strongly change the brief.',
    acceptedDecisions:
      acceptedDecisions.length > 0
        ? uniqueStrings(acceptedDecisions).slice(0, 4)
        : ['No explicit accepted decision was detected in the mentor feedback.'],
    rejectedAssumptions:
      rejectedAssumptions.length > 0
        ? uniqueStrings(rejectedAssumptions).slice(0, 4)
        : ['No explicit rejected assumption was detected in the mentor feedback.'],
    newConstraints:
      newConstraints.length > 0
        ? uniqueStrings(newConstraints).slice(0, 4)
        : ['No new production constraint was detected in the mentor feedback.'],
    nextActions:
      nextActions.length > 0
        ? uniqueStrings(nextActions).slice(0, 4)
        : ['Turn the strongest mentor note into one prototype task.'],
  };
}

export function distill(input: string): DistillationResult {
  return buildResult(input, 'local');
}

export function distillFromGamePitchDraft(
  input: string,
  aiDraft: GamePitchAiDraft
): DistillationResult {
  return buildResult(input, 'groq', aiDraft);
}

export function buildLockedBrief(
  result: DistillationResult,
  selections: Record<string, string>,
  feedback?: MentorFeedbackWriteback
): LockedBrief {
  return buildFinalBrief(result, selections, feedback);
}
