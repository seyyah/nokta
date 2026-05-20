# Nokta Away Mission - Track A: Dot Capture & Enrich Idea

Bu belge, "Nokta Away Mission" hackathonu kapsamında hazırlanan, fikirden-tasarıma otomasyon sürecinin (Prompt Engineering ve Otonom Bilişsel Ajanlar) teorik temelini oluşturur.

## 1. Problemin Tanımı
İnsanlar genellikle kompleks ve spesifik bağlamları (örneğin bir donanım veya oyun fikri) yapısal olmayan saf 'fikir (dot)' şeklinde ifade ederler. Bu ham fikir (slop), doğrudan üretime veya mimariye dönüşemez. Karpathy'nin LLM-wiki notlarında bahsettiği 'Auto-prompting' ve bilişsel 'Agentic reasoning loop' yaklaşımlarının klasik formlarda eksikliği, bu sürtünmeyi doğurur.

## 2. Çözümümüz: BYOK Entegrasyonlu Otonom Soru-Cevap Ajanı
Geliştirdiğimiz React Native uygulamasında Track A (Dot Capture & Enrich) seçilmiştir. Özellikler:
- **Niyet Tespiti (Intent Routing):** Kullanıcının yazdığı metni analiz ederek, sektöre spesifik (Oyun, Donanım, SaaS) yöneltmeler yapar.
- **Otonom Sorgulama Ajanı (xAI Grok):** API entegrasyonu sayesinde, uygulama arka planda kararlar alan otonom bir agent gibi davranarak startup fikrine yönelik acımasız mühendislik soruları yaratır.
- **Zihin Haritası (Mindmap):** Otonom ajanlardan alınan güven skorları Native CSS ortamında eyleme dönüştürülebilir "Artifact"lere dökülür.

## 3. Karpathy / Autoresearch Teorik Altyapısı
Bu proje, LLM'lerin sadece kör bir metin tamamlayıcı olarak değil; **Otonom Araştırma Ajanları (Autoresearch)** seviyesinde muhakeme yapabilen yapılar olarak kurgulanması ekolünden beslenir. Gelişmiş "Prompt Engineering" teknikleriyle modelin sıradanlık (slop) oranı minimuma indirgenmiştir.
