import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { HumanSupportRequest, SupportType, SupportPriority, MascotState } from '../types/support';

const { width, height } = Dimensions.get('window');

// ─── Support Mascot (Floating Assistant) ─────────────────────────────────────
export const SupportMascot = ({ 
  state = 'idle', 
  onPress 
}: { 
  state?: MascotState, 
  onPress: () => void 
}) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const getBackgroundColor = () => {
    switch (state) {
      case 'thinking': return '#6c5ce7';
      case 'speaking': return '#00b894';
      case 'happy': return '#fdcb6e';
      case 'error': return '#d63031';
      default: return '#e8d5a3';
    }
  };

  return (
    <Animated.View style={[
      styles.mascotContainer, 
      { transform: [{ translateY: bounceAnim }] }
    ]}>
      <TouchableOpacity 
        style={[styles.mascotCircle, { backgroundColor: getBackgroundColor() }]} 
        onPress={onPress}
      >
        <Text style={styles.mascotEmoji}>
          {state === 'thinking' ? '🤔' : state === 'speaking' ? '💬' : state === 'happy' ? '😊' : state === 'error' ? '🚫' : '●'}
        </Text>
      </TouchableOpacity>
      {state === 'speaking' && (
        <View style={styles.speechBubble}>
          <Text style={styles.speechText}>Desteğe ihtiyacın var mı?</Text>
        </View>
      )}
    </Animated.View>
  );
};

// ─── Support Status Badge ──────────────────────────────────────────────────
export const SupportStatusBadge = ({ status }: { status: string }) => {
  const getColors = () => {
    switch (status) {
      case 'pending': return { bg: '#2d3436', text: '#dfe6e9' };
      case 'in_review': return { bg: '#0984e3', text: '#fff' };
      case 'resolved': return { bg: '#00b894', text: '#fff' };
      case 'rejected': return { bg: '#d63031', text: '#fff' };
      default: return { bg: '#636e72', text: '#fff' };
    }
  };
  const colors = getColors();
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.badgeText, { color: colors.text }]}>{status.toUpperCase()}</Text>
    </View>
  );
};

// ─── Support Request Card ──────────────────────────────────────────────────
export const SupportRequestCard = ({ request }: { request: HumanSupportRequest }) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{request.title}</Text>
        <SupportStatusBadge status={request.status} />
      </View>
      <Text style={styles.cardType}>{request.supportType.replace('_', ' ')} · {request.priority}</Text>
      <Text style={styles.cardDesc} numberOfLines={2}>{request.description}</Text>
      {request.humanFeedback && (
        <View style={styles.feedbackBox}>
          <Text style={styles.feedbackLabel}>İnsan Geri Bildirimi:</Text>
          <Text style={styles.feedbackText}>{request.humanFeedback}</Text>
        </View>
      )}
    </View>
  );
};

// ─── Support Panel ────────────────────────────────────────────────────────
export const SupportPanel = ({ 
  visible, 
  onClose, 
  requests, 
  onCreateNew 
}: { 
  visible: boolean, 
  onClose: () => void, 
  requests: HumanSupportRequest[],
  onCreateNew: () => void
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.panelContainer}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>İnsan Desteği</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>Kapat</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.panelContent}>
            <Text style={styles.panelIntro}>
              Fikrini geliştirmek için mentor veya uzman desteği isteyebilirsin.
            </Text>
            
            <TouchableOpacity style={styles.newRequestBtn} onPress={onCreateNew}>
              <Text style={styles.newRequestBtnText}>+ Yeni Destek Talebi</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Taleplerim</Text>
            {requests.length === 0 ? (
              <Text style={styles.emptyText}>Henüz bir talep yok.</Text>
            ) : (
              requests.map(req => <SupportRequestCard key={req.id} request={req} />)
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ─── Support Form ─────────────────────────────────────────────────────────
export const SupportForm = ({ 
  visible, 
  onClose, 
  onSubmit 
}: { 
  visible: boolean, 
  onClose: () => void, 
  onSubmit: (data: Partial<HumanSupportRequest>) => void 
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<SupportType>('mentor_review');
  const [priority, setPriority] = useState<SupportPriority>('medium');

  const handleSubmit = () => {
    if (!title || !description) return;
    onSubmit({ title, description, supportType: type, priority });
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Destek Talebi Oluştur</Text>
          
          <Text style={styles.inputLabel}>Başlık</Text>
          <TextInput 
            style={styles.input} 
            value={title} 
            onChangeText={setTitle} 
            placeholder="örn: Teknik mimari incelemesi"
            placeholderTextColor="#444"
          />

          <Text style={styles.inputLabel}>Açıklama</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            value={description} 
            onChangeText={setDescription} 
            multiline
            placeholder="Neye ihtiyacın var?"
            placeholderTextColor="#444"
          />

          <Text style={styles.inputLabel}>Destek Türü</Text>
          <View style={styles.pickerRow}>
            {['mentor_review', 'technical_review', 'product_review'].map((t) => (
              <TouchableOpacity 
                key={t}
                style={[styles.pickerItem, type === t && styles.pickerItemActive]}
                onPress={() => setType(t as SupportType)}
              >
                <Text style={[styles.pickerText, type === t && styles.pickerTextActive]}>
                  {t.split('_')[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitBtnText}>Talebi Gönder</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelBtnText}>Vazgeç</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  mascotContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    alignItems: 'center',
    zIndex: 1000,
  },
  mascotCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  mascotEmoji: {
    fontSize: 30,
    color: '#0a0a0f',
  },
  speechBubble: {
    position: 'absolute',
    right: 70,
    bottom: 10,
    backgroundColor: '#e8d5a3',
    padding: 10,
    borderRadius: 15,
    borderBottomRightRadius: 2,
    width: 150,
  },
  speechText: {
    color: '#0a0a0f',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  panelContainer: {
    backgroundColor: '#0a0a0f',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: height * 0.8,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1e1e2e',
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  panelTitle: {
    color: '#e8d5a3',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 2,
  },
  closeBtn: {
    color: '#666',
    fontSize: 14,
    fontWeight: '700',
  },
  panelContent: {
    flex: 1,
  },
  panelIntro: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  newRequestBtn: {
    backgroundColor: '#e8d5a3',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  newRequestBtnText: {
    color: '#0a0a0f',
    fontWeight: '800',
    fontSize: 14,
  },
  sectionTitle: {
    color: '#e8d5a3',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#111118',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1e1e2e',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    color: '#eee',
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    marginRight: 10,
  },
  cardType: {
    color: '#e8d5a3',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  cardDesc: {
    color: '#888',
    fontSize: 13,
    lineHeight: 18,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '900',
  },
  emptyText: {
    color: '#444',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  formContainer: {
    backgroundColor: '#111118',
    margin: 20,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e8d5a3',
  },
  formTitle: {
    color: '#e8d5a3',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    color: '#666',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#0a0a0f',
    borderWidth: 1,
    borderColor: '#1e1e2e',
    borderRadius: 8,
    padding: 12,
    color: '#eee',
    fontSize: 14,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  pickerItem: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e1e2e',
    alignItems: 'center',
  },
  pickerItemActive: {
    backgroundColor: '#e8d5a3',
    borderColor: '#e8d5a3',
  },
  pickerText: {
    color: '#666',
    fontSize: 10,
    fontWeight: '700',
  },
  pickerTextActive: {
    color: '#0a0a0f',
  },
  submitBtn: {
    backgroundColor: '#e8d5a3',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#0a0a0f',
    fontWeight: '800',
  },
  cancelBtn: {
    padding: 15,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#666',
    fontSize: 14,
  },
  feedbackBox: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#0a0a0f',
    borderRadius: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#00b894',
  },
  feedbackLabel: {
    color: '#00b894',
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 4,
  },
  feedbackText: {
    color: '#ccc',
    fontSize: 13,
    fontStyle: 'italic',
  }
});
