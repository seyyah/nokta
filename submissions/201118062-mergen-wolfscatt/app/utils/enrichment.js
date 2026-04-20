const CATEGORY_RULES = [
  { label: "Eğitim", keywords: ["öğrenci", "ders", "kampüs", "okul", "sınav"] },
  { label: "Üretkenlik", keywords: ["plan", "not", "takvim", "görev", "ekip"] },
  { label: "Sağlık", keywords: ["doktor", "sağlık", "hasta", "spor", "uyku"] },
  { label: "Finans", keywords: ["ödeme", "bütçe", "para", "finans", "harcama"] }
];

function normalizeText(value) {
  return value.trim().replace(/\s+/g, " ");
}

function toSentence(value) {
  const cleaned = normalizeText(value);

  if (!cleaned) {
    return "";
  }

  const first = cleaned.charAt(0).toUpperCase();
  const rest = cleaned.slice(1);

  return /[.!?]$/.test(cleaned) ? `${first}${rest}` : `${first}${rest}.`;
}

function detectCategory(idea) {
  const lowerIdea = idea.toLocaleLowerCase("tr-TR");

  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((keyword) => lowerIdea.includes(keyword))) {
      return rule.label;
    }
  }

  return "Genel Ürün";
}

function buildTitle(idea, category) {
  const cleaned = normalizeText(idea);

  if (!cleaned) {
    return "Yeni Ürün Fikri";
  }

  const shortTitle = cleaned.length > 42 ? `${cleaned.slice(0, 42).trim()}...` : cleaned;
  return `${category}: ${shortTitle}`;
}

function buildMvpList(scopeAnswer) {
  return normalizeText(scopeAnswer)
    .split(/,|;|\n/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);
}

function buildSuccessMetric(userAnswer) {
  const lowered = userAnswer.toLocaleLowerCase("tr-TR");

  if (lowered.includes("öğrenci")) {
    return "İlk hafta içinde öğrencilerin uygulamayı tekrar açma oranını görmek";
  }

  if (lowered.includes("ekip") || lowered.includes("çalışan")) {
    return "Kullanıcıların haftalık aktif kullanım davranışını ölçmek";
  }

  return "Kullanıcının ilk akıştan sonra ürünü tekrar kullanma ihtiyacını doğrulamak";
}

export function generateSpec(idea, answers) {
  const safeIdea = normalizeText(idea);
  const safeAnswers = {
    problem: normalizeText(answers.problem),
    user: normalizeText(answers.user),
    scope: normalizeText(answers.scope),
    constraint: normalizeText(answers.constraint)
  };

  const category = detectCategory(safeIdea);
  const mvpItems = buildMvpList(safeAnswers.scope);
  const title = buildTitle(safeIdea, category);

  return {
    title,
    category,
    summary: `${toSentence(safeIdea)} Bu fikir ${safeAnswers.user.toLocaleLowerCase(
      "tr-TR"
    )} için daha net ve uygulanabilir bir ürün çerçevesine dönüştürüldü.`,
    problem: toSentence(safeAnswers.problem),
    targetUser: toSentence(safeAnswers.user),
    mvpItems,
    constraints: toSentence(safeAnswers.constraint),
    valueProposition: `${safeAnswers.user} için ${safeAnswers.problem.toLocaleLowerCase(
      "tr-TR"
    )} problemini daha az sürtünmeyle çözmeyi hedefleyen odaklı bir mobil deneyim.`,
    successMetric: buildSuccessMetric(safeAnswers.user)
  };
}
