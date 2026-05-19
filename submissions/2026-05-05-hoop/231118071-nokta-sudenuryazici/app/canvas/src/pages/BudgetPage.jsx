import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, LayoutGrid, TrendingUp, TrendingDown, 
  DollarSign, PieChart, BarChart3, Activity, 
  ChevronRight, Save, Download, Filter, 
  Maximize2, Minimize2, Edit3, Settings,
  RotateCcw, Share2, Eye, Trash2, ChevronDown,
  BarChart2, Zap, Percent, RefreshCw, Wifi, WifiOff
} from 'lucide-react';
import { useGoogleAuth } from '../auth/useGoogleAuth';
import { fetchBudgetData, fetchBudgetDataV2, updateBudgetDataV2 } from '../services/budgetDataService';
import { readSheet, getSheetNameByGid } from '../services/sheetsService';
import { createDebounce } from '../services/rateLimiter';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_SHORT = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

export default function BudgetPage() {
  const navigate = useNavigate();
  const { accessToken, isAuthenticated } = useGoogleAuth();
  const [originalData, setOriginalData] = useState({ revenueItems: [], costItems: [] });
  const [data, setData] = useState({ revenueItems: [], costItems: [] });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const [viewMode, setViewMode] = useState('dashboard');
  const [useV2, setUseV2] = useState(false);
  const [sheetMeta, setSheetMeta] = useState({ spreadsheetId: null, sheetName: null, originalRows: null });
  const saveTimeoutRef = React.useRef(null);

  // ── Veri Yükleme ──
  useEffect(() => {
    const spreadsheetId = sessionStorage.getItem('canvassheet_spreadsheetId');
    const gid = sessionStorage.getItem('canvassheet_gid');

    if (isAuthenticated && accessToken && spreadsheetId) {
      // Yeni yöntem: Sheets API v4
      setUseV2(true);
      (async () => {
        try {
          let sheetName = null;
          if (gid) {
            sheetName = await getSheetNameByGid(accessToken, spreadsheetId, gid);
          }
          const range = sheetName ? `'${sheetName}'` : 'Sheet1';
          const rows = await readSheet(accessToken, spreadsheetId, range);

          // Parse
          const d = await fetchBudgetDataV2(accessToken, spreadsheetId, gid);
          setOriginalData(d);
          setData(d);
          setSheetMeta({ spreadsheetId, sheetName: sheetName || 'Sheet1', originalRows: rows });
          setLoading(false);
        } catch (err) {
          console.error('Sheets API v4 error, falling back to legacy:', err);
          // Fallback to legacy
          setUseV2(false);
          fetchBudgetData().then(d => {
            setOriginalData(d);
            setData(d);
            setLoading(false);
          }).catch(() => setLoading(false));
        }
      })();
    } else {
      // Legacy yöntem: CSV export
      setUseV2(false);
      fetchBudgetData().then(d => {
        setOriginalData(d);
        setData(d);
        setLoading(false);
      }).catch(err => {
        console.error('Failed to load data', err);
        setLoading(false);
      });
    }
  }, [accessToken, isAuthenticated]);

  // ── Hücre Değişikliği ──
  const handleCellChange = (category, index, month, value) => {
    const val = parseFloat(value) || 0;
    setData(prev => {
      const newData = { ...prev };
      if (category === 'revenue') {
        newData.revenueItems = [...prev.revenueItems];
        newData.revenueItems[index] = { ...prev.revenueItems[index], [month.toLowerCase()]: val };
      } else {
        newData.costItems = [...prev.costItems];
        newData.costItems[index] = { ...prev.costItems[index], [month.toLowerCase()]: val };
      }
      return newData;
    });
  };

  // ── Debounced Auto-Save (Sheets API v4) ──
  useEffect(() => {
    if (loading) return;
    if (JSON.stringify(data) === JSON.stringify(originalData)) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      setSaveStatus('saving');
      setIsSaving(true);

      if (useV2 && accessToken && sheetMeta.spreadsheetId && sheetMeta.originalRows) {
        // Sheets API v4 ile kaydet
        try {
          await updateBudgetDataV2(
            accessToken,
            sheetMeta.spreadsheetId,
            sheetMeta.sheetName,
            data.revenueItems,
            data.costItems,
            sheetMeta.originalRows
          );
          setOriginalData(JSON.parse(JSON.stringify(data)));
          setSaveStatus('saved');
        } catch (err) {
          console.error('Save error:', err);
          setSaveStatus('error');
        }
      } else {
        // Legacy: kaydetme yok (read-only)
        setSaveStatus('saved');
      }
      setIsSaving(false);
    }, 2000);

    return () => clearTimeout(saveTimeoutRef.current);
  }, [data, loading]);

  // ── Polling: Her 10sn'de sheet'i yeniden oku (sadece V2 modunda) ──
  useEffect(() => {
    if (!useV2 || !accessToken || !sheetMeta.spreadsheetId || loading) return;

    const pollInterval = setInterval(async () => {
      // Eğer kaydetme sürüyorsa polling atla
      if (isSaving) return;

      try {
        const d = await fetchBudgetDataV2(accessToken, sheetMeta.spreadsheetId,
          sessionStorage.getItem('canvassheet_gid'));

        // Sadece dışarıdan bir değişiklik geldiyse güncelle
        const currentJson = JSON.stringify(data);
        const newJson = JSON.stringify(d);
        if (currentJson !== newJson) {
          setOriginalData(d);
          setData(d);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 10000);

    return () => clearInterval(pollInterval);
  }, [useV2, accessToken, sheetMeta.spreadsheetId, loading, isSaving]);

  const handleReset = () => {
    if (window.confirm('Reset all simulation data to original values?')) {
      setData(JSON.parse(JSON.stringify(originalData)));
    }
  };

  const stats = useMemo(() => {
    const monthlyData = MONTHS.map(m => {
      const monthKey = m.toLowerCase();
      const revenue = data.revenueItems.reduce((sum, item) => sum + (item[monthKey] || 0), 0);
      const costs = data.costItems.reduce((sum, item) => sum + (item[monthKey] || 0), 0);
      const profit = revenue - costs;
      return { month: m, revenue, costs, profit };
    });

    const annualRevenue = monthlyData.reduce((sum, d) => sum + d.revenue, 0);
    const annualCosts = monthlyData.reduce((sum, d) => sum + d.costs, 0);
    const netProfit = annualRevenue - annualCosts;
    const marginEfficiency = annualRevenue > 0 ? (netProfit / annualRevenue) * 100 : 0;

    const movingTrend = monthlyData.map((d, i) => {
      if (i === 0) return d.profit;
      if (i === 1) return (monthlyData[0].profit + monthlyData[1].profit) / 2;
      return (monthlyData[i-2].profit + monthlyData[i-1].profit + monthlyData[i].profit) / 3;
    });

    const totalRev = annualRevenue || 1;
    const revenueBreakdown = data.revenueItems.map(item => {
      const itemTotal = MONTHS.reduce((sum, m) => sum + (item[m.toLowerCase()] || 0), 0);
      return {
        name: item.name,
        total: itemTotal,
        percentage: (itemTotal / totalRev) * 100
      };
    });

    return { 
      monthlyData, 
      annualRevenue, 
      annualCosts, 
      netProfit, 
      marginEfficiency, 
      movingTrend,
      revenueBreakdown
    };
  }, [data]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F8FAFC', color: '#64748B' }}>
      Loading Workspace...
    </div>
  );

  return (
    <div style={{ height: '100vh', overflowY: 'auto', background: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>
      {/* --- Top Utility Bar --- */}
      <div style={{ 
        height: '48px', background: '#F1F5F9', borderBottom: '1px solid #E2E8F0', 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px',
        position: 'sticky', top: 0, zIndex: 100 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <LayoutGrid size={16} style={{ color: '#1E293B' }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>Budget Simulation Workspace Dashboard</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#64748B' }}>
            <RotateCcw size={15} style={{ cursor: 'pointer' }} onClick={handleReset} title="Reset Simulation" />
          </div>
          <div style={{ width: '1px', height: '20px', background: '#CBD5E1' }} />
          
          <button 
            onClick={handleReset}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none',
              color: '#1E293B', fontSize: '12px', fontWeight: 600, cursor: 'pointer'
            }}
          >
            <RotateCcw size={14} /> Reset Simulation
          </button>

          <div style={{ width: '1px', height: '20px', background: '#CBD5E1' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600 }}>
            {useV2 ? (
              <span style={{ color: '#3B82F6', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Wifi size={12} /> API v4
              </span>
            ) : (
              <span style={{ color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <WifiOff size={12} /> Legacy
              </span>
            )}
          </div>
          <div style={{ width: '1px', height: '20px', background: '#CBD5E1' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1E293B', fontSize: '12px', fontWeight: 600 }}>
            {saveStatus === 'saving' ? (
              <span style={{ color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '4px' }}><RefreshCw size={14} /> Saving...</span>
            ) : saveStatus === 'error' ? (
              <span style={{ color: '#EF4444', display: 'flex', alignItems: 'center', gap: '4px' }}><RefreshCw size={14} /> Error</span>
            ) : saveStatus === 'saved' ? (
              <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}><Save size={14} /> Saved</span>
            ) : (
              <span style={{ color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}><Save size={14} /> Ready</span>
            )}
          </div>
          <div style={{ width: '1px', height: '20px', background: '#CBD5E1' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1E293B', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
            <BarChart2 size={14} /> View data
          </div>
          <div style={{ width: '1px', height: '20px', background: '#CBD5E1' }} />
          <Trash2 size={16} style={{ color: '#1E293B', cursor: 'pointer' }} />
          <ChevronDown size={16} style={{ color: '#1E293B', cursor: 'pointer' }} />
        </div>
      </div>

      <div style={{ padding: '40px 60px', maxWidth: '1600px', margin: '0 auto' }}>
        
        {/* --- Header Section --- */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '8px' }}>BUDGET SIMULATION WORKSPACE</h1>
            <p style={{ fontSize: '15px', color: '#64748B', fontWeight: 500 }}>Live scenario testing for annual profitability and margins.</p>
          </div>
          <div style={{ background: '#E2E8F0', padding: '5px', borderRadius: '12px', display: 'flex', gap: '5px' }}>
            <button 
              onClick={() => setViewMode('dashboard')}
              style={{ 
                padding: '10px 24px', border: 'none', borderRadius: '9px', 
                fontSize: '13px', fontWeight: 800, cursor: 'pointer',
                background: viewMode === 'dashboard' ? '#3B82F6' : 'transparent',
                color: viewMode === 'dashboard' ? '#fff' : '#64748B',
                transition: 'all 0.2s',
                boxShadow: viewMode === 'dashboard' ? '0 4px 12px rgba(59,130,246,0.3)' : 'none'
              }}
            >
              DASHBOARD
            </button>
            <button 
              onClick={() => setViewMode('simulation')}
              style={{ 
                padding: '10px 24px', border: 'none', borderRadius: '9px', 
                fontSize: '13px', fontWeight: 800, cursor: 'pointer',
                background: viewMode === 'simulation' ? '#fff' : 'transparent',
                color: '#64748B',
                transition: 'all 0.2s',
                boxShadow: viewMode === 'simulation' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              SIMULATION TABLE
            </button>
          </div>
        </div>

        {/* --- KPI Cards --- */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
          <KpiCard 
            label="ANNUAL REVENUE" 
            value={stats.annualRevenue} 
            sub="TOTAL INFLOW"
            icon={<DollarSign size={18} />} 
            color="#059669" 
            prefix="$"
          />
          <KpiCard 
            label="ANNUAL COSTS" 
            value={stats.annualCosts} 
            sub="TOTAL OUTFLOW"
            icon={<DollarSign size={18} />} 
            color="#DC2626" 
            prefix="$"
          />
          <KpiCard 
            label="NET PROFIT" 
            value={stats.netProfit} 
            sub="PROFITABLE"
            icon={<Activity size={18} />} 
            color="#3B82F6" 
            prefix="$"
          />
          <KpiCard 
            label="MARGIN EFFICIENCY" 
            value={stats.marginEfficiency} 
            sub="YIELD RATE"
            icon={<Percent size={18} />} 
            color="#D97706" 
            suffix="%"
          />
        </div>

        {viewMode === 'dashboard' ? (
          <DashboardView stats={stats} onStartSimulation={() => setViewMode('simulation')} />
        ) : (
          <SimulationTable data={data} onCellChange={handleCellChange} />
        )}

      </div>
    </div>
  );
}

function KpiCard({ label, value, sub, icon, color, prefix = '', suffix = '' }) {
  return (
    <div style={{ 
      background: '#fff', borderRadius: '16px', padding: '24px', 
      border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
      display: 'flex', flexDirection: 'column', gap: '12px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.05em' }}>{label}</span>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${color}10`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
      </div>
      <div>
        <div style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
          {prefix}{value.toLocaleString()}{suffix}
        </div>
        <div style={{ fontSize: '10px', fontWeight: 800, color: '#CBD5E1', letterSpacing: '0.05em' }}>{sub}</div>
      </div>
    </div>
  );
}

function DashboardView({ stats, onStartSimulation }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px' }}>
      {/* Profitability Performance */}
      <div style={{ 
        background: '#fff', borderRadius: '16px', padding: '32px', 
        border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
          <BarChart2 size={18} style={{ color: '#6366F1' }} />
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', textTransform: 'uppercase' }}>Profitability Performance</h3>
        </div>
        <div style={{ height: '340px', width: '100%' }}>
          <ProfitChart data={stats.monthlyData} trend={stats.movingTrend} />
        </div>
      </div>

      {/* Annual Totals Comparison */}
      <div style={{ 
        background: '#fff', borderRadius: '16px', padding: '32px', 
        border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
          <Activity size={18} style={{ color: '#10B981' }} />
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', textTransform: 'uppercase' }}>Annual Totals Comparison</h3>
        </div>
        <div style={{ height: '340px' }}>
          <AnnualTotalsChart 
            revenue={stats.annualRevenue} 
            costs={stats.annualCosts} 
            profit={stats.netProfit} 
          />
        </div>
      </div>

      {/* Revenue Source Breakdown */}
      <div style={{ 
        background: '#fff', borderRadius: '16px', padding: '32px', 
        border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        <h3 style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', marginBottom: '32px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revenue Source Breakdown</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {stats.revenueBreakdown.map(item => (
            <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#1E293B', marginBottom: '4px' }}>{item.name}</div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8' }}>${item.total.toLocaleString()} annual contribution</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '180px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#64748B', width: '40px', textAlign: 'right' }}>{Math.round(item.percentage)}%</span>
                <div style={{ flex: 1, height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', background: '#059669', 
                    width: `${item.percentage}%`, borderRadius: '4px',
                    transition: 'width 0.5s ease-out'
                  }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What-If Engine */}
      <div style={{ 
        background: '#fff', borderRadius: '16px', padding: '32px', 
        border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center'
      }}>
        <div style={{ background: '#EEF2FF', borderRadius: '16px', padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <RotateCcw size={18} style={{ color: '#4F46E5' }} />
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#1E1B4B', textTransform: 'uppercase' }}>What-If Engine</h3>
          </div>
          <p style={{ fontSize: '13px', color: '#4338CA', lineHeight: '1.7', marginBottom: '24px', fontWeight: 500 }}>
            Switch to the <strong>Simulation Table</strong> to edit monthly projections. All charts, including the annual summary, recalculate in real-time as you type.
          </p>
          <button 
            onClick={onStartSimulation}
            style={{ 
              width: '100%', background: '#3B82F6', color: '#fff', border: 'none', 
              padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: 800, 
              cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
            }}
          >
            START SIMULATION
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfitChart({ data, trend }) {
  const maxVal = Math.max(...data.map(d => Math.abs(d.profit)), ...trend.map(t => Math.abs(t))) || 1;
  const height = 280;
  const barWidth = 36;
  const gap = 56;
  
  return (
    <svg viewBox={`0 0 ${data.length * gap + 60} ${height + 60}`} width="100%" height="100%" preserveAspectRatio="none">
      {/* Horizontal Grid Lines */}
      {[0, 0.2, 0.4, 0.6, 0.8, 1].map(p => (
        <React.Fragment key={p}>
          <line x1="50" y1={height * p} x2="100%" y2={height * p} stroke="#F1F5F9" strokeWidth="1" />
          <text x="40" y={height * p + 4} textAnchor="end" fontSize="11" fontWeight="800" fill="#CBD5E1">
            ${Math.round(((1 - p) * maxVal * 2 - maxVal) / 1000)}k
          </text>
        </React.Fragment>
      ))}
      
      {/* Bars */}
      {data.map((d, i) => {
        const barHeight = (Math.abs(d.profit) / maxVal) * (height / 2);
        const x = i * gap + 60;
        const y = d.profit >= 0 ? (height / 2) - barHeight : (height / 2);
        return (
          <rect 
            key={i} 
            x={x} y={y} 
            width={barWidth} height={barHeight} 
            fill={d.profit >= 0 ? '#4F46E5' : '#FCA5A5'} 
            rx="4"
          />
        );
      })}

      {/* Trend Line */}
      <polyline
        fill="none"
        stroke="#DC2626"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={trend.map((t, i) => {
          const x = i * gap + 60 + (barWidth / 2);
          const y = (height / 2) - (t / maxVal) * (height / 2);
          return `${x},${y}`;
        }).join(' ')}
      />

      {/* Month Labels (Single Letter) */}
      {data.map((d, i) => (
        <text 
          key={i} 
          x={i * gap + 60 + (barWidth / 2)} 
          y={height + 30} 
          textAnchor="middle" 
          fontSize="12" 
          fill="#94A3B8"
          fontWeight="900"
        >
          {MONTH_SHORT[i]}
        </text>
      ))}
    </svg>
  );
}

function AnnualTotalsChart({ revenue, costs, profit }) {
  const maxVal = Math.max(revenue, costs, Math.abs(profit)) || 1;
  const height = 280;
  
  const bars = [
    { label: 'Revenue', value: revenue, color: '#059669' },
    { label: 'Costs', value: costs, color: '#EF4444' },
    { label: 'Profit', value: profit, color: '#3B82F6' }
  ];

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', paddingBottom: '40px', paddingLeft: '40px' }}>
        {/* Y-axis labels */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 40, width: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
           {[500, 400, 300, 200, 100, 0].map(val => (
             <span key={val} style={{ fontSize: '11px', fontWeight: '800', color: '#CBD5E1' }}>${val}k</span>
           ))}
        </div>
        {/* Grid lines */}
        <div style={{ position: 'absolute', left: 40, right: 0, top: 0, bottom: 40, pointerEvents: 'none' }}>
           {[0, 0.2, 0.4, 0.6, 0.8, 1].map(p => (
             <div key={p} style={{ position: 'absolute', top: `${p * 100}%`, left: 0, right: 0, borderTop: '1px solid #F1F5F9' }} />
           ))}
        </div>
        {bars.map(bar => {
          const barHeight = (Math.abs(bar.value) / 500000) * height; // Scale to 500k as per image
          return (
            <div key={bar.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', zIndex: 1 }}>
              <div style={{ 
                width: '48px', 
                height: `${barHeight}px`, 
                background: bar.color, 
                borderRadius: '6px',
                transition: 'height 0.3s ease-out'
              }} />
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>{bar.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SimulationTable({ data, onCellChange }) {
  const renderRows = (items, category) => {
    return items.map((item, idx) => {
      const rowTotal = MONTHS.reduce((sum, m) => sum + (item[m.toLowerCase()] || 0), 0);
      return (
        <tr key={item.name} style={{ borderBottom: '1px solid #F1F5F9' }}>
          <td style={{ padding: '16px', fontSize: '13px', fontWeight: 700, color: '#1E293B', background: '#F8FAFC', position: 'sticky', left: 0, zIndex: 1 }}>{item.name}</td>
          {MONTHS.map(m => (
            <td key={m} style={{ padding: '4px' }}>
              <input 
                type="number" 
                value={item[m.toLowerCase()]} 
                onChange={(e) => onCellChange(category, idx, m, e.target.value)}
                style={{ 
                  width: '100%', border: '1px solid transparent', background: 'transparent', 
                  padding: '10px', fontSize: '14px', textAlign: 'right', outline: 'none',
                  fontFamily: 'monospace', fontWeight: 700, borderRadius: '4px'
                }}
                onFocus={(e) => {
                  e.target.style.background = '#fff';
                  e.target.style.borderColor = '#3B82F6';
                }}
                onBlur={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.borderColor = 'transparent';
                }}
              />
            </td>
          ))}
          <td style={{ 
            padding: '16px', fontSize: '14px', fontWeight: 900, color: '#0F172A', 
            textAlign: 'right', background: '#F1F5F9'
          }}>
            ${rowTotal.toLocaleString()}
          </td>
        </tr>
      );
    });
  };

  const revenueTotal = data.revenueItems.reduce((sum, item) => {
    return sum + MONTHS.reduce((s, m) => s + (item[m.toLowerCase()] || 0), 0);
  }, 0);

  const costTotal = data.costItems.reduce((sum, item) => {
    return sum + MONTHS.reduce((s, m) => s + (item[m.toLowerCase()] || 0), 0);
  }, 0);

  return (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', position: 'sticky', left: 0, zIndex: 2, background: '#F8FAFC' }}>STREAM / MONTH</th>
              {MONTHS.map(m => (
                <th key={m} style={{ padding: '16px', textAlign: 'right', fontSize: '11px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>{m}</th>
              ))}
              <th style={{ padding: '16px', textAlign: 'right', fontSize: '11px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', background: '#F1F5F9' }}>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ background: '#F0F9FF' }}>
              <td colSpan={MONTHS.length + 2} style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 900, color: '#0369A1' }}>REVENUE STREAMS</td>
            </tr>
            {renderRows(data.revenueItems, 'revenue')}
            <tr style={{ background: '#FEF2F2' }}>
              <td colSpan={MONTHS.length + 2} style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 900, color: '#991B1B' }}>OPERATIONAL COSTS</td>
            </tr>
            {renderRows(data.costItems, 'costs')}
          </tbody>
          <tfoot>
            <tr style={{ background: '#0F172A', color: '#fff' }}>
              <td style={{ padding: '20px 16px', fontSize: '14px', fontWeight: 900 }}>NET PERFORMANCE</td>
              {MONTHS.map(m => {
                const monthKey = m.toLowerCase();
                const rev = data.revenueItems.reduce((s, i) => s + (i[monthKey] || 0), 0);
                const cos = data.costItems.reduce((s, i) => s + (i[monthKey] || 0), 0);
                const prof = rev - cos;
                return (
                  <td key={m} style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: 800, color: prof >= 0 ? '#10B981' : '#EF4444' }}>
                    ${prof.toLocaleString()}
                  </td>
                );
              })}
              <td style={{ padding: '16px', textAlign: 'right', fontSize: '18px', fontWeight: 900, background: '#1E293B' }}>
                ${(revenueTotal - costTotal).toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
