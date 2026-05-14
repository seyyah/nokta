import type { AuditDeps, AuditNote, AuditSelection } from './mobile-audit';

let notesCache: AuditNote[] = [];

export function createAuditDeps(): AuditDeps {
  return {
    captureScreen: async (screenName) => buildSyntheticScreen(screenName),
    captureRef: async (_, meta) => buildSyntheticScreen(meta.currentScreen, meta.selection),
    writeFile: async (filename, contents) => {
      console.log(`[audit write] ${filename}`, contents.slice(0, 120));
      return `memory://${filename}`;
    },
    writeFileBinary: async (filename) => `memory://${filename}`,
    shareFile: async (uri) => {
      console.log(`[audit share] ${uri}`);
    },
    storage: {
      loadNotes: async () => notesCache,
      saveNotes: async (notes) => {
        notesCache = notes;
      },
    },
  };
}

function buildSyntheticScreen(screenName: string, selection?: AuditSelection) {
  const safeScreen = escapeXml(screenName);
  const box = selection ?? { x: 58, y: 236, width: 274, height: 78 };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="390" height="844" viewBox="0 0 390 844">
  <rect width="390" height="844" fill="#f8fafc"/>
  <rect x="0" y="0" width="390" height="96" fill="#0f172a"/>
  <text x="24" y="58" font-family="Arial" font-size="22" font-weight="700" fill="#ffffff">Nokta Forge</text>
  <text x="24" y="122" font-family="Arial" font-size="13" fill="#64748b">currentScreen</text>
  <text x="24" y="150" font-family="Arial" font-size="28" font-weight="700" fill="#111827">${safeScreen}</text>
  <rect x="24" y="190" width="342" height="132" rx="8" fill="#ffffff" stroke="#d1d5db"/>
  <text x="44" y="230" font-family="Arial" font-size="17" font-weight="700" fill="#111827">Customer signal</text>
  <text x="44" y="262" font-family="Arial" font-size="14" fill="#4b5563">Tap QA, burn in a box, write one intent.</text>
  <text x="44" y="292" font-family="Arial" font-size="14" fill="#4b5563">The report becomes agent input.</text>
  <rect x="24" y="350" width="342" height="94" rx="8" fill="#ecfeff" stroke="#06b6d4"/>
  <text x="44" y="388" font-family="Arial" font-size="16" font-weight="700" fill="#155e75">READ -> LOCATE -> REPAIR</text>
  <text x="44" y="418" font-family="Arial" font-size="14" fill="#155e75">Minimal host app boundary stays intact.</text>
  <rect x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" rx="6" fill="rgba(255,221,87,0.18)" stroke="#ffdd57" stroke-width="6"/>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
