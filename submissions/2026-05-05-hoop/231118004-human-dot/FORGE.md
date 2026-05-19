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
