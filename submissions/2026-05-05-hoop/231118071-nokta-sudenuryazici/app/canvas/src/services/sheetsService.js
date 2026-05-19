/**
 * Google Sheets API v4 — Frontend REST Wrapper
 * 
 * OAuth2 access token ile doğrudan Sheets API'ye istek atar.
 * gapi kütüphanesine gerek yoktur, standart fetch kullanılır.
 */

const SHEETS_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

/**
 * Google Sheet URL'sinden spreadsheet ID'yi çıkarır.
 * Örnek: https://docs.google.com/spreadsheets/d/1AtuJqItcKqg.../edit?gid=380037596
 * Döndürür: "1AtuJqItcKqg..."
 */
export function extractSpreadsheetId(url) {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

/**
 * Google Sheet URL'sinden gid (sheet tab ID) çıkarır.
 * Döndürür: "380037596" veya null
 */
export function extractGid(url) {
  const match = url.match(/[?&]gid=(\d+)/);
  return match ? match[1] : null;
}

/**
 * Spreadsheet metadata'sını getirir (sheet isimleri, başlıklar vb.)
 */
export async function getSheetMetadata(accessToken, spreadsheetId) {
  const res = await fetch(`${SHEETS_BASE}/${spreadsheetId}?fields=sheets.properties,spreadsheetId,properties.title`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Sheets API error: ${res.status}`);
  }
  return res.json();
}

/**
 * Belirli bir sheet tab'ının adını gid'den bulur.
 */
export async function getSheetNameByGid(accessToken, spreadsheetId, gid) {
  const metadata = await getSheetMetadata(accessToken, spreadsheetId);
  const sheet = metadata.sheets?.find(s => String(s.properties.sheetId) === String(gid));
  return sheet?.properties?.title || null;
}

/**
 * Sheet verilerini okur.
 * @param {string} accessToken - OAuth2 access token
 * @param {string} spreadsheetId - Spreadsheet ID
 * @param {string} range - Örnek: "Sheet1!A1:M20" veya "Budget!A:M"
 * @returns {Promise<string[][]>} - 2D array of values
 */
export async function readSheet(accessToken, spreadsheetId, range) {
  const encodedRange = encodeURIComponent(range);
  const res = await fetch(
    `${SHEETS_BASE}/${spreadsheetId}/values/${encodedRange}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Read error: ${res.status}`);
  }
  const data = await res.json();
  return data.values || [];
}

/**
 * Tek bir range'e veri yazar.
 */
export async function writeSheet(accessToken, spreadsheetId, range, values) {
  const encodedRange = encodeURIComponent(range);
  const res = await fetch(
    `${SHEETS_BASE}/${spreadsheetId}/values/${encodedRange}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values }),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Write error: ${res.status}`);
  }
  return res.json();
}

/**
 * Birden fazla range'e aynı anda veri yazar (batch).
 * Rate limit açısından kritik: 96 ayrı istek yerine 1 istek!
 * 
 * @param {string} accessToken
 * @param {string} spreadsheetId
 * @param {Array<{range: string, values: any[][]}>} data - Yazılacak veriler
 */
export async function batchWriteSheet(accessToken, spreadsheetId, data) {
  const res = await fetch(
    `${SHEETS_BASE}/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data,
      }),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Batch write error: ${res.status}`);
  }
  return res.json();
}
