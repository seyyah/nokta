import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, TrendingUp, TrendingDown, CheckCircle2, AlertCircle,
  BarChart3, Plus, Edit3, Trash2, ChevronRight, LayoutGrid,
  ArrowRight, X, Save, AlertTriangle, ExternalLink, Layout
} from 'lucide-react';
import { fetchData, updateCustomer, recalculate } from './services/dataService';

/* ──────────────────────────────── SIDEBAR ── */
function Sidebar({ customers, selected, onSelect, query, onQuery, onNavigateVortex, onNavigateGantt, onNavigateBudget, onNavigateLeads }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="logo-row">
          <div className="logo-icon"><LayoutGrid size={17} /></div>
          <span className="logo-text">Adoption Hub</span>
        </div>
        <div className="search-box">
          <Search size={14} className="s-icon" />
          <input
            type="text"
            placeholder="Search customers..."
            value={query}
            onChange={e => onQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="sidebar-section-hdr">
        <span>CUSTOMERS ({customers.length})</span>
        <Plus size={14} style={{ cursor: 'pointer' }} />
      </div>

      <div className="customer-list">
        {customers.map(c => (
          <div
            key={c.name}
            className={`cust-item ${selected?.name === c.name ? 'active' : ''}`}
            onClick={() => onSelect(c)}
          >
            <div>
              <div className="cust-name">{c.name}</div>
              <div className="cust-meta">Avg Adoption: {c.avgAdoption}%</div>
            </div>
            <ChevronRight size={15} className="cust-chevron" />
          </div>
        ))}
      </div>
      {/* Second dashboard link */}
      <div
        onClick={onNavigateVortex}
        style={{
          margin: '12px 8px', padding: '12px 14px', borderRadius: '10px',
          background: '#F1F5F9', cursor: 'pointer', display: 'flex',
          alignItems: 'center', gap: '10px', transition: 'background 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'}
        onMouseLeave={e => e.currentTarget.style.background = '#F1F5F9'}
      >
        <ExternalLink size={15} style={{ color: '#0047FF', flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#1E293B' }}>VortexLink Dashboard</div>
          <div style={{ fontSize: '10px', color: '#64748B' }}>Sentiment Analysis</div>
        </div>
      </div>
      {/* Gantt link */}
      <div
        onClick={onNavigateGantt}
        style={{
          margin: '4px 8px 4px', padding: '12px 14px', borderRadius: '10px',
          background: '#F1F5F9', cursor: 'pointer', display: 'flex',
          alignItems: 'center', gap: '10px', transition: 'background 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'}
        onMouseLeave={e => e.currentTarget.style.background = '#F1F5F9'}
      >
        <ExternalLink size={15} style={{ color: '#22C55E', flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#1E293B' }}>Project Timeline</div>
          <div style={{ fontSize: '10px', color: '#64748B' }}>Gantt Chart</div>
        </div>
      </div>
      {/* Budget link */}
      <div
        onClick={onNavigateBudget}
        style={{
          margin: '4px 8px 4px', padding: '12px 14px', borderRadius: '10px',
          background: '#F1F5F9', cursor: 'pointer', display: 'flex',
          alignItems: 'center', gap: '10px', transition: 'background 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'}
        onMouseLeave={e => e.currentTarget.style.background = '#F1F5F9'}
      >
        <BarChart3 size={15} style={{ color: '#8B5CF6', flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#1E293B' }}>Budget Simulation</div>
          <div style={{ fontSize: '10px', color: '#64748B' }}>Financial Modeling</div>
        </div>
      </div>
      {/* Lead Pipeline link */}
      <div
        onClick={onNavigateLeads}
        style={{
          margin: '4px 8px 12px', padding: '12px 14px', borderRadius: '10px',
          background: '#F1F5F9', cursor: 'pointer', display: 'flex',
          alignItems: 'center', gap: '10px', transition: 'background 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'}
        onMouseLeave={e => e.currentTarget.style.background = '#F1F5F9'}
      >
        <Layout size={15} style={{ color: '#F43F5E', flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#1E293B' }}>Lead Pipeline</div>
          <div style={{ fontSize: '10px', color: '#64748B' }}>Kanban Management</div>
        </div>
      </div>
    </aside>
  );
}

/* ──────────────────────────────── STAT CARD ── */
function StatCard({ label, value, delta, sub, Icon, icClass }) {
  return (
    <div className="stat-card">
      <div className="stat-card-hdr">
        <div className={`stat-icon ${icClass}`}><Icon size={17} /></div>
        <span className="stat-lbl">{label}</span>
      </div>
      <div className="stat-val-row">
        <span className="stat-val">{value}</span>
        {delta !== undefined && (
          <span className={`stat-delta ${delta >= 0 ? 'delta-up' : 'delta-down'}`}>
            {delta >= 0 ? '+' : ''}{delta}%
          </span>
        )}
      </div>
      <div className="stat-sub">{sub}</div>
    </div>
  );
}

/* ──────────────────────────────── MODULE ROW ── */
function ModRow({ mod }) {
  const diff = mod.current - mod.prev;
  return (
    <div className="mod-row">
      <div className="mod-label">{mod.name}</div>
      <div className="mod-mid">
        <div className="mod-left">
          <span className="mod-pct">{mod.current}%</span>
          <span className={`mod-badge ${diff >= 0 ? 'up' : 'down'}`}>
            {diff >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {Math.abs(diff)}%
          </span>
        </div>
        <span className="mod-vs">vs 3mo ago: {mod.prev}%</span>
      </div>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${mod.current}%` }} />
      </div>
    </div>
  );
}

/* ──────────────────────────────── EDIT MODAL ── */
function EditModal({ customer, onSave, onCancel }) {
  const [draft, setDraft] = useState(
    customer.modules.map(m => ({ ...m }))
  );
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const stats = recalculate(draft);
  const isChurnRisk = stats.trend < 0;

  function update(name, field, raw) {
    const val = Math.min(100, Math.max(0, parseInt(raw) || 0));
    setDraft(d => d.map(m => m.name === name ? { ...m, [field]: val } : m));
  }

  async function handleSave() {
    setSaving(true);
    const result = await updateCustomer(customer.name, draft);
    setSaving(false);
    if (result.local) setSaveStatus('local');
    else if (result.ok)  setSaveStatus('ok');
    else                 setSaveStatus('error');
    setTimeout(() => { setSaveStatus(null); onSave(draft, stats); }, 1200);
  }

  return (
    <div className="modal-overlay">
      <div className="modal-wrap">
        <div className="modal-pg-header">
          <div>
            <div className="pg-title-row">
              <h1 className="pg-title">{customer.name}</h1>
              <span className="badge badge-warn">Action Required</span>
            </div>
            <p className="pg-sub">Detailed product utilization analysis</p>
          </div>
          <div className="hdr-btns">
            <button className="btn-cancel" onClick={onCancel}><X size={15} /> Cancel</button>
            <button className="btn-trash"><Trash2 size={17} /></button>
          </div>
        </div>

        <div className="modal-body">
          <div className="card modal-left">
            <div className="card-hdr">
              <h2 className="card-title">Module Adoption Trends</h2>
              <div className="legend">
                <div className="leg-item"><span className="dot dot-blue" /> Current</div>
                <div className="leg-item"><span className="dot dot-gray" /> 3mo Ago</div>
              </div>
            </div>

            <table className="edit-table">
              <thead>
                <tr>
                  <th>Module</th>
                  <th>CURRENT %</th>
                  <th>3MO AGO %</th>
                </tr>
              </thead>
              <tbody>
                {draft.map(m => (
                  <tr key={m.name}>
                    <td className="edit-mod-name">{m.name}</td>
                    <td>
                      <input
                        type="number"
                        className="edit-input"
                        value={m.current}
                        min={0} max={100}
                        onChange={e => update(m.name, 'current', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="edit-input"
                        value={m.prev}
                        min={0} max={100}
                        onChange={e => update(m.name, 'prev', e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              className={`btn-save-modal ${saveStatus === 'ok' ? 'save-ok' : saveStatus === 'error' ? 'save-err' : ''}`}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving…'
                : saveStatus === 'ok' ? '✓ Saved to Sheets'
                : saveStatus === 'local' ? '✓ Saved locally'
                : saveStatus === 'error' ? '✗ Error – try again'
                : <><Save size={15} /> Save Changes</>}
            </button>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h2 className="card-title">Strategic Insights</h2>
            {isChurnRisk ? (
              <div className="churn-box">
                <div className="churn-title"><AlertTriangle size={15} /> Churn Risk Detect</div>
                <p className="churn-desc">
                  Usage metrics dropped by {Math.abs(stats.trend)}.0%. Schedule a CS check-in.
                </p>
              </div>
            ) : (
              <div className="momentum-box">
                <div className="momentum-title"><TrendingUp size={15} /> Upward Momentum</div>
                <p className="momentum-desc">
                  Adoption increased by {stats.trend}% in the last quarter.
                </p>
              </div>
            )}
            <div className="checklist-box">
              <div className="checklist-title">Action Checklist</div>
              <div className="check-item"><div className="check-dot" /> Run {stats.gapModule} training session</div>
              <div className="check-item"><div className="check-dot" /> Review Q3 goals with stakeholder</div>
            </div>
            <div className="live-stats-box">
              <div className="live-stat"><span className="live-lbl">Live Avg</span><span className="live-val">{stats.avgAdoption}%</span></div>
              <div className="live-stat"><span className="live-lbl">Trend</span><span className={`live-val ${stats.trend >= 0 ? 'delta-up' : 'delta-down'}`}>{stats.trend >= 0 ? '+' : ''}{stats.trend}%</span></div>
              <div className="live-stat"><span className="live-lbl">Highest</span><span className="live-val">{stats.highestModule}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────── APP ── */
export default function App() {
  const navigate = useNavigate();
  const [all, setAll]         = useState([]);
  const [sel, setSel]         = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery]     = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchData().then(data => {
      setAll(data);
      if (data.length) setSel(data[0]);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(
    () => all.filter(c => c.name.toLowerCase().includes(query.toLowerCase())),
    [all, query]
  );

  function handleSaveEdit(newModules, newStats) {
    const updated = { ...sel, modules: newModules, ...newStats };
    setAll(prev => prev.map(c => c.name === sel.name ? updated : c));
    setSel(updated);
    setEditing(false);
  }

  if (loading) return null;

  const gapMod = sel.modules.find(m => m.name === sel.gapModule);

  return (
    <div className="app">
      <Sidebar 
        customers={filtered} 
        selected={sel} 
        onSelect={setSel} 
        query={query} 
        onQuery={setQuery} 
        onNavigateVortex={() => navigate('/vortex')} 
        onNavigateGantt={() => navigate('/gantt')} 
        onNavigateBudget={() => navigate('/budget')}
        onNavigateLeads={() => navigate('/leads')}
      />

      <main className="main">
        <header className="pg-header">
          <div>
            <div className="pg-title-row">
              <h1 className="pg-title">{sel.name}</h1>
              <span className={`badge badge-${sel.status.toLowerCase()}`}>{sel.status} Adoption</span>
            </div>
            <p className="pg-sub">Detailed product utilization analysis</p>
          </div>
          <div className="hdr-btns">
            <button className="btn-edit" onClick={() => setEditing(true)}><Edit3 size={16} /> Edit Metrics</button>
            <button className="btn-trash"><Trash2 size={17} /></button>
          </div>
        </header>

        <div className="stat-grid">
          <StatCard label="Avg. Adoption"    value={`${sel.avgAdoption}%`}  delta={sel.trend}  sub="Overall product stickiness" Icon={BarChart3} icClass="si-blue" />
          <StatCard label="Highest Adoption" value={sel.highestModule} sub={`${sel.highestValue}% utilized`} Icon={CheckCircle2} icClass="si-green" />
          <StatCard label="Largest Gap"      value={sel.gapModule} sub={`${gapMod?.current}% (Needs attention)`} Icon={AlertCircle} icClass="si-red" />
        </div>

        <div className="content-row">
          <div className="card">
            <div className="card-hdr">
              <h2 className="card-title">Module Adoption Trends</h2>
              <div className="legend">
                <div className="leg-item"><span className="dot dot-blue" /> Current</div>
                <div className="leg-item"><span className="dot dot-gray" /> 3mo Ago</div>
              </div>
            </div>
            {sel.modules.map(m => <ModRow key={m.name} mod={m} />)}
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 className="card-title">Strategic Insights</h2>
            <div className="momentum-box">
              <div className="momentum-title"><TrendingUp size={15} /> Upward Momentum</div>
              <p className="momentum-desc">Adoption has increased by {sel.trend}% in the last quarter. Excellent stickiness.</p>
            </div>
            <div className="checklist-box">
              <div className="checklist-title">Action Checklist</div>
              <div className="check-item"><div className="check-dot" /> Review Q3 goals with stakeholder</div>
              <div className="check-item"><div className="check-dot" /> Schedule training for {sel.gapModule}</div>
            </div>
            <button className="btn-report">Download Full Report <ArrowRight size={16} /></button>
          </div>
        </div>

        <div className="card portfolio-card">
          <div className="port-hdr">
            <h3 className="card-title">Portfolio Comparisons</h3>
            <span className="port-sub">Top Performers Highlighted</span>
          </div>
          <table className="port-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Avg. Adoption</th>
                <th>Core Strength</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {all.slice(0, 5).map(c => (
                <tr key={c.name}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td>
                    <div className="mini-bar-wrap">
                      <div className="mini-bar-bg"><div className="mini-bar-fill" style={{ width: `${c.avgAdoption}%` }} /></div>
                      {c.avgAdoption}%
                    </div>
                  </td>
                  <td>{c.highestModule}</td>
                  <td className={`port-trend ${c.trend >= 0 ? 'port-up' : 'port-down'}`}>
                    {c.trend >= 0 ? '↑' : '↓'} {Math.abs(c.trend)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {editing && (
        <EditModal
          customer={sel}
          onSave={handleSaveEdit}
          onCancel={() => setEditing(false)}
        />
      )}
    </div>
  );
}
