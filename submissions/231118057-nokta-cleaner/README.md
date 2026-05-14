# Nokta Cleaner — AI Destekli Not Temizleme ve Uzman Onay Sistemi

**Öğrenci No:** 231118057
**Kategori:** C — Mobil Uygulama

---

## APK İndir (Android)

[APK İndir](https://expo.dev/accounts/cubukcu/projects/expo-template-blank/builds/e38dc81b-9786-439e-989f-dc36d8ab847b)

Telefonda tarayıcıyla aç → İndir → Yükle *(Bilinmeyen kaynaklara izin ver)*

---

## Ne Yapar?

Dağınık notları (WhatsApp dışa aktarma, bullet point karışıklığı, toplantı notları) yapıştır. Gemini AI şunları yapar:

1. Gereksiz metinleri temizler (timestamp, sohbet dolgu metni)
2. Tekrarlayan fikirleri tek bir noktada birleştirir
3. Her fikri kategorize eder: **Technical / Business / Design / Other**

Çıkan kartları uzman inceleyip onaylar, reddeder, öncelik atar ve düzenler.

---

## Özellikler

### AI İşleme
- Gemini AI ile not temizleme, tekrar giderme ve otomatik kategorizasyon
- Model fallback zinciri: `gemini-flash-lite-latest` → `gemini-2.5-flash` → `gemini-2.0-flash`
- API limiti aşılırsa otomatik olarak bir sonraki modele geçer

### Human-in-the-Loop (Uzman Desteği)
| Özellik | Açıklama |
|---|---|
| **Onayla / Reddet** | Her kart için yeşil/kırmızı border + badge |
| **Toplu Onayla / Reddet** | Tüm kartlara tek tıkla işlem |
| **Inline Düzenleme** | Başlık, açıklama, kategori düzenleme |
| **Uzman Notu** | Her karta özel not alanı |
| **Manuel Kart Ekleme** | AI'dan bağımsız yeni kart oluşturma |
| **Reddedilenleri Yeniden Analiz Et** | Reddedilen kartları AI'a tekrar gönder |
| **Onaylananları Dışa Aktar** | Onaylı kartları notlar + etiketler + atanan kişiyle panoya kopyala |

### Uzman İş Akışı
| Özellik | Açıklama |
|---|---|
| **Öncelik** | High / Medium / Low — renkli badge ile görsel gösterim |
| **Atanan Kişi** | Her karta `@isim` atama, başlık altında görünür |
| **Etiketler** | Serbest etiket ekleme/çıkarma, aramada taranır |
| **Kart Bağlantısı** | İlişkili kartları birbirine bağlama (checkbox seçici) |
| **Oturum Raporu** | Canlı özet: durum, kategori, öncelik, atanan kişiler, etiketler + Tam Raporu Dışa Aktar |

### UX
| Özellik | Açıklama |
|---|---|
| **Dark Mode** | Tüm komponentlerde tam tema desteği |
| **Arama** | Başlık, açıklama, etiket ve atanan kişiye göre anlık arama |
| **Kategori Filtresi** | All / Technical / Business / Design / Other pill filtreleri |
| **Oturum Geçmişi** | Son 5 analiz otomatik kaydedilir (localStorage), tek tıkla geri yükle |
| **Kart Sıralama** | ↑ ↓ butonları ile öncelik sıralaması |
| **Web + Android** | Expo ile hem web tarayıcıda hem telefonda çalışır |

---

## Uygulama Akışı

```
Ham Notlar → AI Analizi → Kart Listesi
                              ↓
                    Uzman İncelemesi
                    ├── Onayla / Reddet
                    ├── Öncelik Ata
                    ├── Kişi Ata
                    ├── Etiket Ekle
                    ├── Kart Bağla
                    ├── Düzenle / Not Ekle
                    └── Reddedilenleri Yeniden Analiz Et
                              ↓
                    Oturum Raporu → Dışa Aktar
```

---

## Yerel Kurulum

```bash
cd app
cp .env.example .env
# .env dosyasına EXPO_PUBLIC_GEMINI_API_KEY değerini yaz
npm install
npx expo start --web        # Web tarayıcı
npx expo start --android    # Android (Expo Go gerekli)
```

Gemini API key ücretsiz al: [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

---

## Teknoloji

- React Native + Expo SDK 54
- NativeWind v4 (Tailwind CSS)
- Google Gemini AI (`@google/generative-ai`)
- expo-clipboard
- localStorage (oturum geçmişi)
