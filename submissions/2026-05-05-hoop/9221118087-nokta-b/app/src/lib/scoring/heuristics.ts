export const BUZZWORD_PATTERNS = [
  /\brevolutionary\b/i,
  /\bgame[- ]?changing\b/i,
  /\bdisrupt(?:ive|ing)?\b/i,
  /\bai[- ]powered\b/i,
  /\bnext[- ]?gen\b/i,
  /\bcutting[- ]edge\b/i,
  /\bworld[- ]class\b/i,
  /\bunparalleled\b/i,
  /\bfrictionless\b/i,
  /\bseamless\b/i,
  /\bstate[- ]of[- ]the[- ]art\b/i,
  /\binnovative\b/i,
  /\ball[- ]in[- ]one\b/i,
  /\bmassive adoption\b/i,
  /\btransform\b/i
];

export const MARKET_CLAIM_PATTERNS = [
  /\b(?:tam|sam|som)\b/i,
  /\$\s?\d+(?:\.\d+)?\s?(?:million|billion|trillion|m|bn|tn)\b/i,
  /\b\d+(?:\.\d+)?%\s+of\s+the\s+market\b/i,
  /\bmarket(?:\s+size)?\s+is\s+worth\b/i
];

export const TARGET_USER_PATTERNS = [
  /\bfor\s+(?:small\s+businesses|smbs?|enterprises?|founders|developers|sales\s+teams|marketers|operations\s+teams|clinics|hospitals|students|teachers|restaurants|logistics\s+teams|finance\s+teams)\b/i,
  /\b(target\s+customer|ideal\s+customer|icp|persona|user\s+segment)\b/i,
  /\b(?:b2b|b2c|d2c|enterprise)\b/i
];

export const BUSINESS_MODEL_PATTERNS = [
  /\bsubscription\b/i,
  /\bmonthly\s+fee\b/i,
  /\bannual\s+contract\b/i,
  /\bper[- ]seat\b/i,
  /\bfreemium\b/i,
  /\bcommission\b/i,
  /\bpricing\b/i,
  /\brevenue\s+model\b/i,
  /\barr\b/i,
  /\bmrr\b/i
];

export const DIFFERENTIATION_PATTERNS = [
  /\bunlike\b/i,
  /\bcompared\s+to\b/i,
  /\bcompetitor\b/i,
  /\bmoat\b/i,
  /\bpatent(?:ed)?\b/i,
  /\bdefensible\b/i,
  /\bwhy\s+now\b/i,
  /\bdifferentiat(?:e|ion)\b/i
];

export const IMPOSSIBLE_CLAIM_PATTERNS = [
  /\b(?:10x|100x)\b/i,
  /\binstantly\b/i,
  /\bovernight\b/i,
  /\bzero\s+(?:cost|integration|setup|risk)\b/i,
  /\bno\s+(?:cost|integration|setup|risk)\b/i,
  /\bin\s+days\b/i,
  /\bwithin\s+24\s+hours\b/i,
  /\bdominate\b/i,
  /\breplace\s+all\b/i
];

export const BROAD_SCOPE_PATTERNS = [
  /\bfor\s+everyone\b/i,
  /\bevery\s+industry\b/i,
  /\ball\s+industries\b/i,
  /\bevery\s+business\b/i,
  /\bglobal(?:ly)?\s+from\s+day\s+one\b/i,
  /\bany\s+company\b/i,
  /\buniversal\b/i
];

export const CONSTRAINT_PATTERNS = [
  /\brisk\b/i,
  /\bassumption\b/i,
  /\blimitation\b/i,
  /\bconstraint\b/i,
  /\btrade[- ]off\b/i,
  /\bdependency\b/i,
  /\bregulatory\b/i,
  /\bcompliance\b/i,
  /\bchallenge\b/i
];

export const VALIDATION_PATTERNS = [
  /\bpilot\b/i,
  /\bpaid\s+customer\b/i,
  /\bpaying\s+customer\b/i,
  /\bretention\b/i,
  /\bconversion\b/i,
  /\bchurn\b/i,
  /\bcohort\b/i,
  /\bexperiment\b/i,
  /\bcase\s+study\b/i,
  /\bproof\s+of\s+concept\b/i,
  /\bvalidated\b/i
];

export const EVIDENCE_PATTERNS = [
  /\b\d+(?:\.\d+)?%\b/i,
  /\b\d+[kmb]?\s+(?:users|customers|teams|transactions)\b/i,
  /\$\s?\d+(?:\.\d+)?\s?(?:k|m|bn|million|billion)\b/i,
  /\bsource\b/i,
  /\bdata\b/i,
  /\bstudy\b/i,
  /\bbenchmark\b/i
];

export const SCOPE_LIMITER_PATTERNS = [
  /\bstart(?:ing)?\s+with\b/i,
  /\bphase\s+1\b/i,
  /\binitially\b/i,
  /\bfirst\s+segment\b/i,
  /\bnarrow\b/i,
  /\bfocused\s+on\b/i
];
