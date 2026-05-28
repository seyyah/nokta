# Audit Report 03 - Bridge Stuck

**Screen:** Forge / Bridge  
**Burn-in:** [`assets/report-03-bridge-stuck.svg`](./assets/report-03-bridge-stuck.svg)

The forge should not keep guessing after two consecutive rollbacks.

## Read

The main failure mode is a loop that stays inside the app when it should hand the work to a human.

## Locate

`app/src/forge/forgeData.js`, `app/src/components/ForgeRail.js`, `app/src/bridge/BridgeModal.js`

## Hypothesize

Two rollback rows in a row should be enough to justify an expert call.

## Repair

When a bridge-kind audit report is saved, the app appends two rollback rows and opens the Jitsi bridge modal.

## Test

Manual stuck simulation from the AuditWidget.

## Verify

The bridge opens, the forge state stays visible, and the summary can be written back into BRIDGE.md.
