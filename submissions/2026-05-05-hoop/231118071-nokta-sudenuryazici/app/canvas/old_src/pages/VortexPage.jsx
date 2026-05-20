import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowLeft, Search, Filter, Plus, Pencil, Trash2, BarChart2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchVortexData } from '../services/vortexDataService';

const SENTIMENTS = [
  { key: 'negative', label: 'NEGATIVE', color: '#BE123C', bg: '#FFE4E6', min: 0,   max: 2   },
  { key: 'neutral',  label: 'NEUTRAL',  color: '#D97706', bg: '#FEF9C3', min: 2,   max: 3   },
  { key: 'solid',    label: 'SOLID',    color: '#2563EB', bg: '#DBEAFE', min: 3,   max: 4   },
  { key: 'positive', label: 'POSITIVE', color: '#16A34A', bg: '#DCFCE7', min: 4,   max: 5.1 },
];

function getSentimentKey(score) {
  if (score >= 4) return 'positive';
  if (score >= 3) return 'solid';
  if (score >= 2) return 'neutral';
  return 'negative';
}

function sentimentColor(score) {
  if (score >= 4) return { bg: '#DBEAFE', text: '#1D4ED8', border: '#BFDBFE' };
  if (score >= 3) return { bg: '#DCFCE7', text: '#15803D', border: '#BBF7D0' };
  if (score >= 2) return { bg: '#FEF9C3', text: '#B45309', border: '#FDE68A' };
  return           { bg: '#FFE4E6', text: '#BE123C', border: '#FECDD3' };
}

function scoreDot(score) {
  if (score >= 4) return '#2563EB';
  if (score >= 3) return '#16A34A';
  if (score >= 2) return '#D97706';
  return '#DC2626';
}

/* ── Word Cloud ── */
function WordCloud({ words, onSelect, selected }) {
  if (!words.length) return <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>No words match this filter.</div>;
  const max = words[0].count;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', padding: '8px 0' }}>
      {words.map(w => {
        const c = sentimentColor(w.avgScore);
        const fontSize = 12 + (w.count / max) * 20;
        const isActive = selected === w.word;
        return (
          <span
            key={w.word}
            onClick={() => onSelect(isActive ? null : w.word)}
            style={{
              display: 'inline-block', padding: '6px 14px', borderRadius: '30px',
              fontSize: `${fontSize}px`, fontWeight: 700, cursor: 'pointer',
              background: c.bg, color: c.text,
              border: `2px solid ${isActive ? c.text : c.border}`,
              boxShadow: isActive ? `0 0 0 3px ${c.text}40` : 'none',
              transition: 'all 0.15s', userSelect: 'none',
            }}
          >
            {w.word}
          </span>
        );
      })}
    </div>
  );
}

/* ── Score Dot ── */
function ScoreDot({ score }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 700, color: scoreDot(score), fontSize: '14px' }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: scoreDot(score), display: 'inline-block' }} />
      {score.toFixed(1)}
    </span>
  );
}

/* ── Feedback Table ── */
function FeedbackTable({ rows, keyword }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const kw = (keyword || '').toLowerCase();
    const sr = search.toLowerCase();
    return rows.filter(r => {
      const text = r.comment.toLowerCase();
      return (!kw || text.includes(kw)) && (!sr || text.includes(sr) || r.jobTitle.toLowerCase().includes(sr) || r.department.toLowerCase().includes(sr));
    });
  }, [rows, keyword, search]);

  function highlight(text, kw) {
    if (!kw) return text;
    const idx = text.toLowerCase().indexOf(kw.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark style={{ background: '#BFDBFE', color: '#1E3A5F', borderRadius: '2px', padding: '0 2px' }}>
          {text.slice(idx, idx + kw.length)}
        </mark>
        {text.slice(idx + kw.length)}
      </>
    );
  }

  return (
    <div className="vx-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid #F1F5F9' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
          {keyword ? `Feedback containing "${keyword}"` : 'All Feedback'} ({filtered.length} results)
        </h3>
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search comments..."
            style={{ padding: '7px 12px 7px 30px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#F8FAFC', width: '200px' }}
          />
        </div>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#F8FAFC' }}>
            {['EMPLOYEE', 'DEPARTMENT', 'SCORE', 'COMMENT', 'ACTIONS'].map(h => (
              <th key={h} style={{ padding: '12px 24px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.04em' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map(r => (
            <tr key={r.id} style={{ borderTop: '1px solid #F1F5F9' }}>
              <td style={{ padding: '16px 24px' }}>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#1E293B' }}>Emp #{r.id}</div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>{r.jobTitle}</div>
              </td>
              <td style={{ padding: '16px 24px' }}>
                <span style={{ background: '#F1F5F9', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>{r.department}</span>
              </td>
              <td style={{ padding: '16px 24px' }}><ScoreDot score={r.score} /></td>
              <td style={{ padding: '16px 24px', fontSize: '13px', color: '#334155', maxWidth: '320px' }}>
                {highlight(r.comment, keyword)}
              </td>
              <td style={{ padding: '16px 24px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94A3B8' }}><Pencil size={16} /></button>
                  <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94A3B8' }}><Trash2 size={16} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── MAIN PAGE ── */
export default function VortexPage() {
  const navigate = useNavigate();

  // ── ALL STATE FIRST (no hooks after any conditional) ──
  const [data, setData]                   = useState(null);
  const [loading, setLoading]             = useState(true);
  const [selectedWord, setSelectedWord]   = useState(null);
  const [deptFilter, setDeptFilter]       = useState('All');
  const [sentimentFilter, setSentFilter]  = useState(null);
  const tableRef = useRef(null);

  function handleWordSelect(word) {
    setSelectedWord(word);
    if (word && tableRef.current) {
      setTimeout(() => tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }
  }

  useEffect(() => {
    fetchVortexData().then(d => { setData(d); setLoading(false); });
  }, []);

  // Safe refs — empty arrays when data not loaded yet
  const rows  = data?.rows  ?? [];
  const words = data?.words ?? [];

  const filteredRows = useMemo(() =>
    rows.filter(r => {
      const deptOk = deptFilter === 'All' || r.department === deptFilter;
      const sentOk = !sentimentFilter || getSentimentKey(r.score) === sentimentFilter;
      return deptOk && sentOk;
    }),
  [rows, deptFilter, sentimentFilter]);

  const filteredWords = useMemo(() => {
    if (!sentimentFilter) return words;
    const s = SENTIMENTS.find(x => x.key === sentimentFilter);
    return s ? words.filter(w => w.avgScore >= s.min && w.avgScore < s.max) : words;
  }, [words, sentimentFilter]);

  function toggleSentiment(key) {
    setSentFilter(prev => prev === key ? null : key);
    setSelectedWord(null);
  }

  // ── EARLY RETURN after ALL hooks ──
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter, sans-serif', color: '#64748B', fontSize: '16px' }}>
        Loading…
      </div>
    );
  }

  const avgScore      = data.avgScore;
  const totalComments = data.totalComments;
  const uniqueWords   = words.length;
  const departments   = [...new Set(rows.map(r => r.department))].filter(Boolean);

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Top Bar ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '0 32px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '6px', border: 'none', background: 'none', cursor: 'pointer', color: '#64748B', fontSize: '13px', fontWeight: 600 }}>
            <ArrowLeft size={16} /> Back to Adoption Hub
          </button>
          <span style={{ color: '#E2E8F0' }}>|</span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>VortexLink Systems Product Adoption Dashboard</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '6px 12px', background: '#fff' }}>
            <Filter size={13} style={{ color: '#64748B' }} />
            <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: '13px', color: '#0F172A', background: 'transparent', fontWeight: 600, cursor: 'pointer' }}>
              <option>All</option>
              {departments.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#0047FF', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
            <Plus size={15} /> Add Feedback
          </button>
        </div>
      </div>

      <div style={{ padding: '32px 40px', maxWidth: '1300px', margin: '0 auto' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
          <div style={{ width: '40px', height: '40px', background: '#EEF2FF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart2 size={20} style={{ color: '#4F46E5' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', marginBottom: '2px' }}>Sentiment Cloud</h1>
            <p style={{ fontSize: '13px', color: '#64748B' }}>Employee Feedback Analysis</p>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '28px' }}>
          {[
            { icon: '😊', label: 'Avg Satisfaction', value: `${avgScore.toFixed(2)} / 5.0`, iconBg: '#FED7AA' },
            { icon: '💬', label: 'Total Comments',   value: String(totalComments),           iconBg: '#BFDBFE' },
            { icon: '📊', label: 'Unique Words',     value: String(uniqueWords),             iconBg: '#BBF7D0' },
          ].map(k => (
            <div key={k.label} style={{ background: '#fff', border: '1px solid #F1F5F9', borderRadius: '14px', padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: k.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                {k.icon}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, marginBottom: '6px' }}>{k.label}</div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', lineHeight: 1, whiteSpace: 'nowrap' }}>{k.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Word Cloud Card ── */}
        <div className="vx-card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A', marginBottom: '3px' }}>Word Sentiment Cloud</h2>
              <p style={{ fontSize: '12px', color: '#94A3B8' }}>Size = Frequency | Color = Average Sentiment</p>
            </div>
            {(sentimentFilter || selectedWord) && (
              <button onClick={() => { setSentFilter(null); setSelectedWord(null); }}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', border: '1px solid #E2E8F0', borderRadius: '8px', background: '#fff', fontSize: '12px', fontWeight: 600, color: '#64748B', cursor: 'pointer' }}>
                Clear all filters
              </button>
            )}
          </div>

          <WordCloud words={filteredWords} onSelect={handleWordSelect} selected={selectedWord} />

          {/* ── Sentiment Filter Bar ── */}
          <div style={{
            display: 'flex', gap: '12px', marginTop: '20px', paddingTop: '16px',
            borderTop: '1px solid #F1F5F9', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap'
          }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.06em' }}>SENTIMENT:</span>
            {SENTIMENTS.map(s => {
              const isActive = sentimentFilter === s.key;
              return (
                <button key={s.key} onClick={() => toggleSentiment(s.key)} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '5px 14px', borderRadius: '20px',
                  border: `2px solid ${isActive ? s.color : 'transparent'}`,
                  background: isActive ? s.bg : 'transparent',
                  cursor: 'pointer', fontSize: '11px', fontWeight: 700,
                  color: isActive ? s.color : '#64748B', transition: 'all 0.15s',
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, display: 'inline-block', flexShrink: 0 }} />
                  {s.label}
                  {isActive && <X size={10} style={{ marginLeft: '2px' }} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Feedback Table ── */}
        <div ref={tableRef} style={{ scrollMarginTop: '80px' }}>
          {selectedWord && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>Filtering by word:</span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '4px 12px', borderRadius: '20px',
                background: '#EEF2FF', color: '#4338CA',
                fontSize: '13px', fontWeight: 700,
              }}>
                "{selectedWord}"
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => setSelectedWord(null)} />
              </span>
            </div>
          )}
          <FeedbackTable rows={filteredRows} keyword={selectedWord} />
        </div>

      </div>
    </div>
  );
}
