import React, { useContext, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
  Alert, Modal, Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { CATALOG } from '../data/catalog';

const COMMUNITY_KEY = '@nonslop_community';

function mockAnalytics(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffff;
  const views = 40 + (h % 180);
  const patients = 3 + ((h >> 4) % 28);
  return { views, patients };
}

const STATUS_COLORS = {
  Live: '#abcbdf',
  Draft: '#6B6B6B',
  'Agent Config': '#e8bf94',
};

export default function MyAppsLibrary({ navigation }) {
  const { apps, setApps, updateDraft, userProfile } = useContext(AppContext);
  const [menuApp, setMenuApp] = useState(null);

  const deleteApp = (idx) => {
    Alert.alert(
      'Delete App',
      'This will remove the app from your library.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setApps((prev) => prev.filter((_, i) => i !== idx)),
        },
      ]
    );
    setMenuApp(null);
  };

  const shareToComm = async (app) => {
    setMenuApp(null);
    try {
      const raw = await AsyncStorage.getItem(COMMUNITY_KEY);
      const existing = raw ? JSON.parse(raw) : [];
      const post = {
        id: `own_${app.id || Date.now()}`,
        title: app.appName || 'My App',
        specialty: app.specialty,
        components: app.selectedComponents || [],
        score: app.score ?? null,
        date: app.date || new Date().toLocaleDateString('tr-TR'),
        author: userProfile?.name || 'Solo Practice',
      };
      await AsyncStorage.setItem(COMMUNITY_KEY, JSON.stringify([post, ...existing]));
      Alert.alert('Paylaşıldı', 'Uygulaman topluluğa eklendi.');
    } catch (_) {
      Alert.alert('Hata', 'Paylaşım sırasında bir hata oluştu.');
    }
  };

  const forkApp = (app) => {
    updateDraft({
      specialty: app.specialty,
      stylePreference: app.stylePreference ?? null,
      selectedComponents: [...(app.selectedComponents || [])],
      appName: `${app.appName || ''} (copy)`.trim(),
    });
    setMenuApp(null);
    navigation.navigate('WizardFlow', { screen: 'PrototypeComplete' });
  };

  const renderItem = ({ item, index }) => {
    const catalogEntry = CATALOG[item.specialty];
    const accent = catalogEntry?.accentColor || '#abcbdf';
    const statusColor = STATUS_COLORS[item.status] || '#6B6B6B';
    const analytics = item.id ? mockAnalytics(item.id) : null;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('ClinicianHome', {
            appName: item.appName || catalogEntry?.label,
            selectedComponents: item.selectedComponents || [],
            specialty: item.specialty,
            themeIndex: item.themeIndex,
          })
        }
        onLongPress={() => setMenuApp({ item, index })}
        delayLongPress={400}
        activeOpacity={0.85}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardLeft}>
            <View style={[styles.specialtyDot, { backgroundColor: accent + '33' }]}>
              <Ionicons name={catalogEntry?.icon || 'medkit-outline'} size={16} color={accent} />
            </View>
            <Text style={[styles.specName, { color: accent }]}>
              {catalogEntry?.label || item.specialty}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setMenuApp({ item, index })} hitSlop={8}>
            <Ionicons name="ellipsis-horizontal" size={18} color="#6B6B6B" />
          </TouchableOpacity>
        </View>

        <Text style={styles.appName} numberOfLines={1}>
          {item.appName || `${catalogEntry?.label || 'My'} App`}
        </Text>

        <Text style={styles.meta}>
          {item.selectedComponents?.length || 0} özellik · {item.date}
        </Text>

        <View style={styles.footer}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '22' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
          </View>
          {item.score != null && (
            <View style={[styles.statusBadge, { backgroundColor: accent + '22' }]}>
              <Text style={[styles.statusText, { color: accent }]}>Skor {item.score}</Text>
            </View>
          )}
          {item.expertReview && (
            <View style={styles.expertBadge}>
              <Ionicons name="shield-checkmark" size={11} color="#e8bf94" />
              <Text style={styles.expertBadgeText}>Uzman Onaylı</Text>
            </View>
          )}
        </View>
        {item.expertReview && (
          <View style={styles.expertReviewRow}>
            <Text style={styles.expertReviewText} numberOfLines={2}>
              "{item.expertReview.summary}"
            </Text>
            <Text style={styles.expertReviewMeta}>— {item.expertReview.expertName}</Text>
          </View>
        )}
        {analytics && item.status === 'Live' && (
          <View style={styles.analyticsRow}>
            <Ionicons name="eye-outline" size={11} color="#6B6B6B" />
            <Text style={styles.analyticsText}>{analytics.views} görüntülenme</Text>
            <Text style={styles.analyticsSep}>·</Text>
            <Ionicons name="people-outline" size={11} color="#6B6B6B" />
            <Text style={styles.analyticsText}>{analytics.patients} aktif hasta</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Apps</Text>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('WizardFlow');
          }}
        >
          <Ionicons name="add-circle" size={32} color="#abcbdf" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.profileTitle}>{userProfile?.name || 'Solo Practice'}</Text>
          <Text style={styles.profileMeta}>
            {apps.length} uygulama · Yönetmek için uzun bas
          </Text>
        </View>
        <Ionicons name="person-circle-outline" size={32} color="#abcbdf" />
      </View>

      {apps.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="folder-open-outline" size={48} color="#343536" />
          <Text style={styles.emptyTitle}>Henüz uygulama yok</Text>
          <Text style={styles.emptyText}>+ ile ilk specialty app'ini oluştur.</Text>
        </View>
      ) : (
        <FlatList
          data={apps}
          keyExtractor={(_, idx) => idx.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Action sheet modal */}
      <Modal
        visible={!!menuApp}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuApp(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setMenuApp(null)}>
          <View style={styles.actionSheet}>
            <View style={styles.actionSheetHandle} />
            <Text style={styles.actionSheetTitle} numberOfLines={1}>
              {menuApp?.item?.appName || 'App'}
            </Text>

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => {
                if (!menuApp) return;
                setMenuApp(null);
                updateDraft({
                  specialty: menuApp.item.specialty,
                  selectedComponents: menuApp.item.selectedComponents || [],
                  _patternScore: menuApp.item.score ?? 0,
                });
                navigation.navigate('AskExpert');
              }}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#3a2d1a' }]}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#e8bf94" />
              </View>
              <View>
                <Text style={styles.actionLabel}>Uzmana Sor</Text>
                <Text style={styles.actionSub}>Uzman değerlendirmesi al</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => menuApp && forkApp(menuApp.item)}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#1a3a4a' }]}>
                <Ionicons name="copy-outline" size={20} color="#abcbdf" />
              </View>
              <View>
                <Text style={styles.actionLabel}>Fork as New App</Text>
                <Text style={styles.actionSub}>Start a new wizard with this config</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => menuApp && shareToComm(menuApp.item)}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#1a3a1a' }]}>
                <Ionicons name="share-social-outline" size={20} color="#c5e8c5" />
              </View>
              <View>
                <Text style={styles.actionLabel}>Topluluğa Paylaş</Text>
                <Text style={styles.actionSub}>Şablonunu topluluk feed'ine ekle</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => menuApp && deleteApp(menuApp.index)}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#3a1a1a' }]}>
                <Ionicons name="trash-outline" size={20} color="#ffb4ab" />
              </View>
              <View>
                <Text style={[styles.actionLabel, { color: '#ffb4ab' }]}>Delete App</Text>
                <Text style={styles.actionSub}>Remove from My Apps library</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setMenuApp(null)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121415', paddingHorizontal: 24, paddingTop: 64 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#e3e2e3' },

  profileCard: {
    backgroundColor: '#1e2021', padding: 16, borderRadius: 16,
    flexDirection: 'row', alignItems: 'center', marginBottom: 24,
    borderWidth: 1, borderColor: '#292a2b',
  },
  profileTitle: { color: '#e3e2e3', fontSize: 15, fontWeight: 'bold', marginBottom: 2 },
  profileMeta: { color: '#6B6B6B', fontSize: 12 },

  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  emptyTitle: { color: '#c2c7cc', fontWeight: 'bold', fontSize: 17 },
  emptyText: { color: '#6B6B6B', fontSize: 14 },

  card: {
    backgroundColor: '#1e2021', padding: 16, borderRadius: 16,
    marginBottom: 12, borderWidth: 1, borderColor: '#292a2b',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  specialtyDot: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  specName: { fontSize: 13, fontWeight: '600' },
  appName: { fontSize: 17, fontWeight: 'bold', color: '#e3e2e3', marginBottom: 4 },
  meta: { fontSize: 12, color: '#6B6B6B', marginBottom: 12 },
  footer: { flexDirection: 'row', gap: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  expertBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#e8bf9422', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  expertBadgeText: { fontSize: 11, fontWeight: 'bold', color: '#e8bf94' },
  expertReviewRow: {
    marginTop: 10, padding: 10, backgroundColor: '#1a1710',
    borderRadius: 10, borderWidth: 1, borderColor: '#e8bf9433',
  },
  expertReviewText: { fontSize: 11, color: '#c2b580', fontStyle: 'italic', lineHeight: 16 },
  expertReviewMeta: { fontSize: 10, color: '#6B6B6B', marginTop: 4 },

  analyticsRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10 },
  analyticsText: { fontSize: 11, color: '#6B6B6B' },
  analyticsSep: { fontSize: 11, color: '#343536' },

  modalOverlay: { flex: 1, backgroundColor: '#00000088', justifyContent: 'flex-end' },
  actionSheet: {
    backgroundColor: '#1e2021', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
  },
  actionSheetHandle: {
    width: 36, height: 4, backgroundColor: '#343536',
    borderRadius: 2, alignSelf: 'center', marginBottom: 20,
  },
  actionSheetTitle: {
    fontSize: 13, color: '#6B6B6B', fontWeight: 'bold', textTransform: 'uppercase',
    letterSpacing: 1, marginBottom: 20,
  },
  actionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#292a2b',
  },
  actionIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  actionLabel: { fontSize: 16, fontWeight: '600', color: '#e3e2e3', marginBottom: 2 },
  actionSub: { fontSize: 12, color: '#6B6B6B' },
  cancelBtn: { marginTop: 16, alignItems: 'center', padding: 12 },
  cancelText: { color: '#6B6B6B', fontSize: 15, fontWeight: '600' },
});

