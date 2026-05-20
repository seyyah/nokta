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
import { colors, primaryGradient, radius, shadow } from '../lib/theme';

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
          placeholderTextColor={colors.textMuted}
          value={title}
          onChangeText={setTitle}
          returnKeyType="next"
        />
        <View style={styles.divider} />
        <TextInput
          style={styles.bodyInput}
          placeholder="Notunuzu yazın..."
          placeholderTextColor={colors.textMuted}
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
          style={({ pressed }) => [pressed && canSave && { transform: [{ scale: 0.98 }] }]}
        >
          <LinearGradient
            colors={canSave ? primaryGradient : ['#C7C7D6', '#C7C7D6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.saveBtn, canSave && shadow.floating]}
          >
            <Ionicons name="checkmark" size={20} color={colors.white} />
            <Text style={styles.saveText}>Kaydet</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 24 },
  titleInput: { fontSize: 22, fontWeight: '800', color: colors.text, paddingVertical: 6 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 12 },
  bodyInput: { fontSize: 16, lineHeight: 24, color: colors.text, minHeight: 220, paddingVertical: 4 },
  footer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.md,
    paddingVertical: 16,
  },
  saveText: { color: colors.white, fontSize: 16, fontWeight: '700' },
});
