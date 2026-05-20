import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Share } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';

interface Idea { id: string; spark: string; createdAt: string; spec?: Record<string, string>; }
interface Expert { id: string; name: string; title: string; emoji: string; specialties: string[]; bio: string; focus: string; }
type Recommendation = 'proceed' | 'iterate' | 'pivot';
interface ExpertResponse {
  id: string; expertId: string; ideaId: string; ideaSpark: string;
  question: string; response: string; recommendation: Recommendation; createdAt: string;
}

const EXPERTS: Expert[] = [
  { id: 'ayse', name: 'Ayşe Kaya', title: 'UX Stratejisti · ex-Trendyol', emoji: '👩‍💼',
    specialties: ['Problem Framing', 'User Research', 'Persona'],
    bio: '10+ yıl UX deneyimi. 200+ projede problem statement ve user segmentation review yaptı.',
    focus: 'problem & user' },
  { id: 'mehmet', name: 'Mehmet Aydın', title: 'Ürün Yöneticisi · ex-Getir', emoji: '👨‍💼',
    specialties: ['MVP Scope', 'Roadmap', 'Prioritization'],
    bio: 'B2C startuplarında 12 yıl PM. Scope ve MVP tanımlamada uzman.',
    focus: 'scope' },
  { id: 'zeynep', name: 'Zeynep Demir', title: 'Domain Expert · Ex-Hepsiburada', emoji: '👩‍🔬',
    specialties: ['Customer Discovery', 'PMF', 'Metrics'],
    bio: '0→1 ürünlerde 8 yıl. Problem severity ve başarı metrikleri konusunda titiz.',
    focus: 'problem severity & metrics' },
  { id: 'burak', name: 'Burak Şahin', title: 'Teknik Danışman · ex-CTO', emoji: '👨‍💻',
    specialties: ['Tech Feasibility', 'Architecture', 'Constraints'],
    bio: '3 VC fonunda technical advisor. 40+ pre-seed startupa fizibilite danışmanlığı.',
    focus: 'constraints & feasibility' },
];

type ViewMode = 'directory' | 'history' | 'ask' | 'response';

export default function ExpertScreen() {
  const { ideaId } = useLocalSearchParams<{ ideaId: string }>();
  const router = useRouter();
  const [view, setView] = useState<ViewMode>('directory');
  const [idea, setIdea] = useState<Idea | null>(null);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ExpertResponse | null>(null);
  const [history, setHistory] = useState<ExpertResponse[]>([]);

  useEffect(() => {
    if (ideaId) {
      AsyncStorage.getItem('@nokta/ideas').then(raw => {
        if (!raw) return;
        const ideas: Idea[] = JSON.parse(raw);
        setIdea(ideas.find(i => i.id === ideaId) || null);
      });
    }
    AsyncStorage.getItem('@nokta/expert_responses').then(raw => {
      if (raw) setHistory(JSON.parse(raw));
    });
  }, [ideaId]);

  const handleExpertSelect = (expert: Expert) => {
    setSelectedExpert(expert); setQuestion(''); setView('ask');
  };

  const handleSubmit = async () => {
    if (!selectedExpert || !idea) return;
    setLoading(true); setView('response');
    await new Promise(r => setTimeout(r, 3000));
    const result = generateResponse(selectedExpert, idea);
    const newResponse: ExpertResponse = {
      id: `r_${Date.now()}`, expertId: selectedExpert.id, ideaId: idea.id,
      ideaSpark: idea.spark, question: question.trim() || 'Genel bir görüş istiyorum.',
      response: result.response, recommendation: result.recommendation,
      createdAt: new Date().toISOString(),
    };
    const updated = [newResponse, ...history];
    await AsyncStorage.setItem('@nokta/expert_responses', JSON.stringify(updated));
    setHistory(updated); setResponse(newResponse); setLoading(false);
  };

  const handleViewPast = (r: ExpertResponse) => {
    setResponse(r);
    setSelectedExpert(EXPERTS.find(e => e.id === r.expertId) || null);
    setView('response');
  };

  const handleShare = async () => {
    if (!response || !selectedExpert) return;
    const text = `📝 ${selectedExpert.name} - Uzman Görüşü\n\nFikir: "${response.ideaSpark}"\n\n${response.response}\n\nKarar: ${getRecLabel(response.recommendation)}\n\n#NOKTA`;
    try { await Share.share({ message: text }); } catch {}
  };

  if (view === 'response') {
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4a90e2" />
          <Text style={styles.loadingTitle}>{selectedExpert?.name} spec'i inceliyor...</Text>
          <Text style={styles.loadingSub}>Birkaç saniye sürebilir</Text>
        </View>
      );
    }
    if (!response || !selectedExpert) return <View style={styles.center}><Text style={{ color: '#888' }}>Yanıt bulunamadı</Text></View>;
    return (
      <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View style={styles.expertHeader}>
          <Text style={styles.expertEmoji}>{selectedExpert.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.expertName}>{selectedExpert.name}</Text>
            <Text style={styles.expertTitle}>{selectedExpert.title}</Text>
            <Text style={styles.expertDate}>{new Date(response.createdAt).toLocaleString('tr-TR')}</Text>
          </View>
        </View>
        <View style={[styles.recCard, { borderColor: getRecColor(response.recommendation) }]}>
          <Text style={styles.recLabel}>UZMAN KARARI</Text>
          <Text style={[styles.recValue, { color: getRecColor(response.recommendation) }]}>{getRecLabel(response.recommendation)}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>FİKİR</Text>
          <Text style={styles.contextText}>"{response.ideaSpark}"</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SORU</Text>
          <Text style={styles.contextText}>{response.question}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>UZMAN GÖRÜŞÜ</Text>
          <View style={styles.responseBox}>
            <Text style={styles.responseText}>{response.response}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleShare}>
            <Text style={styles.secondaryBtnText}>📤 Paylaş</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setView('directory')}>
            <Text style={styles.primaryBtnText}>Yeni Görüş →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (view === 'ask' && selectedExpert) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View style={styles.expertHeader}>
          <Text style={styles.expertEmoji}>{selectedExpert.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.expertName}>{selectedExpert.name}</Text>
            <Text style={styles.expertTitle}>{selectedExpert.title}</Text>
            <Text style={styles.expertSpecs}>{selectedExpert.specialties.join(' · ')}</Text>
          </View>
        </View>
        {idea && (
          <View style={styles.contextCard}>
            <Text style={styles.contextLabel}>SPEC CONTEXT'I</Text>
            <Text style={styles.contextSpark}>"{idea.spark}"</Text>
            <Text style={styles.contextHint}>{Object.keys(idea.spec || {}).length}/5 alan dolu</Text>
          </View>
        )}
        <Text style={styles.formLabel}>SORUNUZ (OPSİYONEL)</Text>
        <TextInput
          style={styles.textArea} multiline textAlignVertical="top"
          placeholder="Örn: Problem framing'imi nasıl güçlendirebilirim?"
          placeholderTextColor="#444" value={question} onChangeText={setQuestion}
          maxLength={300}
        />
        <Text style={styles.charCount}>{question.length}/300</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleSubmit}>
          <Text style={styles.primaryBtnText}>Görüş İste</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setView('directory')} style={{ marginTop: 12, alignItems: 'center' }}>
          <Text style={{ color: '#888', fontSize: 13 }}>← Başka uzman seç</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, view === 'directory' && styles.tabActive]} onPress={() => setView('directory')}>
          <Text style={[styles.tabText, view === 'directory' && styles.tabTextActive]}>Uzmanlar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, view === 'history' && styles.tabActive]} onPress={() => setView('history')}>
          <Text style={[styles.tabText, view === 'history' && styles.tabTextActive]}>Geçmiş ({history.length})</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {view === 'directory' && idea && (
          <View style={styles.contextCard}>
            <Text style={styles.contextLabel}>DOĞRULANACAK FİKİR</Text>
            <Text style={styles.contextSpark}>"{idea.spark}"</Text>
          </View>
        )}
        {view === 'directory' && EXPERTS.map(expert => (
          <TouchableOpacity key={expert.id} style={styles.expertCard} onPress={() => handleExpertSelect(expert)}>
            <View style={styles.expertHeader}>
              <Text style={styles.expertEmoji}>{expert.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.expertName}>{expert.name}</Text>
                <Text style={styles.expertTitle}>{expert.title}</Text>
              </View>
            </View>
            <Text style={styles.expertBio}>{expert.bio}</Text>
            <View style={styles.specs}>
              {expert.specialties.map(s => (
                <View key={s} style={styles.specChip}><Text style={styles.specChipText}>{s}</Text></View>
              ))}
            </View>
            <Text style={styles.askLink}>Bu uzmana sor →</Text>
          </TouchableOpacity>
        ))}
        {view === 'history' && history.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={styles.emptyTitle}>Henüz uzman görüşü yok</Text>
            <Text style={styles.emptySub}>Bir uzmana sor, geçmişin burada birikecek</Text>
          </View>
        )}
        {view === 'history' && history.map(r => {
          const e = EXPERTS.find(x => x.id === r.expertId);
          return (
            <TouchableOpacity key={r.id} style={styles.historyCard} onPress={() => handleViewPast(r)}>
              <View style={styles.expertHeader}>
                <Text style={styles.expertEmojiSm}>{e?.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.expertNameSm}>{e?.name}</Text>
                  <Text style={styles.historyDate}>{new Date(r.createdAt).toLocaleDateString('tr-TR')}</Text>
                </View>
                <View style={[styles.recBadge, { backgroundColor: getRecColor(r.recommendation) }]}>
                  <Text style={styles.recBadgeText}>{getRecLabel(r.recommendation)}</Text>
                </View>
              </View>
              <Text style={styles.historyIdea} numberOfLines={1}>"{r.ideaSpark}"</Text>
              <Text style={styles.historyPreview} numberOfLines={2}>{r.response}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

function getSpecQuality(spec?: Record<string, string>): 'excellent' | 'good' | 'weak' {
  if (!spec) return 'weak';
  const fields = ['problem', 'user', 'scope', 'constraint', 'successMetric'];
  const filled = fields.filter(f => (spec[f] || '').trim().length >= 10).length;
  const totalLen = fields.reduce((sum, f) => sum + (spec[f] || '').length, 0);
  const avgLen = totalLen / fields.length;
  if (filled >= 4 && avgLen > 40) return 'excellent';
  if (filled >= 3 && avgLen > 20) return 'good';
  return 'weak';
}

function generateResponse(expert: Expert, idea: Idea): { response: string; recommendation: Recommendation } {
  const quality = getSpecQuality(idea.spec);
  const recommendation: Recommendation = quality === 'excellent' ? 'proceed' : quality === 'good' ? 'iterate' : 'pivot';
  const templates: Record<string, Record<string, string>> = {
    ayse: {
      excellent: `"${idea.spark}" fikrinizin spec'ini UX gözüyle inceledim. Problem framing'iniz somut, user persona'nız net çizilmiş. Bu kalitedeki spec'leri pek az görüyorum.\n\nKüçük bir not: başarı metriğini PMF testiyle ilişkilendirmek istiyorsanız, retention curve düzleşmesini takip edin. İlk 50 kullanıcıyı yakından izleyin, sonra ölçekleyin.`,
      good: `Problem ve user yazımınızı inceledim. Problem net ama user tarafında segment biraz geniş kalmış.\n\nÖnerim: 'kullanıcı' yerine 'X şehrinde Y yaş arası, Z davranışı sergileyen kişi' formülünü kullanın. İlk 100 kullanıcınız kim olacak? Onları somut tarif edin, gerisi ölçeklendikçe gelir.\n\nBir-iki iterasyon sonrası bu spec çok güçlü bir pitch çıkarır.`,
      weak: `"${idea.spark}" şu hâliyle bir hipotez çekirdeği — henüz spec değil. Problem statement'ınız 'X zor' formülünden 'X durumunda Y kişisi Z'yi yapamıyor, çünkü ...' formülüne çekilmeli.\n\nUser tarafı boş veya 'herkes' kalmış. Customer discovery sırası: 5 kişiyle 30 dakikalık görüşme yapın, problem'i kendi kelimeleriyle nasıl tarif ediyorlar dinleyin. Spec'i ondan sonra revize edin.`,
    },
    mehmet: {
      excellent: `Scope tanımınızı ürün gözüyle inceledim — V1 için doğru sınırlandırılmış. Çekirdek değer önerisi öne çıkmış, kapsam dağıtık değil.\n\nConstraint listesi de gerçekçi. Go-to-market sırasında bu spec elinizde olduğu sürece odaktan çıkmazsınız. Ay 1-2 için tek bir core flow seçtiyseniz (umarım), o flow'u perfekleştirin önce.`,
      good: `Scope'unuzu okudum. Biraz geniş — 2-3 ürün özelliği gibi okunuyor ama V1 için tek odak gerekli.\n\nÖnerim: V1 için tek bir core flow seçin (örn: kullanıcı A'dan B'ye gidiyor, oradan değer alıyor). Diğer her şeyi roadmap'e atın. 'Sonradan ekleriz' demek scope discipline değil; şimdi listelemek o.`,
      weak: `Scope ile ürün vizyonunu karıştırmışsınız. 'AI destekli platform' bir scope değil, bir poster. V1'de hangi 3 sayfayı/ekranı yapacaksınız? Hangi tek kullanıcı flow'u çalışacak?\n\nMVP boundaries için şu egzersiz: '4 hafta içinde, X kullanıcı şu A→B→C adımlarını yaşıyor olmalı' formülünü doldurun. A, B, C nedir? Şimdi yazın, sonra spec'i revize edin.`,
    },
    zeynep: {
      excellent: `Problem severity yüksek ve başarı metriğiniz somut. Bu domain'de gerçek bir pain point'e dokunuyor — saha deneyimimden söylüyorum.\n\nBaşarı metriği için DAU/WAU oranı leading indicator olarak doğru. Hangi davranışı kaç hafta gözlerseniz 'çalışıyor' diyeceksiniz, o eşiği şimdi belirleyin (örn: 4 hafta sonra %40+ retention). Karar kriteriniz olsun, vibe ile büyüme yönetilmez.`,
      good: `Problem'iniz inandırıcı ama başarı metriğiniz vague kalmış. 'Engagement', 'kullanıcı sayısı' tek başına yetersiz.\n\nÖnerim: 'X hafta sonra, Y kullanıcının %Z'si A davranışını yapmış olmalı' formülüne çekin. Specifik sayı + zaman dilimi + davranış. Bu olmadan ürünün çalışıp çalışmadığını bilemezsiniz, vibe ile karar verirsiniz.`,
      weak: `Bu problem'i ben göremiyorum. Domain'de 5 kişiyle konuştunuz mu? Customer discovery yapmadan spec yazmak teorik kalıyor — varsayımlar üzerinde inşa.\n\nSıraya: önce 10 user interview (problem'i kendi kelimeleriyle nasıl tarif ediyor), sonra severity skorlama (1-5 skala), sonra spec revizyonu. Atlanırsa V1 yanlış problem'e çözüm üretir.`,
    },
    burak: {
      excellent: `Constraint listenizi teknik fizibilite açısından inceledim — kuvvetli. Rate limit, gizlilik, ölçeklenme noktalarını yakalamışsınız.\n\nMVP altyapısı 4-6 haftada çıkarılabilir. Stack önerisi: Expo + Supabase/Firebase + Anthropic API yeterli. Aylık ~$50-200 maliyet beklenir, 500 kullanıcıya kadar. Sonrası optimization conversation'ı.`,
      good: `Spec'i okudum, teknik açıdan revize gerekli. Constraint kısmı düşünülmüş ama eksik — KVKK/GDPR, latency budget, on-device vs cloud kararları yok.\n\nMVP öncesi şu sorulara cevap verin: kimin verisi nereye yazılıyor? Hangi servis kim host ediyor? Aylık tahmini maliyet ne? Bunlar olmadan tech DD imkansız, fund alamazsınız.`,
      weak: `Constraint kısmı 'yok' veya boş. Bu kırmızı bayrak — 'farkında değiliz' anlamına geliyor.\n\nMVP'de bile çözülmesi gerekenler: rate limit (kim ne kadar isteyebilir), gizlilik (KVKK/GDPR), maliyet ceiling (aylık X TL), latency budget (kullanıcı kaç saniye bekleyebilir). Bu listeyi doldurmadan teknik fizibiliteyi değerlendiremem. Önce yazın, sonra konuşalım.`,
    },
  };
  const expertTemplates = templates[expert.id];
  return { response: expertTemplates[quality] || expertTemplates['good'], recommendation };
}

function getRecColor(r: Recommendation): string {
  if (r === 'proceed') return '#7ed321';
  if (r === 'iterate') return '#f5a623';
  return '#e85d75';
}
function getRecLabel(r: Recommendation): string {
  if (r === 'proceed') return 'DEVAM ET';
  if (r === 'iterate') return 'REVİZE ET';
  return 'PIVOT YAP';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a', padding: 40 },
  loadingTitle: { color: '#fff', fontSize: 16, fontWeight: '600', marginTop: 18, textAlign: 'center' },
  loadingSub: { color: '#666', fontSize: 13, marginTop: 6 },
  tabs: { flexDirection: 'row', padding: 16, gap: 8 },
  tab: { flex: 1, padding: 10, borderRadius: 8, backgroundColor: '#1a1a1a', alignItems: 'center', borderWidth: 1, borderColor: '#2a2a2a' },
  tabActive: { backgroundColor: '#1a2438', borderColor: '#4a90e2' },
  tabText: { color: '#888', fontWeight: '600', fontSize: 13 },
  tabTextActive: { color: '#4a90e2' },
  expertCard: { backgroundColor: '#141414', borderRadius: 12, padding: 16, marginBottom: 12 },
  expertHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  expertEmoji: { fontSize: 36 },
  expertEmojiSm: { fontSize: 28 },
  expertName: { color: '#fff', fontSize: 16, fontWeight: '700' },
  expertNameSm: { color: '#fff', fontSize: 14, fontWeight: '700' },
  expertTitle: { color: '#888', fontSize: 12, marginTop: 2 },
  expertDate: { color: '#555', fontSize: 11, marginTop: 4 },
  expertSpecs: { color: '#4a90e2', fontSize: 11, marginTop: 6, fontWeight: '600' },
  expertBio: { color: '#bbb', fontSize: 13, lineHeight: 19, marginBottom: 10 },
  specs: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  specChip: { backgroundColor: '#1f1f1f', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  specChipText: { color: '#bbb', fontSize: 11, fontWeight: '500' },
  askLink: { color: '#4a90e2', fontSize: 13, fontWeight: '700', textAlign: 'right' },
  contextCard: { backgroundColor: '#141414', borderRadius: 12, padding: 14, marginBottom: 16, borderLeftWidth: 3, borderLeftColor: '#4a90e2' },
  contextLabel: { color: '#666', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
  contextSpark: { color: '#fff', fontSize: 14, fontWeight: '600', fontStyle: 'italic' },
  contextHint: { color: '#666', fontSize: 11, marginTop: 6 },
  contextText: { color: '#ddd', fontSize: 14, lineHeight: 20, fontStyle: 'italic' },
  formLabel: { color: '#666', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8, marginTop: 8 },
  textArea: { backgroundColor: '#141414', borderRadius: 10, padding: 14, color: '#fff', fontSize: 15, minHeight: 100, borderWidth: 1, borderColor: '#2a2a2a' },
  charCount: { color: '#555', fontSize: 11, textAlign: 'right', marginTop: 6, marginBottom: 14 },
  primaryBtn: { flex: 1, backgroundColor: '#4a90e2', borderRadius: 12, padding: 16, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  secondaryBtn: { flex: 1, backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#2a2a2a' },
  secondaryBtnText: { color: '#ddd', fontSize: 14, fontWeight: '600' },
  recCard: { backgroundColor: '#141414', borderRadius: 16, padding: 20, marginVertical: 16, borderWidth: 2, alignItems: 'center' },
  recLabel: { color: '#666', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 6 },
  recValue: { fontSize: 26, fontWeight: '900', letterSpacing: 1 },
  section: { marginBottom: 14 },
  sectionLabel: { color: '#666', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  responseBox: { backgroundColor: '#141414', padding: 16, borderRadius: 12, borderLeftWidth: 3, borderLeftColor: '#4a90e2' },
  responseText: { color: '#ddd', fontSize: 15, lineHeight: 23 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  emptySub: { color: '#666', fontSize: 13 },
  historyCard: { backgroundColor: '#141414', borderRadius: 12, padding: 14, marginBottom: 10 },
  historyDate: { color: '#555', fontSize: 11, marginTop: 2 },
  recBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  recBadgeText: { color: '#000', fontSize: 10, fontWeight: '800' },
  historyIdea: { color: '#bbb', fontSize: 13, fontStyle: 'italic', marginTop: 8, marginBottom: 6 },
  historyPreview: { color: '#888', fontSize: 12, lineHeight: 18 },
});
