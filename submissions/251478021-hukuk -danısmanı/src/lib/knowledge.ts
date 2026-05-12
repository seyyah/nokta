export const LEGAL_KNOWLEDGE_BASE = [
  {
    topic: "Miras Hukuku ve Temel Kavramlar",
    keywords: ["miras", "muris", "tereke", "külli halefiyet", "ölüm"],
    content: "Miras Hukuku: İnsanın sahip olduğu ve miras yoluyla geçen malvarlığı değerlerinin (hakların ve borçların) ölümünden sonraki akıbetini, hak sahiplerini ve paylaşmayı düzenler. Muris (miras bırakan), ölümüyle mirası açılan gerçek kişidir. Tereke, ölenin malvarlığı, hakları ve borçlarının tümüdür. Külli halefiyet ilkesi gereği miras, kanun gereği bir bütün olarak mirasçılara geçer ve mirasçılar borçlardan şahsen ve müteselsilen sorumlu olurlar."
  },
  {
    topic: "Zümre Sistemi (Yasal Mirasçılar)",
    keywords: ["zümre", "kök", "altsoy", "çocuk", "torun", "anne", "baba", "kardeş"],
    content: "Zümre Sistemi: Türk miras hukukunda yasal mirasçılar zümre (derece) sistemine göre belirlenir.\n1. Zümre: Murisin altsoyudur (çocukları ve torunları). Miras başlarına eşit paylaştırılır.\n2. Zümre: Murisin anne ve babası ile onların altsoyudur (kardeşler, yeğenler).\n3. Zümre: Murisin büyük anne ve büyük babaları ile onların altsoyudur (amca, dayı, hala, teyze).\nÖnceki zümrede mirasçı bulunması, sonraki zümrenin mirasçılığını engeller."
  },
  {
    topic: "Sağ Kalan Eşin Mirasçılığı",
    keywords: ["eş", "karı", "koca", "eşin miras payı", "dul"],
    content: "Sağ Kalan Eşin Miras Payı (TMK 499): Eşin miras payı, birlikte bulunduğu zümreye göre değişir:\n- 1. Zümre (altsoy/çocuklar) ile birlikte mirasçı olursa: Mirasın 1/4'ü (dörtte biri).\n- 2. Zümre (ana-baba) ile birlikte mirasçı olursa: Mirasın 1/2'si (yarısı).\n- 3. Zümre (büyük ana-baba) ile birlikte mirasçı olursa: Mirasın 3/4'ü.\n- Bunlardan hiçbiri yoksa: Mirasın tamamı (4/4) sağ kalan eşe kalır."
  },
  {
    topic: "Vasiyetname ve Çeşitleri",
    keywords: ["vasiyet", "vasiyetname", "el yazısı", "resmi vasiyet", "sözlü vasiyet"],
    content: "Vasiyetname: Miras bırakanın son arzularını içeren ölüme bağlı tasarruftur. 15 yaşını dolduran ve ayırt etme gücüne sahip herkes vasiyet yapabilir. 3 çeşittir:\n1. Resmi Vasiyetname: Noter, sulh hakimi veya yetkili memur önünde 2 tanıkla yapılır.\n2. El Yazılı Vasiyetname: Tamamı miras bırakanın kendi el yazısıyla yazılmış, tarih atılmış ve imzalanmış olmalıdır.\n3. Sözlü Vasiyetname: Savaş, yakın ölüm tehlikesi gibi olağanüstü durumlarda 2 tanığa sözlü olarak beyan edilir."
  },
  {
    topic: "Saklı Pay ve Tasarruf Oranı",
    keywords: ["saklı pay", "tasarruf oranı", "tenkis", "mahfuz hisse"],
    content: "Saklı Pay: Miras bırakanın iradesiyle bile ortadan kaldıramayacağı, kanunun mirasçılara güvence altına aldığı miras payıdır.\n- Altsoyun (çocukların) saklı payı: Yasal miras payının 1/2'sidir (yarısı).\n- Ana ve babanın saklı payı: Yasal miras payının 1/4'üdür.\n- Eşin saklı payı: 1. ve 2. zümreyle birlikteyse yasal payının tamamı, diğer hallerde 3/4'üdür.\nKardeşlerin saklı payı 2007 yılında kaldırılmıştır. Muris, saklı paylar dışında kalan kısım üzerinde serbestçe tasarruf edebilir (Tasarruf Oranı)."
  },
  {
    topic: "Mirastan Feragat ve Mirasın Reddi",
    keywords: ["feragat", "mirasın reddi", "mirası reddetme", "mirastan vazgeçme"],
    content: "Mirastan Feragat ve Red: \n- Mirastan Feragat: Muris hayattayken mirasçı ile yapılan resmi bir sözleşmedir (Miras Sözleşmesi). İvazlı (karşılıklı) veya ivazsız olabilir.\n- Mirasın Reddi: Ölümden sonra mirasçıların mirası (borçları ve alacakları ile birlikte) kabul etmemesidir. Yasal süre, ölümün (veya mirasçı olunduğunun) öğrenilmesinden itibaren 3 aydır. Reddeden mirasçı, muristen önce ölmüş gibi kabul edilir."
  },
  {
    topic: "Ölüme Bağlı Tasarrufların İptali ve Tenkis",
    keywords: ["iptal", "iptal davası", "tenkis davası", "vasiyetin iptali"],
    content: "Ölüme Bağlı Tasarrufların (Vasiyetnamelerin) İptali: Vasiyetname şu hallerde iptal edilebilir: 1. Ehliyetsizlik, 2. Hata, hile, korkutma (tehdit), 3. Şekil eksikliği, 4. Hukuka ve ahlaka aykırılık. İptal davası, iptal sebebinin öğrenilmesinden itibaren 1 yıl içinde açılmalıdır.\nTenkis Davası: Murisin yaptığı tasarruflar saklı paylı mirasçıların hakkını ihlal ediyorsa, bu ihlal edilen kısmın geri alınması (indirilmesi) için açılan davadır."
  }
];

export function searchLegalKnowledgeBase(query: string): string | null {
  const lowerQuery = query.toLowerCase();
  
  // Basit skorlama sistemi
  let bestMatch = null;
  let highestScore = 0;

  for (const entry of LEGAL_KNOWLEDGE_BASE) {
    let score = 0;
    for (const keyword of entry.keywords) {
      if (lowerQuery.includes(keyword)) {
        score += 1;
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = entry;
    }
  }

  if (bestMatch && highestScore > 0) {
    return `[Kitaptan Alıntı] ${bestMatch.topic}:\n${bestMatch.content}`;
  }

  return null;
}
