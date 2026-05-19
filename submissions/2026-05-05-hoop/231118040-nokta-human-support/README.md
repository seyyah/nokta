# Nokta Human Support

## Submission

- **Ogrenci no:** 231118040
- **Slug:** nokta-human-support
- **Track:** C - AI + insan uzman destegi katmani

Track: C

## Ozet

Bu teslim, Nokta'nin yalnizca AI cevabi uretmesini degil, gerektiginde insan uzmana devretmesini saglar. Uygulama kullanici istegini once AI katmaninda analiz eder, guven puani ve risk bayraklari cikarir, sonra uygun uzman profilini secip destek bileti olusturur.

## Ozellikler

- AI guven puani ve risk bayragi analizi
- Hassas konu veya dusuk guvende insan uzmana aktarim
- UX, urun, teknik ve alan uzmani profilleri
- Destek bileti olusturma ve kapatma akisi
- Uzman yanitini konusma kaydina ekleme
- Tek ekranli Expo React Native mobil prototip

## Calistirma

```bash
cd submissions/231118040-nokta-human-support/app
npm install
npm run start
```

Expo Go ile terminalde uretilen QR kod okutularak mobilde acilabilir.

## Expo QR

- Expo Go / expo-go QR linki-gorseli: [expo-qr.png](expo-qr.png)
- Expo project type: Expo Go local development (`expo-go`)
- Not: Expo local development QR kodu cihaz IP adresine gore calisma aninda yeniden uretilir. En dogru QR icin `npm run start` komutunun terminalde verdigi QR okutulmalidir.

## APK

- Android APK: [app-release.apk](app-release.apk)

## 60 Sn Demo

- 60 saniyelik demo videosu: [demo.mp4](demo.mp4)
- YouTube/Drive yuklemesine hazir repo ici demo videosu: [demo.mp4](demo.mp4)
- Demo metni: [idea.md](idea.md) dosyasindaki "Demo Akisi" bolumunde yer alir.

## Uzman Destegi Akisi

1. Kullanici fikri veya problemi yazar.
2. Nokta AI guven puani, alan, oncelik ve risk bayraklarini cikarir.
3. Guven dusukse veya konu hassassa insan uzman aktarimi onerilir.
4. "Insan uzmana aktar" butonu destek bileti olusturur.
5. Uzman havuzundan UX, urun, teknik veya alan uzmani secilir.
6. Uzman yaniti konusma kaydina eklenir.
7. Ticket kapatilabilir.

## Validation

- `npm run typecheck`
- `npx expo prebuild --platform android --no-install`
- `JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot ./gradlew assembleRelease`

## Checklist

- [x] Yalnizca `submissions/231118040-nokta-human-support/` altinda degisiklik yapildi
- [x] README'de Expo QR linki var
- [x] README'de 60 sn demo video linki var
- [x] `app-release.apk` klasorde mevcut
- [x] README'de decision log var
- [x] Track secimi README'de net

## Decision Log

- 2026-05-10: Web Speech / Three.js yerine Expo uyumlu tek ekranli RN prototipi secildi.
- 2026-05-10: Insan destegi gercek backend yerine destek bileti ve uzman sohbeti simulasyonu olarak tasarlandi.
- 2026-05-10: AI kararinin tek basina son karar olmamasi icin guven puani ve risk bayraklari eklendi.
- 2026-05-10: Hassas alanlarda otomatik olarak alan uzmanina yonlendirme yapildi.
- 2026-05-11: PR #102 kapsami mascot web prototipinden insan destek Expo teslimine cevrildi.

## AI Tool Log

- OpenAI Codex: Expo uygulama kodu, uzman destegi akisi, APK build, demo assetleri, README ve PR hazirligi.
