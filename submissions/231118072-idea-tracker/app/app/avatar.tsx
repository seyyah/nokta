import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import { VoiceVisualizer } from '../components/VoiceVisualizer';

export default function AvatarScreen() {
  const router = useRouter();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [amplitude, setAmplitude] = useState<number>(0);
  const [isListening, setIsListening] = useState(false);
  const [AvatarComponent, setAvatarComponent] = useState<any>(null);

  useEffect(() => {
    // Dynamic import to prevent Node SSR module load crash
    if (Platform.OS !== 'web' || typeof window !== 'undefined') {
      try {
        const { AvatarScene } = require('../components/AvatarScene');
        setAvatarComponent(() => AvatarScene);
      } catch (err: any) {
        console.error('Failed to load AvatarScene dynamically:', err, err.stack);
      }
    }
  }, []);

  const webAudioStreamRef = useRef<MediaStream | null>(null);
  const webAudioIntervalRef = useRef<any>(null);
  const webAudioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      // Clean up recording on unmount
      if (recording) {
        recording.stopAndUnloadAsync().catch(console.error);
      }
      stopWebAudio();
    };
  }, [recording]);

  function stopWebAudio() {
    if (webAudioIntervalRef.current) {
      clearInterval(webAudioIntervalRef.current);
      webAudioIntervalRef.current = null;
    }
    if (webAudioStreamRef.current) {
      webAudioStreamRef.current.getTracks().forEach(track => track.stop());
      webAudioStreamRef.current = null;
    }
    if (webAudioContextRef.current) {
      webAudioContextRef.current.close().catch(console.error);
      webAudioContextRef.current = null;
    }
    setAmplitude(0);
  }

  async function toggleListening() {
    if (isListening) {
      setIsListening(false);
      if (Platform.OS === 'web') {
        stopWebAudio();
      } else {
        setAmplitude(0);
        if (recording) {
          try {
            await recording.stopAndUnloadAsync();
          } catch (e) {
            console.warn('[AvatarScreen] stop recording error:', e);
          }
          setRecording(null);
        }
      }
    } else {
      try {
        if (Platform.OS === 'web') {
          // Web Audio API browser fallback for visualizer and lipsync
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          webAudioStreamRef.current = stream;

          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          if (!AudioCtx) {
            alert('Web Audio API not supported in this browser.');
            return;
          }

          const audioContext = new AudioCtx();
          webAudioContextRef.current = audioContext;

          const analyser = audioContext.createAnalyser();
          const source = audioContext.createMediaStreamSource(stream);
          source.connect(analyser);
          analyser.fftSize = 256;

          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          webAudioIntervalRef.current = setInterval(() => {
            analyser.getByteTimeDomainData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
              const val = (dataArray[i] - 128) / 128;
              sum += val * val;
            }
            const rms = Math.sqrt(sum / bufferLength);
            const norm = Math.min(1.0, rms * 4.5);
            setAmplitude(norm);
          }, 60);

          setIsListening(true);
        } else {
          const perm = await Audio.requestPermissionsAsync();
          if (!perm.granted) {
            alert('Mikrofon izni gerekli.');
            return;
          }

          await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
          });

          const { recording: newRecording } = await Audio.Recording.createAsync(
            {
              android: {
                extension: '.m4a',
                outputFormat: Audio.AndroidOutputFormat.MPEG_4,
                audioEncoder: Audio.AndroidAudioEncoder.AAC,
                sampleRate: 44100,
                numberOfChannels: 1,
                bitRate: 128000,
              },
              ios: {
                extension: '.m4a',
                outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
                audioQuality: Audio.IOSAudioQuality.MEDIUM,
                sampleRate: 44100,
                numberOfChannels: 1,
                bitRate: 128000,
                linearPCMBitDepth: 16,
                linearPCMIsBigEndian: false,
                linearPCMIsFloat: false,
              },
              web: {},
            },
            (status) => {
              if (status.metering !== undefined) {
                const db = status.metering;
                const minDb = -60;
                const norm = db < minDb ? 0 : (db - minDb) / (-minDb);
                setAmplitude(norm);
              }
            },
            60
          );

          setRecording(newRecording);
          setIsListening(true);
        }
      } catch (err) {
        console.error('[AvatarScreen] start recording failed:', err);
        alert('Mikrofon başlatılamadı.');
      }
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>← Geri</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Sesli Avatar Sahnesi</Text>
          <Text style={styles.subtitle}>Gerçek Zamanlı Lip-Sync Test Alanı</Text>
        </View>

        {/* 3D Canvas */}
        {AvatarComponent ? (
          <AvatarComponent amplitude={amplitude} />
        ) : (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color="#6C63FF" />
            <Text style={styles.loadingText}>Avatar Yükleniyor...</Text>
          </View>
        )}

        {/* Voice Visualizer */}
        <View style={styles.visualizerCard}>
          <Text style={styles.cardLabel}>Mikrofon Dalga Formu (RMS)</Text>
          <VoiceVisualizer amplitude={amplitude} color="#6C63FF" />
          <Text style={styles.amplitudeText}>
            Düzey: {Math.round(amplitude * 100)}%
          </Text>
        </View>

        {/* Control Button */}
        <TouchableOpacity
          style={[styles.listenBtn, isListening && styles.listeningActive]}
          onPress={toggleListening}
          activeOpacity={0.8}
        >
          <Text style={styles.listenText}>
            {isListening ? '🛑 Dinlemeyi Durdur' : '🎙️ Sesimi Dinle & Konuş'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.hintText}>
          Mikrofonu etkinleştirip konuşun; avatar dudakları ve ses dalgaları sesinizin genliğine göre gerçek zamanlı tepki verecektir.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#1A1A2E',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A2A4A',
    marginBottom: 12,
  },
  backText: {
    color: '#8888AA',
    fontSize: 13,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#8888AA',
    marginTop: 4,
  },
  visualizerCard: {
    backgroundColor: '#16162A',
    borderWidth: 1.5,
    borderColor: '#2A2A4A',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  cardLabel: {
    color: '#8888AA',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amplitudeText: {
    color: '#555570',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  listenBtn: {
    backgroundColor: '#6C63FF',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  listeningActive: {
    backgroundColor: '#e53e3e',
    shadowColor: '#e53e3e',
  },
  listenText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  hintText: {
    color: '#444460',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  centerLoading: {
    height: 350,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F0F1A',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#6C63FF20',
    gap: 12,
  },
  loadingText: {
    color: '#8888AA',
    fontSize: 14,
    fontWeight: '500',
  },
});
