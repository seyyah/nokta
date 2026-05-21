# Audit Report

## Screen
HomeScreen

## Issue
Primary action label is unclear for first-time users

## Marked Area
Yellow marked area around the main Start audit flow button on the HomeScreen.

## Timestamp
2026-05-17T09:10:00+03:00

## User Note
The button says Start, but users do not know that it opens the audit capture flow.

## Expected
The call to action should make the audit-reporting action explicit.

## Actual
The label is generic and easy to confuse with normal app navigation.

## Severity
medium

## Steps to Reproduce
1. Open the app on HomeScreen.
2. Look at the main action below the screen cards.
3. Ask what action will happen without tapping it.

## Agent Input
Read HomeScreen and ScreenCard copy. Rename the primary action so it clearly starts an audit report, then run typecheck and verify the HomeScreen still fits on a small phone viewport.
