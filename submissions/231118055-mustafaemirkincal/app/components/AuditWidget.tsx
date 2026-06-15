import React, { useMemo, useState } from 'react';
import { Modal, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { IdeaCard } from '../services/claudeApi';

type Props = {
  screenName: string;
  notes: string;
  cards?: IdeaCard[];
};

export default function AuditWidget({ screenName, notes, cards = [] }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('Denetim notu');
  const [body, setBody] = useState('Sorunu söyle, sonra çözümü buraya yaz.');

  const markdown = useMemo(() => {
    const stamp = new Date().toISOString();
    return `# Denetim raporu - ${title}

**Ekran:** ${screenName}
**Oluşturulma:** ${stamp}
**Kart sayısı:** ${cards.length}

## Dikte edilen not

${body}

## Canlı bağlam

${notes || 'Henüz not yok.'}

## Çıktı kontrolü

Ekran sade kalır, giriş okunaklı kalır ve sonraki değişiklik forge döngüsüne geri verilebilir.`;
  }, [body, cards.length, notes, screenName, title]);

  async function handleShare() {
    await Share.share({ message: markdown });
  }

  return (
    <>
      <TouchableOpacity style={styles.fab} onPress={() => setOpen(true)}>
        <Text style={styles.fabText}>Denetim</Text>
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" transparent>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <Text style={styles.heading}>Denetim aracı</Text>
            <Text style={styles.caption}>Ekran: {screenName}</Text>

            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Rapor başlığı"
              placeholderTextColor="#7a879d"
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              value={body}
              onChangeText={setBody}
              multiline
              placeholder="Dikte edilen not"
              placeholderTextColor="#7a879d"
            />

            <View style={styles.preview}>
              <Text style={styles.previewText}>{markdown}</Text>
            </View>

            <View style={styles.row}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => setOpen(false)}>
                <Text style={styles.secondaryText}>Kapat</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryBtn} onPress={handleShare}>
                <Text style={styles.primaryText}>Paylaş</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 22,
    backgroundColor: '#facc15',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  fabText: {
    color: '#08111f',
    fontWeight: '900',
    fontSize: 13,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.72)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#0b1220',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    gap: 10,
    maxHeight: '85%',
  },
  heading: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '900',
  },
  caption: {
    color: '#94a3b8',
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.18)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#f8fafc',
    backgroundColor: '#091120',
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  preview: {
    backgroundColor: '#050a14',
    borderRadius: 18,
    padding: 12,
    maxHeight: 200,
  },
  previewText: {
    color: '#dbe4ff',
    fontSize: 12,
    lineHeight: 18,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.18)',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryText: {
    color: '#e2e8f0',
    fontWeight: '800',
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#facc15',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryText: {
    color: '#08111f',
    fontWeight: '900',
  },
});
