import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import CONFIG from '../config';

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

// Transcribe audio using Gemini API
export async function transcribeAudio(uri) {
    if (!uri) throw new Error('Ses dosyası bulunamadı.');

    let key = CONFIG.GEMINI_API_KEY;
    if (CONFIG.AI_PROVIDER === 'openai') key = CONFIG.OPENAI_API_KEY;
    if (CONFIG.AI_PROVIDER === 'groq') key = CONFIG.GROQ_API_KEY;
    const isDemoMode = !key || key.startsWith('your_') || key.length < 10;

    if (isDemoMode) {
        return '[Demo Modu: Ses kaydedildi ancak API anahtarı olmadığı için yazıya çevrilemedi. Fikrini metin olarak girebilirsin.]';
    }

    try {
        if (CONFIG.AI_PROVIDER === 'gemini') {
            const base64Audio = await FileSystem.readAsStringAsync(uri, {
                encoding: 'base64',
            });

            const url = `${CONFIG.GEMINI_BASE_URL}/models/${CONFIG.GEMINI_MODEL}:generateContent?key=${CONFIG.GEMINI_API_KEY}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        role: 'user',
                        parts: [
                            { text: "Sen bir dikte asistanısın. Lütfen bu ses kaydını deşifre et. Kayıttaki dili otomatik algıla. Sadece söylenenleri metne dök, yorum veya açıklama ekleme. Eğer ses anlaşılamıyorsa boş dönebilirsin." },
                            { inlineData: { mimeType: "audio/m4a", data: base64Audio } }
                        ]
                    }],
                    generationConfig: { temperature: 0.1 },
                }),
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err?.error?.message || `Gemini API Hatası: ${response.status}`);
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            return text.trim() || '[Ses anlaşılamadı veya boş kayıt]';
        } else {
            // OpenAI or Groq Whisper API
            const isGroq = CONFIG.AI_PROVIDER === 'groq';
            const baseUrl = isGroq ? CONFIG.GROQ_BASE_URL : CONFIG.OPENAI_BASE_URL;
            const apiKey = isGroq ? CONFIG.GROQ_API_KEY : CONFIG.OPENAI_API_KEY;
            const modelName = isGroq ? 'whisper-large-v3' : 'whisper-1';

            const formData = new FormData();
            formData.append('file', {
                uri: uri,
                type: 'audio/m4a',
                name: 'recording.m4a',
            });
            formData.append('model', modelName);

            const response = await fetch(`${baseUrl}/audio/transcriptions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                },
                body: formData,
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err?.error?.message || `${isGroq ? 'Groq' : 'OpenAI'} API Hatası: ${response.status}`);
            }

            const data = await response.json();
            return data.text || '[Ses anlaşılamadı]';
        }

    } catch (error) {
        console.error('Audio transcription error:', error);
        throw new Error('Ses metne çevrilemedi: ' + error.message);
    }
}
