import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';

interface Idea {
  id: string;
  spark: string;
  maturity: 'dot' | 'page';
  createdAt: string;
  spec?: Record<string, string>;
}

export default function HomeScreen() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [spark, setSpark] = useState('');

  const loadIdeas = async () => {
    const raw = await AsyncStorage.getItem('@nokta/ideas');
    if (raw) setIdeas(JSON.parse(raw));
  };

  useFocusEffect(useCallback(() => { loadIdeas(); }, []));

  const createIdea = async () => {
    if (!spark.trim()) return;
    const newIdea: Idea = {
      id: Date.now().toString(),
      spark: spark.trim(),
      maturity: 'dot',
      createdAt: new Date().toISOString(),
    };
    const updated = [newIdea, ...ideas];
    await AsyncStorage.setItem('@nokta/ideas', JSON.stringify(updated));
    setIdeas(updated);
    setSpark('');
    setModalVisible(false);
    router.push({ pathname: '/chat', params: { id: newIdea.id } });
  };

  const deleteIdea = (id: string) => {
    Alert.alert('Sil', 'Bu fikir silinecek.', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => {
        const updated = ideas.filter(i => i.id !== id);
        await AsyncStorage.setItem('@nokta/ideas', JSON.stringify(updated));
        setIdeas(updated);
      }},
    ]);
  };

  return (
    <View style={styles.container}>
      {ideas.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyDot}>·</Text>
          <Text style={styles.emptyTitle}>Bir noktadan başla.</Text>
          <Text style={styles.emptySub}>Ham fikrini yaz, gerisini biz soralım.</Text>
        </View>
      ) : (
        <FlatList
          data={ideas}
          keyExtractor={i => i.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push({ pathname: item.maturity === 'page' ? '/spec' : '/chat', params: { id: item.id } })}
              onLongPress={() => deleteIdea(item.id)}
            >
              <Text style={styles.cardIcon}>{item.maturity === 'page' ? '📄' : '●'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardSpark}>{item.spark}</Text>
                <Text style={styles.cardDate}>{new Date(item.createdAt).toLocaleDateString('tr-TR')} · {item.maturity.toUpperCase()}</Text>
              </View>
              <Text style={{ color: '#444', fontSize: 20 }}>›</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Yeni Fikir</Text>
            <TextInput
              style={styles.input}
              placeholder="örn: drone kargo, öğrenci bütçe..."
              placeholderTextColor="#555"
              value={spark}
              onChangeText={setSpark}
              onSubmitEditing={createIdea}
              autoFocus
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
              <TouchableOpacity onPress={() => { setModalVisible(false); setSpark(''); }}>
                <Text style={{ color: '#888', fontSize: 15, padding: 12 }}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={createIdea}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Başlat →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyDot: { fontSize: 80, color: '#4a90e2' },
  emptyTitle: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 16 },
  emptySub: { color: '#666', fontSize: 14, textAlign: 'center', marginTop: 8 },
  card: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIcon: { fontSize: 20, color: '#4a90e2', width: 30 },
  cardSpark: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cardDate: { color: '#666', fontSize: 12, marginTop: 4 },
  fab: { position: 'absolute', bottom: 32, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#4a90e2', justifyContent: 'center', alignItems: 'center' },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 32 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#1a1a1a', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 16 },
  input: { backgroundColor: '#2a2a2a', borderRadius: 10, padding: 14, color: '#fff', fontSize: 16 },
  submitBtn: { backgroundColor: '#4a90e2', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 12 },
});