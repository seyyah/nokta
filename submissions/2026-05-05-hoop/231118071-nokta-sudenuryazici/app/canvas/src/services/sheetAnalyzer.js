import { readSheet, getSheetMetadata } from './sheetsService.js';
import { parseNumeric } from './dataUtils.js';

export async function analyzeSheet(spreadsheetId, accessToken, sheetName = null) {
  try {
    const metadata = await getSheetMetadata(accessToken, spreadsheetId);
    const targetSheet = sheetName || metadata.sheets[0].properties.title;

    // Daha geniş analiz aralığı (A1:Z500)
    const range = `${targetSheet}!A1:Z500`;
    const data = await readSheet(accessToken, spreadsheetId, range);

    if (!data || data.length === 0) {
      throw new Error('Sayfada hiç veri bulunamadı.');
    }

    const headers = data[0];
    const allRows = data.slice(1);

    // Boş satırları filtrele
    const activeRows = allRows.filter(row => row.some(cell => cell && cell.toString().trim() !== ''));
    const rowCount = activeRows.length;

    // SÜTUN ANALİZİ
    const columnStats = headers.map((header, i) => {
      const samples = activeRows.slice(0, 20).map(row => row[i]).filter(cell => cell !== undefined && cell !== null);
      let detectedType = 'string';
      let hasNumbers = false;
      let detectedUnit = '';
      let semanticRole = 'attribute';

      if (samples.length > 0) {
        const fullString = samples.join(' ').toLowerCase();
        const headerLower = header.toLowerCase();
        
        if (fullString.includes('$') || headerLower.includes('dollar') || headerLower.includes('dolar')) detectedUnit = '$';
        else if (fullString.includes('%') || headerLower.includes('yüzde') || headerLower.includes('percent')) detectedUnit = '%';
        else if (fullString.includes('€')) detectedUnit = '€';
        else if (fullString.includes('tl') || headerLower.includes('tutar') || headerLower.includes('fiyat')) detectedUnit = 'TL';

        const validNumericCount = samples.filter(s => {
          const n = parseNumeric(s);
          return !isNaN(n) && (n !== 0 || s.toString().includes('0'));
        }).length;

        if (validNumericCount > samples.length * 0.6) {
          detectedType = 'number';
          hasNumbers = true;
        } else if (samples.every(s => !isNaN(Date.parse(s)) && s.toString().length > 5)) {
          detectedType = 'date';
        }

        if (headerLower.includes('tarih') || headerLower.includes('date') || headerLower.includes('ay') || headerLower.includes('month')) semanticRole = 'dimension_time';
        else if (headerLower.includes('kategori') || headerLower.includes('category') || headerLower.includes('ürün') || headerLower.includes('product')) semanticRole = 'dimension_category';
        else if (headerLower.includes('toplam') || headerLower.includes('total') || headerLower.includes('revenue') || headerLower.includes('gelir')) semanticRole = 'measure_primary';
        else if (headerLower.includes('durum') || headerLower.includes('status')) semanticRole = 'dimension_status';
      }

      return {
        index: i,
        name: header,
        type: detectedType,
        isNumeric: hasNumbers,
        unit: detectedUnit,
        role: semanticRole,
        sampleValues: samples.slice(0, 3)
      };
    });

    return {
      spreadsheetId,
      sheetName: targetSheet,
      headers,
      columnStats,
      rowCount,
      columnCount: headers.length,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Sheet analysis failed:', error);
    throw new Error(`Analiz hatası: ${error.message}`);
  }
}

export function formatMetadataForPrompt(metadata) {
  if (!metadata || !metadata.columnStats) {
    return "Hata: Analiz verileri eksik.";
  }

  return `
    Sheet: ${metadata.sheetName}
    Total Rows: ${metadata.rowCount}
    Columns Analysis:
    ${metadata.columnStats.map(c => `- Col ${c.index}: "${c.name}", Type=${c.type}, Role=${c.role}, Unit="${c.unit}", Samples=[${c.sampleValues.join(', ')}]`).join('\n')}
  `.trim();
}
