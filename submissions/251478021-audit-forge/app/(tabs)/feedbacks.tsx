import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, Image, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function FeedbacksScreen() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadFeedbacks = async () => {
    try {
      const data = await AsyncStorage.getItem('user_feedbacks');
      if (data) {
        setFeedbacks(JSON.parse(data));
      }
    } catch (error) {
      console.error('Failed to load feedbacks', error);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFeedbacks();
    setRefreshing(false);
  }, []);

  const deleteFeedback = async (id: string) => {
    Alert.alert(
      'Sil',
      'Bu geri bildirimi silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: async () => {
            try {
              const updated = feedbacks.filter(f => f.id !== id);
              await AsyncStorage.setItem('user_feedbacks', JSON.stringify(updated));
              setFeedbacks(updated);
            } catch (error) {
              Alert.alert('Hata', 'Silinemedi.');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tasarım Düzeltmeleri</Text>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
        }
      >
        {feedbacks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbox-ellipses-outline" size={80} color="#334155" />
            <Text style={styles.emptyText}>Henüz tasarım düzeltme kaydı yok.</Text>
            <Text style={styles.emptySubText}>Anasayfadaki "Tasarım Düzelt" butonu ile ilk düzeltme kaydını oluşturabilirsiniz.</Text>
          </View>
        ) : (
          feedbacks.map((fb) => (
            <View key={fb.id} style={styles.card}>
              {fb.image && (
                <Image source={{ uri: fb.image }} style={styles.screenshot} resizeMode="cover" />
              )}
              <View style={styles.cardBody}>
                <Text style={styles.feedbackText}>{fb.text}</Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.dateText}>{fb.date}</Text>
                  <TouchableOpacity 
                    style={styles.deleteBtn}
                    onPress={() => deleteFeedback(fb.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  scrollContent: {
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 16,
    marginTop: 20,
    fontWeight: '700',
  },
  emptySubText: {
    color: '#475569',
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  screenshot: {
    width: '100%',
    height: 180,
    backgroundColor: '#000',
  },
  cardBody: {
    padding: 15,
  },
  feedbackText: {
    fontSize: 15,
    color: '#F8FAFC',
    fontWeight: '600',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#64748B',
  },
  deleteBtn: {
    padding: 5,
  }
});
