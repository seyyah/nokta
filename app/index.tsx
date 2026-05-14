import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Canvas } from '@react-three/fiber';
import NoktaAvatar from '../components/NoktaAvatar';
import { COLORS, SPACING, ROUNDED } from '../constants/theme';
import { Mic, Send, History } from 'lucide-react-native';
import voiceService from '../services/voiceService';

export default function CaptureScreen() {
    const router = useRouter();
    const [idea, setIdea] = useState('');
    const [isListening, setIsListening] = useState(false);

    const startVoice = async () => {
        setIsListening(true);
        await voiceService.startListening((text) => {
            setIdea(text);
            setIsListening(false);
        });
    };

    const handleNext = () => {
        if (idea.trim()) {
            router.push({ pathname: '/enrich', params: { idea } });
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.mascotContainer}>
                <Canvas shadows camera={{ position: [0, 0, 4.5], fov: 40 }}>
                    <ambientLight intensity={0.7} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    <NoktaAvatar state={isListening ? 'talking' : 'idle'} vocalLevel={isListening ? 0.3 : 0} />
                </Canvas>
            </View>

            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <Text style={styles.title}>Nokta'yı Yakala</Text>
                <Text style={styles.subtitle}>Dağınık bir fikri (nokta) bütüne çevirelim.</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Aklındaki fikri buraya yaz veya sesle söyle..."
                    value={idea}
                    onChangeText={setIdea}
                    multiline
                />

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.actionBtn, isListening && styles.listening]}
                        onPress={startVoice}
                    >
                        <Mic color={isListening ? '#ffffff' : COLORS.primary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.primaryBtn, !idea.trim() && styles.disabled]}
                        onPress={handleNext}
                        disabled={!idea.trim()}
                    >
                        <Text style={styles.primaryBtnText}>Devam Et</Text>
                        <Send color="#ffffff" size={20} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.historyBtn}
                    onPress={() => router.push('/history')}
                >
                    <History color={COLORS.onSurface} size={20} />
                    <Text style={styles.historyText}>Geçmiş Fikirler</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    mascotContainer: { height: 350, backgroundColor: COLORS.surface },
    content: { padding: SPACING.lg, gap: SPACING.md },
    title: { fontSize: 24, fontWeight: '900', color: COLORS.onBackground },
    subtitle: { fontSize: 15, color: '#64748b', marginBottom: SPACING.md },
    input: {
        backgroundColor: COLORS.surfaceContainer,
        borderRadius: ROUNDED.lg,
        padding: SPACING.md,
        fontSize: 16,
        minHeight: 120,
        textAlignVertical: 'top',
    },
    actions: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.sm },
    actionBtn: {
        width: 50, height: 50, borderRadius: 25,
        borderWidth: 1, borderColor: COLORS.outline,
        alignItems: 'center', justifyContent: 'center',
    },
    listening: { backgroundColor: COLORS.error, borderColor: COLORS.error },
    primaryBtn: {
        flex: 1, height: 50, borderRadius: ROUNDED.lg,
        backgroundColor: COLORS.primary,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: SPACING.base,
    },
    disabled: { opacity: 0.5 },
    primaryBtnText: { color: '#ffffff', fontWeight: 'bold' },
    historyBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: SPACING.base, marginTop: SPACING.xl,
    },
    historyText: { color: COLORS.onSurface, fontWeight: '600' },
});
