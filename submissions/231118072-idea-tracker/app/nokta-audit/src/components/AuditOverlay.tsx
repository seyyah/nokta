import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Image,
  Dimensions,
} from 'react-native';
import type { AuditNoteBounds } from '../core/types';
import { Audio } from 'expo-av';

interface Props {
  visible: boolean;
  screenshotUri: string;
  selectedBounds: AuditNoteBounds | null;
  screenName: string;
  reporterId?: string;
  onSave: (note: string) => Promise<void>;
  onCancel: () => void;
}

const SHEET_PADDING = 24;
const PREVIEW_W = Dimensions.get('window').width - SHEET_PADDING * 2;
const PREVIEW_H = 140; // sabit küçük yükseklik, contain ile oran korunur

export function AuditOverlay({
  visible,
  screenshotUri,
  selectedBounds,
  screenName,
  reporterId,
  onSave,
  onCancel,
}: Props) {
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [dictating, setDictating] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const phraseIndex = useRef(0);

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync().catch(console.error);
      }
    };
  }, [recording]);

  const handleDictate = async () => {
    if (dictating) {
      setDictating(false);
      if (recording) {
        try {
          await recording.stopAndUnloadAsync();
          const uri = recording.getURI();
          setSaving(true);

          const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
          if (apiKey && uri) {
            const formData = new FormData();
            formData.append('file', {
              uri,
              type: 'audio/m4a',
              name: 'audio.m4a'
            } as any);
            formData.append('model', 'whisper-1');

            const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'multipart/form-data',
              },
              body: formData,
            });

            if (res.ok) {
              const data = await res.json();
              if (data.text) {
                setNote(prev => prev ? prev + ' ' + data.text : data.text);
              }
            } else {
              const errData = await res.text();
              console.warn('[AuditOverlay] Whisper API Error:', errData);
              Alert.alert('STT Hatası', 'Whisper API ses çözümlemesi başarısız oldu.');
            }
          } else {
            // Mock Whisper transcription based on index
            await new Promise(r => setTimeout(r, 1200));
            const mockPhrases = [
              "Logo badge visible olmuyor.",
              "Progress bar 10 seviyesinde takili.",
              "Spec text rengi arka planla ayni oldugu icin okunmuyor."
            ];
            const phrase = mockPhrases[phraseIndex.current % mockPhrases.length];
            phraseIndex.current++;
            setNote(prev => prev ? prev + ' ' + phrase : phrase);
          }
        } catch (e) {
          console.warn('[AuditOverlay] stop dictating error:', e);
        } finally {
          setSaving(false);
          setRecording(null);
        }
      }
    } else {
      try {
        const perm = await Audio.requestPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('İzin Gerekli', 'Dikte işlemi için mikrofon izni gereklidir.');
          return;
        }

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording: newRecording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );

        setRecording(newRecording);
        setDictating(true);
      } catch (e) {
        console.warn('[AuditOverlay] start dictating error:', e);
        Alert.alert('Hata', 'Mikrofon kaydı başlatılamadı.');
      }
    }
  };

  const handleSave = async () => {
    if (!note.trim()) {
      Alert.alert('Not boş', 'Lütfen bir açıklama girin.');
      return;
    }
    setSaving(true);
    try {
      await onSave(note.trim());
      setNote('');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setNote('');
    onCancel();
  };

  const screenW = Dimensions.get('screen').width;
  const screenH = Dimensions.get('screen').height;
  // Aspect ratio'yu koruyarak PREVIEW_W'ye sığdır, max 160px
  const naturalH = PREVIEW_W * (screenH / screenW);
  const renderedW = naturalH > 160 ? Math.round(160 * (screenW / screenH)) : PREVIEW_W;
  const renderedH = Math.min(naturalH, 160);
  const scaleX = renderedW / screenW;
  const scaleY = renderedH / screenH;

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <Text style={styles.title}>Bug Raporu</Text>
          <Text style={styles.meta}>
            Ekran: <Text style={styles.metaValue}>{screenName}</Text>
          </Text>
          {reporterId && (
            <Text style={styles.meta}>
              Raporlayan: <Text style={styles.metaValue}>{reporterId}</Text>
            </Text>
          )}

          {screenshotUri ? (
            <View style={[styles.previewContainer, { width: renderedW, height: renderedH }]}>
              <Image
                source={{ uri: screenshotUri }}
                style={{ width: renderedW, height: renderedH }}
                resizeMode="stretch"
              />
              {selectedBounds && (
                <View
                  pointerEvents="none"
                  style={[
                    styles.highlightBox,
                    {
                      left: selectedBounds.x * scaleX,
                      top: selectedBounds.y * scaleY,
                      width: selectedBounds.width * scaleX,
                      height: selectedBounds.height * scaleY,
                    },
                  ]}
                />
              )}
            </View>
          ) : null}

          <View style={styles.labelRow}>
            <Text style={styles.label}>Sorunu açıklayın</Text>
            <TouchableOpacity
              style={[styles.dictateBtn, dictating && styles.dictatingActive]}
              onPress={handleDictate}
              activeOpacity={0.8}
            >
              <Text style={styles.dictateBtnText}>
                {dictating ? '🎤 Durdur' : '🎙️ Dikte Et'}
              </Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            multiline
            placeholder="Ne yanlış gözüküyor? Ne bekliyordunuz?"
            placeholderTextColor="#999"
            value={note}
            onChangeText={setNote}
            autoFocus
          />

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} disabled={saving}>
              <Text style={styles.cancelText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
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
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SHEET_PADDING,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#111',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  meta: {
    color: '#999',
    fontSize: 12,
    marginBottom: 2,
  },
  metaValue: {
    color: '#555',
    fontWeight: '500',
  },
  previewContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  highlightBox: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#e53e3e',
    backgroundColor: 'rgba(229,62,62,0.1)',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    color: '#444',
    fontSize: 13,
    fontWeight: '600',
  },
  dictateBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  dictatingActive: {
    backgroundColor: '#ffebeb',
    borderColor: '#ffcdd2',
  },
  dictateBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#e53e3e',
  },
  input: {
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    padding: 12,
    color: '#111',
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  cancelText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 14,
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#e53e3e',
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
