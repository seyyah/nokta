import { AnalysisResult, CategoryName, CategoryScore, VerdictLabel } from '../../types/analysis';
import {
  BROAD_SCOPE_PATTERNS,
  BUSINESS_MODEL_PATTERNS,
  BUZZWORD_PATTERNS,
  CONSTRAINT_PATTERNS,
  DIFFERENTIATION_PATTERNS,
  EVIDENCE_PATTERNS,
  IMPOSSIBLE_CLAIM_PATTERNS,
  MARKET_CLAIM_PATTERNS,
  SCOPE_LIMITER_PATTERNS,
  TARGET_USER_PATTERNS,
  VALIDATION_PATTERNS
} from './heuristics';

const CATEGORY_WEIGHTS: Record<CategoryName, number> = {
  'Market Claim Risk': 0.2,
  'User Clarity': 0.17,
  Feasibility: 0.2,
  Differentiation: 0.15,
  'Evidence Quality': 0.18,
  'Scope Discipline': 0.1
};

const SUMMARY_ORDER: CategoryName[] = [
  'Market Claim Risk',
  'User Clarity',
  'Feasibility',
  'Differentiation',
  'Evidence Quality',
  'Scope Discipline'
];

function toGlobalRegex(pattern: RegExp): RegExp {
  const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
  return new RegExp(pattern.source, flags);
}

function countPattern(text: string, pattern: RegExp): number {
  const regex = toGlobalRegex(pattern);
  return text.match(regex)?.length ?? 0;
}

function countPatterns(text: string, patterns: RegExp[]): number {
  return patterns.reduce((total, pattern) => total + countPattern(text, pattern), 0);
}

function hasAnyPattern(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function unique(items: string[]): string[] {
  return [...new Set(items)];
}

function splitSentences(text: string): string[] {
  const matches = text.replace(/\s+/g, ' ').match(/[^.!?]+[.!?]?/g);
  return (matches ?? []).map((sentence) => sentence.trim()).filter(Boolean);
}

function scoreToVerdict(score: number): VerdictLabel {
  if (score <= 33) {
    return 'Low Slop';
  }
  if (score <= 66) {
    return 'Medium Slop';
  }
  return 'High Slop';
}

function buildCategory(
  name: CategoryName,
  score: number,
  explanationParts: string[],
  fallback: string
): CategoryScore {
  return {
    name,
    score,
    explanation: explanationParts.length > 0 ? explanationParts.join(' ') : fallback
  };
}

function findSuspiciousClaims(rawText: string): string[] {
  const suspiciousPatterns = [
    ...BUZZWORD_PATTERNS,
    ...MARKET_CLAIM_PATTERNS,
    ...IMPOSSIBLE_CLAIM_PATTERNS,
    ...BROAD_SCOPE_PATTERNS
  ];

  const sentenceCandidates = splitSentences(rawText)
    .filter((sentence) => suspiciousPatterns.some((pattern) => pattern.test(sentence)))
    .map((sentence) => sentence.replace(/\s+/g, ' ').trim())
    .filter((sentence) => sentence.length > 0);

  return unique(sentenceCandidates).slice(0, 6);
}

function buildRewriteSuggestions(params: {
  buzzwordCount: number;
  hasTargetUser: boolean;
  hasBusinessModel: boolean;
  hasDifferentiation: boolean;
  hasValidation: boolean;
  marketClaimCount: number;
  evidenceCount: number;
  impossibleClaimCount: number;
  broadScopeCount: number;
}): string[] {
  const suggestions: string[] = [];

  if (params.buzzwordCount > 0) {
    suggestions.push(
      'Replace abstract hype terms with one concrete workflow: who uses the product, when, and what measurable output changes.'
    );
  }

  if (params.marketClaimCount > 0 && params.evidenceCount === 0) {
    suggestions.push(
      'When citing market size, include TAM/SAM/SOM sources and state the initial reachable segment instead of headline numbers.'
    );
  }

  if (!params.hasTargetUser) {
    suggestions.push(
      'Name a primary customer profile explicitly (for example: Series A SaaS sales teams with 5-20 reps) and their urgent pain point.'
    );
  }

  if (!params.hasBusinessModel) {
    suggestions.push(
      'Add pricing and monetization detail: who pays, pricing unit, expected payback period, and renewal assumptions.'
    );
  }

  if (!params.hasDifferentiation) {
    suggestions.push(
      'Add a differentiation statement against the top alternatives, including one defendable moat and one trade-off you accept.'
    );
  }

  if (params.impossibleClaimCount > 0) {
    suggestions.push(
      'Convert absolute claims (instant, zero-cost, guaranteed outcomes) into realistic ranges backed by baseline and pilot context.'
    );
  }

  if (!params.hasValidation) {
    suggestions.push(
      'Add validation evidence: pilot count, conversion, retention, or specific user feedback that supports demand and feasibility.'
    );
  }

  if (params.broadScopeCount > 0) {
    suggestions.push(
      'Narrow scope to one beachhead segment and one initial workflow before claiming broad multi-industry applicability.'
    );
  }

  return unique(suggestions).slice(0, 6);
}

function buildChecklist(params: {
  hasTargetUser: boolean;
  hasBusinessModel: boolean;
  hasDifferentiation: boolean;
  hasValidation: boolean;
  marketClaimCount: number;
  evidenceCount: number;
  impossibleClaimCount: number;
  hasConstraints: boolean;
}): string[] {
  const checks: string[] = [
    'Obtain 3-5 recent customer interviews showing clear pain frequency and willingness to pay.',
    'Request a current funnel snapshot: lead source, conversion, activation, and retention by cohort.'
  ];

  if (params.marketClaimCount > 0) {
    checks.push('Verify market sizing assumptions with source links and bottom-up calculations, not top-down slides.');
  }

  if (params.evidenceCount === 0 || !params.hasValidation) {
    checks.push('Ask for pilot evidence: scope, baseline metric, measured outcome, and statistical caveats.');
  }

  if (!params.hasTargetUser) {
    checks.push('Require an explicit ICP definition and disqualifying criteria for non-core users.');
  }

  if (!params.hasBusinessModel) {
    checks.push('Validate monetization mechanics: pricing, margin profile, CAC assumptions, and payback period.');
  }

  if (!params.hasDifferentiation) {
    checks.push('Map direct and substitute competitors; test whether the proposed moat survives 18-24 months.');
  }

  if (params.impossibleClaimCount > 0) {
    checks.push('Stress-test feasibility claims against integration effort, implementation timeline, and operational dependencies.');
  }

  if (!params.hasConstraints) {
    checks.push('Document top operational, regulatory, and go-to-market risks plus explicit mitigation plans.');
  }

  checks.push('Confirm the next 90-day milestone plan has measurable gates and a clear kill criterion.');

  return unique(checks).slice(0, 8);
}

function buildSummary(verdict: VerdictLabel, score: number, categories: CategoryScore[], hasValidation: boolean): string {
  const sorted = [...categories].sort((a, b) => b.score - a.score);
  const topOne = sorted[0];
  const topTwo = sorted[1];

  const coreMessage =
    topOne && topTwo
      ? `Highest risk areas are ${topOne.name} (${topOne.score}) and ${topTwo.name} (${topTwo.score}).`
      : 'Risk concentration is moderate and should be validated with primary evidence.';

  const evidenceMessage = hasValidation
    ? 'The pitch includes limited validation language, but it still needs concrete metrics and clear boundaries.'
    : 'The pitch currently lacks strong validation evidence and relies heavily on assertion.';

  return `Slop verdict is ${verdict} at ${score}/100. ${coreMessage} ${evidenceMessage}`;
}

export function analyzePitch(rawPitch: string): AnalysisResult {
  const pitch = rawPitch.trim();

  if (!pitch) {
    throw new Error('Pitch text is required for analysis.');
  }

  const normalizedPitch = pitch.toLowerCase();
  const wordCount = pitch.split(/\s+/).filter(Boolean).length;

  const buzzwordCount = countPatterns(normalizedPitch, BUZZWORD_PATTERNS);
  const marketClaimCount = countPatterns(normalizedPitch, MARKET_CLAIM_PATTERNS);
  const impossibleClaimCount = countPatterns(normalizedPitch, IMPOSSIBLE_CLAIM_PATTERNS);
  const broadScopeCount = countPatterns(normalizedPitch, BROAD_SCOPE_PATTERNS);
  const evidenceCount = countPatterns(normalizedPitch, EVIDENCE_PATTERNS);

  const hasTargetUser = hasAnyPattern(normalizedPitch, TARGET_USER_PATTERNS);
  const hasBusinessModel = hasAnyPattern(normalizedPitch, BUSINESS_MODEL_PATTERNS);
  const hasDifferentiation = hasAnyPattern(normalizedPitch, DIFFERENTIATION_PATTERNS);
  const hasValidation = hasAnyPattern(normalizedPitch, VALIDATION_PATTERNS);
  const hasConstraints = hasAnyPattern(normalizedPitch, CONSTRAINT_PATTERNS);
  const hasScopeLimiter = hasAnyPattern(normalizedPitch, SCOPE_LIMITER_PATTERNS);

  let marketRisk = 34;
  marketRisk += marketClaimCount * 12;
  if (marketClaimCount > 0 && evidenceCount === 0) {
    marketRisk += 18;
  }
  if (broadScopeCount > 0) {
    marketRisk += 8;
  }
  if (hasScopeLimiter) {
    marketRisk -= 8;
  }
  marketRisk = clamp(marketRisk, 5, 100);

  let userClarityRisk = 60;
  if (hasTargetUser) {
    userClarityRisk -= 30;
  }
  if (broadScopeCount > 0) {
    userClarityRisk += 14;
  }
  if (hasScopeLimiter) {
    userClarityRisk -= 8;
  }
  if (wordCount < 35) {
    userClarityRisk += 8;
  }
  userClarityRisk = clamp(userClarityRisk, 5, 100);

  let feasibilityRisk = 42;
  feasibilityRisk += impossibleClaimCount * 15;
  if (buzzwordCount >= 5) {
    feasibilityRisk += 10;
  }
  if (hasConstraints) {
    feasibilityRisk -= 14;
  }
  if (hasValidation) {
    feasibilityRisk -= 8;
  }
  feasibilityRisk = clamp(feasibilityRisk, 5, 100);

  let differentiationRisk = 58;
  if (hasDifferentiation) {
    differentiationRisk -= 30;
  }
  if (buzzwordCount >= 4) {
    differentiationRisk += 12;
  }
  if (!hasTargetUser) {
    differentiationRisk += 6;
  }
  differentiationRisk = clamp(differentiationRisk, 5, 100);

  let evidenceRisk = 68;
  if (evidenceCount >= 2) {
    evidenceRisk -= 18;
  }
  if (hasValidation) {
    evidenceRisk -= 24;
  }
  if (marketClaimCount > 0 && evidenceCount === 0) {
    evidenceRisk += 10;
  }
  if (!hasConstraints) {
    evidenceRisk += 8;
  }
  evidenceRisk = clamp(evidenceRisk, 5, 100);

  let scopeRisk = 48;
  scopeRisk += broadScopeCount * 15;
  if (!hasScopeLimiter) {
    scopeRisk += 12;
  }
  if (hasTargetUser) {
    scopeRisk -= 8;
  }
  if (wordCount > 180) {
    scopeRisk += 5;
  }
  scopeRisk = clamp(scopeRisk, 5, 100);

  const categories: CategoryScore[] = SUMMARY_ORDER.map((name) => {
    switch (name) {
      case 'Market Claim Risk': {
        const explanationParts: string[] = [];
        if (marketClaimCount > 0) {
          explanationParts.push('Market-size language is present and increases claim burden.');
        }
        if (marketClaimCount > 0 && evidenceCount === 0) {
          explanationParts.push('No clear source or quantified support was found for those market claims.');
        }
        if (hasScopeLimiter) {
          explanationParts.push('The pitch contains some scoping language that partially reduces market overreach.');
        }

        return buildCategory(name, marketRisk, explanationParts, 'Market framing appears moderately bounded.');
      }
      case 'User Clarity': {
        const explanationParts: string[] = [];
        if (!hasTargetUser) {
          explanationParts.push('Primary target user is not clearly specified.');
        }
        if (broadScopeCount > 0) {
          explanationParts.push('Broad wording suggests diffuse customer focus.');
        }
        if (hasScopeLimiter) {
          explanationParts.push('Some scope limiting language helps clarify initial focus.');
        }

        return buildCategory(name, userClarityRisk, explanationParts, 'Target user framing is relatively clear.');
      }
      case 'Feasibility': {
        const explanationParts: string[] = [];
        if (impossibleClaimCount > 0) {
          explanationParts.push('Absolute performance or speed claims indicate execution risk.');
        }
        if (buzzwordCount >= 5) {
          explanationParts.push('High buzzword density obscures operational detail.');
        }
        if (hasConstraints) {
          explanationParts.push('Acknowledging constraints improves implementation credibility.');
        }

        return buildCategory(name, feasibilityRisk, explanationParts, 'Feasibility claims are directionally plausible.');
      }
      case 'Differentiation': {
        const explanationParts: string[] = [];
        if (!hasDifferentiation) {
          explanationParts.push('Differentiation against alternatives is weak or absent.');
        }
        if (buzzwordCount >= 4) {
          explanationParts.push('Generic language reduces perceived moat clarity.');
        }

        return buildCategory(name, differentiationRisk, explanationParts, 'Differentiation is stated with enough specificity.');
      }
      case 'Evidence Quality': {
        const explanationParts: string[] = [];
        if (!hasValidation) {
          explanationParts.push('Validation markers such as pilots, retention, or experiments are missing.');
        }
        if (evidenceCount < 2) {
          explanationParts.push('Few measurable signals were found in the current pitch text.');
        }
        if (!hasConstraints) {
          explanationParts.push('Risks and assumptions are not explicitly surfaced.');
        }

        return buildCategory(name, evidenceRisk, explanationParts, 'Evidence quality is supported by concrete signals.');
      }
      case 'Scope Discipline': {
        const explanationParts: string[] = [];
        if (broadScopeCount > 0) {
          explanationParts.push('Go-to-market scope appears too broad for early execution.');
        }
        if (!hasScopeLimiter) {
          explanationParts.push('No clear phased launch boundary was identified.');
        }
        if (hasTargetUser) {
          explanationParts.push('Target-user specificity helps narrow initial scope.');
        }

        return buildCategory(name, scopeRisk, explanationParts, 'Scope appears controlled and staged.');
      }
      default:
        return buildCategory(name, 50, [], 'No category explanation generated.');
    }
  });

  const weightedScore = categories.reduce((total, category) => {
    return total + category.score * CATEGORY_WEIGHTS[category.name];
  }, 0);

  const slopScore = Math.round(clamp(weightedScore, 0, 100));
  const verdict = scoreToVerdict(slopScore);

  const suspiciousClaims = findSuspiciousClaims(pitch);

  if (!hasTargetUser) {
    suspiciousClaims.push('The pitch does not identify a clearly scoped target user segment.');
  }
  if (!hasBusinessModel) {
    suspiciousClaims.push('Monetization is implied but pricing mechanics are not explicitly stated.');
  }
  if (!hasDifferentiation) {
    suspiciousClaims.push('Competitive differentiation is asserted but not evidenced against concrete alternatives.');
  }

  const rewriteSuggestions = buildRewriteSuggestions({
    buzzwordCount,
    hasTargetUser,
    hasBusinessModel,
    hasDifferentiation,
    hasValidation,
    marketClaimCount,
    evidenceCount,
    impossibleClaimCount,
    broadScopeCount
  });

  const diligenceChecklist = buildChecklist({
    hasTargetUser,
    hasBusinessModel,
    hasDifferentiation,
    hasValidation,
    marketClaimCount,
    evidenceCount,
    impossibleClaimCount,
    hasConstraints
  });

  return {
    pitch,
    score: slopScore,
    verdict,
    summary: buildSummary(verdict, slopScore, categories, hasValidation),
    categories,
    suspiciousClaims: unique(suspiciousClaims).slice(0, 6),
    rewriteSuggestions,
    diligenceChecklist,
    generatedAt: new Date().toISOString()
  };
}
