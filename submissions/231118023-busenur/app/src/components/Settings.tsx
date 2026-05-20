import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';

interface SettingsProps {
  currentGoal: number;
  currentWeight: number;
  remindersEnabled: boolean;
  onSaveSettings: (goal: number, weight: number, reminders: boolean) => void;
}

export default function Settings({ 
  currentGoal, 
  currentWeight, 
  remindersEnabled, 
  onSaveSettings 
}: SettingsProps) {
  
  // Local states for inputs
  const [goalText, setGoalText] = useState(currentGoal.toString());
  const [weightText, setWeightText] = useState(currentWeight.toString());
  const [reminders, setReminders] = useState(remindersEnabled);
  
  // INTENTIONAL ROLLBACK COMPONENT STATE (Bug 4):
  const [brokenThemeColor, setBrokenThemeColor] = useState('#1E293B');

  // Calculate recommended target: 35ml per kg of weight
  const getRecommendedWater = (weightVal: number) => {
    if (isNaN(weightVal) || weightVal <= 0) return 2500;
    return Math.round(weightVal * 35);
  };

  // Fixed form validation (Bug 2 Fix)
  const handleSave = () => {
    const goalVal = parseInt(goalText, 10);
    const weightVal = parseFloat(weightText);
    
    if (isNaN(goalVal) || goalVal <= 0) {
      Alert.alert('Hata', 'Lütfen geçerli ve pozitif bir su hedefi girin (ml).');
      return;
    }
    if (isNaN(weightVal) || weightVal <= 0) {
      Alert.alert('Hata', 'Lütfen geçerli ve pozitif bir vücut ağırlığı girin (kg).');
      return;
    }
    
    onSaveSettings(goalVal, weightVal, reminders);
    Alert.alert('Başarılı', 'Ayarlarınız başarıyla güncellendi.');
  };

  // Auto-fill recommended water based on weight input
  const handleRecommendGoal = () => {
    const weightVal = parseFloat(weightText);
    const recommended = getRecommendedWater(weightVal);
    setGoalText(recommended.toString());
  };

  // INTENTIONAL ROLLBACK BUG FUNCTION (Bug 4):
  // The theme toggle tries to make it look "premium" but breaks constraints.
  // We will plant a broken layout style for the theme picker card.
  const handleBrokenTheme = () => {
    // This function will change colors but the visual layout will break due to bad styles
    setBrokenThemeColor('#EF4444');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={[styles.card, { backgroundColor: brokenThemeColor }]}>
        <Text style={styles.cardTitle}>Profil Bilgileri</Text>
        
        {/* Weight input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Vücut Ağırlığı (kg)</Text>
          <TextInput
            style={styles.input}
            value={weightText}
            onChangeText={setWeightText}
            keyboardType="numeric"
            placeholder="Kilonuzu girin"
            placeholderTextColor="#64748B"
          />
          <Text style={styles.helperText}>
            Önerilen günlük su miktarı kilonuza göre otomatik hesaplanabilir. (35 ml / kg)
          </Text>
        </View>

        {/* Recommend Button */}
        <TouchableOpacity style={styles.recommendBtn} onPress={handleRecommendGoal}>
          <Text style={styles.recommendBtnText}>💡 Önerilen Miktarı Hesapla</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Hedef Ayarları</Text>

        {/* Goal input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Günlük Su Hedefi (ml)</Text>
          <TextInput
            style={styles.input}
            value={goalText}
            onChangeText={setGoalText}
            keyboardType="numeric"
            placeholder="Hedef girin"
            placeholderTextColor="#64748B"
          />
        </View>

        {/* Reminders Toggle */}
        <View style={styles.row}>
          <View>
            <Text style={styles.label}>Hatırlatıcı Bildirimler</Text>
            <Text style={styles.helperText}>Gün içinde su içmenizi hatırlatır.</Text>
          </View>
          <Switch
            value={reminders}
            onValueChange={setReminders}
            trackColor={{ false: '#0F172A', true: '#38BDF8' }}
            thumbColor={reminders ? '#FFF' : '#94A3B8'}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Değişiklikleri Kaydet</Text>
        </TouchableOpacity>
      </View>

      {/* INTENTIONAL ROLLBACK TRIGGER COMPONENT (Bug 4):
          We'll add a card that represents a "Theme Selector". We'll style it in a way
          that causes layout problems (e.g. absolute height with negative margins), 
          which will prompt the client to write a bug report. 
          When the agent tries to fix it in Phase B, it will make a mistake, leading to a rollback. */}
      <View style={styles.themeCard}>
        <Text style={styles.cardTitle}>Uygulama Teması</Text>
        <Text style={styles.helperText}>Premium görünüm modunu aktif edin.</Text>
        
        <TouchableOpacity 
          style={styles.themeBtn} 
          onPress={handleBrokenTheme}
        >
          <Text style={styles.themeBtnText}>Kırmızı Alarm Teması</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 24,
  },
  cardTitle: {
    color: '#38BDF8',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    color: '#F8FAFC',
    fontSize: 16,
    width: '100%',
  },
  helperText: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 6,
    lineHeight: 16,
  },
  recommendBtn: {
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: '100%',
  },
  recommendBtnText: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 20,
  },
  saveBtn: {
    backgroundColor: '#0284C7',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    width: '100%',
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // INTENTIONAL ROLLBACK BUG LAYOUT:
  // We style the themeCard with bad positioning that covers a large area or overflows.
  themeCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 24,
    
    // Broken style:
    marginTop: 10,
    height: 110,
  },
  themeBtn: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  themeBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  }
});
