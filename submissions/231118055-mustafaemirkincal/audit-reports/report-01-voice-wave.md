# Audit Report 01 - Voice Wave

**Screen:** Voice visualizer  
**Burn-in:** [`assets/report-01-voice-wave.svg`](./assets/report-01-voice-wave.svg)

The mic meter should spike quickly when the user speaks and collapse back toward zero when the room gets quiet.

## Read

The main risk is that the waveform could feel disconnected from the transcript.

## Locate

`app/src/hooks/useVoiceCapture.js` and `app/src/components/VoiceVisualizer.js`

## Hypothesize

If the waveform is driven by metering from the same recording session that powers speech recognition, the signal should feel immediate.

## Repair

Use `expo-av` metering and the live transcript in the same visual stack.

## Test

Manual speak/stop cycle with a short sentence in Turkish.

## Verify

The bars rise while speaking and fall when silence returns. The transcript sits directly below the wave.
