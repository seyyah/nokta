# Nokta AI: Dot-to-Spec Engine

> **Öğrenci No:** 231118024  
> **Slug:** spec-builder  
> **Track:** A (Dot-to-Spec)

---

## 🎯 Proje Vizyonu ve Mimari (Executive Summary)

Nokta AI, sıradan bir "LLM Wrapper" olmanın çok ötesinde, fikirlerin mühendislik spesifikasyonlarına dönüşümünü **Zero-Trust (Sıfır Güven)** ve **Dumb Client (Aptal İstemci)** prensipleriyle yöneten uçtan uca bir mimaridir. 

Mobil uygulama yalnızca bir sunum katmanı olarak hareket ederken, sistemin tüm ağırlık merkezi özel olarak tasarlanmış Node.js backend altyapısında toplanmıştır. Akış üç ana bileşenden oluşur:

1. **PII Edge Guardrail:** Mobil istemciden gelen tüm ham veri, doğrudan dil modeline (LLM) gitmeden önce bu kalkan tarafından preslenir. "TC Kimlik", "Apple", "Amazon" gibi önceden tanımlanmış kısıtlı kelimeler (PII ve yasaklı entity'ler) tespit edilirse, sistem otonom olarak alarm üretir.
2. **Hoop Decision Engine (Karar Motoru):** PII skorlamasına dayalı olarak trafiği iki farklı kanala yönlendirir:
   * **HOOTL (Human-Out-Of-The-Loop):** Eğer risk tespit edilmezse, süreç tam otonom işler ve doğrudan spesifikasyon üretimine geçer.
   * **HITL (Human-In-The-Loop):** Yüksek riskli (CRITICAL) bir PII tespit edilirse, süreç "Hard Stop" yer ve incelenmek üzere Veri Gizlilik Uzmanına (DPO) bilet (ticket) olarak düşer.
3. **Track A (Clean Room LLM):** PII temizliğinden veya DPO onayından geçmiş güvenli metni Groq API (Llama-3) üzerinden işler. *Structured Output (JSON)* moduyla, halüsinasyon riskini sıfıra indirerek doğrudan `Problem`, `TargetAudience` ve `Scope` parametrelerine sahip katı bir mühendislik spesifikasyonu (Product Spec) döner.

---

## 🏗 Decision Log (Karar Günlüğü)

Projeyi geliştirirken alınan kritik mimari kararlar ve akademik/teknik gerekçeleri aşağıda özetlenmiştir:

* **Neden "Dumb Client" Prensibi Seçildi?**
  Mantığın ve güvenlik doğrulamalarının mobil tarafta (Frontend) bırakılması, reverse-engineering (tersine mühendislik) risklerini artırır ve güncellemeleri App Store / Play Store döngülerine mahkum eder. İş mantığını Node.js backend'ine taşıyarak mobil uygulamanın boyutunu minimumda tuttuk, LLM promptlarını ve PII regexlerini merkezi olarak güncellenebilir kıldık.
* **Neden React vb. Yerine Statik HTML ile DPO Konsolu?**
  Geliştirme yükünü ve bakım maliyetini azaltmak amacıyla, DPO paneli ayrı bir SPA projesi yerine Express'in `express.static()` middleware'i üzerinden sunulan tek bir statik HTML dosyası (Vanilla JS + Tailwind via CDN) olarak tasarlandı. Bu sayede harici bir build process ve node_modules havuzundan tasarruf edilirken, maksimum hız ve güvenlik sağlandı.
* **Neden HITL Risk Matrisi Kuruldu?**
  Sistemde kurumsal şirket (B2B) verilerinin barınacağı öngörüldüğünden LLM'e körlemesine (blind) veri göndermek büyük bir gizlilik (GDPR/KVKK) ihlalidir. Kurduğumuz HITL mekanizması sayesinde sistem bir kara kutu (black box) olmaktan çıkmış, insan denetimli (human-audited) güvenilir bir boru hattına dönüştürülmüştür.

---

## 🎥 Medya ve Bağlantılar

| Materyal | Link |
| :--- | :--- |
| **Expo Go QR Kodu** | ![Expo QR Kodu](https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://expo.dev/accounts/begummmm/projects/nokta/builds/a7714e3a-a39b-4b8c-96cf-56292e8e5065) |
| **Demo Videosu** | *[https://youtube.com/shorts/iTIeYmxrl3Q?feature=share*] |
| **APK İndir** | **[app-release.apk Dosyasını İndir](./app-release2.apk)** |

---

## 🚀 Kurulum ve Çalıştırma

### 1. Backend (Node.js) Servisi
Backend'i ayağa kaldırmak ve DPO Konsoluna erişmek için:

```bash
# Backend dizinine geçin
cd backend

# Bağımlılıkları yükleyin
npm install

# Sunucuyu başlatın
npx ts-node src/server.ts
```
*Sunucu çalıştığında DPO konsoluna `http://localhost:3000` adresinden ulaşabilirsiniz.*

### 2. Frontend (Expo / React Native)
Mobil uygulamayı emülatörde veya Expo Go ile çalıştırmak için:

```bash
# Expo uygulamasının bulunduğu klasöre geçin
cd app

# Bağımlılıkları yükleyin
npm install

# Uygulamayı başlatın
npm run start
```
