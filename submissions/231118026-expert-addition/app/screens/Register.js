import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { CATALOG } from '../data/catalog';

const SPECIALTIES = Object.entries(CATALOG).map(([id, data]) => ({
  id,
  label: data.label,
  icon: data.icon,
  accent: data.accentColor,
  count: data.components.length,
}));

export default function Register({ navigation }) {
  const { register } = useContext(AppContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [specialty, setSpecialty] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const accent = specialty ? CATALOG[specialty]?.accentColor : '#abcbdf';

  const validate = () => {
    if (!name.trim()) return 'İsim gerekli.';
    if (!email.trim() || !email.includes('@')) return 'Geçerli bir e-posta girin.';
    if (password.length < 6) return 'Şifre en az 6 karakter olmalı.';
    if (!specialty) return 'Uzmanlık alanı seçin.';
    return null;
  };

  const handleRegister = async () => {
    setError('');
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    const ok = await register(email.trim().toLowerCase(), password, name.trim(), specialty);
    setLoading(false);
    if (!ok) {
      setError('Bu e-posta zaten kayıtlı. Giriş yapmayı deneyin.');
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
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Hesap oluştur</Text>
        <Text style={styles.subtitle}>Uzmanlık alanınıza özel uygulama tasarlayın</Text>

        {/* İsim */}
        <View style={styles.fieldWrap}>
          <Text style={styles.label}>İsim</Text>
          <View style={styles.inputRow}>
            <Ionicons name="person-outline" size={18} color="#6B6B6B" />
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Dr. Adınız Soyadınız"
              placeholderTextColor="#6B6B6B"
              returnKeyType="next"
            />
          </View>
        </View>

        {/* E-posta */}
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

        {/* Şifre */}
        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Şifre</Text>
          <View style={styles.inputRow}>
            <Ionicons name="lock-closed-outline" size={18} color="#6B6B6B" />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="En az 6 karakter"
              placeholderTextColor="#6B6B6B"
              secureTextEntry={!showPass}
              returnKeyType="done"
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

        {/* Uzmanlık alanı */}
        <Text style={[styles.label, { marginBottom: 12 }]}>Uzmanlık Alanı</Text>
        <View style={styles.specialtyGrid}>
          {SPECIALTIES.map((item) => {
            const isSelected = specialty === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.specCard,
                  isSelected && { borderColor: item.accent, borderWidth: 2, backgroundColor: item.accent + '11' },
                ]}
                onPress={() => setSpecialty(item.id)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={item.icon}
                  size={22}
                  color={isSelected ? item.accent : '#6B6B6B'}
                />
                <Text
                  style={[styles.specLabel, isSelected && { color: item.accent }]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
                <Text style={styles.specCount}>{item.count} özellik</Text>
                {isSelected && (
                  <View style={[styles.checkMark, { backgroundColor: item.accent }]}>
                    <Ionicons name="checkmark" size={10} color="#121415" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={14} color="#ffb4ab" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: accent }, loading && { opacity: 0.7 }]}
          onPress={handleRegister}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#121415" />
            : <Text style={styles.btnText}>Kayıt Ol</Text>}
        </TouchableOpacity>

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Zaten hesabın var mı?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.switchLink}> Giriş Yap</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#121415' },
  container: { padding: 24, paddingTop: 72 },

  logoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 20, fontWeight: 'bold', color: '#abcbdf' },
  loginLink: { fontSize: 14, color: '#abcbdf', fontWeight: '600' },

  title: { fontSize: 28, fontWeight: 'bold', color: '#e3e2e3', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#6B6B6B', marginBottom: 28, lineHeight: 20 },

  fieldWrap: { marginBottom: 16 },
  label: { fontSize: 12, color: '#c2c7cc', fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#1e2021', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 14,
    borderWidth: 1, borderColor: '#292a2b',
  },
  input: { flex: 1, color: '#e3e2e3', fontSize: 15 },

  specialtyGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24,
  },
  specCard: {
    width: '47%', backgroundColor: '#1e2021', borderRadius: 14,
    padding: 14, borderWidth: 1, borderColor: '#292a2b',
    alignItems: 'center', gap: 6, position: 'relative',
  },
  specLabel: { fontSize: 13, fontWeight: '600', color: '#c2c7cc', textAlign: 'center' },
  specCount: { fontSize: 11, color: '#6B6B6B' },
  checkMark: {
    position: 'absolute', top: 8, right: 8,
    width: 16, height: 16, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
  },

  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#ffb4ab18', borderRadius: 10,
    padding: 12, marginBottom: 16,
    borderWidth: 1, borderColor: '#ffb4ab33',
  },
  errorText: { color: '#ffb4ab', fontSize: 13, flex: 1 },

  btn: {
    padding: 17, borderRadius: 14,
    alignItems: 'center', marginBottom: 24,
  },
  btnText: { color: '#121415', fontSize: 17, fontWeight: 'bold' },

  switchRow: { flexDirection: 'row', justifyContent: 'center' },
  switchText: { color: '#6B6B6B', fontSize: 14 },
  switchLink: { color: '#abcbdf', fontSize: 14, fontWeight: '600' },
});
