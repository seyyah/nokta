# Audit Report 02 - Avatar Lipsync

**Screen:** Avatar stage  
**Burn-in:** [`assets/report-02-avatar-lipsync.svg`](./assets/report-02-avatar-lipsync.svg)

The avatar should react to the same mic signal as the waveform and keep the mouth motion subtle rather than noisy.

## Read

The problem is not color. The problem is motion sync and readability.

## Locate

`app/src/components/AvatarStage.js`

## Hypothesize

If only the head and mouth react to amplitude, the avatar will look alive without becoming distracting.

## Repair

Load the custom `avatar.glb`, recolor it per persona, and scale the mouth by voice level.

## Test

Manual talk test with the `Junior-Sen` and `Senior-Sen` toggles.

## Verify

The root turns gently and the mouth opens a little more when the mic level rises.
