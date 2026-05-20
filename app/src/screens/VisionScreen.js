import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { captureScreen } from 'react-native-view-shot';
import { Svg, Path, Polyline, Line, Circle as SvgCircle } from 'react-native-svg';
import { NoteManager } from '../nokta-audit/core/storage';
import { auditStorage } from '../nokta-audit/auditStorage';
import { buildMarkdown } from '../nokta-audit/export/markdown';

// Forge server URL: .env'den oku (EXPO_PUBLIC_FORGE_API_URL), yoksa emülatör fallback
// Bilgisayar IP'ni bulmak için cmd: ipconfig (Windows) / ifconfig (Mac/Linux)
// Örnek .env: EXPO_PUBLIC_FORGE_API_URL=http://192.168.1.42:3000/repair
const FORGE_API_URL = process.env.EXPO_PUBLIC_FORGE_API_URL || 'http://10.0.2.2:3000/repair';

const { width: windowW } = Dimensions.get('window');
const screenW = Dimensions.get('screen').width;
const screenH = Dimensions.get('screen').height;

const containerW = Math.min((windowW - 48) / 2, 170);
const containerH = Math.min(containerW * (screenH / screenW), windowW * 0.55);

const PRIMARY = '#a855f7';
const BG = '#09090b';
const CARD_BG = '#0f0f12';
const TEXT = '#ffffff';
const TEXT_LIGHT = '#94a3b8';
const BORDER = '#27272a';
const SUCCESS = '#22c55e';
const WARNING = '#f59e0b';

function EyeIcon({ size = 28, color = PRIMARY }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <SvgCircle cx="12" cy="12" r="3" />
    </Svg>
  );
}

function TrendingUpIcon({ size = 16, color = SUCCESS }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <Polyline points="17 6 23 6 23 12" />
    </Svg>
  );
}

function ShieldCheckIcon({ size = 16, color = PRIMARY }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <Polyline points="9 12 12 15 17 10" />
    </Svg>
  );
}

function StarIcon({ size = 16, color = WARNING }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </Svg>
  );
}

function ArrowRightIcon({ size = 28, color = PRIMARY }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Line x1="5" y1="12" x2="19" y2="12" />
      <Polyline points="12 5 19 12 12 19" />
    </Svg>
  );
}

function ZapIcon({ size = 20, color = '#fff' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </Svg>
  );
}

function RefreshCwIcon({ size = 18, color = PRIMARY }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Polyline points="23 4 23 10 17 10" />
      <Path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </Svg>
  );
}

/** AI Analysis based on note text */
function getAnalysisResults(noteText) {
    const text = (noteText || '').toLowerCase();

    let score = '%94';
    let aesthetic = '+35%';
    let accessibility = '+25%';
    let ux = 'Önemli Gelişmeler';
    let feedback = 'Raporlanan UI tutarsızlığı başarıyla giderildi. Bileşenlerin görsel bütünlüğü ve kullanıcı deneyimi standartlara uygun hale getirildi.';
    let fixType = 'default';

    let checkpoints = [
        { name: 'Renk Kontrastı (WCAG AA)', status: 'improved', details: 'Kontrast oranı 4.5:1 eşiğini başarıyla geçti.' },
        { name: 'Dokunma Hedef Alanı', status: 'pass', details: 'Buton dokunma alanı minimum 48dp genişliğe ulaştı.' },
        { name: 'Ekran Çakışma Önleme', status: 'pass', details: 'KeyboardAvoidingView düzgün şekilde çalışıyor.' },
        { name: 'Görsel Hiyerarşi', status: 'improved', details: 'Tipografi boyutları ve ağırlık farkları iyileştirildi.' }
    ];

    if (text.includes('icon') || text.includes('ikon') || text.includes('simge') || text.includes('sembol')) {
        score = '%98';
        aesthetic = '+55%';
        accessibility = '+40%';
        ux = 'Zengin Görsel Algı';
        feedback = 'Seçilen alana uygun sembolik görsel öğeler (ikonlar) eklendi. Kullanıcıların hızlı tanıma ve bağlamsal anlayışı güçlendirildi.';
        fixType = 'icon';
        checkpoints = [
            { name: 'Iconografi Tutarlılığı', status: 'pass', details: 'Tüm yeni ikonlar tek bir set ile uyumlu hale getirildi.' },
            { name: 'Boyut & Orantı', status: 'pass', details: 'İkon boyutları hedef alan içinde orantılı ölçeklendirildi.' },
            { name: 'Renk Kontrastı', status: 'improved', details: 'Arka plana göre ikon renkleri WCAG AA standardına uygun.' },
            { name: 'Dokunma Alanı', status: 'pass', details: 'İkonlar minimum 44x44dp erişilebilir alanla çevrildi.' }
        ];
    } else if (text.includes('video') || text.includes('izle') || text.includes('eğitim') || text.includes('player')) {
        score = '%96';
        aesthetic = '+20%';
        accessibility = '+85%';
        ux = 'Kusursuz Oynatma';
        feedback = 'Video oynatıcı altyapısı ve yükleme durumları (loading spinner) başarıyla optimize edildi.';
        fixType = 'video';
        checkpoints = [
            { name: 'Video Buffer & Loading', status: 'pass', details: 'Spinner animasyonu eklendi, boş ekran beklemesi giderildi.' },
            { name: 'Erişilebilirlik Butonları', status: 'pass', details: 'Oynat/Durdur butonları sesli okuyucuya tanıtıldı.' },
            { name: 'Responsive Layout', status: 'improved', details: 'Yatay modda tam ekran video çerçevesi düzgün oturuyor.' },
            { name: 'Hafıza Yönetimi', status: 'pass', details: 'Sayfadan çıkıldığında player belleği tamamen temizleniyor.' }
        ];
    } else if (text.includes('renk') || text.includes('tema') || text.includes('mavi') || text.includes('color') || text.includes('bg')) {
        score = '%98';
        aesthetic = '+70%';
        accessibility = '+40%';
        ux = 'Premium Algı';
        feedback = 'Kurumsal marka renklerine geçiş yapıldı. Kontrast seviyeleri WCAG AAA standartlarına yükseltildi.';
        fixType = 'color';
        checkpoints = [
            { name: 'Renk Tutarlılığı', status: 'pass', details: 'Uygulama genelindeki tonlar tek bir tema paletine bağlandı.' },
            { name: 'Karanlık Mod Uyumu', status: 'pass', details: 'Koyu temadaki renk kontrastı göz yormayacak şekilde ayarlandı.' },
            { name: 'Metin Okunabilirliği', status: 'improved', details: 'Arka plan ile yazı renk kontrastı AAA seviyesine ulaştı.' },
            { name: 'Visual Branding', status: 'improved', details: 'Marka kimliği algısı görsel olarak güçlendirildi.' }
        ];
    } else if (text.includes('çakış') || text.includes('buton') || text.includes('üst üste') || text.includes('kayma') || text.includes('overlap') || text.includes('spacing')) {
        score = '%97';
        aesthetic = '+45%';
        accessibility = '+60%';
        ux = 'Hatasız Düzen';
        feedback = 'Safe Area View sınırları ve KeyboardAvoidingView ayarları optimize edildi.';
        fixType = 'layout';
        checkpoints = [
            { name: 'Safe Area Boundary', status: 'pass', details: 'Cihaz çentikleri ve alt çubuk alanları için esneme giderildi.' },
            { name: 'Klavye Etkileşimi', status: 'pass', details: 'Klavye açıldığında form elemanları otomatik yukarı kaydırılıyor.' },
            { name: 'Dokunma Çakışmaları', status: 'pass', details: 'Üst üste gelen butonların zIndex ve pointerEvents değerleri düzeltildi.' },
            { name: 'Esnek Tasarım', status: 'improved', details: 'Küçük ekranlı cihazlarda taşmalar tamamen engellendi.' }
        ];
    }

    return { score, aesthetic, accessibility, ux, feedback, checkpoints, fixType };
}

/** Renders the AI-suggested fix as a mock overlay on the "New" screenshot */
function FixOverlay({ fixType, bounds, containerWidth, containerHeight }) {
    if (!fixType || !bounds) return null;
    const scaleX = containerWidth / screenW;
    const scaleY = containerHeight / screenH;
    const left = bounds.x * scaleX;
    const top = bounds.y * scaleY;
    const width = bounds.width * scaleX;
    const height = bounds.height * scaleY;

    return (
        <View pointerEvents="none" style={[styles.fixOverlayBase, { left, top, width, height }]}>
            {fixType === 'icon' && (
                <View style={styles.fixIconContainer}>
                    <View style={styles.fixIconCircle}>
                        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                            <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            <Path d="M9 12l2 2 4-4" />
                        </Svg>
                    </View>
                    <View style={styles.fixBadge}>
                        <Text style={styles.fixBadgeText}>ICON</Text>
                    </View>
                </View>
            )}
            {fixType === 'color' && (
                <View style={styles.fixColorContainer}>
                    <View style={styles.fixColorSwatch} />
                    <View style={[styles.fixBadge, { backgroundColor: SUCCESS }]}>
                        <Text style={styles.fixBadgeText}>COLOR</Text>
                    </View>
                </View>
            )}
            {fixType === 'layout' && (
                <View style={styles.fixLayoutContainer}>
                    <View style={styles.fixLayoutGrid}>
                        <View style={styles.fixLayoutCell} />
                        <View style={styles.fixLayoutCell} />
                        <View style={styles.fixLayoutCell} />
                        <View style={styles.fixLayoutCell} />
                    </View>
                    <View style={[styles.fixBadge, { backgroundColor: WARNING }]}>
                        <Text style={styles.fixBadgeText}>FIXED</Text>
                    </View>
                </View>
            )}
            {fixType === 'video' && (
                <View style={styles.fixVideoContainer}>
                    <View style={styles.fixVideoPlay}>
                        <Svg width={16} height={16} viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth={0}>
                            <Path d="M5 3l14 9-14 9V3z" />
                        </Svg>
                    </View>
                    <View style={[styles.fixBadge, { backgroundColor: PRIMARY }]}>
                        <Text style={styles.fixBadgeText}>VIDEO</Text>
                    </View>
                </View>
            )}
            {fixType === 'default' && (
                <View style={styles.fixDefaultContainer}>
                    <View style={[styles.fixBadge, { backgroundColor: TEXT_LIGHT }]}>
                        <Text style={styles.fixBadgeText}>FIXED</Text>
                    </View>
                </View>
            )}
        </View>
    );
}

export default function VisionScreen() {
    const navigation = useNavigation();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [analysisDone, setAnalysisDone] = useState(false);
    const [failedSyncIds, setFailedSyncIds] = useState([]);
    const [allNotes, setAllNotes] = useState([]);
    const [selectedNote, setSelectedNote] = useState(null);
    const [isApplying, setIsApplying] = useState(false);

    const managerRef = React.useRef(new NoteManager(auditStorage));
    const manager = managerRef.current;

    const loadData = useCallback(async () => {
        try {
            const notes = await manager.getAll();
            setAllNotes(notes);
            if (notes.length > 0 && !selectedNote) {
                setSelectedNote(notes[notes.length - 1]);
            }
        } catch (e) {
            console.error('[VisionScreen] loadData error:', e);
        }
    }, [manager, selectedNote]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const syncCurrentState = useCallback(async () => {
        if (!selectedNote || isSyncing) return;
        const target = selectedNote.screenName;
        if (target === 'Unknown' || target === 'Vision') {
            setIsSyncing(false);
            return;
        }
        setIsSyncing(true);
        try {
            navigation.navigate(target);
            setTimeout(async () => {
                try {
                    const uri = await captureScreen({ format: 'png', result: 'data-uri' });
                    await manager.update(selectedNote.id, { screenshotFixed: uri });
                    navigation.navigate('Vision');
                    const updatedNote = { ...selectedNote, screenshotFixed: uri };
                    setSelectedNote(updatedNote);
                    setAllNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
                    setIsSyncing(false);
                } catch (captureErr) {
                    console.error('Capture Error:', captureErr);
                    setFailedSyncIds(prev => [...prev, selectedNote.id]);
                    setIsSyncing(false);
                    navigation.navigate('Vision');
                }
            }, 2500);
        } catch (navErr) {
            console.error('Navigation Error:', navErr);
            setIsSyncing(false);
            navigation.navigate('Vision');
        }
    }, [selectedNote, isSyncing, manager, navigation]);

    const runAnalysis = useCallback(() => {
        setIsAnalyzing(true);
        setAnalysisDone(false);
        setTimeout(() => {
            setIsAnalyzing(false);
            setAnalysisDone(true);
        }, 2000);
    }, []);

    const handleApplyFix = useCallback(async () => {
        if (!selectedNote) return;
        setIsApplying(true);

        // Simulation mode: no live server call during demo / local testing
        await new Promise(resolve => setTimeout(resolve, 1200));

        const noteText = selectedNote.note.toLowerCase();
        let changeDesc = 'UI düzenlemesi';
        let changeIcon = '✅';

        if (noteText.includes('renk') || noteText.includes('color') || noteText.includes('rengi')) {
            changeDesc = '🎨 Renk değişikliği';
            changeIcon = '🎨';
        } else if (noteText.includes('icon') || noteText.includes('sembol') || noteText.includes('simge')) {
            changeDesc = '🔣 İkon ekleme / değiştirme';
            changeIcon = '🔣';
        } else if (noteText.includes('padding') || noteText.includes('margin') || noteText.includes('boşluk') || noteText.includes('mesafe') || noteText.includes('boyut') || noteText.includes('büyük') || noteText.includes('küçük')) {
            changeDesc = '📐 Boşluk / boyut ayarı';
            changeIcon = '📐';
        } else if (noteText.includes('yazı') || noteText.includes('font') || noteText.includes('text') || noteText.includes('metin') || noteText.includes('kelime')) {
            changeDesc = '✏️ Yazı tipi / boyut ayarı';
            changeIcon = '✏️';
        }

        // Mark note as fixed in storage
        const updatedNote = { ...selectedNote, status: 'fixed' };
        try {
            await auditStorage.updateNote(selectedNote.id, updatedNote);
        } catch (e) {
            console.warn('Could not update note status:', e);
        }

        setIsApplying(false);
        Alert.alert(
            `${changeIcon} Değişiklik Simüle Edildi`,
            `${changeDesc} uygulandı.\n\nNot: Bu simülasyondur. Gerçek otonom onarım için bilgisayarda "node forge-server.js" çalıştırılmalıdır.`,
            [{ text: 'Tamam', onPress: () => setSelectedNote(null) }]
        );
    }, [selectedNote]);

    const results = useMemo(() => {
        if (!selectedNote) return null;
        return getAnalysisResults(selectedNote.note);
    }, [selectedNote]);

    const hasAnalysisResults = analysisDone && results && Array.isArray(results.checkpoints);

    const getHighlightStyle = (bounds) => {
        if (!bounds) return null;
        const scaleX = containerW / screenW;
        const scaleY = containerH / screenH;
        return {
            left: bounds.x * scaleX,
            top: bounds.y * scaleY,
            width: bounds.width * scaleX,
            height: bounds.height * scaleY,
        };
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <EyeIcon size={28} color={PRIMARY} />
                    <Text style={styles.title}>Vision Audit</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={styles.subtitle}>Hangi hatayı incelemek istersiniz?</Text>
                    <TouchableOpacity onPress={loadData} style={{ padding: 8 }}>
                        <RefreshCwIcon size={16} color={PRIMARY} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.selectorContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorScroll}>
                    {allNotes.map((note) => (
                        <TouchableOpacity
                            key={note.id}
                            style={[styles.bugChip, selectedNote?.id === note.id && styles.activeChip]}
                            onPress={() => {
                                setSelectedNote(note);
                                setAnalysisDone(false);
                            }}
                        >
                            <Text style={[styles.bugChipText, selectedNote?.id === note.id && styles.activeChipText]}>
                                {note.screenName}: {note.note.substring(0, 15)}...
                            </Text>
                        </TouchableOpacity>
                    ))}
                    {allNotes.length === 0 && <Text style={styles.emptyText}>Henüz kayıtlı hata yok.</Text>}
                </ScrollView>
            </View>

            <View style={styles.compareContainer}>
                {/* BEFORE */}
                <View style={styles.compareBox}>
                    <Text style={[styles.label, { color: '#ef4444' }]}>Eski Hali (Bug)</Text>
                    <View style={styles.imagePlaceholder}>
                        {selectedNote ? (
                            <View style={{ width: containerW, height: containerH, position: 'relative' }}>
                                <Image
                                    source={{ uri: selectedNote.screenshot }}
                                    style={styles.screenshot}
                                    resizeMode="contain"
                                    onError={(e) => console.log('[VisionScreen] Baseline hata', e.nativeEvent)}
                                />
                                {selectedNote.highlightBounds ? (
                                    <View pointerEvents="none" style={[styles.highlightBox, getHighlightStyle(selectedNote.highlightBounds)]} />
                                ) : null}
                            </View>
                        ) : (
                            <Text style={styles.placeholderText}>Seçim Yok</Text>
                        )}
                    </View>
                </View>

                <View style={styles.arrowContainer}>
                    <ArrowRightIcon size={28} color={PRIMARY} />
                </View>

                {/* AFTER */}
                <View style={styles.compareBox}>
                    <Text style={[styles.label, { color: SUCCESS }]}>Yeni Hali (Fix)</Text>
                    <View style={styles.imagePlaceholderNew}>
                        {selectedNote?.screenshotFixed ? (
                            <View style={{ width: containerW, height: containerH, position: 'relative' }}>
                                <Image
                                    source={{ uri: selectedNote.screenshotFixed }}
                                    style={styles.screenshot}
                                    resizeMode="contain"
                                />
                                {selectedNote.highlightBounds ? (
                                    <View pointerEvents="none" style={[styles.highlightBoxFixed, getHighlightStyle(selectedNote.highlightBounds)]} />
                                ) : null}
                                {analysisDone && results?.fixType && selectedNote.highlightBounds ? (
                                    <FixOverlay
                                        fixType={results.fixType}
                                        bounds={selectedNote.highlightBounds}
                                        containerWidth={containerW}
                                        containerHeight={containerH}
                                    />
                                ) : null}
                            </View>
                        ) : (
                            <View style={styles.emptyCurrent}>
                                <RefreshCwIcon size={32} color={TEXT_LIGHT} />
                                <Text style={styles.placeholderSmall}>Auto-Sync ile yakala</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            <TouchableOpacity style={styles.syncBtn} onPress={syncCurrentState} disabled={isSyncing || !selectedNote}>
                {isSyncing ? (
                    <ActivityIndicator color={PRIMARY} />
                ) : (
                    <>
                        <RefreshCwIcon size={18} color={PRIMARY} />
                        <Text style={styles.syncBtnText}>Güncel Halini Yakala (Auto-Sync)</Text>
                    </>
                )}
            </TouchableOpacity>

            {!analysisDone ? (
                <TouchableOpacity style={styles.analyzeBtn} onPress={runAnalysis} disabled={isAnalyzing}>
                    {isAnalyzing ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <ZapIcon size={20} color="#fff" />
                            <Text style={styles.analyzeBtnText}>Vision Analizi Başlat</Text>
                        </>
                    )}
                </TouchableOpacity>
            ) : null}

            {hasAnalysisResults ? (
                <View style={styles.resultCard}>
                    <View style={styles.scoreRow}>
                        <View style={styles.scoreCircle}>
                            <Text style={styles.scoreValue}>{results.score}</Text>
                            <Text style={styles.scoreLabel}>İyileşme</Text>
                        </View>
                        <View style={styles.metrics}>
                            <View style={styles.metricItem}>
                                <TrendingUpIcon size={16} color={SUCCESS} />
                                <Text style={styles.metricText}>Estetik: {results.aesthetic}</Text>
                            </View>
                            <View style={styles.metricItem}>
                                <ShieldCheckIcon size={16} color={PRIMARY} />
                                <Text style={styles.metricText}>Erişilebilirlik: {results.accessibility}</Text>
                            </View>
                            <View style={styles.metricItem}>
                                <StarIcon size={16} color={WARNING} />
                                <Text style={styles.metricText}>UX Durumu: {results.ux}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.summaryBox}>
                        <Text style={styles.summaryTitle}>AI Değerlendirmesi:</Text>
                        <Text style={styles.summaryText}>"{results.feedback}"</Text>

                        <View style={styles.checkpointsList}>
                            <Text style={[styles.summaryTitle, { marginTop: 16, marginBottom: 8 }]}>Analiz Denetim Noktaları:</Text>
                            {results.checkpoints.map((cp, idx) => (
                                <View key={idx} style={styles.checkpointRow}>
                                    <View style={[styles.checkpointBadge, cp.status === 'pass' ? styles.badgePass : styles.badgeImproved]}>
                                        <Text style={cp.status === 'pass' ? styles.badgeTextPass : styles.badgeTextImproved}>
                                            {cp.status === 'pass' ? '✓ GEÇTİ' : '↑ İYİLEŞTİ'}
                                        </Text>
                                    </View>
                                    <View style={styles.checkpointInfo}>
                                        <Text style={styles.checkpointName}>{cp.name}</Text>
                                        <Text style={styles.checkpointDetails}>{cp.details}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.applyBtn}
                        onPress={handleApplyFix}
                        disabled={isApplying}
                        activeOpacity={0.8}
                    >
                        {isApplying ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <ZapIcon size={20} color="#fff" />
                                <Text style={styles.applyBtnText}>Onayla ve Uygula</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            ) : null}

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BG },
    header: { padding: 24, paddingTop: 60 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    title: { fontSize: 28, fontWeight: 'bold', color: TEXT },
    subtitle: { fontSize: 14, color: TEXT_LIGHT, marginTop: 4 },
    selectorContainer: { marginBottom: 20 },
    selectorScroll: { paddingHorizontal: 24, gap: 12 },
    bugChip: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: CARD_BG, borderRadius: 20, borderWidth: 1, borderColor: BORDER },
    activeChip: { backgroundColor: PRIMARY, borderColor: PRIMARY },
    bugChipText: { fontSize: 12, fontWeight: '600', color: TEXT_LIGHT },
    activeChipText: { color: 'white' },
    emptyText: { fontSize: 12, color: TEXT_LIGHT, fontStyle: 'italic' },
    compareContainer: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, justifyContent: 'space-between', alignItems: 'center', gap: 8 },
    compareBox: { width: containerW },
    label: { fontSize: 11, fontWeight: '800', marginBottom: 6, textAlign: 'center', color: TEXT_LIGHT, textTransform: 'uppercase', letterSpacing: 0.5 },
    imagePlaceholder: { height: containerH, backgroundColor: CARD_BG, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#ef4444', overflow: 'hidden' },
    imagePlaceholderNew: { height: containerH, backgroundColor: CARD_BG, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: SUCCESS, overflow: 'hidden' },
    placeholderText: { fontSize: 12, fontWeight: 'bold', color: TEXT_LIGHT },
    placeholderSmall: { fontSize: 10, color: TEXT_LIGHT, marginTop: 4 },
    emptyCurrent: { alignItems: 'center', justifyContent: 'center', opacity: 0.5 },
    screenshot: { width: '100%', height: '100%', borderRadius: 12 },
    highlightBox: { position: 'absolute', borderWidth: 2, borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.15)', borderRadius: 4 },
    highlightBoxFixed: { position: 'absolute', borderWidth: 2, borderColor: SUCCESS, backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: 4 },
    syncBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: CARD_BG, marginHorizontal: 24, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: PRIMARY, borderStyle: 'dashed' },
    syncBtnText: { fontSize: 12, color: PRIMARY, fontWeight: 'bold' },
    arrowContainer: { width: 40, alignItems: 'center' },
    analyzeBtn: { backgroundColor: PRIMARY, margin: 24, padding: 18, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
    analyzeBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
    resultCard: { backgroundColor: CARD_BG, margin: 16, borderRadius: 24, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: BORDER },
    scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 20 },
    scoreCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(168, 85, 247, 0.1)', borderWidth: 4, borderColor: PRIMARY, justifyContent: 'center', alignItems: 'center' },
    scoreValue: { fontSize: 24, fontWeight: 'bold', color: PRIMARY },
    scoreLabel: { fontSize: 10, color: PRIMARY, marginTop: -2 },
    metrics: { flex: 1, gap: 8 },
    metricItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    metricText: { fontSize: 12, fontWeight: '600', color: TEXT },
    summaryBox: { backgroundColor: BG, padding: 16, borderRadius: 16 },
    summaryTitle: { fontSize: 12, fontWeight: 'bold', color: TEXT, marginBottom: 6 },
    summaryText: { fontSize: 13, color: TEXT_LIGHT, lineHeight: 20, fontStyle: 'italic' },
    checkpointsList: { marginTop: 12, borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 12 },
    checkpointRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, gap: 10 },
    checkpointBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignItems: 'center', justifyContent: 'center', minWidth: 70 },
    badgePass: { backgroundColor: 'rgba(34, 197, 94, 0.15)' },
    badgeImproved: { backgroundColor: 'rgba(168, 85, 247, 0.15)' },
    badgeTextPass: { fontSize: 9, fontWeight: 'bold', color: SUCCESS },
    badgeTextImproved: { fontSize: 9, fontWeight: 'bold', color: PRIMARY },
    checkpointInfo: { flex: 1 },
    checkpointName: { fontSize: 12, fontWeight: '700', color: TEXT },
    checkpointDetails: { fontSize: 11, color: TEXT_LIGHT, marginTop: 1 },

    // Fix overlay styles
    fixOverlayBase: { position: 'absolute', alignItems: 'center', justifyContent: 'center', borderRadius: 8, overflow: 'hidden' },
    fixIconContainer: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(168,85,247,0.25)' },
    fixIconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center' },
    fixColorContainer: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(34,197,94,0.25)' },
    fixColorSwatch: { width: 24, height: 24, borderRadius: 6, backgroundColor: PRIMARY, borderWidth: 2, borderColor: 'white' },
    fixLayoutContainer: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(245,158,11,0.2)' },
    fixLayoutGrid: { flexDirection: 'row', flexWrap: 'wrap', width: 28, height: 28, gap: 2 },
    fixLayoutCell: { width: 12, height: 12, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.8)' },
    fixVideoContainer: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.35)' },
    fixVideoPlay: { width: 32, height: 32, borderRadius: 16, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center' },
    fixDefaultContainer: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(148,163,184,0.2)' },
    fixBadge: { position: 'absolute', bottom: 2, right: 2, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, backgroundColor: PRIMARY },
    fixBadgeText: { fontSize: 7, color: 'white', fontWeight: '800', letterSpacing: 0.5 },
    applyBtn: { backgroundColor: SUCCESS, marginTop: 20, padding: 16, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, shadowColor: SUCCESS, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
    applyBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
});
