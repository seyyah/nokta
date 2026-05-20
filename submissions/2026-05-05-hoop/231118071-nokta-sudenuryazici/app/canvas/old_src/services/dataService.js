import Papa from 'papaparse';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/10bR5tg4Vc4Qt3g33RkAMS2fZqX3lr-20FESaFNjHu8Q/export?format=csv';

// Set this after deploying the Google Apps Script Web App
// Instructions: https://script.google.com → New Project → paste code → Deploy as Web App
export let APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw1zRJxSyJBcnefJwLkhWVKIxVgTnmF7MHA1mZG_K6tVtOAWsf4s9f1giKm-WvLbrD9hw/exec';

export function setAppsScriptUrl(url) {
  APPS_SCRIPT_URL = url;
}

function recalculate(modules) {
  const avg = modules.reduce((s, m) => s + (m.current || 0), 0) / modules.length;
  const prevAvg = modules.reduce((s, m) => s + (m.prev || 0), 0) / modules.length;
  const highest = [...modules].sort((a, b) => b.current - a.current)[0];
  const gap = modules.map(m => ({ ...m, gap: (m.prev || 0) - (m.current || 0) })).sort((a, b) => b.gap - a.gap)[0];
  return {
    avgAdoption: Math.round(avg),
    prevAvgAdoption: Math.round(prevAvg),
    trend: Math.round(avg - prevAvg),
    highestModule: highest?.name || 'N/A',
    highestValue: highest?.current || 0,
    gapModule: gap?.name || 'N/A',
    gapValue: gap?.gap || 0,
    status: avg > 50 ? 'High' : 'Low',
    upwardMomentum: avg > prevAvg,
  };
}

export const fetchData = async () => {
  try {
    const response = await fetch(SHEET_URL);
    const csvText = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          const processedData = results.data.map(row => {
            const modules = [
              { name: 'Task Management',   current: row['Task Management (%)'],   prev: row['Task Management (3mo ago)'] },
              { name: 'Gantt Charts',      current: row['Gantt Charts (%)'],      prev: row['Gantt Charts (3mo ago)'] },
              { name: 'Team Collaboration',current: row['Team Collaboration (%)'],prev: row['Team Collaboration (3mo ago)'] },
              { name: 'Resource Planning', current: row['Resource Planning (%)'], prev: row['Resource Planning (3mo ago)'] },
              { name: 'Reporting Dashboard',current: row['Reporting Dashboard (%)'],prev: row['Reporting Dashboard (3mo ago)'] },
            ];
            return { name: row['Customer Name'], modules, ...recalculate(modules) };
          });
          resolve(processedData);
        },
        error: reject,
      });
    });
  } catch (err) {
    console.error('Fetch error:', err);
    return [];
  }
};

// Update a customer row in Google Sheets via Apps Script web app
export const updateCustomer = async (customerName, modules) => {
  if (!APPS_SCRIPT_URL) {
    return { ok: false, local: true };
  }
  try {
    const data = {
      'Task Management (%)':           modules.find(m => m.name === 'Task Management')?.current,
      'Task Management (3mo ago)':     modules.find(m => m.name === 'Task Management')?.prev,
      'Gantt Charts (%)':              modules.find(m => m.name === 'Gantt Charts')?.current,
      'Gantt Charts (3mo ago)':        modules.find(m => m.name === 'Gantt Charts')?.prev,
      'Team Collaboration (%)':        modules.find(m => m.name === 'Team Collaboration')?.current,
      'Team Collaboration (3mo ago)':  modules.find(m => m.name === 'Team Collaboration')?.prev,
      'Resource Planning (%)':         modules.find(m => m.name === 'Resource Planning')?.current,
      'Resource Planning (3mo ago)':   modules.find(m => m.name === 'Resource Planning')?.prev,
      'Reporting Dashboard (%)':       modules.find(m => m.name === 'Reporting Dashboard')?.current,
      'Reporting Dashboard (3mo ago)': modules.find(m => m.name === 'Reporting Dashboard')?.prev,
    };

    // Use GET + URL params — bypasses CORS for Google Apps Script
    const params = new URLSearchParams({
      customerName,
      data: JSON.stringify(data),
    });

    await fetch(`${APPS_SCRIPT_URL}?${params.toString()}`, {
      method: 'GET',
      mode: 'no-cors',
    });

    return { ok: true };
  } catch (err) {
    console.error('Update error:', err);
    return { ok: false };
  }
};


export { recalculate };

