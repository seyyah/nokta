import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, AccentColor } from '../context/ThemeContext';
import { getColors, accentPalettes } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function SettingsScreen() {
  const { themeMode, accentColor, toggleTheme, setAccentColor } = useTheme();
  const navigation = useNavigation();
  const colors = getColors(themeMode, accentColor);

  const accents: AccentColor[] = ['purple', 'orange', 'green', 'blue', 'red'];

  const accentLabels: Record<AccentColor, string> = {
    purple: 'Mor',
    orange: 'Turuncu',
    green: 'Yeşil',
    blue: 'Mavi',
    red: 'Kırmızı',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Ayarlar</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>GÖRÜNÜM</Text>
          <View style={[styles.row, { backgroundColor: colors.bgCard, borderColor: colors.bgCardBorder }]}>
            <View style={styles.rowLabel}>
              <Ionicons name={themeMode === 'dark' ? 'moon' : 'sunny'} size={20} color={colors.primary} />
              <Text style={[styles.rowText, { color: colors.textPrimary }]}>Karanlık Tema</Text>
            </View>
            <Switch
              value={themeMode === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: '#CBD5E1', true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>TEMA RENGİ</Text>
          <View style={[styles.accentGrid, { backgroundColor: colors.bgCard, borderColor: colors.bgCardBorder }]}>
            {accents.map((acc) => (
              <TouchableOpacity
                key={acc}
                style={[
                  styles.accentItem,
                  accentColor === acc && { borderColor: colors.primary, borderWidth: 2 }
                ]}
                onPress={() => setAccentColor(acc)}
              >
                <View style={[styles.colorCircle, { backgroundColor: accentPalettes[acc] }]} />
                <Text style={[styles.accentText, { color: colors.textPrimary }]}>{accentLabels[acc]}</Text>
                {accentColor === acc && (
                   <View style={styles.checkIcon}>
                     <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                   </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
             <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>HAKKINDA</Text>
             <View style={[styles.row, { backgroundColor: colors.bgCard, borderColor: colors.bgCardBorder }]}>
                <Text style={[styles.rowText, { color: colors.textPrimary }]}>Versiyon</Text>
                <Text style={[styles.rowText, { color: colors.textMuted }]}>1.0.0</Text>
             </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 10,
    marginLeft: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  rowLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowText: {
    fontSize: 16,
    fontWeight: '600',
  },
  accentGrid: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  accentItem: {
    width: '31%',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: 8,
  },
  accentText: {
    fontSize: 12,
    fontWeight: '700',
  },
  checkIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
  }
});
