import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  Animated, TextInput, Dimensions, Easing, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';

const isWeb = typeof navigator !== 'undefined' && navigator.product !== 'ReactNative';
const Speech = isWeb
  ? {
      speak: (t: string, o?: any) => {
        if (!('speechSynthesis' in window)) { o?.onDone?.(); return; }
        const u = new SpeechSynthesisUtterance(t);
        if (o?.language) u.lang = o.language;
        if (o?.pitch) u.pitch = o.pitch;
        if (o?.rate) u.rate = o.rate;
        u.onend = () => o?.onDone?.();
        u.onerror = () => o?.onError?.();
        window.speechSynthesis.speak(u);
      },
      stop: () => (window as any).speechSynthesis?.cancel(),
    }
  : require('expo-speech');

import { AuditWidget, AuditReport } from '../audit/AuditWidget';

const { width: W } = Dimensions.get('window');
const FACE_W = Math.min(W * 0.55, 200);

const PERSONAS = {
  junior: { label: 'Junior-Sen', pitch: 0.9, rate: 0.8, color: '#2a6df5', text: 'Merhaba! Ben Junior-Sen. Problemi adım adım çözelim.' },
  senior: { label: 'Senior-Sen', pitch: 1.3, rate: 1.1, color: '#7b1fa2', text: 'Selam. Ben Senior-Sen. Direkt konuya girelim.' },
};

type PersonaKey = 'junior' | 'senior';

interface Props {
  onBack: () => void;
  onExpertCall: () => void;
  rmsLevel?: number;
}

export const AvatarScreen: React.FC<Props> = ({ onBack, onExpertCall, rmsLevel = 0 }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [inputText, setInputText] = useState('Merhaba! Ben senin avatarınım.');
  const [activePersona, setActivePersona] = useState<PersonaKey | 'custom' | null>(null);

  const mouthOpen = useRef(new Animated.Value(2)).current;
  const headBob = useRef(new Animated.Value(0)).current;
  const eyeBlink = useRef(new Animated.Value(1)).current;
  const loopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const blinkRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  // Eye blink loop
  const startBlink = useCallback(() => {
    const doBlink = () => {
      Animated.sequence([
        Animated.timing(eyeBlink, { toValue: 0, duration: 80, useNativeDriver: false }),
        Animated.timing(eyeBlink, { toValue: 1, duration: 80, useNativeDriver: false }),
      ]).start();
      blinkRef.current = setTimeout(doBlink, 2500 + Math.random() * 2000);
    };
    blinkRef.current = setTimeout(doBlink, 1500);
  }, [eyeBlink]);

  useEffect(() => {
    startBlink();
    return () => { if (blinkRef.current) clearTimeout(blinkRef.current); };
  }, [startBlink]);

  // React to mic input when not speaking
  useEffect(() => {
    if (!isSpeaking && rmsLevel > 0.05) {
      Animated.timing(mouthOpen, { toValue: 2 + rmsLevel * 14, duration: 80, useNativeDriver: false }).start();
    } else if (!isSpeaking) {
      Animated.timing(mouthOpen, { toValue: 2, duration: 200, useNativeDriver: false }).start();
    }
  }, [rmsLevel, isSpeaking, mouthOpen]);

  const startMouth = useCallback(() => {
    headLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(headBob, { toValue: -4, duration: 200, useNativeDriver: false, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(headBob, { toValue: 4, duration: 200, useNativeDriver: false, easing: Easing.inOut(Easing.sin) }),
      ])
    );
    headLoopRef.current.start();
    let open = false;
    loopRef.current = setInterval(() => {
      Animated.timing(mouthOpen, { toValue: open ? 2 : 14, duration: 160, useNativeDriver: false }).start();
      open = !open;
    }, 160);
  }, [mouthOpen, headBob]);

  const stopMouth = useCallback(() => {
    if (loopRef.current) clearInterval(loopRef.current);
    if (headLoopRef.current) headLoopRef.current.stop();
    Animated.timing(mouthOpen, { toValue: 2, duration: 200, useNativeDriver: false }).start();
    Animated.timing(headBob, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  }, [mouthOpen, headBob]);

  const doSpeak = useCallback((text: string, pitch: number, rate: number) => {
    Speech.stop();
    setIsSpeaking(true);
    startMouth();
    Speech.speak(text, {
      language: 'tr-TR', pitch, rate,
      onDone: () => { setIsSpeaking(false); stopMouth(); },
      onError: () => { setIsSpeaking(false); stopMouth(); },
    });
  }, [startMouth, stopMouth]);

  const handlePersona = (p: PersonaKey) => {
    setActivePersona(p);
    doSpeak(PERSONAS[p].text, PERSONAS[p].pitch, PERSONAS[p].rate);
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      stopMouth();
      return;
    }
    setActivePersona('custom');
    doSpeak(inputText, 1.1, 0.85);
  };

  useEffect(() => () => {
    Speech.stop();
    if (loopRef.current) clearInterval(loopRef.current);
    if (blinkRef.current) clearTimeout(blinkRef.current);
  }, []);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={onBack}><Text style={s.back}>← Geri</Text></TouchableOpacity>
        <Text style={s.title}>🪞 Avatar</Text>
        <TouchableOpacity style={s.expertBtn} onPress={onExpertCall}>
          <Text style={s.expertTxt}>📞 Uzman</Text>
        </TouchableOpacity>
      </View>

      {/* Persona Buttons */}
      <View style={s.personaRow}>
        {(Object.keys(PERSONAS) as PersonaKey[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[s.personaBtn, activePersona === p && { backgroundColor: PERSONAS[p].color, borderColor: PERSONAS[p].color }]}
            onPress={() => handlePersona(p)}
          >
            <Text style={s.personaBtnTxt}>{PERSONAS[p].label}</Text>
            <Text style={s.personaBtnSub}>{p === 'junior' ? 'Yavaş · destekleyici' : 'Hızlı · doğrudan'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 2D Avatar Face */}
      <View style={s.faceContainer}>
        <Animated.View style={[s.face, { transform: [{ translateY: headBob }] }]}>
          <View style={s.eyesRow}>
            <Animated.View style={[s.eye, { transform: [{ scaleY: eyeBlink }] }]}>
              <View style={s.pupil} />
            </Animated.View>
            <Animated.View style={[s.eye, { transform: [{ scaleY: eyeBlink }] }]}>
              <View style={s.pupil} />
            </Animated.View>
          </View>
          <View style={s.nose} />
          <Animated.View style={[s.mouth, { height: mouthOpen }]} />
        </Animated.View>
        {isSpeaking && (
          <View style={s.speakingBadge}>
            <Text style={s.speakingTxt}>🗣️ Konuşuyor...</Text>
          </View>
        )}
      </View>

      {/* Keyboard-aware scroll area - butona her zaman ulaşılabilir */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.kvContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.inputArea}>
          <TextInput
            style={s.input}
            value={inputText}
            onChangeText={setInputText}
            multiline
            placeholder="Avatar ne söylesin?"
            placeholderTextColor="#444"
            blurOnSubmit={false}
          />
          <TouchableOpacity style={[s.speakBtn, isSpeaking && s.speakBtnActive]} onPress={handleSpeak}>
            <Text style={s.speakBtnTxt}>{isSpeaking ? '⏹ Durdur' : '🗣️ Konuştur'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <AuditWidget screenName="Avatar" onReport={(r: AuditReport) => console.log('audit', r.id)} />
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0a0a14' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 8 },
  back: { color: '#7b8cde', fontSize: 15, fontWeight: '600' },
  title: { flex: 1, fontSize: 18, fontWeight: '800', color: '#fff' },
  expertBtn: { backgroundColor: '#b71c1c', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  expertTxt: { color: '#fff', fontSize: 13, fontWeight: '700' },
  personaRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 8 },
  personaBtn: {
    flex: 1, borderRadius: 10, padding: 10,
    backgroundColor: '#1a1a2e', borderWidth: 1, borderColor: '#333',
  },
  personaBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 13 },
  personaBtnSub: { color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 2 },
  faceContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  face: {
    width: FACE_W, height: FACE_W * 1.2,
    backgroundColor: '#f4c2a1', borderRadius: FACE_W * 0.5,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#7b8cde', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 20, elevation: 12,
  },
  eyesRow: { flexDirection: 'row', gap: 36, marginBottom: 16, marginTop: -20 },
  eye: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  pupil: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#1a1a2e' },
  nose: { width: 8, height: 10, borderRadius: 4, backgroundColor: '#c9956b', marginBottom: 12 },
  mouth: { width: 60, height: 2, borderRadius: 8, backgroundColor: '#8b0000', marginTop: 4 },
  speakingBadge: { marginTop: 16, backgroundColor: '#1a237e', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  speakingTxt: { color: '#fff', fontSize: 13 },
  kvContainer: { maxHeight: 200 },
  inputArea: { padding: 16, gap: 10, paddingBottom: 20 },
  input: {
    backgroundColor: '#1a1a2e', borderRadius: 10, padding: 12,
    color: '#fff', fontSize: 14, borderWidth: 1, borderColor: '#333',
    minHeight: 60, textAlignVertical: 'top',
  },
  speakBtn: { backgroundColor: '#1a237e', borderRadius: 10, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#3949ab' },
  speakBtnActive: { backgroundColor: '#7b1fa2', borderColor: '#ce93d8' },
  speakBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
