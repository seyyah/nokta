import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';

export default function CaptureScreen() {
  const [spark] = useState(''); // Keep for binding if needed, but I'll use text state
  const [text, setText] = useState('');
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleStartRefining = () => {
    if (text.trim()) {
      router.push({
        pathname: '/chat',
        params: { initialSpark: text }
      });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={[styles.container, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ backgroundColor: 'transparent' }}>
              <View style={[styles.header, { backgroundColor: 'transparent' }]}>
                <View style={[styles.iconContainer, { backgroundColor: 'transparent' }]}>
                  <LinearGradient
                    colors={[Colors.light.primary, Colors.light.secondary]}
                    style={styles.iconGradient}
                  >
                    <Ionicons name="sparkles" size={32} color="#fff" />
                  </LinearGradient>
                </View>
                <Text style={styles.title}>Nokta</Text>
                <Text style={styles.subtitle}>Fikir kıvılcımın nedir?</Text>
              </View>

              <View style={styles.card}>
                <TextInput
                  style={styles.input}
                  placeholder="Aklındaki o harika fikri buraya yaz..."
                  placeholderTextColor="#94a3b8"
                  multiline
                  value={text}
                  onChangeText={setText}
                  selectionColor={Colors.light.primary}
                  blurOnSubmit={false}
                  keyboardAppearance="light"
                />
              </View>

              <TouchableOpacity 
                style={styles.buttonContainer} 
                onPress={handleStartRefining}
                disabled={!text.trim()}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={text.trim() ? [Colors.light.primary, Colors.light.secondary] : ['#e2e8f0', '#cbd5e1']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>Geliştirmeye Başla</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
                </LinearGradient>
              </TouchableOpacity>

              <View style={[styles.footer, { backgroundColor: 'transparent' }]}>
                <Text style={styles.footerText}>Fikrini mühendislik spesifikasyonuna dönüştürelim.</Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 32,
    backgroundColor: '#ffffff',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    marginBottom: 20,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -2,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#64748b',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#f8fafc',
    borderRadius: 36,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  input: {
    height: 180,
    fontSize: 19,
    color: '#1e293b',
    textAlignVertical: 'top',
    paddingTop: 0,
    lineHeight: 28,
  },
  buttonContainer: {
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  button: {
    flexDirection: 'row',
    paddingVertical: 22,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  footer: {
    marginTop: 'auto',
    paddingVertical: 40,
    alignItems: 'center',
  },
  footerText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: '80%',
  },
});
