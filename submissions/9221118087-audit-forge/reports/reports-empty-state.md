# Audit Report

## Screen
ReportsScreen

## Issue
Generated reports are hard to distinguish from sample reports

## Marked Area
Yellow marked area over the first report card in the ReportsScreen list.

## Timestamp
2026-05-17T09:18:00+03:00

## User Note
I cannot quickly tell whether a report came from the widget or from the packaged samples.

## Expected
Generated reports should have a clear local/generated label.

## Actual
All report cards look similar when scanning the list.

## Severity
low

## Steps to Reproduce
1. Generate one report with the floating AuditWidget.
2. Open ReportsScreen.
3. Compare the generated report card with the bundled sample report cards.

## Agent Input
Inspect ReportsScreen and ReportCard. Add a clear source indicator for generated versus sample reports without adding new dependencies. Run typecheck and lint.
