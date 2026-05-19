import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Sparkles } from 'lucide-react-native';

export default function Index() {
  const [idea, setIdea] = useState('');
  const router = useRouter();

  const handleDrop = () => {
    if (idea.trim().length > 10) {
      router.push({ pathname: '/interview', params: { initialIdea: idea } });
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.title}>NOKTA</Text>
        <Text style={styles.subtitle}>Bir fikir bırak, biz onu esere dönüştürelim.</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Şöyle bir fikrim var..."
          placeholderTextColor="#666"
          multiline
          value={idea}
          onChangeText={setIdea}
          textAlignVertical="top"
        />
        <TouchableOpacity 
          style={[styles.button, idea.trim().length <= 10 && styles.buttonDisabled]} 
          onPress={handleDrop}
          disabled={idea.trim().length <= 10}
        >
          <Sparkles color="#fff" size={20} style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>Zenginleştir</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.expertButton} 
        onPress={() => router.push('/expert')}
        accessibilityLabel="Uzmana Danış Ekranına Git"
        accessibilityRole="button"
      >
        <Text style={styles.expertButtonText}>UZMANA DANIŞ</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    padding: 24,
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginTop: 8,
  },
  inputContainer: {
    backgroundColor: '#161616',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  input: {
    color: '#fff',
    fontSize: 18,
    minHeight: 150,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#1e3a8a',
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  expertButton: {
    backgroundColor: '#FF3B30', // Dikkat çekici, yüksek kontrastlı kırmızının tonu
    borderRadius: 16,
    paddingVertical: 20,
    marginTop: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80, // Minimum 48x48dp kuralını aşıyoruz
    borderWidth: 2,
    borderColor: '#ff8888',
  },
  expertButtonText: {
    color: '#ffffff',
    fontSize: 24, // Okunabilir büyük font
    fontWeight: '900',
    letterSpacing: 1,
  },
});
