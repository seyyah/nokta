# NOKTA Submission — 221118054

## Track Seçimi

**Track A — Idea Spec Generator**

Ham fikri (text) alır → AI ile 5 engineering sorusu sorar (problem, user, scope, constraint, success metric) → tek sayfa spec üretir.

---

## Uygulama Hakkında

**NOKTA Idea Spec**, kullanıcının aklındaki ham fikri yapılandırılmış bir ürün spesifikasyonuna dönüştüren bir mobil uygulamadır.

### Kullanıcı Akışı

```
1. Ana ekran → FAB (+) ile yeni fikir gir
2. Chat ekranı → 5 engineering sorusunu cevapla
3. Maturity: DOT → (sorular boyunca) → PAGE
4. Spec Kartı → tüm alanlar dolu, paylaş butonu
```

### Ekranlar

| Ekran | Dosya | Açıklama |
|-------|-------|----------|
| Ana Ekran | `app/index.tsx` | Fikir listesi, FAB ile yeni fikir |
| Chat | `app/chat.tsx` | 5 soru akışı, maturity progress |
| Spec Kartı | `app/spec.tsx` | Problem/User/Scope/Constraint/Metric |

---

## Expo QR Kodu

> ⚠️ Uygulamayı çalıştırdıktan sonra `expo start` çıktısındaki QR kodu buraya ekle:

![Expo QR](./Screenshot_1.png)


---

## Demo Video

> 60 saniye içinde: fikir gir → 5 soruyu cevapla → spec kartını göster

Demo Link: [[YouTube/Drive linki buraya](https://youtube.com/shorts/TEkptZhPuC0?si=Zz_PoZMn3wVxmscc)]

---

## APK

APK dosyası: `app-release.apk` (bu klasörde)

Build komutu:
```bash
cd app
npm install
npx eas build --platform android --profile preview
```

---

## Decision Log

| Tarih | Karar | Gerekçe |
|-------|-------|---------|
| 2025 | Track A seçildi | En sade uygulama yapısı; tek akış, net girdi-çıktı |
| 2025 | Backend yok | program.md Non-Goals ile uyumlu, local-first |
| 2025 | 5 soru sabit | Engineering spec için minimum soru seti: problem, user, scope, constraint, metric |
| 2025 | Dark theme | NOKTA'nın minimal estetik felsefesiyle uyumlu |
| 2025 | Expo Router | Expo v52 default, dosya tabanlı routing basit |

---

## Klasör Yapısı

```
submissions/221118054-idea-spec/
├── README.md          ← bu dosya
├── idea.md            ← Track A fikir dosyası
├── app/               ← Expo projesi
│   ├── app/
│   │   ├── _layout.tsx
│   │   ├── index.tsx  ← Ana ekran
│   │   ├── chat.tsx   ← Chat ekranı
│   │   └── spec.tsx   ← Spec kartı
│   ├── app.json
│   ├── package.json
│   ├── tsconfig.json
│   ├── babel.config.js
│   └── eas.json
└── app-release.apk    ← Build sonrası buraya koy
```
