# Nokta Migration & Dedup (Track C)

## Vizyon
İnsan zihni dağınıktır. En iyi fikirler genellikle bir WhatsApp mesajında, bir ses kaydında veya rastgele bir kağıt parçasında kaybolur. **Nokta Migration**, bu dağınık "noktaları" (dots) toplar, temizler (dedup) ve onları üzerinde çalışılabilir birer "Fikir Kartı"na (Idea Card) dönüştürür.

## Problem
- **Veri Dağınıklığı:** Fikirler farklı platformlara (WhatsApp, Notion, E-posta) yayılmış durumda.
- **Tekrar (Redundancy):** Aynı fikrin farklı versiyonları farklı yerlerde duruyor, bu da kafa karışıklığına yol açıyor.
- **Eylemsizlik:** Ham notlar bir yapıya sahip olmadığı için asla projeye dönüşmüyor.

## Çözüm: Nokta Dedup Motoru
Nokta Migration uygulaması, ham metin yığınlarını alır ve şu süreçten geçirir:
1.  **Analiz:** Metindeki anahtar fikirleri ve niyetleri (intent) yakalar.
2.  **Deduplikasyon:** Birbirine benzeyen veya aynı konuyu işleyen notları gruplar.
3.  **Kartlaştırma:** Her bir benzersiz fikri; başlık, özet ve etiketlerle bir "Fikir Kartı"na dönüştürür.

## Kullanım Senaryosu
Kullanıcı WhatsApp dışa aktarım dosyasını veya kopyaladığı bir not listesini uygulamaya yapıştırır. Uygulama saniyeler içinde "Süper-Duyarlı Bir Evcil Hayvan Uygulaması" ile "Kod yazan köpek oyuncağı" notlarının aslında aynı bağlama ait olduğunu anlar ve bunları tek bir güçlü fikir kartında birleştirir.

---
*Bu doküman NOKTA Away Mission ödevi kapsamında Track C için hazırlanmıştır.*
