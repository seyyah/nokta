Track: B

# Nokta — Human Expert Support & 3D Avatar (Final Week)

**Öğrenci No:** 231118004  
**Track:** B — Yaratıcılık (Çoklu Avatar Varyantları & Müşteri-Geliştirici Use Case'i)  
**Slug:** human-dot

---

## APK İndirme & Kurulum

> ⚠️ **Not — Yeni APK Neden Alınamadı?**  
> Bu hafta eklenen `react-three-fiber` + `three.js` + `expo-gl` bağımlılıkları nedeniyle `node_modules` klasörü **~537 MB**'a ulaştı; toplam proje ağırlığı **~2.2 GB** oldu. EAS cloud build süreci başlatıldı ancak proje boyutu upload limitini aştığından yeni APK üretilemedi. **Kaynak kod tamamen eksiksiz olup** `expo start` ile Expo Go üzerinde veya lokal EAS build ile çalıştırılabilir.

Önceki haftalarda üretilmiş **çalışan APK** hem EAS linki üzerinden hem de `app-release.apk` dosyası olarak teslim paketinde yer almaktadır:

![APK QR](https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://expo.dev/artifacts/eas/4b6oqyjzyzUdwTbshC8Ui8.apk)

> **[📦 APK'yı İndir (Android)](https://youtube.com/shorts/opfmHfNz7iA?feature=share)**

Ayrıca `app-release.apk` ismiyle klasörde de bulunmaktadır.

---

## Demo Video

> **[▶ Nokta Human-Dot & 3D Avatar Demo Videosu (YouTube)](https://youtube.com/shorts/w_Lqlu7HaTs?feature=share)**

---

## Uygulama Hakkında

Ham bir fikri metin veya ses olarak alır, **Gemini AI ile 5 mühendislik sorusu** sorar, cevaplara göre tek sayfalık spec üretir.
Bu hafta eklenen **3 yeni katmanla** birlikte halkayı kapatıyoruz:

### Ekranlar & Özellikler

| Ekran / Katman           | Özellik                                                                                                                                        |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Home**                 | Fikir girişi + Geçmiş + Uzman butonları + **Forge İzleyici Widget'ı**                                                                          |
| **Chat**                 | Gemini **streaming** ile soru üretimi — her chunk'ta cursor animasyonu                                                                         |
| **Spec**                 | 3 sekme: Spec kartı / Nokta Skoru / Stack & Maliyet                                                                                            |
| **History**              | AsyncStorage ile kaydedilen tüm analizler, tekrar açılabilir                                                                                   |
| **Expert**               | Firebase Realtime Database üzerinden **gerçek iki-telefon yazışması**                                                                          |
| **Audit Widget**         | Uygulama içi yüzen buton ile ekran görüntülü hata raporu (.md) oluşturma aracı                                                                 |
| **Ses Modu (Yeni)**      | `expo-av` mikrofondan gerçek zamanlı metering alarak OpenAI stili **Voice Visualizer** bar zıplatması ve **3D Avatar Lipsync** senkronizasyonu |
| **Çoklu Persona (Yeni)** | **Junior-Sen** (tiz/hızlı ses, yeşil neon aydınlatma) ve **Senior-Sen** (derin/sakin ses, altın aydınlatma) personaları arasında geçiş         |
| **Uzman Köprüsü (Yeni)** | Forge döngüsünde 2 cycle üst üste FAIL/ROLLBACK (STUCK) alındığında otomatik açılan görüntülü **WebRTC Jitsi Meet** bağlantısı                 |

### Teknik Özellikler

- **Voice Visualizer (FFT/RMS)** — `expo-av` ile mikrofondan alınan ses dalgasının metering (dB) seviyesi 60ms aralıkla okunarak barlar zıplatılır. Gecikme süresi **< 200ms** seviyesindedir.
- **3D Lipsync Avatar (R3F)** — `react-three-fiber` + `three.js` + `expo-gl` kullanılarak kullanıcının kendi yüzüyle oluşturulan `avatar.glb` modeli yüklenir. Ses seviyesi LERP filtresi üzerinden modelin `jawOpen` / `mouthOpen` morph target'larına bağlanarak dudak senkronu sağlanır.
- **Dikte (Voice -> STT -> Markdown)** — Ses kaydı tabanlı dikte butonu ile ses verisi base64 olarak Gemini 2.0 Flash API'ye gönderilir. AI bunu doğrudan profesyonel markdown hata/talep raporu olarak çözümleyip ekrana basar.
- **WebRTC Expert Bridge** — `react-native-webview` üzerinde Jitsi Meet (`#config.prejoinPageEnabled=false`) parametreleriyle app yönlendirmesi olmadan doğrudan gömülü ses/video/ekran paylaşımı bağlantısı kurulur.

---

## Decision Log

| Karar                    | Neden                                                                                                                                                      |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Track B devam            | Geçen haftaki yaratıcılık (müşteri-geliştirici) temasına iki farklı sürümümüzü (Junior ve Senior) entegre etmek en yaratıcı çözümdü.                       |
| LERP Filtresi            | Ağız hareketlerindeki ani zıplamaları engelleyip yumuşak geçişler ve doğal konuşma efekti elde etmek için.                                                 |
| Gemini Multimodal STT    | Klasik cihaz içi STT kütüphaneleri yerine base64 sesi doğrudan Gemini 2.0'a besleyerek hem çözümleme hem de markdown rapor formatlama tek çağrıda yapıldı. |
| Custom UserAgent WebView | Jitsi Meet'in mobil tarayıcılarda sürekli "Uygulamayı İndir" uyarısı vermesini engellemek ve doğrudan WebRTC odaya bağlamak için.                          |
| Yeni APK Alınamadı       | three.js/R3F bağımlılıkları node_modules'i ~537MB'a çıkardı (toplam ~2.2GB). Kaynak kod eksiksiz, eski APK teslimde mevcut.                                |

---

## AI Tool Log & Forge Ledger

- **Antigravity (Gemini 2.5 Pro):** Mimari kararlar, tüm ekran kodları, R3F model entegrasyonu, Jitsi WebView konfigürasyonu.
- **Gemini 2.0 Flash API:** Multimodal ses transcription (STT) ve spec üretimi.
- **EAS Build:** Cloud APK üretimi.

**Forge Ledger:** Toplam 7 döngü loglanmıştır (5 Başarılı, 1 Rollback, 1 Fail). Detaylar `FORGE.md` dosyasında yer almaktadır.

---

## Teslim Öncesi Self-Check (Checklist)

- [x] `README.md` ilk satırında Track: B var
- [x] `app/` altında çalışan Expo projesi + `AuditWidget` mount edildi
- [x] `avatar.glb` model dosyası (kullanıcının kendi yüzü / placeholder) mevcut
- [x] `audit-reports/` altında burn-in'li raporlar mevcut
- [x] `FORGE.md` ledger: ≥5 başarılı + ≥1 rollback + ≥1 fail cycle güncellendi
- [x] `PERSONAS.md` (Track B varyant detayları) eklendi
- [x] `BRIDGE.md` (Uzman görüntülü köprü transkript özeti) eklendi
- [x] `app-release.apk` mevcut (önceki hafta build — yeni build three.js/R3F nedeniyle ~2.2GB'a ulaştığından alınamadı, bkz. APK notu)
- [x] Root dizine kesinlikle dokunulmadı (sadece `submissions/231118004-human-dot/` altı güncellendi)
- [x] (Track B) `IDEA.md` dosyası eklendi (Müşteri Geliştirici Use Case'i)
- [x] Demo video linki eklendi
