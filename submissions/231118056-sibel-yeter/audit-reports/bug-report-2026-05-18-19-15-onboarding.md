# Nokta Audit Report: Fikir Ekleme Formu Boş Değer Hatası

## 📋 Denetim Bilgileri
- **Ekran Adı (ScreenName):** `/ideas`
- **Raporlayan (Reporter ID):** `231118056-sibel-yeter`
- **Rol (Reporter Role):** `Müşteri / QA`
- **Zaman Damgası (Timestamp):** `2026-05-18T19:15:22.450Z`

---

## 🔍 Hata / Gereksinim Detayları

### Sorun Açıklaması
Yeni fikir ekleme formunda, başlık veya açıklama alanları boş bırakılarak "Kaydet ve Başlat" butonuna tıklandığında form herhangi bir hata vermeden veya doğrulama (validation) yapmadan gönderim gerçekleştiriyor. Bu durum veri tabanında tanımsız/boş kartların oluşmasına yol açmaktadır.

### Beklenen Davranış
Boş gönderim durumunda formun işlemi durdurması, kullanıcının uyarılması ve sadece geçerli (en az 3 karakterli) girdilerin kabul edilmesi gerekmektedir.

---

## 📌 İşaretleme Koordinatları (Highlight Bounds)
- **X:** `120 px`
- **Y:** `680 px`
- **Genişlik (Width):** `250 px`
- **Yükseklik (Height):** `50 px`

---

## 📸 Görsel Kanıt (Burn-in Screenshot)

![Onboarding Issue](screenshot_onboarding_issue.png)
