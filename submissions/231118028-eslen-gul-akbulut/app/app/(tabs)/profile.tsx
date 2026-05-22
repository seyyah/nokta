import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [name, setName] = useState('Eslen Gül Akbulut');
  const [email, setEmail] = useState('eslen.gul@example.com');
  const [role, setRole] = useState('QA Engineer');

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]}>
      {/* Header */}
      <View style={styles.header}>
        {/* FIXED: Profile spelling */}
        <Text style={[styles.title, { color: isDark ? '#f8fafc' : '#0f172a' }]}>Profile Settings</Text>
        <Text style={[styles.subtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>Manage your developer profile</Text>
      </View>

      {/* Profile Card */}
      <View style={[styles.profileCard, { backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: isDark ? '#334155' : '#e2e8f0' }]}>
        {/* FIXED: Correct aspect ratio avatar with cover mode */}
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' }}
          style={styles.avatar}
          resizeMode="cover"
        />

        <TouchableOpacity style={styles.changePicBtn}>
          <Text style={styles.changePicText}>Change Picture</Text>
        </TouchableOpacity>

        {/* Form Fields */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: isDark ? '#94a3b8' : '#64748b' }]}>Full Name</Text>
            <TextInput
              style={[styles.input, { color: isDark ? '#f8fafc' : '#0f172a', backgroundColor: isDark ? '#0f172a' : '#f1f5f9', borderColor: isDark ? '#334155' : '#cbd5e1' }]}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            {/* FIXED: E-mail spelling */}
            <Text style={[styles.label, { color: isDark ? '#94a3b8' : '#64748b' }]}>E-mail Address</Text>
            <TextInput
              style={[styles.input, { color: isDark ? '#f8fafc' : '#0f172a', backgroundColor: isDark ? '#0f172a' : '#f1f5f9', borderColor: isDark ? '#334155' : '#cbd5e1' }]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: isDark ? '#94a3b8' : '#64748b' }]}>Role / Position</Text>
            <TextInput
              style={[styles.input, { color: isDark ? '#f8fafc' : '#0f172a', backgroundColor: isDark ? '#0f172a' : '#f1f5f9', borderColor: isDark ? '#334155' : '#cbd5e1' }]}
              value={role}
              onChangeText={setRole}
            />
          </View>
        </View>
      </View>

      {/* FIXED: Clean full-height button layout instead of height-bound container */}
      <View style={styles.saveContainer}>
        <TouchableOpacity style={styles.saveBtn} onPress={() => Alert.alert('Saved', 'Profile updated successfully!')}>
          <Text style={styles.saveBtnText}>Save Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  profileCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  // FIXED: Square, proportional avatar image
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: '#4f46e5',
  },
  changePicBtn: {
    marginTop: 12,
    marginBottom: 20,
  },
  changePicText: {
    color: '#4f46e5',
    fontWeight: '600',
    fontSize: 14,
  },
  form: {
    width: '100%',
    gap: 16,
  },
  inputGroup: {
    width: '100%',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  // FIXED: Standard full size container for save button
  saveContainer: {
    width: '100%',
    marginTop: 16,
    marginBottom: 16,
  },
  saveBtn: {
    backgroundColor: '#4f46e5',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
