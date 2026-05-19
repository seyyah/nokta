import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Zap, ShieldAlert } from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PitchInput'>;

const PitchInputScreen = () => {
  const [pitch, setPitch] = useState('');
  const navigation = useNavigation<NavigationProp>();

  const handleStartAnalysis = () => {
    if (pitch.trim().length < 10) return;
    navigation.navigate('Loading', { pitch });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Zap color={COLORS.primary} size={32} />
              <Text style={styles.logoText}>Slop<Text style={{color: COLORS.primary}}>Sense</Text></Text>
            </View>
            <Text style={styles.subtitle}>Autonomous Due Diligence Agent</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Startup pitch / pazar iddialarını buraya yapıştırın</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: 'Dünyanın ilk yapay zeka tabanlı, blockchain entegreli, sürdürülebilir kedi maması abonelik kutusu...'"
              placeholderTextColor={COLORS.textSecondary}
              multiline
              textAlignVertical="top"
              value={pitch}
              onChangeText={setPitch}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, pitch.trim().length < 10 && styles.buttonDisabled]}
            onPress={handleStartAnalysis}
            disabled={pitch.trim().length < 10}
            activeOpacity={0.8}
          >
            <ShieldAlert color={COLORS.text} size={20} />
            <Text style={styles.buttonText}>Otonom Due Diligence Başlat</Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Engineering-Guided Analysis powered by Gemini AI
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
    marginLeft: SPACING.sm,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  inputContainer: {
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
    fontWeight: '500',
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
    padding: SPACING.lg,
    height: 250,
    fontSize: 16,
    lineHeight: 24,
  },
  button: {
    backgroundColor: COLORS.primary,
    height: 60,
    borderRadius: BORDER_RADIUS.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: COLORS.surfaceLight,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginLeft: SPACING.sm,
  },
  footerText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: SPACING.xxl,
    opacity: 0.5,
  },
});

export default PitchInputScreen;
