# Audit Report — ChatScreen
**App:** NOKTA RADAR  
**Screen:** /chat (ChatScreen)  
**Reporter:** 231118059  
**Date:** 2026-05-20  
**Status:** 🔴 open  

---

## Screenshot

> [burn-in screenshot — ChatScreen, keyboard open, input bar highlighted]

---

## Bug / UX Issue

**Başlık:** Klavye açıldığında mesaj listesi tam görünmüyor — `keyboardVerticalOffset` yanlış

**Detay:**  
`ChatScreen`'de `KeyboardAvoidingView keyboardVerticalOffset={90}` olarak ayarlı. Tab bar yüksekliği ~49px iken bu offset fazla; klavye açıldığında mesaj listesi ile input bar arasında boş bir alan oluşuyor, son mesajlar kısmen görünür oluyor.

**Adımlar (Reproduce):**
1. Chat sekmesine git
2. Input'a dokun (klavye açılır)
3. Son mesaj kısmen kesilmiş görünüyor; input bar'ın üstünde gereksiz boşluk var

**Beklenen davranış:** Klavye açıkken mesaj listesi tam görünmeli, input bar klavyenin hemen üstünde oturmalı.  
**Mevcut davranış:** `keyboardVerticalOffset={90}` → fazla offset → boşluk oluşuyor.

---

## Engineering Note

`ChatScreen.tsx` → `keyboardVerticalOffset={90}` → `{60}` olarak düzelt.  
Tab bar height 49px + safe area ~10px = ~59px; 60 daha doğru.

---

## Tags
- `bug` `keyboard` `layout` `chat-screen`
