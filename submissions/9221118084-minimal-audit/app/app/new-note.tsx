import { useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useHeaderHeight } from '@react-navigation/elements';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { addNote } from '../lib/notes';
import { bgGradient, colors, radius, shadow } from '../lib/theme';

export default function NewNoteScreen() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const headerHeight = useHeaderHeight();
  const canSave = title.trim().length > 0 || body.trim().length > 0;

  async function handleSave() {
    Keyboard.dismiss();
    await addNote(title, body);
    // FORGE Cycle 2: confirm the save and return to the list so the user
    // knows it worked.
    Alert.alert('Kaydedildi', 'Notunuz kaydedildi.', [
      { text: 'Tamam', onPress: () => router.back() },
    ]);
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={bgGradient} style={StyleSheet.absoluteFill} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={headerHeight}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          <TextInput
            style={styles.titleInput}
            placeholder="Başlık"
            placeholderTextColor={colors.inkSoft}
            value={title}
            onChangeText={setTitle}
            returnKeyType="next"
          />
          <View style={styles.divider} />
          <TextInput
            style={styles.bodyInput}
            placeholder="Notunuzu yazın..."
            placeholderTextColor={colors.inkSoft}
            value={body}
            onChangeText={setBody}
            multiline
            textAlignVertical="top"
          />
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            onPress={handleSave}
            disabled={!canSave}
            style={({ pressed }) => [
              styles.saveBtn,
              canSave ? shadow.button : styles.saveBtnDisabled,
              pressed && canSave && { transform: [{ scale: 0.98 }] },
            ]}
          >
            <Ionicons name="checkmark" size={20} color={colors.white} />
            <Text style={styles.saveText}>Kaydet</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgTop },
  flex: { flex: 1 },
  content: { padding: 22, paddingBottom: 24 },
  titleInput: { fontSize: 26, fontWeight: '800', color: colors.ink, paddingVertical: 6, letterSpacing: -0.4 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 14 },
  bodyInput: { fontSize: 16, lineHeight: 25, color: colors.ink, minHeight: 220, paddingVertical: 4 },
  footer: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 30 : 18 },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.ink,
    borderRadius: radius.pill,
    paddingVertical: 18,
  },
  saveBtnDisabled: { backgroundColor: '#C7C0AE' },
  saveText: { color: colors.white, fontSize: 17, fontWeight: '700' },
});
