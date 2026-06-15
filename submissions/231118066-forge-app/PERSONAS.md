# PERSONAS.md

Bu dosya, ForgeApp avatarının iki farklı persona modunu belgeler.

---

## Persona 1: Junior-Sen

**Tanım:** Destekleyici, sabırlı ve adım adım ilerleyen bir rehber.

**Ses Özellikleri:**
- `pitch`: 0.9 (daha alçak, sakin)
- `rate`: 0.8 (yavaş, net)
- `language`: tr-TR

**Karakter:**
- Problemi karmaşık göstermez, basitleştirir
- "Birlikte bakalım", "adım adım gidelim" gibi ifadeler kullanır
- Hata yapıldığında yargılamaz, yönlendirir

**Örnek Giriş Metni:**
> "Merhaba! Ben Junior-Sen. Problemi adım adım çözelim. Önce hatanın kaynağını bulmaya çalışalım."

**UI:** Mavi buton (`#2a6df5`), aktifken vurgulanır

---

## Persona 2: Senior-Sen

**Tanım:** Doğrudan, hızlı ve çözüm odaklı bir uzman.

**Ses Özellikleri:**
- `pitch`: 1.3 (daha tiz, enerjik)
- `rate`: 1.1 (hızlı, kararlı)
- `language`: tr-TR

**Karakter:**
- Direkt konuya girer, zaman kaybetmez
- "Root cause şu", "fix bu" tarzında konuşur
- Teknik terimleri rahatça kullanır

**Örnek Giriş Metni:**
> "Selam. Ben Senior-Sen. Direkt konuya girelim. Stack trace'e bak, sorun orada."

**UI:** Mor buton (`#7b1fa2`), aktifken vurgulanır

---

## Persona Geçişi

Kullanıcı Avatar ekranında **Junior-Sen** veya **Senior-Sen** butonuna bastığında:
1. İlgili persona aktif hale gelir (buton rengi değişir)
2. Persona'nın tanımlı metni ilgili `pitch` ve `rate` ile seslendirilir
3. Avatar ağzı konuşma sırasında senkron animasyon yapar
4. Persona seçimi özel metin kutusuna etki etmez — kullanıcı istediği metni yazmaya devam edebilir

---

## Teknik Uygulama

```typescript
const PERSONAS = {
  junior: {
    label: 'Junior-Sen',
    pitch: 0.9,
    rate: 0.8,
    color: '#2a6df5',
    text: 'Merhaba! Ben Junior-Sen. Problemi adım adım çözelim.',
  },
  senior: {
    label: 'Senior-Sen',
    pitch: 1.3,
    rate: 1.1,
    color: '#7b1fa2',
    text: 'Selam. Ben Senior-Sen. Direkt konuya girelim.',
  },
};
```

**Dosya:** `app/src/screens/AvatarScreen.tsx`
