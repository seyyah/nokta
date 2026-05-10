# Nokta Human Support

## Submission

- Öğrenci no: 231118040
- Slug: nokta-human-support
- Track: Nokta uzman desteği / insan desteği katmanı

## Özet

Bu teslim, Nokta'nın yalnızca AI cevabı üretmesini değil, gerektiğinde insan uzmana devretmesini sağlar. Uygulama fikri önce AI katmanında analiz eder, güven puanı ve risk bayrakları çıkarır, sonra uygun uzman profilini seçip destek bileti açar.

## Çalıştırma

```bash
cd submissions/231118040-nokta-human-support/app
npm install
npm run start
```

Expo Go ile QR kod okutularak mobilde açılabilir. APK build için yerel Android SDK varsa:

```bash
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```

## Uzman Desteği Akışı

1. Kullanıcı fikri veya problemi yazar.
2. Nokta AI güven puanı, alan, öncelik ve risk bayraklarını çıkarır.
3. Güven düşükse veya konu hassassa insan uzman aktarımı önerilir.
4. "İnsan uzmana aktar" butonu destek bileti oluşturur.
5. Uzman havuzundan UX, ürün, teknik veya alan uzmanı seçilir.
6. Uzman yanıtı konuşma kaydına eklenir ve ticket kapatılabilir.

## Demo

- Expo QR: `npm run start` çıktısındaki QR kod ile üretilir.
- 60 sn demo senaryosu: `idea.md` dosyasındaki "Demo Akışı" bölümünde yazılıdır.
- APK: `app-release.apk` bu klasörde yer alır.

## Validation

- `npm run typecheck`
- `npx expo prebuild --platform android --no-install`
- `JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot ./gradlew assembleRelease`

## Decision Log

- 2026-05-10: Web Speech / Three.js yerine Expo uyumlu tek ekranlı RN prototipi seçildi.
- 2026-05-10: İnsan desteği gerçek backend yerine destek bileti ve uzman sohbeti simülasyonu olarak tasarlandı.
- 2026-05-10: AI kararının tek başına son karar olmaması için güven puanı ve risk bayrakları eklendi.
- 2026-05-10: Hassas alanlarda otomatik olarak alan uzmanına yönlendirme yapıldı.
- 2026-05-10: PR kapsamı repo kuralına uygun şekilde yalnızca `submissions/231118040-nokta-human-support/` altında tutuldu.

## AI Tool Log

- OpenAI Codex: Expo uygulama kodu, uzman desteği akışı, README ve PR hazırlığı.
