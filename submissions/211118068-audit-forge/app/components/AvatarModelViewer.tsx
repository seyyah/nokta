import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  type ViewStyle,
} from 'react-native';
import { Asset } from 'expo-asset';
import {
  cacheDirectory,
  makeDirectoryAsync,
  writeAsStringAsync,
} from 'expo-file-system/legacy';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { AvatarFallback2D } from './AvatarFallback2D';
import { buildAvatarViewerHtml } from '../lib/avatar3DHtml';
import { resolveAvatarGlbUri } from '../lib/resolveAvatarGlbUri';

const MODEL_VIEWER_ASSET = require('../assets/viewer/model-viewer.min.js');
const HTML_CACHE_DIR = (cacheDirectory ?? 'file:///') + 'avatar-viewer/';
const HTML_FILE_URI = HTML_CACHE_DIR + 'index.html';

type Props = {
  mouthOpen: number;
  style?: ViewStyle;
};

type Mode = 'prep' | 'loading' | 'ready' | 'fallback';

export function AvatarModelViewer({ mouthOpen, style }: Props) {
  const webRef = useRef<WebView>(null);
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('prep');
  const [pct, setPct] = useState(0);
  const [label, setLabel] = useState('Başlıyor…');
  const [failHint, setFailHint] = useState('');
  const [attempt, setAttempt] = useState(0);

  const setProgress = useCallback((n: number, text: string) => {
    setPct(Math.min(100, Math.max(0, Math.round(n))));
    setLabel(text);
  }, []);

  const startLoad = useCallback(async () => {
    setMode('prep');
    setFileUri(null);
    setPct(0);
    setLabel('Başlıyor…');
    setFailHint('');

    try {
      // model-viewer script içeriğini Metro'dan çek
      setProgress(10, 'Script hazırlanıyor…');
      const scriptAsset = Asset.fromModule(MODEL_VIEWER_ASSET);
      const scriptContent = await fetch(scriptAsset.uri).then((r) => r.text());

      // GLB URI'sini çöz
      const glbSrc = await resolveAvatarGlbUri(setProgress);

      // HTML'i oluştur ve dosyaya yaz (file:// origin → type="module" çalışır)
      setProgress(70, 'HTML dosyası yazılıyor…');
      const html = buildAvatarViewerHtml(glbSrc, scriptContent);
      await makeDirectoryAsync(HTML_CACHE_DIR, { intermediates: true });
      await writeAsStringAsync(HTML_FILE_URI, html, { encoding: 'utf8' });

      setProgress(75, 'Model yükleniyor…');
      setFileUri(HTML_FILE_URI);
      setMode('loading');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'bilinmeyen';
      setMode('fallback');
      setFailHint(`Hazırlık: ${msg}`);
      setLabel('3D hazırlanamadı');
    }
  }, [setProgress]);

  useEffect(() => {
    void startLoad();
  }, [startLoad, attempt]);

  // 5 dakika timeout
  useEffect(() => {
    if (mode !== 'loading') return;
    const t = setTimeout(() => {
      setMode('fallback');
      setFailHint('Model 5 dk içinde açılmadı.');
      setLabel('Süre doldu');
    }, 300_000);
    return () => clearTimeout(t);
  }, [mode, attempt]);

  // Lipsync enjeksiyonu
  useEffect(() => {
    if (mode !== 'ready' || !webRef.current) return;
    webRef.current.injectJavaScript(
      `if(typeof window.setMouthOpen==='function')window.setMouthOpen(${mouthOpen.toFixed(3)});true;`
    );
  }, [mouthOpen, mode]);

  const onMessage = (e: WebViewMessageEvent) => {
    const msg = e.nativeEvent.data;
    if (msg === 'stage:script-ok') {
      setProgress(80, 'Kafa modeli yükleniyor…');
    } else if (msg.startsWith('glb:')) {
      const n = parseInt(msg.slice(4), 10);
      if (!Number.isNaN(n)) setProgress(80 + n * 0.18, `Model %${n}`);
    } else if (msg === 'done') {
      setProgress(100, '3D hazır');
      setMode('ready');
    } else if (msg.startsWith('fail:')) {
      setMode('fallback');
      setFailHint(msg.includes('script') ? 'Script çalışmadı.' : 'GLB yüklenemedi.');
      setLabel('Model açılamadı');
    }
  };

  const retry = () => setAttempt((a) => a + 1);

  if (mode === 'fallback') {
    return (
      <View style={[styles.box, style]}>
        <AvatarFallback2D
          mouthOpen={mouthOpen}
          hint={[label, failHint].filter(Boolean).join('\n')}
        />
        <TouchableOpacity style={styles.retryBtn} onPress={retry}>
          <Text style={styles.retryText}>3D tekrar dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!fileUri || mode === 'prep') {
    return (
      <View style={[styles.box, style, styles.center]}>
        <ActivityIndicator color="#38BDF8" size="large" />
        <Text style={styles.pct}>{pct}%</Text>
        <Text style={styles.loadingText}>{label}</Text>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${pct}%` }]} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.box, style]}>
      {mode !== 'ready' && (
        <View style={styles.overlay}>
          <Text style={styles.pctOverlay}>{pct}%</Text>
          <Text style={styles.labelOverlay}>{label}</Text>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${pct}%` }]} />
          </View>
        </View>
      )}
      <WebView
        ref={webRef}
        originWhitelist={['*']}
        source={{ uri: fileUri }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        allowFileAccess
        allowFileAccessFromFileURLs
        allowUniversalAccessFromFileURLs
        mixedContentMode="always"
        setSupportMultipleWindows={false}
        onMessage={onMessage}
        onError={() => {
          setMode('fallback');
          setFailHint('WebView çöktü.');
          setLabel('WebView hatası');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    height: 280,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#0B1220',
  },
  center: { alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16 },
  webview: { flex: 1, backgroundColor: '#0B1220' },
  pct: { color: '#38BDF8', fontSize: 28, fontWeight: '800' },
  loadingText: { color: '#94A3B8', fontSize: 12, textAlign: 'center' },
  barTrack: {
    width: '88%',
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1E293B',
    overflow: 'hidden',
    marginTop: 4,
  },
  barFill: {
    height: '100%',
    backgroundColor: '#38BDF8',
    borderRadius: 3,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    backgroundColor: 'rgba(11,18,32,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
  },
  pctOverlay: { color: '#38BDF8', fontSize: 32, fontWeight: '800' },
  labelOverlay: { color: '#CBD5E1', fontSize: 12, textAlign: 'center' },
  retryBtn: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    backgroundColor: '#1E40AF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  retryText: { color: '#E2E8F0', fontWeight: '700', fontSize: 12 },
});
