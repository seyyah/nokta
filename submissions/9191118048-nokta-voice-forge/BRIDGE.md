# BRIDGE.md - Expert Bridge

## Otomatik Tetik

- Heuristik: `STUCK_THRESHOLD = 2`
- Sayilan sonuclar: `FAIL`, `ROLLBACK`, `STUCK`
- Davranis: Iki ardisik basarisizliktan sonra Forge ekrani STUCK banner gosterir ve Expert Bridge'e yonlendirir.
- Sonraki cycle: Kaydedilen bridge context yeni Forge hipotezine otomatik eklenir.

## Entegrasyon

- Saglayici: Jitsi Meet
- Acilis: Uygulama icinden `expo-web-browser`
- Oda: Uygulamanin olusturdugu/ayarladigi Jitsi oda URL'si
- Desteklenen gorusme ozellikleri: ses, video ve Jitsi ekran paylasimi

## Kasıtlı STUCK Senaryosu

Forge demo verisinde bir `ROLLBACK` sonrasinda cozulmeyen bir `STUCK` cycle bulunur. Bu durum Expert Bridge butonunu gorunur hale getirir ve insan yardimi akisini demonstre eder.

## Gercek Gorusme Kaniti

Bu dosyada gercek uzman gorusmesi yapilmis gibi uydurma katilimci, sure veya transkript tutulmaz. Teslimden once uygulama icinden en az 60 saniyelik gercek gorusme yapilmali ve asagidaki alanlar doldurulmalidir:

- Tarih:
- Katilimcilar:
- Toplam sure:
- Ses testi:
- Video testi:
- Ekran paylasimi testi:
- Otomatik transkript dosyasi / ozeti:
- Sonraki Forge cycle'a aktarilan context:

## Beklenen Demo Akisi

1. Forge ekraninda iki ardisik basarisiz cycle gosterilir.
2. Agent STUCK durumunu tespit eder.
3. `Uzmana Baglan` ile Jitsi gorusmesi acilir.
4. En az 60 saniye ses, video ve ekran paylasimi gosterilir.
5. Gorusme ozeti bu dosyaya yazilir ve sonraki cycle'a context olarak aktarilir.
