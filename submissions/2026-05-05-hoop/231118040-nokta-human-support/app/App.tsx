import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Mode = 'ai' | 'human';

type Expert = {
  id: string;
  name: string;
  role: string;
  scope: string;
  skills: string[];
  online: boolean;
  eta: string;
  color: string;
};

type Analysis = {
  confidence: number;
  domain: string;
  priority: 'Normal' | 'Yuksek' | 'Kritik';
  sla: string;
  expertId: string;
  flags: string[];
  aiAnswer: string;
  summary: string;
  handoffReason: string;
};

type Ticket = {
  id: string;
  status: 'Sirada' | 'Uzmana aktarıldı' | 'Uzman yanıtladı' | 'Kapatıldı';
  expertId: string;
  priority: Analysis['priority'];
  sla: string;
  summary: string;
};

type Message = {
  id: string;
  from: 'user' | 'ai' | 'expert' | 'system';
  text: string;
};

const experts: Expert[] = [
  {
    id: 'ux',
    name: 'Derya',
    role: 'UX Uzmanı',
    scope: 'Akış, kullanılabilirlik, ekran metinleri',
    skills: ['Akış', 'Form', 'Mobil'],
    online: true,
    eta: '2 dk',
    color: '#2667ff',
  },
  {
    id: 'product',
    name: 'Mert',
    role: 'Ürün Mentoru',
    scope: 'Kapsam, MVP kararı, önceliklendirme',
    skills: ['MVP', 'Roadmap', 'Scope'],
    online: true,
    eta: '4 dk',
    color: '#0f8a5f',
  },
  {
    id: 'tech',
    name: 'Selin',
    role: 'Teknik Uzman',
    scope: 'API, mimari, entegrasyon riski',
    skills: ['API', 'Veri', 'Build'],
    online: false,
    eta: '12 dk',
    color: '#7c3aed',
  },
  {
    id: 'field',
    name: 'Eren',
    role: 'Alan Uzmanı',
    scope: 'Hukuk, sağlık, finans gibi hassas alanlar',
    skills: ['Risk', 'Uyum', 'Kaynak'],
    online: true,
    eta: '6 dk',
    color: '#c2410c',
  },
];

const initialIdea =
  'Nokta, kullanıcının fikrini dinleyip önce AI ile toparlasın; güven düşükse veya konu hassassa insan uzmana devretsin.';

const initialMessages: Message[] = [
  {
    id: 'm-0',
    from: 'system',
    text: 'Nokta hazır. Fikri yaz, AI önce değerlendirsin; gerekirse insan uzmana aktaralım.',
  },
];

function pickExpertId(text: string, hasSensitiveRisk: boolean) {
  const lower = text.toLocaleLowerCase('tr-TR');

  if (hasSensitiveRisk) {
    return 'field';
  }

  if (lower.includes('api') || lower.includes('veri') || lower.includes('mimari') || lower.includes('build')) {
    return 'tech';
  }

  if (lower.includes('ekran') || lower.includes('tasarım') || lower.includes('arayüz') || lower.includes('akış')) {
    return 'ux';
  }

  return 'product';
}

function buildAnalysis(rawIdea: string): Analysis {
  const idea = rawIdea.trim() || initialIdea;
  const lower = idea.toLocaleLowerCase('tr-TR');
  const sensitiveTerms = ['sağlık', 'hukuk', 'finans', 'para', 'doktor', 'terapi', 'yatırım', 'kişisel veri'];
  const hasSensitiveRisk = sensitiveTerms.some((term) => lower.includes(term));
  const hasUnclearScope = idea.length < 90 || lower.includes('bir şey') || lower.includes('uygulama olsun');
  const hasHumanIntent = lower.includes('uzman') || lower.includes('insan') || lower.includes('destek');

  let confidence = 82;
  if (hasUnclearScope) confidence -= 18;
  if (hasSensitiveRisk) confidence -= 12;
  if (hasHumanIntent) confidence += 5;
  if (lower.includes('mvp') || lower.includes('kapsam')) confidence += 6;
  confidence = Math.max(38, Math.min(96, confidence));

  const flags: string[] = [];
  if (hasUnclearScope) flags.push('Kapsam netlestirilmeli');
  if (hasSensitiveRisk) flags.push('Hassas alan kontrolu');
  if (confidence < 72) flags.push('AI guveni dusuk');
  if (!hasHumanIntent) flags.push('Manuel onay opsiyonel');

  const expertId = pickExpertId(idea, hasSensitiveRisk);
  const expert = experts.find((item) => item.id === expertId) ?? experts[1];
  const priority: Analysis['priority'] = hasSensitiveRisk ? 'Kritik' : confidence < 70 ? 'Yuksek' : 'Normal';
  const sla = priority === 'Kritik' ? '10 dk içinde ilk dönüş' : priority === 'Yuksek' ? '20 dk içinde ilk dönüş' : 'Aynı ders saati içinde';
  const domain = hasSensitiveRisk ? 'Hassas karar desteği' : expertId === 'tech' ? 'Teknik doğrulama' : expertId === 'ux' ? 'Deneyim iyileştirme' : 'Ürün kapsamı';

  const summary =
    `Kullanıcı Nokta'dan "${idea.slice(0, 120)}${idea.length > 120 ? '...' : ''}" isteği için AI + insan uzman desteği bekliyor. ` +
    `Önerilen uzman: ${expert.role}. Öncelik: ${priority}.`;

  const handoffReason =
    confidence < 72 || hasSensitiveRisk
      ? 'Bu çıktı uzmana aktarılmalı; karar etkisi yüksek veya AI güveni yeterince güçlü değil.'
      : 'AI yanıtı kullanılabilir; kullanıcı isterse uzman kontrolü ile son karar alınabilir.';

  const aiAnswer =
    `Nokta analizi: İstek ${domain.toLocaleLowerCase('tr-TR')} alanına düşüyor. ` +
    `Önce problemi, kullanıcıyı ve başarı ölçütünü tek cümlede sabitle. ` +
    `Sonra ${expert.role} görüşüyle riskleri kontrol et. ${handoffReason}`;

  return {
    confidence,
    domain,
    priority,
    sla,
    expertId,
    flags,
    aiAnswer,
    summary,
    handoffReason,
  };
}

function formatTicketId() {
  const date = new Date();
  const part = `${date.getHours()}${date.getMinutes()}${date.getSeconds()}`.padStart(6, '0');
  return `NKT-${part}`;
}

function AppButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'danger' && styles.buttonDanger,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      <Text style={[styles.buttonText, variant === 'secondary' && styles.buttonSecondaryText]}>{label}</Text>
    </Pressable>
  );
}

function Chip({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'good' | 'warn' | 'danger' }) {
  return (
    <View style={[styles.chip, tone === 'good' && styles.chipGood, tone === 'warn' && styles.chipWarn, tone === 'danger' && styles.chipDanger]}>
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

export default function App() {
  const [mode, setMode] = useState<Mode>('ai');
  const [idea, setIdea] = useState(initialIdea);
  const [analysis, setAnalysis] = useState<Analysis>(() => buildAnalysis(initialIdea));
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const selectedExpert = useMemo(
    () => experts.find((expert) => expert.id === (ticket?.expertId ?? analysis.expertId)) ?? experts[1],
    [analysis.expertId, ticket?.expertId],
  );

  const runAiCheck = () => {
    const nextAnalysis = buildAnalysis(idea);
    setAnalysis(nextAnalysis);
    setMode('ai');
    setMessages((current) => [
      ...current,
      { id: `m-${current.length + 1}`, from: 'user', text: idea.trim() || initialIdea },
      { id: `m-${current.length + 2}`, from: 'ai', text: nextAnalysis.aiAnswer },
    ]);
  };

  const transferToHuman = () => {
    const nextAnalysis = buildAnalysis(idea);
    const expert = experts.find((item) => item.id === nextAnalysis.expertId) ?? experts[1];
    const nextTicket: Ticket = {
      id: formatTicketId(),
      status: 'Uzmana aktarıldı',
      expertId: expert.id,
      priority: nextAnalysis.priority,
      sla: nextAnalysis.sla,
      summary: nextAnalysis.summary,
    };

    setAnalysis(nextAnalysis);
    setTicket(nextTicket);
    setMode('human');
    setMessages((current) => [
      ...current,
      {
        id: `m-${current.length + 1}`,
        from: 'system',
        text: `${nextTicket.id} açıldı. ${expert.role} ${expert.name} için özet ve risk bayrakları hazırlandı.`,
      },
      {
        id: `m-${current.length + 2}`,
        from: 'expert',
        text: `${expert.name}: Talebi devraldım. İlk kontrolüm: ${nextAnalysis.handoffReason}`,
      },
    ]);
  };

  const addExpertReply = () => {
    if (!ticket) return;
    const expert = experts.find((item) => item.id === ticket.expertId) ?? selectedExpert;
    setTicket({ ...ticket, status: 'Uzman yanıtladı' });
    setMessages((current) => [
      ...current,
      {
        id: `m-${current.length + 1}`,
        from: 'expert',
        text:
          `${expert.name}: AI çıktısını doğrudan son karar yapma. ` +
          `Önce kullanıcı varsayımını doğrula, sonra en küçük güvenli denemeyi seç. ` +
          `Bu ticket için önerim: ${analysis.priority === 'Kritik' ? 'kaynak ve onay kontrolü olmadan yayınlama' : 'MVP kapsamını daraltıp test et'}.`,
      },
    ]);
  };

  const closeTicket = () => {
    if (!ticket) return;
    setTicket({ ...ticket, status: 'Kapatıldı' });
    setMessages((current) => [
      ...current,
      {
        id: `m-${current.length + 1}`,
        from: 'system',
        text: `${ticket.id} kapatıldı. Uzman notu Nokta karar geçmişine eklendi.`,
      },
    ]);
  };

  const confidenceTone = analysis.confidence >= 80 ? 'good' : analysis.confidence >= 65 ? 'warn' : 'danger';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View>
              <Text style={styles.brand}>Nokta</Text>
              <Text style={styles.subtitle}>AI yanıtı + insan uzman desteği</Text>
            </View>
            <View style={styles.liveBadge}>
              <Text style={styles.liveDot}>●</Text>
              <Text style={styles.liveText}>Canlı</Text>
            </View>
          </View>

          <View style={styles.hero}>
            <View style={styles.avatarWrap}>
              <View style={[styles.avatarRing, { borderColor: selectedExpert.color }]} />
              <View style={styles.avatarCore}>
                <Text style={styles.avatarText}>N</Text>
              </View>
            </View>
            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>{ticket ? 'Nokta uzmana bağlandı' : 'Nokta önce değerlendirir'}</Text>
              <Text style={styles.heroText}>
                AI güveni düşükse, konu hassassa veya kullanıcı isterse özet insan uzmana aktarılır.
              </Text>
            </View>
          </View>

          <View style={styles.segment}>
            <Pressable onPress={() => setMode('ai')} style={[styles.segmentItem, mode === 'ai' && styles.segmentActive]}>
              <Text style={[styles.segmentText, mode === 'ai' && styles.segmentActiveText]}>AI</Text>
            </Pressable>
            <Pressable onPress={() => setMode('human')} style={[styles.segmentItem, mode === 'human' && styles.segmentActive]}>
              <Text style={[styles.segmentText, mode === 'human' && styles.segmentActiveText]}>Uzman</Text>
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Kullanıcı isteği</Text>
            <TextInput
              multiline
              value={idea}
              onChangeText={setIdea}
              placeholder="Nokta'ya anlatılacak fikri veya problemi yaz"
              placeholderTextColor="#7a8496"
              style={styles.input}
              textAlignVertical="top"
            />
            <View style={styles.actionRow}>
              <AppButton label="AI değerlendir" onPress={runAiCheck} />
              <AppButton label="İnsan uzmana aktar" onPress={transferToHuman} variant="secondary" />
            </View>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>AI güveni</Text>
              <Text style={styles.metricValue}>%{analysis.confidence}</Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    confidenceTone === 'good' && styles.progressGood,
                    confidenceTone === 'warn' && styles.progressWarn,
                    confidenceTone === 'danger' && styles.progressDanger,
                    { width: `${analysis.confidence}%` },
                  ]}
                />
              </View>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Öncelik</Text>
              <Text style={styles.metricValue}>{analysis.priority}</Text>
              <Text style={styles.metricSmall}>{analysis.sla}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Nokta değerlendirmesi</Text>
            <Text style={styles.bodyText}>{analysis.aiAnswer}</Text>
            <View style={styles.chipRow}>
              <Chip label={analysis.domain} tone="good" />
              {analysis.flags.map((flag) => (
                <Chip key={flag} label={flag} tone={flag.includes('Hassas') || flag.includes('dusuk') ? 'danger' : 'warn'} />
              ))}
            </View>
          </View>

          {mode === 'human' && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Uzman havuzu</Text>
                {experts.map((expert) => {
                  const active = expert.id === selectedExpert.id;
                  return (
                    <View key={expert.id} style={[styles.expertRow, active && { borderColor: expert.color }]}>
                      <View style={[styles.expertAccent, { backgroundColor: expert.color }]} />
                      <View style={styles.expertMain}>
                        <Text style={styles.expertName}>{expert.name} · {expert.role}</Text>
                        <Text style={styles.expertScope}>{expert.scope}</Text>
                        <View style={styles.chipRowCompact}>
                          {expert.skills.map((skill) => (
                            <Chip key={skill} label={skill} />
                          ))}
                        </View>
                      </View>
                      <Text style={styles.expertEta}>{expert.online ? expert.eta : 'Meşgul'}</Text>
                    </View>
                  );
                })}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Destek bileti</Text>
                {ticket ? (
                  <View>
                    <View style={styles.ticketHeader}>
                      <Text style={styles.ticketId}>{ticket.id}</Text>
                      <Chip label={ticket.status} tone={ticket.status === 'Kapatıldı' ? 'neutral' : 'good'} />
                    </View>
                    <Text style={styles.bodyText}>{ticket.summary}</Text>
                    <View style={styles.actionRow}>
                      <AppButton label="Uzman yanıtı al" onPress={addExpertReply} />
                      <AppButton label="Ticket kapat" onPress={closeTicket} variant="danger" />
                    </View>
                  </View>
                ) : (
                  <Text style={styles.emptyText}>Henüz uzman bileti açılmadı. Aktarım butonu AI özetini uzman paneline taşır.</Text>
                )}
              </View>
            </>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Konuşma kaydı</Text>
            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.message,
                  message.from === 'user' && styles.message_user,
                  message.from === 'ai' && styles.message_ai,
                  message.from === 'expert' && styles.message_expert,
                  message.from === 'system' && styles.message_system,
                ]}
              >
                <Text style={styles.messageFrom}>
                  {message.from === 'user' ? 'Kullanıcı' : message.from === 'ai' ? 'Nokta AI' : message.from === 'expert' ? selectedExpert.role : 'Sistem'}
                </Text>
                <Text style={styles.messageText}>{message.text}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f7fb',
  },
  keyboard: {
    flex: 1,
  },
  content: {
    padding: 18,
    paddingBottom: 40,
    gap: 14,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  brand: {
    color: '#172033',
    fontSize: 32,
    fontWeight: '800',
  },
  subtitle: {
    color: '#5c6678',
    fontSize: 14,
    marginTop: 2,
  },
  liveBadge: {
    alignItems: 'center',
    backgroundColor: '#e9f8ef',
    borderColor: '#bde6cb',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  liveDot: {
    color: '#0f8a5f',
    fontSize: 12,
  },
  liveText: {
    color: '#145c3d',
    fontSize: 12,
    fontWeight: '700',
  },
  hero: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#dce3ee',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 16,
    padding: 16,
  },
  avatarWrap: {
    alignItems: 'center',
    height: 88,
    justifyContent: 'center',
    width: 88,
  },
  avatarRing: {
    borderRadius: 43,
    borderWidth: 3,
    height: 86,
    opacity: 0.7,
    position: 'absolute',
    width: 86,
  },
  avatarCore: {
    alignItems: 'center',
    backgroundColor: '#172033',
    borderRadius: 31,
    height: 62,
    justifyContent: 'center',
    width: 62,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '900',
  },
  heroCopy: {
    flex: 1,
  },
  heroTitle: {
    color: '#172033',
    fontSize: 19,
    fontWeight: '800',
  },
  heroText: {
    color: '#596476',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  segment: {
    backgroundColor: '#e8edf5',
    borderRadius: 14,
    flexDirection: 'row',
    padding: 4,
  },
  segmentItem: {
    alignItems: 'center',
    borderRadius: 11,
    flex: 1,
    paddingVertical: 11,
  },
  segmentActive: {
    backgroundColor: '#ffffff',
  },
  segmentText: {
    color: '#5c6678',
    fontSize: 14,
    fontWeight: '800',
  },
  segmentActiveText: {
    color: '#172033',
  },
  section: {
    backgroundColor: '#ffffff',
    borderColor: '#dce3ee',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  sectionLabel: {
    color: '#30394a',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderColor: '#cdd6e3',
    borderRadius: 12,
    borderWidth: 1,
    color: '#172033',
    fontSize: 15,
    minHeight: 118,
    padding: 13,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#172033',
    borderRadius: 12,
    minHeight: 46,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  buttonSecondary: {
    backgroundColor: '#eef4ff',
    borderColor: '#b8ccff',
    borderWidth: 1,
  },
  buttonDanger: {
    backgroundColor: '#c2410c',
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  buttonSecondaryText: {
    color: '#1d4ed8',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  metricBox: {
    backgroundColor: '#ffffff',
    borderColor: '#dce3ee',
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    minHeight: 112,
    padding: 14,
  },
  metricLabel: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  metricValue: {
    color: '#172033',
    fontSize: 28,
    fontWeight: '900',
    marginTop: 8,
  },
  metricSmall: {
    color: '#596476',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 8,
  },
  progressTrack: {
    backgroundColor: '#e5eaf2',
    borderRadius: 8,
    height: 9,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 8,
    height: 9,
  },
  progressGood: {
    backgroundColor: '#0f8a5f',
  },
  progressWarn: {
    backgroundColor: '#b46a00',
  },
  progressDanger: {
    backgroundColor: '#c2410c',
  },
  bodyText: {
    color: '#30394a',
    fontSize: 15,
    lineHeight: 22,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  chipRowCompact: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  chip: {
    backgroundColor: '#eef2f7',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipGood: {
    backgroundColor: '#e7f6ed',
  },
  chipWarn: {
    backgroundColor: '#fff5dc',
  },
  chipDanger: {
    backgroundColor: '#fee9df',
  },
  chipText: {
    color: '#30394a',
    fontSize: 12,
    fontWeight: '800',
  },
  expertRow: {
    alignItems: 'center',
    borderColor: '#dce3ee',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
    padding: 12,
  },
  expertAccent: {
    borderRadius: 5,
    height: 46,
    width: 6,
  },
  expertMain: {
    flex: 1,
  },
  expertName: {
    color: '#172033',
    fontSize: 15,
    fontWeight: '900',
  },
  expertScope: {
    color: '#596476',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  expertEta: {
    color: '#30394a',
    fontSize: 12,
    fontWeight: '900',
  },
  ticketHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  ticketId: {
    color: '#172033',
    fontSize: 18,
    fontWeight: '900',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
    lineHeight: 20,
  },
  message: {
    borderRadius: 14,
    marginBottom: 10,
    padding: 12,
  },
  message_user: {
    backgroundColor: '#eef4ff',
  },
  message_ai: {
    backgroundColor: '#edf8f3',
  },
  message_expert: {
    backgroundColor: '#fff5dc',
  },
  message_system: {
    backgroundColor: '#f1f3f7',
  },
  messageFrom: {
    color: '#596476',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 4,
  },
  messageText: {
    color: '#243044',
    fontSize: 14,
    lineHeight: 20,
  },
});
