const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const REPORT_PATH = path.join(__dirname, '..', 'audit-report.md');
const FIXER_PATH = path.join(__dirname, 'forge-auto-fixer.js');

console.log('🛡️ [FORGE GUARDIAN] Active. Watching: ' + REPORT_PATH);

let isRunning = false;

// Aggressive Polling: Check every 1000ms
setInterval(() => {
    if (isRunning) return;

    // Check if there is at least one issue that is NOT fixed
    try {
        const content = fs.readFileSync(REPORT_PATH, 'utf8');
        // Look for "### ISSUE #" that is NOT preceded by "[FIXED] "
        const hasUnfixed = /### ISSUE #\d+/.test(content);
        // BUT, we need to make sure it doesn't match "### [FIXED] ISSUE #"
        // A better way: check if all "### ISSUE" headers also have "[FIXED]"
        const totalIssues = (content.match(/### (?:\[FIXED\] )?ISSUE #/g) || []).length;
        const fixedIssues = (content.match(/### \[FIXED\] ISSUE #/g) || []).length;
        
        if (totalIssues > fixedIssues) {
            runRepair();
        }
    } catch (err) {
        // Silent catch for read errors during writes
    }
}, 1000);

function runRepair() {
    isRunning = true;
    console.log(`\n[${new Date().toLocaleTimeString()}] ⚡ Pending issues detected. Triggering Forge...`);
    
    exec(`node "${FIXER_PATH}"`, (error, stdout, stderr) => {
        if (error) {
            console.error('❌ Forge Error:', error);
        } else {
            console.log('✅ Forge Cycle Complete.');
            if (stdout) console.log(stdout);
        }
        isRunning = false;
    });
}

// Also watch for manual saves
fs.watchFile(REPORT_PATH, { interval: 500 }, (curr, prev) => {
    if (curr.mtime > prev.mtime && !isRunning) {
        runRepair();
    }
});
