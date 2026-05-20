import Papa from 'papaparse';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1XPNo7e3lBDW9TFEswmisERDuM7P1OyPwiF9z8_w2zH0/export?format=csv&gid=0';
const SYNC_URL = 'https://script.google.com/macros/s/AKfycbwks5EZyJkIQAV5sv6wWKkBm-YVC1jCxj0m2Dj-Q23WHtIVusbH90o9gb7bAeF4fADo/exec';

export async function fetchLeads() {
  return new Promise((resolve, reject) => {
    Papa.parse(SHEET_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const leads = results.data.map((row, idx) => {
          const keys = Object.keys(row);
          const getName = () => row[keys.find(k => k.trim().toLowerCase() === 'customer name')] || row[keys[0]];
          const getStatus = () => row[keys.find(k => k.trim().toLowerCase() === 'status')] || 'NOT STARTED';
          const getSize = () => row[keys.find(k => k.trim().toLowerCase() === 'size')] || 'SMB';
          const getAgent = () => row[keys.find(k => k.trim().toLowerCase() === 'assigned to')] || 'Unassigned';

          const name = (getName() || '').trim();
          if (!name) return null;

          return {
            id: `lead-${idx}`,
            name: name,
            status: getStatus().toUpperCase().replace(/\s+/g, '_'),
            type: getSize(),
            agent: getAgent()
          };
        }).filter(Boolean);
        
        resolve(leads);
      },
      error: (err) => reject(err)
    });
  });
}

export async function updateLeadStatus(leadName, newStatus) {
  try {
    const params = new URLSearchParams({
      leadName: leadName.trim(),
      newStatus: newStatus.trim()
    });

    await fetch(`${SYNC_URL}?${params.toString()}`, {
      method: 'GET',
      mode: 'no-cors'
    });
    console.log(`Sync request (GET) sent for ${leadName}`);
  } catch (err) {
    console.error('Failed to send sync request:', err);
  }
}
