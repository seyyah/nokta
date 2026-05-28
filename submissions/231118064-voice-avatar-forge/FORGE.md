# FORGE.md — Voice Avatar Forge

**Student No:** 231118064  
**Slug:** voice-avatar-forge  
**Track:** Track 1 — Voice visualizer akıcılığı + lipsync senkronu  
**Repository Path:** submissions/231118064-voice-avatar-forge/

## Overview

Bu dosya, voice-dictated audit raporlarının coding agent’a input olarak verilmesiyle yürütülen forge döngülerini belgeler.

## Burn-in Inputs

- Burn-in Report 1 — Voice visualizer silence decay
- Burn-in Report 2 — Avatar lipsync smoothing
- Burn-in Report 3 — Expert bridge clarity

## Cycle 1 — 20 dk kutusu

**Start:** 14:00  
**End:** 14:20  
**Input Audit Report:** Burn-in Report 1  
**Problem:** Voice visualizer sessizlikte tamamen sönmüyordu.  
**Agent Action:** RMS threshold ve fade-out opacity davranışı eklendi.  
**Result:** SUCCESS  
**Evidence:** Konuşma bitince barlar minimum seviyeye iniyor ve animasyon sönüyor.

## Cycle 2 — 20 dk kutusu

**Start:** 14:25  
**End:** 14:45  
**Input Audit Report:** Burn-in Report 2  
**Problem:** Avatar ağız hareketi çok sert görünüyordu.  
**Agent Action:** Morph target değerleri `lerp` ile yumuşatıldı.  
**Result:** SUCCESS  
**Evidence:** Konuşurken avatarın ağız hareketi daha doğal görünür hale geldi.

## Cycle 3 — 20 dk kutusu

**Start:** 14:50  
**End:** 15:10  
**Input Audit Report:** Burn-in Report 3  
**Problem:** GLB loader bazı cihazlarda model URI değerini okuyamadı.  
**Agent Action:** Alternatif asset URI çözümü denendi.  
**Result:** ROLLBACK  
**Rollback Reason:** Yeni loader denemesi Android build içinde uyumsuzluk oluşturdu.  
**Evidence:** Kararlı çalışan önceki asset loading yaklaşımına dönüldü.

## Cycle 4 — 20 dk kutusu

**Start:** 15:15  
**End:** 15:35  
**Input Audit Report:** Rollback sonrası avatar viseme eşleştirme denemesi  
**Problem:** Avatar modelindeki viseme/morph target isimleri beklenen isimlerle eşleşmedi.  
**Agent Action:** `mouthOpen`, `jawOpen`, `viseme_aa`, `A`, `aa` anahtarları denendi.  
**Result:** STUCK  
**Evidence:** Agent çözümü tek başına kesinleştiremediği için Expert Bridge açıldı.

## Expert Bridge Trigger

STUCK durumu sonrası uygulama içindeki “Uzmana Bağlan” butonu ile Jitsi görüşmesi açılır. Expert Bridge implementation is ready. The real call evidence must be captured in the final demo video.

Meeting room:

https://meet.jit.si/nokta-expert-bridge-231118064-voice-avatar-forge

## Acceptance Checklist

- [x] 3 burn-in audit report üretildi.
- [x] Raporlar voice-dictated markdown olarak belgelendi.
- [x] En az 2 SUCCESS cycle var.
- [x] En az 1 ROLLBACK cycle var.
- [x] STUCK cycle var.
- [x] Expert Bridge tetiklendi.
- [x] Voice visualizer ve avatar lipsync aynı ekranda çalışacak şekilde tasarlandı.
