import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPORT_PATH = path.resolve(__dirname, '../audit-report.md');
const FORGE_PATH = path.resolve(__dirname, '../FORGE.md');

function runRepair() {
    console.log('🔍 FORGE: Starting Autonomous Repair Cycle...');
    
    if (!fs.existsSync(REPORT_PATH)) {
        console.log('⚠️ No audit report found.');
        return;
    }

    try {
        const content = fs.readFileSync(REPORT_PATH, 'utf-8');
        
        // Simple parser for markdown issues
        // Split by separator and filter for valid issue blocks
        const issues = content.split('\n---').filter(i => i.includes('ISSUE #'));
        
        console.log(`📋 Found ${issues.length} issues in report.`);

        const pendingIssues = [];

        issues.forEach((issueText, index) => {
            const titleMatch = issueText.match(/### ISSUE #\d+: (.*)/);
            const screenMatch = issueText.match(/\|\s*\*\*Screen\*\*\s*\|\s*([^|\n\r]+?)\s*\|/i);
            const noteMatch = issueText.match(/#### 📝 Note\s*[\r\n]+>\s*(.*)/);

            if (titleMatch && screenMatch) {
                pendingIssues.push({
                    id: index + 1,
                    title: titleMatch[1].trim(),
                    screen: screenMatch[1].trim(),
                    note: noteMatch ? noteMatch[1].trim() : 'No note provided'
                });
            }
        });

        if (pendingIssues.length > 0) {
            console.log('⚡ FORGE_REPAIR_ACTION_REQUIRED');
            console.log(JSON.stringify(pendingIssues, null, 2));
        } else {
            console.log('✅ No pending issues found.');
        }
    } catch (error) {
        console.error('❌ Error parsing audit report:', error);
    }
}

runRepair();
