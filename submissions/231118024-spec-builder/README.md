Track: C

# Nokta AI: Dot-to-Spec Engine

> **Öğrenci No:** 231118024  
> **Slug:** spec-builder  
> **AI Aracı:** Antigravity

## Human Touch Points (İnsan Müdahalesi)
Sisteme widget üzerinden 4 kez hata raporu girdim (müşteri rolü), 1 kez de API bağlantısı çöktüğü için ajana mock data yönlendirmesi yaptım. Toplam müdahale: 5

## Decision Log (Forge & Ratchet Disiplini)
Nokta-forge onarım ocağı, uygulamanın yaşam döngüsü boyunca karşılaşılan teknik borçları ve hataları otonom olarak iyileştiren bir 'Self-Healing' mekanizmasıdır. Bu sistem, Karpathy-style 'Ratchet' disiplini üzerine kurulu olup, her onarımın sistemi daha ileriye taşımasını ve geriye doğru bozulmamasını (rollback güvenliği) hedefler. Geliştirme sürecinde `nokta-audit` widget'ı üzerinden toplanan 'cevherler' (hata raporları), ajan tarafından `READ → LOCATE → HYPOTHESIZE → REPAIR → TEST → VERIFY → COMMIT` zinciriyle titizlikle işlenmiştir. 

Özellikle Cycle 3 ve 4 aşamalarında, sistemin hata yapma ve ondan öğrenme kabiliyetini test etmek amacıyla kasıtlı bir ROLLBACK senaryosu işletilmiştir: Tip güvenliği (null-guard) eklenmeden yapılan zorunlu tip ataması TypeScript derlemesinde yakalanmış, Ratchet disiplini gereği kod otomatik olarak eski kararlı haline döndürülmüştür. Ardından doğru null-guard kontrolü eklenerek kalıcı onarım sağlanmıştır. Bu 'Müşterinin Geliştirici Olduğu Hafta' konsepti, yazılımın sadece son kullanıcı için değil, bakım ve onarım süreçleri için de otonom bir ekosisteme dönüştüğünü kanıtlamaktadır. Cycle 1'deki negatif margin kaynaklı UI kaymalarından, Cycle 5'teki tema uyumsuzluğu kaynaklı siyah arka plan kusurlarına kadar her aşama, otonom bir araştırma ve onarım başarısıdır.

---

## 🎯 Proje Vizyonu ve Mimari (Executive Summary)

Nokta AI, sıradan bir "LLM Wrapper" olmanın çok ötesinde, fikirlerin mühendislik spesifikasyonlarına dönüşümünü **Zero-Trust (Sıfır Güven)** ve **Dumb Client (Aptal İstemci)** prensipleriyle yöneten uçtan uca bir mimaridir. 

Mobil uygulama yalnızca bir sunum katmanı olarak hareket ederken, sistemin tüm ağırlık merkezi özel olarak tasarlanmış Node.js backend altyapısında toplanmıştır. Akış üç ana bileşenden oluşur:

1. **PII Edge Guardrail:** Mobil istemciden gelen tüm ham veri, doğrudan dil modeline (LLM) gitmeden önce bu kalkan tarafından preslenir. "TC Kimlik", "Apple", "Amazon" gibi önceden tanımlanmış kısıtlı kelimeler (PII ve yasaklı entity'ler) tespit edilirse, sistem otonom olarak alarm üretir.
2. **Hoop Decision Engine (Karar Motoru):** PII skorlamasına dayalı olarak trafiği iki farklı kanala yönlendirir:
   * **HOOTL (Human-Out-Of-The-Loop):** Eğer risk tespit edilmezse, süreç tam otonom işler ve doğrudan spesifikasyon üretimine geçer.
   * **HITL (Human-In-The-Loop):** Yüksek riskli (CRITICAL) bir PII tespit edilirse, süreç "Hard Stop" yer ve incelenmek üzere Veri Gizlilik Uzmanına (DPO) bilet (ticket) olarak düşer.
3. **Spec Engine (Clean Room LLM):** PII temizliğinden veya DPO onayından geçmiş güvenli metni Groq API (Llama-3) üzerinden işler. *Structured Output (JSON)* moduyla, halüsinasyon riskini sıfıra indirerek doğrudan `Problem`, `TargetAudience` ve `Scope` parametrelerine sahip katı bir mühendislik spesifikasyonu döner.

---

## 🚀 Kurulum ve Çalıştırma

### 1. Backend (Node.js) Servisi
```bash
cd backend
npm install
npx ts-node src/server.ts
```
*Sunucu çalıştığında DPO konsoluna `http://localhost:3000` adresinden ulaşabilirsiniz.*

### 2. Frontend (Expo / React Native)
```bash
cd app
npm install
npm run start
```

---

🔗 Demo Video: [[Demo](https://youtube.com/shorts/3M5Ajha8tCg?si=EeU2Nfnsa84jioa3)]
📦 APK Çıktısı: `app-release.apk` klasörde mevcut
- **Expo QR / Yayın Bağlantısı:** [https://expo.dev/accounts/begummmm/projects/nokta/builds/50a4d0ae-743c-4c87-a7f1-c271f4385549]