# EVAL

Bu submission icin altin senaryolar:

| id | scenario | expected result | ratchet check |
|---|---|---|---|
| E1 | App `/` route'unda acilir | Capture ekrani render olur ve tab navigasyonu gorunur | `npm run typecheck` |
| E2 | Reports tab'ina gecilir | Reports kopyasi, `format md/docx` metrigi ve export aksiyonu gorunur | `npm run typecheck` |
| E3 | Forge tab'ina gecilir | Success, rollback ve kg metrikleri ayni bantta kalir | `npm run typecheck` |
| E4 | Root layout okunur | `currentScreen` `usePathname()` ile uretilir ve deps icine verilir | `rg -n "AuditWidget" app -g '!node_modules'` |
| E5 | Audit raporlari agent'a verilir | Her raporda burn-in gorsel, ekran adi, musteri notu, bounds ve agent input vardir | `Get-ChildItem audit-reports/*.md` |
| E6 | Demo artifact izlenir | 60.0 sn MP4 Capture, Reports ve Forge burn-in kanitlarini sirayla gosterir | `imageio` duration check |

Rollback guard: `AuditWidget` birden fazla satirda mount edilirse veya native paket importlari widget paketinin icine tasinmis gibi davranan ek wrapper yazilirsa degisiklik reddedilir. Track A icin basari olcutu daha fazla ozellik degil, daha az sizinti ve daha net bagimliliktir.
