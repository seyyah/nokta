export interface EngineeringQuestion {
  id: string;
  title: string;
  description: string;
  placeholder: string;
  icon: string;
}

export const ENGINEERING_QUESTIONS: EngineeringQuestion[] = [
  {
    id: "problem",
    title: "Problem Tanımı",
    description: "Bu fikir tam olarak hangi problemi çözüyor? Kullanıcı şu an bu problemi nasıl çözüyor?",
    placeholder: "Örn: Kullanıcılar X yaparken Y sorunu yaşıyor, mevcut çözümler ise Z nedeniyle yetersiz kalıyor...",
    icon: "alert-circle",
  },
  {
    id: "user",
    title: "Hedef Kullanıcı",
    description: "Bu çözümün birincil kullanıcısı kim? Demografik ve davranışsal özellikleri neler?",
    placeholder: "Örn: 20-30 yaş, teknoloji meraklısı, günde 2 saat mobil uygulama kullanan...",
    icon: "users",
  },
  {
    id: "scope",
    title: "Kapsam (Scope)",
    description: "MVP için hangi özellikler kesinlikle gerekli, hangileri sonraya bırakılabilir?",
    placeholder: "MVP'de dahil: ...\nSonraya bırakılacak: ...",
    icon: "layers",
  },
  {
    id: "constraint",
    title: "Teknik Kısıtlar",
    description: "Hangi teknik, bütçe veya zaman kısıtları altında çalışıyorsunuz?",
    placeholder: "Örn: Offline çalışmalı, API key gerektirmemeli, 2 haftada teslim edilmeli...",
    icon: "lock",
  },
  {
    id: "success",
    title: "Başarı Kriteri",
    description: "Bu çözümün işe yaradığını nasıl anlarsınız? İlk kullanıcıdan beklentiniz ne?",
    placeholder: "Örn: Kullanıcı X'i yapabilmeli, Y metriği Z değerine ulaşmalı...",
    icon: "check-circle",
  },
];
