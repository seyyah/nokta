# Psikolojik Destek ve Kırmızı Çizgi Güvenlik Devri (HITL)

Bu proje, Nokta'nın "Otonom Due-Diligence & Uzman Ağı" (Temel İçgörü 6) vizyonunu sahada kanıtlayan bir konsept çalışmasıdır (Proof of Concept).

## 1. Problem
Yapay zeka modellerinin (LLM) sağlık ve psikoloji alanında kullanılması, halüsinasyon riski taşıdığı için yasal ve etik olarak çok tehlikelidir. Sadece iyi niyetli bir psikolojik sohbet botu bile, beklenmedik ilaç yan etkileri veya ağır psikotik belirtiler karşısında yanlış tavsiye verebilir.

## 2. Çözüm (Uzmana Devir / Escalation)
Bu uygulama, bir yapay zeka psikolojik destek asistanını simüle eder. Standart konuşmalarda kullanıcıyı dinler ve empati kurar.
Ancak **"halüsinasyon", "baş dönmesi", "yan etki", "intihar"** gibi hayati risk taşıyan kelimeler tespit ettiğinde:
1. Yapay Zeka anında susar (AI yanıtı durdurulur).
2. "Slop / Halüsinasyon" riski tamamen kesilir.
3. Uygulama "Nöbetçi Psikiyatriste / Uzmana Bağlanılıyor..." moduna (Kırmızı Alarm) geçerek insan inisiyatifini (HITL) devreye sokar.
