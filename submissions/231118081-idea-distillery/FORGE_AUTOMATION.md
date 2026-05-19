# Optional Local Forge Automation

This is the extra autonomy layer for the demo. It is not a backend for users.
It is a local development server that listens for audit markdown reports and
tries to close the repair loop automatically with a local Ollama model.

```txt
AuditWidget export
-> POST /audit
-> save report under audit-reports/inbox/
-> ask Ollama for a bounded JSON repair decision
-> validate exact search/replace edits or a unified diff
-> apply edits only inside this submission app
-> npm run typecheck
-> commit on success or restore rollback on failure
-> append FORGE.md ledger row
```

## Why Local Server Instead Of In-App Code Mutation

The APK should not rewrite its own source code. Code repair belongs to the
developer machine, where Git, Node, tests, and Ollama are available. The mobile
app only captures customer-developer evidence and forwards the markdown report
when a local forge endpoint is configured.

## Start Ollama

Use an already installed local model, or set the exact model name:

```powershell
ollama list
$env:OLLAMA_MODEL="your-installed-model"
```

If `OLLAMA_MODEL` is not set, the server asks Ollama for the first installed
model.

## Start The Forge Server

From the submission folder:

```powershell
cd submissions/231118081-idea-distillery
node tools/forge-server.mjs --self-check
node tools/forge-server.mjs
```

The default endpoint is:

```txt
http://localhost:8787/audit
```

Useful environment variables:

```powershell
$env:FORGE_PORT="8787"
$env:OLLAMA_URL="http://localhost:11434"
$env:OLLAMA_MODEL="your-installed-model"
$env:FORGE_COMMIT="1"
```

Set `FORGE_COMMIT=0` if you want the server to apply and test patches without
creating commits.

## Connect The App

Set this in `app/.env`.

For Android emulator:

```env
EXPO_PUBLIC_FORGE_ENDPOINT=http://10.0.2.2:8787/audit
```

For Expo web or iOS simulator:

```env
EXPO_PUBLIC_FORGE_ENDPOINT=http://localhost:8787/audit
```

For a physical phone, use the computer's LAN IP:

```env
EXPO_PUBLIC_FORGE_ENDPOINT=http://192.168.1.20:8787/audit
```

If this value is empty, the app still works normally. Audit reports are written
and shared locally, but no automation request is sent.

## Safety Rails

The server rejects or rolls back unsafe work:

- refuses to start a cycle if the submission worktree is dirty
- accepts patch paths only under `app/App.tsx` or `app/src/`
- rejects root files, `.env`, package files, build config, and other submissions
- asks the model for JSON, not free-form shell commands
- prefers exact search/replace edits copied from source context
- falls back to `git apply --check` only when the model returns a diff
- has a narrow recipe for the demo's green readiness indicator request when the
  local model finds the right intent but produces a bad edit location
- runs `npm run typecheck`
- restores backups or reverse-applies the patch if typecheck fails
- logs success or rollback in `FORGE.md`

Runtime outputs are ignored:

```txt
audit-reports/inbox/
tools/forge-runs/
```

## Demo Script

1. Start Ollama.
2. Start `node tools/forge-server.mjs`.
3. Set `EXPO_PUBLIC_FORGE_ENDPOINT` in `app/.env`.
4. Start Expo.
5. Use the audit FAB and export markdown.
6. Watch the server save the report, ask Ollama, run typecheck, and either
   commit or rollback.

This makes the assignment loop concrete:

```txt
customer captures -> local LLM proposes -> server verifies -> Git records
```
