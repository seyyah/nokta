import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Svg, Path } from 'react-native-svg';

const MOCK_QUESTIONS = [
  {
    title: "1/3: Hedef Kitle (Kullan─▒c─▒)",
    desc: "Bunu do─şrudan son kullan─▒c─▒ya (B2C) mi a├ğ─▒yorsun, yoksa sadece kurumsal firmalara (B2B) mi pazarlayacaks─▒n?",
    opt1: { label: "Kurumsal (B2B)", emoji: "­şÅó" },
    opt2: { label: "Bireysel (B2C)", emoji: "­şğæÔÇı­şñØÔÇı­şğæ" }
  },
  {
    title: "2/3: Ana Problem",
    desc: "Sekt├Ârdeki en b├╝y├╝k t─▒kan─▒kl─▒k bilgi da─ş─▒n─▒kl─▒─ş─▒ ve zaman kayb─▒ m─▒, yoksa g├╝vensizlik mi?",
    opt1: { label: "Zaman/H─▒z", emoji: "ÔÅ▒´©Å" },
    opt2: { label: "G├╝venlik", emoji: "­şñØ" }
  },
  {
    title: "3/3: ─░lk Faz (MVP) Kapsam─▒",
    desc: "─░lk etapta sistemi Mobil Uygulama olarak m─▒, yoksa Web Panel otomasyonu olarak m─▒ ├ğ─▒kar─▒yoruz?",
    opt1: { label: "Mobil App", emoji: "­şô▒" },
    opt2: { label: "Web Panel", emoji: "­şÆ╗" }
  }
];

export default function ClarifyScreen({ route, navigation }) {
  const { ideaDump } = route.params;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);

  const handleSelection = (answer) => {
    const newAnswers = [...answers, answer];
    if (index < MOCK_QUESTIONS.length - 1) {
      setAnswers(newAnswers);
      setIndex(index + 1);
    } else {
      navigation.replace('IdeaResult', { ideaDump, clarifyAnswer: newAnswers.join(' | ') });
    }
  };

  const currentQ = MOCK_QUESTIONS[index];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(15,23,42,0.95)', 'rgba(0,0,0,0.98)']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={styles.content}>
        <View style={styles.aiBadge}>
          <Text style={styles.aiBadgeText}>AI Soru Soruyor</Text>
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 8 }}>
            <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" fill="#d8b4fe" />
          </Svg>
        </View>

        <Text style={styles.questionText}>{currentQ.title}</Text>
        <Text style={styles.subQuestionText}>
          {currentQ.desc}
        </Text>

        <View style={styles.optionsContainer}>
          <TouchableOpacity onPress={() => handleSelection(currentQ.opt1.label)} activeOpacity={0.8} style={styles.optionWrapper}>
            <BlurView intensity={30} tint="light" style={styles.optionBox}>
              <Text style={styles.optionEmoji}>{currentQ.opt1.emoji}</Text>
              <Text style={styles.optionText}>{currentQ.opt1.label}</Text>
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleSelection(currentQ.opt2.label)} activeOpacity={0.8} style={styles.optionWrapper}>
            <BlurView intensity={30} tint="light" style={styles.optionBox}>
              <Text style={styles.optionEmoji}>{currentQ.opt2.emoji}</Text>
              <Text style={styles.optionText}>{currentQ.opt2.label}</Text>
            </BlurView>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 32,
    alignItems: 'center',
  },
  aiBadge: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.4)',
    marginBottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiBadgeText: {
    color: '#d8b4fe',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  questionText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  subQuestionText: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 60,
  },
  highlight: {
    color: '#06b6d4',
    fontWeight: '600',
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 20,
    width: '100%',
    justifyContent: 'center',
  },
  optionWrapper: {
    flex: 1,
    maxWidth: 160,
    borderRadius: 24,
    overflow: 'hidden',
  },
  optionBox: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  optionEmoji: {
    fontSize: 40,
    marginBottom: 16,
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  }
});
