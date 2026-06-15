# Nokta — Entegre Sesli Asistan ve Forge Pipeline

Bu proje, Expo tabanlı bir mobil uygulamada gerçek zamanlı sesli asistan, canlı ses görselleştirmesi, 3B avatar ve otomatik "forge" raporlama hattını bir arada sunar. Kullanıcı konuştuğunda mikrofon sesi yakalanır, metne dönüştürülür, akıllı forge mantığıyla değerlendirilir, otomatik hata/rollback/uzman yükseltme stratejileri uygulanır ve sonuç sesli olarak okunur.

## Proje Sahibi

- İsim: Safiye Özkan
- Numara: 241478074

## Öne çıkanlar

- Canlı mikrofon kaydı ve ses seviye analizi
- FFT tabanlı frekans görselleştirme ve RMS ölçümü
- 3B avatar ile speech-driven lipsync ve ses dalga formu görselleştirme
- `ForgeEngine` ile otomatik yeniden deneme, rollback ve stuck durumu tespiti
- `FORGE.md` dosyasına otomatik markdown raporlama
- Jitsi tabanlı uzman köprüsü için `app/bridge.tsx`

## Proje Yapısı

- `app/assistant.tsx` — sesli asistan ve avatar ekranı
- `app/services/audio` — mikrofon, FFT, RMS ve kayıt yönetimi
- `app/components/avatar` — yüz hareketleri ve konuşma animasyonu
- `app/services/forge` — rapor üretimi, retry/rollback, escalation
- `app/bridge.tsx` — uzman görüşmesi köprüsü
- `app/src/store/usePersonaStore.ts` — persona seçimi ve ses profilleri

## Kurulum

```bash
cd "241478074-nokta/app"
npm install
npx expo start
```

## Çalıştırma

- `npm run android` veya `npx expo start --android`
- Web test için `npm run web`

## Kullanım

1. Uygulamayı açın
2. `Sesli Nokta Asistanını Başlat` butonuna basın
3. Mikrofonu açın ve konuşun
4. `WhisperService` konuşmanızı metne çevirir
5. `ForgeEngine` yanıt üretir, kritik durumlarda retry/rollback ya da uzman eskalasyonu başlatır
6. `TTSService` sonucu sesli okumayı tamamlar
7. Rapor otomatik olarak `FORGE.md` dosyasına kaydedilir

## Demo Bağlantısı

- Expo Preview (sahte örnek bağlantı): https://expo.dev/@safiyeozkan/nokta-production-updated


## Not

Bu proje, tek bir tam entegre hat üzerinde çalışan canlı bir sesli asistan deneyimi sunar. `app/assistant.tsx` üzerinden başlatılan akış, gerçek zamanlı ses verisi, avatar görselleştirmesi, otomatik forge raporu ve uzman görüşmesi katmanlarını bir araya getirir.
