import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS } from '../theme/colors';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import SlopGauge from '../components/SlopGauge';
import { AlertTriangle, TrendingDown, Target, ArrowLeft, Radio } from 'lucide-react-native';

type DashboardRouteProp = RouteProp<RootStackParamList, 'Dashboard'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

const AnalysisDashboard = () => {
  const route = useRoute<DashboardRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { result } = route.params;

  const renderReasoningCard = (text: string, index: number) => (
    <View key={index} style={styles.card}>
      <View style={styles.cardIconContainer}>
        <AlertTriangle color={COLORS.warning} size={20} />
      </View>
      <Text style={styles.cardText}>{text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('PitchInput')}>
          <ArrowLeft color={COLORS.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Slop Dashboard</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SlopGauge score={result.score} />

        <View style={styles.sectionHeader}>
          <Target color={COLORS.text} size={20} />
          <Text style={styles.sectionTitle}>Analysis Reasoning</Text>
        </View>

        {result.reasoning.map((item, index) => renderReasoningCard(item, index))}

        {/* Bonus Feature: Sosyal Sensör / Rakip Radarı */}
        <View style={styles.socialSensorContainer}>
          <View style={styles.socialSensorHeader}>
            <Radio color={COLORS.secondary} size={20} />
            <Text style={styles.socialSensorTitle}>Sosyal Sensör / Rakip Radarı</Text>
          </View>
          
          <View style={styles.socialSensorContent}>
            <Text style={styles.socialSensorLabel}>Tespit Edilen Rakipler:</Text>
            {result.socialSensor.competitors.map((comp, idx) => (
              <Text key={idx} style={styles.socialSensorItem}>• {comp}</Text>
            ))}
            
            <View style={styles.warningBox}>
              <TrendingDown color={COLORS.danger} size={16} />
              <Text style={styles.warningTitle}>Pazar Uyarısı:</Text>
            </View>
            {result.socialSensor.warnings.map((warn, idx) => (
              <Text key={idx} style={styles.warningText}>{warn}</Text>
            ))}
          </View>
        </View>

        <TouchableOpacity 
          style={styles.resetButton}
          onPress={() => navigation.navigate('PitchInput')}
        >
          <Text style={styles.resetButtonText}>Yeni Analiz Başlat</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardIconContainer: {
    marginTop: 2,
    marginRight: SPACING.sm,
  },
  cardText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  socialSensorContainer: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  socialSensorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  socialSensorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.secondary,
    marginLeft: SPACING.sm,
    textTransform: 'uppercase',
  },
  socialSensorContent: {
    gap: SPACING.xs,
  },
  socialSensorLabel: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  socialSensorItem: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    gap: SPACING.xs,
  },
  warningTitle: {
    fontSize: 14,
    color: COLORS.danger,
    fontWeight: '700',
  },
  warningText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  resetButton: {
    marginTop: SPACING.xxl,
    marginBottom: SPACING.xxl,
    padding: SPACING.md,
    alignItems: 'center',
  },
  resetButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default AnalysisDashboard;
