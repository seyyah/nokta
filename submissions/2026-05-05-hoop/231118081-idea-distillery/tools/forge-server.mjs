#!/usr/bin/env node
import http from 'node:http';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const toolsDir = path.dirname(fileURLToPath(import.meta.url));
const submissionRoot = path.resolve(toolsDir, '..');
const appRoot = path.join(submissionRoot, 'app');
const inboxDir = path.join(submissionRoot, 'audit-reports', 'inbox');
const runsDir = path.join(toolsDir, 'forge-runs');
const forgeLedgerPath = path.join(submissionRoot, 'FORGE.md');

const port = Number(process.env.FORGE_PORT ?? 8787);
const ollamaUrl = process.env.OLLAMA_URL ?? 'http://localhost:11434';
const maxBodyBytes = Number(process.env.FORGE_MAX_BODY_BYTES ?? 12 * 1024 * 1024);
const autoCommit = process.env.FORGE_COMMIT !== '0';
const allowedPatchPrefixes = ['app/App.tsx', 'app/src/'];
const npmCommand = 'npm';
const gitCommand = process.platform === 'win32' ? 'git.exe' : 'git';

function printHelp() {
  console.log(`
Nokta local forge server

Usage:
  node tools/forge-server.mjs
  node tools/forge-server.mjs --self-check

Environment:
  FORGE_PORT=8787
  OLLAMA_URL=http://localhost:11434
  OLLAMA_MODEL=<installed model name>   # optional; first local model is used otherwise
  FORGE_COMMIT=1                        # set 0 to apply without committing

Endpoint:
  POST /audit
  {
    "filename": "bug-report.md",
    "content": "# markdown audit report",
    "fileUri": "file://...",
    "source": "Nokta Game Pitch AuditWidget"
  }
`);
}

async function run(command, args, options = {}) {
  return new Promise((resolve) => {
    const spawnCommand = process.platform === 'win32' && command === 'npm' ? 'cmd.exe' : command;
    const spawnArgs =
      process.platform === 'win32' && command === 'npm'
        ? ['/d', '/s', '/c', 'npm', ...args]
        : args;
    let stdout = '';
    let stderr = '';
    let child;

    try {
      child = spawn(spawnCommand, spawnArgs, {
        cwd: options.cwd ?? submissionRoot,
        shell: false,
        env: { ...process.env, ...(options.env ?? {}) },
      });
    } catch (error) {
      resolve({
        code: 1,
        stdout,
        stderr: error instanceof Error ? error.message : String(error),
      });
      return;
    }

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('error', (error) => {
      resolve({ code: 1, stdout, stderr: `${stderr}\n${error.message}` });
    });
    child.on('close', (code) => {
      resolve({ code: code ?? 1, stdout, stderr });
    });
  });
}

async function runChecked(command, args, options = {}) {
  const result = await run(command, args, options);

  if (result.code !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed\n${result.stderr || result.stdout}`);
  }

  return result;
}

async function selfCheck() {
  const required = [
    appRoot,
    path.join(appRoot, 'App.tsx'),
    path.join(appRoot, 'package.json'),
    forgeLedgerPath,
  ];
  const missing = required.filter((item) => !existsSync(item));

  if (missing.length > 0) {
    throw new Error(`Missing required paths:\n${missing.join('\n')}`);
  }

  const gitRoot = await run(gitCommand, ['rev-parse', '--show-toplevel'], { cwd: submissionRoot });
  const typecheck = await run(npmCommand, ['run', 'typecheck'], { cwd: appRoot });

  console.log(JSON.stringify({
    ok: true,
    submissionRoot,
    appRoot,
    gitRoot: gitRoot.stdout.trim(),
    typecheck: typecheck.code === 0 ? 'passed' : 'failed',
  }, null, 2));

  if (typecheck.code !== 0) {
    process.exitCode = 1;
  }
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(payload, null, 2));
}

async function readRequestBody(request) {
  const chunks = [];
  let total = 0;

  for await (const chunk of request) {
    total += chunk.length;

    if (total > maxBodyBytes) {
      throw new Error(`Request body exceeds ${maxBodyBytes} bytes.`);
    }

    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString('utf8');
}

function parseAuditPayload(request, body) {
  const contentType = request.headers['content-type'] ?? '';

  if (contentType.includes('application/json')) {
    const payload = JSON.parse(body);
    return {
      filename: String(payload.filename ?? 'audit-report.md'),
      content: String(payload.content ?? ''),
      fileUri: payload.fileUri ? String(payload.fileUri) : '',
      source: payload.source ? String(payload.source) : 'unknown',
    };
  }

  return {
    filename: 'audit-report.md',
    content: body,
    fileUri: '',
    source: 'raw markdown',
  };
}

function sanitizeFileName(value) {
  const safe = value.replace(/[^a-zA-Z0-9._-]/g, '-');
  return safe.endsWith('.md') ? safe : `${safe}.md`;
}

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

async function saveAuditReport(payload, runId) {
  await fs.mkdir(inboxDir, { recursive: true });
  const filename = `${runId}-${sanitizeFileName(payload.filename)}`;
  const target = path.join(inboxDir, filename);
  await fs.writeFile(target, payload.content.endsWith('\n') ? payload.content : `${payload.content}\n`, 'utf8');
  return target;
}

async function ensureCleanWorktree() {
  const status = await run(gitCommand, ['status', '--porcelain', '--', '.'], { cwd: submissionRoot });

  if (status.stdout.trim()) {
    throw new Error(`Working tree has local changes inside submission folder:\n${status.stdout}`);
  }
}

async function resolveOllamaModel() {
  if (process.env.OLLAMA_MODEL?.trim()) {
    return process.env.OLLAMA_MODEL.trim();
  }

  const response = await fetch(`${ollamaUrl}/api/tags`);

  if (!response.ok) {
    throw new Error(`Ollama model list failed: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  const firstModel = payload.models?.[0]?.name;

  if (!firstModel) {
    throw new Error('No local Ollama model found. Pull a model or set OLLAMA_MODEL.');
  }

  return firstModel;
}

async function readText(relativePath, maxChars) {
  const absolutePath = path.join(submissionRoot, relativePath);
  const text = await fs.readFile(absolutePath, 'utf8');

  if (text.length <= maxChars) {
    return text;
  }

  return `${text.slice(0, maxChars)}\n\n[truncated]`;
}

async function listFiles(dir, prefix = '') {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.expo' || entry.name === 'dist') {
      continue;
    }

    const relative = path.join(prefix, entry.name).replace(/\\/g, '/');
    const absolute = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...await listFiles(absolute, relative));
    } else {
      files.push(relative);
    }
  }

  return files;
}

function extractScreenName(markdown) {
  const explicit = markdown.match(/\*\*Screen:\*\*\s*`?([^`\n]+)`?/i);
  const widget = markdown.match(/##\s*Ekran:\s*([^\n]+)/i);
  const fallback = markdown.match(/\*\*Ekran:\*\*\s*`?([^`\n]+)`?/i);
  return (explicit?.[1] ?? widget?.[1] ?? fallback?.[1] ?? 'Audit').trim();
}

async function buildPrompt(payload, reportPath) {
  const appTree = (await listFiles(appRoot))
    .filter((file) => /\.(ts|tsx|json)$/.test(file))
    .slice(0, 80)
    .join('\n');
  const appTsx = await readText('app/App.tsx', Number(process.env.FORGE_APP_CONTEXT_CHARS ?? 36000));
  const types = await readText('app/src/types/draft.ts', 12000);
  const componentContext = await readComponentContext();
  const evalDoc = existsSync(path.join(submissionRoot, 'EVAL.md'))
    ? await readText('EVAL.md', 9000)
    : '';

  return [
    'You are the local autonomous forge repair agent for a student Audit-Forge submission.',
    'Return JSON only. Do not wrap the JSON in markdown.',
    '',
    'Hard rules:',
    '- You may propose a repair or a rollback.',
    '- If the request is unsafe, too broad, or violates the app lifecycle, return action "rollback".',
    '- If repairing, return a unified diff only.',
    '- Diff paths must be relative to this submission root, for example app/App.tsx.',
    '- You may modify only app/App.tsx or files under app/src/.',
    '- Do not modify root repo files, other submissions, .env files, package files, or build config.',
    '- Keep the diff minimal and tied to this single audit report.',
    '- Preserve the audit widget host boundary.',
    '- Preserve the Track C ratchet scenarios in EVAL.md.',
    '',
    'Expected JSON shape:',
    JSON.stringify({
      action: 'repair',
      screen: 'newBrief.result',
      summary: 'Short repair summary',
      hypothesis: 'One sentence hypothesis',
      kg: 1,
      testCommand: 'npm run typecheck',
      diff: 'diff --git a/app/App.tsx b/app/App.tsx\n...',
      rollbackReason: '',
    }, null, 2),
    '',
    'Use action "rollback" with an empty diff when the request should not be applied.',
    '',
    `Saved audit report path: ${path.relative(submissionRoot, reportPath).replace(/\\/g, '/')}`,
    `Detected screen: ${extractScreenName(payload.content)}`,
    `Payload source: ${payload.source}`,
    `Payload fileUri: ${payload.fileUri}`,
    '',
    'Audit report markdown:',
    '```md',
    payload.content,
    '```',
    '',
    'App file tree:',
    '```txt',
    appTree,
    '```',
    '',
    'EVAL ratchet:',
    '```md',
    evalDoc,
    '```',
    '',
    'app/src/types/draft.ts:',
    '```ts',
    types,
    '```',
    '',
    'Component source context:',
    '```tsx',
    componentContext,
    '```',
    '',
    'app/App.tsx:',
    '```tsx',
    appTsx,
    '```',
  ].join('\n');
}

async function readComponentContext() {
  const componentDir = path.join(appRoot, 'src', 'components');

  if (!existsSync(componentDir)) {
    return '';
  }

  const files = (await fs.readdir(componentDir))
    .filter((file) => file.endsWith('.tsx'))
    .sort();
  const chunks = [];

  for (const file of files) {
    const relativePath = `app/src/components/${file}`;
    chunks.push(`// ${relativePath}`);
    chunks.push(await readText(relativePath, 9000));
  }

  return chunks.join('\n\n');
}

async function callOllama(prompt, runDir) {
  const model = await resolveOllamaModel();
  const response = await fetch(`${ollamaUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      stream: false,
      messages: [
        {
          role: 'system',
          content: 'You return strict JSON for a safe code repair loop. No prose outside JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      options: {
        temperature: Number(process.env.OLLAMA_TEMPERATURE ?? 0.1),
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama chat failed: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  const content = payload.message?.content ?? '';
  await fs.writeFile(path.join(runDir, 'ollama-response.txt'), content, 'utf8');
  return parseJsonFromModel(content);
}

function parseJsonFromModel(content) {
  try {
    return JSON.parse(content);
  } catch {
    const start = content.indexOf('{');
    const end = content.lastIndexOf('}');

    if (start === -1 || end === -1 || end <= start) {
      throw new Error('Model did not return parseable JSON.');
    }

    return JSON.parse(content.slice(start, end + 1));
  }
}

function normalizeDiffPath(value) {
  if (!value || value === '/dev/null') {
    return null;
  }

  const withoutPrefix = value.replace(/^a\//, '').replace(/^b\//, '');
  const normalized = path.posix.normalize(withoutPrefix.replace(/\\/g, '/'));

  if (
    normalized.startsWith('../') ||
    normalized.includes('/../') ||
    path.isAbsolute(normalized) ||
    normalized.startsWith('submissions/')
  ) {
    throw new Error(`Unsafe diff path: ${value}`);
  }

  return normalized;
}

function extractDiffPaths(diff) {
  const paths = new Set();
  const lines = diff.split(/\r?\n/);

  for (const line of lines) {
    const gitMatch = line.match(/^diff --git a\/(.+?) b\/(.+)$/);
    const fileMatch = line.match(/^(?:---|\+\+\+) (.+)$/);

    if (gitMatch) {
      paths.add(normalizeDiffPath(gitMatch[1]));
      paths.add(normalizeDiffPath(gitMatch[2]));
    } else if (fileMatch) {
      paths.add(normalizeDiffPath(fileMatch[1]));
    }
  }

  return [...paths].filter(Boolean);
}

function validateDiff(diff) {
  if (!diff || typeof diff !== 'string' || !diff.includes('diff --git')) {
    throw new Error('Repair action did not include a unified git diff.');
  }

  const paths = extractDiffPaths(diff);

  if (paths.length === 0) {
    throw new Error('Diff did not include any file paths.');
  }

  const denied = paths.filter(
    (filePath) => !allowedPatchPrefixes.some((prefix) => filePath === prefix || filePath.startsWith(prefix))
  );

  if (denied.length > 0) {
    throw new Error(`Diff touches denied paths:\n${denied.join('\n')}`);
  }

  return paths;
}

function escapeTableCell(value) {
  return String(value ?? '')
    .replace(/\r?\n/g, ' ')
    .replace(/\|/g, '/')
    .trim();
}

async function nextCycleNumber() {
  const ledger = await fs.readFile(forgeLedgerPath, 'utf8');
  const rows = ledger
    .split(/\r?\n/)
    .filter((line) => /^\|\s*\d+\s*\|/.test(line));
  return rows.length + 1;
}

async function appendForgeRow(entry) {
  const cycle = await nextCycleNumber();
  const ledger = await fs.readFile(forgeLedgerPath, 'utf8');
  const automatedHeader = [
    '',
    '## Automated Server Cycles',
    '',
    '| Cycle | Report | Hypothesis | Result | Changed files | Test result | Commit hash | kg | Human touch points |',
    '|---|---|---|---|---|---|---|---:|---:|',
    '',
  ].join('\n');
  const row = [
    cycle,
    `\`${entry.reportName}\``,
    entry.hypothesis,
    entry.result,
    entry.changedFiles,
    entry.testResult,
    entry.commitHash,
    entry.kg,
    entry.humanTouchPoints,
  ].map(escapeTableCell).join(' | ');

  if (!ledger.includes('## Automated Server Cycles')) {
    await fs.appendFile(forgeLedgerPath, automatedHeader, 'utf8');
  }

  await fs.appendFile(
    forgeLedgerPath,
    `| ${row} |\n`,
    'utf8'
  );
}

async function changedFiles() {
  const status = await run(gitCommand, ['status', '--porcelain', '--', '.'], { cwd: submissionRoot });
  return status.stdout
    .split(/\r?\n/)
    .map((line) => line.slice(3).trim())
    .filter(Boolean);
}

function safeCommitMessage(screen, summary, kg) {
  const cleanScreen = String(screen || 'Audit').replace(/[^\w.-]/g, '').slice(0, 32) || 'Audit';
  const cleanSummary = String(summary || 'Apply audit repair')
    .replace(/\s+/g, ' ')
    .replace(/[^\w .:-]/g, '')
    .slice(0, 52)
    .trim();
  return `[FORGE: ${cleanScreen}] ${cleanSummary || 'Apply audit repair'} -- ${kg}kg`;
}

async function commitFiles(files, message) {
  await runChecked(gitCommand, ['add', '--', ...files], { cwd: submissionRoot });
  await runChecked(gitCommand, ['commit', '-m', message], { cwd: submissionRoot });
  const hash = await runChecked(gitCommand, ['rev-parse', '--short', 'HEAD'], { cwd: submissionRoot });
  return hash.stdout.trim();
}

async function processAudit(payload, runId) {
  await fs.mkdir(runsDir, { recursive: true });
  const runDir = path.join(runsDir, runId);
  await fs.mkdir(runDir, { recursive: true });
  await ensureCleanWorktree();

  const reportPath = await saveAuditReport(payload, runId);
  const prompt = await buildPrompt(payload, reportPath);
  await fs.writeFile(path.join(runDir, 'prompt.txt'), prompt, 'utf8');

  const decision = await callOllama(prompt, runDir);
  await fs.writeFile(path.join(runDir, 'decision.json'), `${JSON.stringify(decision, null, 2)}\n`, 'utf8');

  const screen = decision.screen || extractScreenName(payload.content);
  const kg = Number.isFinite(Number(decision.kg)) ? Math.max(0, Math.min(5, Number(decision.kg))) : 1;
  const reportName = path.relative(submissionRoot, reportPath).replace(/\\/g, '/');

  if (decision.action !== 'repair') {
    await appendForgeRow({
      reportName,
      hypothesis: decision.hypothesis ?? 'Model rejected the requested change.',
      result: 'rollback',
      changedFiles: 'none retained',
      testResult: decision.rollbackReason ?? 'Rejected before patch.',
      commitHash: 'rollback before commit',
      kg: 0,
      humanTouchPoints: 0,
    });

    if (autoCommit) {
      await commitFiles(['FORGE.md'], '[FORGE: Ledger] Log automated rollback -- 0kg');
    }

    return { status: 'rollback', reason: decision.rollbackReason ?? 'Rejected by model.' };
  }

  const patchPath = path.join(runDir, 'patch.diff');
  await fs.writeFile(patchPath, decision.diff, 'utf8');
  const touchedFiles = validateDiff(decision.diff);

  await runChecked(gitCommand, ['apply', '--check', '--whitespace=nowarn', patchPath], { cwd: submissionRoot });
  await runChecked(gitCommand, ['apply', '--whitespace=nowarn', patchPath], { cwd: submissionRoot });

  const test = await run(npmCommand, ['run', 'typecheck'], { cwd: appRoot });
  await fs.writeFile(path.join(runDir, 'typecheck.stdout.txt'), test.stdout, 'utf8');
  await fs.writeFile(path.join(runDir, 'typecheck.stderr.txt'), test.stderr, 'utf8');

  if (test.code !== 0) {
    await run(gitCommand, ['apply', '-R', '--whitespace=nowarn', patchPath], { cwd: submissionRoot });
    await appendForgeRow({
      reportName,
      hypothesis: decision.hypothesis ?? 'Patch should satisfy audit report.',
      result: 'rollback',
      changedFiles: touchedFiles.join(', '),
      testResult: 'npm run typecheck failed; reverse patch applied',
      commitHash: 'rollback before commit',
      kg: 0,
      humanTouchPoints: 0,
    });

    if (autoCommit) {
      await commitFiles(['FORGE.md'], '[FORGE: Ledger] Log automated rollback -- 0kg');
    }

    return { status: 'rollback', reason: 'typecheck failed' };
  }

  let repairHash = 'not committed';
  const filesAfterPatch = await changedFiles();

  if (autoCommit) {
    repairHash = await commitFiles(
      filesAfterPatch,
      safeCommitMessage(screen, decision.summary, kg)
    );
  }

  await appendForgeRow({
    reportName,
    hypothesis: decision.hypothesis ?? 'Patch should satisfy audit report.',
    result: 'success',
    changedFiles: touchedFiles.join(', '),
    testResult: 'npm run typecheck passed',
    commitHash: repairHash,
    kg,
    humanTouchPoints: 0,
  });

  if (autoCommit) {
    await commitFiles(['FORGE.md'], '[FORGE: Ledger] Log automated cycle -- 0kg');
  }

  return {
    status: 'success',
    reportName,
    changedFiles: touchedFiles,
    commitHash: repairHash,
  };
}

async function handleAudit(request, response) {
  const runId = stamp();

  try {
    const body = await readRequestBody(request);
    const payload = parseAuditPayload(request, body);

    if (!payload.content.trim()) {
      sendJson(response, 400, { error: 'Empty audit report content.' });
      return;
    }

    const result = await processAudit(payload, runId);
    sendJson(response, 200, { runId, ...result });
  } catch (error) {
    sendJson(response, 500, {
      runId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

if (process.argv.includes('--help')) {
  printHelp();
  process.exit(0);
}

if (process.argv.includes('--self-check')) {
  selfCheck().catch((error) => {
    console.error(error);
    process.exit(1);
  });
} else {
  const server = http.createServer((request, response) => {
    if (request.method === 'GET' && request.url === '/health') {
      sendJson(response, 200, {
        ok: true,
        submissionRoot,
        ollamaUrl,
        autoCommit,
      });
      return;
    }

    if (request.method === 'POST' && request.url === '/audit') {
      void handleAudit(request, response);
      return;
    }

    sendJson(response, 404, { error: 'Not found. Use POST /audit.' });
  });

  server.listen(port, () => {
    console.log(`Nokta forge server listening on http://localhost:${port}/audit`);
    console.log(`Ollama URL: ${ollamaUrl}`);
    console.log(`Auto commit: ${autoCommit ? 'on' : 'off'}`);
  });
}
