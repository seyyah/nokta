import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { StackNavigationProp as NativeStackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: Props) {
  const [idea, setIdea] = useState('');

  const canProceed = idea.trim().length >= 10;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.title}>NOKTA</Text>
          <Text style={styles.subtitle}>Fikir Yakalama ve Geliştirme</Text>
        </View>

        <Text style={styles.label}>Ham fikrin</Text>
        <TextInput
          style={styles.input}
          multiline
          numberOfLines={6}
          placeholder="Fikrini bir iki cümleyle anlat. Filtreleme — sadece noktayı yakala."
          placeholderTextColor="#666"
          value={idea}
          onChangeText={setIdea}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{idea.trim().length} karakter{idea.trim().length < 10 ? ' (min 10)' : ''}</Text>

        <TouchableOpacity
          style={[styles.button, !canProceed && styles.buttonDisabled]}
          onPress={() => navigation.navigate('Questions', { idea: idea.trim() })}
          disabled={!canProceed}
        >
          <Text style={styles.buttonText}>Yakala →</Text>
        </TouchableOpacity>

        <Text style={styles.hint}>
          AI fikrni spec'e dönüştürmek için 5 mühendislik sorusu soracak.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  inner: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  dot: { fontSize: 64, color: '#6c47ff', lineHeight: 64 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: 6 },
  subtitle: { fontSize: 13, color: '#888', marginTop: 4, letterSpacing: 2 },
  label: { fontSize: 13, color: '#aaa', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' },
  input: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 140,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  charCount: { color: '#555', fontSize: 12, marginTop: 6, textAlign: 'right' },
  button: {
    backgroundColor: '#6c47ff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: { opacity: 0.35 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 1 },
  hint: { color: '#444', fontSize: 13, textAlign: 'center', marginTop: 20, lineHeight: 20 },
});
