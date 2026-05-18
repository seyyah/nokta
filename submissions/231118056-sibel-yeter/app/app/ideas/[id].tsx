import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface IdeaItem {
  id: string;
  title: string;
  description: string;
  status: 'Pending' | 'Refining' | 'Forge Active' | 'Fixed';
  kg: number;
  category: string;
  specs: string[];
}

const DETAIL_IDEAS: Record<string, IdeaItem> = {
  '1': {
    id: '1',
    title: 'Maskot Animasyonları',
    description: 'Yeni kullanıcılar için Nokta maskotunun hoş geldin ve tebrik animasyonlarının sisteme dahil edilmesi.',
    status: 'Pending',
    kg: 15,
    category: 'UX / UI',
    specs: [
      'Nokta maskotunun SVG/Lottie formatında export edilmesi',
      'Onboarding ekranı yüklenirken tebrik ve el sallama animasyonu tetiklenmesi',
      'Koyu modda maskotun konturlarının yüksek görünürlüğe kavuşturulması',
      'Framer Motion veya Lottie-react-native entegrasyonu',
    ],
  },
  '2': {
    id: '2',
    title: 'Çevrimdışı Rapor Kuyruğu',
    description: 'İnternet bağlantısı koptuğunda üretilen Markdown raporlarının local storage üzerinde kuyruğa alınması ve bağlantı sağlandığında gönderilmesi.',
    status: 'Forge Active',
    kg: 25,
    category: 'Offline / Core',
    specs: [
      'NetInfo kütüphanesi entegrasyonu ile internet durumunun anlık tespiti',
      'Cihaz çevrimdışı iken oluşturulan raporların AsyncStorage ile listelenmesi',
      'İnternet geri geldiğinde otomatik arka plan senkronizasyon servisi',
      'Gönderilen raporların kuyruktan temizlenmesi ve başarı logu atılması',
    ],
  },
  '3': {
    id: '3',
    title: 'HTML Dışa Aktarım Desteği',
    description: 'Markdown raporlarının e-posta ve tarayıcılarda doğrudan görüntülenebilmesi için HTML export desteği eklenmesi.',
    status: 'Fixed',
    kg: 10,
    category: 'Features',
    specs: [
      'Markdown metninin HTML etiketlerine dönüştürülmesi (parser entegrasyonu)',
      'HTML rapor şablonuna gömülü CSS stillerinin eklenmesi (pastoral/wood-toned renklerle)',
      'Visual testlerde raporun mobil ve masaüstü tarayıcılarda duyarlı (responsive) olması',
      'HTML dosyasının FileSystem ve Sharing API aracılığıyla cihazda paylaşılması',
    ],
  },
};

export default function IdeaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const idea = DETAIL_IDEAS[id || '1'] || DETAIL_IDEAS['1'];

  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'Pending':
        return { bg: '#feebc8', text: '#c05621', label: 'Beklemede', icon: 'hourglass-outline' };
      case 'Refining':
        return { bg: '#e2e8f0', text: '#4a5568', label: 'İnceleniyor', icon: 'search-outline' };
      case 'Forge Active':
        return { bg: '#fed7d7', text: '#9b2c2c', label: 'Agent Aktif', icon: 'hardware-chip-outline' };
      case 'Fixed':
        return { bg: '#c6f6d5', text: '#22543d', label: 'Çözüldü', icon: 'checkmark-circle-outline' };
      default:
        return { bg: '#edf2f7', text: '#4a5568', label: 'Bilinmiyor', icon: 'help-circle-outline' };
    }
  };

  const statusInfo = getStatusDetails(idea.status);

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#0f1115' : '#f8fafc' }]}>
      {/* Back Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#0f172a'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#0f172a' }]}>Fikir Detayı</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Main Info */}
      <View style={[styles.section, { backgroundColor: isDark ? '#1a1d24' : '#fff' }]}>
        <View style={styles.metaRow}>
          <View style={styles.categoryContainer}>
            <Ionicons name="pricetag" size={14} color="#e53e3e" />
            <Text style={[styles.categoryText, { color: isDark ? '#94a3b8' : '#475569' }]}>{idea.category}</Text>
          </View>
          <Text style={styles.weightText}>{idea.kg} kg</Text>
        </View>

        <Text style={[styles.title, { color: isDark ? '#fff' : '#0f172a' }]}>{idea.title}</Text>

        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
            <Ionicons name={statusInfo.icon as any} size={14} color={statusInfo.text} style={{ marginRight: 4 }} />
            <Text style={[styles.statusText, { color: statusInfo.text }]}>{statusInfo.label}</Text>
          </View>
          <Text style={styles.timestamp}>Oluşturuldu: 18.05.2026</Text>
        </View>

        <Text style={[styles.description, { color: isDark ? '#cbd5e1' : '#334155' }]}>{idea.description}</Text>
      </View>

      {/* Technical Specifications Checklist */}
      <View style={styles.checklistSection}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#f1f5f9' : '#1e293b' }]}>Teknik Spec Detayları</Text>
        
        {idea.specs.map((spec, index) => (
          <View key={index} style={[styles.checkCard, { backgroundColor: isDark ? '#1a1d24' : '#fff' }]}>
            <View style={[styles.checkIconContainer, { backgroundColor: idea.status === 'Fixed' ? '#e6fffa' : '#edf2f7' }]}>
              <Ionicons
                name={idea.status === 'Fixed' ? 'checkbox' : 'square-outline'}
                size={20}
                color={idea.status === 'Fixed' ? '#319795' : '#718096'}
              />
            </View>
            <Text style={[styles.checkText, { color: isDark ? '#cbd5e1' : '#334155' }]}>{spec}</Text>
          </View>
        ))}
      </View>

      {/* Audit Guide */}
      <View style={[styles.infoBox, { backgroundColor: isDark ? '#111419' : '#ebf8ff', borderColor: isDark ? '#2d3748' : '#bee3f8' }]}>
        <Ionicons name="information-circle" size={24} color="#3182ce" style={styles.infoIcon} />
        <View style={styles.infoTextContainer}>
          <Text style={[styles.infoBoxTitle, { color: isDark ? '#63b3ed' : '#2b6cb0' }]}>Raporlama Kılavuzu</Text>
          <Text style={[styles.infoBoxDesc, { color: isDark ? '#a0aec0' : '#4a5568' }]}>
            Bu ekranda bir sorun veya iyileştirme fark ederseniz, ekranın sağ altındaki kırmızı <Text style={{ fontWeight: 'bold', color: '#e53e3e' }}>Bug FAB</Text> butonuna tıklayarak görsel kanıt oluşturabilirsiniz.
          </Text>
        </View>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
    borderRadius: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  weightText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 11,
    color: '#94a3b8',
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
  checklistSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  checkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  checkIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  infoBox: {
    flexDirection: 'row',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  infoIcon: {
    marginTop: 2,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoBoxTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoBoxDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
});
