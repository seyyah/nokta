import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, radius, spacing, typography } from '@/constants/theme';

export type SectionCardProps = {
  heading: string;
  body: string;
};

/**
 * idea.md tek bölümünü bir kart hâlinde render eder. Inline markdown
 * işaretlerini kaldırır (**, *), bullet satırlarını liste öğesine
 * çevirir, paragraflar arasına boşluk bırakır. External markdown
 * kütüphanesine bağlanmadan yeterince okunabilir bir sonuç verir.
 */
export function SectionCard({ heading, body }: SectionCardProps) {
  const blocks = parseBody(body);

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>{heading}</Text>
      <View style={styles.body}>
        {blocks.map((block, i) => {
          if (block.kind === 'bullets') {
            return (
              <View key={i} style={styles.bullets}>
                {block.items.map((item, j) => (
                  <View key={j} style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{clean(item)}</Text>
                  </View>
                ))}
              </View>
            );
          }
          if (block.kind === 'subheading') {
            return (
              <Text key={i} style={styles.subheading}>
                {clean(block.text)}
              </Text>
            );
          }
          return (
            <Text key={i} style={styles.paragraph}>
              {clean(block.text)}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

type Block =
  | { kind: 'paragraph'; text: string }
  | { kind: 'subheading'; text: string }
  | { kind: 'bullets'; items: string[] };

function parseBody(raw: string): Block[] {
  const lines = raw.split(/\r?\n/);
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let bullets: string[] = [];

  const flushParagraph = () => {
    const text = paragraph.join(' ').trim();
    if (text.length > 0) blocks.push({ kind: 'paragraph', text });
    paragraph = [];
  };
  const flushBullets = () => {
    if (bullets.length > 0) blocks.push({ kind: 'bullets', items: bullets });
    bullets = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '') {
      flushParagraph();
      flushBullets();
      continue;
    }
    if (trimmed.startsWith('### ')) {
      flushParagraph();
      flushBullets();
      blocks.push({ kind: 'subheading', text: trimmed.replace(/^###\s+/, '') });
      continue;
    }
    if (trimmed.startsWith('- ')) {
      flushParagraph();
      bullets.push(trimmed.replace(/^-\s+/, ''));
      continue;
    }
    flushBullets();
    paragraph.push(trimmed);
  }
  flushParagraph();
  flushBullets();

  return blocks;
}

function clean(text: string): string {
  // `**bold**` ve `*italic*` işaretlerini sadeleştir. Teknik değil,
  // okunabilirlik odaklı; render ortamı plain text.
  return text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1');
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  heading: {
    fontFamily: typography.headlineMedium,
    fontSize: fontSize.lg,
    color: colors.text,
    fontWeight: '600',
  },
  body: {
    gap: spacing.md,
  },
  paragraph: {
    fontFamily: typography.body,
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 22,
  },
  subheading: {
    fontFamily: typography.bodySemi,
    fontSize: fontSize.md,
    color: colors.primary,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  bullets: {
    gap: spacing.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  bulletDot: {
    fontFamily: typography.body,
    fontSize: fontSize.md,
    color: colors.primary,
    lineHeight: 22,
    width: 12,
  },
  bulletText: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 22,
  },
});
