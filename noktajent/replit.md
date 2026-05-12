# Nokta

AI destekli üretkenlik çalışma alanı — görev yönetimi, ajanda, 7 uzman AI ajanı ve destek sohbeti.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `AI_INTEGRATIONS_ANTHROPIC_BASE_URL`, `AI_INTEGRATIONS_ANTHROPIC_API_KEY` — Anthropic AI via Replit

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo 54, React Native, expo-router v6
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec) — uses `mode: "single"` for zod output to avoid type conflicts
- AI: Anthropic via `@workspace/integrations-anthropic-ai` (Replit AI proxy)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/nokta/` — Expo mobile app
- `artifacts/api-server/src/routes/anthropic.ts` — 7 AI agent streaming endpoints
- `artifacts/api-server/src/routes/support.ts` — Human support chat
- `artifacts/nokta/contexts/TasksContext.tsx` — Kanban tasks (AsyncStorage)
- `artifacts/nokta/contexts/AgendaContext.tsx` — Calendar events (AsyncStorage)
- `artifacts/nokta/app/(tabs)/` — 5 tabs: index (dashboard), tasks, agenda, ai, support
- `lib/db/src/schema/` — conversations.ts + messages.ts for AI chat history
- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/api-spec/orval.config.ts` — Zod uses mode "single", target "generated/api.ts"

## Architecture decisions

- Tasks and agenda events stored client-side in AsyncStorage (mobile-first, offline-capable)
- AI conversation history stored in PostgreSQL via Drizzle ORM
- 7 AI agent personas defined in `anthropic.ts` with Turkish system prompts
- SSE streaming for AI responses — consumed via fetch+ReadableStream (not EventSource)
- Tab structure: index (dashboard) / tasks (Kanban) / agenda (calendar) / ai (agents) / support

## Product

- **Ana (Dashboard):** Today's date, task stats, today's events, urgent tasks, quick access grid, AI agents promo
- **Görevler (Tasks):** Full Kanban board with 4 columns (Todo/Progress/Review/Done), priorities, checklist, Pomodoro counter
- **Ajanda (Calendar):** Monthly grid calendar with event dots, daily event list, add events with color picker
- **AI:** 7 AI agent workspace (Planlayıcı/Mimar/Frontend/Backend/Güvenlik/Koç/Eleştirmen) with SSE streaming, conversation history
- **Destek:** Human support chat with admin panel at `/api/support/admin`
- Settings: 5 color themes, plugin toggles, history

## User preferences

- All UI text in Turkish
- Use claude-sonnet-4-6 model for AI agent tasks

## Gotchas

- orval `mode: "single"` for zod output — avoids duplicate GetSupportMessagesParams export conflict between api.ts and generated types folder
- After codegen, manually verify `lib/api-zod/src/index.ts` only exports from `./generated/api`
- `pnpm --filter @workspace/db run push` must be run after adding new tables to schema
- api-server imports from `@workspace/integrations-anthropic-ai` — must be in dependencies and tsconfig references

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
