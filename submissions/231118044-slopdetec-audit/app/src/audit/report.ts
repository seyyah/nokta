import type { AuditNote } from './types';

type ReportMeta = {
  appName: string;
  exportedAt: string;
};

function statusLabel(status: AuditNote['status']): string {
  return status === 'fixed' ? 'Duzeltildi' : 'Acik';
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function utf8Bytes(value: string): number[] {
  const bytes: number[] = [];
  const encoded = encodeURIComponent(value);
  for (let i = 0; i < encoded.length; i += 1) {
    if (encoded[i] === '%') {
      bytes.push(parseInt(encoded.slice(i + 1, i + 3), 16));
      i += 2;
    } else {
      bytes.push(encoded.charCodeAt(i));
    }
  }
  return bytes;
}

function u16(value: number): number[] {
  return [value & 0xff, (value >>> 8) & 0xff];
}

function u32(value: number): number[] {
  return [value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff];
}

function crc32(bytes: number[]): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function base64FromBytes(bytes: number[]): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let output = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = bytes[i + 1] ?? 0;
    const c = bytes[i + 2] ?? 0;
    const triplet = (a << 16) | (b << 8) | c;
    output += chars[(triplet >>> 18) & 63];
    output += chars[(triplet >>> 12) & 63];
    output += i + 1 < bytes.length ? chars[(triplet >>> 6) & 63] : '=';
    output += i + 2 < bytes.length ? chars[triplet & 63] : '=';
  }
  return output;
}

function zipStore(files: Array<{ path: string; content: string }>): string {
  const localParts: number[] = [];
  const centralParts: number[] = [];
  let offset = 0;

  files.forEach((file) => {
    const name = utf8Bytes(file.path);
    const data = utf8Bytes(file.content);
    const crc = crc32(data);
    const localHeader = [
      ...u32(0x04034b50),
      ...u16(20),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u32(crc),
      ...u32(data.length),
      ...u32(data.length),
      ...u16(name.length),
      ...u16(0),
      ...name,
    ];

    localParts.push(...localHeader, ...data);

    centralParts.push(
      ...u32(0x02014b50),
      ...u16(20),
      ...u16(20),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u32(crc),
      ...u32(data.length),
      ...u32(data.length),
      ...u16(name.length),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u32(0),
      ...u32(offset),
      ...name,
    );

    offset += localHeader.length + data.length;
  });

  const end = [
    ...u32(0x06054b50),
    ...u16(0),
    ...u16(0),
    ...u16(files.length),
    ...u16(files.length),
    ...u32(centralParts.length),
    ...u32(localParts.length),
    ...u16(0),
  ];

  return base64FromBytes([...localParts, ...centralParts, ...end]);
}

export function buildMarkdown(notes: AuditNote[], meta: ReportMeta): string {
  const open = notes.filter((note) => note.status === 'open').length;
  const fixed = notes.length - open;
  const lines: string[] = [
    `# Bug Raporu - ${meta.appName}`,
    '',
    `**Tarih:** ${new Date(meta.exportedAt).toLocaleString('tr-TR')}`,
    `**Toplam:** ${notes.length} not - ${open} acik - ${fixed} duzeltildi`,
    '',
    '---',
    '',
  ];

  const grouped = notes.reduce<Record<string, AuditNote[]>>((acc, note) => {
    acc[note.screenName] = acc[note.screenName] || [];
    acc[note.screenName].push(note);
    return acc;
  }, {});

  let index = 1;
  Object.entries(grouped).forEach(([screenName, screenNotes]) => {
    lines.push(`## Ekran: ${screenName}`, '');
    screenNotes.forEach((note) => {
      const title = note.note.replace(/\s+/g, ' ').trim();
      lines.push(`### #${index} - ${title}`);
      lines.push('');
      lines.push(`![Burn-in Screenshot](${note.screenshot})`);
      lines.push('');
      lines.push(`- **Durum:** ${statusLabel(note.status)}`);
      lines.push(`- **Zaman:** ${new Date(note.timestamp).toLocaleString('tr-TR')}`);
      if (note.reporterId) lines.push(`- **Raporlayan:** ${note.reporterId}`);
      if (note.highlightBounds) {
        lines.push(
          `- **Secim:** x=${Math.round(note.highlightBounds.x)}, y=${Math.round(note.highlightBounds.y)}, w=${Math.round(note.highlightBounds.width)}, h=${Math.round(note.highlightBounds.height)}`,
        );
      }
      lines.push('', '---', '');
      index += 1;
    });
  });

  return lines.join('\n');
}

export function buildDocxBase64(notes: AuditNote[], meta: ReportMeta): string {
  const noteParagraphs = notes
    .map(
      (note, index) => `
        <w:p><w:r><w:t>${index + 1}. ${escapeXml(note.screenName)} - ${escapeXml(statusLabel(note.status))}</w:t></w:r></w:p>
        <w:p><w:r><w:t>${escapeXml(note.note)}</w:t></w:r></w:p>
        <w:p><w:r><w:t>Screenshot: ${escapeXml(note.screenshot.slice(0, 180))}</w:t></w:r></w:p>
        <w:p><w:r><w:t>Zaman: ${escapeXml(new Date(note.timestamp).toLocaleString('tr-TR'))}</w:t></w:r></w:p>
      `,
    )
    .join('');

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      <w:body>
        <w:p><w:r><w:t>Bug Raporu - ${escapeXml(meta.appName)}</w:t></w:r></w:p>
        <w:p><w:r><w:t>Tarih: ${escapeXml(new Date(meta.exportedAt).toLocaleString('tr-TR'))}</w:t></w:r></w:p>
        <w:p><w:r><w:t>Toplam: ${notes.length} not</w:t></w:r></w:p>
        ${noteParagraphs}
        <w:sectPr>
          <w:pgSz w:w="11906" w:h="16838"/>
          <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
        </w:sectPr>
      </w:body>
    </w:document>`;

  return zipStore([
    {
      path: '[Content_Types].xml',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
          <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
          <Default Extension="xml" ContentType="application/xml"/>
          <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
        </Types>`,
    },
    {
      path: '_rels/.rels',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
          <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
        </Relationships>`,
    },
    { path: 'word/document.xml', content: documentXml },
  ]);
}

export function makeReportStamp(): string {
  return new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
}
