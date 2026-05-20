# Audit Report — QuestionFlowScreen: İlerleme Çubuğu Metni

**App:** Nokta Audit Forge  
**Screen:** QuestionFlowScreen  
**Reporter:** 231118043  
**Timestamp:** 2026-05-20T10:31:17Z  
**Status:** open  

---

## Bug / Observation

Progress bar dolumu doğru çalışıyor ancak üstündeki "Soru X / 5" etiketi `#555` rengiyle çok soluk görünüyor. Küçük ekranlarda (iPhone SE) okunamıyor. Ayrıca progress bar başlangıçta %0 genişliğinde başlıyor — ilk soru yüklenirken kullanıcı "hiçbir şey olmadı" sanıyor.

**Highlighted Area:** Progress bar + "Soru 1 / 5" etiketi — ekranın üst kısmı

**Highlight Bounds:** `{ x: 0, y: 60, width: 390, height: 32 }`

---

## Screenshot

![QuestionFlowScreen progress bar](./screenshots/report-002-questions.png)

> *Burn-in: sarı çerçeve, progress bar ve soluk "Soru 1 / 5" yazısını işaret ediyor*

---

## Expected Behavior

- "Soru X / 5" etiketi `#aaa` veya daha belirgin bir renkte olmalı
- İlk soru yüklenirken progress bar `1/5 = 20%` genişliğinde başlamalı (0 değil)

---

## Reproduction Steps

1. HomeScreen'de 10+ karakter yaz, "Yakala →" ye bas
2. QuestionFlowScreen açılır — progress bar %0 ve etiket çok soluk
3. iPhone SE boyutunda özellikle okunaksız

---

## Suggested Fix

`progressLabel` rengini `#555` → `#aaa` yap:
```tsx
progressLabel: { color: '#aaa', fontSize: 12, marginBottom: 20, letterSpacing: 1 },
```

Progress hesaplamasını değiştir:
```tsx
// Önce:
const progress = questionIndex / TOTAL_QUESTIONS;
// Sonra:
const progress = (questionIndex + 1) / TOTAL_QUESTIONS;
```
