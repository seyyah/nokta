# Nokta Radar: Anti-Slop Due Diligence Engine

*Fikirlerin sadece parlamasını değil, yere basmasını sağlayan; pitch-deck yığınlarını (slop) ayıklayan otonom analiz ve skorlama modülü.*

> Bu belge IDEA standardını takip etmektedir. Nokta ana vizyonunun "Track B: Slop Detector" ayağı olarak kurgulanmıştır.

---

## 1. Tez (Thesis)
Yapay zeka çağında jenerik fikir üretmek saniyeler alırken, bu fikirlerin uygulanabilirliğini (feasibility) ve özgünlüğünü (uniqueness) test etmek en kıt kaynak haline gelmiştir. **Nokta Radar**, "ucuz metin" ile "gerçek üretim iskeleti" arasındaki farkı ortaya koyan bir filtre görevi görür. Hedef, %0 halüsinasyon yapısıyla fikrin zayıf halkalarını (slop) tespit etmektir.

## 2. Problem
- **Pitch Enflasyonu:** Her gün binlerce benzer ve sığ girişim fikri üretiliyor ancak bunların pazar doğrulaması manuel olarak aylar sürüyor.
- **Slop Yayılımı:** LLM'lerin ürettiği "kulağa hoş gelen ama içi boş" iş planları, gerçek inovasyonun önünde gürültü yaratıyor.
- **Yatırımcı Yorgunluğu:** Değerlendiriciler, ayağı yere basmayan projeler arasında gerçek fırsatları kaçırıyor.

## 3. Nasıl Çalışır (Track B Akışı)
Nokta Radar, rastgele bir chatbot gibi davranmaz; mühendislik rehberliğinde (engineering-guided) çalışır:

1. **Input (Pitch Capture):** Kullanıcı ham fikrini veya pitch paragrafını girer.
2. **The Interrogator (Sorgucu):** AI, fikrin en zayıf olduğunu sezdiği 3 temel alanda (Teknik mimari, monetizasyon, rakip farkı) kullanıcıya zorunlu sorular sorar.
3. **Slop Analysis & Due Diligence:** Verilen cevaplar; teknik borç, pazar doygunluğu ve operasyonel gerçekçilik süzgecinden geçirilir.
4. **Scoring & Artifact:** Fikre 0-100 arası bir "Slop Score" verilir ve analiz bir Markdown artifact olarak üretilir.

## 4. Analiz Metrikleri
- **Technical Depth (Teknik Derinlik):** Fikir, standart bir wrapper'dan fazlasını sunuyor mu?
- **Defensibility (Savunulabilirlik):** Rakipler bu fikri ne kadar sürede kopyalayabilir?
- **Market Reality (Pazar Gerçekliği):** İddia edilen kullanıcı problemi gerçekten var mı?

## 5. Neden Nokta?
Çünkü biz sadece fikirleri toplamıyoruz; onları "due-diligence" (yatırım değerlendirme) aşamasından saniyeler içinde geçirerek riskleri eliyoruz. Nokta Radar, solo-girişimciyi dev bir Ar-Ge departmanı gibi güçlü, yatırımcıyı ise bir veri bilimcisi gibi analitik kılar.