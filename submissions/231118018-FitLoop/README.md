# Nokta Away Mission - Solo Seferi

**Ogrenci No:** 231118018  
**Isim:** Elcin Erdemir  
**Secilen Track:** Track 2 - Pitch Analizi ve Slop Score

---

## Proje Vizyonu
**FitLoop**, kullanicinin gunluk yemek, su ve aktivite bilgisini tek ekranda toplayip anlik bir `FitScore` ureten mobil bir fitness micro-coach uygulamasidir. Amac, karmasik wellness uygulamalarinin agir deneyimi yerine 30-60 saniyede veri girilen, hemen geri bildirim veren ve dusuk performansta yonlendirici aksiyon sunan sade bir mobil deneyim olusturmaktir.

---

## Teknik Stack ve Teslimat
- **Framework:** React Native + Expo
- **Dil:** TypeScript
- **State / Persist:** React Context + AsyncStorage
- **Navigasyon:** React Navigation
- **Gorsellestirme:** `react-native-svg` ile skor gostergesi
- **Mimari:** Tum hesaplamalar cihaz uzerinde, harici API baglantisi yok

### Linkler
- **Expo Project / QR:** https://expo.dev/accounts/eexnmy/projects/FitLoop
- **EAS Build:** https://expo.dev/accounts/eexnmy/projects/FitLoop/builds/51194e1e-7ffb-42d4-9de0-1bb393311e82
- **60 Sn Demo Videosu:** https://youtube.com/shorts/sySnhjO2TzY
- **APK Dosyasi:** `./app-release.apk`

---

## Uygulama Ozeti
Kullanici tek bir ekranda su verileri girer:
- Serbest metin olarak yemek ozeti
- Gunluk su miktari
- Aktivite seviyesi

Uygulama bunlardan su ciktilari uretir:
- `FitScore (0-100)`
- Kisa coach mesaji
- Dusuk skor durumunda 3 gunluk toparlanma meal plan

Bu yapi sayesinde uygulama bir "tracking dashboard" olmaktan cok, hizli karar veren ve kullaniciyi yormayan bir mikro koç akisi gibi davranir.

---

## Decision Log
1. **Neden bu yapi?** Genis kapsamli bir fitness uygulamasi yerine tek ekranli, hizli veri girisine dayali dar kapsamli bir MVP secildi.
2. **Skor mantigi:** Kullaniciya sadece veri saklayan bir arayuz degil, aninda yorum ureten bir deneyim vermek icin `FitScore` modeli eklendi.
3. **Yerel mimari karari:** Harici AI veya beslenme API'lari kullanilmadi; boylece demo kararliligi korundu ve uygulama offline'a yakin bir basitlikte tutuldu.
4. **Dusuk skor fallback'i:** Kullaniciyi sadece "kotu skor" ile birakmamak icin 50 alti durumda otomatik 3 gunluk basit meal plan akisi tasarlandi.
5. **UI karari:** Yogun kullanicilar icin okunakli, kart tabanli ve dikkat dagitmayan sade bir mobil arayuz tercih edildi.
6. **Persist katmani:** Gecmis girisler ve profil verisi `AsyncStorage` ile cihazda saklandi.

---

## Engineering Trace
Proje su teknik kararlar etrafinda sekillendi:
- `feat: gunluk veri girisi ve anlik FitScore akisi`
- `feat: dusuk skor icin toparlanma planı mantigi`
- `feat: gecmis ve profil ekranlari`
- `refactor: hesaplama ve coach mantigini service katmanina ayirma`

---

## Teslim Icerigi
- `README.md`
- `idea.md`
- `app/`
- `app-release.apk`
