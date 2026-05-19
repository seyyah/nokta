# Nokta - Track 1: AI-Powered Spec Generator

## Konsept
Yazılım ve AI geliştirme süreçlerinde, ham fikirlerin mühendislik standartlarında yapılandırılmış dokümanlara dönüşmesini sağlayan interaktif bir araç. Kullanıcıdan gelen kısa bir fikri analiz edip, teknik kısıtları netleştirmek için 3-5 kritik mühendislik sorusu sorar. Alınan cevaplarla tek sayfalık bir "Functional Specification" (Spec) üretir.

## Özelleştirme (Niche)
Bu versiyon, özellikle **görüntü işleme (YOLO vb.), veritabanı mimarisi ve mobil uygulama** projelerinde çalışan geliştiriciler için optimize edilmiştir. Model seçimleri, donanım kısıtları ve ağ topolojileri gibi konularda spesifik sorular üretecek bir AI prompt yapısına sahiptir.

## Akış
1. **Girdi:** Kullanıcı uygulamaya ham fikrini yazar.
2. **Sorgulama:** AI, bu fikri mimari açıdan test eden sorular yöneltir (Kullanıcı, Kapsam, Problem, Kısıt).
3. **Çıktı:** Cevaplar derlenerek tek sayfalık Markdown formatında bir Engineering Spec üretilir.