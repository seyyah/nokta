import { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import NoktaAvatar from './NoktaAvatar';
import Brain from './Brain';
import Voice from './Voice';

/* ─── STT helper ─── */
let recognition = null;
let resultReceived = false;
let isForcedStop = false;

function startSTT(onResult, onEnd) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { 
    alert('Ses tanıma sadece bilgisayarda Chrome/Edge, iPhone/iOS cihazlarda ise SADECE SAFARİ tarayıcısında çalışır. Lütfen Safari üzerinden açın.'); 
    return; 
  }
  recognition = new SR();
  recognition.lang = 'tr-TR';
  recognition.continuous = false;
  recognition.interimResults = false;
  resultReceived = false;
  isForcedStop = false;
  recognition.onresult = e => {
    resultReceived = true;
    onResult(e.results[0][0].transcript);
  };
  recognition.onerror = e => { 
    console.error('STT error:', e.error); 
    if (!isForcedStop) onEnd(); 
  };
  recognition.onend   = () => { 
    if (!resultReceived && !isForcedStop) onEnd(); 
  };
  recognition.start();
}
function stopSTT() { 
  isForcedStop = true;
  if (recognition) {
    try { recognition.stop(); } catch(e){}
    recognition = null;
  }
}

/* ─── Styles ─── */
const S = {
  root: {
    position: 'relative', width: '100%', height: '100dvh',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
    background: 'linear-gradient(160deg, #eef2ff 0%, #f0f9ff 100%)',
  },
  canvas: { position: 'absolute', inset: 0, zIndex: 0, transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' },
  
  // Floating Bottom UI (Pill shape)
  floatingBar: {
    position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)',
    width: '90%', maxWidth: 500,
    background: '#ffffff', borderRadius: 32,
    padding: '16px', display: 'flex', alignItems: 'center', gap: 16,
    boxShadow: '0 12px 40px rgba(0,0,0,0.1)', zIndex: 30,
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  micCircle: {
    width: 52, height: 52, borderRadius: 26, background: '#0044cc',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontSize: 22, flexShrink: 0,
    boxShadow: '0 8px 20px rgba(0,68,204,0.3)', cursor: 'pointer', border: 'none',
    transition: 'transform 0.1s',
  },
  micCircleActive: {
    background: '#dc2626',
    boxShadow: '0 8px 20px rgba(220,38,38,0.3)',
    animation: 'pulse 1.5s infinite',
  },
  textCol: { flex: 1, display: 'flex', flexDirection: 'column', gap: 2, cursor: 'default' },
  subtitle: { fontSize: 10, fontWeight: 800, color: '#9ca3af', letterSpacing: 0.5, textTransform: 'uppercase' },
  title: { fontSize: 14, fontWeight: 700, color: '#1f2937' },
  
  iconBtnRow: { display: 'flex', gap: 8 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 12, background: '#ffffff',
    border: '1.5px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#6b7280', fontSize: 18, cursor: 'pointer', transition: 'background 0.2s',
  },

  // Chat Overlay
  chatOverlay: {
    position: 'absolute', bottom: 100, left: '50%', transform: 'translateX(-50%) translateY(20px)',
    width: '90%', maxWidth: 500, height: 300,
    background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    zIndex: 20, display: 'flex', flexDirection: 'column',
    padding: '20px', opacity: 0, pointerEvents: 'none',
    transition: 'opacity 0.3s, transform 0.3s',
    borderRadius: 24,
    boxShadow: '0 8px 32px rgba(0,0,0,0.08)', border: '1px solid rgba(255,255,255,0.6)',
  },
  chatOverlayActive: { opacity: 1, pointerEvents: 'auto', transform: 'translateX(-50%) translateY(0)' },
  chat: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 },
  userBubble: {
    alignSelf: 'flex-end', background: '#2563eb', color: '#fff',
    padding: '12px 16px', borderRadius: '20px 20px 4px 20px',
    fontSize: 15, maxWidth: '85%', lineHeight: 1.45,
  },
  aiBubble: {
    alignSelf: 'flex-start', background: '#ffffff', color: '#1f2937',
    padding: '12px 16px', borderRadius: '20px 20px 20px 4px',
    fontSize: 15, maxWidth: '85%', lineHeight: 1.45,
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
  },
  expertBubble: {
    alignSelf: 'flex-start', background: '#ecfdf5', color: '#065f46',
    padding: '12px 16px', borderRadius: '20px 20px 20px 4px',
    fontSize: 15, maxWidth: '85%', lineHeight: 1.45,
    border: '1px solid #10b981',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
  },
  typing: { alignSelf: 'flex-start', background: '#ffffff', padding: '12px 16px', borderRadius: '20px 20px 20px 4px', fontSize: 18, letterSpacing: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
  
  inputWrap: {
    display: 'flex', alignItems: 'center',
    background: '#ffffff', border: '1.5px solid #e5e7eb',
    borderRadius: 24, padding: '0 8px 0 16px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
  },
  input: {
    flex: 1, border: 'none', background: 'transparent',
    fontSize: 15, color: '#111827', outline: 'none', padding: '14px 0',
  },
  sendBtn: {
    width: 36, height: 36, borderRadius: '50%', border: 'none',
    background: '#2563eb', color: '#fff', cursor: 'pointer',
    fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
};

/* ─── Mock Data ─── */
const articles = [
  { id: 1, icon: '🐶', title: 'Köpeklerde Beslenme Düzeni', summary: 'Yetişkin köpekler günde iki öğün beslenmelidir...', content: 'Yetişkin köpekler günde iki öğün beslenmelidir. Porsiyon kontrolü obeziteyi engeller. Özellikle kuru mama seçerken protein oranına dikkat etmelisiniz. Yaşına ve kilosuna uygun mama seçimi köpeğinizin ömrünü uzatır.' },
  { id: 2, icon: '🐱', title: 'Kediler Neden Mırlar?', summary: 'Mırlama sadece mutluluk değil, bazen stres belirtisi de olabilir...', content: 'Mırlama genellikle kedilerin mutlu ve güvende hissettiği anlamına gelse de, bazen stres, korku veya ağrı çektiklerinde kendilerini sakinleştirmek için de mırlayabilirler. Kedinizin vücut diline dikkat edin!' },
  { id: 3, icon: '🦜', title: 'Kuşlar İçin İdeal Kafes', summary: 'Kuş kafesi seçerken dikkat edilmesi gerekenler...', content: 'Kuşunuzun kanatlarını rahatça açabileceği, yatay telli kafesleri tercih etmelisiniz. Ayrıca kafesin doğrudan güneş veya cereyan almayan bir yere konması şarttır.' },
  { id: 4, icon: '🐰', title: 'Tavşan Bakımı Püf Noktaları', summary: 'Tavşanların en çok ihtiyaç duyduğu besin...', content: 'Tavşanların diyetinin %80 i kuru ottan (saman) oluşmalıdır. Dişlerinin sürekli uzamasını engellemek için ot yemeleri şarttır. Havuç sadece ödül olarak verilmelidir.' }
];

/* ─── Dashboard (Ana Ekran) Bileşeni ─── */
function HomeView({ onOpenChat }) {
  const [selectedArticle, setSelectedArticle] = useState(null);

  return (
    <div className="home-container">
      <h1 className="home-title">Patiler <span style={{fontSize: 28}}>🐾</span></h1>
      
      <div className="section-container">
        <h2 className="section-title">Benim Evcil Hayvanlarım</h2>
        <div className="pet-list">
           <div className="pet-card cat-card">
             <div className="pet-emoji">🐱</div>
             <div className="pet-name">Tarçın</div>
             <div className="pet-age">2 Yaşında</div>
           </div>
           <div className="pet-card dog-card">
             <div className="pet-emoji">🐶</div>
             <div className="pet-name">Max</div>
             <div className="pet-age">4 Aylık</div>
           </div>
           <div className="pet-card add-card">
             <span className="add-icon">+</span>
             <span className="add-text">Yeni Ekle</span>
           </div>
        </div>
      </div>

      <h2 className="section-title">Faydalı Bilgiler</h2>
      <div className="article-list">
        {articles.map(art => (
          <div key={art.id} className={`article-card ${selectedArticle === art.id ? 'expanded' : ''}`} onClick={() => setSelectedArticle(selectedArticle === art.id ? null : art.id)}>
            <div className="article-header">
              <span className="article-icon">{art.icon}</span>
              <span className="article-title">{art.title}</span>
            </div>
            <div className="article-content">
              {selectedArticle === art.id ? art.content : art.summary}
            </div>
            <div className="article-readmore">
              {selectedArticle === art.id ? 'Kapat ▲' : 'Devamını Oku ▼'}
            </div>
          </div>
        ))}
      </div>

      <button className="fab-button" onClick={onOpenChat}>
        <span>Uzmana Danış / Pati ile Konuş</span>
        <span className="fab-icon">👩‍⚕️</span>
      </button>
    </div>
  );
}

export default function App() {
  const [view, setView]             = useState('home'); // 'home' | 'chat'
  const [listening, setListening]   = useState(false);
  const [status, setStatus]         = useState('Konuşmak için mikrofona basın');
  const [chat, setChat]             = useState([]);
  const [input, setInput]           = useState('');
  const [typing, setTyping]         = useState(false);
  const [voiceMode, setVoiceMode]   = useState(false);
  const [showChat, setShowChat]     = useState(false);

  const chatRef = useRef();
  const voiceModeRef = useRef(voiceMode);
  
  useEffect(() => { voiceModeRef.current = voiceMode; }, [voiceMode]);
  useEffect(() => { chatRef.current?.scrollTo(0, 9999); }, [chat, typing, showChat]);

  const handleExpertReply = useCallback((expertText) => {
    setChat(p => [...p, { role: 'expert', text: expertText }]);
    setTyping(false);
  }, []);

  /* ─── STT callback ─── */
  const onTranscript = useCallback(async (transcript) => {
    setListening(false);
    if (!transcript?.trim()) {
      setStatus('Anlaşılamadı, tekrar deneyin');
      return;
    }
    setChat(p => [...p, { role: 'user', text: transcript }]);
    setTyping(true);
    setStatus('Pati düşünüyor...');
    
    // Auto-open chat if they spoke
    setShowChat(true);

    try {
      const reply = await Brain.sendMessage(transcript, () => {
        if (voiceModeRef.current) {
          setStatus('Sizi dinliyorum...');
          setTimeout(() => {
            if (voiceModeRef.current) startSTT(onTranscript, () => setListening(false));
          }, 400);
        } else {
          setStatus('Konuşmak için mikrofona basın');
        }
      }, handleExpertReply);
      setChat(p => [...p, { role: 'ai', text: reply }]);
      setStatus(voiceModeRef.current ? 'Konuşuyor...' : 'Konuşmak için mikrofona basın');
    } catch(err) {
      console.error('Brain error:', err);
      setStatus('Bağlantı hatası oluştu');
      setChat(p => [...p, { role: 'ai', text: 'Üzgünüm, bir sorun oluştu.' }]);
    } finally {
      setTyping(false);
    }
  }, []);

  /* ─── Mic toggle ─── */
  const toggleMic = () => {
    Voice.unlock(); // Unlock audio on first user interaction for iOS
    
    if (listening) {
      setVoiceMode(false);
      stopSTT();
      setListening(false);
      Voice.stop();
      setStatus('Konuşmak için mikrofona basın');
    } else {
      setVoiceMode(true);
      setListening(true);
      setStatus('Sizi dinliyorum...');
      startSTT(onTranscript, () => { 
        setListening(false); 
        setStatus(prev => prev === 'Sizi dinliyorum...' ? 'Konuşmak için mikrofona basın' : prev);
      });
    }
  };

  /* ─── Text send ─── */
  const sendText = async () => {
    Voice.unlock();
    const msg = input.trim();
    if (!msg) return;
    setInput('');
    setVoiceMode(false);
    setChat(p => [...p, { role: 'user', text: msg }]);
    setTyping(true);
    setStatus('Pati düşünüyor...');
    
    const reply = await Brain.sendMessage(msg, () => setStatus('Konuşmak için mikrofona basın'), handleExpertReply);
    setChat(p => [...p, { role: 'ai', text: reply }]);
    setTyping(false);
    if (reply.includes("iletiyorum!")) {
      setTyping(true);
      setStatus('Veteriner Zeynep yazıyor...');
    } else {
      setStatus('Konuşmak için mikrofona basın');
    }
  };

  if (view === 'home') {
    return (
      <>
        <style>{`
          body { margin: 0; background: linear-gradient(135deg, #fff0f5 0%, #e0f7fa 100%); }
          .home-container { padding: 40px 20px; min-height: 100dvh; max-width: 600px; margin: 0 auto; font-family: 'Inter', sans-serif; }
          .home-title { font-size: 36px; font-weight: 800; color: #ff6b81; margin-bottom: 30px; text-shadow: 0 2px 10px rgba(255,107,129,0.2); }
          .section-container { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(12px); border-radius: 24px; padding: 24px; margin-bottom: 30px; box-shadow: 0 8px 32px rgba(0,0,0,0.04); border: 1px solid rgba(255,255,255,0.6); }
          .section-title { font-size: 20px; font-weight: 800; margin-bottom: 20px; color: #2d3436; }
          .pet-list { display: flex; gap: 16px; overflow-x: auto; padding-bottom: 12px; }
          .pet-card { min-width: 120px; padding: 20px; border-radius: 24px; text-align: center; box-shadow: 0 4px 16px rgba(0,0,0,0.05); transition: transform 0.2s; cursor: pointer; }
          .pet-card:hover { transform: translateY(-4px); }
          .cat-card { background: linear-gradient(145deg, #ffeaa7, #fdcb6e); color: #2d3436; }
          .dog-card { background: linear-gradient(145deg, #81ecec, #00cec9); color: #2d3436; }
          .add-card { border: 3px dashed #b2bec3; background: transparent; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #636e72; box-shadow: none; }
          .add-card:hover { border-color: #ff6b81; color: #ff6b81; }
          .pet-emoji { font-size: 40px; margin-bottom: 10px; filter: drop-shadow(0 4px 4px rgba(0,0,0,0.1)); }
          .pet-name { font-weight: 800; font-size: 18px; margin-bottom: 4px; }
          .pet-age { font-size: 13px; opacity: 0.8; font-weight: 600; }
          .add-icon { font-size: 32px; font-weight: 300; }
          .add-text { font-size: 14px; font-weight: 600; margin-top: 6px; }
          
          .article-list { display: flex; flex-direction: column; gap: 20px; padding-bottom: 120px; }
          .article-card { background: #ffffff; border-radius: 24px; padding: 20px; box-shadow: 0 6px 20px rgba(0,0,0,0.04); cursor: pointer; transition: all 0.3s ease; border: 1px solid rgba(0,0,0,0.02); display: flex; flex-direction: column; }
          .article-card:hover { box-shadow: 0 10px 25px rgba(0,0,0,0.08); transform: translateY(-2px); }
          .article-card.expanded { background: linear-gradient(to bottom, #ffffff, #fdfbfb); border-color: #ff9ff3; box-shadow: 0 15px 40px rgba(255,159,243,0.15); }
          .article-header { display: flex; align-items: center; gap: 14px; margin-bottom: 12px; }
          .article-icon { font-size: 28px; background: #f1f2f6; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; border-radius: 14px; transition: 0.3s; }
          .article-card.expanded .article-icon { background: #ff9ff3; color: white; transform: scale(1.1); }
          .article-title { font-weight: 800; color: #2d3436; font-size: 16px; flex: 1; }
          .article-content { font-size: 14px; color: #636e72; line-height: 1.6; transition: all 0.3s; flex: 1; }
          .article-readmore { margin-top: 14px; font-size: 13px; font-weight: 700; color: #ff6b81; text-align: right; }
          
          .fab-button { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); width: calc(100% - 40px); max-width: 560px; background: linear-gradient(135deg, #ff9ff3 0%, #ff6b81 100%); color: white; border: none; border-radius: 30px; padding: 18px 20px; font-size: 18px; font-weight: 800; box-shadow: 0 12px 30px rgba(255,107,129,0.35); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; z-index: 50; transition: transform 0.2s, box-shadow 0.2s; }
          .fab-button:hover { transform: translateX(-50%) translateY(-3px); box-shadow: 0 15px 40px rgba(255,107,129,0.5); }
          .fab-icon { font-size: 26px; }
        `}</style>
        <HomeView onOpenChat={() => setView('chat')} />
      </>
    );
  }

  return (
    <>
      <style>{`
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05); box-shadow: 0 8px 24px rgba(220,38,38,0.5)} }
        @keyframes floatHeart1 { 0% { opacity:0; transform:translate(0,0) scale(0.5); } 20% { opacity:1; } 100% { opacity:0; transform:translate(-20px,-50px) scale(1.5); } }
        @keyframes floatHeart2 { 0% { opacity:0; transform:translate(0,0) scale(0.5); } 20% { opacity:1; } 100% { opacity:0; transform:translate(20px,-60px) scale(1.2); } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        * { box-sizing: border-box; font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
      `}</style>

      <div style={S.root}>
        <button onClick={() => { setView('home'); Voice.stop(); stopSTT(); }} style={{ position: 'absolute', top: 20, left: 20, zIndex: 100, background: '#fff', border: 'none', borderRadius: '50%', width: 44, height: 44, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', cursor: 'pointer', fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e293b' }}>
          ←
        </button>

        {/* 3D Canvas */}
        <div style={{ ...S.canvas, transform: showChat ? 'translateY(-20vh)' : 'translateY(0)' }}>
          <Canvas camera={{ position: [0, 0, 5.5], fov: 40 }}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[8, 10, 5]} intensity={1.3} />
            <pointLight position={[-4, 4, 4]} intensity={0.6} color="#88aaff" />
            <Environment preset="city" />
            <NoktaAvatar />
            <ContactShadows position={[0, -1.8, 0]} opacity={0.4} scale={10} blur={2.5} />
          </Canvas>
        </div>

        {/* Chat Overlay */}
        <div style={{ ...S.chatOverlay, ...(showChat ? S.chatOverlayActive : {}) }}>
          <div ref={chatRef} style={S.chat}>
            {chat.map((m, i) => (
              <div key={i} style={m.role === 'user' ? S.userBubble : (m.role === 'expert' ? S.expertBubble : S.aiBubble)}>
                {m.text}
              </div>
            ))}
            {typing && <div style={S.typing}>· · ·</div>}
          </div>
          <div style={S.inputWrap}>
            <input
              style={S.input}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendText()}
              placeholder="Evcil hayvanını anlat..."
            />
            <button onClick={sendText} disabled={!input.trim()} style={{ ...S.sendBtn, opacity: input.trim() ? 1 : 0.3 }}>
              ➤
            </button>
          </div>
        </div>

        {/* Floating Bottom UI */}
        <div style={{ ...S.floatingBar, transform: `translateX(-50%) ${showChat ? 'translateY(10px)' : 'translateY(0)'}` }}>
          <button 
            onClick={toggleMic} 
            style={{ ...S.micCircle, ...(listening ? S.micCircleActive : {}) }}
          >
            {listening ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="22"></line>
              </svg>
            )}
          </button>

          <div style={S.textCol} onClick={() => setShowChat(false)}>
            <span style={S.subtitle}>Sesli Asistan</span>
            <span style={S.title}>{status}</span>
          </div>

          <div style={S.iconBtnRow}>
            <button style={S.iconBtn} onClick={() => setShowChat(!showChat)}>
              💬
            </button>
            {showChat && (
              <button style={S.iconBtn} onClick={() => setShowChat(false)}>
                ↓
              </button>
            )}
          </div>
        </div>

      </div>
    </>
  );
}
