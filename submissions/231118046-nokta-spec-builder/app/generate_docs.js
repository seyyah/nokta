const fs = require('fs');
const path = require('path');

const targetDir = path.resolve(__dirname, '..');

const docs = {
  'README.md': `# Nokta AI Spec-Builder Virtual Assistant\n\nFull-spec virtual assistant optimized for Expo Go, React Native, and Web.`,
  'FORGE.md': `# Nokta Forge Cycle Stages\n\nSUCCESS / FAIL / ROLLBACK / STUCK cycle stage tracker.`,
  'PERSONAS.md': `# Multi-Persona System\n\nJunior Ravza (Cyan) and Senior Ravza (Purple) architectures.`,
  'BRIDGE.md': `# Expert Escalation Bridge\n\nLightweight Jitsi video escalation room integration and call history.`
};

console.log('--- Nokta Automated Documentation Generator ---');
Object.entries(docs).forEach(([filename, content]) => {
  const filePath = path.join(targetDir, filename);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Successfully generated: ${filename} -> ${filePath}`);
});
console.log('Documentation rebuild completed successfully.');
