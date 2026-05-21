# 🐛 Audit Raporu — nokta-audit-forge

**Uygulama:** nokta-audit-forge  
**Ekran:** OnboardingScreen  
**Tarih:** 2026-05-19  
**Raporlayan:** karahan-qa  
**Widget:** @xtatistix/mobile-audit v0.1.0

---

## 📱 OnboardingScreen

### 🔴 Açık — Not #1

**Not:** "Başla" butonuna basıldığında uygulama hiçbir şey yapmıyor. Kullanıcı navigasyon bekliyor ama ekran donuyor. İkinci kez basınca da aynı durum — hiçbir yere gitmiyor.

**Alan:** "Başla →" butonu — ekranın alt bölümü

![Ekran görüntüsü — Başla butonu yanıt vermiyor](./screenshots/01-onboarding-button-bug.png)

> *Sarı kutu: "Başla →" butonu çevresini işaret ediyor — dokunulduğunda hiçbir tepki yok.*

**Bağlam:**
- Platform: Android (Pixel 6 emulator)
- Expo SDK: ~53.0.0
- Adım: Onboarding ekranı açık, butona ilk dokunuş

**Beklenen:** `/(tabs)/ideas` ekranına yönlendirme  
**Gerçekleşen:** Hiçbir navigasyon olmadı, ekran aynı kaldı

---

## Özet

| Metrik | Değer |
|---|---|
| Toplam not | 1 |
| 🔴 Açık | 1 |
| ✅ Düzeltildi | 0 |
| Ekran | OnboardingScreen |

---

*Üretildi: nokta-audit-forge / karahan-qa / 2026-05-19 09:14*
