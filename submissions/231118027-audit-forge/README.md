# Challenge: Audit-Forge
**Öğrenci:** Ümit Efe Özkaleli  
**Öğrenci No:** 231118027  
**Üniversite:** Samsun Üniversitesi - Yazılım Mühendisliği  
**Seçilen Track:** Track A (Sadelik ve Drop-in Disiplini)

---

## 📌 Proje Hakkında ve Karar Günlüğü (Decision Log)
Bu proje, React Native / Expo tabanlı bir mobil uygulamanın içine `@xtatistix/mobile-audit` widget'ının "Self-contained" modda gömülmesini ve üretilen Markdown bug raporlarının otonom yapay zeka ajanları tarafından tamir edilmesini simüle eden uçtan uca bir sistemdir.

### Alınan Mimari Kararlar:
1. **Drop-in Sınır Koruması:** Widget uygulamanın kök dizinine (`App.tsx`) navigasyon yapısını bozmayacak şekilde entegre edilmiştir. Uygulamanın diğer bileşenleri widget'ın varlığından tamamen bağımsızdır.
2. **Web Ortamı ve Donanım Uyumluluğu (Hack):** Proje geliştirme aşamasında web tarayıcısı (`localhost`) üzerinde test edilirken native donanım paketlerinin (`react-native-view-shot` ve `expo-file-system`) çökmesini engellemek için `captureScreen` ve `captureRef` fonksiyonları mock/dummy base64 görsellerle kandırılmış, üretilen `.md` raporu `console.log` ile doğrudan geliştirici konsoluna yönlendirilerek kayıpsız olarak kurtarılmıştır.

---

## 🔗 Linkler & Çıktılar
- **Expo QR Link / Demo:** 
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
█ ▄▄▄▄▄ █▀ █▀▀█ ▀ ▄▀▄▀█ ▄▄▄▄▄ █
█ █   █ █▀ ▄ ███▀█▀ ▀▄█ █   █ █
█ █▄▄▄█ █▀█ █▄ ▀▀ █▀▄▀█ █▄▄▄█ █
█▄▄▄▄▄▄▄█▄█▄█ ▀▄▀ █ █ █▄▄▄▄▄▄▄█
█▄▄  ▄▀▄   ▄█▄█▄▄▀ ▄▀▀ ▀ ▀▄▀▄▀█
██ █▀▀ ▄▀▀ ▀ ▄█▀▄██ ▀▀▄▄▄██▄ ██
█▄▄█▀▄▄▄  ▄▀▄▀▀▀▄ ▄▄▀▀ ▀▀▀▀ ▄▀█
█ █▄▀▀▄▄██▀▀█▀ ▄ ▄█▄█ █▄▀ ▄▄▀██
█ █ ▀▄█▄ ▄█▀█▄█▄█▀  ▀▀█▀ ▀▀ ▄ █
█ █▀  █▄▀  █ ▄█▀ ▀▄▀█▀██ █ ▄███
█▄█▄▄██▄▄  ▄▄▀▀▀▄▀▄▀▀ ▄▄▄ █ ▀▀█
█ ▄▄▄▄▄ █▄▄▀█▀ ▄▄▀██  █▄█ ▀▄███
█ █   █ █  ▀█▄█▄██ █▀▄▄▄▄▄█ ▀▀█
█ █▄▄▄█ █ ▀▀ ▄█▀ ██ █ ▄   ▀█ ██
█▄▄▄▄▄▄▄█▄▄▄▄███▄▄▄█▄████▄█▄███

- **60 Sn Demo Video Linki:** [https://youtube.com/shorts/wSptYw8QACU?feature=share ]

---

## 🛠️ Kurulum ve Çalıştırma

Projenin bağımlılıklarını yüklemek için `app` klasöründe şu komutu çalıştırın:
```bash
npm install