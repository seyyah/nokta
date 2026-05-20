# Submission — 211118018-dot-capture

## Track secimi

- **Track A — Dot Capture & Enrich**
- **Text-only**: Ham fikir sadece metin olarak alinir.
- **Offline deterministic mode**: Harici AI API entegrasyonu yoktur. Engineering sorulari sabit bir soru seti ile yonetilir ve tek sayfa spec uretilir.

## Expo (QR / link)

Expo calisma oturumundan alinan link:

- **Expo Go linki**: `exp://10.229.111.249:8081`
- **QR kodu**: `npx expo start` calisirken terminalde uretilen QR kodu ile Expo Go uzerinden acilir (QR, link ile ayni Metro oturumuna baglanir).
- **Not (LAN)**: `exp://10.x...` adresi bilgisayarinizin yerel agina baglidir; ag degisirse yeniden uretmeniz gerekebilir. Okul aglarinda sorun olursa `npx expo start --tunnel` ile daha stabil bir oturum alin.

Calistirma:

```bash
cd submissions/211118018-dot-capture/app
npm install
npx expo start
```

Not: Okul aginda LAN sorunlari olursa `npx expo start --tunnel` deneyebilirsin.

## 60 sn demo video

- **Video linki**: `https://youtube.com/shorts/EJ32QLcg9Wk?feature=share`

## APK

- Dosya: `submissions/211118018-dot-capture/app-release.apk`
- Android release APK uretildi ve submission klasorune eklendi.
- Not: Windows uzun yol limitleri nedeniyle release build, kisa bir calisma dizininde (`D:\\dc`) alindi; kaynak kod `app/` klasorunde kalir.

## Decision log

1. **Track A** secildi cunku tek ekran akisiyla (dot -> sorular -> spec) en hizli ve en az riskli teslim mumkun.
2. **Ses girdisi** bilincli olarak scope disi birakildi (zaman ve test maliyeti).
3. **Harici AI API yok** karari alindi; teslimin deterministik ve offline calisir olmasi onceliklendi.
4. Engineering sorulari **4 sabit soru** olarak standardize edildi (problem, kullanici, MVP scope, constraint).
5. Spec ciktisi **tek sayfa markdown benzeri metin** olarak sabitlendi; rubric'teki "track ana akisi" ile hizalandi.
6. UI **tek dosya (`App.tsx`)** ile tutuldu; hizli iterasyon ve dusuk bagimlilik hedefi.
7. Soru ekranina secilebilir oneriler eklendi; kisa cevaplarin daha profesyonel spec metnine donusmesi saglandi.
8. Geri navigasyon, status bar uyumu ve klavye responsive davranisi (android resize + keyboard avoiding) duzenlendi.
9. Android release APK Gradle ile uretildi; Windows uzun yol sorunlari icin `newArchEnabled` kapatildi ve build kisa dizinde alindi.
10. APK `submissions/211118018-dot-capture/app-release.apk` olarak submission kokune kondu.

## AI araclari (gelistirme)

- Cursor ile kod uretildi ve duzenlendi.
