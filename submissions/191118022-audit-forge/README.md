Track: A

# 191118022-audit-forge

Minimal Expo + TypeScript host app that mounts `@xtatistix/mobile-audit` once, produces burn-in markdown bug reports from three screens, and logs a closed forge loop with `3 success + 1 rollback`.

## Quick Links

- Submission APK: [`app-release.apk`](./app-release.apk)
- Host app root: [`app/`](./app)
- Audit reports: [`audit-reports/`](./audit-reports)
- Forge ledger: [`FORGE.md`](./FORGE.md)

## Delivery Snapshot

- Expo link: `expo-go / local dev session` using `exp://192.168.1.57:8081` during verification
- Demo video link: `https://youtube.com/shorts/mNWAeRHWJ-w?si=-woTaau7acM1CKG8`
- Widget mount point: `app/components/AuditMount.native.tsx`
- Single-mount rule: `grep -r "AuditWidget" app/` should resolve to one host mount line when `node_modules/` is absent

## What Is Included

- A four-screen Expo Router host app: `/`, `/backlog`, `/insights`, `/settings`
- A local tarballed copy of `@xtatistix/mobile-audit` under `mobile-audit-package/`
- Three burn-in markdown audit reports:
  - `audit-reports/01-home-action-overflow.md`
  - `audit-reports/02-backlog-chip-collapse.md`
  - `audit-reports/03-settings-hint-contrast.md`
- A forge ledger with four cycles and explicit ratchet outcomes in `FORGE.md`
- A native Android APK in the submission root

## Decision Log

1. Chose `Track A` because the upstream audit package emphasizes a drop-in primitive, strict host boundaries, and minimum host intrusion.
2. Kept the widget outside the host app source tree as a local tarball package so the submission stays self-contained without polluting `app/` with vendor implementation details.
3. Used Expo Router so `currentScreen` can come from the active route via `usePathname()`, matching the challenge requirement directly.
4. Stored notes through a host-owned AsyncStorage adapter to preserve the “host decides persistence” contract from `nokta-audit`.
5. Built the APK from a short-path worktree clone because the normal Windows path caused native build failures with generated React Native/Expo paths.

## Human Touch Points

Total human touch points in the actual repair loop: `2`

1. Track selection was confirmed as `Track A` before implementation.
2. APK artifact recovery path was approved after Windows path/toolchain issues blocked the first native build attempts.

No human edited the three accepted UI fixes between `READ` and `COMMIT`; the human role stayed at route selection, permission approval, and final review.

## AI Tool Usage

- Cycle 1: `Codex` handled `READ → LOCATE → HYPOTHESIZE → REPAIR → TEST → VERIFY`
- Cycle 2: `Codex` handled `READ → LOCATE → HYPOTHESIZE`; rollback happened after verify failed the intent check
- Cycle 3: `Codex` handled `READ → LOCATE → REPAIR → TEST → VERIFY`
- Cycle 4: `Codex` handled `READ → LOCATE → REPAIR → TEST → VERIFY`

## Verification Performed

- `npm run typecheck`
- `npx expo export --platform web`
- Mobile-width visual review of the audit target screens
- Native debug APK build copied to `app-release.apk`

## Run Locally

```bash
cd submissions/191118022-audit-forge/app
npm install
npm run typecheck
npx expo start
```

For native Android packaging on Windows, the shortest reliable route in this workspace was:

1. Run the app normally from `submissions/191118022-audit-forge/app`
2. Build the APK from a short-path clone/worktree
3. Copy the resulting `app-debug.apk` back as `app-release.apk`

## Notes For Reviewer

- `audit-reports/screens/*-burnin.png` are the immutable burn-in screenshots used by the markdown reports.
- `audit-reports/verify/` contains post-fix verification captures for the accepted backlog and settings fixes; home fix verification was performed in mobile viewport preview during the compact-layout pass.
- The placeholder Google Drive URL should be replaced with the real demo recording link before final submission.
