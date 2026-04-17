# 231118072 — Idea Tracker

**Proje:** idea-tracker  
**GitHub:** https://github.com/zeynepyardimci/nokta  
**Öğrenci No:** 231118072

---

## Seçilen Track: Track A

Ham fikri (metin veya ses) alır, AI ile 3-5 engineering sorusu sorar (problem, user, scope, constraint), tek sayfa spec üretir.

---

## Expo QR Kodu

Uygulama Expo Go ile çalıştırılabilir. QR kodu için projeyi çalıştırıp Expo Go uygulamasından okuyun. Aşağıdaki linkten APK dosyasını indirebilirsiniz.

Placeholder link: `https://expo.dev/accounts/zeynep4/projects/idea-tracker/builds/09a353ef-7b4a-4210-82a1-392184d7e655`

---

## Demo Video

Placeholder: Demo video, uygulamanın Expo Go üzerinde çalışan versiyonunun ekran kaydıdır.

Link: `https://www.youtube.com/shorts/3m67lHTeK74`

---

## Uygulama Ekranları

| Ekran                    | Açıklama                                                          |
| ------------------------ | ----------------------------------------------------------------- |
| Ana Ekran (`/`)          | Kayıtlı fikirlerin listesi, ilerleme yüzdeleri, yeni fikir butonu |
| Yeni Fikir (`/new-idea`) | Ham fikir metin girişi                                            |
| Sorular (`/questions`)   | 5 engineering sorusunu sırayla cevaplama                          |
| Spec (`/spec/[id]`)      | Tamamlanmış tek sayfalık spec görüntüsü                           |

---

## Decision Log

### Neden Track A?

Track A'yı seçmemin temel sebebi, fikir geliştirme sürecini yapılandırmanın ne kadar zor olduğunu bizzat yaşamamdır. Bir fikir aklıma geldiğinde onu hemen not almak istiyorum ama bu ham notun somut bir projeye dönüşmesi çoğunlukla olmuyor çünkü aradaki adımlar — "bu kimin sorunu?", "kapsamı ne olmalı?", "ne varsayıyorum?" — hiçbir yerde sorulmuyor.

Track A bu boşluğu dolduruyor: kullanıcı ham fikrini yazar, uygulama doğru mühendislik sorularını sorar ve çıktı olarak tek sayfalık bir spec üretir. Bu spec doğrudan ürün planlamasına ya da ödev sunumuna kullanılabilir.

### Neden Bu Fikir?

"Öğrencilerin ve yazılımcıların ham fikirlerini yapılandırılmış spec'e dönüştürmesine yardımcı olan mobil uygulama" fikrini seçtim çünkü:

1. **Gerçek ihtiyaç:** Kendim dahil birçok öğrenci "iyi fikrim var ama ne yapacağımı bilmiyorum" noktasında takılıyor.
2. **Track A ile mükemmel uyum:** Uygulama zaten bir spec üretme aracı, dolayısıyla kendi kendini belgeliyor.
3. **Ölçülebilir çıktı:** Spec tek sayfada ve net, kullanıcı ilerlemesini görebiliyor.
4. **Expo Go ile test edilebilirlik:** Native build gerektirmeden, QR kodu ile anında dağıtılabilir.

### Teknik Kararlar

- **AsyncStorage:** İlk MVP'de backend gerekmez; offline-first daha hızlı geliştirme sağlar.
- **Expo Router (Stack):** Tab bar gerektirmeyen tek akış için stack navigator yeterli ve daha temiz.
- **TypeScript:** Tip güvenliği özellikle state yönetiminde önemli.
- **Hardcoded sorular:** AI entegrasyonu yerine sabit 5 soru, MVP'yi basit ve güvenilir tutuyor.
