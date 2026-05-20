# Audit Report — SpecOutputScreen: Paylaş Butonu Konumu

**App:** Nokta Audit Forge  
**Screen:** SpecOutputScreen  
**Reporter:** 231118043  
**Timestamp:** 2026-05-20T10:48:55Z  
**Status:** open  

---

## Bug / Observation

"Paylaş" butonu başlık satırının sağ köşesinde küçük (`paddingHorizontal: 14, paddingVertical: 8`) ve `#aaa` rengiyle pasif görünüyor. Kullanıcılar onu bir aksiyon butonu olarak algılamıyor — spec oluşturulduktan sonra paylaşılabilir olduğunu fark etmiyorlar. Ayrıca spec yüklenirken buton görünmüyor, yüklendikten sonra aniden beliriyor — kullanıcıyı şaşırtıyor.

**Highlighted Area:** Header row sağ köşesindeki "Paylaş" butonu

**Highlight Bounds:** `{ x: 300, y: 72, width: 80, height: 36 }`

---

## Screenshot

![SpecOutputScreen share button](./screenshots/report-003-spec.png)

> *Burn-in: sarı çerçeve, başlık satırındaki soluk "Paylaş" butonunu işaret ediyor*

---

## Expected Behavior

- "Paylaş" butonu mor (`#6c47ff`) arka planlı, daha belirgin olmalı
- Ya da spec yüklendikten sonra alt footer'a taşınmalı — "Yeni Fikir" butonunun yanına

---

## Reproduction Steps

1. Tüm 5 soruyu cevapla
2. SpecOutputScreen'e geç
3. Spec yüklenene kadar bekle — "Paylaş" butonu görünmüyor
4. Yüklenince beliriyor ama renginden dolayı fark edilmiyor

---

## Suggested Fix

`shareBtn` stilini güncelle:
```tsx
shareBtn: {
  backgroundColor: '#6c47ff',
  borderRadius: 8,
  paddingHorizontal: 14,
  paddingVertical: 8,
},
shareBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
```
