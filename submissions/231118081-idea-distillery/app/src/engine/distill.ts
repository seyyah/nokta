import {
  Contradiction,
  DistillationResult,
  DraftSection,
  FragmentCategory,
  IdeaUnit,
  LockedBrief,
  NextDecision,
  NoteFragment,
  OverlapGroup,
  SignalId,
  UndefinedArea,
} from '../types/draft';

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
  'get',
  'has',
  'have',
  'if',
  'in',
  'into',
  'is',
  'it',
  'its',
  'just',
  'later',
  'like',
  'mainly',
  'make',
  'maybe',
  'more',
  'not',
  'now',
  'of',
  'on',
  'or',
  'out',
  'should',
  'that',
  'the',
  'their',
  'this',
  'to',
  'up',
  'very',
  'where',
  'with',
  'would',
]);

const synonymRules: Array<[RegExp, string]> = [
  [/\bde-dup\b/g, 'deduplicate'],
  [/\bdedup(?:licate)?\b/g, 'deduplicate'],
  [/\bremove duplicates?\b/g, 'deduplicate'],
  [/\bmessy dump\b/g, 'messy notes'],
  [/\bnote dump\b/g, 'notes'],
  [/\bdecision-ready\b/g, 'decision ready'],
  [/\bfollow up\b/g, 'follow-up'],
];

const categoryRules: Array<[FragmentCategory, RegExp[]]> = [
  [
    'problem',
    [/\bproblem\b/, /\bmessy\b/, /\bunclear\b/, /\bchaotic\b/, /\bweak\b/],
  ],
  ['intent', [/\bshould\b/, /\bneed to\b/, /\bhelp\b/, /\bwant\b/]],
  [
    'direction',
    [/\bconcept\b/, /\bdirection\b/, /\bdecision ready\b/, /\bstronger\b/, /\bserious\b/],
  ],
  [
    'feature',
    [/\bdeduplicate\b/, /\bproduce\b/, /\bgenerate\b/, /\bsurface\b/, /\brefine\b/],
  ],
  [
    'constraint',
    [/\bno live ai\b/, /\boffline\b/, /\bdeterministic\b/, /\bnot now\b/, /\bv1\b/],
  ],
  ['workflow', [/\bpaste\b/, /\bquestions first\b/, /\bresult screen\b/, /\binput\b/]],
  ['audience', [/\buser\b/, /\bfounder\b/, /\bteam\b/, /\baudience\b/]],
  ['boundary', [/\bavoid\b/, /\bnot like\b/, /\bdon.t\b/, /\bkeep it\b/]],
  ['future', [/\blater\b/, /\bfuture\b/, /\beventually\b/, /\bphase 2\b/]],
  ['output', [/\bdraft\b/, /\bcards\b/, /\bartifact\b/, /\bresult\b/]],
];

const signalRules: Array<[SignalId, RegExp[]]> = [
  ['simple', [/\bsimple\b/, /\bminimal\b/, /\bmvp\b/, /\blean\b/]],
  ['advanced', [/\badvanced\b/, /\bworkspace\b/, /\bsuite\b/, /\bplatform\b/]],
  ['summarizer', [/\bsummarizer\b/, /\bsummary\b/, /\bsummaries\b/]],
  ['conceptTool', [/\bconcept distillation\b/, /\bconcept draft\b/, /\bdecision ready\b/, /\bstronger than\b/]],
  ['cardsOutput', [/\bidea cards\b/, /\bcards\b/]],
  ['draftOutput', [/\bdraft\b/, /\bstructured concept\b/, /\bartifact\b/]],
  ['pasteFlow', [/\bpaste\b/, /\bpastes\b/, /\bpaste once\b/]],
  ['guidedFlow', [/\bfollow-up\b/, /\bquestions first\b/, /\basks lots of\b/]],
  ['offline', [/\boffline\b/, /\bdeterministic\b/, /\bno live ai\b/, /\blocal\b/]],
  ['ai', [/\bai\b/, /\bllm\b/, /\bgenerative\b/]],
  ['soloAudience', [/\bsolo founder\b/, /\bfounders\b/, /\bindie\b/]],
  ['teamAudience', [/\bteam\b/, /\bproduct teams?\b/, /\binternal teams?\b/]],
  ['future', [/\blater\b/, /\bfuture\b/, /\bnot now\b/, /\beventually\b/]],
  ['tightScope', [/\bavoid\b/, /\bkeep it\b/, /\bone flow\b/, /\btrack c\b/]],
  ['broadScope', [/\bworkspace\b/, /\bproject management\b/, /\bproductivity suite\b/]],
  ['review', [/\brefine\b/, /\bmark decision\b/, /\breview\b/]],
];

const canonicalTitles: Record<FragmentCategory, string> = {
  problem: 'Problem Signal',
  intent: 'Intent Signal',
  direction: 'Direction Signal',
  feature: 'Feature Signal',
  constraint: 'Constraint Signal',
  workflow: 'Workflow Signal',
  audience: 'Audience Signal',
  boundary: 'Boundary Signal',
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
      'contradiction-scope',
      'scope',
      findBySignal(fragments, 'simple'),
      findBySignal(fragments, 'advanced'),
      'The notes want a minimal first version but also hint at a broader advanced workspace.',
      'high'
    ),
    createContradiction(
      'contradiction-positioning',
      'positioning',
      findBySignal(fragments, 'summarizer'),
      findBySignal(fragments, 'conceptTool'),
      'The concept is framed both as a plain summarizer and as a stronger concept-distillation tool.',
      'high'
    ),
    createContradiction(
      'contradiction-workflow',
      'workflow',
      findBySignal(fragments, 'pasteFlow'),
      findBySignal(fragments, 'guidedFlow'),
      'The workflow switches between instant paste-and-distill and a question-first flow.',
      'medium'
    ),
    createContradiction(
      'contradiction-output',
      'output',
      findBySignal(fragments, 'cardsOutput'),
      findBySignal(fragments, 'draftOutput'),
      'The output is described both as idea cards and as a decision-ready draft.',
      'medium'
    ),
    createContradiction(
      'contradiction-audience',
      'audience',
      findBySignal(fragments, 'soloAudience'),
      findBySignal(fragments, 'teamAudience'),
      'The primary user is not fixed between solo founders and small teams.',
      'medium'
    ),
  ].filter((item): item is Contradiction => Boolean(item));

  return uniqueById(contradictions);
}

function detectUndefinedAreas(
  fragments: NoteFragment[],
  contradictions: Contradiction[]
) {
  const undefinedAreas: UndefinedArea[] = [];

  const hasAudience = fragments.some((fragment) => fragment.category === 'audience');
  const hasWorkflow = fragments.some((fragment) => fragment.category === 'workflow');
  const hasOutput = fragments.some((fragment) => fragment.category === 'output');
  const hasMetric = fragments.some((fragment) =>
    /\bmetric\b|\bsuccess\b|\btime saved\b|\bquality\b/.test(fragment.normalized)
  );

  if (!hasAudience || contradictions.some((entry) => entry.topic === 'audience')) {
    undefinedAreas.push({
      id: 'undefined-user',
      area: 'Target User',
      explanation:
        'The notes imply multiple audiences, but the primary user is still not committed.',
      severity: 'high',
      fragmentIds: fragments
        .filter((fragment) =>
          fragment.signals.includes('soloAudience') ||
          fragment.signals.includes('teamAudience')
        )
        .map((fragment) => fragment.id),
    });
  }

  if (!hasWorkflow || contradictions.some((entry) => entry.topic === 'workflow')) {
    undefinedAreas.push({
      id: 'undefined-workflow',
      area: 'Workflow',
      explanation:
        'It is still unclear whether v1 should be paste-first only or include a guided clarification step.',
      severity: 'medium',
      fragmentIds: fragments
        .filter((fragment) =>
          fragment.signals.includes('pasteFlow') ||
          fragment.signals.includes('guidedFlow')
        )
        .map((fragment) => fragment.id),
    });
  }

  if (!hasOutput || contradictions.some((entry) => entry.topic === 'output')) {
    undefinedAreas.push({
      id: 'undefined-output',
      area: 'Output Contract',
      explanation:
        'The final artifact is mostly draft-oriented, but the role of idea cards versus the final draft still needs one explicit rule.',
      severity: 'medium',
      fragmentIds: fragments
        .filter((fragment) =>
          fragment.signals.includes('cardsOutput') ||
          fragment.signals.includes('draftOutput')
        )
        .map((fragment) => fragment.id),
    });
  }

  if (!hasMetric) {
    undefinedAreas.push({
      id: 'undefined-metric',
      area: 'Success Metric',
      explanation:
        'The notes do not say what makes the draft successful: clearer scope, fewer duplicates, or faster decisions.',
      severity: 'medium',
      fragmentIds: [],
    });
  }

  if (contradictions.some((entry) => entry.topic === 'scope')) {
    undefinedAreas.push({
      id: 'undefined-scope',
      area: 'Scope Boundary',
      explanation:
        'The v1 boundary still needs a clear line between the essential flow and the later workspace ideas.',
      severity: 'high',
      fragmentIds: contradictions
        .filter((entry) => entry.topic === 'scope')
        .flatMap((entry) => entry.fragmentIds),
    });
  }

  return undefinedAreas;
}

function chooseAudience(fragments: NoteFragment[]) {
  const audienceParts: string[] = [];

  if (fragments.some((fragment) => fragment.signals.includes('soloAudience'))) {
    audienceParts.push('solo founders');
  }

  if (fragments.some((fragment) => fragment.signals.includes('teamAudience'))) {
    audienceParts.push('small product teams');
  }

  if (audienceParts.length === 0) {
    return 'an as-yet undefined project owner';
  }

  if (audienceParts.length === 1) {
    return audienceParts[0];
  }

  return `${audienceParts[0]} and ${audienceParts[1]}`;
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

function buildTitle(fragments: NoteFragment[]) {
  if (fragments.some((fragment) => fragment.signals.includes('conceptTool'))) {
    return 'Concept Distillation Draft';
  }

  if (fragments.some((fragment) => fragment.signals.includes('draftOutput'))) {
    return 'Structured Concept Draft';
  }

  return 'Distilled Project Concept';
}

function buildSummary(fragments: NoteFragment[], contradictions: Contradiction[]) {
  const audience = chooseAudience(fragments);
  const outcome = fragments.some((fragment) => fragment.signals.includes('draftOutput'))
    ? 'a structured concept draft'
    : 'a cleaner concept direction';
  const method = fragments.some((fragment) => fragment.signals.includes('offline'))
    ? 'through deterministic local distillation'
    : 'through overlap cleanup and synthesis';
  const tensionLine =
    contradictions.length > 0
      ? 'The current notes still contain tensions that should be resolved before calling the concept stable.'
      : 'The current notes stay mostly aligned around one usable direction.';

  return [
    `This concept turns messy raw notes into ${outcome} for ${audience} ${method}.`,
    tensionLine,
  ];
}

function buildNextDecisions(
  contradictions: Contradiction[],
  undefinedAreas: UndefinedArea[]
) {
  const decisions: NextDecision[] = [];

  if (contradictions.some((entry) => entry.topic === 'positioning')) {
    decisions.push({
      id: 'decision-positioning',
      question: 'Should v1 behave like a summarizer or a stronger concept-distillation tool?',
      recommendation:
        'Commit to concept distillation so the result screen stays draft-first instead of summary-first.',
      options: ['Concept distillation tool', 'Plain summarizer'],
      priority: 'Now',
    });
  }

  if (undefinedAreas.some((entry) => entry.area === 'Target User')) {
    decisions.push({
      id: 'decision-user',
      question: 'Who is the primary v1 user?',
      recommendation:
        'Pick one primary audience so the copy, sample input, and output emphasis stay consistent.',
      options: ['Solo founders', 'Small product teams'],
      priority: 'Now',
    });
  }

  if (undefinedAreas.some((entry) => entry.area === 'Output Contract')) {
    decisions.push({
      id: 'decision-output',
      question: 'What is the main artifact after distillation?',
      recommendation:
        'Treat the structured draft as the primary artifact and keep idea units as internal support.',
      options: ['Structured draft first', 'Idea cards first'],
      priority: 'Now',
    });
  }

  if (undefinedAreas.some((entry) => entry.area === 'Workflow')) {
    decisions.push({
      id: 'decision-workflow',
      question: 'Should the first version be paste-and-distill only?',
      recommendation:
        'Keep v1 to a single paste flow and leave guided questioning for a later version.',
      options: ['Paste and distill only', 'Add guided questions'],
      priority: 'Soon',
    });
  }

  if (undefinedAreas.some((entry) => entry.area === 'Success Metric')) {
    decisions.push({
      id: 'decision-metric',
      question: 'How will you judge whether the draft is better?',
      recommendation:
        'Choose one metric such as clearer scope, fewer repeated claims, or faster decision making.',
      options: ['Clarity gain', 'Duplicate reduction', 'Faster decisions'],
      priority: 'Soon',
    });
  }

  return decisions;
}

function buildSections(
  fragments: NoteFragment[],
  ideaUnits: IdeaUnit[],
  contradictions: Contradiction[],
  undefinedAreas: UndefinedArea[],
  nextDecisions: NextDecision[]
) {
  const sections: DraftSection[] = [];

  sections.push({
    title: 'Concept Summary',
    items: buildSummary(fragments, contradictions),
  });

  sections.push({
    title: 'Problem and Intent',
    items: fallbackStatement(
      collectStatements(ideaUnits, ['problem', 'intent'], 3),
      'The raw notes point to a planning problem, but the exact problem statement still needs stronger language.'
    ),
  });

  sections.push({
    title: 'Core Product Direction',
    items: fallbackStatement(
      collectStatements(ideaUnits, ['direction', 'workflow', 'output'], 4),
      'The strongest direction is to turn messy notes into one clearer concept artifact.'
    ),
  });

  sections.push({
    title: 'Key Features',
    items: fallbackStatement(
      collectStatements(ideaUnits, ['feature', 'workflow', 'output'], 5),
      'Distill overlapping notes into one readable draft with explicit tensions and next decisions.'
    ),
  });

  sections.push({
    title: 'Constraints and Boundaries',
    items: [
      ...fallbackStatement(
        collectStatements(ideaUnits, ['constraint', 'boundary', 'future'], 4),
        'The scope boundary is still light in the notes and should be tightened before expansion.'
      ),
      ...undefinedAreas
        .filter((area) => area.area === 'Scope Boundary')
        .map((area) => area.explanation),
      ...nextDecisions
        .filter((decision) => decision.priority === 'Now')
        .slice(0, 1)
        .map((decision) => decision.recommendation),
    ]
      .map(cleanSentence)
      .filter((item, index, items) => items.indexOf(item) === index),
  });

  sections.push({
    title: 'Contradictions and Tensions',
    items:
      contradictions.length > 0
        ? contradictions.map((entry) => cleanSentence(entry.rationale))
        : ['No direct contradictions were detected in the current notes.'],
  });

  sections.push({
    title: 'Undefined Areas',
    items:
      undefinedAreas.length > 0
        ? undefinedAreas.map((entry) => cleanSentence(entry.explanation))
        : ['No major undefined areas were detected in the current notes.'],
  });

  sections.push({
    title: 'Recommended Next Decisions',
    items:
      nextDecisions.length > 0
        ? nextDecisions.map((entry) => cleanSentence(entry.question))
        : ['No immediate next decisions were generated from the current notes.'],
  });

  return sections;
}

function buildRefinements(sections: DraftSection[], contradictions: Contradiction[]) {
  const summarySection = sections.find((section) => section.title === 'Concept Summary');
  const featureSection = sections.find((section) => section.title === 'Key Features');

  return {
    sharpenedSummary:
      summarySection?.items[0] ??
      'This concept needs one cleaner summary before it becomes decision-ready.',
    focusedFeatures: (featureSection?.items ?? []).slice(0, 3),
    scopeBoundary:
      contradictions.some((entry) => entry.topic === 'scope')
        ? 'Keep v1 centered on paste, distill, review, and decision support. Leave workspace expansion for later.'
        : 'Keep v1 centered on one clean input flow and one section-based result view.',
  };
}

export function distill(input: string): DistillationResult {
  const fragments = buildFragments(input);
  const groups = groupFragments(fragments);
  const ideaUnits = buildIdeaUnits(groups, fragments);
  const contradictions = detectContradictions(fragments);
  const undefinedAreas = detectUndefinedAreas(fragments, contradictions);
  const nextDecisions = buildNextDecisions(contradictions, undefinedAreas);
  const sections = buildSections(
    fragments,
    ideaUnits,
    contradictions,
    undefinedAreas,
    nextDecisions
  );

  return {
    title: buildTitle(fragments),
    sections,
    contradictions,
    undefinedAreas,
    nextDecisions,
    fragments,
    ideaUnits,
    metrics: {
      fragmentCount: fragments.length,
      duplicatesCollapsed: Math.max(0, fragments.length - groups.length),
      ideaUnitCount: ideaUnits.length,
    },
    refinements: buildRefinements(sections, contradictions),
  };
}

function proseForPositioning(option: string) {
  if (option === 'Plain summarizer') {
    return 'a plain summarizer';
  }

  return 'a concept-distillation tool';
}

function proseForArtifact(option: string) {
  if (option === 'Idea cards first') {
    return 'idea units first, with the structured draft following after review';
  }

  return 'a structured concept draft as the first artifact';
}

function proseForWorkflow(option: string) {
  if (option === 'Add guided questions') {
    return 'paste rough notes first, then answer a short guided clarification pass';
  }

  return 'paste rough notes once and get a distilled result without extra questioning';
}

function proseForMetric(option: string) {
  if (option === 'Duplicate reduction') {
    return 'how much repetition and overlap disappear from the input';
  }

  if (option === 'Faster decisions') {
    return 'how quickly the user can move from messy notes to project decisions';
  }

  return 'how much clearer and more decision-ready the concept becomes';
}

export function buildLockedBrief(
  result: DistillationResult,
  selections: Record<string, string>
): LockedBrief {
  const positioning =
    selections['decision-positioning'] ?? 'Concept distillation tool';
  const primaryUser =
    selections['decision-user'] ?? chooseAudience(result.fragments);
  const mainArtifact =
    selections['decision-output'] ?? 'Structured draft first';
  const workflow =
    selections['decision-workflow'] ?? 'Paste and distill only';
  const successMetric =
    selections['decision-metric'] ?? 'Clarity gain';

  const unresolvedQuestions = result.nextDecisions
    .filter((decision) => !selections[decision.id])
    .map((decision) => decision.question);

  const changeLog: string[] = [];

  if (selections['decision-positioning']) {
    changeLog.push(`Positioning locked to ${positioning.toLowerCase()}.`);
  }

  if (selections['decision-user']) {
    changeLog.push(`Primary audience narrowed to ${primaryUser.toLowerCase()}.`);
  }

  if (selections['decision-output']) {
    changeLog.push(`Main artifact locked to ${mainArtifact.toLowerCase()}.`);
  }

  if (selections['decision-workflow']) {
    changeLog.push(`Workflow locked to ${workflow.toLowerCase()}.`);
  }

  if (selections['decision-metric']) {
    changeLog.push(`Success metric locked to ${successMetric.toLowerCase()}.`);
  }

  if (changeLog.length === 0) {
    changeLog.push(
      'No decisions are locked yet. Resolve at least one decision to tighten the draft into a handoff-ready brief.'
    );
  }

  const directionItems = [
    cleanSentence(
      `Ship Nokta Draft as ${proseForPositioning(positioning)}, not as a generic workspace or chat assistant`
    ),
    cleanSentence(`Primary v1 user: ${primaryUser}`),
    cleanSentence(`Treat ${proseForArtifact(mainArtifact)}.`),
  ];

  const featureFocus = [
    cleanSentence(
      mainArtifact === 'Idea cards first'
        ? 'Expose idea units first, then roll them up into the final draft after review'
        : 'Generate the structured concept draft first and keep idea units as internal support'
    ),
    cleanSentence(
      workflow === 'Add guided questions'
        ? 'Keep the clarification step short and attached to the pasted note dump'
        : 'Keep the core flow to one paste-first action and one result screen'
    ),
    cleanSentence(`Judge the result by ${proseForMetric(successMetric)}.`),
  ];

  const boundaryItems = [
    cleanSentence(
      workflow === 'Add guided questions'
        ? 'Do not let guided clarification turn into an open-ended chatbot workflow'
        : 'Do not require an interview step before the first useful result appears'
    ),
    cleanSentence(
      mainArtifact === 'Idea cards first'
        ? 'Avoid card explosion by keeping the cards limited and rolling them into one final draft'
        : 'Avoid making the draft feel secondary to cards or internal fragments'
    ),
  ];

  return {
    title:
      Object.keys(selections).length >= 3
        ? 'Decision-Locked Handoff Brief'
        : 'Partial Decision-Locked Brief',
    lockedSummary: cleanSentence(
      `Nokta Draft should ship as ${proseForPositioning(positioning)} for ${primaryUser.toLowerCase()}, using a workflow where users ${proseForWorkflow(workflow)} and receive ${proseForArtifact(mainArtifact)}. Success should be measured by ${proseForMetric(successMetric)}`
    ),
    directionItems,
    featureFocus,
    boundaryItems,
    changeLog: changeLog.map(cleanSentence),
    resolvedCount: Object.keys(selections).length,
    totalDecisionCount: result.nextDecisions.length,
    unresolvedQuestions,
    labels: {
      positioning,
      primaryUser,
      mainArtifact,
      workflow,
      successMetric,
    },
  };
}
