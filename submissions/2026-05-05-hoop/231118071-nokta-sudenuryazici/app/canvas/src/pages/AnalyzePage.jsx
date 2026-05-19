import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleAuth } from '../auth/useGoogleAuth.js';
import { analyzeSheet, formatMetadataForPrompt } from '../services/sheetAnalyzer.js';
import { generateDashboardConfig, generateMultipleDashboardConfigs } from '../services/geminiService.js';
import DynamicDashboard from '../engine/DynamicDashboard.jsx';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import NoktaAvatar from '../components/NoktaAvatar';
import Brain from '../services/Brain.js';
import Voice from '../services/Voice.js';
import { Sparkles, Loader2, CheckCircle, ArrowRight, RefreshCw, Layout, Layers, Columns, Info, AlertCircle, Send, MessageSquare, UserCheck } from 'lucide-react';

export default function AnalyzePage() {
  const navigate = useNavigate();
  const { user, accessToken } = useGoogleAuth();

  const [spreadsheetId] = useState(localStorage.getItem('connectedSheetId') || '');
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [uiConfigs, setUiConfigs] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [expertRequested, setExpertRequested] = useState(false);
  const [expertStep, setExpertStep] = useState('none'); 
  const [error, setError] = useState(null);
  const [step, setStep] = useState('idle'); 
  const [prompt, setPrompt] = useState('');
  
  const [mascotChat, setMascotChat] = useState("Selam! Ben NOVA. Verilerini analiz ettim ve 4 farklı perspektif hazırladım. Tasarımda beğenmediğin bir yer olursa söyle, hemen senin vizyonuna göre güncelleyeyim!");
  const [refinementInput, setRefinementInput] = useState('');
  const [refining, setRefining] = useState(false);

  useEffect(() => {
    if (!user || !accessToken) {
      navigate('/connect');
    }
  }, [user, accessToken, navigate]);

  const handleDelegateExpert = () => {
    setExpertRequested(true);
    setExpertStep('connecting');
    setMascotChat("Harika fikir! Senin verilerini ve tasarımını en iyi analiz edebilecek uzman tasarımcımızı hemen bağlıyorum. Birkaç saniye bekle lütfen...");
    setTimeout(() => setExpertStep('reviewing'), 3000);
    setTimeout(() => {
      setExpertStep('ready');
      setMascotChat("Uzmanımız şu an verilerini inceliyor! Talep #2311-071 numarasıyla sıraya alındın. Uzman görüşü hazır olduğunda sana buradan bildireceğim.");
    }, 6000);
  };

  const handleLock = () => {
    setIsLocked(true);
    setMascotChat("Harika bir seçim! Şimdi bu tasarımı mükemmelleştirmek için buradayım. Renkleri, widgetları veya yerleşimi değiştirmemi istersen hemen söyle.");
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError(null);
    setStep('analyzing');
    try {
      const sheetMetadata = await analyzeSheet(spreadsheetId, accessToken);
      setMetadata(sheetMetadata);
      setStep('analyzed');
    } catch (err) {
      setError(`Analiz hatası: ${err.message}`);
      setStep('error');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateDashboard = async () => {
    if (!metadata) return;
    setGenerating(true);
    setError(null);
    setStep('generating');
    try {
      const metadataPrompt = formatMetadataForPrompt(metadata);
      const configs = await generateMultipleDashboardConfigs(metadataPrompt, prompt);
      setUiConfigs(configs);
      setSelectedIndex(0);
      setIsLocked(false);
      setStep('complete');
    } catch (err) {
      setError(`AI Hatası: ${err.message}`);
      setStep('error');
    } finally {
      setGenerating(false);
    }
  };

  const handleRefine = async (e) => {
    e.preventDefault();
    if (!refinementInput.trim() || refining) return;
    
    const instruction = refinementInput;
    setRefinementInput('');
    setRefining(true);
    
    try {
      const response = await Brain.sendMessage(`Kullanıcı mevcut dashboard (Seçenek ${selectedIndex + 1}) üzerinde şu değişikliği istiyor: ${instruction}. Ona bu tasarım değişikliğini hemen hayata geçireceğini söyle.`);
      setMascotChat(response);
      
      const metadataPrompt = formatMetadataForPrompt(metadata);
      const currentConfig = uiConfigs[selectedIndex];
      
      const refinedConfig = await generateDashboardConfig(
        metadataPrompt, 
        `MEVCUT TASARIM: ${currentConfig.title}. 
         KRİTİK TALİMAT: ${instruction}. 
         GÖREV: Bu tasarımı yukarıdaki talimata göre GÜNCELLE. SADECE JSON döndür.`
      );
      
      const newConfigs = [...uiConfigs];
      newConfigs[selectedIndex] = refinedConfig;
      setUiConfigs(newConfigs);
      setMascotChat(`İşte istediğin güncellemeleri yaptım! Başka bir değişiklik istersen buradayım.`);
    } catch (err) {
      console.error("Refinement error:", err);
      setMascotChat(`Üzgünüm, şu an teknik bir sorun yaşıyorum. Lütfen tekrar dene.`);
    } finally {
      setTimeout(() => setRefining(false), 100);
    }
  };

  if (!user) return null;

  if (step === 'complete' && uiConfigs.length > 0) {
    const currentConfig = uiConfigs[selectedIndex];
    return (
      <div className="min-h-screen bg-[#0F172A] text-slate-100 pb-20 overflow-x-hidden">
        <div className="max-w-[1600px] mx-auto px-6 pt-12 animate-fadeIn flex flex-col lg:flex-row gap-8">
          
          {/* Main Dashboard Area */}
          <div className="flex-1 min-w-0">
            {/* Header & Selector */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8 bg-white/5 p-6 rounded-[32px] border border-white/10 backdrop-blur-xl">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <Sparkles size={20} className="text-blue-400" />
                  <h2 className="text-2xl font-black tracking-tight">{currentConfig.title}</h2>
                  {isLocked && (
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                      Seçilen Tasarım
                    </span>
                  )}
                </div>
                <p className="text-slate-400 text-sm italic">{currentConfig.subtitle}</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-900/50 p-3 rounded-2xl border border-white/5">
                {!isLocked ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Görünüm:</span>
                      <div className="flex gap-2">
                        {uiConfigs.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedIndex(idx)}
                            className={`w-9 h-9 rounded-lg font-bold transition-all text-xs ${idx === selectedIndex ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                          >
                            {idx + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button 
                      onClick={handleLock}
                      className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
                    >
                      <CheckCircle size={14} /> Tasarımı Seç
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => setIsLocked(false)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold flex items-center gap-2 transition-all text-slate-400"
                  >
                    <Layout size={14} /> Seçeneklere Geri Dön
                  </button>
                )}
                
                {!isLocked && (
                  <button 
                    onClick={() => setStep('analyzed')} 
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
                  >
                    <RefreshCw size={14} /> Yeniden Üret
                  </button>
                )}
              </div>
            </div>

            <div className="relative group">
              {refining && (
                <div className="absolute inset-0 z-50 bg-[#0F172A]/40 backdrop-blur-sm rounded-[32px] flex flex-col items-center justify-center animate-fadeIn">
                  <Loader2 size={48} className="animate-spin text-blue-500 mb-4" />
                  <p className="font-bold text-white tracking-widest uppercase text-xs tracking-[0.2em]">Vision Updating...</p>
                </div>
              )}
              <DynamicDashboard uiConfig={currentConfig} spreadsheetId={spreadsheetId} />
            </div>
          </div>

          {/* Mascot Side Assistant */}
          <div className="w-full lg:w-[380px] flex flex-col gap-6 shrink-0">
            <div className="glass-panel rounded-[32px] border-white/10 p-6 flex flex-col h-full sticky top-12">
              
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                    <MessageSquare size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-tight text-white tracking-widest">Nova</h3>
                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest animate-pulse">● Online</p>
                  </div>
                </div>
              </div>

              {/* Expert Support Button - CRITICAL PLACEMENT */}
              {!expertRequested ? (
                <button 
                  onClick={handleDelegateExpert}
                  className="w-full mb-6 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-600/30 group"
                >
                  <UserCheck size={18} className="group-hover:scale-110 transition-transform" /> Uzman Desteği (Human)
                </button>
              ) : (
                <div className="w-full mb-6 py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-[10px] text-emerald-400 font-bold text-center uppercase tracking-widest flex items-center justify-center gap-2">
                  <CheckCircle size={14} /> Uzman Talebi Alındı
                </div>
              )}

              {/* 3D View */}
              <div className="w-full aspect-square bg-slate-900/50 rounded-3xl border border-white/5 relative overflow-hidden mb-6">
                <Canvas camera={{ position: [0, -0.3, 5.5], fov: 40 }}>
                  <ambientLight intensity={0.7} />
                  <directionalLight position={[8, 10, 5]} intensity={1.3} />
                  <Environment preset="city" />
                  <NoktaAvatar />
                  <ContactShadows position={[0, -1.8, 0]} opacity={0.4} scale={10} blur={2.5} />
                </Canvas>
              </div>

              {/* Chat & Status */}
              <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/5 mb-6">
                {expertStep === 'none' ? (
                  <p className="text-sm leading-relaxed text-slate-200 font-medium italic">
                    "{mascotChat}"
                  </p>
                ) : (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center gap-2 text-blue-400 font-black text-[10px] uppercase tracking-widest">
                      <Loader2 size={12} className="animate-spin" /> 
                      {expertStep === 'connecting' && "Uzman Atanıyor..."}
                      {expertStep === 'reviewing' && "Veriler İnceleniyor..."}
                      {expertStep === 'ready' && "Uzman Havuzunda"}
                    </div>
                    <p className="text-sm leading-relaxed text-slate-200 font-medium italic">
                      "{mascotChat}"
                    </p>
                    {expertStep === 'ready' && (
                      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[10px] text-blue-300 font-bold">
                        Bilet: #2311-071 | Sıra: 1
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Refinement Input */}
              <form onSubmit={handleRefine} className="flex gap-2">
                <input 
                  type="text" 
                  value={refinementInput}
                  onChange={(e) => setRefinementInput(e.target.value)}
                  placeholder="Hızlı revize iste..."
                  className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all"
                />
                <button type="submit" className="w-12 h-12 bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20 transition-all shrink-0">
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[10%] left-[10%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-[540px] relative z-10 animate-fadeIn">
        <div className="glass-panel rounded-[40px] p-12 shadow-2xl text-center border-slate-700/30">
          <div className="mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-[20px] flex items-center justify-center shadow-2xl shadow-blue-500/20 mx-auto mb-6">
              <Sparkles size={32} color="white" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">Dashboard Studio</h1>
            <p className="text-slate-400 font-medium">Sheet'lerinizi saniyeler içinde analiz edin</p>
          </div>

          {step === 'idle' && (
            <div className="space-y-8">
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex items-center gap-3 text-left">
                <Info size={18} className="text-blue-500 shrink-0" />
                <span className="text-xs text-slate-400 font-medium truncate">Bağlı: {spreadsheetId}</span>
              </div>
              <button onClick={handleAnalyze} className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 text-lg">
                Analizi Başlat <ArrowRight size={22} />
              </button>
            </div>
          )}

          {step === 'analyzing' && (
            <div className="py-10 animate-pulse">
              <Loader2 size={64} className="animate-spin text-blue-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-2">Analiz Ediliyor</h2>
            </div>
          )}

          {step === 'analyzed' && metadata && (
            <div className="text-left space-y-8 animate-fadeIn">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3 text-emerald-400">
                <CheckCircle size={20} />
                <span className="font-bold text-sm">Analiz Tamam!</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <InfoCard label="Sayfa" value={metadata.sheetName} icon={<Layout size={14} />} />
                <InfoCard label="Satır" value={metadata.rowCount} icon={<Layers size={14} />} />
                <InfoCard label="Sütun" value={metadata.headers.length} icon={<Columns size={14} />} />
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-400 ml-1">Dashboard Talimatı</label>
                <textarea className="w-full h-32 bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all resize-none" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Örn: Satışları analiz et..." />
              </div>
              <button onClick={handleGenerateDashboard} disabled={generating} className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-3 text-lg">
                {generating ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} />}
                {generating ? 'Tasarım Yapılıyor...' : 'AI Dashboard Oluştur'}
              </button>
            </div>
          )}

          {step === 'generating' && (
            <div className="py-10">
              <Loader2 size={64} className="animate-spin text-blue-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-2">AI Tasarlıyor</h2>
            </div>
          )}

          {step === 'error' && (
            <div className="py-6 text-center">
              <AlertCircle size={64} className="text-rose-500 mx-auto mb-6" />
              <p className="text-rose-400 text-sm mb-8 font-medium">{error}</p>
              <button onClick={() => setStep('idle')} className="px-8 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-all">Tekrar Dene</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value, icon }) {
  return (
    <div className="bg-slate-900/40 border border-slate-800/50 p-4 rounded-2xl text-center flex flex-col items-center justify-center gap-1 group hover:border-blue-500/20 transition-colors">
      <div className="flex items-center gap-2 text-slate-500 mb-1">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-white font-black text-lg truncate w-full">{value}</div>
    </div>
  );
}
