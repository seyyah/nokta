# Idea: Slop Detector (Due Diligence AI)

## Problem
Yatırımcılar, jüri üyeleri ve hackathon değerlendiricileri her gün yüzlerce "devrimsel", "AI destekli", "milyar dolarlık pazar" iddiaları içeren pitch ve proje özeti okuyor. Bu metinlerin birçoğu gerçekçi temellere dayanmayan, abartılı "slop" (çöp/şişirme) ifadelerden oluşuyor. Bu durum, gerçekten değerli projeleri ayırt etmeyi zorlaştırıyor.

## Çözüm
Kullanıcının girdiği pitch/proje paragrafını yapay zeka ile analiz eden ve pazar iddialarını test eden bir mobil uygulama. Uygulama, metni okuyup içindeki abartıları, temelsiz iddiaları ve gerçekçi olmayan vaatleri tespit ederek bir "Slop Score" (Şişirme/Çöp Skoru) üretir ve gerekçesini sunar.

## Kullanıcılar
- Melek yatırımcılar ve VC analistleri
- Hackathon/Startup yarışması jüri üyeleri
- Proje fikrini daha gerçekçi ve ayakları yere basan bir hale getirmek isteyen girişimciler

## Scope ve Kısıtlar (MVP)
- **Scope:** Tek bir text input alanı, bir analiz butonu ve bir sonuç (Score + Gerekçe) ekranı.
- **Kısıt:** API maliyetlerini azaltmak ve hızı artırmak için ilk aşamada karmaşık web aramaları yapılmaz, yalnızca dil modeli muhakemesiyle temel mantıksal boşluklar (logic gaps) ve abartılı ifadeler (buzzword tespiti) üzerinden skorlama yapılır.
- **Ek Özellik:** "Çılgınlık" bonusu için girilen metnin içerisindeki en anlamsız (slop) cümleyi kırımızı renkle highlight etme.
