# Nokta Game Pitch

## Submission

- **Ogrenci no:** 231118081
- **Slug:** idea-distillery
- **Track:** C - Migration & Dedup

## Secilen Track

**Track C - Migration & Dedup**

## Yeni Tema

Nokta Game Pitch, solo indie oyun gelistiricilerinin daginik oyun fikri
notlarini scope kontrollu bir **GDD-lite** brief'ine donusturen mobil
uygulamadir.

Onceki Nokta Draft genel proje notlarini temizliyordu. Bu upgrade ile uygulama
artik belirli bir alan icin calisir: oyun fikirleri, mekanik listeleri,
referans oyunlar, prototype kisitlari, feature creep ve mentor feedback'i.

## Uygulama Ne Yapar

- Karisik indie oyun notlarini alir.
- Groq API varsa structured game pitch analizi yapar.
- Groq API yoksa veya hata verirse deterministic local fallback motoruna doner.
- Oyun fikrini GDD-lite bolumlerine ayirir:
  - Game Summary
  - Core Loop
  - Player Fantasy
  - Core Mechanics
  - Scope Boundary
  - Feature Creep Warnings
  - Prototype Plan
- Solo developer / kisa prototype / buyuk sistem istekleri gibi scope risklerini yakalar.
- Oyun tasarimi celiskilerini gorunur kilar:
  - cozy + horror ton gerilimi
  - no combat + boss fight
  - solo dev + open world / multiplayer
  - offline + multiplayer
- Prototype readiness skoru uretir:
  - HOOTL: devam edilebilir
  - HOTL: mentor onerilir
  - HITL: mentor gereklidir
- Mentor handoff packet uretir:
  - recommended mentor
  - neden mentor gerekli
  - mentora sorulacak 3 soru
- User ve Mentor girisleri ayridir.
- User workspace basinda yeni not/fikir ekleme girisi gosterir.
- Saved brief listesi user workspace icindedir.
- User brief'i kaydedince gerekiyorsa mentor review ticket'i olusur.
- Mentor sadece pending review ticket'larini gorur.
- Mentor feedback veya transcript yapistirinca ilgili saved brief guncellenir ve future plan olusur.

## Groq Kurulumu

Repo kokunden:

```bash
cd submissions/231118081-idea-distillery/app
copy .env.example .env
```

`.env` icine:

```env
EXPO_PUBLIC_GROQ_API_KEY=your_groq_key
EXPO_PUBLIC_GROQ_MODEL=llama-3.3-70b-versatile
```

Groq key zorunlu degildir. Key yoksa app local fallback ile calisir.

## Calistirma

```bash
cd submissions/231118081-idea-distillery/app
npm install
npm run start
```

Kontroller:

```bash
npm run typecheck
```

## Demo Akisi

1. Acilista **User Login** ve **Mentor Login** girislerini gor.
2. **User Login** ile kullanici workspace'ine gir.
3. Workspace'in basinda yeni not/fikir ekleme alani, altinda **Saved Briefs** listesi gorunur.
4. **Add Notes / Idea** ile yeni brief akisini ac.
5. Load Sample ile "Moon Orchard" oyun notlarini yukle.
6. Distill Game Pitch butonuna bas.
7. App core loop, player fantasy, mechanics ve scope boundary uretir.
8. User game decisions alaninda bazi secenekleri secer.
9. Save Brief butonuna basar.
10. Readiness HOOTL degilse mentor review ticket otomatik olusur.
11. Brief kaydedilince kullanici workspace'indeki **Saved Briefs** listesine doner.
12. Home'a don, **Mentor Login** ile gir.
13. Mentor sadece pending ticket'lari gorur.
14. Mentor feedback yapistirir ve ticket'i resolve eder.
15. User workspace'teki Saved Briefs bolumunde brief `reviewed` olur ve future plan mentor feedback ile guncellenir.

## Expo QR Link

Expo proje / QR sayfasi:
https://expo.dev/accounts/samsun081/projects/nokta-draft-231118081

Bu surum mevcut Expo projesi uzerinden devam eder. App adi **Nokta Game Pitch**
olarak guncellendi; Expo proje slug'i EAS projectId ile uyumlu kalmasi icin
`nokta-draft-231118081` olarak korunur.

Son Android EAS build:
https://expo.dev/accounts/samsun081/projects/nokta-draft-231118081/builds/97fccce6-b3a6-4b04-9ce6-95e642046dbb

Son APK artifact:
https://expo.dev/artifacts/eas/jLxLCw4QzEcd9LhktoM1Pe.apk

## 60 Saniyelik Demo

Demo video linki:
https://youtube.com/shorts/jtwFCBSASho?feature=share

## APK

Teslim APK dosyasi:

`submissions/231118081-idea-distillery/app-release.apk`

Bu APK 12 Mayis 2026 tarihinde EAS build `97fccce6-b3a6-4b04-9ce6-95e642046dbb`
artifact'indan guncellendi.

## Karar Gunlugu

- Uygulamanin temasi genel project distillation yerine indie game pitch distillation olarak degistirildi.
- Steam pitch ozelligi scope disina alindi; final artifact GDD-lite brief olarak belirlendi.
- Groq API eklendi, fakat demo guvenilirligi icin local deterministic fallback korundu.
- Full nokta-hoop video/TTS entegrasyonu yerine mentor handoff mantigi alindi.
- Mentor connection ilk surumde role-based queue + in-app ticket + feedback writeback olarak tasarlandi.
- Feature creep detection, oyun fikirleri icin ana farklastirici capability yapildi.
- Decision locking sistemi oyun kararlarina uyarlandi: tone, core loop, combat, multiplayer, platform, scope.
- AsyncStorage eklendi; saved brief ve mentor ticket'lari cihazda kalici tutulur.

## AI Tool Log

- ChatGPT Codex: repo inceleme, fikir/theme karari, React Native akisi, Groq entegrasyonu, mentor ticket sistemi, AsyncStorage kayit akisi, README/checklist guncellemesi.
- Groq API: opsiyonel runtime game pitch analizi icin kullanilir; API key yoksa local fallback devreye girer.

## Bilinen Sinirlar

- Groq cevabi structured JSON bekler; bozuk cevapta local fallback kullanilir.
- Mentor baglantisi gercek video call degildir; mentor queue ve feedback writeback seklinde calisir.
- Export akisi henuz yoktur.
