import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';

export function useMicrophone() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync().catch(err => console.error('Cleanup error', err));
      }
    };
  }, [recording]);

  async function startRecording() {
    try {
      const permission = await Audio.getPermissionsAsync();
      if (permission.status !== 'granted') {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          alert('Mikrofon izni gerekli!');
          return;
        }
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const RECORDING_OPTIONS = {
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {},
      };

      const { recording: newRecording } = await Audio.Recording.createAsync(
        RECORDING_OPTIONS
      );
      
      setRecording(newRecording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
      alert('Kayıt başlatılamadı.');
    }
  }

  async function stopRecording() {
    if (!recording) return null;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setAudioUri(uri);
      setRecording(null);
      return uri;
    } catch (err) {
      console.error('Failed to stop recording', err);
      setIsRecording(false);
      setRecording(null);
      return null;
    }
  }

  return {
    isRecording,
    audioUri,
    startRecording,
    stopRecording,
  };
}
