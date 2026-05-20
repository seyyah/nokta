import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Dimensions, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { useRouter } from 'expo-router';
import { Bot, Send, CheckCircle, XCircle } from 'lucide-react-native';

import IdeaCard, { Idea } from '../components/IdeaCard';

const { width, height } = Dimensions.get('window');

const dummyIdeas: Idea[] = [
  { id: '101', text: 'An AI-powered app that generates generic bedtime stories using a standard LLM prompt.' },
  { id: '102', text: 'A decentralized marketplace for exchanging used coffee beans on the blockchain.' },
  { id: '103', text: 'A high-frequency trading bot that uses on-chain sentiment analysis to execute microsecond arbitrage across L2s.' },
  { id: '104', text: 'Uber for dog walkers but exclusively for poodles.' },
];

export default function IndexScreen() {
  const router = useRouter();
  const [customIdea, setCustomIdea] = useState('');

  const onSwipedRight = (cardIndex: number) => {
    console.log('Action: SOLID, ID:', dummyIdeas[cardIndex].id);
  };

  const onSwipedLeft = (cardIndex: number) => {
    console.log('Action: SLOP, ID:', dummyIdeas[cardIndex].id);
  };

  const handleAnalyze = () => {
    if (customIdea.trim().length === 0) return;
    router.push({
      pathname: '/result',
      params: { idea: customIdea }
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={false} // Prevent scrolling to keep Swiper interaction clean
      >
        <View style={styles.swiperContainer}>
          <Swiper
            cards={dummyIdeas}
            renderCard={(card: Idea) => <IdeaCard idea={card} />}
            onSwipedRight={onSwipedRight}
            onSwipedLeft={onSwipedLeft}
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
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.inputSection}
        >
          <View style={styles.inputHeader}>
            <Bot color="#00E5FF" size={20} />
            <Text style={styles.inputTitle}>HEMEN KENDİ FİKRİNİ SINA</Text>
          </View>
          
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Yeni girişim fikrini buraya gir..."
              placeholderTextColor="#555"
              multiline
              value={customIdea}
              onChangeText={setCustomIdea}
            />
            <TouchableOpacity 
              style={[styles.submitButton, customIdea.length === 0 && styles.submitButtonDisabled]} 
              onPress={handleAnalyze}
              disabled={customIdea.length === 0}
              activeOpacity={0.8}
            >
              <Send color={customIdea.length === 0 ? "#444" : "#00E5FF"} size={20} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    flexGrow: 1,
  },
  swiperContainer: {
    height: height * 0.6,
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
  inputSection: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#0a0a0a',
    padding: 20,
    justifyContent: 'flex-start',
    zIndex: 0,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputTitle: {
    color: '#00E5FF',
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 12,
    paddingRight: 10,
  },
  textInput: {
    flex: 1,
    color: '#fff',
    minHeight: 80,
    maxHeight: 120,
    padding: 16,
    fontSize: 16,
    fontFamily: 'monospace',
  },
  submitButton: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#111',
  },
});
