import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { getHistory, deleteAnalysis } from '../services/storageService';

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    const data = await getHistory();
    setHistory(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadHistory);
    return unsubscribe;
  }, [navigation, loadHistory]);

  const handleDelete = (id, title) => {
    Alert.alert(
      'Analizi Sil',
      `"${title}" analizini silmek istiyor musun?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil', style: 'destructive',
          onPress: async () => {
            await deleteAnalysis(id);
            loadHistory();
          },
        },
      ]
    );
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7C6FFF" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#080814', '#0d0d1a', '#080814']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Geçmiş Analizler</Text>
          <View style={styles.count}>
            <Text style={styles.countText}>{history.length}</Text>
          </View>
        </View>

        {history.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>Henüz hiç analiz yok</Text>
            <Text style={styles.emptySubtext}>İlk fikrini analiz etmeye başla</Text>
          </View>
        ) : (
          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('Spec', {
                  idea: item.idea,
                  answers: item.answers,
                  spec: item.spec,
                  score: item.score,
                  stack: item.stack,
                  fromHistory: true,
                })}
                onLongPress={() => handleDelete(item.id, item.spec?.title || item.idea)}
              >
                <LinearGradient
                  colors={['#1a1a2e', '#16213e']}
                  style={styles.cardGradient}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.scoreBadge}>
                      <Text style={styles.scoreBadgeText}>{item.score?.total ?? '—'}</Text>
                    </View>
                    <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
                  </View>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.spec?.title || item.idea}
                  </Text>
                  <Text style={styles.cardIdea} numberOfLines={1}>
                    💡 {item.idea}
                  </Text>
                  <Text style={styles.cardHint}>Uzun bas → Sil</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#080814' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backBtn: { padding: 8, marginRight: 8 },
  backIcon: { fontSize: 22, color: '#7C6FFF' },
  title: { flex: 1, fontSize: 20, fontWeight: '700', color: '#fff' },
  count: {
    backgroundColor: '#7C6FFF33',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countText: { color: '#7C6FFF', fontWeight: '700', fontSize: 14 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 18, color: '#fff', fontWeight: '600' },
  emptySubtext: { fontSize: 14, color: '#888' },
  list: { paddingHorizontal: 20, paddingBottom: 32, gap: 12 },
  card: { borderRadius: 16, overflow: 'hidden' },
  cardGradient: { padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#ffffff15' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  scoreBadge: {
    backgroundColor: '#7C6FFF',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 40,
    alignItems: 'center',
  },
  scoreBadgeText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  cardDate: { color: '#666', fontSize: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 6 },
  cardIdea: { fontSize: 13, color: '#aaa', marginBottom: 6 },
  cardHint: { fontSize: 11, color: '#555', textAlign: 'right' },
});
