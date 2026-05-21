/**
 * knowledgeService.ts
 * Admin cevaplarından üretilen .md dosyalarını yönetir.
 * expo-file-system kullanarak cihazın documentDirectory'sine yazar/okur.
 */

import * as FileSystem from 'expo-file-system/legacy';

const KNOWLEDGE_DIR = FileSystem.documentDirectory + 'knowledge/';

export interface KnowledgeEntry {
  question: string;
  answer: string;
  topic: string;
  date: string;
}

/** Knowledge klasörünün var olduğunu garantiler */
async function ensureDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(KNOWLEDGE_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(KNOWLEDGE_DIR, { intermediates: true });
  }
}

/** Belirli bir topic'e ait .md dosyasının yolunu döner */
function topicToPath(topic: string): string {
  const safe = topic.replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ\s-]/g, '').replace(/\s+/g, '_').toLowerCase();
  return KNOWLEDGE_DIR + safe + '.md';
}

/** Yeni bir soru-cevap çiftini topic.md dosyasına ekler (yoksa oluşturur) */
export async function saveKnowledgeEntry(entry: KnowledgeEntry): Promise<void> {
  await ensureDir();
  const path = topicToPath(entry.topic);
  const info = await FileSystem.getInfoAsync(path);

  const block = `
## Soru
${entry.question}

## Yetkili Cevap
${entry.answer}

## Tarih
${entry.date}

---
`;

  if (info.exists) {
    const existing = await FileSystem.readAsStringAsync(path);
    await FileSystem.writeAsStringAsync(path, existing + block);
  } else {
    const header = `# ${entry.topic}\n\n*Bu dosya HITL döngüsünden öğrenilen bilgileri içerir.*\n`;
    await FileSystem.writeAsStringAsync(path, header + block);
  }
}

/** Tüm knowledge dosyalarını tek bir string olarak döner */
export async function loadAllKnowledge(): Promise<string> {
  await ensureDir();
  const files = await FileSystem.readDirectoryAsync(KNOWLEDGE_DIR);
  const mdFiles = files.filter(f => f.endsWith('.md'));
  if (mdFiles.length === 0) return '';

  const contents = await Promise.all(
    mdFiles.map(f => FileSystem.readAsStringAsync(KNOWLEDGE_DIR + f))
  );
  return contents.join('\n\n');
}

/** Basit keyword matching ile en alakalı knowledge bloğunu bulur */
export async function searchKnowledge(query: string): Promise<string | null> {
  const allKnowledge = await loadAllKnowledge();
  if (!allKnowledge) return null;

  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  if (queryWords.length === 0) return null;

  // .md bloklarını "## Soru" başlıklarına göre parçala
  const blocks = allKnowledge.split('## Soru').filter(b => b.trim());

  let bestMatch: { block: string; score: number } | null = null;

  for (const block of blocks) {
    const blockLower = block.toLowerCase();
    const score = queryWords.reduce((acc, word) => {
      return acc + (blockLower.includes(word) ? 1 : 0);
    }, 0);

    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { block, score };
    }
  }

  // En az %50 kelime eşleşmesi varsa güvenilir say
  if (bestMatch && bestMatch.score >= Math.max(1, Math.ceil(queryWords.length * 0.5))) {
    // Cevap bölümünü çıkar
    const answerMatch = bestMatch.block.match(/## Yetkili Cevap\n([\s\S]*?)\n## Tarih/);
    if (answerMatch) return answerMatch[1].trim();
  }

  return null;
}

/** Tüm knowledge girişlerini listeler (admin debug için) */
export async function listKnowledgeFiles(): Promise<string[]> {
  await ensureDir();
  const files = await FileSystem.readDirectoryAsync(KNOWLEDGE_DIR);
  return files.filter(f => f.endsWith('.md'));
}
