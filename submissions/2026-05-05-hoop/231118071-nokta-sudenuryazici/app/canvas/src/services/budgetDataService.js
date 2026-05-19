import Papa from 'papaparse';
import { readSheet, batchWriteSheet, getSheetNameByGid } from './sheetsService';
import { fetchWithBackoff } from './rateLimiter';

// ── Eski yöntem (CSV export, OAuth gerekmez, fallback) ──
const LEGACY_SHEET_URL = "https://docs.google.com/spreadsheets/d/1AtuJqItcKqg-IPRmQkvSC4RiArbAme7o-_6O4Vrt9hA/export?format=csv&gid=380037596";

// ── Eski Apps Script URL (legacy, artık kullanılmıyor) ──
// export let BUDGET_SCRIPT_URL = '...';

// ── Yeni yöntem: Google Sheets API v4 ──

function parseValue(val) {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return val;
  if (typeof val !== 'string') return Number(val) || 0;

  let cleaned = val.replace(/[$\s%]/g, '');

  // Türkçe/Avrupa formatı: "." binlik, "," ondalık
  if (cleaned.includes(',')) {
    cleaned = cleaned.replace(/\./g, '').replace(/,/g, '.');
  } else {
    const parts = cleaned.split('.');
    if (parts.length > 1 && parts[parts.length - 1].length === 3) {
      cleaned = cleaned.replace(/\./g, '');
    }
  }

  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

const MONTHS_KEYS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

/**
 * Sheet verisini revenue/cost yapısına parse eder.
 * @param {string[][]} rows - 2D array (ilk satır header)
 */
function parseSheetRows(rows) {
  const revenueItems = [];
  const costItems = [];
  let currentSection = null;

  rows.forEach((row, index) => {
    if (index === 0) return; // Header satırını atla

    const cat = (row[0] || '').toString().trim();
    if (!cat) return;

    if (cat === 'Revenues') { currentSection = 'revenue'; return; }
    if (cat === 'Costs') { currentSection = 'costs'; return; }
    if (cat.startsWith('Total ') || cat === 'Net Profit' || cat === 'Profit Margin') {
      currentSection = null;
      return;
    }

    if (currentSection) {
      const item = { name: cat };
      MONTHS_KEYS.forEach((key, i) => {
        item[key] = parseValue(row[i + 1]);
      });

      if (currentSection === 'revenue') {
        revenueItems.push(item);
      } else {
        costItems.push(item);
      }
    }
  });

  return { revenueItems, costItems };
}

/**
 * Sheets API v4 ile budget verisini çeker.
 * @param {string} accessToken - OAuth2 token
 * @param {string} spreadsheetId - Spreadsheet ID
 * @param {string} [gid] - Sheet tab ID (opsiyonel)
 */
export async function fetchBudgetDataV2(accessToken, spreadsheetId, gid) {
  return fetchWithBackoff(async () => {
    // gid varsa, tab adını bul; yoksa ilk sheet'i kullan
    let sheetName = null;
    if (gid) {
      sheetName = await getSheetNameByGid(accessToken, spreadsheetId, gid);
    }

    const range = sheetName ? `'${sheetName}'` : 'Sheet1';
    const rows = await readSheet(accessToken, spreadsheetId, range);
    return parseSheetRows(rows);
  });
}

/**
 * Sheets API v4 ile budget verisini Sheet'e yazar (batchUpdate).
 * @param {string} accessToken - OAuth2 token
 * @param {string} spreadsheetId - Spreadsheet ID
 * @param {string} sheetName - Tab adı
 * @param {Array} revenueItems - Gelir kalemleri
 * @param {Array} costItems - Gider kalemleri
 * @param {string[][]} originalRows - İlk okunan satırlar (satır numarası eşleştirmesi için)
 */
export async function updateBudgetDataV2(accessToken, spreadsheetId, sheetName, revenueItems, costItems, originalRows) {
  return fetchWithBackoff(async () => {
    const allItems = [...revenueItems, ...costItems];

    // Satır eşleştirmesi: originalRows'dan her item'ın hangi satırda olduğunu bul
    const batchData = [];
    originalRows.forEach((row, rowIndex) => {
      const name = (row[0] || '').toString().trim();
      const item = allItems.find(i => i.name === name);
      if (item) {
        const values = MONTHS_KEYS.map(key => item[key] ?? 0);
        const tabName = sheetName || 'Sheet1';
        // B sütunundan M sütununa (1-indexed: 2-13)
        batchData.push({
          range: `'${tabName}'!B${rowIndex + 1}:M${rowIndex + 1}`,
          values: [values],
        });
      }
    });

    if (batchData.length > 0) {
      await batchWriteSheet(accessToken, spreadsheetId, batchData);
    }

    return { ok: true };
  });
}

// ══════════════════════════════════════════════════════════════
// LEGACY FALLBACK (Apps Script / CSV yöntemi — geriye uyumluluk)
// Eğer OAuth kullanılmıyorsa bu fonksiyonlar çalışır.
// ══════════════════════════════════════════════════════════════

export async function fetchBudgetData() {
  return new Promise((resolve, reject) => {
    Papa.parse(LEGACY_SHEET_URL, {
      download: true,
      header: false,
      complete: (results) => {
        resolve(parseSheetRows(results.data));
      },
      error: (err) => reject(err)
    });
  });
}
