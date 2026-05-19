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

### 1. **Human-in-the-Loop Loop (HITL-focused Autoresearch)**
FitLoop, otonom süreçleri insan denetimiyle birleştiren HITL paternini takip eder:
- **Giriş**: Kullanıcı yemek/su/aktivite metni
- **İşbirliği**: Sistem FitScore hesaplar, ancak kullanıcı (insan) bu skoru ve koç mesajını onaylamadan/düzenlemeden veri kesinleşmez.
- **Dinamik Çıkış**: İnsan onaylı koç mesajı + meal plan.
- **Eskalasyon**: Düşük skorlarda sistem otonom kararı durdurur ve "Uzman Onayı" (expert supervision) bekler.

### 2. **Karpathy's Tesla Autopilot Design: Local & Supervised**
- End-to-end lokal hesaplama: Cihaz içinde tüm data + model çalışır.
- Zero external dependency: API, cloud, LLM yok.
- Supervised Autonomy: Tıpkı Tesla Autopilot gibi, sistem önerir ama "sürücü" (kullanıcı) her an müdahale edebilir ve onay verir.
- *Referans: "Software 3.0: İnsan gözetiminde otonomi"*

### 3. **Managed Intervention (Autoresearch Principle)**
- **HITL Integration**: Veri gir → AI öner → İnsan onayla → Sistem kaydet.
- Expert Loop: Düşük skorda sistemin hata payına karşı insan doğrulaması şart koşulur.
- Continuous Alignment: Kullanıcı müdahaleleri (skor düzeltmeleri) sistemin gelecekteki doğruluk payını artırmak için veri tabanına işlenir.
- *Referans: "Fewer human touchpoints, but high-impact human verification"*
