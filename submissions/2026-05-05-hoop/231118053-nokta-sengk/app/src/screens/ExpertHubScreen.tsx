import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS } from '../theme/colors';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, AnalysisResult } from '../navigation/types';
import { 
  ArrowLeft, 
  Cpu, 
  Banknote, 
  Telescope, 
  MessageCircle, 
  ShieldCheck,
  Clock,
  UserCheck
} from 'lucide-react-native';

type ExpertHubRouteProp = RouteProp<RootStackParamList, 'ExpertHub'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ExpertHub'>;

const ExpertHubScreen = () => {
  const route = useRoute<ExpertHubRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const [currentResult, setCurrentResult] = useState<AnalysisResult>(route.params.result);
  const [isRequesting, setIsRequesting] = useState(false);

  const handleHumanIntervention = () => {
    setIsRequesting(true);
    // Simulate API call to request human expert
    setTimeout(() => {
      setIsRequesting(false);
      setCurrentResult({
        ...currentResult,
        status: 'PENDING_HUMAN'
      });
      Alert.alert(
        "İstek Alındı",
        "Analiziniz bir insan uzmana (VC Danışmanı) yönlendirildi. Kısa süre içinde geri bildirim alacaksınız.",
        [{ text: "Tamam" }]
      );
    }, 2000);
  };

  // Simulate human feedback coming in
  const simulateHumanFeedback = () => {
    setCurrentResult({
      ...currentResult,
      status: 'HUMAN_VERIFIED',
      humanNotes: [
        "Teknik iddialar pazar standartlarına göre oldukça abartılı bulunmuştur.",
        "Gelir modeli kısmında bahsedilen 'virallik' katsayısı gerçekçi değil.",
        "Ancak ekip yetkinliği slop skorunu aşağı çekebilir, bu kısım incelenmeli."
      ]
    });
  };

  const renderExpertInsight = (title: string, insight: string, Icon: any, color: string) => (
    <View style={styles.insightCard}>
      <View style={[styles.insightIcon, { backgroundColor: color + '20' }]}>
        <Icon color={color} size={24} />
      </View>
      <View style={styles.insightContent}>
        <Text style={styles.insightTitle}>{title}</Text>
        <Text style={styles.insightText}>{insight || 'Analiz ediliyor...'}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft color={COLORS.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Uzman Hub</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>AI Uzman Heyeti</Text>
        
        {renderExpertInsight(
          "CTO (Teknik Denetçi)", 
          currentResult.expertInsights?.cto || "", 
          Cpu, 
          COLORS.secondary
        )}
        
        {renderExpertInsight(
          "CFO (Finansal Denetçi)", 
          currentResult.expertInsights?.cfo || "", 
          Banknote, 
          COLORS.success
        )}
        
        {renderExpertInsight(
          "Stratejist", 
          currentResult.expertInsights?.strategist || "", 
          Telescope, 
          COLORS.primary
        )}

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>İnsan Müdahalesi</Text>

        {currentResult.status === 'AI_ONLY' && (
          <View style={styles.interventionBox}>
            <Text style={styles.interventionText}>
              AI analizini yeterli bulmadınız mı? Gerçek bir yatırım uzmanının raporu incelemesini isteyebilirsiniz.
            </Text>
            <TouchableOpacity 
              style={styles.interventionButton}
              onPress={handleHumanIntervention}
              disabled={isRequesting}
            >
              <MessageCircle color={COLORS.text} size={20} />
              <Text style={styles.interventionButtonText}>
                {isRequesting ? 'İstek Gönderiliyor...' : 'Uzman Müdahalesi İste'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {currentResult.status === 'PENDING_HUMAN' && (
          <View style={[styles.statusBox, { borderColor: COLORS.warning }]}>
            <Clock color={COLORS.warning} size={24} />
            <View style={styles.statusInfo}>
              <Text style={[styles.statusTitle, { color: COLORS.warning }]}>İnceleme Bekleniyor</Text>
              <Text style={styles.statusDesc}>Raporunuz uzman havuzuna iletildi.</Text>
            </View>
            <TouchableOpacity onPress={simulateHumanFeedback}>
               <Text style={{color: COLORS.textSecondary, fontSize: 10}}>(Simüle Et)</Text>
            </TouchableOpacity>
          </View>
        )}

        {currentResult.status === 'HUMAN_VERIFIED' && (
          <View style={styles.humanNotesContainer}>
            <View style={styles.humanHeader}>
              <UserCheck color={COLORS.success} size={24} />
              <Text style={styles.humanTitle}>Uzman Notları</Text>
            </View>
            {currentResult.humanNotes?.map((note, idx) => (
              <View key={idx} style={styles.humanNoteItem}>
                <ShieldCheck color={COLORS.success} size={16} style={{ marginTop: 2 }} />
                <Text style={styles.humanNoteText}>{note}</Text>
              </View>
            ))}
          </View>
        )}
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  insightIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  insightText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.xl,
  },
  interventionBox: {
    backgroundColor: COLORS.surfaceLight,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.textSecondary,
  },
  interventionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  interventionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  interventionButtonText: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 16,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  statusInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  humanNotesContainer: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.success + '40',
  },
  humanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  humanTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.success,
  },
  humanNoteItem: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
    alignItems: 'flex-start',
  },
  humanNoteText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
});

export default ExpertHubScreen;
