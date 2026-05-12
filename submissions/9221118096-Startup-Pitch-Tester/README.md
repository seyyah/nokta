NOKTA Submission - Startup Pitch Tester

Track Selection

- Track 2: Pitch paragraph -> AI tests market claims and returns Slop Score + justification

Project Summary
Startup Pitch Tester lets users paste a startup pitch and get a Slop Score (1-100) with a brief justification. It is designed to highlight hype, buzzwords, and unrealistic claims.

New Feature - JUDGE-7 Robo-Auditor (inspired by nokta-mascot)

The pitch tester now puts you in front of an animated, interactive robo-judge. JUDGE-7 is a different character from nokta-mascot's friendly speech-bubble assistant: it is a stern, monocled auditor in dark navy and gold, with twin red-LED antennae and a wooden gavel. Built with React Native Animated + Pressable (no Three.js).

Verdict-driven moods (set by the parsed Gemini Slop Score):
- idle: gentle breathing, occasional blink, "AWAITING THE PITCH"
- analyzing: green scan line sweeps across its face, eyes flicker
- grounded (score < 40): gold halo pulse, smile, "VERDICT - GROUNDED"
- skeptical (40-69): raised monocle smirk, "VERDICT - MIXED SIGNALS"
- outraged (>= 70): red eye flash, head shakes, gavel slams, "VERDICT - PURE SLOP"

Interactive moods (parallel to nokta-mascot's tickle / angry / sleep):
- Tap JUDGE-7: brief disturbance shake, "OBJECTION NOTED."
- Tap 3 times in 1s: contempt-of-court state with red glow + gavel, "IN CONTEMPT OF COURT!"
- 15 seconds idle (with no pitch submitted): JUDGE-7 dozes off — Zzz floats, eyes close, monocle dangles. Tap to wake.

Voice playback (TTS):
- A "Hear verdict" button next to the Justification heading uses expo-speech to read the AI's justification aloud.
- While speaking, JUDGE-7 enters a "speaking" mood with a blue glow and an animated mouth (lip-sync style, the same idea as nokta-mascot's Voice.getLevel() driving the avatar's mouth).
- Pressing the button again stops the speech and the animation.

The result card now also shows an animated SLOP METER bar that fills to the parsed score (green / amber / red tiers) and a cleaner Justification block, instead of dumping the raw response text.

Files added/changed:
- app/components/RoboJudge.js (new) - the animated, tap-aware mascot
- app/components/ScoreMeter.js (new) - animated slop-score bar
- app/App.js - parses SLOP SCORE / JUSTIFICATION, drives the judge's mood, exposes the TTS toggle
- app/package.json - adds expo-speech

How it relates to nokta-mascot (and how it differs):
- Same idea pattern: a reactive mascot whose state is driven by both program logic and direct user touch; speech synthesis announces the AI's reply.
- Different robot/design: square dark-navy auditor with monocle, twin antennae, gavel, gold trim - not Nokta's round white speech-bubble with a single antenna.
- Different theme: a silent judge that rules on your pitch (Track 2's slop-detection brief), not a friendly conversational helper.
- Different interactions: tap -> "objection", triple-tap -> "in contempt", idle -> "dozed off" (vs Nokta's tickle / angry / sleep / love).
- Implementation: React Native Animated + Pressable + expo-speech (Expo Go compatible) instead of Three.js + Web Speech API.

Links (replace later)

- Expo QR Code / Preview Link: exp://192.168.100.32:8081
- 60s Demo Video: https://youtu.be/4BN5iT95QJo
- PR Link: https://github.com/seyyah/nokta/pull/88
- APK (app-release.apk): https://expo.dev/accounts/ibrahimalicode/projects/app/builds/426245d1-1a81-4d73-ad5c-d7b9058e196f

Decision Log

- Chose Track 2 to focus on market-claim critique and readability of AI feedback.
- Used Expo + React Native for fast iteration and easy demo sharing.
- Designed a premium, minimal UI to make the analysis feel credible and easy to scan.
- Added JUDGE-7, an interactive 2D robo-judge mascot inspired by nokta-mascot. Chose a stern auditor persona (square head, monocle, gavel, dark navy + gold) rather than copying Nokta's friendly speech-bubble — the character had to fit Track 2's adversarial pitch-judging brief.
- Skipped Three.js / react-three-fiber in favour of pure React Native Animated + Pressable so the mascot stays Expo Go compatible and adds no native build complexity.
- Drove JUDGE-7's verdict mood directly from the parsed Slop Score (grounded < 40, skeptical 40-69, outraged >= 70) and added a SLOP METER bar so the user reads the number in two ways (numerically on the robot's forehead, visually on the bar).
- Mirrored nokta-mascot's interactivity model with tap-driven moods: single tap = "objection noted" shake, triple-tap-in-1s = "in contempt of court" gavel slam, 15s idle = "dozed off" Zzz overlay (tap to wake).
- Added expo-speech-based TTS behind an opt-in "Hear verdict" button (user requested it be a choice, not automatic). While speaking, JUDGE-7 enters a "speaking" mood with a blue glow and animated mouth — the lip-sync analogue to nokta-mascot's Voice.getLevel() pipeline.

Setup (optional)

1. Install dependencies: npm install
2. Run: npx expo start

Submission Checklist

- README.md (track, links, decision log)
- idea.md (track-specific idea)
- app/ (Expo project)
- app-release.apk
