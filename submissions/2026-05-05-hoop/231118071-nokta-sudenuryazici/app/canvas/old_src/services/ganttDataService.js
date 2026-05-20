import Papa from 'papaparse';

const GANTT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1uxIqQYKHZBjUMYx5aLMYhiEgkv5zvIXVcwB0Fq6QDdE/export?format=csv';

function parseDate(str) {
  if (!str) return null;
  const d = new Date(str);
  return isNaN(d) ? null : d;
}

export const fetchGanttData = async () => {
  try {
    const res = await fetch(GANTT_SHEET_URL);
    const csv = await res.text();
    return new Promise((resolve, reject) => {
      Papa.parse(csv, {
        header: true,
        skipEmptyLines: true,
        complete: ({ data }) => {
          const tasks = data
            .filter(r => r['Task']?.trim())
            .map((r, i) => ({
              id: i + 1,
              name: r['Task']?.trim() || '',
              description: r['Description']?.trim() || '',
              startDate: parseDate(r['Start Date']),
              endDate: parseDate(r['End Date']),
              status: r['Status']?.trim() || 'Not Started',
              owner: r['Owner']?.trim() || '',
              notes: r['Notes']?.trim() || '',
            }));
          resolve(tasks);
        },
        error: reject,
      });
    });
  } catch (err) {
    console.error('Gantt fetch error:', err);
    return [];
  }
};

// ── Set this after deploying your Apps Script Web App ──
export let GANTT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxEpS8FsnaH3RgX5muuQB0apf283OCL5FjgqaOj68JsZuypPgHDpYGxIh16PDzb-Y35/exec';

export const updateTask = async (task) => {
  if (!GANTT_SCRIPT_URL) return { ok: false, local: true };
  try {
    const data = {
      task:        task.name,
      startDate:   task.startDate ? `${task.startDate.getMonth()+1}/${task.startDate.getDate()}/${task.startDate.getFullYear()}` : '',
      endDate:     task.endDate   ? `${task.endDate.getMonth()+1}/${task.endDate.getDate()}/${task.endDate.getFullYear()}`   : '',
      status:      task.status,
      owner:       task.owner,
      description: task.description,
    };
    const params = new URLSearchParams({ taskName: task.name, data: JSON.stringify(data) });
    await fetch(`${GANTT_SCRIPT_URL}?${params.toString()}`, { method: 'GET', mode: 'no-cors' });
    return { ok: true };
  } catch (err) {
    console.error('Gantt update error:', err);
    return { ok: false };
  }
};

