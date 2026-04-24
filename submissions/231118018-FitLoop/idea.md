# Idea - Fitness Micro-Coach Track

## Problem
Yogun tempoda calisan kullanicilar klasik diyet/fitness uygulamalarini cok detayli buluyor ve kisa surede birakiyor.

## Cozum
Tek ekranli, hizli veri girisli bir fitness mikro-koc:
- Serbest metin yemek girisi
- Su miktari
- Aktivite seviyesi (`Yuruyus`, `Kosu`, `Kardiyo`)

Bu verilerden anlik:
- `FitScore (0-100)`
- Kisa koç mesaji
- Dusuk skorda (50 alti) 3 gunluk basit yemek plani

## Hedef Kullanici
- "Takip etmek istiyorum ama fazla detayla ugrasmak istemiyorum" diyen kullanici profili
- Gun icinde 30-60 saniye ayirabilen yogun profesyoneller

## Basari Kriterleri
- Veri girisi suresi: 30 saniye civari
- Ilk acilista anlasilir akis
- Dusuk skorda net aksiyon onerisi

## Neden Uygulanabilir
- Harici API yok, tum hesaplamalar lokal
- Expo + React Native ile hizli iterasyon
- Dar kapsam sayesinde MVP hizli test edilir

## Karpathy & Autoresearch Referanslari

### 1. **Autonomous Agent Loop (Autoresearch)**
FitLoop, otonomous agent design paternini takip eder:
- **Giriş**: Kullanici yemek/su/aktivite metni
- **Otonom İşleme**: Sistem kendi başına FitScore hesaplır (manual intervention yok)
- **Çıkış Üretimi**: Otomatik coach mesajı + meal plan (user feedback beklemez)
- **Self-Learning**: Günlük logs → sistem otomatik optimize (future reinforcement learning)

### 2. **Karpathy's Tesla Autopilot Design: Lokal Inference-First**
- End-to-end lokal hesaplama: Cihaz içinde tüm data + model çalışır
- Zero external dependency: API, cloud, LLM yok
- Real-time response: Kullanıcı input → anında FitScore (latency ~100ms)
- *Referans: "Software 3.0 sınırlarını bilmek—basitlik güçtür"*

### 3. **Minimal Manual Intervention (Autoresearch Principle)**
- **30-saniye UX**: Veri gir → sistem hepsi otomatize eder
- Human loop yok: Sistem user yerine karar alır (meal plan, score, message)
- Continuous feedback: AsyncStorage logs → pattern analysis → optimize
- *Referans: Tesla Autopilot "fewer human touchpoints = more autonomy"*
