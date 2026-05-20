# PERSONAS.md — Avatar Persona Belgeleri

> Track B seçimi: 2 persona arasında geçiş — her biri farklı tonla rapor okur ve feedback verir.

---

## Persona Sistemi Genel Bakış

Uygulama iki avatar persona tanımlar. Her ikisi de **sen**i temsil eder — ama farklı kariyer aşamalarında. Avatar sahnesinde istediğin persona'yı aktive eder, söyleyeceğin metni seslendirebilir ya da önceden tanımlı mesajları sırayla çalıştırabilirsin.

| Özellik | Junior Sen | Senior Sen |
|---------|-----------|------------|
| **İkon** | 🎓 | 💼 |
| **Renk** | `#3B82F6` (Mavi) | `#F59E0B` (Amber) |
| **Ton** | Samimi, meraklı, soru soran | Analitik, doğrudan, çözüm odaklı |
| **Tempo** | Hızlı, heyecanlı | Yavaş, otoriter |
| **Cümle Yapısı** | Uzun, soru işaretli | Kısa, net, imperative |
| **Forge Rolü** | Bug raporlarını "Hmm, neden böyle?" tarzı yorumluyor | Kritik sorunları "Bu düzeltilmeli" şeklinde direktifle bildiriyor |

---

## Persona #1 — Junior Sen 🎓

### Karakter Profili

**Kariyer Aşaması:** 0-2 yıl deneyim, bootcamp mezunu, ilk tam zamanlı iş  
**Temel Özellik:** Her şeyi keşfetme merakı, kullanıcı deneyimine yönelik sezgi, teknik derinlik arayışı  
**Zayıf Nokta:** Önceliklendirme yapmakta zorlanıyor, her şeyi önemli buluyor

### Ses & Animasyon

- Avatar gözleri daha büyük ve meraklı görünür
- Konuşma hızı: yüksek (~150 WPM)
- Kaş hareketi: sık sık yukarı kalkar (soru ifadesi)
- Dudak animasyonu: açık-kapanma daha sık (heyecanlı konuşma ritmi)
- Persona rengi `#3B82F6` — avatar halesi mavi

### Örnek Mesajlar

```
"Merhaba! Bu ekranda bir sorun fark ettim, sana anlatmak istiyorum."

"Hmm, kullanıcı deneyimi açısından bu akış biraz karışık değil mi? 
 Belki biraz sadeleştirebiliriz?"

"Acaba şu butonu daha belirgin yapabilir miyiz? 
 Bence çok iyi olur! Ne düşünüyorsun?"
```

### Rapor Okuma Stili

Audit raporlarını junior okurken:
- Sorun tanımından önce bağlamı anlatır
- "Acaba", "belki", "sanırım" gibi hedging kelimeleri kullanır
- Kullanıcı perspektifini ön plana çıkarır

**Örnek rapor intro:**
> *"Bu ekranı kullanırken koltuk numaralarının gerçekten çok küçük olduğunu fark ettim. Bir kullanıcı olarak baktığımda okumakta zorlandım — acaba font size artırılabilir mi?"*

---

## Persona #2 — Senior Sen 💼

### Karakter Profili

**Kariyer Aşaması:** 5+ yıl deneyim, teknik lead, sistemik düşünce  
**Temel Özellik:** Pattern recognition, teknik borç farkındalığı, önceliklendirme güçlü  
**Zayıf Nokta:** Zaman zaman "obvious" kabul ederek bağlamı atlar

### Ses & Animasyon

- Avatar gözleri daha dar, konsantre görünür
- Konuşma hızı: orta (~100 WPM), vurgu daha belirgin
- Kaş hareketi: frontal (analitik, kaygılı)
- Dudak animasyonu: daha az açılma, keskin kapanışlar
- Persona rengi `#F59E0B` — avatar halesi amber/turuncu

### Örnek Mesajlar

```
"Bu akışta kritik bir UX sorunu tespit ettim. Hemen müdahale gerekiyor."

"Bilet onay süreci 3 adıma indirilebilir. 
 Koltuk seçimi gereksiz modal açıyor — inline yapılmalı."

"Renk kontrastı WCAG AA standardını karşılamıyor. 
 Düzeltme zorunlu, erteleme kabul edilmez."
```

### Rapor Okuma Stili

Senior okurken:
- Direkt soruna girer, bağlam sıfır
- Öncelik skalası belirtir (critical/high/medium)
- Teknik çözümü önerir, "nasıl" sorusunu yanıtlar

**Örnek rapor intro:**
> *"CRITICAL: KoltukSeçim modal — occupied seat opacity:0.3 WCAG AA'yı karşılamıyor. Fix: overlay pattern veya ikon. ETA: 1 cycle."*

---

## Lipsync Pipeline

Her iki persona aynı viseme pipeline'ını kullanır, ama animasyon parametreleri farklıdır:

```
Ses → RMS analiz → Viseme map → Avatar WebView inject

Viseme haritası:
  'rest'  → ağız kapalı
  'open'  → geniş açık (A, O sesleri)
  'mid'   → yarı açık (E, İ sesleri)
  'close' → dudak kapanma (M, B, P sesleri)

Junior parametreleri:
  openAmplitude: 28px, tempo: 0.18 (hızlı)
  
Senior parametreleri:  
  openAmplitude: 20px, tempo: 0.12 (yavaş, vurgulu)
```

---

## Geçiş Animasyonu

Persona değiştirildiğinde:
1. Mevcut avatar halesi rengi 300ms fade-out
2. Yeni persona rengi 400ms fade-in
3. Kaş geometrisi 200ms lerp (smoothstep)
4. Konuşma balonu temizlenir
5. Mesaj index sıfırlanır

---

## IDEA.md — Müşteri-Geliştirici Use Case

Bu persona sistemi **müşteri ve geliştirici aynı kişi olduğunda** ortaya çıkan yeni bir iletişim paternini keşfetti:

Audit raporunu yazan kişi (müşteri rolü) ve bu raporu yorumlayan kişi (geliştirici rolü) aynı insandır — ama farklı zihin setleriyle. **Junior Sen** müşteriyi temsil eder: sezgisel, duygusal, kullanıcı perspektifli. **Senior Sen** geliştiriciyi temsil eder: teknik, sistematik, öncelikli.

Avatar sahnesinde bu iki perspektif arasında gerçekten geçiş yaparken, aynı sorunu iki farklı bakış açısıyla görmek mümkün oldu. Bu, single-developer projelerinde öz-review kalitesini artırmanın somut bir yolu.

---

*Persona'lar `avatar.tsx` içinde `PERSONAS` array olarak tanımlıdır ve genişletilebilir yapıdadır.*
