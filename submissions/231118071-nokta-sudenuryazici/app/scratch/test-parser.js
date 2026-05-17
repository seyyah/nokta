import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const reportPath = path.join(__dirname, '..', '..', '..', 'audit-report.md');
const report = fs.readFileSync(reportPath, 'utf8');

const issues = report.split('\n---').filter(i => i.includes('ISSUE #'));

console.log(`📋 Found ${issues.length} issues.`);

issues.forEach((issue, index) => {
    const titleMatch = issue.match(/### ISSUE #\d+: (.*)/);
    const screenMatch = issue.match(/\|\s*\*\*Screen\*\*\s*\|\s*([^|\n\r]+?)\s*\|/i);
    const noteMatch = issue.match(/#### 📝 Note\s*[\r\n]+>\s*(.*)/);

    const title = titleMatch ? titleMatch[1].trim() : 'Unknown';
    const screen = screenMatch ? screenMatch[1].trim() : 'Unknown';
    const note = noteMatch ? noteMatch[1].trim() : 'No note';

    console.log(`\n🚀 ISSUE #${index + 1}: ${title}`);
    console.log(`   📍 Screen: ${screen}`);
    console.log(`   📝 Note: ${note}`);
});
