import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Audio } from 'expo-av';

const { width } = Dimensions.get('window');
const BAR_COUNT = 32;

export default function VoiceScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const bars = useRef(
    Array.from({ length: BAR_COUNT }, () => new Animated.Value(4))
  ).current;
  const animationRef = useRef(null);

  useEffect(() => {
    return () => {
      if (animationRef.current) clearInterval(animationRef.current);
      if (recording) recording.stopAndUnloadAsync();
    };
  }, []);

  const animateBars = (active) => {
    if (!active) {
      bars.forEach((bar) => Animated.spring(bar, { toValue: 4, useNativeDriver: false }).start());
      return;
    }
    animationRef.current = setInterval(() => {
      bars.forEach((bar) => {
        const height = active ? Math.random() * 80 + 8 : 4;
        Animated.spring(bar, {
          toValue: height,
          useNativeDriver: false,
          speed: 20,
          bounciness: 6,
        }).start();
      });
    }, 80);
  };

  const startRecording = async () => {
    try {
      if (permissionResponse?.status !== 'granted') {
        await requestPermission();
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(rec);
      setIsRecording(true);
      animateBars(true);
    } catch (err) {
      console.error('Kayıt başlatılamadı:', err);
    }
  };

  const stopRecording = async () => {
    if (animationRef.current) clearInterval(animationRef.current);
    setIsRecording(false);
    animateBars(false);
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      setRecording(null);
    } catch (err) {
      console.error('Kayıt durdurulamadı:', err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎙️ Ses Görselleştirici</Text>
      <Text style={styles.subtitle}>
        {isRecording ? 'Dinleniyor...' : 'Mikrofona dokunun'}
      </Text>

      {/* Bar Visualizer */}
      <View style={styles.visualizer}>
        {bars.map((bar, i) => (
          <Animated.View
            key={i}
            style={[
              styles.bar,
              {
                height: bar,
                backgroundColor: isRecording
                  ? `hsl(${200 + i * 3}, 80%, 60%)`
                  : '#334155',
                opacity: isRecording ? 1 : 0.3,
              },
            ]}
          />
        ))}
      </View>

      {/* Record Button */}
      <TouchableOpacity
        style={[styles.recordBtn, isRecording && styles.recordBtnActive]}
        onPress={isRecording ? stopRecording : startRecording}
        activeOpacity={0.8}
      >
        <View style={[styles.recordDot, isRecording && styles.recordDotActive]} />
      </TouchableOpacity>
      <Text style={styles.hint}>
        {isRecording ? 'Durdurmak için dokun' : 'Başlatmak için dokun'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    color: '#f8fafc',
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 15,
    marginBottom: 48,
  },
  visualizer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    gap: 3,
    marginBottom: 56,
    paddingHorizontal: 8,
  },
  bar: {
    width: (width - 48 - (BAR_COUNT - 1) * 3) / BAR_COUNT,
    borderRadius: 4,
    minHeight: 4,
  },
  recordBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1e293b',
    borderWidth: 3,
    borderColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  recordBtnActive: {
    borderColor: '#ef4444',
    backgroundColor: '#1c0a0a',
  },
  recordDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ef4444',
  },
  recordDotActive: {
    borderRadius: 6,
    width: 20,
    height: 20,
  },
  hint: {
    color: '#64748b',
    fontSize: 13,
  },
});
