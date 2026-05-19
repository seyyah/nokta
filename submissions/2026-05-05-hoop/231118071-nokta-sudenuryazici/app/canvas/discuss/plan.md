# CanvasSheet — Implementation Plan

> **Başlangıç:** 2026-05-01T16:37:00+03:00
> **Son Güncelleme:** 2026-05-01T17:50:00+03:00
> **Durum:** ✅ Faz 1 & Faz 2 Tamamlandı — AI Destekli Dinamik Dashboard Hazır

---

## Görev Listesi

### Adım 1: Altyapı Dosyaları
- [x] `index.html` — Google Identity Services (GIS) script tag eklendi
- [x] `src/auth/GoogleAuthProvider.jsx` — OAuth2 context provider (openid/email/profile scope'ları dahil)
- [x] `src/auth/useGoogleAuth.js` — login/logout/token hook

### Adım 2: Google Sheets API Servisleri
- [x] `src/services/sheetsService.js` — Sheets API v4 wrapper (read/write/metadata/batchWrite)
- [x] `src/services/rateLimiter.js` — Debounce + exponential backoff + polling manager

### Adım 3: Sayfa ve Routing
- [x] `src/pages/ConnectPage.jsx` — Google giriş + Sheet URL form (accessToken bug düzeltildi)
- [x] `src/main.jsx` — `/connect` route + GoogleAuthProvider wrapper

### Adım 4: Budget Modülü Refactor
- [x] `src/services/budgetDataService.js` — Sheets API v4 + legacy CSV fallback
- [x] `src/pages/BudgetPage.jsx` — V2 entegrasyonu + polling + debounced write + status bar
- [x] `.env` / `.env.example` — Google Client ID ortam değişkeni
- [x] `.gitignore` — `.env` eklendi

### Adım 5: Test ve Doğrulama
- [x] Google Cloud Console'da OAuth Client ID oluşturuldu
- [x] `.env` dosyasına `VITE_GOOGLE_CLIENT_ID` yazıldı
- [x] Dev ortamında `/connect` sayfası test edildi
- [x] Google ile giriş + Sheet URL ile bağlanma testi ✅
- [x] Sheet okuma testi ✅
- [x] Sheet yazma (debounced auto-save) testi ✅
- [x] Build testi geçti ✅

---

## Çözülen Sorunlar

| Sorun | Çözüm |
|---|---|
| `redirect_uri_mismatch` (Error 400) | OAuth Client'a `http://localhost:5173` + `http://localhost` eklendi |
| `access_denied` (Error 403) | OAuth Consent Screen'de test kullanıcısı eklendi |
| `userinfo 401 Unauthorized` | Scope'lara `openid email profile` eklendi |
| ConnectPage `invalid credentials` | `accessToken` hook'tan çekilmiyordu, düzeltildi |

---

## Faz 2 — AI Destekli Dinamik Dashboard (TAMAMLANDI ✅)

### Adım 1: Sheet Analysis Engine
- [x] `src/services/sheetAnalyzer.js` — Otomatik sheet metadata çıkarma
  - Veri tipi tespiti (number, date, string, boolean)
  - Row kategorileri (revenue, cost, total)
  - Template tespiti (budget, gantt, kanban, data_table)

### Adım 2: Gemini AI Integration
- [x] `.env.example` — VITE_GEMINI_API_KEY eklendi
- [x] `src/services/geminiService.js` — Gemini 1.5 Flash entegrasyonu
  - System prompt ile UI config generation
  - Fallback config generator
  - UI config validation

### Adım 3: Widget Engine
- [x] `src/engine/WidgetRegistry.js` — Widget type → component mapping
- [x] `src/engine/widgets/KpiCard.jsx` — KPI card with aggregation
- [x] `src/engine/widgets/BarChart.jsx` — CSS-based bar chart
- [x] `src/engine/widgets/LineChart.jsx` — SVG-based line chart
- [x] `src/engine/widgets/PieChart.jsx` — SVG-based pie chart
- [x] `src/engine/widgets/EditableTable.jsx` — Interactive data table

### Adım 4: Dynamic Dashboard
- [x] `src/engine/DynamicDashboard.jsx` — UI config → React render
  - Widget data loading
  - Grid layout system
  - Error handling

### Adım 5: User Interface
- [x] `src/pages/AnalyzePage.jsx` — AI dashboard generation flow
  - Sheet analysis view
  - Metadata summary
  - AI-powered dashboard render
- [x] `src/main.jsx` — /analyze route added
- [x] `src/pages/ConnectPage.jsx` — Navigate to /analyze
- [x] `src/index.css` — Widget styles added

### Adım 6: Testing
- [x] Build test geçti (306KB JS, gzip 96KB)
- [x] Export fix (useGoogleAuth named export)

## Faz 3 Planı (Gelecek)

- [ ] Kanban, Gantt, Vortex widget'ları (özel kullanım senaryoları)
- [ ] Backend proxy entegrasyonu (mevcut backend'e bağlanma)
- [ ] WebSocket ile multi-user realtime sync
- [ ] Dashboard save/load functionality
- [ ] Advanced chart types (scatter, area, combo charts)
- [ ] Custom widget builder
- [ ] Dashboard sharing & collaboration
