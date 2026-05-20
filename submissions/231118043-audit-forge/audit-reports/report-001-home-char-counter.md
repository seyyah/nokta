# Audit Report — HomeScreen: Karakter Sayacı Yerleşimi

**App:** Nokta Audit Forge  
**Screen:** HomeScreen  
**Reporter:** 231118043  
**Timestamp:** 2026-05-20T10:14:32Z  
**Status:** open  

---

## Bug / Observation

Karakter sayacı (`charCount`) sağa hizalı ve küçük punto ile yazılmış. Kullanıcı metin yazmaya başladığında sayaç görünür ancak minimum 10 karakter uyarısı `(min 10)` metni renk ya da ikon değişikliği olmaksızın düz yazı olarak gösteriliyor. Kullanıcı neden hata aldığını anlayamıyor.

**Highlighted Area:** `charCount` Text bileşeni — giriş alanının sağ alt köşesi

**Highlight Bounds:** `{ x: 240, y: 310, width: 100, height: 20 }`

---

## Screenshot

![HomeScreen char counter bug](./screenshots/report-001-home.png)

> *Burn-in: sarı çerçeve, sağ alt köşedeki "(min 10)" yazısını işaret ediyor*

---

## Expected Behavior

Karakter sayısı 10'un altındayken `(min 10)` yazısı kırmızı veya sarı renkte, belki ikon (⚠️) ile gösterilmeli. 10'a ulaşınca yeşile dönmeli.

---

## Reproduction Steps

1. HomeScreen'i aç
2. 1–9 karakter yaz
3. Sağ alt köşedeki sayaca bak — uyarı renksiz ve dikkat çekmiyor

---

## Suggested Fix

`charCount` stilini dinamik yap:
```tsx
charCount: {
  color: idea.trim().length < 10 ? '#ff6b6b' : '#555',
  fontSize: 12,
  marginTop: 6,
  textAlign: 'right',
}
```
