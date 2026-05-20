const INJECTION_PATTERNS = [
  /<\|im_start\|>/gi,
  /<\|im_end\|>/gi,
  /<\/?system>/gi,
  /<\/?\s*\|.*?\|>/gi,
  /\[\[INST\]\]/gi,
  /\[\[\/INST\]\]/gi,
  /###\s*system\s*:/gi,
  /<\/?assistant>/gi,
  /<\/?human>/gi,
];

const MAX_INPUT_LEN = 4000;

export function sanitize(input: string): string {
  let s = input.normalize('NFC').slice(0, MAX_INPUT_LEN);
  for (const re of INJECTION_PATTERNS) s = s.replace(re, '');
  return s.replace(/\s+/g, ' ').trim();
}
