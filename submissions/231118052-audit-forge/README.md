Track: A

# Nokta Audit-Forge Submission

This Track A submission keeps the audit integration deliberately small: the host app owns routing, native capabilities, and storage; the widget is mounted once in the root layout and can be removed without disturbing the rest of the app.

## Expo QR / Link

- Expo Go handoff: `expo-go://231118052-audit-forge`
- The runnable project lives in `app/` and uses Expo Router routes for `/`, `/reports`, and `/forge`.

## Demo Video

- 60 second demo: https://www.youtube.com/watch?v=zQNbnZmKj3E

## Decision Log

1. I chose Expo Router instead of tab state so `currentScreen` can come directly from `usePathname()`.
2. I kept all native work in the host boundary file under `app/src/` so `@xtatistix/mobile-audit` never owns host imports.
3. I used three concise mock screens with fake data only; no real customer data is embedded in the app or reports.
4. I kept the forge fixes narrow so every success cycle has one problem, one focused repair, and one verification command.

## Human Touch Points

Human touch points: 2

1. Initial track selection and acceptance criteria review.
2. Final review before push and PR creation.

## AI Tool Log

- Codex: repo inspection, implementation, forge cycle execution, local verification, APK build.

## Self-check

- [ ] README starts with `Track: A`
- [ ] Expo link includes `expo-go`
- [ ] Demo link uses a supported public host
- [ ] `AuditWidget` appears once in the app source tree
- [ ] `currentScreen` is derived from `usePathname()`
- [ ] Three audit reports and burn-in assets exist
- [ ] `FORGE.md` records at least three success cycles and one rollback
- [ ] `app-release.apk` exists
