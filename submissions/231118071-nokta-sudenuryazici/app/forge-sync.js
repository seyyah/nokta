import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runAutoFix } from './forge-auto-fixer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3001;
const REPORT_PATH = path.resolve(__dirname, '../audit-report.md');

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/save-audit') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const { markdown } = JSON.parse(body);
        fs.writeFileSync(REPORT_PATH, markdown);
        console.log(`[${new Date().toLocaleTimeString()}] ✅ Audit report updated.`);
        
        // --- TRUE AUTONOMY: Trigger Local Auto-Fixer ---
        try {
            runAutoFix();
            console.log(`[${new Date().toLocaleTimeString()}] ⚡ Auto-Fixer triggered successfully.`);
        } catch (autoFixErr) {
            console.error('❌ Auto-Fixer error:', autoFixErr);
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'success' }));
      } catch (err) {
        console.error('❌ Error saving audit:', err);
        res.writeHead(500);
        res.end(err.message);
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Forge Sync Server running at http://127.0.0.1:${PORT}`);
});
