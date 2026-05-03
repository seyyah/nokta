import { forwardRef, useMemo, useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Share, Animated, Alert } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

import { PremiumButton } from '@/components/premium-button';

import { CircularScore } from '@/components/circular-score';
import { SectionAccordion } from '@/components/section-accordion';
import { useAppTheme } from '@/lib/theme-context';
import type { SlopResult } from '@/constants/slop-types';
import { detoxIdeaWithAiService } from '@/lib/ai-service';

type Props = {
  result: SlopResult | null;
  ideaText: string;
};

const FadeInStagger = ({ children, index }: { children: React.ReactNode; index: number }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 400,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, [index, anim]);

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [
          {
            translateY: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
};

export const AnalysisBottomSheet = forwardRef<BottomSheet, Props>(({ result, ideaText }, ref) => {
  const { theme } = useAppTheme();
  const snapPoints = useMemo(() => ['70%', '95%'], []);
  const viewShotRef = useRef<ViewShot>(null);
  const [isDetoxing, setIsDetoxing] = useState(false);
  const [detoxResult, setDetoxResult] = useState<string | null>(null);

  useEffect(() => {
    setDetoxResult(null);
  }, [result]);

  const handleDetox = async () => {
    setIsDetoxing(true);
    try {
      const resp = await detoxIdeaWithAiService(ideaText);
      setDetoxResult(resp);
    } catch (e) {
      Alert.alert('Detoks Hatası', 'Maalesef fikrin detoks edilemeyecek kadar toksik veya bağlantı koptu.');
    } finally {
      setIsDetoxing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return '#FE5E73';
      case 'high':
        return '#FF9F46';
      case 'medium':
        return '#FFD166';
      default:
        return '#36D887';
    }
  };

  const handleShare = async () => {
    if (!result) return;
    try {
      if (viewShotRef.current && viewShotRef.current.capture) {
        const uri = await viewShotRef.current.capture();
        const available = await Sharing.isAvailableAsync();
        if (available) {
          await Sharing.shareAsync(uri, { dialogTitle: 'Slop Raporu' });
          return;
        }
      }
      const shareText = `Slop Analizi: "${ideaText}"\nSlop Skoru: ${result.slop_score}\n\n${result.analysis}\n\nNokta Analyzer ile analiz edildi.`;
      await Share.share({ message: shareText });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const renderBackground = useCallback(() => (
    <LinearGradient
      colors={theme.gradientColors}
      style={[
        StyleSheet.absoluteFillObject,
        { borderTopLeftRadius: 32, borderTopRightRadius: 32 }
      ]}
    />
  ), [theme.gradientColors]);

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backgroundComponent={renderBackground}
      handleIndicatorStyle={{ backgroundColor: theme.textSecondary }}
    >
      {result && (
        <BottomSheetScrollView contentContainerStyle={styles.sheetContainer}>
          <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>Anında Analiz Raporu</Text>
          <Text style={[styles.sheetIdeaText, { color: theme.textSecondary }]}>
            "{ideaText}"
          </Text>

          <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }}>
            <View style={[styles.detailCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
              <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Mühendislik Skoru</Text>
              <View style={styles.scoreRow}>
                <CircularScore score={result.slop_score} />
              </View>
              <Text style={[styles.analysisText, { color: theme.textSecondary }]}>
                {result.analysis}
              </Text>
            </View>
          </ViewShot>

          <SectionAccordion title="Temel Eleştiriler" iconName="wrench">
            {result.flaws.map((flaw, idx) => (
              <FadeInStagger key={`flaw-${idx}`} index={idx}>
                <View style={styles.listItem}>
                  <View style={[styles.emojiBadge, { backgroundColor: getSeverityColor(flaw.severity) + '1A', borderColor: getSeverityColor(flaw.severity), shadowColor: getSeverityColor(flaw.severity) }]}>
                    <Text style={styles.emojiIcon}>⚙️</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                     <View style={styles.listItemHeaderRow}>
                     <Text style={[styles.listItemTitle, { color: theme.textPrimary }]}>{flaw.type}</Text>
                     <View style={[styles.badgeContainer, { backgroundColor: getSeverityColor(flaw.severity) + '20', borderColor: getSeverityColor(flaw.severity) }]}>
                       <Text style={[styles.badgeText, { color: getSeverityColor(flaw.severity) }]}>{flaw.severity}</Text>
                     </View>
                   </View>
                   <Text style={[styles.listItemDesc, { color: theme.textSecondary }]}>{flaw.description}</Text>
                </View>
              </View>
              </FadeInStagger>
            ))}
          </SectionAccordion>

          <SectionAccordion title="Kritik Mühendislik Soruları" iconName="help-circle-outline">
            <Text style={[styles.deepDiveHint, { color: theme.textSecondary }]}>
              Fikrin teknik risklerini minimize etmek için mentor soruları.
            </Text>
            {result.engineering_questions.map((q, idx) => (
              <FadeInStagger key={`q-${idx}`} index={idx}>
                <View style={styles.listItem}>
                  <View style={[styles.emojiBadge, { backgroundColor: getSeverityColor(q.severity) + '1A', borderColor: getSeverityColor(q.severity), shadowColor: getSeverityColor(q.severity) }]}>
                    <Text style={styles.emojiIcon}>❓</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                     <View style={styles.listItemHeaderRow}>
                     <Text style={[styles.listItemTitle, { color: theme.textPrimary }]}>{q.question}</Text>
                     <View style={[styles.badgeContainer, { backgroundColor: getSeverityColor(q.severity) + '20', borderColor: getSeverityColor(q.severity) }]}>
                       <Text style={[styles.badgeText, { color: getSeverityColor(q.severity) }]}>{q.severity}</Text>
                     </View>
                   </View>
                   <Text style={[styles.listItemDesc, { color: theme.textSecondary }]}>{q.why_critical}</Text>
                </View>
              </View>
              </FadeInStagger>
            ))}
          </SectionAccordion>

          {result.similarProjects && result.similarProjects.length > 0 && (
            <SectionAccordion title="Piyasadaki Benzerleri" iconName="bank-outline">
              <Text style={[styles.deepDiveHint, { color: theme.textSecondary }]}>
                Bu fikrin neden orijinal olmadığını veya zorluğunu gösteren örnekler.
              </Text>
              {result.similarProjects.map((proj, idx) => (
                <FadeInStagger key={`proj-${idx}`} index={idx}>
                  <View style={styles.listItem}>
                    <View style={[styles.emojiBadge, { backgroundColor: '#FFD1661A', borderColor: '#FFD166', shadowColor: '#FFD166' }]}>
                      <Text style={styles.emojiIcon}>🧠</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                     <Text style={[styles.listItemDesc, { color: theme.textSecondary }]}>{proj}</Text>
                    </View>
                  </View>
                </FadeInStagger>
              ))}
              </SectionAccordion>
          )}

          <View style={{ marginTop: 12 }}>
            <View style={styles.sectionHeaderRow}>
              <MaterialCommunityIcons name="magic-staff" size={24} color="#36D887" />
              <Text style={[styles.sectionTitle, { color: theme.textSecondary, marginBottom: 0 }]}>SLOP DETOKS</Text>
            </View>
            {detoxResult ? (
              <View style={[styles.detoxCard, { backgroundColor: '#36D88715', borderColor: '#36D887' }]}>
                <Text style={[styles.detoxText, { color: theme.textPrimary }]}>{detoxResult}</Text>
              </View>
            ) : (
              <PremiumButton title="Fikri Kurtar (MVP Yap)" onPress={handleDetox} disabled={isDetoxing} loading={isDetoxing} />
            )}
          </View>

          <View style={{ marginTop: 16 }}>
            <PremiumButton title="Raporu Paylaş" onPress={handleShare} disabled={false} loading={false} />
          </View>
        </BottomSheetScrollView>
      )}
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  bottomSheetLight: {
    backgroundColor: '#FAFBFD',
  },
  bottomSheetDark: {
    backgroundColor: '#090B13',
  },
  sheetContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 8,
    gap: 16,
  },
  sheetTitle: {
    fontSize: 26,
    fontWeight: '800',
  },
  sheetIdeaText: {
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  detailCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  scoreRow: {
    alignItems: 'center',
  },
  analysisText: {
    marginTop: 16,
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
  },
  deepDiveHint: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  iconOffset: {
    marginTop: 2,
  },
  listItemHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  badgeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  listItemDesc: {
    fontSize: 15,
    lineHeight: 24,
  },
  emojiBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  emojiIcon: {
    fontSize: 28,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  detoxCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  detoxText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    fontStyle: 'italic',
  },
});
