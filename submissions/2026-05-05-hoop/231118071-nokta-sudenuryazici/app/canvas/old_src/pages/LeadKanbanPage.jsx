import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, MoreVertical, User, 
  Building2, Edit2, Trash2, Layout,
  CheckCircle2, Clock, MessageSquare, AlertCircle, RefreshCw
} from 'lucide-react';
import { fetchLeads, updateLeadStatus } from '../services/leadDataService';

const COLUMNS = [
  { id: 'NOT_STARTED', label: 'NOT STARTED', color: '#64748B' },
  { id: 'CONTACTED', label: 'CONTACTED', color: '#0EA5E9' },
  { id: 'SCHEDULING', label: 'SCHEDULING', color: '#F59E0B' },
  { id: 'NOT_INTERESTED', label: 'NOT INTERESTED', color: '#EF4444' }
];

export default function LeadKanbanPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [draggingId, setDraggingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchLeads().then(data => {
      setLeads(data);
      setLoading(false);
    });
  }, []);

  const filteredLeads = useMemo(() => {
    return leads.filter(l => l.name.toLowerCase().includes(search.toLowerCase()));
  }, [leads, search]);

  const handleDragStart = (id) => setDraggingId(id);
  
  const handleDrop = async (status) => {
    if (!draggingId) return;
    
    setIsSaving(true);
    setLeads(prev => prev.map(l => l.id === draggingId ? { ...l, status } : l));
    
    const lead = leads.find(l => l.id === draggingId);
    await updateLeadStatus(lead.name, status);
    
    setTimeout(() => setIsSaving(false), 800);
    setDraggingId(null);
  };

  if (loading) return null;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>
      {/* --- HEADER --- */}
      <header style={{ 
        padding: '24px 40px', background: '#fff', borderBottom: '1px solid #E2E8F0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', background: '#4F46E5', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Layout size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Lead Pipeline</h1>
              <span style={{ padding: '4px 12px', background: '#F1F5F9', borderRadius: '20px', fontSize: '12px', fontWeight: 600, color: '#64748B' }}>
                {leads.length} Leads
              </span>
              {isSaving && (
                <span style={{ fontSize: '12px', color: '#4F46E5', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Syncing to Sheets...
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input 
              type="text" 
              placeholder="Search leads..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ 
                padding: '10px 12px 10px 36px', width: '280px', borderRadius: '10px', 
                border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px'
              }}
            />
          </div>
          <button style={{ 
            background: '#4F46E5', color: '#fff', border: 'none', padding: '10px 20px', 
            borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <Plus size={18} /> New Lead
          </button>
        </div>
      </header>

      {/* --- KANBAN BOARD --- */}
      <main style={{ 
        flex: 1, padding: '32px 40px', display: 'flex', gap: '24px', 
        overflowX: 'auto', overflowY: 'hidden' 
      }}>
        {COLUMNS.map(col => (
          <Column 
            key={col.id} 
            col={col} 
            leads={filteredLeads.filter(l => l.status === col.id)}
            onDragStart={handleDragStart}
            onDrop={() => handleDrop(col.id)}
          />
        ))}
      </main>
    </div>
  );
}

function Column({ col, leads, onDragStart, onDrop }) {
  const [isOver, setIsOver] = useState(false);

  return (
    <div 
      onDragOver={e => { e.preventDefault(); setIsOver(true); }}
      onDragLeave={() => setIsOver(false)}
      onDrop={() => { setIsOver(false); onDrop(); }}
      style={{ 
        display: 'flex', flexDirection: 'column', gap: '16px', 
        width: '320px', minWidth: '320px', // Fixed width to ensure 4 columns fit
        padding: '12px', borderRadius: '16px', background: isOver ? '#F1F5F9' : '#F1F5F966',
        transition: 'background 0.2s', height: '100%'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#1E293B', letterSpacing: '0.02em' }}>{col.label}</span>
          <span style={{ padding: '2px 8px', background: '#fff', borderRadius: '12px', fontSize: '11px', fontWeight: 700, color: '#64748B', border: '1px solid #E2E8F0' }}>
            {leads.length}
          </span>
        </div>
        <MoreVertical size={16} style={{ color: '#94A3B8', cursor: 'pointer' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', paddingRight: '4px' }}>
        {leads.map(lead => (
          <LeadCard key={lead.id} lead={lead} onDragStart={() => onDragStart(lead.id)} color={col.color} />
        ))}
        {leads.length === 0 && (
          <div style={{ padding: '20px', textAlign: 'center', color: '#94A3B8', fontSize: '12px', fontStyle: 'italic', border: '1px dashed #E2E8F0', borderRadius: '12px' }}>
            No leads in this stage
          </div>
        )}
      </div>
    </div>
  );
}

function LeadCard({ lead, onDragStart, color }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      draggable
      onDragStart={onDragStart}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        background: '#fff', borderRadius: '12px', padding: '20px', 
        border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
        cursor: 'grab', position: 'relative', transition: 'all 0.2s'
      }}
    >
      {/* Top Actions */}
      {isHovered && (
        <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px' }}>
          <Edit2 size={14} style={{ color: '#94A3B8', cursor: 'pointer' }} />
          <Trash2 size={14} style={{ color: '#F87171', cursor: 'pointer' }} />
        </div>
      )}

      {/* Status Badge */}
      <div style={{ 
        display: 'inline-flex', padding: '4px 10px', borderRadius: '6px', 
        background: `${color}15`, color: color, fontSize: '10px', fontWeight: 800, 
        letterSpacing: '0.02em', marginBottom: '12px', textTransform: 'uppercase'
      }}>
        {lead.status.replace(/_/g, ' ')}
      </div>

      <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginBottom: '16px' }}>
        {lead.name}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 8px', 
            borderRadius: '6px', background: lead.type === 'SMB' ? '#DCFCE7' : '#F3E8FF',
            color: lead.type === 'SMB' ? '#166534' : '#6B21A8', fontSize: '11px', fontWeight: 700
          }}>
            <Building2 size={12} />
            {lead.type}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '13px', fontWeight: 500 }}>
          <User size={14} />
          {lead.agent}
        </div>
      </div>
    </div>
  );
}
