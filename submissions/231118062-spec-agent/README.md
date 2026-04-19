# NOKTA Spec-Agent v3.0 - Track 1

**Öğrenci:** Utku Uzun  
**Öğrenci No:** 231118062  
**Seçilen Track:** Track 1 (Spec-Agent)

## 🚀 Proje Hakkında
Spec-Agent, ham proje fikirlerini analiz eden ve onları profesyonel Yazılım Gereksinim Dokümanlarına (PRD) dönüştüren, içerisinde mühendislik puanlaması ve teknoloji yığını önerisi barındıran bir AI asistanıdır.

## 🛠️ Teknik Detaylar
- **Model:** Google Gemini 3 Flash Preview (v1beta)
- **Mimari:** 3 Aşamalı Agentic Workflow (Analiz -> Girdi -> Rapor)
- **UI/UX:** React Native (Expo) ile geliştirilmiş modern SaaS arayüzü.

## 🔗 Bağlantılar
- **Demo Videosu:** [BURAYA VİDEO LİNKİNİ YAPIŞTIR]
- **APK Dosyası:** Klasör içerisindeki `app-release.apk` dosyasıdır.

## 📋 Karar Günlüğü (Decision Log)
1. **Model Seçimi:** Hız ve 2026 standartlarındaki en güncel model olması sebebiyle **Gemini 3 Flash Preview** tercih edildi.
2. **Akış Yönetimi:** Sadece soru sormak yerine, kullanıcıdan aldığı teknik yanıtları sentezleyip "Mühendislik Skoru" üreten bir yapı kurgulandı.
3. **Paylaşım Özelliği:** Üretilen spec dokümanlarının ekip içinde hızlıca dağıtılabilmesi için **Native Share API** entegre edildi.