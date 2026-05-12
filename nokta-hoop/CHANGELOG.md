# Changelog

Project-level changes for `nokta-hoop`.

Format follows Keep a Changelog. Versions are named as `nokta-hoop X.Y.Z`;
entries below are rebuilt from the current git commit history.

## [Unreleased]

## [nokta-hoop 0.5.0] - 2026-05-08

### Added
- Added a `/tts/warmup` token-server endpoint and mobile startup warmup request
  so demo Mascot phrases can be pre-generated into the Chatterbox cache.
- Added a selectable Piper TTS provider for the local TTS server so the Mascot
  can use a lighter Turkish voice model without removing Chatterbox.
- Added cancellation for pending mentor requests from the waiting status card.

### Changed
- Changed Mascot Chatterbox playback to split responses into sentence-sized
  chunks, start playback after the first chunk is ready, and prefetch the next
  chunk while the current one is playing.
- Changed the Mascot welcome message to be spoken on app startup instead of
  only being inserted into the chat history.
- Changed mentor mode so the chat panel is shorter over the live mentor camera
  and the composer microphone remains available for speech-to-text messages.
- Changed Mascot status cards to appear above the title, auto-hide accepted
  mentor notices, and give the mentor live screen a taller self-video area.
- Changed requester-side mentor sessions to use Stream's listener audio role so
  the mentor handoff behaves more like a live broadcast with chat input.
- Changed mentor escalations to create Stream `livestream` calls, start the
  live state through the token server, and carry the escalation call type
  through join, end, and transcript requests.
- Changed livestream requester join to retry while the call is briefly
  backstage, and moved livestream transcription start/stop to token-server
  endpoints so mobile user roles do not need elevated Stream permissions.
- Changed mentor speech-to-text so the viewer audio manager is suspended while
  recording and restored as a listener afterward.
- Changed local TTS cache/model paths to resolve relative to
  `services/tts-server` when relative paths are configured.
- Changed the local TTS server to load `services/tts-server/.env`
  automatically before selecting Chatterbox or Piper.
- Changed the TTS example environment to default to Piper and match the local
  development `.env` layout.
- Changed the default Piper speech length scale to `0.75` for faster Mascot
  speech.
- Changed token-server TTS proxy fallback metadata so it no longer labels every
  remote TTS error as Chatterbox-specific.
- Changed ready UI copy to consistently use Turkish characters and
  Maskot/Transkript/Sohbet naming.
- Changed the embedded mentor video controls to remove the covered footer copy
  and expose a floating end button over the video.
- Updated local TTS setup docs with the Piper provider option.
- Pinned the local TTS server to `setuptools<81` so `resemble-perth`
  watermarking imports remain compatible.

## [nokta-hoop 0.4.0] - 2026-05-07

### Added
- Added an optional local Chatterbox Multilingual TTS service under
  `services/tts-server` for generating Turkish Mascot speech audio.
- Added token-server TTS proxy endpoints so mobile clients can request Mascot
  speech through the existing public token-server URL.
- Added mobile Chatterbox speech playback with `expo-audio` and automatic
  fallback to device speech when the TTS service is unavailable.
- Added mentor-session chat message endpoints so user messages can be shown to
  the mentor during an accepted live support session.
- Added an embedded live mentor camera surface that replaces the Mascot avatar
  without moving the user to a separate video-call screen.

### Changed
- Updated `AGENT.md` repo structure guidance so agents treat the listed folders
  as ownership boundaries instead of stale active/planned status.
- Updated environment examples and developer docs with Chatterbox TTS setup,
  proxy configuration, and dev-client rebuild guidance.
- Changed accepted mentor handoff so the user stays in the same Mascot chat,
  writes to the mentor from that chat, and pauses Mascot/Groq responses until
  the mentor session ends.
- Changed mentor-session transcript return to summarize the user's written
  questions with the mentor's spoken transcript instead of treating it as a
  normal two-way video call transcript.

## [nokta-hoop 0.3.0] - 2026-05-07

### Added
- Added `packages/hoop-core` as the shared human-loop domain package with
  mascot chat messages, escalation request models, expert-help detection, and
  transcript return helpers.
- Added `MascotDecision` and the `/mascot/decide` endpoint so the Mascot can
  decide whether to answer directly or escalate to a mentor before creating a
  support request.
- Added token-server escalation endpoints for creating, listing, accepting, and
  resolving mentor support requests.
- Added mobile Nokta Mascot and Mentor Queue screens so a user can request
  expert help, mentors can accept pending requests, and accepted requests
  hand off into the existing Stream Video call flow.
- Added real Mascot voice interaction on mobile with speech-to-text input and
  Turkish text-to-speech responses.
- Added the example-inspired native 3D Nokta Mascot avatar using Three.js,
  React Three Fiber, and Expo GL.
- Added optional Groq-powered Mascot answers and mentor/escalation decisions
  through the token server while keeping deterministic fallback behavior.

### Changed
- Updated `README.md` to describe the current Mascot, mentor handoff,
  transcript, and token-server API scope.
- Changed the mobile app entry point to start from the Mascot conversation and
  return to the Mascot after expert-call transcript handling.
- Changed the Mascot screen to a voice-first layout with a full-screen 3D
  mascot stage, floating microphone controls, and an optional chat overlay.
- Swapped the 3D mascot shell to simpler standard materials and removed the
  component-level runtime Three.js namespace import to reduce Expo GL warnings.
- Changed mentor-call completion to return to the Mascot immediately while
  locking Mascot input until the background transcript is ready.
- Adjusted the Mascot screen layout so the 3D avatar stays above the chat
  overlay instead of being covered by the conversation panel.
- Nudged the 3D Mascot stage higher while keeping the chat overlay placement
  unchanged.
- Changed the Mascot chat overlay to open by default while preserving a larger
  3D avatar stage.
- Moved Mascot voice input into the message composer, removed the separate
  voice-assistant bottom bar, and kept a compact chat composer when minimized.
- Removed direct room/call entry from the Mascot UI so video calls are only
  opened through mentor or expert handoff.
- Changed mentor-call hangup to end the Stream call for every participant and
  made the other device exit automatically when a call-ended event arrives.
- Added call-state and ended-at fallbacks plus a custom end button so the call
  screen can recover even if Stream has already moved the call to `LEFT`.
- Changed empty Stream transcript assets to finish as completed calls with a
  no-speech message instead of keeping the Mascot locked in transcript loading.
- Strengthened Mascot expert routing so deterministic expert-domain signals
  such as graph algorithms and Hamilton cycles override Groq answers.
- Changed expert-domain routing to ask for user confirmation before creating a
  mentor request, while keeping explicit expert requests immediate.
- Added a Mascot chat reset action that clears the local conversation and
  pending expert offer when no mentor flow is active.
- Moved the microphone control to the right side of the send button and
  replaced the text label with a microphone glyph.
- Refined the composer microphone glyph to use a clearer classic microphone
  silhouette.
- Increased Mascot speech playback speed for a snappier voice response.
- Removed the deprecated mobile TypeScript `baseUrl` option while keeping the
  current workspace path mapping intact.

## [nokta-hoop 0.2.1] - 2026-05-07

### Changed
- Expanded and localized `README.md` in Turkish, covering the broader Nokta
  Hoop governance/writeback goal, the current video call/transcript MVP,
  repository layout, setup flow, commands, API endpoints, and scope boundaries.

## [nokta-hoop 0.2.0] - 2026-05-06

### Added
- Added project support documents: `AGENT.md`, `DESIGN.md`, and this
  `CHANGELOG.md`.
- Added root `.gitignore` rules for local `example/` reference code, Node/Expo
  outputs, logs, and environment files.
- Added npm workspace structure for `apps/mobile`, `packages/hoop-call`, and
  `services/token-server`.
- Added `packages/hoop-call` transcript utilities for Stream JSONL parsing,
  transcript formatting, and transcription asset selection.
- Added a `nokta-hoop` Stream token server with `/token`, `/users`,
  `/calls/:callType/:callId/transcriptions`, and
  `/calls/:callType/:callId/transcript` endpoints.
- Added the Expo mobile video-call app with room join, Stream call controls,
  automatic transcription start/stop, transcript polling, and transcript
  reading screen.
- Added transcript export support with backend downloads for Markdown, text,
  and JSON plus mobile transcript-screen download buttons.
- Added `DEVELOPER_SETUP.md` with new-developer instructions for Stream
  credentials, environment files, Cloudflare Tunnel, Expo Metro, and Android
  dev-client testing.

### Changed
- Kept `packages/hoop-core` and `packages/hoop-wiki` as empty planned folders
  only; active workspace scripts now run the video-call package, token server,
  and mobile app.
- Limited Android debug builds to `arm64-v8a` and `x86_64` to avoid the
  `armeabi-v7a` native codegen crash seen while compiling `react-native-svg`.
- Changed the token server to bind to `0.0.0.0` by default so physical Android
  devices can reach it through the development machine LAN IP.
- Fixed root `mobile:start` argument forwarding so Expo flags such as
  `--clear --host lan` reach the mobile workspace script.
- Delayed transcript navigation until transcription stop/leave handling
  finishes, removed duplicate call leave cleanup, and treated empty Stream
  transcript assets as still processing instead of showing a ready `0 line`
  transcript.
- Changed call ending to move into the transcript screen immediately and show
  an explicit transcript loading state while Stream prepares the transcript.

## [nokta-hoop 0.1.0] - 2026-05-06

### Added
- Added the initial `README.md` with the short `nokta-hoop` product summary.
- Added `PLAN.md` with the draft repository creation plan, target folder
  structure, source synthesis, execution plan, and verification plan.
- Added `IDEA.md` with the architectural specification for HITL/HOTL/HOOTL
  governance, video-call sessions, transcripts, wiki writeback, data models,
  API draft, CLI reference, test strategy, and first implementation target.
