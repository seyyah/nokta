import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { getIdeas, deleteIdea, clearAllIdeas } from '../services/storageService';

export default function HistoryScreen({ navigation }) {
  const [ideas, setIdeas] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      loadIdeas();
    }, [])
  );

  const loadIdeas = async () => {
    const loaded = await getIdeas();
    setIdeas(loaded);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Fikri Sil',
      'Bu fikri silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            await deleteIdea(id);
            loadIdeas();
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Tümünü Sil',
      'Tüm fikirleri silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            await clearAllIdeas();
            setIdeas([]);
          },
        },
      ]
    );
  };

  const getScoreColor = (score) => {
    if (score >= 75) return '#00b894';
    if (score >= 50) return '#fdcb6e';
    return '#d63031';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderItem = ({ item, index }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [
          {
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20 + index * 5, 0],
            }),
          },
        ],
      }}
    >
      <TouchableOpacity
        style={styles.ideaCard}
        activeOpacity={0.8}
        onLongPress={() => handleDelete(item.id)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.spec?.title || 'İsimsiz Fikir'}
          </Text>
          <View
            style={[
              styles.scoreBadge,
              { backgroundColor: `${getScoreColor(item.spec?.trustScore || 0)}20` },
            ]}
          >
            <Text
              style={[
                styles.scoreText,
                { color: getScoreColor(item.spec?.trustScore || 0) },
              ]}
            >
              {item.spec?.trustScore || '?'}
            </Text>
          </View>
        </View>

        <Text style={styles.cardIdea} numberOfLines={2}>
          "{item.rawIdea}"
        </Text>

        <View style={styles.cardFooter}>
          <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
          <Text style={styles.cardFeatures}>
            {item.spec?.mvpFeatures?.length || 0} özellik
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <LinearGradient colors={['#0a0a1a', '#1a1a3e', '#0a0a1a']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Geri</Text>
        </TouchableOpacity>
        {ideas.length > 0 && (
          <TouchableOpacity onPress={handleClearAll}>
            <Text style={styles.clearText}>Tümünü Sil</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.title}>📚 Fikir Geçmişi</Text>
      <Text style={styles.subtitle}>{ideas.length} fikir kaydedildi</Text>

      {ideas.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🔮</Text>
          <Text style={styles.emptyTitle}>Henüz fikir yok</Text>
          <Text style={styles.emptySubtitle}>
            İlk fikrinizi yakalayarak başlayın
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Capture')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#6c5ce7', '#a29bfe']}
              style={styles.emptyButton}
            >
              <Text style={styles.emptyButtonText}>✨ Fikir Başlat</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={ideas}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  backText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
  },
  clearText: {
    color: '#d63031',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    paddingHorizontal: 24,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    paddingHorizontal: 24,
    marginTop: 4,
    marginBottom: 20,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  ideaCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 20,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '800',
  },
  cardIdea: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardDate: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 12,
  },
  cardFeatures: {
    color: '#a29bfe',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 28,
  },
  emptyButton: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 16,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
