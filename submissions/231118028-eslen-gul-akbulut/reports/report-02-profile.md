# Denetim Hata Raporu: Profil Ekranı Basık Avatar Resmi ve Tasarım Bozukluğu

## Detaylar
- **Ekran Adı:** Profil Ekranı (`Profile Screen` / `/profile`)
- **Denetçi:** Eslen Gül Akbulut (QA Ekibi)
- **Önem Derecesi (Severity):** Orta (Medium)
- **Ekran Görüntüsü Referansı:** `./assets/profile_screen_bug.png`
- **Sarı Kutu İşaret Hedefi:** Profil kartının en üstünde yer alan ve basık/yayvan bir şekilde uzatılmış olan dikdörtgen profil avatar resmi sarı dikdörtgen çerçeve ile işaretlenmiştir.

## Kullanıcı Notu (User Note)
Kullanıcı profil resmi `resizeMode="stretch"` ve uyumsuz en-boy oranları (`180x80` piksel) ile yüklendiği için yüz hatları tamamen basık ve bozuk görünmektedir. Ek olarak sayfada yazım hataları ("Proflie Settings" ve "E-mial Address") bulunmakta ve "Save Settings" butonu alt kısımdaki `overflow: hidden` sınırlayıcısı sebebiyle tamamen kesilip tıklanamaz hale gelmiştir.

## Yeniden Üretim Adımları (Reproduction Steps)
1. Uygulamayı açın ve alt menüden "Profile" sekmesine geçin.
2. Profil kartındaki avatar görselinin en-boy oranını ve kalitesini inceleyin.
3. Ekranın en üst başlığını ("Proflie Settings") ve e-posta giriş alanının etiketini ("E-mial Address") inceleyin.
4. En alttaki "Save Settings" butonunun kesilme durumunu gözlemleyin.

## Beklenen Sonuç (Expected Result)
Profil görselinin kare oranında (`1:1`) ve `resizeMode="cover"` ile orijinal oranları korunarak düzgün görüntülenmesi, imla hatalarının düzeltilmesi ve Kaydet butonunun hiçbir kesilmeye uğramadan tıklanabilir olması gerekir.

## Gerçekleşen Sonuç (Actual Result)
Avatar görseli aşırı derecede basılmış, metinlerde harf hataları yapılmış ve kaydetme butonu yüksekliği kısıtlanmış bir kapsayıcının (`height: 25`) içinde kaldığı için alt taraftan kesilerek işlevsiz kalmıştır.

---

## Görsel Kanıt (Burn-in Screenshot)
![Profil Ekranı Görsel Basıklık Hatası](./assets/profile_screen_bug.png)
