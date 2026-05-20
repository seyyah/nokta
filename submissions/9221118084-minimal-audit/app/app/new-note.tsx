import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { addNote } from '../lib/notes';

export default function NewNoteScreen() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  async function handleSave() {
    await addNote(title, body);
    // INTENTIONAL UX BUG (NewNoteScreen):
    // The note is saved, but nothing happens afterwards — no toast, no alert,
    // and no navigation back. The user has no idea whether the save worked.
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
