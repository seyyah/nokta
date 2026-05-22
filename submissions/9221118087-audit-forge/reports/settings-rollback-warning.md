# Audit Report

## Screen
SettingsScreen

## Issue
Rollback policy is present but not prominent enough

## Marked Area
Yellow marked area around the rollback policy panel near the bottom of SettingsScreen.

## Timestamp
2026-05-17T09:26:00+03:00

## User Note
The rollback rule is important for Track C, but it reads like secondary settings text.

## Expected
Rollback should be clearly visible as a quality gate for failed repairs.

## Actual
The policy is easy to miss while scanning settings.

## Severity
high

## Steps to Reproduce
1. Open SettingsScreen.
2. Scroll to the repair policy area.
3. Scan the page quickly and note whether rollback stands out.

## Agent Input
Update SettingsScreen visual hierarchy so rollback is visibly a repair-loop gate. Preserve the existing Track C language and run typecheck.
