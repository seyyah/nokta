# Audit Raporu #3 — Profil Ekranı Eksiklikleri

**Rapor No:** AR-003  
**Ekran:** Profil  
**Persona:** Junior Sen 🎓  
**Tarih:** 2026-05-28 10:02  
**Kayıt Süresi:** 0:51  
**Durum:** ✅ İşlendi (Cycle #4)

---

## 🎙️ Ses Transkripsiyonu

> *"Profil ekranına geldiğimde çok boş bir şey gördüm. Geçmiş yolculuklarım hiç görünmüyor — bu gerçekten kritik! Bir otobüs uygulamasında geçmiş biletlerimi göremiyorum. Ayrıca bildirim tercihlerini ayarlayabileceğim bir yer yok. Şifre değiştirme de... hiç yok. Ve bence hesap silme seçeneği de olmalı — GDPR açısından zorunlu. En azından yolculuk geçmişini görmek istiyorum, bu olmadan profil ekranı işlevsiz kalıyor."*

---

## 🔴 Tespit Edilen Sorunlar

### Sorun 1 — Geçmiş Yolculuklar Eksik (CRITICAL)
- **Konum:** `(tabs)/profile.tsx` — boş state ekranı
- **Mevcut:** "Yaklaşan yolculuk yok." mesajı, başka hiçbir şey yok
- **Gerekli:** Tamamlanan yolculuklar listesi (tarih, rota, fiyat)
- **Etki:** Kullanıcı biletini tekrar göremez, iade/iptal için referans yok

### Sorun 2 — Bildirim Tercihleri (HIGH)
- **Konum:** Profil ekranı — bildirim section yok
- **Mevcut:** Hiç bildirim ayarı yok
- **Gerekli:** "Sefer hatırlatıcısı", "Fiyat değişikliği" toggle'ları
- **Etki:** Kullanıcı seferi kaçırabilir

### Sorun 3 — Hesap Ayarları (MEDIUM)
- **Konum:** Profil ekranı
- **Mevcut:** Sadece statik kullanıcı bilgisi
- **Gerekli:** Şifre değiştirme, hesap silme (GDPR)
- **Etki:** KVKK/GDPR uyumsuzluğu riski

---

## 📸 Ekran Görüntüsü (Burn-in)

```
┌─────────────────────────────────┐
│ [← Geri]    Profil              │
├─────────────────────────────────┤
│         [👤]                    │
│      Kullanıcı Adı              │
│    kullanici@email.com          │
├─────────────────────────────────┤
│                                 │
│  ┌───────────────────────────┐  │
│  │  🚌                       │  │ ← BURN-IN: Bu alan BOŞTU
│  │  Yaklaşan yolculuk yok.   │  │   Geçmiş biletler görünmüyor
│  └───────────────────────────┘  │
│                                 │
│  [Çıkış Yap]                    │
│                                 │
│  (Başka hiçbir şey yok)         │ ← SORUN: Eksik ayarlar
│                                 │
└─────────────────────────────────┘
   BURN-IN: Tüm profil content alanı
```

**Olması Gerekenler:**
```
┌─────────────────────────────────┐
│ Geçmiş Yolculuklar              │
│ ├─ İstanbul → Ankara 17/05 650₺ │
│ ├─ İzmir → İstanbul 12/05 480₺  │
│ └─ ...                           │
├─────────────────────────────────┤
│ Bildirimler                     │
│ Sefer hatırlatıcısı    [ON/OFF] │
│ Fiyat değişikliği      [ON/OFF] │
├─────────────────────────────────┤
│ Hesap                           │
│ Şifre Değiştir          [→]    │
│ Hesabı Sil              [→]    │
└─────────────────────────────────┘
```

---

## 💡 Önerilen Çözümler

```tsx
// Geçmiş yolculuklar
const [tripHistory, setTripHistory] = useState([]);

useEffect(() => {
  AsyncStorage.getItem('user_tickets').then(data => {
    if (data) setTripHistory(JSON.parse(data));
  });
}, []);

// TripHistoryCard bileşeni
<FlatList
  data={tripHistory}
  renderItem={({ item }) => <TripHistoryCard trip={item} />}
  ListEmptyComponent={<EmptyTripHistory />}
/>
```

---

## Forge Cycle Çıktısı

**Cycle #4** bu raporu aldı ve Sorun 1'i çözdü:
- AsyncStorage'dan geçmiş biletler çekiliyor ✅
- `TripHistoryCard` bileşeni eklendi ✅
- Boş state korundu ✅
- Commit: `[FORGE: Profil] Trip history added — 4kg`

Sorun 2 (bildirimler) ve Sorun 3 (hesap ayarları) backlog'da.
