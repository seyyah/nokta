import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { CheckCircle, XCircle, Zap, ShieldAlert } from 'lucide-react-native';

import IdeaCard, { Idea } from '../components/IdeaCard';
import RadarBackground from '../components/RadarBackground';
import SEEDS from '../data/seeds.json';

const { height } = Dimensions.get('window');

// Fisher-Yates shuffle algorithm
const shuffleArray = (array: any[]) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

interface FeedbackData {
  type: 'success' | 'error';
  message: string;
  reason: string;
}

export default function ExploreScreen() {
  const [xp, setXp] = useState(0);
  const [deckKey, setDeckKey] = useState(Date.now().toString());
  const [cards, setCards] = useState<Idea[]>([]);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);

  // Load and shuffle cards initially, or when the deck key resets
  useEffect(() => {
    setCards(shuffleArray(SEEDS));
  }, [deckKey]);

  const triggerFeedback = (type: 'success' | 'error', message: string, reason: string) => {
    setFeedback({ type, message, reason });
    setTimeout(() => {
      setFeedback(null);
    }, 2800);
  };

  const gainXp = () => setXp((prev) => prev + 20);
  const loseXp = () => setXp((prev) => Math.max(0, prev - 10)); // Never drops below 0

  const onSwipedRight = (cardIndex: number) => {
    const card = cards[cardIndex];
    if (card) {
      if (card.isActuallySlop) {
        // User said SOLID, but it was SLOP
        loseXp();
        triggerFeedback('error', 'YANLIŞ! BU BİR SLOP FİKRİYDİ.', card.reason || "Teknik derivasyon zayıf.");
      } else {
        // User said SOLID, and it is SOLID
        gainXp();
        triggerFeedback('success', 'DOĞRU TESPİT!', card.reason || "Sağlam bir teknik bariyeri var.");
      }
    }
  };

  const onSwipedLeft = (cardIndex: number) => {
    const card = cards[cardIndex];
    if (card) {
      if (card.isActuallySlop) {
        // User said SLOP, and it is SLOP
        gainXp();
        triggerFeedback('success', 'DOĞRU TESPİT!', card.reason || "İçi boş bir fikir.");
      } else {
        // User said SLOP, but it was SOLID
        loseXp();
        triggerFeedback('error', 'YANLIŞ! BU SAĞLAM BİR FİKİRDİ.', card.reason || "Potansiyeli harcadın.");
      }
    }
  };

  const onSwipedAllCards = () => {
    // Infinite loop trick: recreate the key to unmount and remount Swiper with a new shuffled deck
    setTimeout(() => {
      setDeckKey(Date.now().toString());
    }, 100);
  };

  return (
    <View style={styles.container}>
      <RadarBackground />
      
      {/* XP Bar Header */}
      <View style={styles.xpHeader}>
        <Zap color="#00E5FF" size={20} />
        <View style={styles.xpBarContainer}>
          <View style={[styles.xpBarFill, { width: `${Math.min((xp % 1000) / 10, 100)}%` }]} />
        </View>
        <Text style={styles.xpText}>{xp} XP</Text>
      </View>

      <View style={styles.swiperContainer}>
        {cards.length > 0 && (
          <Swiper
            key={deckKey}
            cards={cards}
            renderCard={(card: Idea) => card ? <IdeaCard idea={card} /> : <View/>}
            onSwipedRight={onSwipedRight}
            onSwipedLeft={onSwipedLeft}
            onSwipedAll={onSwipedAllCards}
            cardIndex={0}
            backgroundColor={'transparent'}
            stackSize={3}
            cardVerticalMargin={20}
            animateCardOpacity
            overlayLabels={{
              left: {
                title: 'SLOP (ÇÖP)',
                element: (
                  <View style={[styles.overlayLabelContainer, { borderColor: '#FF003C' }]}>
                    <XCircle color="#FF003C" size={48} />
                    <Text style={[styles.overlayLabelText, { color: '#FF003C' }]}>SLOP</Text>
                  </View>
                ),
                style: { wrapper: { alignItems: 'flex-end', elevation: 11, zIndex: 11 } }
              },
              right: {
                title: 'SOLID (ONAY)',
                element: (
                  <View style={[styles.overlayLabelContainer, { borderColor: '#00FF41' }]}>
                    <CheckCircle color="#00FF41" size={48} />
                    <Text style={[styles.overlayLabelText, { color: '#00FF41' }]}>SOLID</Text>
                  </View>
                ),
                style: { wrapper: { alignItems: 'flex-start', elevation: 11, zIndex: 11 } }
              }
            }}
          />
        )}
        
        {/* Swipe Helper Instructions */}
        <View style={styles.instructionsContainer} pointerEvents="none">
          <Text style={styles.instructionTextLeft}>👈 ÇÖPE AT (SLOP)</Text>
          <Text style={styles.instructionTextRight}>ONAYLA (SOLID) 👉</Text>
        </View>

        {/* Dynamic Feedback Toast */}
        {feedback && (
          <View pointerEvents="none" style={[styles.feedbackToast, { borderColor: feedback.type === 'success' ? '#00FF41' : '#FF003C' }]}>
            <View style={styles.feedbackHeader}>
              {feedback.type === 'success' ? <CheckCircle color="#00FF41" size={20} /> : <XCircle color="#FF003C" size={20} />}
              <Text style={[styles.feedbackTitle, { color: feedback.type === 'success' ? '#00FF41' : '#FF003C' }]}>
                {feedback.message}
              </Text>
            </View>
            <View style={styles.feedbackReasonBox}>
              <Text style={styles.feedbackReason}>{feedback.reason}</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  xpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(10, 10, 10, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 2,
  },
  xpBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#222',
    borderRadius: 4,
    marginHorizontal: 15,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: '#00E5FF',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  xpText: {
    color: '#00E5FF',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  swiperContainer: {
    flex: 1,
    zIndex: 1,
  },
  overlayLabelContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderWidth: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.8)',
    transform: [{ rotate: '-15deg' }],
    marginTop: 40,
    marginLeft: 20,
  },
  overlayLabelText: {
    fontSize: 28,
    fontWeight: '900',
    fontFamily: 'monospace',
    marginTop: 10,
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 25,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    zIndex: -1,
  },
  instructionTextLeft: {
    color: '#FF003C',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    opacity: 0.6,
  },
  instructionTextRight: {
    color: '#00FF41',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    opacity: 0.6,
  },
  feedbackToast: {
    position: 'absolute',
    top: '30%',
    alignSelf: 'center',
    width: '85%',
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderWidth: 2,
    borderRadius: 16,
    padding: 20,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 20,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'center',
  },
  feedbackTitle: {
    fontFamily: 'monospace',
    fontSize: 18,
    fontWeight: '900',
    marginLeft: 10,
  },
  feedbackReasonBox: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 10,
  },
  feedbackReason: {
    color: '#E0E0E0',
    fontFamily: 'monospace',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  }
});
