# Nokta: Pitch Validator 🎯

**Track Seçimi:** A 

## Proje Hakkında
Bu proje, girişimcilerin fikirlerini (pitch) yapay zeka ile analiz edip "Slop Score" veren ve gerektiğinde "İnsan Desteği" (Human Handoff) sağlayan mobil bir asistan uygulamasıdır.

## Expo Proje Linki
**Expo Linki:** [exp://172.20.10.3:8081]

## Expo QR Linki
**QR Linki:** 
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
█ ▄▄▄▄▄ █ ██▀▀█▀▄▀█ ▄▄▄▄▄ █
█ █   █ █  ▀█ ▀█▀▄█ █   █ █
█ █▄▄▄█ █▀  █▄▀▀▄██ █▄▄▄█ █
█▄▄▄▄▄▄▄█▄█ ▀▄█▄█▄█▄▄▄▄▄▄▄█
█▄ ▀▀ ▄▄█▀█▄█▄▀▄ ███ ▀▄▄ ▄█
██ ███▀▄▀▀ ▄█▀██  ▀ █▄  ▀██
█ ▄▄▀▀█▄▄▀▀▀▄▀█▄▀▄▀▄▀▀▄ ▀██
███▀█▄█▄▀▄▀  ▄██ ▀ ▀ ▄ ▀███
█▄▄██▄▄▄█  ▀█▄▀▄▀ ▄▄▄ ▀ ▄▄█
█ ▄▄▄▄▄ █▀▄██▀█▀▀ █▄█ ▀▀▀▀█
█ █   █ █▄▄▀▄▀▄ █ ▄ ▄▄▀   █
█ █▄▄▄█ █▀ █ ▄ ▄▀█▀▄▀█▀▀ ██
█▄▄▄▄▄▄▄█▄█▄█▄▄████▄▄▄▄▄▄▄█

## 60 Saniyelik Demo Video
**Video Linki:** [https://youtube.com/shorts/HtV1IK7BpKU?feature=share]

## Decision Log (Karar Defteri)
* **Kullanılan Teknoloji:** Çoklu platform desteği ve hızlı prototipleme imkanı sunduğu için React Native (Expo) tercih edilmiştir.
* **Yapay Zeka Entegrasyonu:** Hız ve analiz yeteneği sebebiyle Google AI Studio üzerinden `gemini-2.5-flash` modeli kullanılmıştır.
* **İnsan Desteği (Human Handoff) Mantığı:** Kullanıcı metninde "uzmana bağlan", "insan desteği" gibi tetikleyici kelimeler arandı. Eşleşme durumunda yapay zeka (API) çağrısı iptal edilerek arayüz state'i (`isExpertMode`) uzman moduna geçirilmiş ve görsel geribildirimler (rozet, renk değişimi) sağlanmıştır.
