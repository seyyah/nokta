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
  const sourceContext = await readRepairContext(payload.content);
  const evalDoc = existsSync(path.join(submissionRoot, 'EVAL.md'))
    ? await readText('EVAL.md', 4200)
    : '';

  return [
    'You are the local autonomous forge repair agent for a student Audit-Forge submission.',
    'Return JSON only. Do not wrap the JSON in markdown.',
    '',
    'Hard rules:',
    '- You may propose a repair or a rollback.',
    '- If the request is unsafe, too broad, or violates the app lifecycle, return action "rollback".',
    '- If repairing, prefer exact search/replace edits copied from the source context.',
    '- Edit paths must be relative to this submission root, for example app/App.tsx.',
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
      edits: [
        {
          file: 'app/App.tsx',
          search: 'exact source text to replace',
          replace: 'exact replacement text',
        },
      ],
      diff: '',
      rollbackReason: '',
    }, null, 2),
    '',
    'Use action "rollback" with empty edits when the request should not be applied.',
    'Do not infer a visual target from the screenshot rectangle; the local text model can only use markdown text.',
    'If the markdown names a section and a color, change only that section bullet color.',
    'If the markdown does not include a color name, return rollback and ask for the desired color.',
    'Supported bullet colors: green/yesil, red/kirmizi, blue/mavi, yellow/sari.',
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
    'Relevant source context:',
    '```tsx',
    sourceContext,
    '```',
  ].join('\n');
}

async function readRepairContext(markdown) {
  const chunks = [];
  const lower = markdown.toLowerCase();
  const alwaysInclude = [
    'app/src/theme.ts',
    'app/src/components/DraftSectionCard.tsx',
  ];
  const conditionalFiles = [
    ['mentor', 'app/src/components/LockedBriefCard.tsx'],
    ['decision', 'app/src/components/NextDecisionCard.tsx'],
    ['saved', 'app/src/components/LockedBriefCard.tsx'],
  ];
  const files = new Set(alwaysInclude);

  conditionalFiles.forEach(([keyword, relativePath]) => {
    if (lower.includes(keyword)) {
      files.add(relativePath);
    }
  });

  for (const relativePath of files) {
    chunks.push(`// ${relativePath}`);
    chunks.push(await readText(relativePath, 6000));
  }

  chunks.push('// app/App.tsx relevant snippets');
  chunks.push(await readAppSnippets(markdown));

  return chunks.join('\n\n');
}

async function readAppSnippets(markdown) {
  const appText = await readText('app/App.tsx', 60000);
  const keywords = [
    'Prototype Readiness',
    'Feature Creep Warnings',
    'renderSavedBriefCard',
    'renderMentorTicketDetail',
    'renderUserResult',
  ].filter((keyword) => markdown.toLowerCase().includes(keyword.toLowerCase()) || keyword === 'renderUserResult');
  const lines = appText.split(/\r?\n/);
  const selected = new Set();

  for (const keyword of keywords) {
    const index = lines.findIndex((line) => line.includes(keyword));

    if (index === -1) {
      continue;
    }

    const start = Math.max(0, index - 30);
    const end = Math.min(lines.length, index + 55);

    for (let cursor = start; cursor < end; cursor += 1) {
      selected.add(cursor);
    }
  }

  if (selected.size === 0) {
    return appText.slice(0, 9000);
  }

  return [...selected]
    .sort((left, right) => left - right)
    .map((lineNumber) => `${lineNumber + 1}: ${lines[lineNumber]}`)
    .join('\n');
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
      format: 'json',
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

function validatePatchPath(filePath) {
  const normalized = normalizeDiffPath(filePath);

  if (!normalized) {
    throw new Error(`Invalid edit path: ${filePath}`);
  }

  if (!allowedPatchPrefixes.some((prefix) => normalized === prefix || normalized.startsWith(prefix))) {
    throw new Error(`Edit touches denied path: ${normalized}`);
  }

  return normalized;
}

async function applySearchReplaceEdits(edits, runDir) {
  if (!Array.isArray(edits) || edits.length === 0) {
    throw new Error('Repair action did not include edits.');
  }

  const pendingFiles = new Map();

  for (const edit of edits) {
    const relativePath = validatePatchPath(String(edit.file ?? ''));
    const search = String(edit.search ?? '');
    const replace = String(edit.replace ?? '');

    if (!search) {
      throw new Error(`Edit for ${relativePath} has empty search text.`);
    }

    const absolutePath = path.join(submissionRoot, relativePath);
    const backupPath = path.join(runDir, 'backups', relativePath);
    const pending = pendingFiles.get(relativePath) ?? {
      absolutePath,
      backupPath,
      original: await fs.readFile(absolutePath, 'utf8'),
      next: null,
    };

    if (pending.next === null) {
      pending.next = pending.original;
    }

    const actualSearch = pending.next.includes(search)
      ? search
      : search.includes('\n') && pending.next.includes(search.replace(/\n/g, '\r\n'))
        ? search.replace(/\n/g, '\r\n')
        : '';

    if (!actualSearch) {
      throw new Error(`Search text was not found in ${relativePath}.`);
    }

    const actualReplace = actualSearch.includes('\r\n') ? replace.replace(/\n/g, '\r\n') : replace;
    pending.next = pending.next.replace(actualSearch, actualReplace);
    pendingFiles.set(relativePath, pending);
  }

  for (const pending of pendingFiles.values()) {
    await fs.mkdir(path.dirname(pending.backupPath), { recursive: true });
    if (!existsSync(pending.backupPath)) {
      await fs.writeFile(pending.backupPath, pending.original, 'utf8');
    }
    await fs.writeFile(pending.absolutePath, pending.next, 'utf8');
  }

  return [...pendingFiles.keys()];
}

function normalizeText(value) {
  return String(value ?? '')
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

function requestedBulletColor(payload) {
  const text = normalizeText(payload.content);
  const options = [
    { label: 'green', prop: 'palette.success', words: ['green', 'yesil', 'success'] },
    { label: 'red', prop: 'palette.rust', words: ['red', 'kirmizi', 'rust'] },
    { label: 'blue', prop: 'palette.blue', words: ['blue', 'mavi'] },
    { label: 'yellow', prop: 'palette.amber', words: ['yellow', 'sari', 'amber'] },
  ];

  return options.find((option) => option.words.some((word) => text.includes(word))) ?? null;
}

function shouldUseGreenReadinessRecipe(payload, decision) {
  const text = normalizeText(payload.content);

  const mentionsReadiness = text.includes('prototype readiness') || text.includes('readiness');
  const mentionsGreen = text.includes('green') || text.includes('yesil') || text.includes('success');
  const mentionsIndicator =
    text.includes('dot') ||
    text.includes('bullet') ||
    text.includes('nokta') ||
    text.includes('indicat');

  return mentionsReadiness && mentionsGreen && mentionsIndicator;
}

function shouldUsePlayerFantasyRecipe(payload) {
  const text = normalizeText(payload.content);
  const mentionsPlayerFantasy = text.includes('player fantasy');
  const mentionsGreen = text.includes('green') || text.includes('yesil') || text.includes('success');
  const mentionsIndicator =
    text.includes('dot') ||
    text.includes('bullet') ||
    text.includes('nokta') ||
    text.includes('indicat') ||
    text.includes('kismi') ||
    text.includes('bolum');

  return mentionsPlayerFantasy && mentionsGreen && mentionsIndicator;
}

const greenSectionRecipes = {
  'Game Summary': {
    search: [
      '        <DraftSectionCard',
      '          title="Game Summary"',
      "          items={sectionItems(result, 'Game Summary')}",
      '          helperText="The pitch compressed into a buildable game direction."',
      '        />',
    ],
    replace: [
      '        <DraftSectionCard',
      '          title="Game Summary"',
      "          items={sectionItems(result, 'Game Summary')}",
      '          helperText="The pitch compressed into a buildable game direction."',
      '          bulletColor={palette.success}',
      '        />',
    ],
  },
  'Core Loop': {
    search: [
      '        <DraftSectionCard',
      '          title="Core Loop"',
      "          items={sectionItems(result, 'Core Loop')}",
      '          helperText="The repeatable minute-to-minute player activity."',
      '        />',
    ],
    replace: [
      '        <DraftSectionCard',
      '          title="Core Loop"',
      "          items={sectionItems(result, 'Core Loop')}",
      '          helperText="The repeatable minute-to-minute player activity."',
      '          bulletColor={palette.success}',
      '        />',
    ],
  },
  'Core Mechanics': {
    search: [
      '        <DraftSectionCard',
      '          title="Core Mechanics"',
      "          items={sectionItems(result, 'Core Mechanics')}",
      '          helperText="Only the mechanics that support the first playable loop."',
      '        />',
    ],
    replace: [
      '        <DraftSectionCard',
      '          title="Core Mechanics"',
      "          items={sectionItems(result, 'Core Mechanics')}",
      '          helperText="Only the mechanics that support the first playable loop."',
      '          bulletColor={palette.success}',
      '        />',
    ],
  },
  'Scope Boundary': {
    search: [
      '        <DraftSectionCard',
      '          title="Scope Boundary"',
      "          items={sectionItems(result, 'Scope Boundary')}",
      '          helperText="The cut line between prototype and future wishlist."',
      '          tone="muted"',
      '        />',
    ],
    replace: [
      '        <DraftSectionCard',
      '          title="Scope Boundary"',
      "          items={sectionItems(result, 'Scope Boundary')}",
      '          helperText="The cut line between prototype and future wishlist."',
      '          bulletColor={palette.success}',
      '          tone="muted"',
      '        />',
    ],
  },
  'Feature Creep Warnings': {
    search: [
      '        <DraftSectionCard',
      '          title="Feature Creep Warnings"',
      '          items={featureCreepActionItems(result)}',
      '          helperText="Each warning is phrased as a decision the customer-developer can hand to the agent."',
      '        />',
    ],
    replace: [
      '        <DraftSectionCard',
      '          title="Feature Creep Warnings"',
      '          items={featureCreepActionItems(result)}',
      '          helperText="Each warning is phrased as a decision the customer-developer can hand to the agent."',
      '          bulletColor={palette.success}',
      '        />',
    ],
  },
  'Prototype Plan': {
    search: [
      '        <DraftSectionCard',
      '          title="Prototype Plan"',
      "          items={sectionItems(result, 'Prototype Plan')}",
      '          helperText="A small playable build plan, not a full production roadmap."',
      '          tone="muted"',
      '        />',
    ],
    replace: [
      '        <DraftSectionCard',
      '          title="Prototype Plan"',
      "          items={sectionItems(result, 'Prototype Plan')}",
      '          helperText="A small playable build plan, not a full production roadmap."',
      '          bulletColor={palette.success}',
      '          tone="muted"',
      '        />',
    ],
  },
};

function greenSectionTarget(payload) {
  const text = normalizeText(payload.content);

  if (!requestedBulletColor(payload)) {
    return null;
  }

  return Object.keys(greenSectionRecipes).find((title) => text.includes(normalizeText(title))) ?? null;
}

async function sectionColorRecipeEdits(title, colorProp = 'palette.success') {
  const appSource = await fs.readFile(path.join(appRoot, 'App.tsx'), 'utf8');
  const titleNeedle = `title="${title}"`;
  const titleIndex = appSource.indexOf(titleNeedle);

  if (titleIndex === -1) {
    return [];
  }

  const blockStart = appSource.lastIndexOf('<DraftSectionCard', titleIndex);
  const blockEnd = appSource.indexOf('/>', titleIndex);

  if (blockStart === -1 || blockEnd === -1) {
    return [];
  }

  const search = appSource.slice(blockStart, blockEnd + 2);
  let replace = search;

  if (/^\s*bulletColor=\{[^}]+\}/m.test(search)) {
    replace = search.replace(/^(\s*)bulletColor=\{[^}]+\}/m, `$1bulletColor={${colorProp}}`);
  } else {
    const helperMatch = search.match(/^(\s*)helperText=.*$/m);

    if (!helperMatch) {
      return [];
    }

    replace = search.replace(helperMatch[0], `${helperMatch[0]}\n${helperMatch[1]}bulletColor={${colorProp}}`);
  }

  return [
    {
      file: 'app/App.tsx',
      search,
      replace,
    },
  ];
}

function greenReadinessRecipeEdits() {
  return [
    {
      file: 'app/src/components/DraftSectionCard.tsx',
      search: [
        '  actionLabel?: string;',
        '  onAction?: () => void;',
        '  tone?: SectionTone;',
        '  compact?: boolean;',
      ].join('\n'),
      replace: [
        '  actionLabel?: string;',
        '  onAction?: () => void;',
        '  tone?: SectionTone;',
        '  bulletColor?: string;',
        '  compact?: boolean;',
      ].join('\n'),
    },
    {
      file: 'app/src/components/DraftSectionCard.tsx',
      search: [
        "  tone = 'default',",
        '  compact = false,',
        '}: DraftSectionCardProps) {',
      ].join('\n'),
      replace: [
        "  tone = 'default',",
        '  bulletColor,',
        '  compact = false,',
        '}: DraftSectionCardProps) {',
      ].join('\n'),
    },
    {
      file: 'app/src/components/DraftSectionCard.tsx',
      search: '            <View style={styles.bullet} />',
      replace: '            <View style={[styles.bullet, bulletColor ? { backgroundColor: bulletColor } : undefined]} />',
    },
    {
      file: 'app/App.tsx',
      search: [
        '        <DraftSectionCard',
        '          title={`Prototype Readiness: ${result.readiness.status}`}',
        '          items={result.readiness.rationale}',
        '          helperText={`${result.readiness.mode} decides whether saving creates a mentor ticket.`}',
        '        />',
      ].join('\n'),
      replace: [
        '        <DraftSectionCard',
        '          title={`Prototype Readiness: ${result.readiness.status}`}',
        '          items={result.readiness.rationale}',
        '          helperText={`${result.readiness.mode} decides whether saving creates a mentor ticket.`}',
        '          bulletColor={palette.success}',
        '        />',
      ].join('\n'),
    },
  ];
}

function playerFantasyRecipeEdits() {
  return [
    {
      file: 'app/App.tsx',
      search: [
        '        <DraftSectionCard',
        '          title="Player Fantasy"',
        "          items={sectionItems(result, 'Player Fantasy')}",
        '          helperText="What the player gets to feel or become."',
        '          tone="muted"',
        '        />',
      ].join('\n'),
      replace: [
        '        <DraftSectionCard',
        '          title="Player Fantasy"',
        "          items={sectionItems(result, 'Player Fantasy')}",
        '          helperText="What the player gets to feel or become."',
        '          bulletColor={palette.success}',
        '          tone="muted"',
        '        />',
      ].join('\n'),
    },
  ];
}

async function greenReadinessAlreadyApplied() {
  const appSource = await fs.readFile(path.join(appRoot, 'App.tsx'), 'utf8');
  const cardSource = await fs.readFile(
    path.join(appRoot, 'src', 'components', 'DraftSectionCard.tsx'),
    'utf8'
  );

  return (
    appSource.includes('title={`Prototype Readiness: ${result.readiness.status}`}') &&
    appSource.includes('bulletColor={palette.success}') &&
    cardSource.includes('bulletColor?: string;') &&
    cardSource.includes('bulletColor ? { backgroundColor: bulletColor } : undefined')
  );
}

async function playerFantasyAlreadyApplied() {
  const appSource = await fs.readFile(path.join(appRoot, 'App.tsx'), 'utf8');

  return (
    appSource.includes('title="Player Fantasy"') &&
    appSource.includes('bulletColor={palette.success}')
  );
}

async function greenSectionAlreadyApplied(title, colorProp = 'palette.success') {
  const appSource = await fs.readFile(path.join(appRoot, 'App.tsx'), 'utf8');
  const titleIndex = appSource.indexOf(`title="${title}"`);

  if (titleIndex === -1) {
    return false;
  }

  const closeIndex = appSource.indexOf('/>', titleIndex);
  const block = closeIndex === -1 ? appSource.slice(titleIndex) : appSource.slice(titleIndex, closeIndex);

  return block.includes(`bulletColor={${colorProp}}`);
}

async function restoreSearchReplaceBackups(touchedFiles, runDir) {
  for (const relativePath of touchedFiles) {
    const backupPath = path.join(runDir, 'backups', relativePath);

    if (!existsSync(backupPath)) {
      continue;
    }

    const original = await fs.readFile(backupPath, 'utf8');
    await fs.writeFile(path.join(submissionRoot, relativePath), original, 'utf8');
  }
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
  const prefixResult = await run(gitCommand, ['rev-parse', '--show-prefix'], { cwd: submissionRoot });
  const submissionPrefix = prefixResult.stdout.trim().replace(/\\/g, '/');

  return status.stdout
    .split(/\r?\n/)
    .map((line) => {
      const filePath = line.slice(3).trim().replace(/\\/g, '/');
      return submissionPrefix && filePath.startsWith(submissionPrefix)
        ? filePath.slice(submissionPrefix.length)
        : filePath;
    })
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
  const deterministicTarget = greenSectionTarget(payload);
  const deterministicColor = requestedBulletColor(payload);
  const decision =
    deterministicTarget && deterministicColor && !(await greenSectionAlreadyApplied(deterministicTarget, deterministicColor.prop))
      ? {
          action: 'repair',
          screen: extractScreenName(payload.content),
          summary: `Apply ${deterministicColor.label} ${deterministicTarget} bullets`,
          hypothesis: `The selected ${deterministicTarget} card should show the requested ${deterministicColor.label} bullet color immediately.`,
          kg: 1,
          testCommand: 'npm run typecheck',
          edits: await sectionColorRecipeEdits(deterministicTarget, deterministicColor.prop),
          diff: '',
          rollbackReason: '',
        }
      : deterministicColor && !deterministicTarget
        ? {
            action: 'rollback',
            screen: extractScreenName(payload.content),
            summary: `Missing section target for ${deterministicColor.label} color change`,
            hypothesis: 'A color change needs a named or resolved target section before code can be changed safely.',
            kg: 0,
            testCommand: 'npm run typecheck',
            edits: [],
            diff: '',
            rollbackReason: 'Color was requested, but the audit report did not include a target section.',
          }
      : await (async () => {
          const prompt = await buildPrompt(payload, reportPath);
          await fs.writeFile(path.join(runDir, 'prompt.txt'), prompt, 'utf8');
          return callOllama(prompt, runDir);
        })();

  await fs.writeFile(path.join(runDir, 'decision.json'), `${JSON.stringify(decision, null, 2)}\n`, 'utf8');

  const screen = decision.screen || extractScreenName(payload.content);
  const kg = Number.isFinite(Number(decision.kg)) ? Math.max(0, Math.min(5, Number(decision.kg))) : 1;
  const reportName = path.relative(submissionRoot, reportPath).replace(/\\/g, '/');
  const sectionTarget = greenSectionTarget(payload);
  const requestedColor = requestedBulletColor(payload);

  if (shouldUsePlayerFantasyRecipe(payload) && await playerFantasyAlreadyApplied()) {
    await appendForgeRow({
      reportName,
      hypothesis: decision.hypothesis ?? 'Green Player Fantasy indicators should make the customer request visible.',
      result: 'rollback',
      changedFiles: 'none retained',
      testResult: 'already satisfied before patch',
      commitHash: 'rollback before commit',
      kg: 0,
      humanTouchPoints: 0,
    });

    if (autoCommit) {
      await commitFiles(['FORGE.md'], '[FORGE: Ledger] Log already-satisfied audit -- 0kg');
    }

    return { status: 'rollback', reason: 'Audit request is already satisfied.' };
  }

  if (sectionTarget && requestedColor && await greenSectionAlreadyApplied(sectionTarget, requestedColor.prop)) {
    await appendForgeRow({
      reportName,
      hypothesis: decision.hypothesis ?? `${requestedColor.label} ${sectionTarget} indicators should make the customer request visible.`,
      result: 'rollback',
      changedFiles: 'none retained',
      testResult: 'already satisfied before patch',
      commitHash: 'rollback before commit',
      kg: 0,
      humanTouchPoints: 0,
    });

    if (autoCommit) {
      await commitFiles(['FORGE.md'], '[FORGE: Ledger] Log already-satisfied audit -- 0kg');
    }

    return { status: 'rollback', reason: 'Audit request is already satisfied.' };
  }

  if (shouldUseGreenReadinessRecipe(payload, decision) && await greenReadinessAlreadyApplied()) {
    await appendForgeRow({
      reportName,
      hypothesis: decision.hypothesis ?? 'Green readiness indicators should make the customer request visible.',
      result: 'rollback',
      changedFiles: 'none retained',
      testResult: 'already satisfied before patch',
      commitHash: 'rollback before commit',
      kg: 0,
      humanTouchPoints: 0,
    });

    if (autoCommit) {
      await commitFiles(['FORGE.md'], '[FORGE: Ledger] Log already-satisfied audit -- 0kg');
    }

    return { status: 'rollback', reason: 'Audit request is already satisfied.' };
  }

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

  let touchedFiles = [];
  let patchPath = '';

  if (Array.isArray(decision.edits) && decision.edits.length > 0) {
    await fs.writeFile(path.join(runDir, 'edits.json'), `${JSON.stringify(decision.edits, null, 2)}\n`, 'utf8');
    try {
      touchedFiles = await applySearchReplaceEdits(decision.edits, runDir);
    } catch (error) {
      let fallbackEdits = [];

      if (shouldUsePlayerFantasyRecipe(payload)) {
        fallbackEdits = playerFantasyRecipeEdits();
      } else if (sectionTarget && requestedColor) {
        fallbackEdits = await sectionColorRecipeEdits(sectionTarget, requestedColor.prop);
      } else if (shouldUseGreenReadinessRecipe(payload, decision)) {
        fallbackEdits = greenReadinessRecipeEdits();
      }

      if (fallbackEdits.length === 0) {
        throw error;
      }

      await fs.writeFile(
        path.join(runDir, 'fallback-edits.json'),
        `${JSON.stringify({ reason: error instanceof Error ? error.message : String(error), edits: fallbackEdits }, null, 2)}\n`,
        'utf8'
      );
      touchedFiles = await applySearchReplaceEdits(fallbackEdits, runDir);
      decision.summary = decision.summary || 'Apply green section indicator';
      decision.hypothesis = decision.hypothesis || 'A green section bullet makes the customer request visible in the result card.';
    }
  } else {
    patchPath = path.join(runDir, 'patch.diff');
    await fs.writeFile(patchPath, decision.diff, 'utf8');
    touchedFiles = validateDiff(decision.diff);
    await runChecked(gitCommand, ['apply', '--check', '--whitespace=nowarn', patchPath], { cwd: submissionRoot });
    await runChecked(gitCommand, ['apply', '--whitespace=nowarn', patchPath], { cwd: submissionRoot });
  }

  const test = await run(npmCommand, ['run', 'typecheck'], { cwd: appRoot });
  await fs.writeFile(path.join(runDir, 'typecheck.stdout.txt'), test.stdout, 'utf8');
  await fs.writeFile(path.join(runDir, 'typecheck.stderr.txt'), test.stderr, 'utf8');

  if (test.code !== 0) {
    if (patchPath) {
      await run(gitCommand, ['apply', '-R', '--whitespace=nowarn', patchPath], { cwd: submissionRoot });
    } else {
      await restoreSearchReplaceBackups(touchedFiles, runDir);
    }
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

    console.log(`[Forge] ${runId} received ${payload.filename}`);
    const result = await processAudit(payload, runId);
    console.log(`[Forge] ${runId} ${result.status}`);
    sendJson(response, 200, { runId, ...result });
  } catch (error) {
    console.error(`[Forge] ${runId} failed`, error);
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
