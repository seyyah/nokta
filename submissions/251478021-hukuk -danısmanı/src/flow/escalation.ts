/**
 * Bu metinler “basit bilgilendirme” dışına çıkar; bağlayıcı hukuk görüşü üretilmemeli,
 * uzman avukat yönlendirmesi önerilir.
 */
const HIGH_STAKES_LEGAL = [
  /\b(ceza|suç|tutuklama|gözaltı|savcılık|iddianame|hapis|cezaevi|ihbarname|şikayet\s+dilekçesi\s+ceza)\b/i,
  /\b(terör|orgüt|FETÖ|PKK|uyuşturucu\s+ticareti)\b/i,
  /\b(boşanma|velayet|nafaka|evlilik\s+birliği|şiddet)\b/i,
  /\b(ölüm|ağır\s+yaralanma|maluliyet|iş\s+kazası\s+.*ölüm)\b/i,
  /\b(iflas|konkordato|iflasın\s+ertelenmesi)\b/i,
  /\b(kamu\s+ihale|belediye|idare\s+dava|iptal\s+dava)\b/i,
  /\b(uluslararası|yabancı\s+mahkeme|tahkim|Lahey|Milletlerarası)\b/i,
  /\b(birleşme|devralma|rekabet\s+kurumu|birleşme\s+kontrolü)\b/i,
  /\b(vergi\s+cezası|vergi\s+suç|VUK.*suç|kaçakçılık)\b/i,
];

/** Çok düşük eşik: her mesajda "hukuk" geçsin diye uyarma (gürültü). Sadece ağır konular + uzun karmaşık anlatım. */
const MIN_LEN_FORCE = 920;

export function shouldSuggestExpert(answer: string): boolean {
  const t = answer.trim();
  if (t.length < 8) return false;
  if (HIGH_STAKES_LEGAL.some((re) => re.test(t))) return true;
  if (t.length >= MIN_LEN_FORCE) return true;
  return false;
}
