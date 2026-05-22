# EVAL

Track A icin altin senaryolar:

1. App acildiginda Expo Router `/` route'u Capture ekranini render eder.
2. Capture, Reports ve Forge route'lari arasinda gecis `currentScreen` degerini `usePathname()` uzerinden degistirir.
3. `grep -r "AuditWidget" app/` yalnizca tek mount satirini dondurur.
4. `npm run typecheck` gecmelidir.
5. `audit-reports/` altinda en az 3 Markdown raporu ve burn-in gorsel referansi bulunmalidir.
6. `FORGE.md` en az 3 success ve 1 rollback cycle icermelidir.
