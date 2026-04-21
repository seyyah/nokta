import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Share,
  Dimensions,
  Platform,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { getColors } from '../../theme/colors';
import { SlopGauge } from './SlopGauge';
import { ClaimCard } from './ClaimCard';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { AnalysisResult } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { generatePdfReport } from '../../utils/reportGenerator';
import { ChatModal } from './ChatModal';

interface Props {
  visible: boolean;
  result: AnalysisResult | null;
  pitch: string;
  onClose: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function ResultModal({ visible, result, pitch, onClose }: Props) {
  const { themeMode, accentColor } = useTheme();
  const colors = getColors(themeMode, accentColor);
  const [chatVisible, setChatVisible] = useState(false);

  if (!result) return null;

  const handleShare = async () => {
    const msg =
      `🔍 Nokta Girişim Analiz Raporu\n\n` +
      `Slop Skoru: ${result.slopScore}/100\n\n` +
      `Özet: ${result.summary}\n\n` +
      `Öneri: ${result.recommendation}\n\n` +
      `— Nokta Slop Dedektörü`;
    await Share.share({ message: msg });
  };

  const handleExportPdf = async () => {
    try {
      await generatePdfReport(result, pitch);
    } catch (e) {
      alert("Rapor oluşturulurken bir hata oluştu.");
    }
  };

  const scoreColor =
    result.slopScore < 35 ? colors.success :
    result.slopScore < 65 ? colors.warning : colors.error;

  const scoreBg =
    result.slopScore < 35 ? colors.success + '11' :
    result.slopScore < 65 ? colors.warning + '11' : colors.error + '11';

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <TouchableOpacity 
            activeOpacity={1} 
            style={styles.backdrop} 
            onPress={onClose} 
          />
          
          <View style={[styles.modalContainer, { backgroundColor: colors.bg }]}>
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={[styles.header, { borderBottomColor: colors.bgCardBorder }]}>
                <View style={[styles.dragIndicator, { backgroundColor: colors.textDim }]} />
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Ionicons name="close" size={24} color={colors.textMuted} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Analiz Sonucu</Text>
              </View>

              <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {/* Score section */}
                <View style={styles.scoreSection}>
                  <SlopGauge score={result.slopScore} />
                  <View style={[styles.interpretBand, { backgroundColor: scoreBg, borderColor: scoreColor + '44' }]}>
                    <Text style={[styles.interpretText, { color: scoreColor }]}>
                      {result.slopScore < 35 ? '✓ Güçlü Girişim' :
                       result.slopScore < 65 ? '⚠ Orta Risk / Slop' :
                       '✗ Yüksek Slop Riski'}
                    </Text>
                  </View>
                </View>

                {/* AI Summary */}
                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: colors.primary }]}>AI ÖZETİ</Text>
                  <Card>
                    <Text style={[styles.summaryText, { color: colors.textPrimary }]}>{result.summary}</Text>
                  </Card>
                </View>

                {/* Actions */}
                <View style={styles.actionGrid}>
                  <TouchableOpacity 
                    onPress={() => setChatVisible(true)}
                    style={[styles.actionBtn, { backgroundColor: colors.bgCard, borderColor: colors.bgCardBorder }]}
                  >
                    <Ionicons name="chatbubbles-outline" size={20} color={colors.primary} />
                    <Text style={[styles.actionBtnText, { color: colors.textPrimary }]}>AI'ya Sor</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={handleExportPdf}
                    style={[styles.actionBtn, { backgroundColor: colors.bgCard, borderColor: colors.bgCardBorder }]}
                  >
                    <Ionicons name="download-outline" size={20} color={colors.primary} />
                    <Text style={[styles.actionBtnText, { color: colors.textPrimary }]}>PDF Raporu</Text>
                  </TouchableOpacity>
                </View>

                {/* Claims */}
                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: colors.primary }]}>BULGULAR ({result.claims.length})</Text>
                  {result.claims.map((claim, i) => (
                    <ClaimCard key={i} claim={claim} index={i} />
                  ))}
                </View>

                {/* Recommendation */}
                <View style={[styles.section, { marginBottom: 40 }]}>
                  <Text style={[styles.sectionLabel, { color: colors.primary }]}>YATIRIMCI ÖNERİSİ</Text>
                  <View style={[styles.recommendCard, { backgroundColor: colors.primary + '08', borderColor: colors.primary + '22' }]}>
                    <Ionicons name="bulb-outline" size={24} color={colors.primary} style={{ marginBottom: 10 }} />
                    <Text style={[styles.recommendText, { color: colors.textPrimary }]}>{result.recommendation}</Text>
                  </View>
                </View>
              </ScrollView>

              {/* Bottom Actions */}
              <View style={[styles.footer, { borderTopColor: colors.bgCardBorder, backgroundColor: colors.bg }]}>
                 <Button 
                   text="Kapat" 
                   variant="secondary" 
                   onPress={onClose} 
                   style={{ flex: 1 }}
                 />
                 <Button 
                   text="Paylaş" 
                   onPress={handleShare} 
                   style={{ flex: 1 }}
                 />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <ChatModal 
        visible={chatVisible}
        onClose={() => setChatVisible(false)}
        pitch={pitch}
        analysisResult={result}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContainer: {
    height: SCREEN_HEIGHT * 0.9,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  modalContent: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingBottom: 15,
    paddingTop: 10,
    borderBottomWidth: 1,
  },
  dragIndicator: {
    width: 44,
    height: 5,
    borderRadius: 3,
    marginBottom: 10,
    opacity: 0.2,
  },
  closeBtn: {
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: 25,
  },
  interpretBand: {
    marginTop: 15,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 100,
    borderWidth: 1,
  },
  interpretText: {
    fontSize: 14,
    fontWeight: '700',
  },
  section: {
    marginBottom: 25,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 25,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  recommendCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  recommendText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 35 : 20,
    borderTopWidth: 1,
  },
});
