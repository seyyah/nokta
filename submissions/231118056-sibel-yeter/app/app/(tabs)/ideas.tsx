import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export interface IdeaItem {
  id: string;
  title: string;
  description: string;
  status: 'Pending' | 'Refining' | 'Forge Active' | 'Fixed';
  kg: number; // Ağırlık / Önem derecesi
  category: string;
}

const INITIAL_IDEAS: IdeaItem[] = [
  {
    id: '1',
    title: 'Maskot Animasyonları',
    description: 'Yeni kullanıcılar için Nokta maskotunun hoş geldin ve tebrik animasyonlarının eklenmesi.',
    status: 'Pending',
    kg: 15,
    category: 'UX / UI',
  },
  {
    id: '2',
    title: 'Çevrimdışı Rapor Kuyruğu',
    description: 'İnternet bağlantısı koptuğunda üretilen Markdown raporlarının local storage üzerinde kuyruğa alınması.',
    status: 'Forge Active',
    kg: 25,
    category: 'Offline / Core',
  },
  {
    id: '3',
    title: 'HTML Dışa Aktarım Desteği',
    description: 'Markdown raporlarının e-posta ve tarayıcılarda doğrudan görüntülenebilmesi için HTML export desteği eklenmesi.',
    status: 'Fixed',
    kg: 10,
    category: 'Features',
  },
];

export default function IdeasScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const [ideas, setIdeas] = useState<IdeaItem[]>(INITIAL_IDEAS);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [kg, setKg] = useState('10');

  const handleAddIdea = () => {
    if (!title.trim() || !description.trim()) return;

    const newIdea: IdeaItem = {
      id: String(ideas.length + 1),
      title,
      description,
      status: 'Pending',
      kg: Number(kg) || 10,
      category,
    };

    setIdeas([newIdea, ...ideas]);
    setModalVisible(false);
    setTitle('');
    setDescription('');
    setCategory('General');
    setKg('10');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return { bg: '#feebc8', text: '#c05621', label: 'Beklemede' };
      case 'Refining':
        return { bg: '#e2e8f0', text: '#4a5568', label: 'İnceleniyor' };
      case 'Forge Active':
        return { bg: '#fed7d7', text: '#9b2c2c', label: 'Agent Aktif' };
      case 'Fixed':
        return { bg: '#c6f6d5', text: '#22543d', label: 'Çözüldü' };
      default:
        return { bg: '#edf2f7', text: '#4a5568', label: 'Bilinmiyor' };
    }
  };

  const filteredIdeas = ideas.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'All' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0f1115' : '#f8fafc' }]}>
      {/* Header Controls */}
      <View style={[styles.searchContainer, { backgroundColor: isDark ? '#1a1d24' : '#fff' }]}>
        <View style={[styles.searchBar, { backgroundColor: isDark ? '#111419' : '#f1f5f9' }]}>
          <Ionicons name="search" size={18} color={isDark ? '#64748b' : '#94a3b8'} style={styles.searchIcon} />
          <TextInput
            placeholder="Fikir veya spec ara..."
            placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
            style={[styles.searchInput, { color: isDark ? '#fff' : '#0f172a' }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        {/* Filters */}
        <View style={styles.filterRow}>
          {['All', 'Pending', 'Forge Active', 'Fixed'].map((status) => (
            <TouchableOpacity
              key={status}
              onPress={() => setFilterStatus(status)}
              style={[
                styles.filterBadge,
                filterStatus === status && { backgroundColor: '#e53e3e' },
                { borderColor: isDark ? '#2d3748' : '#e2e8f0' }
              ]}>
              <Text
                style={[
                  styles.filterText,
                  { color: filterStatus === status ? '#fff' : isDark ? '#94a3b8' : '#64748b' },
                ]}>
                {status === 'All' ? 'Tümü' : getStatusColor(status).label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Idea List */}
      <FlatList
        data={filteredIdeas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listPadding}
        renderItem={({ item }) => {
          const colors = getStatusColor(item.status);
          return (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: isDark ? '#1a1d24' : '#fff' }]}
              onPress={() => router.push(`/ideas/${item.id}`)}
              activeOpacity={0.7}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: isDark ? '#fff' : '#0f172a' }]}>{item.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
                  <Text style={[styles.statusText, { color: colors.text }]}>{colors.label}</Text>
                </View>
              </View>
              <Text style={[styles.cardDesc, { color: isDark ? '#94a3b8' : '#64748b' }]} numberOfLines={2}>
                {item.description}
              </Text>
              <View style={styles.cardFooter}>
                <View style={styles.categoryContainer}>
                  <Ionicons name="pricetag-outline" size={12} color="#e53e3e" />
                  <Text style={[styles.categoryText, { color: isDark ? '#cbd5e1' : '#475569' }]}>
                    {item.category}
                  </Text>
                </View>
                <Text style={styles.weightText}>{item.kg} kg</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyView}>
            <Ionicons name="document-text-outline" size={48} color={isDark ? '#475569' : '#cbd5e1'} />
            <Text style={[styles.emptyText, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              Eşleşen fikir veya spec bulunamadı.
            </Text>
          </View>
        }
      />

      {/* Add Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Add Idea Modal */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalBg}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1a1d24' : '#fff' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? '#fff' : '#0f172a' }]}>Yeni Fikir/Spec Ekle</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={isDark ? '#cbd5e1' : '#475569'} />
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="Başlık"
              placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
              style={[styles.input, { color: isDark ? '#fff' : '#0f172a', borderColor: isDark ? '#2d3748' : '#e2e8f0' }]}
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              placeholder="Açıklama / Spec gereksinimi..."
              placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
              multiline
              numberOfLines={4}
              style={[
                styles.input,
                styles.textArea,
                { color: isDark ? '#fff' : '#0f172a', borderColor: isDark ? '#2d3748' : '#e2e8f0' },
              ]}
              value={description}
              onChangeText={setDescription}
            />

            <TextInput
              placeholder="Kategori (örn: UX, Core, Offline)"
              placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
              style={[styles.input, { color: isDark ? '#fff' : '#0f172a', borderColor: isDark ? '#2d3748' : '#e2e8f0' }]}
              value={category}
              onChangeText={setCategory}
            />

            <TextInput
              placeholder="Ağırlık (örn: 15 kg)"
              placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
              keyboardType="numeric"
              style={[styles.input, { color: isDark ? '#fff' : '#0f172a', borderColor: isDark ? '#2d3748' : '#e2e8f0' }]}
              value={kg}
              onChangeText={setKg}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleAddIdea}>
              <Text style={styles.saveBtnText}>Kaydet ve Başlat</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f7',
    gap: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listPadding: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  weightText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: 'bold',
  },
  emptyView: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e53e3e',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#e53e3e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modalBg: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  saveBtn: {
    backgroundColor: '#e53e3e',
    borderRadius: 14,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
