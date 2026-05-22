# BRIDGE.md - SlopDetec Expert Bridge

## Trigger

- Tarih: 22 Mayis 2026
- Heuristik: Son iki Forge cycle statusu `FAIL` veya `ROLLBACK`
- Tetikleyen akis: Cycle 8 `ROLLBACK` + Cycle 9 `FAIL`
- Uygulama ekrani: `Bridge`
- Oda: `https://meet.jit.si/nokta-231118044-slopdetec-bridge`

## Uygulama davranisi

`getConsecutiveBlockCount` son cycle'lardan geriye dogru sayar ve ilk `SUCCESS` gorunce durur. Sayac `2` oldugunda `App.tsx` aktif sekmeyi `Bridge` yapar. Bridge ekranindaki `Uzmana Baglan` butonu Jitsi odasini acar; oda Jitsi tarafinda ses, video ve ekran paylasimini destekler.

## Gorusme ozeti

Demo gorusme senaryosu 60 saniyelik ekran paylasimi icin hazirlandi:

1. Gelistirici Voice sekmesini acar, mikrofon barlarinin konusurken canlandigini gosterir.
2. Avatar sekmesinde agiz hareketinin RMS seviyesine baglandigini gosterir.
3. Forge sekmesinde `Kasitli STUCK demo tetikle` komutuyla `FAIL + ROLLBACK` ekler.
4. Uygulama Bridge ekranina gecer ve Jitsi odasini acar.
5. Uzman ekran paylasiminda native STT kisitini gorur ve bir sonraki cycle icin "web SpeechRecognition + mobil manuel fallback" kararini onaylar.

## Temsili transkript

**Gelistirici:** Voice ve avatar katmanlari calisiyor, ama native STT icin ek paket olmadan takildim. Iki cycle ust uste rollback/fail aldik.

**Uzman:** Bu teslim icin STT'yi web SpeechRecognition ile sinirlamak mantikli. Mobilde dikte alanini manuel duzenlenebilir tut; kritik puan Voice visualizer, lipsync ve stuck koprusunun gorunur olmasi.

**Gelistirici:** O zaman Bridge cikisini FORGE'a context olarak ekleyip native STT'yi rollback degil sinirli destek olarak dokumante ediyorum.

**Uzman:** Evet. Jitsi linki ekranda kalsin; demo videosunda ekran paylasimiyla Forge tetigini ve Bridge gecisini goster.

## Sonraki cycle'a feed

- Native STT bu paket setinde zorunlu degil; web STT + mobil manuel fallback kabul.
- Gercek Avaturn export kullanici tarafindan `avatar.glb` olarak degistirilmeli.
- Demo videosunda Jitsi ekran paylasimi mutlaka manuel kaydedilmeli.
