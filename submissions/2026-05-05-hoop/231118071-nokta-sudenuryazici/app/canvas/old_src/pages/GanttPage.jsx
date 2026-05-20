import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Filter, Trash2, Calendar, LayoutGrid, X, ChevronDown, Check } from 'lucide-react';
import { fetchGanttData, updateTask } from '../services/ganttDataService';

const STATUS_COLORS = {
  'Done':        { bar: '#22C55E', light: '#DCFCE7', text: '#15803D' },
  'In Progress': { bar: '#3B82F6', light: '#DBEAFE', text: '#1D4ED8' },
  'Not Started': { bar: '#F97316', light: '#FFEDD5', text: '#C2410C' },
  'Blocked':     { bar: '#EF4444', light: '#FEE2E2', text: '#B91C1C' },
};

const DAY_ABBR = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const MONTHS   = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function fmtDate(d) {
  if (!d) return '';
  return `${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}/${d.getFullYear()}`;
}

function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate()+n); return r; }

/* ── Update Task Modal ── */
function TaskModal({ task, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({
    name: task.name,
    startDate: task.startDate ? task.startDate.toISOString().split('T')[0] : '',
    endDate:   task.endDate   ? task.endDate.toISOString().split('T')[0]   : '',
    status:    task.status,
    owner:     task.owner,
    description: task.description,
  });
  const [saveStatus, setSaveStatus] = useState(null); // null | 'saving' | 'ok' | 'local'

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSave() {
    setSaveStatus('saving');
    const updated = {
      ...task,
      name: form.name,
      startDate: form.startDate ? new Date(form.startDate) : null,
      endDate:   form.endDate   ? new Date(form.endDate)   : null,
      status: form.status,
      owner:  form.owner,
      description: form.description,
    };
    const result = await onSave(updated);       // updates task list + calls Sheets
    setSaveStatus(result?.local ? 'local' : 'ok');
    setTimeout(() => { setSaveStatus(null); onClose(); }, 1200); // then close
  }

  const inputStyle = { width:'100%', padding:'10px 12px', border:'1.5px solid #E2E8F0', borderRadius:'8px', fontSize:'14px', fontWeight:600, color:'#0F172A', outline:'none', background:'#fff' };
  const labelStyle = { fontSize:'11px', fontWeight:700, color:'#94A3B8', letterSpacing:'0.05em', display:'block', marginBottom:'6px' };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.5)', backdropFilter:'blur(4px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}>
      <div style={{ background:'#fff', borderRadius:'20px', width:'100%', maxWidth:'480px', padding:'28px', boxShadow:'0 20px 60px rgba(0,0,0,0.18)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <div style={{ width:38, height:38, background:'#EEF2FF', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <LayoutGrid size={18} style={{ color:'#4F46E5' }} />
            </div>
            <h2 style={{ fontSize:'20px', fontWeight:700, color:'#0F172A' }}>Update Task</h2>
          </div>
          <button onClick={onClose} style={{ border:'none', background:'none', cursor:'pointer', color:'#94A3B8' }}><X size={20}/></button>
        </div>

        <label style={labelStyle}>TASK NAME</label>
        <div style={{ fontSize:'18px', fontWeight:700, color:'#0F172A', marginBottom:'20px' }}>{form.name}</div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'18px' }}>
          <div>
            <label style={labelStyle}><Calendar size={11} style={{display:'inline',marginRight:4}}/>START DATE</label>
            <div style={{ position:'relative' }}>
              <input type="date" value={form.startDate ? new Date(form.startDate).toISOString().split('T')[0] : ''} onChange={e => set('startDate', e.target.value)} style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}><Calendar size={11} style={{display:'inline',marginRight:4}}/>END DATE</label>
            <input type="date" value={form.endDate ? new Date(form.endDate).toISOString().split('T')[0] : ''} onChange={e => set('endDate', e.target.value)} style={inputStyle} />
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'18px' }}>
          <div>
            <label style={labelStyle}>STATUS</label>
            <div style={{ position:'relative' }}>
              <select value={form.status} onChange={e => set('status', e.target.value)}
                style={{ ...inputStyle, appearance:'none', paddingRight:'32px', cursor:'pointer' }}>
                {['Not Started','In Progress','Done','Blocked'].map(s => <option key={s}>{s}</option>)}
              </select>
              <ChevronDown size={14} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', color:'#64748B', pointerEvents:'none' }} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>OWNER</label>
            <div style={{ fontSize:'16px', fontWeight:600, color:'#1E293B', padding:'10px 0' }}>{form.owner}</div>
          </div>
        </div>

        <label style={labelStyle}>DESCRIPTION</label>
        <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
          style={{ ...inputStyle, resize:'vertical', fontWeight:400, lineHeight:1.6 }} />

        <div style={{ display:'flex', gap:'12px', marginTop:'24px' }}>
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            style={{
              flex:1, padding:'14px',
              background: saveStatus === 'ok' ? '#22C55E' : saveStatus === 'local' ? '#F97316' : '#2563EB',
              color:'#fff', border:'none', borderRadius:'12px', fontSize:'16px', fontWeight:700, cursor:'pointer',
              transition:'background 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'
            }}>
            {saveStatus === 'saving' ? 'Saving…'
              : saveStatus === 'ok'    ? <><Check size={16}/> Saved to Sheets</>
              : saveStatus === 'local' ? 'Saved locally'
              : 'Save Changes'}
          </button>
          <button onClick={() => onDelete(task.id)} style={{ width:52, padding:'14px', background:'#FEF2F2', color:'#EF4444', border:'none', borderRadius:'12px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Trash2 size={18}/>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── MAIN GANTT PAGE ── */
export default function GanttPage() {
  const navigate   = useNavigate();
  const scrollRef  = useRef(null);
  const [tasks, setTasks]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [scale, setScale]         = useState(20);  // px per day
  const [filter, setFilter]       = useState('All Statuses');
  const [editTask, setEditTask]   = useState(null);
  const [tooltip, setTooltip]     = useState(null);

  useEffect(() => {
    fetchGanttData().then(d => { setTasks(d); setLoading(false); });
  }, []);

  // Timeline bounds
  const { timelineStart, totalDays, months } = useMemo(() => {
    const valid = tasks.filter(t => t.startDate && t.endDate);
    if (!valid.length) return { timelineStart: new Date(2025,8,1), totalDays: 120, months: [] };

    const minD = new Date(Math.min(...valid.map(t => t.startDate)));
    const maxD = new Date(Math.max(...valid.map(t => t.endDate)));
    minD.setDate(minD.getDate() - 5);
    maxD.setDate(maxD.getDate() + 10);
    const total = Math.ceil((maxD - minD) / 86400000) + 1;

    // Build month groups
    const ms = [];
    let cur = new Date(minD);
    while (cur <= maxD) {
      const mo = { label: `${MONTHS[cur.getMonth()]} ${cur.getFullYear()}`, startIdx: Math.floor((cur - minD)/86400000), days: 0 };
      const lastDay = new Date(cur.getFullYear(), cur.getMonth()+1, 0);
      const end = lastDay > maxD ? maxD : lastDay;
      mo.days = Math.floor((end - cur)/86400000) + 1;
      ms.push(mo);
      cur = new Date(cur.getFullYear(), cur.getMonth()+1, 1);
    }

    return { timelineStart: minD, totalDays: total, months: ms };
  }, [tasks]);

  const filteredTasks = useMemo(() =>
    filter === 'All Statuses' ? tasks : tasks.filter(t => t.status === filter),
  [tasks, filter]);

  const unscheduled = tasks.filter(t => !t.startDate || !t.endDate).length;

  function taskBar(task) {
    if (!task.startDate || !task.endDate) return null;
    const left  = Math.floor((task.startDate - timelineStart) / 86400000) * scale;
    const width = Math.max((Math.floor((task.endDate - task.startDate)/86400000)+1) * scale, scale);
    const col   = STATUS_COLORS[task.status] || STATUS_COLORS['Not Started'];
    return { left, width, col };
  }

  async function saveTask(updated) {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    const result = await updateTask(updated);
    // Don't close modal here — modal controls its own closing after showing status
    return result;
  }

  function deleteTask(id) {
    setTasks(prev => prev.filter(t => t.id !== id));
    setEditTask(null);
  }

  const ROW_H  = 56;
  const SIDE_W = 220;
  const HDR_H  = 60;
  const totalW = totalDays * scale;

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontFamily:'Inter,sans-serif', color:'#64748B' }}>Loading…</div>
  );

  return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', fontFamily:'Inter,sans-serif', background:'#F8FAFC', overflow:'hidden' }}>

      {/* ── TOP BAR ── */}
      <div style={{ height:56, background:'#fff', borderBottom:'1px solid #E2E8F0', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', flexShrink:0, zIndex:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
          <button onClick={() => navigate('/')} style={{ display:'flex', alignItems:'center', gap:'6px', border:'none', background:'none', cursor:'pointer', color:'#64748B', fontSize:'13px', fontWeight:600 }}>
            <ArrowLeft size={15}/> Back
          </button>
          <span style={{ color:'#E2E8F0' }}>|</span>
          <LayoutGrid size={17} style={{ color:'#2563EB' }}/>
          <span style={{ fontSize:'16px', fontWeight:700, color:'#0F172A' }}>Project Timeline</span>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          {/* Filter */}
          <div style={{ display:'flex', alignItems:'center', gap:'6px', border:'1px solid #E2E8F0', borderRadius:'8px', padding:'6px 12px', background:'#fff', position:'relative' }}>
            <Filter size={13} style={{ color:'#64748B' }}/>
            <select value={filter} onChange={e => setFilter(e.target.value)}
              style={{ border:'none', outline:'none', fontSize:'13px', fontWeight:600, color:'#0F172A', background:'transparent', cursor:'pointer' }}>
              {['All Statuses','Not Started','In Progress','Done','Blocked'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Scale */}
          <div style={{ display:'flex', alignItems:'center', gap:'0', border:'1px solid #E2E8F0', borderRadius:'8px', overflow:'hidden', background:'#fff' }}>
            {[10, 14, 20].map(s => (
              <button key={s} onClick={() => setScale(s)}
                style={{ padding:'6px 11px', border:'none', borderRight:'1px solid #E2E8F0', background: scale===s ? '#F1F5F9' : '#fff', fontSize:'12px', fontWeight:700, color: scale===s ? '#0F172A' : '#64748B', cursor:'pointer' }}>
                {s}px
              </button>
            ))}
          </div>

          {/* Unscheduled */}
          <div style={{ display:'flex', alignItems:'center', gap:'8px', border:'1px solid #E2E8F0', borderRadius:'8px', padding:'6px 14px', background:'#fff', fontSize:'13px', fontWeight:600, color:'#475569' }}>
            Unscheduled <span style={{ background:'#F1F5F9', borderRadius:'20px', padding:'1px 8px', fontSize:'12px', fontWeight:700, color:'#64748B' }}>{unscheduled}</span>
          </div>

          <button style={{ display:'flex', alignItems:'center', gap:'6px', padding:'8px 18px', background:'#2563EB', color:'#fff', border:'none', borderRadius:'8px', fontWeight:700, fontSize:'13px', cursor:'pointer' }}>
            <Plus size={15}/> Add Task
          </button>
        </div>
      </div>

      {/* ── BODY: sidebar + timeline ── */}
      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>

        {/* Sidebar */}
        <div style={{ width:SIDE_W, flexShrink:0, background:'#fff', borderRight:'1px solid #E2E8F0', display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ height:HDR_H, borderBottom:'1px solid #F1F5F9', display:'flex', alignItems:'flex-end', padding:'0 16px 10px', flexShrink:0 }}>
            <span style={{ fontSize:'10px', fontWeight:800, color:'#94A3B8', letterSpacing:'0.06em' }}>TASK DEFINITION</span>
          </div>
          <div style={{ overflowY:'auto', flex:1 }}>
            {filteredTasks.map(t => (
              <div key={t.id} style={{ height:ROW_H, borderBottom:'1px solid #F8FAFC', display:'flex', flexDirection:'column', justifyContent:'center', padding:'0 16px' }}>
                <div style={{ fontSize:'13px', fontWeight:700, color:'#0F172A', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{t.name}</div>
                <div style={{ fontSize:'11px', color:'#94A3B8', display:'flex', alignItems:'center', gap:'4px', marginTop:'2px' }}>
                  <span style={{ fontSize:'10px' }}>👤</span> {t.owner}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div ref={scrollRef} style={{ flex:1, overflowX:'auto', overflowY:'auto', position:'relative' }}>
          {/* Sticky header */}
          <div style={{ position:'sticky', top:0, zIndex:10, background:'#fff', borderBottom:'1px solid #E2E8F0', width: totalW, minWidth:'100%' }}>
            {/* Month row */}
            <div style={{ display:'flex', height:28, borderBottom:'1px solid #F1F5F9' }}>
              {months.map((m, i) => (
                <div key={i} style={{ width: m.days * scale, flexShrink:0, borderRight:'1px solid #F1F5F9', display:'flex', alignItems:'center', paddingLeft:8, fontSize:'11px', fontWeight:700, color:'#475569', background: i%2===0 ? '#FAFAFA' : '#fff' }}>
                  {m.label}
                </div>
              ))}
            </div>
            {/* Day number row */}
            <div style={{ display:'flex', height:18, borderBottom:'1px solid #F1F5F9' }}>
              {Array.from({ length: totalDays }, (_, i) => {
                const d = addDays(timelineStart, i);
                return (
                  <div key={i} style={{ width:scale, flexShrink:0, fontSize:'9px', fontWeight:600, color:'#94A3B8', display:'flex', alignItems:'center', justifyContent:'center', borderRight:'1px solid #F8FAFC' }}>
                    {scale >= 14 ? String(d.getDate()).padStart(2,'0') : (i%2===0 ? String(d.getDate()).padStart(2,'0') : '')}
                  </div>
                );
              })}
            </div>
            {/* Day abbr row */}
            <div style={{ display:'flex', height:14 }}>
              {Array.from({ length: totalDays }, (_, i) => {
                const d = addDays(timelineStart, i);
                return (
                  <div key={i} style={{ width:scale, flexShrink:0, fontSize:'8px', fontWeight:600, color:'#CBD5E1', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {scale >= 14 ? DAY_ABBR[d.getDay()].slice(0,3) : ''}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Task rows */}
          <div style={{ width: totalW, minWidth:'100%' }}>
            {filteredTasks.map(t => {
              const bar = taskBar(t);
              return (
                <div key={t.id} style={{ height:ROW_H, borderBottom:'1px solid #F8FAFC', position:'relative', display:'flex', alignItems:'center' }}>
                  {/* Dot grid background */}
                  <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle, #E2E8F0 1px, transparent 1px)', backgroundSize:'20px 20px', opacity:0.5 }} />

                  {bar && (
                    <div
                      onClick={() => setEditTask(t)}
                      onMouseEnter={e => setTooltip({ id: t.id, x: e.clientX, y: e.clientY })}
                      onMouseLeave={() => setTooltip(null)}
                      style={{
                        position:'absolute', left: bar.left, width: bar.width,
                        height:34, borderRadius:8,
                        background: bar.col.bar,
                        cursor:'pointer', display:'flex', alignItems:'center', paddingLeft:10,
                        boxShadow:'0 2px 8px rgba(0,0,0,0.12)',
                        transition:'transform 0.1s, box-shadow 0.1s',
                        zIndex:2,
                      }}
                      onMouseOver={e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.18)'; }}
                      onMouseOut={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.12)'; }}
                    >
                      <span style={{ width:8, height:8, borderRadius:'50%', background:'rgba(255,255,255,0.7)', display:'inline-block', flexShrink:0 }}/>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Tooltip */}
          {tooltip && (() => {
            const t = tasks.find(x => x.id === tooltip.id);
            if (!t) return null;
            const col = STATUS_COLORS[t.status] || STATUS_COLORS['Not Started'];
            return (
              <div style={{ position:'fixed', left: tooltip.x + 12, top: tooltip.y - 40, background:'#1E293B', color:'#fff', borderRadius:'8px', padding:'8px 12px', fontSize:'12px', fontWeight:600, pointerEvents:'none', zIndex:999, whiteSpace:'nowrap' }}>
                {t.name} • {t.status}
              </div>
            );
          })()}
        </div>
      </div>

      {editTask && (
        <TaskModal task={editTask} onSave={saveTask} onDelete={deleteTask} onClose={() => setEditTask(null)} />
      )}
    </div>
  );
}
