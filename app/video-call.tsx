import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, ROUNDED, SPACING } from '../constants/theme';
import { PhoneOff, Mic, Video, VideoOff, MicOff } from 'lucide-react-native';

export default function VideoCallScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [micOn, setMicOn] = useState(true);
    const [videoOn, setVideoOn] = useState(true);

    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 2000);
        return () => clearTimeout(t);
    }, []);

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.statusText}>Uzmana Bağlanılıyor...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.videoSurface}>
                <View style={styles.remoteVideo}>
                    <Text style={styles.participantName}>Uzman Dr. Arda (Teknik Danışman)</Text>
                    <View style={styles.expertAvatar}><Text style={{ color: '#fff', fontSize: 40 }}>A</Text></View>
                </View>
                <View style={styles.localVideo}>
                    <Text style={styles.localText}>Siz</Text>
                </View>
            </View>

            <View style={styles.controls}>
                <TouchableOpacity style={[styles.controlBtn, !micOn && styles.off]} onPress={() => setMicOn(!micOn)}>
                    {micOn ? <Mic color="#fff" /> : <MicOff color="#fff" />}
                </TouchableOpacity>
                <TouchableOpacity style={[styles.controlBtn, !videoOn && styles.off]} onPress={() => setVideoOn(!videoOn)}>
                    {videoOn ? <Video color="#fff" /> : <VideoOff color="#fff" />}
                </TouchableOpacity>
                <TouchableOpacity style={[styles.controlBtn, styles.hangup]} onPress={() => router.replace('/')}>
                    <PhoneOff color="#fff" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#07111f' },
    statusText: { color: '#ffffff', marginTop: SPACING.md, fontWeight: 'bold' },
    videoSurface: { flex: 1, position: 'relative' },
    remoteVideo: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#111827' },
    participantName: { color: '#ffffff', position: 'absolute', top: 50, fontSize: 16, fontWeight: 'bold' },
    expertAvatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
    localVideo: {
        position: 'absolute', right: 20, bottom: 120,
        width: 100, height: 150, borderRadius: ROUNDED.lg,
        backgroundColor: '#374151', borderWidth: 2, borderColor: '#4b5563',
        justifyContent: 'flex-end', padding: 8
    },
    localText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    controls: {
        height: 100, flexDirection: 'row', justifyContent: 'center',
        alignItems: 'center', gap: 20, backgroundColor: 'rgba(0,0,0,0.5)'
    },
    controlBtn: { width: 55, height: 55, borderRadius: 27.5, backgroundColor: '#374151', alignItems: 'center', justifyContent: 'center' },
    off: { backgroundColor: COLORS.error },
    hangup: { backgroundColor: COLORS.error, width: 65, height: 65, borderRadius: 32.5 },
});
