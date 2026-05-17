import React, { useState, useRef } from 'react';
import { AuditNoteBounds } from '../core/types';

interface Props {
  screenshotUri: string;
  onConfirm: (bounds: AuditNoteBounds, annotatedUri: string) => void;
  onCancel: () => void;
}

export function AuditSelector({ screenshotUri, onConfirm, onCancel }: Props) {
  const [box, setBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [burning, setBurning] = useState(false);
  const startPos = useRef<{ x: number; y: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    startPos.current = { x: e.clientX, y: e.clientY };
    setBox({ x: e.clientX, y: e.clientY, w: 0, h: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!startPos.current) return;
    const { x, y } = startPos.current;
    const dx = e.clientX - x;
    const dy = e.clientY - y;
    setBox({
      x: dx < 0 ? x + dx : x,
      y: dy < 0 ? y + dy : y,
      w: Math.abs(dx),
      h: Math.abs(dy),
    });
  };

  const handleMouseUp = () => {
    startPos.current = null;
  };

  const handleConfirm = async () => {
    if (!box || box.w < 10 || box.h < 10) return;
    setBurning(true);
    
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        ctx.strokeStyle = '#f6e05e';
        ctx.lineWidth = 6;
        ctx.strokeRect(box.x, box.y, box.w, box.h);
        ctx.fillStyle = 'rgba(246,224,94,0.2)';
        ctx.fillRect(box.x, box.y, box.w, box.h);
        onConfirm({ x: box.x, y: box.y, width: box.w, height: box.h }, canvas.toDataURL('image/png'));
      }
      setBurning(false);
    };
    img.src = screenshotUri;
  };

  const hasBox = box && box.w > 10 && box.h > 10;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 10000,
      userSelect: 'none',
      cursor: 'crosshair',
    }}>
      <img 
        src={screenshotUri} 
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'fill' }} 
        alt=""
      />
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.45)', pointerEvents: 'none' }} />
      {box && (
        <div style={{
          position: 'absolute',
          left: box.x,
          top: box.y,
          width: box.w,
          height: box.h,
          border: '3px solid #f6e05e',
          backgroundColor: 'rgba(246,224,94,0.15)',
          pointerEvents: 'none',
          zIndex: 2,
        }} />
      )}
      <div 
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }} 
      />
      <div style={{
        position: 'absolute',
        top: '56px',
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 3,
      }}>
        <div style={{
          color: 'white',
          fontSize: '15px',
          fontWeight: 600,
          backgroundColor: 'rgba(0,0,0,0.55)',
          padding: '8px 16px',
          borderRadius: '20px',
          fontFamily: 'sans-serif'
        }}>
          {hasBox ? 'Seçim tamam — onayla veya yeniden çiz' : 'Sorunlu alanı işaretle'}
        </div>
      </div>
      <div style={{
        position: 'absolute',
        bottom: '48px',
        left: '24px',
        right: '24px',
        display: 'flex',
        gap: '12px',
        zIndex: 10,
      }}>
        <button
          onClick={(e) => { e.stopPropagation(); onCancel(); }}
          style={{
            flex: 1,
            padding: '15px 0',
            borderRadius: '14px',
            backgroundColor: 'rgba(0,0,0,0.6)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.2)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          İptal
        </button>
        {hasBox && (
          <button
            onClick={(e) => { e.stopPropagation(); handleConfirm(); }}
            disabled={burning}
            style={{
              flex: 2,
              padding: '15px 0',
              borderRadius: '14px',
              backgroundColor: '#e53e3e',
              color: 'white',
              border: 'none',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {burning ? 'İşleniyor...' : 'Devam →'}
          </button>
        )}
      </div>
    </div>
  );
}
