import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet,
    ScrollView, Animated, Share, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Markdown from 'react-native-markdown-display';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../theme';

const mdStyles = {
    body: { color: COLORS.textPrimary, fontSize: 14, lineHeight: 22, backgroundColor: 'transparent' },
    heading1: { color: COLORS.textPrimary, fontSize: 21, fontWeight: '800', marginTop: SPACING.lg, marginBottom: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: SPACING.sm },
    heading2: { color: COLORS.accentLight, fontSize: 16, fontWeight: '700', marginTop: SPACING.lg, marginBottom: SPACING.xs },
    heading3: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '600', marginTop: SPACING.md, marginBottom: SPACING.xs },
    paragraph: { marginBottom: SPACING.sm, color: COLORS.textSecondary },
    list_item: { color: COLORS.textSecondary, marginBottom: 3 },
    code_inline: { backgroundColor: COLORS.bgElevated, color: COLORS.teal, borderRadius: 4, paddingHorizontal: 4, fontSize: 13 },
    fence: { backgroundColor: COLORS.bgElevated, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm },
    table: { borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, marginBottom: SPACING.md },
    th: { backgroundColor: COLORS.bgElevated, padding: SPACING.sm, color: COLORS.textPrimary, fontWeight: '700', fontSize: 12 },
    td: { padding: SPACING.sm, color: COLORS.textSecondary, borderTopWidth: 1, borderTopColor: COLORS.borderSubtle, fontSize: 12 },
    hr: { backgroundColor: COLORS.border, height: 1, marginVertical: SPACING.lg },
    blockquote: { backgroundColor: COLORS.accentGlow, borderLeftWidth: 3, borderLeftColor: COLORS.accent, paddingLeft: SPACING.md, paddingVertical: SPACING.sm, marginBottom: SPACING.sm, borderRadius: 4 },
    strong: { fontWeight: '700', color: COLORS.textPrimary },
    em: { fontStyle: 'italic', color: COLORS.textSecondary },
};

export default function SpecSheetScreen({ route, navigation }) {
    const { idea, specMarkdown } = route.params;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]).start();
    }, []);

    const handleShare = async () => {
        try {
            await Share.share({ message: specMarkdown, title: 'Project Spec Sheet — Spec Architect' });
        } catch (e) {
            Alert.alert('Paylaşım Hatası', e.message);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Top Bar */}
            <View style={styles.topBar}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
                <View style={styles.specBadge}>
                    <Ionicons name="document-text" size={12} color={COLORS.accent} />
                    <Text style={styles.specBadgeText}>Spec Sheet</Text>
                </View>
                <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
                    <Ionicons name="share-outline" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
            </View>

            <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Success Banner */}
                    <View style={styles.successBanner}>
                        <View style={styles.successIcon}>
                            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.successTitle}>Spec başarıyla oluşturuldu!</Text>
                            <Text style={styles.successSub} numberOfLines={1}>{idea.substring(0, 60)}...</Text>
                        </View>
                    </View>

                    {/* Markdown Content */}
                    <View style={styles.markdownCard}>
                        <Markdown style={mdStyles}>{specMarkdown}</Markdown>
                    </View>

                    {/* Actions */}
                    <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
                        <Ionicons name="share-social-outline" size={18} color="#fff" />
                        <Text style={styles.shareBtnText}>Paylaş</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.newIdeaBtn} onPress={() => navigation.popToTop()}>
                        <Ionicons name="add-circle-outline" size={18} color={COLORS.accent} />
                        <Text style={styles.newIdeaBtnText}>Yeni Fikir →</Text>
                    </TouchableOpacity>
                </ScrollView>
            </Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.borderSubtle, justifyContent: 'space-between' },
    iconBtn: { width: 36, height: 36, borderRadius: RADIUS.full, backgroundColor: COLORS.bgCard, alignItems: 'center', justifyContent: 'center' },
    specBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: COLORS.accentGlow, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 5, borderWidth: 1, borderColor: COLORS.border },
    specBadgeText: { fontSize: 12, fontWeight: '600', color: COLORS.accentLight },
    scrollContent: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
    successBanner: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: 'rgba(0,200,150,0.08)', borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: 'rgba(0,200,150,0.2)', marginBottom: SPACING.lg },
    successIcon: { width: 36, height: 36, borderRadius: RADIUS.full, backgroundColor: 'rgba(0,200,150,0.12)', alignItems: 'center', justifyContent: 'center' },
    successTitle: { fontSize: 14, fontWeight: '700', color: COLORS.success },
    successSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
    markdownCard: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.borderSubtle, marginBottom: SPACING.lg },
    shareBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, backgroundColor: COLORS.accent, borderRadius: RADIUS.lg, paddingVertical: SPACING.md, marginBottom: SPACING.md, ...SHADOWS.accent },
    shareBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
    newIdeaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, paddingVertical: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
    newIdeaBtnText: { color: COLORS.accent, fontSize: 15, fontWeight: '600' },
});
