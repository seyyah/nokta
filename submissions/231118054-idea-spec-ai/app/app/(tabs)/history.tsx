import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { storage, Spec } from '../../services/storage';

export default function HistoryScreen() {
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadSpecs = async () => {
    setRefreshing(true);
    const data = await storage.getAllSpecs();
    setSpecs(data);
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadSpecs();
    }, [])
  );

  const handleDelete = (id: string, title: string) => {
    Alert.alert(
      'Spesifikasyonu Sil',
      `"${title}" başlıklı spesifikasyonu silmek istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            await storage.deleteSpec(id);
            loadSpecs();
          },
        },
      ]
    );
  };

  const handleSelect = (spec: Spec) => {
    router.push({
      pathname: '/spec',
      params: { specData: JSON.stringify(spec) },
    });
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const renderItem = ({ item }: { item: Spec }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <TouchableOpacity
            onPress={() => handleDelete(item.id, item.title)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={18} color="#EA4335" />
          </TouchableOpacity>
        </View>

        <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
        
        <Text style={styles.cardLabel}>Problem:</Text>
        <Text style={styles.cardText} numberOfLines={2}>
          {item.problem}
        </Text>
      </View>
      <View style={styles.arrowContainer}>
        <Ionicons name="chevron-forward" size={16} color="#BCC1C6" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Kayıtlı Fikirler</Text>
          <Text style={styles.subtitle}>Daha önce ürettiğiniz ürün blueprintleri.</Text>
        </View>

        <FlatList
          data={specs}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadSpecs} tintColor="#1A73E8" />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={64} color="#DADCE0" style={styles.emptyIcon} />
              <Text style={styles.emptyTitle}>Henüz Fikir Yok</Text>
              <Text style={styles.emptyText}>
                Ana sayfaya gidip yeni bir fikir girerek ilk ürün spesifikasyonunuzu oluşturabilirsiniz.
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  container: {
    flex: 1,
    paddingTop: 24,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#202124',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#5F6368',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#202124',
    flex: 1,
    marginRight: 8,
  },
  cardDate: {
    fontSize: 12,
    color: '#9AA0A6',
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#70757A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  cardText: {
    fontSize: 13,
    color: '#3C4043',
    lineHeight: 18,
  },
  arrowContainer: {
    paddingRight: 16,
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3C4043',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#5F6368',
    textAlign: 'center',
    lineHeight: 20,
  },
});
