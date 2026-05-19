# Nokta — Slop Detector (Track B): Yatırımcı gözüyle pitch analizi

## Konsept
Bir pitch paragrafını yapıştır → AI, yatırımcı perspektifiyle çok boyutlu analiz eder → büyük bir **Slop Score** + kategori kırılımları + kırmızı bayraklar + doğrulanması gereken iddialar + rewrite önerisi döner. Tüm analizler cihazda kayıtlı kalır ve karşılaştırılabilir.

## Görsel Dil — "Laboratuvar Terminali"
- **Arka plan:** Derin karbon siyahı (#0A0B0D), ince grid dokusu, üstte hafif CRT vignette
- **Aksan:** Neon yeşil (#00FF88) ana aksan, uyarılar amber (#FFB020), kritik red (#FF3355)
- **Tipografi:** Mono (JetBrains Mono tarzı) gövde + display için sıkıştırılmış sans başlık
- **Mikro-etkileşim:** Analiz sırasında terminal-style "typing" log akışı, skor sayacı animasyonu, hafif haptics
- **Hissiyat:** Bir osiloskop / lab cihazı okuyormuş gibi — soğuk, analitik, radikal

## Ekranlar

### 1) Ana Ekran — "Dissection Chamber"
- Tepede marka: `● NOKTA` + küçük "SLOP DETECTOR v1" rozeti
- Büyük mono textarea: "Paste pitch. We'll autopsy it."
- Karakter sayacı + örnek pitch'leri önerme butonları ("Load sample: AI crypto dog walker")
- Alt sabit CTA: **RUN AUTOPSY** → yeşil neon buton, basınca terminal log açılır
- En altta geçmiş analizlerin küçük yatay stripi (son 5, skor rozetli)

### 2) Analiz Ekranı — "Running Diagnostics"
- Canlı terminal log akışı: `> parsing claims...`, `> cross-checking market size...`, `> detecting buzzwords...`
- Skor sayacı 0'dan gerçek değere doğru animasyonla sayar
- İptal edilebilir

### 3) Sonuç Ekranı — "Verdict"
- **Üst kart:** Devasa skor (0–100) dairesel gösterge + tek kelimelik hüküm (PURE SLOP / SLOPPY / MIXED / GROUNDED / SHARP) + renk kodu
- **Boyut Barları:** 5 boyut yatay bar olarak — Market Claim, Competitor Awareness, Evidence, Novelty, Feasibility. Her barda kısa not.
- **🚩 Red Flags:** Tespit edilen slop işaretleri (abartılı rakam, buzzword yığını, doğrulanamaz iddia, vs.) liste halinde — her biri genişleyebilir
- **🔍 Claims to Verify:** AI'ın "bunu kanıtlaman lazım" dediği iddialar checklist'i
- **✍️ Grounded Rewrite:** Pitch'in slop'suz, ayağı yere basan yeniden yazımı — kopyalanabilir
- Üstte: **Save**, **Share verdict card**, **Compare with…** butonları

### 4) Geçmiş — "Archive"
- Tüm kayıtlı analizler kart listesi (skor + ilk satır + tarih)
- Uzun basınca seç → **Compare** modu: 2 analizi yan yana koy, boyut barları üst üste binsin, hangi boyutta fark büyük görünsün
- Silme, yeniden çalıştırma

### 5) Ayarlar (minimal)
- Analiz tonu: Standart / Brutal / Merciful
- Geçmişi temizle

## Özellikler
- Pitch paragrafı yapıştır ve tek tıkla AI analizi al
- Büyük genel skor + 5 boyutlu kırılım
- Kırmızı bayrak listesi (slop sinyalleri)
- Doğrulanması gereken iddialar checklist'i
- Grounded rewrite (slop'suz yeniden yazım) — kopyalanabilir
- Tüm analizler cihazda saklanır, geçmişten tekrar açılır
- İki analizi yan yana karşılaştırma modu
- Hazır "slop örneği" pitch'leri tek tıkla test etme (UX demo için)
- Analiz tonu seçimi (Standart / Brutal / Merciful)
- Paylaşılabilir verdict kartı (görsel özet)

## App İkonu
Koyu karbon zemin üzerinde neon yeşil tek bir **nokta (●)** — etrafında hafif bir "scanner" halkası. Mono, soğuk, radikal. Lab cihazı estetiği.

## Not
Analiz motoru olarak projede kullanılabilir AI text/JSON üretim servisi kullanılacak; çıktı yapısı garanti altına alınacak, hata durumunda kullanıcı dostu fallback gösterilecek. Tüm geçmiş cihazda yerel olarak tutulur — hiçbir pitch sunucuda saklanmaz.