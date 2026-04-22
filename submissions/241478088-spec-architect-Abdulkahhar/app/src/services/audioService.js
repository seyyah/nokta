import { Audio } from 'expo-av';

export async function requestMicrophonePermission() {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
        throw new Error('Ses girişi için mikrofon izni gereklidir. Lütfen Ayarlar\'dan etkinleştirin.');
    }
    return true;
}

export async function startRecording() {
    await requestMicrophonePermission();
    await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
    });
    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await recording.startAsync();
    return recording;
}

export async function stopRecording(recording) {
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    return recording.getURI();
}

// Üretimde Whisper API'ye bağlanılabilir. Şimdilik placeholder.
export async function transcribeAudio(uri) {
    if (!uri) throw new Error('Ses dosyası bulunamadı.');
    return '[Ses kaydı alındı — fikrini aşağıya yazarak detaylandırabilirsin]';
}
