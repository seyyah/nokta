# Nokta Forge Ledger
**Öğrenci:** 231118027 - Ümit Efe Özkaleli
**Track:** A (Sadelik ve Drop-in Disiplini)

---

## Cycle 1: Ana Sayfa Buton Tipografisi
- **Timebox:** 15 dk
- **Status:** ✅ COMMIT
- **Target:** `HomeScreen.tsx`

### Döngü Adımları
1. **READ:** `#1 — butonda yazım hatası var` raporu ajana verildi.
2. **LOCATE:** Ajan sorunun `HomeScreen.tsx` dosyasındaki Button komponentinde olduğunu tespit etti.
3. **HYPOTHESIZE:** Ajan, `title="Giriş Yab"` prop'unun `title="Giriş Yap"` olarak güncellenmesi gerektiğini öngördü.
4. **REPAIR:** Ajan ilgili satırı değiştirdi ve test hack butonunu kaldırdı.
5. **TEST & VERIFY:** Tarayıcıda sayfa yenilendi, buton "Giriş Yap" olarak doğru şekilde render edildi.
6. **COMMIT:** Değişiklikler onaylandı ve kod tabanına eklendi.
## Cycle 2: Profil Ekranı Kontrast Hatası (Yapay Zeka Halüsinasyonu)
- **Timebox:** 15 dk
- **Status:** ❌ ROLLBACK
- **Target:** `ProfileScreen.tsx`

### Döngü Adımları
1. **READ:** `#2 — Kullanıcı adı metni çok silik...` raporu okundu.
2. **LOCATE:** `ProfileScreen.tsx` içindeki `buggyText` stili.
3. **HYPOTHESIZE:** Ajan sorunu çözmek için karmaşık bir `useColorScheme` hook'u ile dinamik karanlık/aydınlık tema yapmaya çalıştı.
4. **REPAIR:** Ajan kodu değiştirdi fakat `react-native` kütüphanesinden hook'u import etmeyi unuttuğu için kod patladı.
5. **TEST & VERIFY:** Ekranda "ReferenceError" alındı ve uygulama çöktü. İnsan gözlemi başarısız oldu.
6. **ROLLBACK:** Mühendis (Ümit Efe) ajan müdahalesini tehlikeli buldu ve kodları geri aldı (Rollback).

---

## Cycle 3: Profil Ekranı Kontrast Hatası (Basit ve Etkili Çözüm)
- **Timebox:** 15 dk
- **Status:** ✅ COMMIT
- **Target:** `ProfileScreen.tsx`

### Döngü Adımları
1. **READ:** Geri alma işleminden sonra ajan basitlik prensibiyle (Track A) tekrar uyarıldı.
2. **LOCATE:** `ProfileScreen.tsx` > `styles.buggyText`
3. **HYPOTHESIZE:** Dinamik tema yerine, doğrudan renk kodunu `#eeeeee` (açık gri) yerine `#333333` (koyu gri) yapmak metni okunaklı kılacaktır.
4. **REPAIR:** Renk kodu değiştirildi, sınıf adı `infoText` olarak temizlendi.
5. **TEST & VERIFY:** Uygulama yenilendi, metin beyaz arka plan üzerinde net olarak okunuyor.
6. **COMMIT:** Değişiklik mühendis tarafından onaylandı.
## Cycle 4: Ayarlar Ekranı Switch Fonksiyonelliği
- **Timebox:** 15 dk
- **Status:** ✅ COMMIT
- **Target:** `SettingsScreen.tsx`

### Döngü Adımları
1. **READ:** `#3 — Karanlık Mod açma/kapama butonu (Switch) çalışmıyor...` raporu ajana verildi.
2. **LOCATE:** `SettingsScreen.tsx` içindeki `<Switch value={false} />` statik elementi.
3. **HYPOTHESIZE:** Switch'in çalışması için `useState` hook'una bağlanması ve değerinin dinamik olarak güncellenmesi gerektiği öngörüldü.
4. **REPAIR:** `isDarkMode` state'i oluşturuldu. Switch'in `onValueChange` event'i bu state'i değiştirecek şekilde ayarlandı. Görselliği kanıtlamak için arka plan dinamikleştirildi.
5. **TEST & VERIFY:** Tarayıcıda kontrol edildi. Butona tıklandığında artık state değişiyor ve ekran koyu/açık temaya geçiyor.
6. **COMMIT:** Tam otonom onarım başarıyla doğrulandı ve onaylandı.