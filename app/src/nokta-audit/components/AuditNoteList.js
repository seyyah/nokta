import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';

/**
 * @param {{
 *   notes: import('../core/types').AuditNote[];
 *   onEdit: (id: string, newNote: string) => Promise<void>;
 *   onDelete: (id: string) => void;
 *   onExportMd: () => void;
 *   onOpenVision?: () => void;
 *   onClose: () => void;
 * }} props
 */
export function AuditNoteList({ notes, onEdit, onDelete, onExportMd, onOpenVision, onClose }) {
  const [editingId, setEditingId] = useState(/** @type {string | null} */ (null));
  const [editText, setEditText] = useState('');
  const [saving, setSaving] = useState(false);

  const handleDelete = (id) => {
    Alert.alert('Notu sil', 'Bu rapor notu silinsin mi?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => onDelete(id) },
    ]);
  };

  /** @param {import('../core/types').AuditNote} note */
  const openEdit = (note) => {
    setEditingId(note.id);
    setEditText(note.note);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editText.trim()) return;
    setSaving(true);
    try {
      await onEdit(editingId, editText.trim());
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  };

  const openCount = notes.filter((n) => n.status === 'open').length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Bug Notları</Text>
          <Text style={styles.sub}>{notes.length} not · {openCount} açık</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      {notes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🐛</Text>
          <Text style={styles.emptyText}>Henüz bug notu yok.</Text>
          <Text style={styles.emptyHint}>FAB butonuna basarak yeni not ekleyebilirsiniz.</Text>
        </View>
      ) : (
        <ScrollView style={styles.list} contentContainerStyle={{ gap: 10, paddingBottom: 16 }}>
          {notes.map((n) => (
            <View key={n.id} style={styles.card}>
              <View style={styles.cardRow}>
                {n.screenshot ? (
                  <Image
                    source={{ uri: n.screenshot }}
                    style={styles.thumbnail}
                    resizeMode="contain"
                  />
                ) : null}
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.badge, n.status === 'fixed' ? styles.badgeFixed : styles.badgeOpen]}>
                      <Text style={[styles.badgeText, n.status === 'fixed' ? styles.badgeTextFixed : styles.badgeTextOpen]}>
                        {n.status === 'fixed' ? 'Düzeltildi' : 'Açık'}
                      </Text>
                    </View>
                    <Text style={styles.screenName} numberOfLines={1}>{n.screenName}</Text>
                  </View>
                  <Text style={styles.noteText} numberOfLines={3}>{n.note}</Text>
                  <Text style={styles.time}>{new Date(n.timestamp).toLocaleString('tr-TR')}</Text>
                  <View style={styles.cardActions}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(n)}>
                      <Text style={styles.actionText}>Düzenle</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(n.id)}>
                      <Text style={[styles.actionText, styles.deleteText]}>Sil</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.exportRow}>
        <TouchableOpacity
          style={[styles.exportBtn, styles.exportBtnMd, notes.length === 0 && styles.exportBtnDisabled]}
          onPress={onExportMd}
          disabled={notes.length === 0}
        >
          <Text style={[styles.exportText, notes.length === 0 && styles.exportTextDisabled]}>
            Markdown
          </Text>
        </TouchableOpacity>
        {onOpenVision ? (
          <TouchableOpacity
            style={[styles.exportBtn, styles.exportBtnVision, notes.length === 0 && styles.exportBtnDisabled]}
            onPress={onOpenVision}
            disabled={notes.length === 0}
          >
            <Text style={[styles.exportText, notes.length === 0 && styles.exportTextDisabled]}>
              Vision Analiz
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <Modal visible={editingId !== null} animationType="slide" transparent presentationStyle="overFullScreen">
        <KeyboardAvoidingView style={styles.editBackdrop} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.editSheet}>
            <View style={styles.handle} />
            <Text style={styles.editTitle}>Notu Düzenle</Text>
            <TextInput
              style={styles.editInput}
              multiline
              value={editText}
              onChangeText={setEditText}
              autoFocus
              placeholderTextColor="#999"
            />
            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setEditingId(null)}
                disabled={saving}
              >
                <Text style={styles.cancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveEdit} disabled={saving}>
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveText}>Kaydet</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 16,
  },
  title: {
    color: '#111',
    fontSize: 22,
    fontWeight: '700',
  },
  sub: {
    color: '#999',
    fontSize: 13,
    marginTop: 3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  closeText: {
    color: '#555',
    fontSize: 14,
    fontWeight: '600',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 4,
  },
  emptyText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyHint: {
    color: '#aaa',
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  list: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ebebeb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
  },
  thumbnail: {
    width: 100,
    height: 120,
    backgroundColor: '#f5f5f5',
  },
  cardContent: {
    flex: 1,
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeOpen: {
    backgroundColor: '#fff1f0',
    borderWidth: 1,
    borderColor: '#ffc1bc',
  },
  badgeFixed: {
    backgroundColor: '#f0fff4',
    borderWidth: 1,
    borderColor: '#9ae6b4',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeTextOpen: {
    color: '#e53e3e',
  },
  badgeTextFixed: {
    color: '#38a169',
  },
  screenName: {
    color: '#999',
    fontSize: 12,
  },
  noteText: {
    color: '#222',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 6,
  },
  time: {
    color: '#bbb',
    fontSize: 12,
    marginBottom: 12,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  actionText: {
    color: '#444',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteBtn: {
    backgroundColor: '#fff1f0',
    borderColor: '#ffc1bc',
  },
  deleteText: {
    color: '#e53e3e',
  },
  exportRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    marginBottom: 8,
  },
  exportBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportBtnMd: {
    backgroundColor: '#2d3748',
  },
  exportBtnVision: {
    backgroundColor: '#a855f7',
  },
  exportBtnDisabled: {
    backgroundColor: '#f0f0f0',
  },
  exportText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  exportTextDisabled: {
    color: '#bbb',
  },
  editBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  editSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  editTitle: {
    color: '#111',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 14,
  },
  editInput: {
    backgroundColor: '#f7f7f7',
    borderRadius: 12,
    padding: 14,
    color: '#111',
    fontSize: 15,
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  cancelText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 15,
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#e53e3e',
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
