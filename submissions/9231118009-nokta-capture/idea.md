# IDEA.md — Track B: Pitch Coach Modu

## Feature Pitch

**Fikir:** Slop Dedektörü'ne tek seferlik skor yerine **iteratif Pitch Coach Modu** ekle.

Şu an uygulama bir pitch alıp skor üretiyor — kullanıcı skoru görüyor ama **nasıl iyileştireceğini** bilmiyor. Coach Modu bu boşluğu kapatıyor: en düşük puan alan boyutu tespit edip, AI kullanıcıya o boyuta özgü sorular soruyor, yanıtları alıyor ve pitch'in o bölümünü birlikte yeniden yazıyor.

---

## Kullanıcı Akışı

```
Pitch analizi biter
    ↓
"Coach Modu'nu Aç" butonu belirir
    ↓
AI en zayıf boyutu seçer (örn. "Kanıt Eksikliği: 8/10")
    ↓
Soru sorar: "Ürününüzü kaç kullanıcı test etti?"
    ↓
Kullanıcı cevaplar
    ↓
AI o bölümü yeniden yazar, kullanıcı onaylar
    ↓
Yeni pitch otomatik analiz edilir → skor güncellenir
    ↓
Döngü, tüm zayıf boyutlar iyileşene kadar devam eder
```

---

## Human Loop Spectrum Bağlantısı

| Mod | Loop | Açıklama |
|-----|------|----------|
| Otomatik boyut seçimi | **HOOTL** | AI en zayıf boyutu kendisi belirliyor |
| Soru-cevap akışı | **HOTL** | AI soru soruyor, kullanıcı onaylıyor/atlıyor |
| Pitch bölümü onayı | **HITL** | Kullanıcı AI'ın yazdığı bölümü kabul veya reddediyor |

---

## Müşteri - Geliştirici Farkı

**Müşteri gözünden:** "Sadece skoru görüyorum, ne yapacağımı bilmiyorum. Somut yardım istiyorum."

**Geliştirici gözünden:** Her coach oturumu bir `FORGE` döngüsü gibi çalışıyor — `READ (skor) → LOCATE (zayıf boyut) → HYPOTHESIZE (soru) → REPAIR (yeniden yaz) → VERIFY (yeni skor)`. Kullanıcı farkında olmadan Karpathy ratchet loop'u koşturuyor.

---

## Neden Track B?

- Mevcut HOOTL/HOTL/HITL altyapısını doğal olarak genişletiyor
- Yeni bir ekran veya navigasyon gerektirmiyor — mevcut tek ekrana ek state olarak ekleniyor
- nokta-audit ile entegrasyon: kullanıcı coach modunda UI'da bir sorunla karşılaşırsa bug FAB'ına basıp anında rapor üretebiliyor
- Karpathy autoresearch'ün "ölçülebilir metriği olan her döngü otomatikleştirilebilir" ilkesini kullanıcıya görünür kılıyor