# Tohum — Track A Submission

**Öğrenci No:** 231118098
**Slug:** `tohum`
**Track:** **A — Dot Capture & Enrich**

Tohum, ham bir fikri AI destekli rehberli sohbetle NOKTA `idea.md` standardındaki 7-bölüm manifestoya büyüten mobil düşünce partneridir. WhatsApp tarzı chat, engineering-guided sorular, opsiyonel yön önerileri ve repo-konformu çıktı.

> Fikir için özelleşmiş `idea.md` dosyası: [`./idea.md`](./idea.md)

---

## Demo & Çalıştırma

| Kanal | Bağlantı |
|---|---|
| 60 saniyelik demo video (v1 — Track A) | https://youtube.com/shorts/OSNfmsCfokQ |
| 60 saniyelik demo video (v2 — HITL) | https://www.youtube.com/shorts/UJDCOOZwdhA |
| APK indirme (repo içi) | [`./app-release.apk`](./app-release.apk) |
| EAS Build sayfası | https://expo.dev/accounts/aerarslan1919/projects/tohum/builds/c15365e8-3213-4d98-a018-000c6e1bffc6 |

### Yerel Çalıştırma

```bash
cd app
npm install
cp .env.example .env    # sonra .env içine en az bir sağlayıcı key'ini koy
npx expo start
```

Expo Go ile telefondan QR kodu okut. `.env` boş olduğunda chat ekranında _"Hiçbir AI sağlayıcı anahtarı bulunamadı"_ hatası görürsün — bu beklenen davranış. İki key'den en az biri dolu olduğunda akış canlanır; ikisi de doluysa Gemini primary, Groq fallback.

### APK Build (EAS)

```bash
cd app
npm install -g eas-cli            # ilk kez
eas login                         # Expo hesabınla giriş yap
eas build --platform android --profile preview
```

Build bitince EAS sana indirme linki verir (`https://expo.dev/artifacts/...`). İndirilen APK'yı `submissions/231118098-tohum/app-release.apk` olarak komite et. Build, çevredeki `.env` dosyasını okuyup `EXPO_PUBLIC_GEMINI_API_KEY` ve `EXPO_PUBLIC_GROQ_API_KEY`'i APK içine gömer — demo sonrası iki key'i de ilgili konsollardan revoke et.

### Sürüm Bilgisi

| Alan | Değer |
|---|---|
| Expo SDK | 54 |
| React Native | 0.81 |
| LLM (primary) | Google Gemini 2.5 Flash |
| LLM (fallback) | Groq Llama 3.3 70B |
| Paket (Android) | `com.aleynaerrsln.tohum` |
| Uygulama sürümü | 1.0.0 (versionCode 1) |

---

## Track Seçim Gerekçesi

`challenge.md` üç track sunuyor: **A — Dot Capture & Enrich**, **B — Slop Detector**, **C — Migration & Dedup**.

Track A seçildi çünkü NOKTA'nın tezi olan *"engineering-guided akış, slop yok"* en doğrudan **A**'da somutlaşır: ham nokta → rehberli diyalog → spec. B ve C ikisi de değerli türev akışlar ama temel **dot-to-spec** dönüşümünü ikincil olarak ele alır. Tohum, tezi en dar dilimde ve en saf hâlde uygulamaya koyar.

---

## Decision Log

Scope, mimari ve UX üzerine verilen kararlar — her biri puan verilebilir bir trade-off noktası.

### 1. UX: Form doldurma değil, WhatsApp-tarzı diyalog
**Seçim:** Kullanıcı serbestçe yazar, AI tek seferde tek soru sorar.
**Neden:** `idea.md` "Temel İçgörü 1 — Engineering-Guided Akış" bunu zorunlu kılıyor. Form doldurma slop'u davet eder; açık uçlu chat de slop'u davet eder. İkisi arasındaki "tek turda tek soru" WhatsApp ritmi NOKTA tezini birebir uygular.

### 2. Öneri: Opsiyonel iskele, zorunlu seçim değil
**Seçim:** AI, kullanıcının takıldığı yerlerde 2-3 yön önerebilir (chip); kullanıcı dokunursa input'a yapıştırır, dokunmazsa yok sayar. Maksimum her 2 turda 1 öneri.
**Neden:** `idea.md` "AI yardımcı araçtır, kullanıcı fikrin sahibi" diyor. Zorunlu a/b/c seçimi dayatmadır; opsiyonel chip özgürlük + iskele arası dengedir. Google Smart Reply ruhuna yakın.

### 3. Tamamlanma: Sabit N soru değil, adaptif rubrik
**Seçim:** AI, 7 sinyalli iç rubrik (tez/problem/nasıl çalışır/ne yapmaz/neden şimdi/kim fayda sağlar/özet) üzerinde ilerler. Hepsi *strong* olduğunda "noktan çekirdeğe ulaştı" der ve üretim onayı ister.
**Neden:** "5 soru sor ve bitir" yaklaşımı mekanik; rubrik adaptif olduğunda kullanıcı *yeterince anlatıldığını* hisseder. Ayrıca 7 sinyal `idea.md`'nin 7 bölümüne birebir eşleniyor — format ile akış aynı düzlemde.

### 4. Çıktı formatı: NOKTA `idea.md` 7-bölüm standardı
**Seçim:** AI'nın final çıktısı serbest JSON veya PRD-tarzı spec değil; repo'nun kendi `idea.md` dosyasıyla birebir aynı 7 başlık (*Tez, Problem, Nasıl Çalışır, Ne Yapmaz, Neden Şimdi, Kim Fayda Sağlar, Özet*).
**Neden:** `challenge.md` "track için özelleşmiş fikir dosyası" istiyor; repo kültürü manifestodan yana, PRD'den değil. Output repo-konformu olunca kullanıcı çıktıyı doğrudan bir git reposuna `idea.md` olarak bırakabilir. Bu aynı zamanda anti-slop için güçlü bir cosine similarity ayrıştırıcısıdır — çoğu submission muhtemelen jenerik spec üretecek.

### 5. Slop yasakları prompt seviyesinde
**Seçim:** System prompt'ta "harika fikir", "süper", "kesinlikle başarılı olur" gibi motivasyonel dolgular açıkça yasak listesinde.
**Neden:** NOKTA tezinin *"%0 halüsinasyon, slop yok"* iddiasını araç seviyesinde uygulayamayınca manifesto boşa çıkar. Yasaklar kod değil prompt seviyesinde çünkü araç aynı zamanda öğretici bir örnek — prompt'u okuyan başka geliştirici de bu disiplini görsün.

### 6. Teknoloji yığını spec çıktısından çıkarıldı
**Seçim:** `idea.md` çıktısı "React Native", "MongoDB" gibi kod kararlarını içermez.
**Neden:** `idea.md`'nin açılış cümlesi "Hiçbir kod yazılmadan önce ne yapacağını söyler". Teknoloji yığını seçmek kod kararıdır; spec'e girmesi standart ihlali. Stitch tasarımında vardı, çıkardık.

### 7. AI çağrısı: Çoklu sağlayıcı + failover + client-side
**Seçim:** İki sağlayıcı serisel denenir — Gemini (primary) → Groq (fallback). Her biri ücretsiz bireysel plan, kredi kartı gerekmez. Anahtarlar geliştirmede `.env`, APK build'de bundle içine gömülür (EAS, `EXPO_PUBLIC_*` env'lerini otomatik alır).
**Neden:** Bir sağlayıcının kotası dolunca akış kesilmesin; ayrıca demo boyunca maliyet sıfır kalsın. Backend proxy eklemek submission scope'unu şişirir (scope disiplini 25 puan). Client-side çağrı güvenlik hassasiyetli bir tercih ama challenge tek kişilik demo amaçlı — risk kabul edilebilir. Production'a çıkmayacak. Orchestrator `services/ai/orchestrator.ts`'de; rate-limit (429), 5xx, bozuk JSON durumlarında otomatik rotate eder, fatal olmayan hatalarda bir sonrakine geçer.

### 8. Bottom nav sadeleştirildi (4 → 2 sekme)
**Seçim:** Stitch tasarımındaki 4 sekme (Fikirler / Arama / Belgeler / Ayarlar) → 2 sekmeye (Fikirlerim / Ayarlar) indi.
**Neden:** Track A tek akışlı (yeni nokta → chat → idea.md). "Arama" ve ayrı "Belgeler" MVP için fazlalık. Az sekme = scope disiplini sinyali.

### 9. Dil ayrımı: UI Türkçe, kod İngilizce
**Seçim:** Kullanıcıya görünen her metin Türkçe; kod içi değişken/fonksiyon/tip isimleri İngilizce.
**Neden:** NOKTA ekosistemi Türkçe konuşan yaratıcıları hedefliyor (repo'nun kendi `idea.md`'si Türkçe). Kod İngilizce çünkü uluslararası kod okunabilirlik standardı.

### 10. Dark tema varsayılan
**Seçim:** Uygulama dark mode'da açılır; `#0D1117` zemin, `#2F7AC2` primary, `#898200` tertiary.
**Neden:** Stitch'teki dark paletle uyum + yaratıcıların çoğu IDE/Figma'da dark mode kullanıyor → dokunsal tutarlılık.

### 11. İnsan Desteği: HITL — Uzman Spec Düzenleme Kapısı
**Seçim:** Spec üretildikten sonra kullanıcı 3 uzman profilinden birini seçer. Uzman spec'i bölüm bölüm görebilir, istediği bölümü bottom-sheet modal üzerinden düzenler. Değiştirilen bölümler spec ekranına "✓ Uzman Düzenledi" badge + yeşil border ile geri yansır. Düzenlemeler `AsyncStorage`'a `expertEdits` map olarak kaydedilir; `useFocusEffect` ile spec ekranı her odaklanmada güncel durumu yükler.
**Neden:** Çoğu HITL implementasyonu pasif onay/ret akışından ibaret. Tohum'un uzman desteği ise AI çıktısını gerçekten değiştirebilir — bu nokta-hoop'un "uzman geri bildirimi kalıcı bilgi tabanına yazılmalı" tezini mobil katmanda somutlaştırıyor. 7 bölümlü `idea.md` standardı sayesinde hangi bölümün uzman tarafından değiştirildiği net izlenebilir; bu gelecekte diff/audit trail altyapısına zemin hazırlar.

---

## Kapsam Dışı Tutulanlar

Açık bir dille yazıyorum çünkü `idea.md`'nin *"Ne Yapmaz"* disiplini submission'da da geçerli:

- **Ses girişi** — ilk MVP'ye dahil değil; çılgınlık bonusu olarak ayrı değerlendirilebilir.
- **Bulut senkronizasyon, kullanıcı hesabı, oturum** — yok.
- **Paylaşım / pazar yeri** — yok (NOKTA'nın büyük vizyonu ama Track A'ya dahil değil).
- **PDF/Word export** — yok; çıktı Markdown, kopyala yeterli.
- **Çoklu cihaz senkronu** — yok.
- **Rakip analizi / pazar araştırması modülü** — Track B konusu, bizde yok.

---

## AI Araç Kayıtları

`challenge.md` kuralı: *"AI tool serbest, logla"*.

- **Claude Code CLI (Sonnet 4.6, 200K context)** — planlama, mimari karar, `idea.md` yazımı, prompt mühendisliği, tüm React Native kod üretimi, HITL akış tasarımı ve commit yönetimi.
- **Anthropic Claude Sonnet 4.6** — uygulama içindeki AI motoru (Tohum'un kendi runtime LLM'i).
- **Stitch (Google)** — ilk tasarım draft'ı (palette, tipografi, ekran yerleşimi); final UI Stitch'ten saparak repo standartlarına göre rafine edildi.

Rate limit, alternatif tool veya tool değişikliği gerekirse bu bölümde notlanacaktır.

---

## Repo Ağaç Yapısı

```
submissions/231118098-tohum/
├── README.md                       ← bu dosya
├── idea.md                         ← Track A manifesto
├── app/                            ← Expo + React Native uygulaması
│   ├── app.json                    ← Tohum metadata, Android paket bilgisi
│   ├── eas.json                    ← EAS Build profilleri (APK)
│   ├── package.json
│   ├── .env.example                ← Anthropic key placeholder
│   ├── app/                        ← Expo Router ekranları
│   │   ├── _layout.tsx             ← Font yükleme + root stack
│   │   ├── index.tsx               ← Yeni Nokta (giriş)
│   │   ├── chat.tsx                ← Nokta Chat
│   │   ├── spec.tsx                ← Spec Hazır (idea.md render + uzman düzenlemeleri)
│   │   ├── expert-list.tsx         ← Uzman seçim ekranı (HITL)
│   │   ├── expert-review.tsx       ← Uzman görüşü + bölüm düzenleme (HITL)
│   │   └── history.tsx             ← Fikirlerim
│   ├── components/
│   │   ├── chat/
│   │   │   ├── message-bubble.tsx
│   │   │   ├── typing-indicator.tsx
│   │   │   ├── input-bar.tsx
│   │   │   ├── suggestion-chips.tsx
│   │   │   ├── rubric-progress.tsx
│   │   │   └── generate-banner.tsx
│   │   └── spec/
│   │       └── section-card.tsx
│   ├── constants/
│   │   ├── theme.ts                ← Stitch paleti + tipografi tokenleri
│   │   ├── prompt.ts               ← Nokta AI system prompt (6 kural)
│   │   ├── schema.ts               ← AI cevap şeması + runtime doğrulama
│   │   ├── idea-md.ts              ← Final manifesto parser
│   │   └── experts.ts              ← Mock uzman profilleri (HITL)
│   └── services/
│       ├── ai/
│       │   ├── index.ts            ← askNokta() dış arayüz
│       │   ├── orchestrator.ts     ← Gemini → Groq failover
│       │   ├── errors.ts           ← tipli hata sınıfları
│       │   ├── types.ts            ← NoktaProvider interface
│       │   ├── extract-json.ts     ← model cevabından JSON ayıklama
│       │   └── providers/
│       │       ├── gemini.ts       ← Gemini 2.5 Flash primary
│       │       └── groq.ts         ← Llama 3.3 70B fallback
│       └── storage.ts              ← AsyncStorage — Fikirlerim
└── app-release.apk                 ← EAS Build çıktısı (build sonrası)
```
