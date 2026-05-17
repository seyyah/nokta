import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bug, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';
import { NoteManager } from '../core/storage';
import { buildMarkdown } from '../export/markdown';
import type { AuditNote, AuditNoteBounds } from '../core/types';
import { AuditSelector } from './AuditSelector';
import { AuditOverlay } from './AuditOverlay';

export function AuditWidget({ currentScreen }: { currentScreen: string }) {
  const [mode, setMode] = useState<'idle' | 'capturing' | 'selecting' | 'annotating' | 'list'>('idle');
  const [notes, setNotes] = useState<AuditNote[]>([]);
  const [capturedUri, setCapturedUri] = useState('');
  const [selectedBounds, setSelectedBounds] = useState<AuditNoteBounds | null>(null);
  const manager = useRef(new NoteManager()).current;

  const loadNotes = useCallback(async () => {
    const all = await manager.getAll();
    setNotes(all);
  }, [manager]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleCapture = async () => {
    setMode('capturing');
    try {
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
      });
      setCapturedUri(canvas.toDataURL('image/png'));
      setMode('selecting');
    } catch (e) {
      console.error('Capture failed', e);
      setMode('idle');
    }
  };

  const handleSelectionConfirm = (bounds: AuditNoteBounds, annotatedUri: string) => {
    setSelectedBounds(bounds);
    setCapturedUri(annotatedUri);
    setMode('annotating');
  };

  const handleSave = async (noteText: string) => {
    const newNote = {
      screenName: currentScreen,
      screenshot: capturedUri,
      screenshotAspect: window.innerHeight / window.innerWidth,
      highlightBounds: selectedBounds,
      note: noteText,
    };
    
    await manager.add(newNote);
    const allNotes = await manager.getAll();
    setNotes(allNotes);
    setMode('idle');
    setCapturedUri('');
    setSelectedBounds(null);
    
    // Auto-sync to forge-sync server
    try {
      const md = buildMarkdown(allNotes, { 
        appName: 'Nokta Dashboard', 
        exportedAt: new Date().toLocaleString(), 
        totalNotes: allNotes.length 
      });
      
      const response = await fetch('http://127.0.0.1:3001/save-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown: md })
      });

      if (response.ok) {
        console.log('✅ FORGE: Audit report synced automatically.');
        alert('Rapor başarıyla kaydedildi. Otonom Onarım Döngüsü başlatılıyor...');
      } else {

        throw new Error('Sync failed');
      }
    } catch (e) {
      console.error('❌ FORGE: Sync failed', e);
      alert('Senkronizasyon hatası! forge-sync.js çalışıyor mu?');
    }
    
    console.log(`%c⚡ FORGE_REPAIR_REQUEST: "${noteText}"`, 'color: #e53e3e; font-weight: bold;');
  };

  const handleExport = () => {
    const md = buildMarkdown(notes, { 
      appName: 'Nokta Dashboard', 
      exportedAt: new Date().toLocaleString(), 
      totalNotes: notes.length 
    });
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit-report.md';
    a.click();
  };

  return (
    <>
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
        {mode === 'idle' && (
          <button 
            onClick={handleCapture}
            style={{ 
              backgroundColor: '#ef4444', color: 'white', borderRadius: '50%', 
              width: '60px', height: '60px', border: 'none', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)', cursor: 'pointer'
            }}
          >
            <Bug size={30} />
          </button>
        )}

        <button 
          onClick={() => setMode(mode === 'list' ? 'idle' : 'list')}
          style={{ 
            position: 'fixed', bottom: '90px', right: '20px', backgroundColor: '#3b82f6', 
            color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px',
            cursor: 'pointer', zIndex: 9999
          }}
        >
          <FileText size={20} />
        </button>
      </div>

      {mode === 'selecting' && (
        <AuditSelector 
          screenshotUri={capturedUri} 
          onConfirm={handleSelectionConfirm}
          onCancel={() => setMode('idle')}
        />
      )}

      {mode === 'annotating' && (
        <AuditOverlay 
          screenshotUri={capturedUri}
          selectedBounds={selectedBounds}
          screenName={currentScreen}
          onSave={handleSave}
          onCancel={() => setMode('idle')}
        />
      )}

      {mode === 'list' && (
        <div style={{ 
          position: 'fixed', bottom: '140px', right: '20px', width: '300px', maxHeight: '400px', 
          backgroundColor: 'white', boxShadow: '0 4px 24px rgba(0,0,0,0.2)', borderRadius: '16px', 
          overflowY: 'auto', padding: '20px', zIndex: 10002, fontFamily: 'sans-serif'
        }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', fontWeight: 800 }}>Raporlar ({notes.length})</h3>
          {notes.length === 0 && <p style={{ fontSize: '14px', color: '#666' }}>Henüz rapor yok.</p>}
          {notes.map((n, i) => (
            <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid #eee', fontSize: '13px' }}>
              <div style={{ fontWeight: 700, color: '#e53e3e', marginBottom: '2px' }}>{n.screenName}</div>
              <div style={{ color: '#333' }}>{n.note}</div>
            </div>
          ))}
          {notes.length > 0 && (
            <button onClick={handleExport} style={{ width: '100%', marginTop: '20px', padding: '12px', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
              Markdown Olarak Dışa Aktar
            </button>
          )}
          <button onClick={() => setMode('idle')} style={{ width: '100%', marginTop: '10px', padding: '10px', backgroundColor: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}>
            Kapat
          </button>
        </div>
      )}
    </>
  );
}
