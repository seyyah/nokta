
# NOKTA FINAL WEEK

## Entegre Sistemler
- Sesli asistan + konuşma işleme
- Gerçek zamanlı frekans/RMS görselleştirme
- 3B avatar, miks ve lip-sync benzeri ağız hareketleri
- Forge retry, rollback ve stuck detection
- Otomatik `FORGE.md` rapor üretimi
- Jitsi tabanlı uzman köprüsü

## Kurulum

```bash
cd "241478074-nokta/app"
npm install
```

## Çalıştırma

```bash
npx expo start
```

Android için:

```bash
npx expo run:android
```

## Kullanım

- Home ekranındaki `Sesli Nokta Asistanını Başlat` butonuna basarak sesli akışı tetikleyin.
- Asistan, ses kaydını işleyip metne çevirir, forge hattında değerlendirir ve sonucu TTS ile seslendirir.
- Her döngü sonunda otomatik olarak `FORGE.md` raporu üretilir ve uygulamanın belge klasörüne kaydedilir.

## Notlar

- Bu uygulama artık ayrı bir demo kurulumuna ihtiyaç duymaz.
- `FORGE.md`, her yeni sesli asistan talebinde otomatik olarak güncellenir.
