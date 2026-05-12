# idea.md — Track A: Idea Spec Generator

## Track Seçimi

**Track A** — Ham fikri (text) alır, AI ile 3-5 engineering sorusu sorar (problem, user, scope, constraint), tek sayfa spec üretir.

---

## Fikir

**"StudyMate"** — Üniversite öğrencilerinin ders notlarını ve çalışma hedeflerini yapılandırılmış bir çalışma planına dönüştüren mobil uygulama.

---

## AI Soru-Cevap Akışı (Engineering Questions)

Kullanıcı ham fikrini girer: *"öğrenciler için çalışma takip uygulaması"*

**Soru 1 — Problem:**
> "Bu fikir hangi gerçek problemi çözüyor? Öğrenciler şu an ne yapıyor ve neden bu yeterli değil?"

**Cevap:** Öğrenciler sınav öncesi ne çalıştıklarını takip edemiyorlar, hangi konuların eksik kaldığını göremiyorlar.

**Soru 2 — User:**
> "Bu problemi en çok kim yaşıyor? Hedef kullanıcını mümkün olduğunca dar tanımla."

**Cevap:** 18-25 yaş arası üniversite öğrencileri, özellikle çoklu ders takibi yapan 2. ve 3. sınıf öğrenciler.

**Soru 3 — Scope:**
> "v0.1'de ne yapacak, ne yapmayacak? Tek cümleyle en küçük çalışan versiyonu tanımla."

**Cevap:** Kullanıcı ders ve konu girer, uygulama günlük çalışma hedefi önerir ve tamamlananları işaretler.

**Soru 4 — Constraint:**
> "Hangi teknik veya zaman kısıtların var? Neler kesinlikle dışarıda kalmalı?"

**Cevap:** Backend yok, tüm veri local. Sosyal özellikler, bildirimler ve takvim entegrasyonu v0.1 dışında.

**Soru 5 — Success Metric:**
> "Bu fikrin çalıştığını nasıl ölçersin? 30 gün sonra başarılı olduğunu ne kanıtlar?"

**Cevap:** Kullanıcı 3 gün üst üste günlük hedefini tamamlarsa uygulama işe yarıyor demektir.

---

## Tek Sayfa Spec (Üretilen Çıktı)

| Alan | İçerik |
|------|--------|
| **Problem** | Üniversite öğrencileri çalışma süreçlerini yapılandıramıyor; hangi konuyu ne kadar çalıştıklarını takip edemiyorlar |
| **Hedef Kullanıcı** | 18-25 yaş, üniversite 2-3. sınıf öğrencileri, çoklu ders yükü olanlar |
| **Çözüm** | Ders + konu girişi → AI günlük çalışma hedefi önerir → kullanıcı tamamlananları işaretler |
| **Kapsam Dışı** | Backend, bildirim, sosyal paylaşım, takvim sync |
| **Başarı Metriği** | 3 gün üst üste günlük hedef tamamlama |
| **Efor Tahmini** | S (Small) — 1 haftalık sprint |
| **Farklılaştırıcı** | Notlar değil *hedef* odaklı; AI soru sorarak spec üretir, kullanıcı pasif değil aktif |

---

## Maturity Stage

`DOT → LINE → PARAGRAPH → PAGE` ✅ (Tüm alanlar dolu — PAGE seviyesine ulaşıldı)
