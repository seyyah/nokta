# FORGE.md — nokta-human-dot Cycle Ledger

**Uygulama:** nokta-human-dot (submissions/231118004-human-dot)  
**Track:** B — Yaratıcılık
**Agent:** Antigravity (Google DeepMind)  
**Ratchet kuralı:** Yeni fix eskiyi kıramaz; evaluation set monoton büyür.  
**Cycle süresi:** Cycle başına maks. 15 dakika.

---

## Cycle Tablosu

| # | Rapor | Hipotez | Sonuç | Değişen Dosya(lar) | Test | Commit Hash | kg | Human Touch |
|---|-------|---------|-------|--------------------|------|-------------|----|-------------|
| 1 | Rapor 1 (Home) | KeyboardAvoidingView behavior `height` yerine `undefined` olursa Android'de titreme durur. | SUCCESS | HomeScreen.js | Manuel | (local) | 12kg | Behavior düzeltildi. |
| 2 | Rapor 1 (Chat) | questions.map yerine answers.length + 1'e göre slice atarsak sorular tek tek gelir. | SUCCESS | ChatScreen.js | Manuel | (local) | 18kg | map() fonksiyonu güncellendi. |
| 3 | Rapor 1 (Expert)| SpecScreen expertRequestId'yi History'ye kaydedip ExpertScreen'e paslarsa, ExpertScreen tekrar gönderim yapmaz ve öğrenci yanıtı görür. | SUCCESS | SpecScreen.js, HistoryScreen.js, ExpertScreen.js | Manuel | (local) | 35kg | expertRequestId flow kuruldu. |
| 4 | Rapor 2 (History) | HistoryScreen'de ScrollView yerine FlatList kullanılarak render performansı artırılabilir. | ROLLBACK | HistoryScreen.js | Manuel | (local) | 5kg | Performans iyiydi ama item'lar arası tasarım bozuldu. |
| 5 | Rapor 3 (Voice) | Ses kaydı metering verisini LERP ile morph target'a bağlarsak ağız hareketleri akıcı olur. | SUCCESS | VoiceScreen.js | Manuel | (local) | 42kg | LERP gecikme azaltma. |
| 6 | Rapor 4 (Expert) | Jitsi native SDK paketini ekleyerek görüntülü görüşme ekranı oluşturulabilir. | FAIL | package.json | Derleme | - | 0kg | Bağımlılık hatası, derleme başarısız. |
| 7 | Rapor 4 (Expert) | Jitsi Meet web arayüzünü react-native-webview ve özel userAgent ile gömersek sorunsuz çalışır. | SUCCESS | ExpertCallScreen.js, App.js, HomeScreen.js | Manuel | (local) | 58kg | WebView ve animasyon entegrasyonu. |

---

> Audit raporları telefondan üretildikten sonra her cycle buraya loglanacak.
> Format: `[FORGE: EkranAdı] Açıklama — Xkg`

---

## Cycle Detayları

*(Her cycle tamamlandıktan sonra buraya eklenir)*

### Cycle #1 - Home Ekranı Klavye Titremesi
- **Problem**: Android cihazlarda klavye açıldığında `KeyboardAvoidingView` ekranı titretir.
- **Onarım**: `HomeScreen.js` dosyasında `behavior={Platform.OS === 'ios' ? 'padding' : undefined}` yapılarak Android için otomatik boyutlandırma `adjustResize`a bırakıldı.

### Cycle #2 - Chat Ekranı Soru Akışı
- **Problem**: Chat ekranında AI'ın oluşturduğu 5 soru aynı anda ekranda beliriyor ve karışıklık yaratıyordu.
- **Onarım**: `ChatScreen.js` dosyasında, soruların render edildiği yerde `questions.slice(0, answers.length + 1).map(...)` kullanılarak soruların birer birer (cevap verildikçe) ekrana gelmesi sağlandı.

### Cycle #3 - Uzman Ekranı Çift İstek ve Kayıp Yanıtlar
- **Problem**: Spec oluşturulduğunda `SpecScreen` arka planda Firebase'e istek atıyor ancak ID'yi saklamıyordu. "Uzman Görüşü İste" butonuna basıldığında `ExpertScreen` aynı isteği ikinci kez atıyor (çift istek) ve yeni bir ID oluşuyordu. Öğrenci "Geçmiş" ekranından Spec'e dönüp tekrar uzman görüşüne gitmek istediğinde üçüncü kez istek atıldığı için asıl yanıtlara asla ulaşamıyordu.
- **Onarım**: 
  - `SpecScreen.js`: Firebase submit işlemi esnasında gelen `expertRequestId` yakalanarak `storageService` (Geçmiş) üzerine kaydedildi ve yönlendirme parametresi olarak eklendi.
  - `HistoryScreen.js`: Geçmişten açılan kayıtların `expertRequestId`'si taşındı.
  - `ExpertScreen.js`: `expertRequestId` mevcutsa yeni bir istek oluşturmak yerine doğrudan o ID'yi dinlemesi (listen) sağlandı. Böylece çift gönderim engellendi ve eski taleplere yazılan yanıtların öğrenci tarafından görülmesi garantilendi.

### Cycle #4 - History Ekranı Liste Performansı
- **Problem**: Geçmiş analizlerin listelendiği History ekranında elemanlar `ScrollView` içerisinde `map()` ile basılıyordu. Uzun listelerde bellek sızıntısına yol açabilir hipotezi ortaya atıldı.
- **Onarım**: Bütün liste `FlatList` component'ine geçirildi.
- **Sonuç (ROLLBACK)**: Performans olarak çok ciddi bir artış görülmedi ancak mevcut padding/margin yapıları bozulduğu için UI/UX açısından sorun yarattı. İnsan onayıyla rollback yapılıp eski yapıya dönüldü.

### Cycle #5 - Ses Modu Akıcı Ağız Senkronizasyonu
- **Problem**: Mikrofona konuşulduğunda ağız hareketlerindeki gecikme ve ani sıçramalar yapay duruyordu.
- **Hipotez**: Ham metering verisi doğrudan morph target değerine atanmak yerine, `THREE.MathUtils.lerp` filtresinden geçirilirse hareketler <200ms gecikmeyle yumuşatılabilir.
- **Onarım**: `VoiceScreen.js` içinde `useFrame` render döngüsünde `influences[targetIdx] = THREE.MathUtils.lerp(influences[targetIdx], mouthOpenVal, 0.22)` entegre edildi.
- **Sonuç**: Ağız hareketleri gecikmesiz ve son derece doğal, yumuşak bir hal aldı.

### Cycle #6 - Native Jitsi SDK ile Uzman Köprüsü
- **Problem**: Uygulamada tıkandığında görüntülü uzman görüşmesi başlatabilmek için native paket entegrasyonu denendi.
- **Hipotez**: Jitsi native SDK paketi eklenerek yerel bir çağrı ekranı açılabilir.
- **Onarım**: Projeye ağır native Jitsi bağımlılıkları eklenmeye çalışıldı.
- **Sonuç (FAIL - STUCK)**: Paket, Expo SDK 54 ile derleme hatası verdi ve yerel derleme çöktü. Ajan bunu çözemediği için süreç tıkandı (stuck).

### Cycle #7 - WebView Tabanlı Görüntülü Köprü Entegrasyonu
- **Problem**: Önceki cycle'da native paket derleme hatası sebebiyle döngü tıkanmıştı.
- **Hipotez**: Jitsi Meet web arayüzünü `react-native-webview` ve özel `userAgent` parametreleriyle gömersek, tarayıcı veya uygulama yönlendirme uyarılarını aşarak görüntülü çağrıyı sorunsuz açabiliriz.
- **Onarım**: `ExpertCallScreen.js` oluşturularak WebView Jitsi oda URL'sine `#config.prejoinPageEnabled=false&interfaceConfig.MOBILE_APP_PROMO=false` eklendi ve Platform-specific userAgent tanımlandı.
- **Sonuç**: Çağrı; ses, video ve ekran paylaşım desteğiyle birlikte tamamen stabil şekilde çalıştı.
