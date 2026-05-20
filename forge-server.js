const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const url = require('url');

const fsSync = require('fs');

function loadApiKey() {
  if (process.env.GROQ_API_KEY) return process.env.GROQ_API_KEY;
  // fallback: read from app/.env (EXPO_PUBLIC_GROQ_API_KEY=...)
  const envPath = path.join(__dirname, 'app', '.env');
  try {
    const content = fsSync.readFileSync(envPath, 'utf-8');
    const match = content.match(/EXPO_PUBLIC_GROQ_API_KEY=([A-Za-z0-9_-]+)/);
    if (match) return match[1];
  } catch (e) { /* ignore */ }
  return '';
}

const API_KEY = loadApiKey();
const MODEL = 'llama-3.3-70b-versatile';
const APP_ROOT = path.join(__dirname, 'app');
const PORT = 3000;

const SCREEN_MAP = {
  'capture': 'CaptureScreen.js',
  'clarify': 'ClarifyScreen.js',
  'processing': 'ProcessingScreen.js',
  'insight': 'InsightScreen.js',
  'enrich': 'EnrichScreen.js',
  'assistant': 'AssistantScreen.js',
  'idearesult': 'IdeaResultScreen.js',
  'vision': 'VisionScreen.js',
};

function parseScreenFromMarkdown(md) {
  const lower = md.toLowerCase();
  for (const [key, file] of Object.entries(SCREEN_MAP)) {
    if (lower.includes(key)) return file;
  }
  // fallback: look for src/screens/... pattern
  const match = md.match(/src\/screens\/([A-Za-z0-9]+)\.js/i);
  if (match) return match[1] + '.js';
  return null;
}

async function callGroq(systemPrompt, userPrompt) {
  console.log(`[Forge] Prompt length: ${systemPrompt.length + userPrompt.length} chars`);
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 8000,
    }),
  });
  const data = await res.json();
  if (data.error) {
    console.error('[Groq API Error]', JSON.stringify(data.error));
    throw new Error(data.error.message || JSON.stringify(data.error));
  }
  if (!data.choices || !data.choices[0]) {
    console.error('[Groq Empty Response]', JSON.stringify(data));
    throw new Error('Groq returned empty choices');
  }
  return data.choices[0].message.content;
}

/**
 * Apply a unified-diff-like block to file content.
 * Format:
 * <<<<<<< SEARCH
 * exact lines to find
 * =======
 * replacement lines
 * >>>>>>> REPLACE
 */
function applyDiff(content, diffText) {
  const pattern = /<<<<<<< SEARCH\n([\s\S]*?)\n=======\n([\s\S]*?)\n>>>>>>> REPLACE/g;
  let result = content;
  let m;
  let applied = 0;

  while ((m = pattern.exec(diffText)) !== null) {
    const search = m[1];
    const replace = m[2];
    if (result.includes(search)) {
      result = result.replace(search, replace);
      applied++;
    } else {
      console.warn(`[Forge Diff] Search block not found (trying loose match):\n${search.slice(0, 100)}...`);
      // Try normalizing whitespace
      const normSearch = search.replace(/\s+/g, ' ').trim();
      const normResult = result.replace(/\s+/g, ' ').trim();
      if (normResult.includes(normSearch)) {
        // Fallback: find approximate location by substring match
        const idx = result.indexOf(search.slice(0, 40));
        if (idx !== -1) {
          // This is dangerous but let's try replacing the line range
          console.warn('[Forge Diff] Using approximate index fallback');
        }
      }
    }
  }

  return { result, applied };
}

async function repairHandler(req, res) {
  const body = await new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => {
      try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
    });
  });

  const { markdown } = body;
  if (!markdown) {
    res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ success: false, error: 'Missing markdown field' }));
    return;
  }

  const screenFile = parseScreenFromMarkdown(markdown);
  if (!screenFile) {
    res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ success: false, error: 'Could not determine target screen from markdown' }));
    return;
  }

  const filePath = path.join(APP_ROOT, 'src', 'screens', screenFile);
  let originalCode;
  try {
    originalCode = await fs.readFile(filePath, 'utf-8');
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ success: false, error: `Cannot read ${screenFile}: ${e.message}` }));
    return;
  }

  // Strategy: for large files, extract a window around a likely search target.
  // We extract the note text from markdown (first line after ### usually)
  const noteMatch = markdown.match(/### .*? — (.*)/);
  const noteText = noteMatch ? noteMatch[1].trim() : '';

  let codeContext = originalCode;
  let useDiffStrategy = false;

  // If file is large, try to find a relevant window around the note text or a likely keyword
  if (originalCode.length > 8000 && noteText) {
    const keyword = noteText.split(/\s+/).find(w => w.length > 3 && originalCode.includes(w));
    if (keyword) {
      const idx = originalCode.indexOf(keyword);
      if (idx !== -1) {
        const start = Math.max(0, idx - 2000);
        const end = Math.min(originalCode.length, idx + 2000);
        codeContext = originalCode.slice(start, end);
        useDiffStrategy = true;
        console.log(`[Forge] Large file; using window around keyword "${keyword}" (${start}-${end})`);
      }
    }
  }

  // Also truncate markdown to avoid giant screenshots blowing up prompt
  const MAX_MD_LEN = 3000;
  let mdContext = markdown;
  if (markdown.length > MAX_MD_LEN) {
    mdContext = markdown.slice(0, MAX_MD_LEN) + '\n\n/* ... [truncated] ... */';
  }

  const systemPrompt = `You are Nokta Forge — an autonomous UI repair agent for a React Native (Expo) app.
Rules:
- You receive a bug report (markdown) and a SNIPPET of the relevant file.
- You must respond with ONLY a diff block in this exact format:

<<<<<<< SEARCH
exact lines from the file (preserve indentation, quotes, commas)
=======
replacement lines
>>>>>>> REPLACE

- If multiple separate changes are needed, output multiple diff blocks one after another.
- If you cannot find the exact text to replace, output NOTHING (empty response).
- Keep JavaScript, do not convert to TypeScript.
- Use inline react-native-svg icons (SVG Path, Polyline, Line, Circle elements) instead of lucide-react-native.
- Ensure the code is valid React Native JS that runs under Expo SDK ~54 with React 19.
- Do NOT output explanations, markdown fences, or raw file content. Only diff blocks.`;

  const userPrompt = `BUG REPORT:\n---\n${mdContext}\n---\n\nRELEVANT FILE SNIPPET (${screenFile}):\n---\n${codeContext}\n---\n\nPlease generate the smallest possible diff block(s) to fix the bug. Only change what is necessary.`;

  let groqResponse;
  try {
    groqResponse = await callGroq(systemPrompt, userPrompt);
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ success: false, error: `Groq API error: ${e.message}`, screen: screenFile, promptChars: userPrompt.length }));
    return;
  }

  let newCode = originalCode;
  let diffApplied = 0;

  // Try diff strategy first if we used a window or if response looks like a diff
  if (useDiffStrategy || groqResponse.includes('<<<<<<< SEARCH')) {
    const diffResult = applyDiff(originalCode, groqResponse);
    newCode = diffResult.result;
    diffApplied = diffResult.applied;
    console.log(`[Forge] Diff applied: ${diffApplied} blocks`);
  }

  // Fallback: if no diff blocks were applied, treat response as full file rewrite
  if (diffApplied === 0 && groqResponse.trim().length > 100) {
    console.warn('[Forge] No diff blocks applied, using full rewrite fallback');
    newCode = groqResponse.replace(/^```(?:js|javascript)?\s*/, '').replace(/\s*```\s*$/, '');
  }

  try {
    await fs.writeFile(filePath, newCode, 'utf-8');
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ success: false, error: `Cannot write file: ${e.message}` }));
    return;
  }

  res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify({ success: true, screen: screenFile, diffApplied, bytesWritten: newCode.length }));
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  if (parsed.pathname === '/repair' && req.method === 'POST') {
    await repairHandler(req, res);
    return;
  }

  if (parsed.pathname === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify({ success: false, error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`🔥 Nokta Forge Server running at http://localhost:${PORT}`);
  console.log(`   POST /repair  — receive markdown, auto-fix screen file via Groq (diff-based)`);
  console.log(`   GET  /health  — health check`);
});
