// idea.md çıktısı AI tarafından tek seferde üretilir, ama UI onu
// bölümlere ayırarak gösterebilir (final ekran için). Bu modül
// markdown'u parçalamak ve sektion ön-izlemeleri çıkarmak için.

export type IdeaSection = {
  /** Örn: "1. Tez", "4. Ne Yapmaz" */
  heading: string;
  /** Bölüm gövdesi, markdown olarak. */
  body: string;
};

export type IdeaDocument = {
  title: string;
  tagline: string;
  sections: IdeaSection[];
};

/**
 * AI'nın döndürdüğü idea.md metnini başlık, tagline ve bölümlere ayırır.
 * Uzun regex yerine satır-satır durum makinesi; küçük input, basit iş.
 */
export function parseIdeaMd(markdown: string): IdeaDocument {
  const lines = markdown.split(/\r?\n/);
  let title = 'Nokta';
  let tagline = '';
  const sections: IdeaSection[] = [];

  let sawTitle = false;
  let currentHeading: string | null = null;
  let currentBody: string[] = [];

  const commit = () => {
    if (currentHeading !== null) {
      sections.push({
        heading: currentHeading,
        body: currentBody.join('\n').trim(),
      });
    }
    currentHeading = null;
    currentBody = [];
  };

  for (const raw of lines) {
    const line = raw;
    if (!sawTitle && line.startsWith('# ')) {
      title = line.replace(/^#\s+/, '').trim();
      sawTitle = true;
      continue;
    }
    if (sawTitle && !tagline && line.startsWith('*') && line.endsWith('*')) {
      tagline = line.replace(/^\*+|\*+$/g, '').trim();
      continue;
    }
    if (line.startsWith('## ')) {
      commit();
      currentHeading = line.replace(/^##\s+/, '').trim();
      continue;
    }
    if (currentHeading !== null) {
      currentBody.push(line);
    }
  }
  commit();

  return { title, tagline, sections };
}

/**
 * Kopyalama butonu için idea.md'yi düz metin olarak hazırlar.
 * AI zaten temiz markdown döndürüyor, bu şimdilik ince bir geçiş.
 */
export function serializeIdeaMd(markdown: string): string {
  return markdown.trim() + '\n';
}
