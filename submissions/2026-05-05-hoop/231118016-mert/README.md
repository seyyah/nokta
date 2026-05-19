# Nokta Away Mission - Track A (Dot Capture & Enrich)

**Öğrenci No:** 231118016
**Ad Soyad:** Mert Ali Keleş

## Proje Hakkında
Bu proje, "Nokta" uygulamasının bir dilimi olan "Dot Capture & Enrich" akışını gerçekleştirir. Kullanıcıdan ham bir fikir alınır, Gemini AI kullanılarak değerlendirilir ve eksik noktalar tespit edilip kullanıcıya sorularak olgunlaştırılmış bir Specification (Spec) belgesi üretilir.

**v2 — HITL (Human-in-the-Loop) Uzman Desteği Eklendi**

## Uygulama Akışı
```
IdeaScreen → QuestionsScreen → SpecScreen → ExpertScreen (HITL)
```

| Ekran | Açıklama |
|-------|----------|
| IdeaScreen | Ham fikir girişi |
| QuestionsScreen | Gemini AI'nın sorduğu mühendislik soruları |
| SpecScreen | Üretilen spec + Readiness skoru |
| ExpertScreen | **YENİ** — HITL uzman inceleme ve onay akışı |

## HITL Döngü Modları (nokta-hoop mimarisinden)

Spec'in Readiness skoruna göre risk seviyesi ve döngü modu otomatik belirlenir:

| Skor | Risk | Mod | Açıklama |
|------|------|-----|----------|
| 75+ | 🟢 Düşük | HOOTL | Uzman bilgilendirilir, onayı beklenmez |
| 50–74 | 🟡 Orta | HOTL | Uzman süreci izler, gerekirse müdahale eder |
| 0–49 | 🔴 Yüksek | HITL | Uzman onayı **zorunlu**, onay olmadan spec kesinleşmez |

Uzman onayı sonucunda:
- ✅ **Onayla & Yayınla** — Spec "uzman doğrulamalı" statüsünü alır
- ↩ **Revize Et** — Fikir sahibi geri bildirimle yeniden başlar

## Demo & Bağlantılar
- **Demo Videosu:** https://youtu.be/81kcH2KgpTM
- **Expo Projesi / Build:** [EAS Build Linki](https://expo.dev/accounts/musontra/projects/noktaa/builds/8741b72c-2a75-41f3-8019-6c586c2ce76a) (Ayrıca APK dosyası klasörde mevcuttur)

## Decision Log
- **[v1]** Gemini AI ile mock veriden gerçek API entegrasyonuna geçildi.
- **[v1]** React Navigation ile 3 ekranlı mimari kuruldu (IdeaScreen → QuestionsScreen → SpecScreen).
- **[v1]** Readiness Score (0-100) ve MissingFields bileşenleri eklendi.
- **[v2]** `ExpertScreen` (HITL) eklendi: Readiness skoru üzerinden risk seviyesi hesaplanıyor (HOOTL/HOTL/HITL), atanan uzman profili gösteriliyor, MCP → Slack adapter simülasyonu ile uzman bildirim akışı çalışıyor, uzman geri bildirimi sonrasında onayla/revize et seçeneği sunuluyor.
- **[v2]** `SpecScreen`'e "Uzmana Gönder" butonu eklendi; score ve specSections verisi ExpertScreen'e aktarılıyor.
- **[v2]** `App.js`'e ExpertScreen rotası eklendi.
- **AI Araçları:** Antigravity (Google DeepMind), Gemini AI (API)

## Kurulum ve Çalıştırma
```bash
cd app
npm install
npx expo start
```
