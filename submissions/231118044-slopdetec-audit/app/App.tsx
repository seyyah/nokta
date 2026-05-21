import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AuditWidget } from './src/audit';
import type { AuditWidgetDeps, AuditNote, AuditNoteBounds } from './src/audit';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

type SlopResult = {
  slopScore: number;
  reason: string;
  correctedPitch: string;
};

type ScreenKey = 'Analyzer' | 'Results' | 'Forge';

type ExportCache = {
  filename: string;
  content: string;
  title: string;
};

const auditNotes: AuditNote[] = [];

const auditStorage = {
  async loadNotes(): Promise<AuditNote[]> {
    return [...auditNotes];
  },
  async saveNotes(notes: AuditNote[]): Promise<void> {
    auditNotes.splice(0, auditNotes.length, ...notes);
  },
};

const samplePitch =
  'AI ile tum KOBI operasyonlarini tek gunde otomatiklestiren, regule sektorlerde de risksiz calisan yatirim platformu.';

function clampText(value: string, max = 140): string {
  const compact = value.replace(/\s+/g, ' ').trim();
  return compact.length > max ? `${compact.slice(0, max - 3)}...` : compact;
}

function escapeSvg(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function svgDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function buildScreenCaptureSvg(
  screen: ScreenKey,
  pitch: string,
  result: SlopResult | null,
  highlight?: AuditNoteBounds,
): string {
  const score = result ? `${result.slopScore}/100` : 'Bekliyor';
  const headline = screen === 'Analyzer' ? 'Pitch analiz ekrani' : screen === 'Results' ? 'Sonuc ve uzman onayi' : 'Forge ledger';
  const body =
    screen === 'Analyzer'
      ? clampText(pitch || samplePitch)
      : screen === 'Results'
        ? clampText(result?.reason || 'Analiz sonucu henuz uretilmedi.')
        : 'READ -> LOCATE -> HYPOTHESIZE -> REPAIR -> TEST -> VERIFY';

  const box = highlight
    ? `<rect x="${highlight.x}" y="${highlight.y}" width="${highlight.width}" height="${highlight.height}" rx="10" fill="rgba(246,224,94,0.16)" stroke="#f6e05e" stroke-width="6"/>`
    : '';

  return svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="390" height="844" viewBox="0 0 390 844">
      <rect width="390" height="844" fill="#0a0a0a"/>
      <rect x="22" y="52" width="346" height="96" rx="18" fill="#151515" stroke="#2a2a2a"/>
      <text x="42" y="92" fill="#ffffff" font-family="Arial" font-size="30" font-weight="800">SlopDetec</text>
      <text x="42" y="122" fill="#ff3366" font-family="Arial" font-size="13" font-weight="700">${escapeSvg(headline)}</text>
      <rect x="22" y="178" width="346" height="212" rx="16" fill="#181818" stroke="#353535"/>
      <text x="42" y="220" fill="#e8e8e8" font-family="Arial" font-size="16" font-weight="700">Aktif ekran: ${screen}</text>
      <foreignObject x="42" y="242" width="306" height="92">
        <div xmlns="http://www.w3.org/1999/xhtml" style="color:#d6d6d6;font-family:Arial;font-size:15px;line-height:22px;">${escapeSvg(body)}</div>
      </foreignObject>
      <rect x="42" y="342" width="150" height="34" rx="8" fill="#ff3366"/>
      <text x="64" y="365" fill="#ffffff" font-family="Arial" font-size="13" font-weight="700">Analiz Et</text>
      <rect x="22" y="424" width="346" height="112" rx="16" fill="#131f17" stroke="#226b43"/>
      <text x="42" y="464" fill="#8df0b3" font-family="Arial" font-size="15" font-weight="700">Slop Score</text>
      <text x="42" y="506" fill="#ffffff" font-family="Arial" font-size="36" font-weight="900">${escapeSvg(score)}</text>
      <rect x="22" y="576" width="346" height="128" rx="16" fill="#161616" stroke="#333333"/>
      <text x="42" y="616" fill="#f2a65a" font-family="Arial" font-size="15" font-weight="700">Audit ground truth</text>
      <text x="42" y="652" fill="#dadada" font-family="Arial" font-size="14">Sol audit dugmesi -> Sec -> not -> rapor</text>
      ${box}
    </svg>
  `);
}

function downloadWebFile(filename: string, content: string, mimeType: string): string {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return `data:${mimeType},${encodeURIComponent(content)}`;
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return filename;
}

function downloadWebBase64(filename: string, base64: string, mimeType: string): string {
  if (Platform.OS !== 'web' || typeof document === 'undefined' || typeof atob !== 'function') {
    return `data:${mimeType};base64,${base64}`;
  }

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  const blob = new Blob([bytes], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return filename;
}

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenKey>('Analyzer');
  const [pitch, setPitch] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SlopResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expertNotified, setExpertNotified] = useState(false);
  const lastExport = useRef<ExportCache | null>(null);

  const handleAnalyze = async () => {
    if (!pitch.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setExpertNotified(false);

    try {
      if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
        throw new Error('EXPO_PUBLIC_GEMINI_API_KEY eksik. Demo icin ornek metinle lokal ekranlari gezebilirsiniz.');
      }

      const prompt = `
Sen Nokta ekosisteminin acimasiz ama yapici Red-Team due diligence ajanisin.
Gorevin startup pitch metnini slop acisindan incelemek ve yalnizca JSON dondurmektir.

Kurallar:
1. Pazar iddialarini, rekabet boslugunu, teknik sinirlari ve regule alan risklerini incele.
2. 0 ile 100 arasinda slopScore ver. 100 tamamen slop, 0 slop-free.
3. reason alaninda net gerekce yaz.
4. correctedPitch alaninda daha uygulanabilir, kisitlari belli, muhendislik odakli bir taslak uret.
5. Sadece JSON uret.

Pitch:
"${pitch}"
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { response_mime_type: 'application/json' },
          }),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || 'API request failed');
      }

      const text = data.candidates[0].content.parts[0].text;
      const parsed = JSON.parse(text) as SlopResult;
      setResult(parsed);
      setActiveScreen('Results');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Bir hata olustu.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 30) return '#4caf50';
    if (score < 70) return '#ff9800';
    return '#f44336';
  };

  const handleExpertSend = () => {
    if (!result) return;
    const subject = encodeURIComponent('SlopDetec Uzman Incelemesi Talebi');
    const body = encodeURIComponent(
      `Merhaba Nokta Red-Team,\n\nPitch:\n${pitch}\n\nSlop Score: ${result.slopScore}/100\n\nReason:\n${result.reason}\n\nCorrected Pitch:\n${result.correctedPitch}`,
    );

    Linking.openURL(`mailto:uzman@nokta22.com?subject=${subject}&body=${body}`);
    setExpertNotified(true);
  };

  const deps: AuditWidgetDeps = useMemo(
    () => ({
      captureScreen: async (highlight?: AuditNoteBounds) =>
        buildScreenCaptureSvg(activeScreen, pitch, result, highlight),
      writeTextFile: async (filename: string, content: string) => {
        lastExport.current = { filename, content, title: 'Nokta Audit Markdown' };
        return downloadWebFile(filename, content, 'text/markdown;charset=utf-8');
      },
      writeBinaryFile: async (filename: string, base64: string) => {
        lastExport.current = { filename, content: base64, title: 'Nokta Audit Word Report' };
        return downloadWebBase64(
          filename,
          base64,
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        );
      },
      shareFile: async (uri: string, title?: string) => {
        const exported = lastExport.current;
        const message = exported
          ? `${exported.filename}\n\n${exported.content.slice(0, 1600)}`
          : `Rapor olusturuldu: ${uri}`;
        await Share.share({ title: title || exported?.title || 'Nokta Audit Report', message, url: uri });
      },
      storage: auditStorage,
      reporterId: '231118044-codex-loop',
    }),
    [activeScreen, pitch, result],
  );

  const renderAnalyzer = () => (
    <>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>SlopDetec</Text>
        <Text style={styles.subtitle}>Red-Team / Slop Detector</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.label}>Startup Pitch</Text>
          <TouchableOpacity style={styles.seedButton} onPress={() => setPitch(samplePitch)}>
            <Text style={styles.seedButtonText}>Ornek</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.textInput}
          multiline
          numberOfLines={6}
          placeholder="Fikri buraya yapistir. Orn: AI ile tum pazari tek haftada domine ediyoruz..."
          placeholderTextColor="#777"
          value={pitch}
          onChangeText={setPitch}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, (pitch.trim() === '' || loading) && styles.buttonDisabled]}
        onPress={handleAnalyze}
        disabled={pitch.trim() === '' || loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Analiz Et</Text>}
      </TouchableOpacity>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.infoBand}>
        <Text style={styles.infoTitle}>Audit modu</Text>
        <Text style={styles.infoText}>
          Sol taraftaki Audit dugmesini ac, Sec'e bas, ekranda tek bir alani isaretle ve notu kaydet.
          Boylece her dokunusta secim baslamaz; rapor akisi kontrollu kalir.
        </Text>
      </View>
    </>
  );

  const renderResults = () => (
    <>
      <View style={styles.headerContainerCompact}>
        <Text style={styles.titleSmall}>Analiz Sonucu</Text>
        <Text style={styles.subtitle}>Slop score ve Nokta standardi</Text>
      </View>

      {!result ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Henuz sonuc yok</Text>
          <Text style={styles.emptyText}>Analyzer ekranindan bir pitch degerlendir veya ornek metni kullan.</Text>
        </View>
      ) : expertNotified ? (
        <View style={styles.successCard}>
          <Text style={styles.successTitle}>Uzmana gonderildi</Text>
          <Text style={styles.successText}>
            AI analizi ve pitch ozeti Nokta Red-Team incelemesine acildi.
          </Text>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => {
              setPitch('');
              setResult(null);
              setExpertNotified(false);
              setActiveScreen('Analyzer');
            }}
          >
            <Text style={styles.resetButtonText}>Yeni analiz</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.resultContainer}>
          <View style={styles.scoreHeader}>
            <Text style={styles.scoreLabel}>Slop Score</Text>
            <Text style={[styles.scoreValue, { color: getScoreColor(result.slopScore) }]}>
              {result.slopScore}/100
            </Text>
          </View>

          <View style={styles.resultCard}>
            <Text style={styles.resultCardTitle}>Reason</Text>
            <Text style={styles.resultCardText}>{result.reason}</Text>
          </View>

          <View style={[styles.resultCard, { borderColor: '#4caf50' }]}>
            <Text style={[styles.resultCardTitle, { color: '#4caf50' }]}>Corrected Pitch</Text>
            <Text style={styles.resultCardText}>{result.correctedPitch}</Text>
          </View>

          <TouchableOpacity style={styles.expertButton} onPress={handleExpertSend}>
            <Text style={styles.expertButtonText}>Supheli mi? Uzmana gonder</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );

  const renderForge = () => (
    <>
      <View style={styles.headerContainerCompact}>
        <Text style={styles.titleSmall}>Forge Loop</Text>
        <Text style={styles.subtitle}>Audit raporu agent girdisine donusur</Text>
      </View>

      <View style={styles.forgeCard}>
        <Text style={styles.forgeStep}>READ</Text>
        <Text style={styles.forgeText}>Audit raporu ekran adi, not ve burn-in gorseliyle okunur.</Text>
      </View>
      <View style={styles.forgeCard}>
        <Text style={styles.forgeStep}>LOCATE + REPAIR</Text>
        <Text style={styles.forgeText}>Ilgili UI bolgesi bulunur, tek hipotezle minimal degisiklik yapilir.</Text>
      </View>
      <View style={styles.forgeCard}>
        <Text style={styles.forgeStep}>TEST + VERIFY</Text>
        <Text style={styles.forgeText}>TypeScript kontrolu ve gorsel niyet kontrolu gecmeden commit yoktur.</Text>
      </View>
      <View style={styles.infoBand}>
        <Text style={styles.infoTitle}>Bu teslimdeki karar</Text>
        <Text style={styles.infoText}>
          Track B secildi: musteri sadece gorselde ne istedigini isaretler; agent bunu feature/fix
          niyetine cevirip FORGE.md ledger'inda kapali donguyu kaydeder.
        </Text>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.tabs}>
          {(['Analyzer', 'Results', 'Forge'] as ScreenKey[]).map((screen) => (
            <TouchableOpacity
              key={screen}
              style={[styles.tab, activeScreen === screen && styles.tabActive]}
              onPress={() => setActiveScreen(screen)}
            >
              <Text style={[styles.tabText, activeScreen === screen && styles.tabTextActive]}>{screen}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {activeScreen === 'Analyzer' && renderAnalyzer()}
          {activeScreen === 'Results' && renderResults()}
          {activeScreen === 'Forge' && renderForge()}
        </ScrollView>
      </KeyboardAvoidingView>

      <AuditWidget
        appName="SlopDetec"
        currentScreen={activeScreen}
        deps={deps}
        initialOpen={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  container: {
    flex: 1,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 8,
    backgroundColor: '#0a0a0a',
  },
  tab: {
    flex: 1,
    minHeight: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2d2d2d',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121212',
  },
  tabActive: {
    borderColor: '#ff3366',
    backgroundColor: '#221019',
  },
  tabText: {
    color: '#9a9a9a',
    fontWeight: '700',
    fontSize: 12,
  },
  tabTextActive: {
    color: '#ffffff',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120,
    flexGrow: 1,
  },
  headerContainer: {
    marginTop: 24,
    marginBottom: 28,
    alignItems: 'center',
  },
  headerContainerCompact: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 38,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 4,
  },
  titleSmall: {
    fontSize: 30,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ff3366',
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 18,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e0e0e0',
  },
  seedButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#232323',
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  seedButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  textInput: {
    backgroundColor: '#0f0f0f',
    color: '#fff',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    minHeight: 150,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#333',
  },
  button: {
    alignSelf: 'center',
    width: '68%',
    backgroundColor: '#ff3366',
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: 'center',
    shadowColor: '#ff3366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#555',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  errorContainer: {
    marginTop: 18,
    padding: 14,
    backgroundColor: '#321015',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    color: '#ffb3b3',
    fontSize: 14,
  },
  infoBand: {
    marginTop: 22,
    padding: 18,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#35506f',
    backgroundColor: '#111a24',
  },
  infoTitle: {
    color: '#9dc8ff',
    fontWeight: '800',
    fontSize: 15,
    marginBottom: 6,
  },
  infoText: {
    color: '#d8e5f6',
    lineHeight: 22,
    fontSize: 14,
  },
  emptyState: {
    padding: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#171717',
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptyText: {
    color: '#cfcfcf',
    lineHeight: 22,
  },
  resultContainer: {
    gap: 16,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  scoreLabel: {
    fontSize: 19,
    fontWeight: '800',
    color: '#fff',
  },
  scoreValue: {
    fontSize: 34,
    fontWeight: '900',
  },
  resultCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ff9800',
    borderLeftWidth: 4,
  },
  resultCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ff9800',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  resultCardText: {
    fontSize: 15,
    color: '#e0e0e0',
    lineHeight: 23,
  },
  expertButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#60a5fa',
  },
  expertButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  successCard: {
    backgroundColor: '#064e3b',
    borderRadius: 8,
    padding: 22,
    borderWidth: 1,
    borderColor: '#059669',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#34d399',
    marginBottom: 10,
  },
  successText: {
    fontSize: 15,
    color: '#a7f3d0',
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#022c22',
    fontWeight: '800',
    fontSize: 15,
  },
  forgeCard: {
    padding: 18,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#181818',
    marginBottom: 12,
  },
  forgeStep: {
    color: '#ff3366',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 6,
  },
  forgeText: {
    color: '#dedede',
    fontSize: 15,
    lineHeight: 23,
  },
});
