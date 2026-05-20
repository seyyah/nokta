import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Spec } from '../services/storage';

export default function SpecScreen() {
  const { specData } = useLocalSearchParams<{ specData: string }>();
  const router = useRouter();

  if (!specData) {
    return (
      <SafeAreaView style={styles.safeError}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EA4335" />
          <Text style={styles.errorText}>Hata: Spesifikasyon verisi yüklenemedi.</Text>
          <TouchableOpacity style={styles.errorBtn} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.errorBtnText}>Ana Sayfaya Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const spec: Spec = JSON.parse(specData);

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleShare = async () => {
    try {
      const shareText = `🚀 ${spec.title}\n\nProblem:\n${spec.problem}\n\nHedef Kullanıcı:\n${spec.user}\n\nÇözüm:\n${spec.solution}\n\nMVP Kapsamı:\n${spec.scope}\n\nKısıtlar:\n${spec.constraints}`;
      await Share.share({
        message: shareText,
        title: spec.title,
      });
    } catch (error) {
      console.error('Paylaşım hatası:', error);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={handleClose} style={styles.closeBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#202124" />
          <Text style={styles.closeBtnText}>Geri</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Spec Görünümü</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn} activeOpacity={0.7}>
          <Ionicons name="share-social-outline" size={22} color="#1A73E8" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleCard}>
          <Text style={styles.specTitle}>{spec.title}</Text>
          <Text style={styles.specDate}>{formatDate(spec.createdAt)} tarihinde üretildi</Text>
          <View style={styles.divider} />
          <Text style={styles.rawIdeaLabel}>Ham Fikir:</Text>
          <Text style={styles.rawIdeaText}>{spec.rawIdea}</Text>
        </View>

        {/* 1. Problem Card */}
        <View style={[styles.specCard, styles.borderProblem]}>
          <View style={styles.cardHeader}>
            <Ionicons name="alert-circle" size={22} color="#EA4335" />
            <Text style={[styles.cardTitle, { color: '#EA4335' }]}>Problem</Text>
          </View>
          <Text style={styles.cardText}>{spec.problem}</Text>
        </View>

        {/* 2. User Card */}
        <View style={[styles.specCard, styles.borderUser]}>
          <View style={styles.cardHeader}>
            <Ionicons name="people" size={22} color="#1A73E8" />
            <Text style={[styles.cardTitle, { color: '#1A73E8' }]}>Hedef Kullanıcı</Text>
          </View>
          <Text style={styles.cardText}>{spec.user}</Text>
        </View>

        {/* 3. Solution Card */}
        <View style={[styles.specCard, styles.borderSolution]}>
          <View style={styles.cardHeader}>
            <Ionicons name="checkmark-circle" size={22} color="#34A853" />
            <Text style={[styles.cardTitle, { color: '#34A853' }]}>Çözüm</Text>
          </View>
          <Text style={styles.cardText}>{spec.solution}</Text>
        </View>

        {/* 4. Scope Card */}
        <View style={[styles.specCard, styles.borderScope]}>
          <View style={styles.cardHeader}>
            <Ionicons name="grid" size={22} color="#FBBC05" />
            <Text style={[styles.cardTitle, { color: '#FBBC05' }]}>MVP Kapsamı</Text>
          </View>
          <Text style={styles.cardText}>{spec.scope}</Text>
        </View>

        {/* 5. Constraints Card */}
        <View style={[styles.specCard, styles.borderConstraints]}>
          <View style={styles.cardHeader}>
            <Ionicons name="ban" size={22} color="#70757A" />
            <Text style={[styles.cardTitle, { color: '#70757A' }]}>Kısıtlamalar</Text>
          </View>
          <Text style={styles.cardText}>{spec.constraints}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  safeError: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 32,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#202124',
    marginVertical: 16,
    textAlign: 'center',
  },
  errorBtn: {
    backgroundColor: '#1A73E8',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  errorBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  closeBtnText: {
    fontSize: 16,
    color: '#202124',
    marginLeft: 6,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#202124',
    maxWidth: 150,
  },
  shareBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F1F3F4',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  titleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
    marginBottom: 20,
  },
  specTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#202124',
    marginBottom: 6,
  },
  specDate: {
    fontSize: 13,
    color: '#9AA0A6',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  rawIdeaLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#70757A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  rawIdeaText: {
    fontSize: 14,
    color: '#3C4043',
    lineHeight: 20,
    backgroundColor: '#FAFAFA',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F3F4',
  },
  specCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  borderProblem: {
    borderLeftWidth: 5,
    borderLeftColor: '#EA4335',
  },
  borderUser: {
    borderLeftWidth: 5,
    borderLeftColor: '#1A73E8',
  },
  borderSolution: {
    borderLeftWidth: 5,
    borderLeftColor: '#34A853',
  },
  borderScope: {
    borderLeftWidth: 5,
    borderLeftColor: '#FBBC05',
  },
  borderConstraints: {
    borderLeftWidth: 5,
    borderLeftColor: '#70757A',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardText: {
    fontSize: 14,
    color: '#3C4043',
    lineHeight: 22,
  },
});
