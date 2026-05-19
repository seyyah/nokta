import Papa from 'papaparse';

const VORTEX_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1QHrL-PNzGIr4dcSSqMR1q8cYOomqKmy5UuYio2dIirg/export?format=csv';

export const fetchVortexData = async () => {
  try {
    const res = await fetch(VORTEX_SHEET_URL);
    const csv = await res.text();

    return new Promise((resolve, reject) => {
      Papa.parse(csv, {
        header: true,
        skipEmptyLines: true,
        complete: ({ data }) => {
          const rows = data.map((row, i) => ({
            id: row['Employee ID'] || i + 1,
            jobTitle: row['Job Title'] || '',
            department: row['Department'] || '',
            score: parseFloat((row['Satisfaction Score'] || '0').replace(',', '.')),
            comment: row['Comments'] || '',
          }));

          // ── KPIs ──
          const scores = rows.map(r => r.score).filter(s => !isNaN(s) && s > 0);
          const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
          const totalComments = rows.filter(r => r.comment.trim()).length;

          // ── Department breakdown ──
          const deptMap = {};
          rows.forEach(r => {
            if (!deptMap[r.department]) deptMap[r.department] = { total: 0, count: 0 };
            deptMap[r.department].total += r.score;
            deptMap[r.department].count += 1;
          });
          const departments = Object.entries(deptMap).map(([name, d]) => ({
            name,
            avg: Math.round((d.total / d.count) * 10) / 10,
            count: d.count,
          })).sort((a, b) => b.avg - a.avg);

          // ── Word frequency + sentiment ──
          const stopWords = new Set([
            'the','a','an','and','or','but','in','on','at','to','for',
            'of','with','is','it','i','my','be','this','that','was','are',
            'have','had','very','could','would','has','its','our','we','they',
            'their','so','do','not','more','much','also','can','just','if',
            'all','been','by','from','about','which','who','what','when',
            'were','will','than','me','we','he','she','you','no','up','any',
            'how','some','other','out','even','as','am','did','an'
          ]);

          const wordMap = {};
          rows.forEach(r => {
            if (!r.comment) return;
            const words = r.comment.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
            words.forEach(w => {
              if (w.length < 3 || stopWords.has(w)) return;
              if (!wordMap[w]) wordMap[w] = { count: 0, scoreTotal: 0 };
              wordMap[w].count++;
              wordMap[w].scoreTotal += r.score;
            });
          });

          const words = Object.entries(wordMap)
            .map(([word, d]) => ({
              word,
              count: d.count,
              avgScore: d.scoreTotal / d.count,
            }))
            .filter(w => w.count >= 1)
            .sort((a, b) => b.count - a.count)
            .slice(0, 50);

          resolve({ rows, avgScore, totalComments, departments, words });
        },
        error: reject,
      });
    });
  } catch (err) {
    console.error('VortexLink fetch error:', err);
    return { rows: [], avgScore: 0, totalComments: 0, departments: [], words: [] };
  }
};
