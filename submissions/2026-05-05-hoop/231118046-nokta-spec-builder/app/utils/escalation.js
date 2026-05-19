export const expertDomainKeywords = [
  'hukuk', 'hukuki', 'sozlesme', 'sözleşme', 'kvkk',
  'vergi', 'yatirim', 'yatırım', 'finans',
  'saglik', 'sağlık', 'medikal', 'hastane', 'hasta',
  'pazar', 'rakip', 'regulasyon', 'regülasyon',
  'patent', 'guvenlik', 'güvenlik', 'mimari karar',
  'teknik dogrulama', 'teknik doğrulama', 'algoritma',
  'veri yapisi', 'veri yapısı', 'ispat', 'kanit', 'kanıt'
];

function normalizeForSearch(value) {
  return value
    .toLocaleLowerCase('tr')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Scans the provided text for high-risk or complex domain keywords.
 * Returns the matched keyword (topic) if found, otherwise null.
 */
export function detectEscalationNeed(text) {
  if (!text || text.trim().length < 4) {
    return null;
  }
  const normalized = normalizeForSearch(text);
  
  const foundKeyword = expertDomainKeywords.find((candidate) =>
    normalized.includes(normalizeForSearch(candidate))
  );

  if (foundKeyword) {
    return foundKeyword;
  }
  
  return null;
}

/**
 * Stub function to represent an API call to a real expert backend.
 * In the future, this can be replaced with an actual fetch request.
 */
export async function submitEscalationRequest(topic, data) {
  console.log(`[Escalation] Requesting expert review for topic: ${topic}`);
  return { status: 'pending', id: 'mock-id-123' };
}
