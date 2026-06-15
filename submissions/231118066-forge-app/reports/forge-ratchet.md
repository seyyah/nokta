# Audit Report

**Screen:** `Settings`
**Timestamp:** 2025-05-17T09:44:55.000Z
**Note:** The current FORGE loop state (cycle count, last commit hash, kg points) is not surfaced anywhere in the UI. A user reviewing the app cannot tell at a glance where the ratchet stands.

## Annotations

- **Box 1:** x=16 y=360 w=328 h=80 — "About ForgeApp" card only shows static info, no live ratchet state

## Hypothesis

> Surfacing the next repair step will make the loop state readable at a glance.

## Expected Fix

> Replace the static "About" card with a live FORGE ledger summary: cycle count, last commit hash, and current kg score loaded from `FORGE.md`.
