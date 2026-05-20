import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { addNote } from '../lib/notes';

export default function NewNoteScreen() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  async function handleSave() {
    await addNote(title, body);
    // FORGE Cycle 2: confirm the save and return to the list so the user
    // knows it worked.
    Alert.alert('Kaydedildi', 'Notunuz kaydedildi.', [
      { text: 'Tamam', onPress: () => router.back() },
    ]);
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.titleInput}
        placeholder="Başlık"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.bodyInput}
        placeholder="Notunuzu yazın..."
        value={body}
        onChangeText={setBody}
        multiline
        textAlignVertical="top"
      />
      <Pressable style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveText}>Kaydet</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16, gap: 12 },
  titleInput: {
    fontSize: 18,
    fontWeight: '600',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 8,
  },
  bodyInput: { flex: 1, fontSize: 16, lineHeight: 22, paddingVertical: 8 },
  saveBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
