---
name: Context Doctor Mobile
colors:
  surface: "#ffffff"
  surface-dim: "#eef2f7"
  surface-bright: "#ffffff"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#f8fafc"
  surface-container: "#f1f5f9"
  surface-container-high: "#e2e8f0"
  surface-container-highest: "#cbd5e1"
  on-surface: "#111827"
  on-surface-variant: "#64748b"
  inverse-surface: "#0f172a"
  inverse-on-surface: "#ffffff"
  outline: "#cbd5e1"
  outline-variant: "#e2e8f0"
  surface-tint: "#2563eb"
  primary: "#2563eb"
  on-primary: "#ffffff"
  primary-container: "#dbeafe"
  on-primary-container: "#1e3a8a"
  inverse-primary: "#93c5fd"
  secondary: "#14b8a6"
  on-secondary: "#ffffff"
  secondary-container: "#ccfbf1"
  on-secondary-container: "#115e59"
  tertiary: "#475569"
  on-tertiary: "#ffffff"
  tertiary-container: "#e2e8f0"
  on-tertiary-container: "#1e293b"
  error: "#dc2626"
  on-error: "#ffffff"
  error-container: "#fee2e2"
  on-error-container: "#991b1b"
  warning: "#f59e0b"
  on-warning: "#111827"
  warning-container: "#fef3c7"
  on-warning-container: "#92400e"
  background: "#ffffff"
  on-background: "#111827"
  surface-variant: "#f8fafc"
fonts:
  primary:
    name: "Inter"
    source: "https://fonts.google.com/specimen/Inter"
    weights: [400, 500, 600, 700]
    styles: ["normal"]
    fallback: "system-ui, -apple-system, sans-serif"
    usage: "Tum mobil UI metinleri: baslik, body, label, badge, buton ve call kontrol metinleri"
typography:
  display:
    fontFamily: "Inter"
    fontSize: "24px"
    fontWeight: "700"
    lineHeight: "32px"
  headline-lg:
    fontFamily: "Inter"
    fontSize: "20px"
    fontWeight: "700"
    lineHeight: "28px"
  headline-md:
    fontFamily: "Inter"
    fontSize: "18px"
    fontWeight: "700"
    lineHeight: "24px"
  body-lg:
    fontFamily: "Inter"
    fontSize: "15px"
    fontWeight: "400"
    lineHeight: "23px"
  body-md:
    fontFamily: "Inter"
    fontSize: "14px"
    fontWeight: "400"
    lineHeight: "22px"
  label-md:
    fontFamily: "Inter"
    fontSize: "13px"
    fontWeight: "600"
    lineHeight: "18px"
  label-sm:
    fontFamily: "Inter"
    fontSize: "12px"
    fontWeight: "600"
    lineHeight: "16px"
rounded:
  sm: "0.25rem"
  DEFAULT: "0.5rem"
  md: "0.375rem"
  lg: "0.5rem"
  xl: "0.75rem"
  3xl: "1.5rem"
  full: "9999px"
spacing:
  base: "8px"
  xs: "4px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.lg}"
    padding: "{spacing.sm}"
  button-secondary-blue:
    backgroundColor: "{colors.primary-container}"
    textColor: "{colors.primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.lg}"
    padding: "{spacing.sm}"
  button-secondary-green:
    backgroundColor: "{colors.secondary-container}"
    textColor: "{colors.secondary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.lg}"
    padding: "{spacing.sm}"
  badge-blue:
    backgroundColor: "{colors.primary-container}"
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    padding: "2px 10px"
    typography: "{typography.label-sm}"
  badge-green:
    backgroundColor: "{colors.secondary-container}"
    textColor: "{colors.secondary}"
    rounded: "{rounded.lg}"
    padding: "2px 10px"
    typography: "{typography.label-sm}"
  sidebar:
    backgroundColor: "{colors.inverse-surface}"
    textColor: "{colors.inverse-on-surface}"
  call-control:
    backgroundColor: "{colors.inverse-surface}"
    textColor: "{colors.inverse-on-surface}"
    rounded: "{rounded.full}"
    padding: "{spacing.sm}"
  video-tile:
    backgroundColor: "{colors.inverse-surface}"
    textColor: "{colors.inverse-on-surface}"
    rounded: "{rounded.lg}"
  context-card:
    backgroundColor: "{colors.surface-container-low}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
---

## Brand & Style
The **Context Doctor Mobile** design system supports a focused healthcare
pre-consultation experience. It should feel calm, clinical, and direct: a mobile
product where the patient can enter an AI-avatar pre-consultation, speak or type
context, and later review a source-grounded patient summary and Doctor-Ready
Context Pack.

The aesthetic is functional rather than promotional. The app should not look
like a hospital admin dashboard, a generic chatbot, or a marketing landing page.
The primary experience is the avatar/video visit, supported by compact intake
and context-pack surfaces. Every screen should communicate that the product
prepares context for doctor review; it does not diagnose or recommend treatment.

## Colors
The app uses a light medical palette with strong video-call contrast. White and
soft slate surfaces carry the normal mobile flow, while blue marks primary
actions and teal marks safe progress/completion states.

- **Clinical Blue:** The core identity color (`#2563eb`). Used for primary
  actions, selected states, active call actions, and important navigation.
- **Support Teal:** Used for safe completion and positive preparation states
  (`#14b8a6`), such as completed context fields or ready summary sections.
- **Neutral Surfaces:** Slate-tinted surfaces (`#f8fafc`, `#f1f5f9`,
  `#e2e8f0`) keep forms, summaries, and context cards readable without making
  the app feel dense.
- **Call Contrast:** Video-call controls use dark inverse surfaces so camera,
  microphone, AI avatar, and leave actions remain visible over video.
- **Safety Red and Warning Amber:** Red is reserved for urgent red-flag
  interruption states and destructive actions. Amber is reserved for missing
  context or incomplete-preparation notices.

## Typography
The system uses **Inter** for readable mobile healthcare UI. Type should be
quiet and practical, with clear hierarchy but no oversized editorial treatment.

- **Compact Mobile Scale:** Headings stay within `18px` to `24px`; most body
  content uses `14px` or `15px` for readability on small screens.
- **Strong Labels:** Buttons, badges, and call controls use `600` weight so
  actions remain legible during live video.
- **Readable Summaries:** Patient summary and doctor brief sections should use
  body text with comfortable line height. Long medical-context text should be
  broken into concise sections rather than large paragraphs.
- **No Viewport Font Scaling:** Font sizes should be stable across devices.
  Layout should adapt through spacing, wrapping, and container width instead.

## Layout & Spacing
A mobile-first 8px spacing rhythm informs all screen composition. The app should
optimize for one-handed use, fast scanning, and stable call controls.

- **Primary Flow:** Home -> pre-consultation/intake session -> Stream video call
  with avatar -> patient summary / Doctor-Ready Context Pack.
- **Video Call Surface:** Participant tiles should use stable equal-grid sizing.
  Two participants split the screen evenly; three or more participants should
  remain predictable and avoid large self-view dominance.
- **Bottom Controls:** Camera, microphone, AI avatar, and leave controls belong
  in a bottom action bar. The bar can auto-hide and return on tap, but it should
  not overlap critical participant content.
- **Context Pack Screens:** Source-Grounded Brief, Missing Context Map,
  Consultation Readiness Score, and Doctor Review Questions should use compact
  sections with clear labels and source references where needed.
- **No Dashboard Density:** Do not introduce wide admin layouts, sidebars, dense
  tables, or placeholder modules in the active mobile experience.

## Elevation & Depth
Depth is communicated through surface contrast, spacing, and restrained shadows.
The interface should feel stable and trustworthy rather than decorative.

- **Video Priority:** During calls, video tiles are the highest-priority visual
  layer. Controls and alerts sit above video only when needed.
- **Context Cards:** Summary, missing-context, and doctor-brief sections can use
  light containers with subtle borders. They should not be nested inside larger
  decorative cards.
- **Urgent Interruptions:** Red-flag messages should use strong color contrast
  and clear spacing. They should interrupt the normal flow without looking like
  an error crash state.
- **Provider Neutrality:** Avatar UI should look like a participant or assistant
  layer, not like a Tavus-specific branded embed.

## Shapes
Shapes should remain friendly but not playful. Healthcare context benefits from
simple, predictable geometry.

- **Buttons & Inputs:** Use `rounded-lg` (`0.5rem`) for primary actions,
  secondary actions, text inputs, and context controls.
- **Call Controls:** Use `rounded-full` circular controls for camera,
  microphone, AI avatar, and leave buttons.
- **Video Tiles:** Use modest `rounded-lg` corners. Avoid overly decorative
  framing around participant video.
- **Context Sections:** Use `rounded-lg` cards or bands for repeated summary
  sections. Avoid cards inside cards.
- **Badges:** Status badges such as `red flag checked`, `missing context`, or
  `context ready` use small rounded labels with restrained color.
