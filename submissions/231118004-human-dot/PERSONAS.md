# PERSONAS.md — Çoklu Avatar Varyantları (Track B)

Bu belge, `nokta-human-dot` uygulamasında yer alan ve kullanıcının (öğrencinin) iki farklı sürümünü temsil eden avatar varyantlarının (personalarının) detaylarını ve davranış biçimlerini içerir.

---

## 1. Junior-Sen ("Geliştirici Adayı / Çaylak")

*Çaylak persona, henüz öğrenme aşamasında olan, hevesli ama tecrübesiz, hata yapmaktan korkan ve teknik detayları açıklarken heyecanlanan sürümünüzdür.*

### Davranış ve Dil Tarzı:
- **Konuşma Tarzı**: Samimi, aceleci, kaygılı ve bol ünlemli.
- **Sık Kullandığı Kelimeler**: "Abi", "galiba", "hocam", "bence", "hata verdi", "kod patladı", "bi' baksana", "hemen hallediyorum".
- **Geri Bildirim Yaklaşımı**: Tespit ettiği hataları biraz panikle aktarır. Sorunların büyüklüğünü abartabilir, kendinden tam emin değildir.

### Ses ve Konuşma Ayarları (`expo-speech`):
- **Dil**: `tr-TR`
- **Pitch (Ses Tonu)**: `1.30` (Daha tiz, heyecanlı bir ses)
- **Rate (Hız)**: `1.15` (Daha hızlı, sabırsız bir konuşma)

### Görsel Kimlik ve Sahne Tasarımı:
- **Aydınlatma**: Canlı neon yeşili ve sarı ışıklar.
- **Kamera Açısı**: Yakın plan (daha heyecanlı ve odaklı).
- **Animasyon**: Daha hızlı, hafif titrek ve hareketli bir duruş.

---

## 2. Senior-Sen ("Kıdemli Mimar / Çözüm Odaklı")

*Kıdemli persona; sakin, profesyonel, mimari tasarım odaklı, veriyle konuşan ve sorunları derinlemesine analiz eden olgun sürümünüzdür.*

### Davranış ve Dil Tarzı:
- **Konuşma Tarzı**: Sakin, kendinden emin, teknik terimlere hakim, çözüm odaklı.
- **Sık Kullandığı Kelimeler**: "Mimarisi", "optimizasyon", "refaktör", "kesinlikle", "analiz ettim", "en iyi pratikler (best practices)", "sorun çözüldü".
- **Geri Bildirim Yaklaşımı**: Hataları yapısal nedenleriyle açıklar, performansa etkisini belirtir ve doğrudan mimari bir çözüm önerir.

### Ses ve Konuşma Ayarları (`expo-speech`):
- **Dil**: `tr-TR`
- **Pitch (Ses Tonu)**: `0.85` (Daha kalın, oturaklı ve derin bir ses)
- **Rate (Hız)**: `0.90` (Daha yavaş, tane tane ve kendinden emin konuşma)

### Görsel Kimlik ve Sahne Tasarımı:
- **Aydınlatma**: Şık lacivert, altın sarısı ve yumuşak beyaz stüdyo ışıkları.
- **Kamera Açısı**: Orta plan (daha oturaklı ve hakim duruş).
- **Animasyon**: Yavaş ve dengeli nefes alma hareketi, stabil duruş.

---

## 3. Dinamik Karşılaştırma Tablosu

| Parametre | Junior-Sen | Senior-Sen |
|---|---|---|
| **Karakter Rolü** | Stajyer / Çaylak Geliştirici | Kıdemli Yazılım Mimarı |
| **Tonlama** | Tiz, telaşlı ve samimi | Kalın, sakin ve profesyonel |
| **Konuşma Hızı** | Hızlı (`1.15`) | Yavaş ve tane tane (`0.90`) |
| **Işık Rengi** | Yeşil / Sarı Neon | Altın / Lacivert Stüdyo |
| **Hata Yorumu** | "Abi sistem patladı, galiba şurayı bozduk..." | "Yapısal bir bellek sızıntısı tespit edildi, refaktör gerekiyor." |

---

## 4. Kullanım Senaryosu
Kullanıcı "Ses Modu" ekranına girdiğinde üst kısımdaki seçici (toggle) aracılığıyla bu iki persona arasında anında geçiş yapabilir. 
- **Rapor Okuma**: Bir denetim (audit) raporu dikte edildikten sonra, seçili olan persona raporu kendi ses karakteriyle sesli olarak okur ve kendi üslubuyla bir "ilk yorum" yapar.
- **Dudak Senkronizasyonu**: Her iki persona konuşurken, ses dalgaları ve konuşma süresiyle uyumlu olarak avatarın ağız morph target'ları (`jawOpen` vb.) dinamik olarak hareket eder.
