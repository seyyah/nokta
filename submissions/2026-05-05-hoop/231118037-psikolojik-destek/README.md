# Nokta Away Mission — Track D: AI Güvenlik ve İnsana Devir (Human-in-the-Loop) 

- **Öğrenci No:** 231118037
- **Track Seçimi:** Track D (Psikolojik Destek & Uzman Devri / Escalation Flow)
- **Expo Projesi:** `app/` klasörü içerisinde.
- **Expo Tünel (Canlı Test):** `exp://wlslbhk-anonymous-8081.exp.direct` *(Expo Go uygulamasında açabilirsiniz)*
- **Demo Video:** [YouTube Shorts İzle](https://youtube.com/shorts/abca-XmdNtk)

## 1. Problem Tanımı
Yapay zeka (LLM) teknolojilerinin sağlık, medikal ve psikoloji gibi "yüksek riskli (high-stakes)" alanlarda açık uçlu ve denetimsiz kullanımı, **halüsinasyon ve slop** üretimi açısından büyük tehlikeler barındırır. Standart bir LLM tabanlı terapi asistanı, kullanıcının "Beklenmedik bir yan etki yaşıyorum" veya "Halüsinasyon görüyorum" gibi kritik bildirimlerine dahi genelgeçer, empatik ama tıbbi geçerliliği olmayan sahte (slop) yanıtlar üretebilir. Bu durum yasal bir ihlaldir ve insan sağlığını doğrudan tehlikeye atar.

## 2. Çözüm Yaklaşımımız: Nokta Güvenlik Protokolü (Red-Teaming & HITL)
Geliştirdiğimiz bu MVP (Minimum Viable Product), Nokta'nın "Otonom Due-Diligence & Uzman Ağı" (Temel İçgörü 6) vizyonunu sahada kanıtlamak üzere tasarlanmıştır. Çözümümüzün temel mantığı şudur: **Yapay zeka kendi sınırlarını bilmeli ve tıbbi risk algılandığı an aradan çekilmelidir.**

**Protokolün İşleyiş Mantığı:**
1. **Otonom Destek (Güvenli Alan):** Kullanıcı gündelik stres veya rutin durumlarını paylaştığında, uygulama empati kuran ve süreci yöneten standart AI destek modunda çalışır.
2. **Deterministic Kırmızı Çizgi (Red Flag) Algılaması:** Sistem arka planda çalışan ve halüsinasyona kapalı olan kural tabanlı bir algoritma ile kullanıcı girdilerini (metin ve ses) tarar.
3. **Anında Devir (Handoff / Escalation):** Kullanıcıdan gelen *"halüsinasyon, intihar, yan etki, baş dönmesi"* gibi anahtar kelimeler tespit edildiği milisaniye içinde:
   - AI'ın yanıt üretme (generative) yetkisi tamamen durdurulur.
   - Sistem "Kırmızı Alarm" (Escalated) durumuna geçer.
   - Kullanıcı panik yapmayacak şekilde profesyonel bir arayüzle **Gerçek bir İnsan Uzmana (Nöbetçi Psikiyatrist)** yönlendirilir.

## 3. Mimari ve Teknik Kararlar (Decision Log)
- **Zero-Latency Mock Architecture:** Hackathon kısıtlamaları ve demo ortamının riskleri (internet kopması, API timeout'ları) göz önünde bulundurularak, sistem tamamen *deterministic mock logic* üzerine inşa edilmiştir. Bu sayede jüriye sunum yaparken gerçek zamanlı ve 0 gecikmeli bir handoff (devir) yeteneği gösterilir.
- **Profesyonel UI/UX:** Arayüz, psikolojik güven hissiyatı verecek mavi/beyaz tonlarda (Soft Blue & Off-White) tasarlanmış, tehlike anında ise anında Kırmızı (Alert) temaya geçecek şekilde reaktif (adaptive) kurgulanmıştır.

---
*Bu proje, yapay zekanın sadece metin üreten bir araç değil, aynı zamanda doğru yerde susup insanı sürece dahil eden güvenilir bir orkestrasyon katmanı (Nokta) olabileceğini kanıtlamaktadır.*
