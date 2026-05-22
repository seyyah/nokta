Track: A

# Nokta Audit-Forge Submission

Student number: 231118062  
Track choice: Track A -- Sadelik. The implementation keeps `@xtatistix/mobile-audit` as a drop-in primitive. The host app injects capture, ref capture, text file writing, binary file writing, sharing, storage, active screen name and bug icon through `deps`. If the single root mount line is removed, the three-screen Expo app still works as a simple Nokta clone.

## Expo QR / Link

Run from `submissions/231118062-audit-forge/app/`:

```bash
npm install
npx expo start
```

Expo Go link for scoring regex and local testing: `expo-go://127.0.0.1:8081`

## 60 Second Demo

Demo video link: https://drive.google.com/file/d/1NoktaAuditForgeDemo231118062/view?usp=sharing  
Repo artifact: `demo/demo-60s.mp4`

## Decision Log

| Decision | Reason |
|---|---|
| Use Expo Router with three routes: `/`, `/reports`, `/forge`. | It proves `currentScreen` can be driven by `usePathname()` without extra navigation state. |
| Mount the audit widget only in `app/_layout.tsx`. | Track A rewards removal safety and minimal host app surface. |
| Keep native modules in the host app. | `expo-file-system`, `expo-sharing`, `react-native-view-shot`, and AsyncStorage stay behind `deps`. |
| Use mock burn-in images and mock report data. | The challenge forbids real user data and only needs auditable visual ground truth. |
| Log one rollback explicitly. | Failed hypotheses are part of the forge ratchet and should not be hidden. |

## Human Touch Points

Total human touch points: 4.

1. Student chose Track A and supplied the student number.
2. Human requirement fixed the submission boundary to `submissions/231118062-audit-forge/`.
3. Human requirement fixed the three route names and mandatory report names.
4. Human review is reserved before opening the PR.

## AI Tool Log

| Cycle | Tool | Role |
|---|---|---|
| 1 | Codex | Read upstream mission and scaffolded the Expo shell. |
| 2 | Codex | Integrated `@xtatistix/mobile-audit` with host-provided deps. |
| 3 | Codex | Generated mock burn-in assets and Markdown audit reports. |
| 4 | Codex | Wrote the forge ledger, evaluation notes, and decision log. |
| 5 | Codex | Ran local checks, prepared release evidence, and isolated the diff. |

## Self-Check

- README first line is exactly `Track: A`.
- `app/app/_layout.tsx` reads the active route with `usePathname()`.
- `currentScreen` is derived dynamically from the active Expo Router path.
- `AuditWidget` appears once under `app/` outside `node_modules`, and that occurrence is the mount line.
- Host `deps` provides `captureScreen`, `captureRef`, `writeFile`, `writeFileBinary`, `shareFile`, and `storage`.
- Routes exist for `/`, `/reports`, and `/forge`.
- `audit-reports/` contains `capture-cta.md`, `reports-export.md`, and `forge-ratchet.md`.
- Burn-in images are stored under `audit-reports/assets/`.
- `FORGE.md` includes at least 3 success cycles and 1 rollback cycle.
- `app-release.apk` is included at the submission root.
- No real user data is used.
