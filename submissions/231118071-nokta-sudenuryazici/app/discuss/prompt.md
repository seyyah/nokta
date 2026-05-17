# CanvasSheet — Devam Prompt'u

> **Son Güncelleme:** 2026-05-01T17:18:00+03:00
> **Durum:** ✅ Faz 1 tamamlandı ve test edildi. Faz 2'ye geçilebilir.

---

## Projeye Devam Etmek İçin Prompt

Aşağıdaki prompt'u yeni bir coding agent'a (Gemini, Claude, Cursor vb.) verin:

---

```
Proje: /home/seyyah/works/xtatistix/dev/CanvasSheet

Bu bir React 19 + Vite 8 projesidir. Google Sheets'i veri kaynağı olarak kullanan
bir dashboard uygulamasıdır.

## MEVCUT DURUM (2026-05-01T17:18)
Faz 1 MVP TAMAMLANDI ve uçtan uca test edildi:
- Google OAuth2 ile giriş ✅
- /connect sayfasından Sheet URL ile bağlanma ✅
- Budget dashboard'da Sheets API v4 ile okuma/yazma ✅
- 10sn polling ile realtime sync ✅
- Legacy CSV fallback (OAuth yokken) ✅

## FAZ 2 — Yapılması Gerekenler

### AI Destekli Dinamik Dashboard
1. `src/services/sheetAnalyzer.js` — Sheet yapısını otomatik tespit
   - Headers, veri tipleri, satır/sütun sayısı çıkarma
   - Revenue/Cost, Kanban, Gantt gibi şablonları tanıma

2. `src/services/geminiService.js` — Gemini 3.1 Flash Lite entegrasyonu
   - Sheet metadata → UI config JSON üretimi
   - API Key: VITE_GEMINI_API_KEY (.env'de)

3. `src/engine/WidgetRegistry.js` — Widget tipi → React component eşlemesi
   - kpi_card, bar_chart, line_chart, editable_table, pie_chart

4. `src/engine/DynamicDashboard.jsx` — UI Config JSON → React render engine

5. `src/engine/widgets/` — Widget component library
   - KpiCard, BarChart, LineChart, EditableTable, PieChart

6. `src/pages/AnalyzePage.jsx` — Sheet analiz sonucu + dashboard oluştur butonu

### Çoklu Modül + Backend
7. Kanban, Gantt, Vortex widget'ları
8. Backend proxy entegrasyonu
9. WebSocket ile multi-user realtime sync
10. Kullanıcı dashboard'larını kaydetme/yükleme

## MİMARİ KARARLAR
- discuss/architecture.md dosyasını oku — tüm kararlar orada
- Frontend-only (şimdilik), backend sonra entegre edilecek
- Google Sheets API v4 + OAuth2 (GIS)
- Rate limiting: batch + debounce + backoff (ücretli plan yok)
- Gemini 3.1 Flash Lite (20-500 RPD)

## GOOGLE CLOUD KURULUMU (ZATEN YAPILDI)
- OAuth Client ID mevcut (.env dosyasında)
- Google Sheets API aktif
- Test kullanıcıları eklenmiş
- Consent Screen yapılandırılmış

## KRİTİK DOSYALAR
1. discuss/architecture.md — Mimari kararlar, akış diyagramları, kota bütçesi
2. discuss/plan.md — Görev listesi (Faz 1 tamamlandı, Faz 2 bekliyor)
3. discuss/walkthrough.md — İlerleme kaydı
4. src/auth/GoogleAuthProvider.jsx — OAuth2 akışı
5. src/services/sheetsService.js — API wrapper (read/write/batch/metadata)
6. src/services/budgetDataService.js — Dual-mode veri servisi (V2 + legacy)
7. src/pages/ConnectPage.jsx — Giriş sayfası
8. src/pages/BudgetPage.jsx — Budget dashboard (V2 entegreli)

## TEKNOLOJİ
- React 19, Vite 8, react-router-dom 7
- Google Identity Services + Sheets API v4 (REST, gapi yok)
- Lucide React (ikonlar), PapaParse (legacy fallback)
- npm run dev → localhost:5173
- /connect → Giriş sayfası
- /budget → Budget dashboard

## GOOGLE SHEET (Budget Test)
URL: https://docs.google.com/spreadsheets/d/1AtuJqItcKqg-IPRmQkvSC4RiArbAme7o-_6O4Vrt9hA/edit?gid=380037596
Sheet ID: 1AtuJqItcKqg-IPRmQkvSC4RiArbAme7o-_6O4Vrt9hA
GID: 380037596
```
