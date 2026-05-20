import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Theme } from '../theme';
import { GlassContainer } from '../components/GlassContainer';
import { ArrowRight, Zap } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [dot, setDot] = useState('');

  const handleStart = () => {
    if (dot.trim()) {
      navigation.navigate('Questions', { dot });
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.hero}>
          <Text style={styles.title}>NOKTA</Text>
          <Text style={styles.subtitle}>Fikrinizdeki sessizliği blueprint'e çevirin.</Text>
        </View>

        <GlassContainer style={styles.inputContainer}>
          <View style={styles.inputHeader}>
            <Zap size={16} color={Theme.colors.primary} />
            <Text style={styles.label}>DAĞINIK FİKİR (THE DOT)</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Aklınızdaki o ham fikri buraya bırakın..."
            placeholderTextColor={Theme.colors.textSecondary}
            multiline
            value={dot}
            onChangeText={setDot}
          />
        </GlassContainer>

        <TouchableOpacity 
          style={[styles.button, !dot.trim() && styles.buttonDisabled]} 
          onPress={handleStart}
          disabled={!dot.trim()}
        >
          <Text style={styles.buttonText}>ENRICHMENT SÜRECİNİ BAŞLAT</Text>
          <ArrowRight size={20} color="#000" />
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Track A: Spec-Gen Toolchain</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    padding: Theme.spacing.lg,
    flexGrow: 1,
  },
  hero: {
    marginTop: 40,
    marginBottom: 60,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: Theme.colors.text,
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.sm,
  },
  inputContainer: {
    marginBottom: Theme.spacing.xl,
    minHeight: 150,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Theme.spacing.md,
  },
  label: {
    color: Theme.colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  input: {
    color: Theme.colors.text,
    fontSize: 18,
    lineHeight: 26,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: Theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.lg,
    borderRadius: Theme.roundness.md,
    gap: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingVertical: Theme.spacing.xl,
  },
  footerText: {
    color: Theme.colors.textSecondary,
    fontSize: 12,
    opacity: 0.5,
  },
});
