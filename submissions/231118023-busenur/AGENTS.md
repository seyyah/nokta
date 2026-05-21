# Otonom Coding Agent Forge Döngüsü Raporu (AGENTS.md)

**Öğrenci No:** 231118023  
**Öğrenci Adı Soyadı:** Busenur  
**Seçilen Track:** Track A (Sadelik ve Drop-in Entegrasyon)

Bu doküman, Nokta challenge kapsamında `@xtatistix/mobile-audit` widget'ı tarafından üretilen hata raporlarının otonom yazılım ajanı döngüsüyle (`READ → LOCATE → HYPOTHESIZE → REPAIR → TEST → VERIFY → COMMIT/ROLLBACK`) nasıl düzeltildiğini veya geri alındığını (rollback) kronolojik olarak belgeler. Her bir döngü 15 dakikalık zaman kutusunda (time-box) gerçekleştirilmiştir.

---

## 🔄 Forge Döngüleri Özeti

| Döngü | Hata Tipi | Hedef Ekran | Hipotez/Çözüm | Sonuç | İşlem |
|---|---|---|---|---|---|
| **Cycle 1** | Layout Overflow | DashboardScreen | Hızlı ekle butonlarının flex wrap ile sarılması | Başarılı | COMMIT |
| **Cycle 2** | Form Validation | SettingsScreen | Sayısal olmayan/negatif girdi kontrolü | Başarılı | COMMIT |
| **Cycle 3** | State Sync | HistoryScreen | Kayıt silinince App state'ini güncelleme | Başarılı | COMMIT |
| **Cycle 4** | Theme Breakdown | SettingsScreen | Hatalı absolute yerleşim düzeltmesi (Hata) | Başarısız | ROLLBACK |

---

## 🔍 Detaylı Döngü Logları

### 🌀 Cycle 1: Hızlı Ekleme Butonlarının Taşması (DashboardScreen Layout Bug)
- **Zaman Kutusu:** 18:00 - 18:12 (12 dk)
- **Adımlar:**
  1. **READ:** `reports/report-bug-1.md` okundu. Hızlı su ekleme butonlarının (250ml, 500ml, 750ml) küçük ekranlarda yatayda sığmayarak taşma yaptığı belirlendi.
  2. **LOCATE:** `src/components/Dashboard.tsx` dosyasındaki `btnRow` ve `waterBtn` stilleri tespit edildi.
  3. **HYPOTHESIZE:** Butonların genişliği `110` piksel olarak sabitlenmiş ve satır sarması (`flexWrap`) tanımlanmamıştı. Stil nesnesine `flexWrap: 'wrap'` eklenmeli, butonların genişliği `flex: 1` ve `minWidth: 90` yapılarak esnekleştirilmelidir.
  4. **REPAIR:** `Dashboard.tsx` stilleri güncellendi.
  5. **TEST:** `npx tsc --noEmit` çalıştırıldı. Derleme hatasız tamamlandı.
  6. **VERIFY:** Görsel taşmanın çözüldüğü ve butonların ekran genişliğine göre kendilerini esnek şekilde hizaladığı doğrulandı.
  7. **COMMIT:** `576279d` id'li commit yapıldı: *"fix(dashboard): solve layout overflow on quick add buttons by adding flexWrap"*

---

### 🌀 Cycle 2: Kilo ve Hedef Değerlerinin NaN Olması (SettingsScreen Form Bug)
- **Zaman Kutusu:** 18:15 - 18:27 (12 dk)
- **Adımlar:**
  1. **READ:** `reports/report-bug-2.md` okundu. Kilo veya hedef alanlarına negatif sayılar ya da geçersiz metin girildiğinde uygulamanın bunu kaydettiği ve NaN değerleri ürettiği saptandı.
  2. **LOCATE:** `src/components/Settings.tsx` dosyasındaki `handleSave` metodu tespit edildi.
  3. **HYPOTHESIZE:** `TextInput` girdileri doğrudan `parseFloat` ve `parseInt` işlemine sokuluyordu. Sayısal kontrol (`isNaN`) ve pozitif sayı kontrolü (`val <= 0`) yapılıp kullanıcıya uyarı verilmelidir.
  4. **REPAIR:** `Settings.tsx` dosyasına `Alert` bileşeni eklendi ve `handleSave` içerisine doğrulama mantığı entegre edildi.
  5. **TEST:** `npx tsc --noEmit` çalıştırıldı. Derleme başarıyla tamamlandı.
  6. **VERIFY:** Negatif veya alfabetik girişlerin engellendiği ve geçerli uyarı mesajlarının gösterildiği doğrulandı.
  7. **COMMIT:** `778972e` id'li commit yapıldı: *"fix(settings): add positive number validations to weight and goal inputs"*

---

### 🌀 Cycle 3: Kayıt Silindiğinde dashboard'un Güncellenmemesi (State Sync Bug)
- **Zaman Kutusu:** 18:30 - 18:41 (11 dk)
- **Adımlar:**
  1. **READ:** `reports/report-bug-3.md` okundu. Geçmiş sekmesinden bir su kaydı silindiğinde veri tabanının güncellendiği fakat ana sayfadaki toplam tüketim göstergesinin değişmediği anlaşıldı.
  2. **LOCATE:** `App.tsx` dosyasındaki `handleDeleteLog` fonksiyonu incelendi.
  3. **HYPOTHESIZE:** `handleDeleteLog` fonksiyonunda `setLogs` ile logs dizisi güncellenirken, toplam su miktarını tutan `currentWater` state'inin yeniden hesaplanıp güncellenmediği fark edildi.
  4. **REPAIR:** `App.tsx` içerisindeki `handleDeleteLog` metoduna silme sonrasındaki toplamı hesaplayan ve `setCurrentWater` fonksiyonunu çağıran kod satırları eklendi.
  5. **TEST:** `npx tsc --noEmit` çalıştırıldı. Derleme hatasız geçti.
  6. **VERIFY:** Geçmiş listesinden bir kayıt silindikten hemen sonra Dashboard sekmesine geçildiğinde toplam su tüketiminin de anlık olarak güncellendiği doğrulandı.
  7. **COMMIT:** `a5a1980` id'li commit yapıldı: *"fix(app): sync total water intake state immediately after log deletion"*

---

### 🌀 Cycle 4: Tema Kartının Ekranı Engellemesi (SettingsScreen Rollback Bug)
- **Zaman Kutusu:** 18:45 - 18:55 (10 dk)
- **Adımlar:**
  1. **READ:** `reports/report-bug-4.md` okundu. Kırmızı alarm temasının tıklandığında veya yüklendiğinde yerleşiminin bozuk olduğu raporlandı.
  2. **LOCATE:** `src/components/Settings.tsx` dosyasındaki `themeCard` stili incelendi.
  3. **HYPOTHESIZE:** Ajan, tema kartının sığması için absolute olarak konumlandırılmasının en hızlı çözüm olacağını varsaydı.
  4. **REPAIR:** `Settings.tsx` dosyasında `themeCard` stiline `position: 'absolute'`, `top: 0`, `bottom: 0`, `left: 0`, `right: 0`, `zIndex: 999` özellikleri eklendi.
  5. **TEST:** `npx tsc --noEmit` çalıştırıldı. Derleme hatasız tamamlandı.
  6. **VERIFY:** Manuel kontrol aşamasında tema kartının tüm ayarlar ekranını kapladığı ve altındaki kaydetme butonlarına veya girdilere tıklanmasını tamamen engellediği (block) görüldü. Hata daha kritik bir boyuta ulaştığı için test başarısız (failed) kabul edildi.
  7. **ROLLBACK:** Geliştirilen hatalı kod `git reset --hard HEAD~1` komutuyla geri alınarak uygulama bir önceki kararlı state'e (Cycle 3 sonu) döndürüldü.
