# Nokta - Track A: Dot Capture & Enrich (Fikir Yakalama)

## 1. Track Hedefi
Bu proje, Nokta ekosisteminin "giriş kapısı" olan Track A görevini üstlenmektedir. Kullanıcıların derme çatma, yapılandırılmamış fikirlerini alıp, yapay zeka ajanları aracılığıyla onları sorguya çeker ve mühendislik sınırları çizilmiş tek sayfalık bir spesifikasyona (spec) dönüştürür.

## 2. Problem & Çözüm
**Problem:** Kullanıcıların aklına gelen fikirler genellikle "slop" (içi boş, jenerik) haldedir ve neyin nasıl yapılacağı belirsizdir.
**Çözüm:** Uygulama, Gemini 2.5 Flash modelini kullanarak kullanıcının ham fikrini analiz eder. Kullanıcıya hedef kitle, problem, kısıtlamalar ve kapsam hakkında 4 adet net, cevaplaması kolay mühendislik sorusu sorar. Alınan cevaplarla anında profesyonel bir proje anayasası (Spesifikasyon) üretir.

## 3. Mimari Kararlar
- **Frontend:** React Native & Expo (Hızlı prototipleme ve mobil uyumluluk için).
- **Yapay Zeka:** `@google/generative-ai` (Gemini 2.5 Flash modeli, hızlı yanıt süreleri ve güçlü mantıksal çıkarım yeteneği için tercih edilmiştir).
- **Format:** Çıktıların okunabilirliğini artırmak için `react-native-markdown-display` kullanılarak Markdown destekli bir UI kurgulanmıştır.