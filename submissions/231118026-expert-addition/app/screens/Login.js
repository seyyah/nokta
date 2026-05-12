import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';

export default function Login({ navigation }) {
  const { signIn } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('E-posta ve şifre gerekli.');
      return;
    }
    setLoading(true);
    const ok = await signIn(email.trim().toLowerCase(), password);
    setLoading(false);
    if (!ok) {
      setError('E-posta veya şifre hatalı.');
    } else {
      navigation.replace('MainTabs');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoRow}>
          <Text style={styles.logo}>NonSlop</Text>
        </View>

        <Text style={styles.title}>Tekrar hoş geldiniz</Text>
        <Text style={styles.subtitle}>Hesabınıza giriş yapın</Text>

        <View style={styles.fieldWrap}>
          <Text style={styles.label}>E-posta</Text>
          <View style={styles.inputRow}>
            <Ionicons name="mail-outline" size={18} color="#6B6B6B" />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="doktor@klinik.com"
              placeholderTextColor="#6B6B6B"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              returnKeyType="next"
            />
          </View>
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Şifre</Text>
          <View style={styles.inputRow}>
            <Ionicons name="lock-closed-outline" size={18} color="#6B6B6B" />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#6B6B6B"
              secureTextEntry={!showPass}
              returnKeyType="go"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity onPress={() => setShowPass(p => !p)} hitSlop={8}>
              <Ionicons
                name={showPass ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color="#6B6B6B"
              />
            </TouchableOpacity>
          </View>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={14} color="#ffb4ab" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.btn, loading && { opacity: 0.7 }]}
          onPress={handleLogin}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#121415" />
            : <Text style={styles.btnText}>Giriş Yap</Text>}
        </TouchableOpacity>

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Hesabın yok mu?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.switchLink}> Kayıt Ol</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#121415' },
  container: { padding: 24, paddingTop: 80, flexGrow: 1 },

  logoRow: { marginBottom: 40 },
  logo: { fontSize: 20, fontWeight: 'bold', color: '#abcbdf' },

  title: { fontSize: 30, fontWeight: 'bold', color: '#e3e2e3', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#6B6B6B', marginBottom: 36 },

  fieldWrap: { marginBottom: 16 },
  label: { fontSize: 12, color: '#c2c7cc', fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#1e2021', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 14,
    borderWidth: 1, borderColor: '#292a2b',
  },
  input: { flex: 1, color: '#e3e2e3', fontSize: 15 },

  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#ffb4ab18', borderRadius: 10,
    padding: 12, marginBottom: 16,
    borderWidth: 1, borderColor: '#ffb4ab33',
  },
  errorText: { color: '#ffb4ab', fontSize: 13 },

  btn: {
    backgroundColor: '#abcbdf', padding: 17, borderRadius: 14,
    alignItems: 'center', marginTop: 8, marginBottom: 28,
  },
  btnText: { color: '#121415', fontSize: 17, fontWeight: 'bold' },

  switchRow: { flexDirection: 'row', justifyContent: 'center' },
  switchText: { color: '#6B6B6B', fontSize: 14 },
  switchLink: { color: '#abcbdf', fontSize: 14, fontWeight: '600' },
});
