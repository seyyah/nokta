import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';

interface Message { id: string; role: 'user' | 'assistant'; content: string; }
interface Idea { id: string; spark: string; maturity: string; createdAt: string; spec?: Record<string, string>; }

const QUESTIONS = [
  (spark: string) => `Ham fikrin: "${spark}"\n\nSoru 1/5 — PROBLEM\nBu fikir hangi gerçek problemi çözüyor?`,
  () => `Soru 2/5 — KULLANICI\nBu problemi en çok kim yaşıyor? Hedef kullanıcını tanımla.`,
  () => `Soru 3/5 — KAPSAM\nEn küçük çalışan versiyonu tek cümleyle tanımla.`,
  () => `Soru 4/5 — KISIT\nKesinlikle dışarıda kalması gerekenler neler?`,
  () => `Soru 5/5 — BAŞARI METRİĞİ\nBu fikrin işe yaradığını nasıl ölçersin?`,
];

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const raw = await AsyncStorage.getItem('@nokta/ideas');
    if (!raw) return;
    const ideas: Idea[] = JSON.parse(raw);
    const found = ideas.find(i => i.id === id);
    if (!found) return;
    setIdea(found);
    const msgRaw = await AsyncStorage.getItem(`@nokta/idea/${id}`);
    if (msgRaw) {
      const saved: Message[] = JSON.parse(msgRaw);
      setMessages(saved);
      setQIndex(Math.min(saved.filter(m => m.role === 'user').length, QUESTIONS.length));
    } else {
      const first: Message = { id: Date.now().toString(), role: 'assistant', content: QUESTIONS[0](found.spark) };
      setMessages([first]);
      await AsyncStorage.setItem(`@nokta/idea/${id}`, JSON.stringify([first]));
    }
  };

  const send = async () => {
    if (!input.trim() || loading || !idea) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);
    const answers = newMsgs.filter(m => m.role === 'user').map(m => m.content);
    const next = qIndex + 1;
    setQIndex(next);
    await new Promise(r => setTimeout(r, 500));
    let reply: Message;
    if (next < QUESTIONS.length) {
      reply = { id: (Date.now() + 1).toString(), role: 'assistant', content: QUESTIONS[next]() };
    } else {
      reply = { id: (Date.now() + 1).toString(), role: 'assistant', content: `Harika! 🎉 Fikrin olgunlaştı. Spec kartını görmek için aşağıdaki butona bas!` };
      const spec = { problem: answers[0] || '', user: answers[1] || '', scope: answers[2] || '', constraint: answers[3] || '', successMetric: answers[4] || '', spark: idea.spark };
      const allRaw = await AsyncStorage.getItem('@nokta/ideas');
      if (allRaw) {
        const all: Idea[] = JSON.parse(allRaw);
        const updated = all.map(i => i.id === idea.id ? { ...i, maturity: 'page', spec } : i);
        await AsyncStorage.setItem('@nokta/ideas', JSON.stringify(updated));
        setIdea({ ...idea, maturity: 'page', spec });
      }
    }
    const final = [...newMsgs, reply];
    setMessages(final);
    await AsyncStorage.setItem(`@nokta/idea/${id}`, JSON.stringify(final));
    setLoading(false);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.progress}>
        <View style={[styles.bar, { width: `${(Math.min(qIndex, 5) / 5) * 100}%` }]} />
      </View>
      <Text style={styles.progressText}>{Math.min(qIndex, 5)} / 5 soru</Text>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={m => m.id}
        contentContainerStyle={{ padding: 16, gap: 8 }}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.aiBubble]}>
            <Text style={[styles.bubbleText, { color: item.role === 'user' ? '#cce4ff' : '#e0e0e0' }]}>{item.content}</Text>
          </View>
        )}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
      />

      {loading && <ActivityIndicator color="#4a90e2" style={{ padding: 8 }} />}

      {idea?.maturity === 'page' ? (
        <TouchableOpacity style={styles.specBtn} onPress={() => router.push({ pathname: '/spec', params: { id } })}>
          <Text style={styles.specBtnText}>📄 Spec Kartını Gör →</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Cevabını yaz..."
            placeholderTextColor="#555"
            value={input}
            onChangeText={setInput}
            multiline
            editable={!loading}
          />
          <TouchableOpacity style={[styles.sendBtn, !input.trim() && { backgroundColor: '#2a2a2a' }]} onPress={send}>
            <Text style={{ color: '#fff', fontSize: 18 }}>→</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  progress: { height: 3, backgroundColor: '#2a2a2a' },
  bar: { height: 3, backgroundColor: '#4a90e2' },
  progressText: { color: '#555', fontSize: 11, padding: 8, paddingBottom: 0 },
  bubble: { maxWidth: '85%', borderRadius: 16, padding: 12 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#1e3a5f' },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#1e1e1e' },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  specBtn: { margin: 16, backgroundColor: '#7ed321', borderRadius: 12, padding: 16, alignItems: 'center' },
  specBtnText: { color: '#000', fontSize: 16, fontWeight: '700' },
  inputRow: { flexDirection: 'row', padding: 12, gap: 8, borderTopWidth: 1, borderTopColor: '#1e1e1e' },
  input: { flex: 1, backgroundColor: '#1a1a1a', borderRadius: 12, padding: 12, color: '#fff', fontSize: 15, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#4a90e2', justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-end' },
});