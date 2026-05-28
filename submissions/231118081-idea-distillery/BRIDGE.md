# BRIDGE.md

## Expert Bridge Summary

- Trigger: two consecutive forge rollback/fail cycles.
- Room: `nokta-231118081-cycle-15`
- Provider: Jitsi WebView inside the app.
- Demo role: a classmate joins from desktop and shares screen; the app shows
  video, audio, and the shared screen inside the bridge view.

## Call Recap

The expert bridge is used when the local forge loop cannot safely decide the
next change. The agreed recovery path is to keep the repair bounded, preserve
the audit widget host boundary, and feed the expert recap into the next forge
prompt before another patch is attempted.

## Next Cycle Context

When `BRIDGE.md` exists, `tools/forge-server.mjs` includes it in the next
Ollama prompt under "Expert bridge context". The next cycle must reference this
summary instead of repeating the failed hypothesis.

## Last Forge Cycles

- Cycle 12: success - voice metering drives the visualizer and avatar.
- Cycle 13: success - dictated audit notes and Jitsi bridge are wired.
- Cycle 14: rollback - an unbounded native WebRTC rewrite was rejected in favor
  of the Jitsi WebView bridge.
- Cycle 15: stuck - retrying provider-token automation without an expert
  provider secret would repeat the failed hypothesis.
