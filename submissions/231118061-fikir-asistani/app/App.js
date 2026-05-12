import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, SafeAreaView
} from 'react-native';

const GEMINI_API_KEY = 'AIzaSyDEMO_REPLACE_WITH_REAL_KEY';

const SYSTEM_PROMPT = `Sen bir ürün geliştirme asistanısın. Kullanıcı sana ham bir uygulama fikri verecek.
Görevin: Tam olarak 4 mühendislik sorusu sor. Her soru şunlardan birini netleştirmeli:
1. Problem — gerçek bir ağrı noktası mı?
2. Kullanıcı — kim kullanacak, kaç kişi?
3. Kapsam — MVP'de ne var, ne yok?
4. Kısıt — teknik, yasal veya iş kısıtları var mı?
Soruları Türkçe sor. Numaralı liste olarak ver. Başka bir şey yazma, sadece 4 soru.`;

const SPEC_PROMPT = `Kullanıcının fikri ve verdiği cevaplara dayanarak tek sayfalık bir ürün spec'i yaz.
Şu başlıkları kullan:
## Problem
## Hedef Kullanıcı
## Çözüm (MVP)
## Kapsam Dışı
## Başarı Kriteri
Türkçe yaz. Kısa ve net ol. Toplam 200 kelimeyi geçme.`;

export default function App() {
  const [stage, setStage] = useState('input');
  const [idea, setIdea] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [spec, setSpec] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);

  const callGemini = async (messages, system) => {
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: system }] },
          contents,
        }),
      }
    );
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.candidates[0].content.parts[0].text;
  };

  const handleIdeaSubmit = async () => {
    if (!idea.trim()) { setError('Lütfen bir fikir yaz.'); return; }
    setError('');
    setLoading(true);
    try {
      const text = await callGemini(
        [{ role: 'user', content: `Ham fikrim: ${idea}` }],
        SYSTEM_PROMPT
      );
      const parsed = text
        .split('\n')
        .filter(l => l.match(/^\d+[\.\)]/))
        .map(l => l.replace(/^\d+[\.\)]\s*/, '').trim())
        .filter(Boolean);
      const finalQ = parsed.length >= 2 ? parsed : text.split('\n').filter(Boolean).slice(0, 4);
      setQuestions(finalQ);
      setAnswers(new Array(finalQ.length).fill(''));
      setStage('questions');
    } catch (e) {
      setError('Hata: ' + e.message);
    }
    setLoading(false);
  };

  const handleAnswersSubmit = async () => {
    if (answers.some(a => !a.trim())) { setError('Lütfen tüm soruları yanıtla.'); return; }
    setError('');
    setLoading(true);
    try {
      const qa = questions.map((q, i) => `Soru: ${q}\nCevap: ${answers[i]}`).join('\n\n');
      const text = await callGemini(
        [{ role: 'user', content: `Fikir: ${idea}\n\n${qa}` }],
        SPEC_PROMPT
      );
      setSpec(text);
      setStage('spec');
    } catch (e) {
      setError('Hata: ' + e.message);
    }
    setLoading(false);
  };

  const reset = () => {
    setStage('input'); setIdea(''); setQuestions([]);
    setAnswers([]); setSpec(''); setError('');
  };

  const stageIdx = ['input', 'questions', 'spec'].indexOf(stage);

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView ref={scrollRef} style={s.scroll} contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">

          <View style={s.header}>
            <Text style={s.logo}>◎ NOKTA</Text>
            <Text style={s.sub}>Fikir → Spec Asistanı</Text>
          </View>

          <View style={s.progress}>
            {['Fikir', 'Sorular', 'Spec'].map((label, i) => (
              <View key={label} style={s.stepWrap}>
                <View style={[s.stepDot, i <= stageIdx && s.stepDotActive]}>
                  <Text style={[s.stepNum, i <= stageIdx && s.stepNumActive]}>{i + 1}</Text>
                </View>
                <Text style={[s.stepLabel, i <= stageIdx && s.stepLabelActive]}>{label}</Text>
                {i < 2 && <View style={[s.stepLine, i < stageIdx && s.stepLineActive]} />}
              </View>
            ))}
          </View>

          {error ? <Text style={s.error}>{error}</Text> : null}

          {stage === 'input' && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Ham fikrin nedir?</Text>
              <Text style={s.cardDesc}>Aklındaki uygulama fikrini kısaca anlat. AI sana 4 mühendislik sorusu soracak ve bir spec dosyası üretecek.</Text>
              <TextInput
                style={s.textarea}
                multiline
                numberOfLines={5}
                placeholder="Örnek: Üniversite öğrencileri için ders notu paylaşım uygulaması..."
                placeholderTextColor="#555"
                value={idea}
                onChangeText={setIdea}
              />
              <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handleIdeaSubmit} disabled={loading}>
                {loading ? <ActivityIndicator color="#000" /> : <Text style={s.btnText}>Soruları Getir →</Text>}
              </TouchableOpacity>
            </View>
          )}

          {stage === 'questions' && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Mühendislik Soruları</Text>
              <Text style={s.cardDesc}>Fikrin: "{idea}"</Text>
              {questions.map((q, i) => (
                <View key={i} style={s.qBlock}>
                  <Text style={s.qText}>{i + 1}. {q}</Text>
                  <TextInput
                    style={s.input}
                    placeholder="Cevabın..."
                    placeholderTextColor="#555"
                    value={answers[i] || ''}
                    onChangeText={val => {
                      const copy = [...answers];
                      copy[i] = val;
                      setAnswers(copy);
                    }}
                    multiline
                  />
                </View>
              ))}
              <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handleAnswersSubmit} disabled={loading}>
                {loading ? <ActivityIndicator color="#000" /> : <Text style={s.btnText}>Spec Üret →</Text>}
              </TouchableOpacity>
            </View>
          )}

          {stage === 'spec' && (
            <View style={s.card}>
              <Text style={s.specBadge}>✓ SPEC HAZIR</Text>
              <Text style={s.specText}>{spec}</Text>
              <TouchableOpacity style={s.btnSecondary} onPress={reset}>
                <Text style={s.btnSecondaryText}>← Yeni Fikir</Text>
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0a0a0a' },
  scroll: { flex: 1 },
  container: { padding: 20, paddingBottom: 60 },
  header: { alignItems: 'center', marginVertical: 28 },
  logo: { fontSize: 26, fontWeight: '700', color: '#fff', letterSpacing: 6 },
  sub: { fontSize: 13, color: '#666', marginTop: 4, letterSpacing: 1 },
  progress: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 28 },
  stepWrap: { flexDirection: 'row', alignItems: 'center' },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333', alignItems: 'center', justifyContent: 'center' },
  stepDotActive: { backgroundColor: '#fff', borderColor: '#fff' },
  stepNum: { fontSize: 12, fontWeight: '600', color: '#555' },
  stepNumActive: { color: '#000' },
  stepLabel: { fontSize: 11, color: '#444', marginHorizontal: 6 },
  stepLabelActive: { color: '#aaa' },
  stepLine: { width: 20, height: 1, backgroundColor: '#222' },
  stepLineActive: { backgroundColor: '#555' },
  error: { color: '#ff4444', fontSize: 13, textAlign: 'center', marginBottom: 12, backgroundColor: '#1a0000', padding: 10, borderRadius: 8 },
  card: { backgroundColor: '#111', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#1f1f1f' },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 8 },
  cardDesc: { fontSize: 13, color: '#666', marginBottom: 18, lineHeight: 19 },
  textarea: { backgroundColor: '#0d0d0d', borderWidth: 1, borderColor: '#222', borderRadius: 10, padding: 14, color: '#fff', fontSize: 14, minHeight: 100, textAlignVertical: 'top', marginBottom: 16 },
  input: { backgroundColor: '#0d0d0d', borderWidth: 1, borderColor: '#222', borderRadius: 10, padding: 12, color: '#fff', fontSize: 13, textAlignVertical: 'top', marginTop: 8, minHeight: 60 },
  qBlock: { marginBottom: 18 },
  qText: { fontSize: 13, color: '#ccc', lineHeight: 19, fontWeight: '500' },
  btn: { backgroundColor: '#fff', borderRadius: 10, padding: 15, alignItems: 'center', marginTop: 4 },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#000', fontWeight: '700', fontSize: 14 },
  btnSecondary: { borderWidth: 1, borderColor: '#333', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 12 },
  btnSecondaryText: { color: '#888', fontSize: 14 },
  specBadge: { color: '#4ade80', fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 16 },
  specText: { color: '#ddd', fontSize: 13, lineHeight: 22 },
});
