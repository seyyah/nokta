# idea.md — Track A: Dot Capture & Enrich

## Öğrenci
- **Ad Soyad:** İpek Balkız
- **No:** 231118087
- **Track:** A — Dot Capture & Enrich

---

## Fikir (One-liner)
Ham bir fikri (bir kelime, yarım cümle) alıp AI destekli 3-5 engineering sorusuyla
zenginleştiren ve tek sayfalık slopsuz ürün spesifikasyonu üreten mobil uygulama.

## Problem
Girişimcilerin, öğrencilerin ve mühendislerin aklına gelen ham fikirler WhatsApp
notlarında, Notion'da ya da kağıt parçalarında birikerek kaybolur. Hiçbiri
sorgulanmadan, olgunlaşmadan ölür. Sebebi: fikri spesifikasyona çevirmek zaman
alır ve nasıl yapılacağı bilinmez.

## Kullanıcı
- Solo girişimciler / indie hackers
- Öğrenciler (proje fikri geliştirme)
- Ürün yöneticileri (hızlı pre-spec)

## Çözüm — Nasıl Çalışır
1. Kullanıcı ham fikri yazar (tek cümle yeterli)
2. AI sistemi 4 adet engineering sorusu sorar:
   - Problem tanımı
   - Hedef kullanıcı
   - Kapsam (scope)
   - Kısıtlar (constraints)
3. Kullanıcı kısa cevaplar verir
4. AI tek sayfalık ürün spesifikasyonu üretir
5. Spec ekranda gösterilir

## Kapsam (Bu Demo İçin)
- ✅ Ham fikir input ekranı
- ✅ 4 soru — cevap akışı
- ✅ Spec üretimi (Claude API)
- ✅ Spec görüntüleme
- ❌ Spec kaydetme / paylaşma (v2)
- ❌ Ses girişi (v2)

## Kısıtlar
- Sadece Android (APK)
- React Native CLI (Expo değil)
- Anthropic Claude API bağımlı

## Başarı Metriği
Ham fikirden tamamlanmış spec'e kadar geçen süre < 3 dakika.

## NOKTA Tezi ile Bağlantı
Bu uygulama NOKTA ekosisteminin "Dot → Line" adımını implemente eder.
Bir nokta (ham fikir) girer, bir sayfa (spec) çıkar. Slopsuz. Hallüsinasyonsuz.
Engineering-guided.