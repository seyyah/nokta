# FitLoop — HITL Fitness Coach

**Seçilen Track:** Track B (Engineering & Architecture Focused)

## 🌟 Ana Özellikler
- **Dinamik SVG Maskot:** AI skoru ve mesajına göre anlık tepki veren (mutlu, nötr, üzgün) fütüristik "Nokta" maskotu.
- **Etkili HITL Denetim Merkezi:** AI önerilerini (FitScore, Koç Mesajı) kaydetmeden önce manuel kalibre etme veya bir **Uzman Eskalasyonu** tetikleme imkanı.
- **Uzman (Mentor) Desteği:** Düşük skorlarda veya belirsiz durumlarda "Uzmana Sor" akışı ile profesyonel tavsiye alma simülasyonu.
- **Onaylı Geçmiş:** Tüm girişler "HITL ONAYLI" ve "MENTOR DESTEKLİ" rozetleriyle detaylı bir listede saklanır.

## 🧠 Decision Log (Karar Günlüğü)
1. **HITL Önceliği:** Sistemin otonom bir "tracker" yerine, insan gözetiminde çalışan bir "koç" olmasına karar verildi. Bu yüzden doğrudan kaydetme yerine bir "Review" paneli eklendi.
2. **Eskalasyon Mimarisi:** Düşük skorlarda sistemin kendi yetkinliğini sorgulayıp kullanıcıyı bir "mentora" (simüle) yönlendirmesi sağlandı.
3. **SVG vs Image:** Performans ve dinamizm için maskot görsel yerine kodla (SVG) çizildi, böylece skor değiştikçe ifadeler anlık güncellenebiliyor.
4. **Local-First:** Gizlilik ve hız için tüm hesaplamaların ve veri saklamanın (AsyncStorage) cihaz içinde yapılması sağlandı.

## 📱 Kurulum ve Bağlantılar
- **Expo QR Kodu:** [![Expo QR](https://img.shields.io/badge/Expo-QR_Kodu_İçin_Tıkla-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/accounts/eexnmy/projects/FitLoop/builds/b40cee76-84a2-488c-9381-5d5dc7e23f96)
- **APK İndir:** [app-release.apk](./app-release.apk)
- **Demo Video:** (Kullanıcı tarafından 60 sn olarak yüklenecektir)

---
*Bu proje bir NOKTA üretimidir.*
