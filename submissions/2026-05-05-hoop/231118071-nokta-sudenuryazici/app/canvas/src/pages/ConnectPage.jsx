import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Link2, ArrowRight, LayoutGrid, Shield, Zap, Database, AlertCircle, CheckCircle2, LogOut } from 'lucide-react';
import { useGoogleAuth } from '../auth/useGoogleAuth';
import { extractSpreadsheetId, extractGid, getSheetMetadata } from '../services/sheetsService';

export default function ConnectPage() {
  const { user, accessToken, isAuthenticated, isLoading, error: authError, login, logout } = useGoogleAuth();
  const [sheetUrl, setSheetUrl] = useState('');
  const [urlError, setUrlError] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();

  const handleConnect = async () => {
    setUrlError(null);
    const spreadsheetId = extractSpreadsheetId(sheetUrl);
    if (!spreadsheetId) {
      setUrlError('Geçersiz Google Sheet URL\'si. Lütfen doğru bir URL yapıştırın.');
      return;
    }

    const gid = extractGid(sheetUrl);

    setIsAnalyzing(true);
    try {
      await getSheetMetadata(accessToken, spreadsheetId);
      sessionStorage.setItem('canvassheet_spreadsheetId', spreadsheetId);
      if (gid) sessionStorage.setItem('canvassheet_gid', gid);
      sessionStorage.setItem('canvassheet_url', sheetUrl);
      localStorage.setItem('connectedSheetId', spreadsheetId);
      navigate('/analyze');
    } catch (err) {
      setUrlError(`Sheet'e erişim hatası: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#0F172A]">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-[480px] relative z-10 animate-fadeIn">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-6">
            <LayoutGrid size={40} color="white" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">CanvasSheet</h1>
          <p className="text-slate-400 font-medium">Google Sheet'inizi canlı dashboard'a dönüştürün</p>
        </div>

        {/* Main Card */}
        <div className="glass-panel rounded-[32px] p-8 shadow-2xl">
          {/* Step 1 */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold ${isAuthenticated ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'}`}>
                {isAuthenticated ? <CheckCircle2 size={16} /> : '1'}
              </div>
              <h3 className={`font-bold ${isAuthenticated ? 'text-emerald-400' : 'text-white'}`}>Google ile Giriş Yapın</h3>
            </div>

            {isAuthenticated ? (
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 flex items-center gap-4 group">
                <div className="relative">
                  <img src={user?.picture} alt="" className="w-12 h-12 rounded-full border-2 border-slate-700" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#0F172A] rounded-full"></div>
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold text-sm">{user?.name}</p>
                  <p className="text-slate-400 text-xs">{user?.email}</p>
                </div>
                <button onClick={logout} className="text-slate-500 hover:text-white transition-colors">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={login}
                disabled={isLoading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-3"
              >
                <LogIn size={20} />
                {isLoading ? 'Yükleniyor...' : 'Google ile Giriş Yap'}
              </button>
            )}
          </div>

          <div className="h-px bg-slate-700/30 mb-8"></div>

          {/* Step 2 */}
          <div className={!isAuthenticated ? 'opacity-40 pointer-events-none' : ''}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-7 bg-slate-700 rounded-lg flex items-center justify-center text-sm font-bold text-slate-400">2</div>
              <h3 className="font-bold text-white">Google Sheet URL'nizi Yapıştırın</h3>
            </div>

            <div className="relative mb-6">
              <Link2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="url"
                placeholder="https://docs.google.com/spreadsheets/d/..."
                value={sheetUrl}
                onChange={(e) => { setSheetUrl(e.target.value); setUrlError(null); }}
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600"
              />
            </div>

            {urlError && (
              <div className="flex items-center gap-2 text-rose-400 text-xs mb-4 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                <AlertCircle size={14} />
                {urlError}
              </div>
            )}

            <button
              onClick={handleConnect}
              disabled={!isAuthenticated || !sheetUrl.trim() || isAnalyzing}
              className={`w-full py-4 font-bold rounded-2xl transition-all flex items-center justify-center gap-3 ${
                isAuthenticated && sheetUrl.trim() 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-600/20' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Analiz Ediliyor...
                </>
              ) : (
                <>
                  Dashboard'a Bağlan <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="flex justify-center gap-8 mt-10 opacity-40">
          <div className="flex items-center gap-2 text-[11px] text-white font-bold uppercase tracking-wider">
            <Shield size={14} /> OAuth2 Güvenlik
          </div>
          <div className="flex items-center gap-2 text-[11px] text-white font-bold uppercase tracking-wider">
            <Zap size={14} /> Realtime Sync
          </div>
          <div className="flex items-center gap-2 text-[11px] text-white font-bold uppercase tracking-wider">
            <Database size={14} /> Sıfır Kurulum
          </div>
        </div>
      </div>
    </div>
  );
}
