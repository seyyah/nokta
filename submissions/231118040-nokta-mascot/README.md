# Nokta Mascot

## Submission

- **Ogrenci no:** 231118040
- **Slug:** nokta-mascot
- **Track:** C - 3D sesli AI asistan / mascot arayuzu

## Ozet

Nokta Mascot, React, Vite ve Three.js ile gelistirilmis mobil uyumlu bir web prototipidir. Proje, Nokta'yi 3D etkileşimli bir yapay zeka asistani olarak konumlandirir: kullanici mikrofon veya metin kutusu ile konusur, Groq Llama 3 tabanli cevap alir, cevap Web Speech API ile seslendirilir ve avatar konuşma sırasında dudak senkronu yapar.

## Ozellikler

- 3D avatar: `@react-three/fiber`, `@react-three/drei` ve `three` ile tam ekran maskot.
- Duygu durumlari: idle, sleep, tickle, angry ve love state'leri.
- Uyku modu: 10 saniye etkilesim olmazsa avatar uyku animasyonuna gecer.
- Tiklama tepkisi: pes pese hizli tiklamalarda kizginlik durumuna gecer.
- Okşama/sevme tepkisi: pointer hareketiyle kalp animasyonu ve love state'i tetiklenir.
- Konusma: Web Speech API ile STT/TTS, ses seviyesine gore dudak senkronu.
- AI motoru: Groq SDK ile `llama-3.3-70b-versatile` modeline sohbet istegi.
- Mobil kullanim: floating mikrofon ve sohbet paneli.
- Yerel HTTPS: `@vitejs/plugin-basic-ssl` ile mobil tarayicida mikrofon izni icin HTTPS.

## Calistirma

```bash
cd submissions/231118040-nokta-mascot/app
npm install
cp .env.example .env
```

`.env` dosyasina Groq anahtarini gir:

```env
VITE_GROQ_API_KEY=sizin_groq_api_anahtariniz
```

Gelistirme sunucusu:

```bash
npm run dev -- --host
```

Vite SSL ile `https://` uzerinden acilir. Telefonda test ederken tarayicinin yerel sertifika uyarisini onaylamak gerekir.

## Demo Akisi

1. Uygulama acilir ve 3D Nokta avatar ekranda gorunur.
2. Kullanici mikrofon butonuna basar ve fikrini soyler.
3. Web Speech API sesi metne cevirir.
4. Groq Llama 3 kisa ve yonlendirici bir Nokta cevabi uretir.
5. Web Speech API cevabi seslendirir.
6. Avatar konusma sirasinda dudak senkronu yapar.
7. Kullanici avatar uzerinde gezindiginde love state'i, hizli tikladiginda angry state'i gorulur.
8. Bir sure etkilesim olmazsa avatar sleep state'ine gecer.

## APK / Expo Notu

Bu teslim Expo degil, React + Vite tabanli web prototipidir. Bu nedenle `app-release.apk` uretilmedi. Mobil test yerel HTTPS Vite sunucusu uzerinden yapilir.

## Validation

- `npm install`
- `npm run build`

## Decision Log

- 2026-05-11: Nokta Mascot ayri bir web submission olarak `submissions/231118040-nokta-mascot/` altina eklendi.
- 2026-05-11: Expo/RN yerine kullanicinin verdigi React, Vite ve Three.js mimarisi korundu.
- 2026-05-11: Mikrofon erisimi icin Web Speech API ve yerel HTTPS yaklasimi korundu.
- 2026-05-11: Groq API anahtarinin commitlenmemesi icin `.env.example` eklendi ve `.env` ignore edildi.

## AI Tool Log

- OpenAI Codex: kaynak proje inceleme, submission klasoru hazirlama, README/idea dokumantasyonu, build dogrulamasi ve PR hazirligi.
