export interface EngQuestion {
  id: string;
  question: string;
  hint: string;
  placeholder: string;
}

export const ENGINEERING_QUESTIONS: EngQuestion[] = [
  {
    id: "problem",
    question: "Gerçek Problem Nedir?",
    hint: "Bu fikrin çözdüğü tek ve en önemli problem nedir? Neden bu problem şu an çözülmemiş?",
    placeholder: "Örn: İnsanlar X yaparken Y sorunu yaşıyor çünkü Z...",
  },
  {
    id: "user",
    question: "Hedef Kullanıcı Kim?",
    hint: "Bu uygulamayı ilk haftada kim kullanacak? Bunu kullanan kişinin bir gününü tarif et.",
    placeholder: "Örn: 25-35 yaş, şehirde yaşayan, her gün X yapan biri...",
  },
  {
    id: "scope",
    question: "MVP Kapsamı Nedir?",
    hint: "6 haftada tek başına yapabileceğin en küçük sürüm ne olabilir? Hangi özellikler olmalı, hangilerini çıkarabilirsin?",
    placeholder: "Dahil: A, B, C. Dahil değil: D, E, F...",
  },
  {
    id: "constraints",
    question: "Teknik Kısıtlar Neler?",
    hint: "Bu projeyi geliştirirken karşılaşacağın en büyük 2 teknik zorluk nedir? Bu zorlukları nasıl aşacaksın?",
    placeholder: "1. Zorluk: ... Çözüm: ...\n2. Zorluk: ... Çözüm: ...",
  },
  {
    id: "success",
    question: "Başarı Kriterleri Nedir?",
    hint: "3 ay sonra bu proje 'başarılı' sayılırsa ne olmuş olacak? Bunu nasıl ölçersin?",
    placeholder: "Örn: X kullanıcı, Y retention oranı, Z gelir...",
  },
];

export function generateSpec(rawIdea: string, answers: { questionId: string; question: string; answer: string }[]): string {
  const problemAnswer = answers.find((a) => a.questionId === "problem")?.answer ?? "-";
  const userAnswer = answers.find((a) => a.questionId === "user")?.answer ?? "-";
  const scopeAnswer = answers.find((a) => a.questionId === "scope")?.answer ?? "-";
  const constraintsAnswer = answers.find((a) => a.questionId === "constraints")?.answer ?? "-";
  const successAnswer = answers.find((a) => a.questionId === "success")?.answer ?? "-";

  const date = new Date().toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `# PROJE SPEC

**Tarih:** ${date}

---

## Ham Fikir
${rawIdea}

---

## Problem
${problemAnswer}

---

## Hedef Kullanıcı
${userAnswer}

---

## Kapsam (MVP)
${scopeAnswer}

---

## Teknik Kısıtlar
${constraintsAnswer}

---

## Başarı Kriterleri
${successAnswer}

---

*Bu spec Idea Tracker uygulaması ile Track A metodolojisi kullanılarak oluşturulmuştur.*`;
}
