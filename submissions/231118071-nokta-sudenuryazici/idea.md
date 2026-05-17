# 💡 IDEA.md — Track C: Otonomi

**Öğrenci:** Sudenur Yazıcı · `231118071`
**Track:** **C — Otonomi** (Human touch points + ratchet)

---

## 🎯 Fikir: Nokta Canvas — Autonomous AI Dashboard Forge

### Vizyon
Kullanıcıların Google Sheets verilerini sadece bir URL girerek yapay zeka destekli, gerçek zamanlı dashboard'lara dönüştürebildiği, ve her UI hatasının tamamen otonom biçimde tespit edilip onarıldığı kapalı-döngü bir sistem.

### Kapalı Döngü Mimarisi
```
[AuditWidget] → audit-report.md → [forge-watcher] → [forge-auto-fixer] → [React Bileşeni]
      ↑                                                                           ↓
  Kullanıcı rapor yazar                                              Hata otomatik onarılır
```

### Track C Kriterleri Karşılanması

| Kriter | Uygulama |
|--------|----------|
| **Autonomous agent loop** | `forge-watcher.cjs` 1 sn polling ile sürekli çalışır |
| **Human touch points minimal** | İnsan yalnızca `audit-report.md`'ye not düşer |
| **Ratchet (geri gitmez)** | `[FIXED]` etiketleme ile aynı issue iki kez işlenmez |
| **ROLLBACK mekanizması** | Sonsuz döngü tespitinde Guardian durdurulup idempotency eklendi |
| **FORGE.md ledger** | Tüm cycle'lar READ→LOCATE→HYPOTHESIZE→REPAIR→TEST→VERIFY→COMMIT/ROLLBACK formatında |

### Teknik Bileşenler
- **AuditWidget** (`src/audit/`) — Ekran yakala, işaretle, .md üret
- **forge-watcher.cjs** — Arka plan Guardian daemon (1 sn polling)
- **forge-auto-fixer.js** — Regex tabanlı kod enjeksiyon motoru
- **forge-sync.js** — Dosya sistemi köprüsü

### Feature Pitch (Müşteri → Geliştirici)
> "Müşterim uygulamayı kullanırken gördüğü hatayı FAB ile tek dokunuşta raporluyor.
> Sistem geceye kadar onu otomatik onarıyor. Sabah açtığımda commit hazır."

---
*Bu proje [nokta-audit](https://github.com/seyyah/nokta-audit) widget'ını [nokta](https://github.com/seyyah/nokta) host uygulamasına entegre eden otonom forge döngüsünü uygulamaktadır.*
