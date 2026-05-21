# IDEA.md — Track A: Sadelik (Drop-in Primitive Disiplini)

**Öğrenci:** 231118059  
**Track:** A — Sadelik  
**Tarih:** 2026-05-20  

---

## Müşterinin Geliştirici Olduğu Use Case

NOKTA RADAR, Slop Detector ekranı (Track B) üzerine kurulmuş bir analiz aracıdır. Bu ödevde `nokta-audit` widget'ını entegre ederken fark ettim ki, bu uygulamada müşteri ve geliştirici aynı kişidir: solo girişimci hem uygulamayı kullanarak fikir test ediyor, hem de uygulamanın kendisindeki UX sorunlarını fark ediyor.

`@xtatistix/mobile-audit`'in "drop-in primitive" yaklaşımı bu senaryoda gerçek değerini gösteriyor: FAB'a dokunan kullanıcı hem bir UX bug'ı bildiren müşteri, hem de o raporu açıp coding agent'a veren geliştiricidir. Tek araç, iki rol, sıfır context switch. Bu `nokta-audit` IDEA.md'sindeki "bug görme anı ile raporlanma anı arasındaki sürtünmeyi saniyelere indirmek" vaadiyle tam örtüşüyor.

Ek bir içgörü: audit raporlarının coding agent'a verilmesi döngüsü, Nokta'nın ana tezindeki "fikri olgunlaştırma" akışının UX boyutuna uygulanmasıdır. Nokta fikirleri test eder; `nokta-audit` Nokta'nın kendisini test eder. Öz-referans bir kalite döngüsü.

---

## Drop-in Disiplin Kararları

1. **Tek mount noktası:** `AuditWidget` yalnızca `app/_layout.tsx`'de, RootLayout'un en altında mount edildi. `grep -r 'AuditWidget' app/` → tek satır döner.
2. **Widget host'a sızmaz:** Widget kaldırıldığında uygulama değişmeden çalışır. `auditDeps.ts` ve `auditStorage.ts` izole servisler; hiçbiri app ekranlarından import edilmiyor.
3. **Native paket import yok (widget tarafında):** `captureScreen`, `writeFile`, `shareFile` — hepsi `deps` üzerinden host'tan geliyor.
4. **currentScreen dinamik:** `usePathname()` ile Expo Router'dan besleniyor; widget her ekranın adını biliyor.