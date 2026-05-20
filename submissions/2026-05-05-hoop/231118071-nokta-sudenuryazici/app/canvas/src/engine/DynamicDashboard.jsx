import { useState, useEffect, useMemo } from 'react';
import { getWidgetComponent } from './WidgetRegistry.js';
import { readSheet, batchWriteSheet } from '../services/sheetsService.js';
import { useGoogleAuth } from '../auth/useGoogleAuth.js';
import { Sparkles, Loader2 } from 'lucide-react';

export default function DynamicDashboard({ uiConfig, spreadsheetId }) {
  const { accessToken } = useGoogleAuth();
  const [sheetData, setSheetData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const dataRequests = useMemo(() => {
    if (!uiConfig || !uiConfig.widgets) return [];
    const requests = new Map();

    uiConfig.widgets.forEach(widget => {
      if (widget.dataSource) {
        const { sheetName, range } = widget.dataSource;
        const key = range.includes('!') ? range : `${sheetName}!${range}`;
        if (!requests.has(key)) {
          requests.set(key, { sheetName, range });
        }
      } else {
        // Default to all sheets if range not specified? 
        // For now, let's assume Gemini follows instructions.
      }
    });

    // If no explicit data sources, try to fetch first 10 rows of the first sheet
    if (requests.size === 0) {
      requests.set('A1:Z50', { sheetName: '', range: 'A1:Z50' });
    }

    return Array.from(requests.values());
  }, [uiConfig]);

  useEffect(() => {
    async function loadData() {
      if (!spreadsheetId || !accessToken) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const dataMap = {};
        for (const req of dataRequests) {
          const range = req.range.includes('!') ? req.range : `${req.sheetName}${req.sheetName ? '!' : ''}${req.range}`;
          const data = await readSheet(accessToken, spreadsheetId, range);
          const filteredData = data.filter((row, idx) => idx === 0 || row.some(cell => cell && cell.toString().trim() !== ''));
          dataMap[range] = filteredData;
        }
        setSheetData(dataMap);
      } catch (err) {
        console.error('Data load error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [spreadsheetId, accessToken, dataRequests]);

  const handleDataChange = async (widgetIndex, newData) => {
    const widget = uiConfig.widgets[widgetIndex];
    if (!widget?.dataSource) return;

    try {
      const { sheetName, range } = widget.dataSource;
      const fullRange = range.includes('!') ? range : `${sheetName}!${range}`;
      await batchWriteSheet(accessToken, spreadsheetId, [{
        range: fullRange,
        values: newData
      }]);
      setSheetData(prev => ({ ...prev, [fullRange]: newData }));
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-6">
      <Loader2 size={48} className="animate-spin text-blue-500" />
      <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">AI Verileri Hazırlıyor...</p>
    </div>
  );

  if (error) return (
    <div className="p-8 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-rose-400">
      <h3 className="font-bold mb-2">Veri Yükleme Hatası</h3>
      <p className="text-sm opacity-80">{error}</p>
    </div>
  );

  const sortedWidgets = [...(uiConfig?.widgets || [])].sort((a, b) => (a.gridPosition?.order || 0) - (b.gridPosition?.order || 0));

  return (
    <div className="space-y-10 animate-fadeIn">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-white tracking-tight">{uiConfig.title}</h1>
        <p className="text-slate-400 font-medium text-lg">{uiConfig.subtitle}</p>
      </div>

      <div className="grid grid-cols-12 gap-8 items-start">
        {sortedWidgets.map((widget, index) => {
          try {
            const WidgetComponent = getWidgetComponent(widget.type);
            if (!WidgetComponent) return null;

            const colSpan = widget.gridPosition?.colSpan || 12;
            const rowSpan = widget.gridPosition?.rowSpan || 1;

            const dataKey = widget.dataSource ? (widget.dataSource.range.includes('!') ? widget.dataSource.range : `${widget.dataSource.sheetName}${widget.dataSource.sheetName ? '!' : ''}${widget.dataSource.range}`) : dataRequests[0]?.range;
            const widgetData = dataKey ? sheetData[dataKey] : Object.values(sheetData)[0];

            return (
              <div
                key={`${widget.type}-${index}`}
                className="group relative transition-all duration-300 hover:-translate-y-1"
                style={{
                  gridColumn: `span ${colSpan}`,
                  gridRow: `span ${rowSpan}`,
                }}
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-[32px] blur opacity-0 group-hover:opacity-10 transition duration-500"></div>
                <div className="relative glass-panel rounded-[32px] overflow-hidden border-white/5 group-hover:border-white/10 transition-colors h-full">
                  <WidgetComponent
                    title={widget.title}
                    sheetData={widgetData}
                    onDataChange={(newData) => handleDataChange(index, newData)}
                    config={widget.config}
                    style={widget.style}
                  />
                </div>
              </div>
            );
          } catch (err) {
            return <div className="col-span-12 p-4 text-rose-500">Widget Error</div>;
          }
        })}
      </div>
    </div>
  );
}
