import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ai } from '../../services/ai';

export default function HomeScreen() {
  const [idea, setIdea] = useState('');
  const router = useRouter();

  const handleStart = () => {
    if (idea.trim().length < 10) return;
    router.push({
      pathname: '/chat',
      params: { rawIdea: idea.trim() },
    });
  };

  const isConfigured = ai.isConfigured();

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.topRow}>
            <Text style={styles.logo}>🚀 NOKTA</Text>
            <TouchableOpacity
              onPress={() => router.push('/onboarding')}
              style={styles.helpBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="help-circle-outline" size={24} color="#1A73E8" />
            </TouchableOpacity>
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Spec Generator</Text>
            <Text style={styles.subtitle}>
              Ham fikirlerinizi sorgular, yapılandırır ve tek sayfalık net bir ürün spesifikasyonuna dönüştürür.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardHeader}>Fikriniz Nedir?</Text>
            <Text style={styles.cardDescription}>
              Aklınızdaki ham fikri yazın. AI bu fikri 5 kritik mühendislik sorusuyla rafine edecek.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: Evcil hayvan sahipleri için mahalledeki diğer hayvan sahipleriyle buluşma ve sosyalleşme sağlayan mobil uygulama..."
              placeholderTextColor="#9AA0A6"
              value={idea}
              onChangeText={setIdea}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            
            <View style={styles.indicatorRow}>
              <View style={styles.badge}>
                <View style={[styles.badgeDot, { backgroundColor: isConfigured ? '#34A853' : '#FBBC05' }]} />
                <Text style={styles.badgeText}>
                  {isConfigured ? 'AI AKTİF (Direct)' : 'DEMO MODU (Mock)'}
                </Text>
              </View>
              <Text style={[styles.charCount, idea.trim().length < 10 && styles.charCountWarning]}>
                {idea.trim().length} / 10 karakter
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, idea.trim().length < 10 && styles.buttonDisabled]}
            onPress={handleStart}
            disabled={idea.trim().length < 10}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Fikri Sorgula</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={styles.buttonIcon} />
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  helpBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F1F3F4',
  },
  header: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 32,
  },
  logo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A73E8',
    letterSpacing: 2,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#202124',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#5F6368',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 24,
  },
  cardHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#202124',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 13,
    color: '#5F6368',
    marginBottom: 16,
    lineHeight: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#202124',
    backgroundColor: '#FAFAFA',
    minHeight: 120,
    lineHeight: 22,
  },
  indicatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F3F4',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5F6368',
    letterSpacing: 0.5,
  },
  charCount: {
    fontSize: 12,
    color: '#34A853',
    fontWeight: '600',
  },
  charCountWarning: {
    color: '#EA4335',
  },
  button: {
    backgroundColor: '#1A73E8',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1A73E8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#DADCE0',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonIcon: {
    marginLeft: 8,
  },
});
