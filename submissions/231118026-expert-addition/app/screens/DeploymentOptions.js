import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: null,
    accent: '#6B6B6B',
    icon: 'eye-outline',
    tagline: 'Başlamak için ideal',
    features: [
      'Uygulama önizlemesi (link)',
      'Sınırsız tasarım',
      'Tüm kalkülatörler',
      'Şablon paylaşımı',
    ],
    cta: 'Mevcut Plan',
    ctaDisabled: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$49',
    accent: '#abcbdf',
    icon: 'qr-code-outline',
    tagline: 'Bireysel pratisyenler için',
    badge: 'Popüler',
    features: [
      'Özel paylaşım linki',
      'QR kod ile paylaşım',
      'Hasta başvuru formu',
      'E-posta desteği',
    ],
    cta: 'Pro\'ya Geç',
    mailto: 'istabot.info@gmail.com?subject=NonSlop Pro Plan',
  },
  {
    id: 'clinic',
    name: 'Clinic',
    price: '$99',
    accent: '#c5e8c5',
    icon: 'globe-outline',
    tagline: 'Klinik ve poliklinikler için',
    features: [
      'Özel alan adı',
      'Çoklu klinisyen',
      'Analitik dashboard',
      'Öncelikli destek',
    ],
    cta: 'Clinic\'e Geç',
    mailto: 'istabot.info@gmail.com?subject=NonSlop Clinic Plan',
  },
];

export default function DeploymentOptions({ navigation }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Ionicons name="arrow-back" size={24} color="#e3e2e3" />
      </TouchableOpacity>

      <Text style={styles.title}>Yayınlama Planları</Text>
      <Text style={styles.subtitle}>Uygulamanı dünyaya açmak için bir plan seç</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {PLANS.map((plan) => (
          <View key={plan.id} style={[styles.card, { borderColor: plan.accent + '44' }]}>
            <View style={styles.cardTop}>
              <View style={[styles.planIcon, { backgroundColor: plan.accent + '22' }]}>
                <Ionicons name={plan.icon} size={22} color={plan.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={[styles.planName, { color: plan.accent }]}>{plan.name}</Text>
                  {plan.badge && (
                    <View style={[styles.badge, { backgroundColor: plan.accent + '22' }]}>
                      <Text style={[styles.badgeText, { color: plan.accent }]}>{plan.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.tagline}>{plan.tagline}</Text>
              </View>
              <View style={styles.priceWrap}>
                {plan.price ? (
                  <>
                    <Text style={[styles.price, { color: plan.accent }]}>{plan.price}</Text>
                    <Text style={styles.perMonth}>/ay</Text>
                  </>
                ) : (
                  <Text style={[styles.price, { color: plan.accent }]}>Ücretsiz</Text>
                )}
              </View>
            </View>

            <View style={styles.featureList}>
              {plan.features.map((f) => (
                <View key={f} style={styles.featureRow}>
                  <Ionicons name="checkmark" size={14} color={plan.accent} />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.cta,
                plan.ctaDisabled
                  ? styles.ctaDisabled
                  : { backgroundColor: plan.accent },
              ]}
              onPress={plan.ctaDisabled ? undefined : () => Linking.openURL(`mailto:${plan.mailto}`)}
              activeOpacity={plan.ctaDisabled ? 1 : 0.85}
            >
              <Text style={[styles.ctaText, plan.ctaDisabled && { color: '#6B6B6B' }]}>
                {plan.cta}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121415', paddingTop: 64, paddingHorizontal: 24 },
  back: { marginBottom: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#e3e2e3', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#6B6B6B', marginBottom: 24 },

  list: { gap: 14, paddingBottom: 40 },

  card: {
    backgroundColor: '#1e2021', borderRadius: 18,
    padding: 20, borderWidth: 1,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  planIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  planName: { fontSize: 17, fontWeight: 'bold' },
  badge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  tagline: { fontSize: 12, color: '#6B6B6B' },
  priceWrap: { alignItems: 'flex-end' },
  price: { fontSize: 20, fontWeight: 'bold' },
  perMonth: { fontSize: 11, color: '#6B6B6B' },

  featureList: { gap: 8, marginBottom: 18 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { fontSize: 13, color: '#c2c7cc' },

  cta: {
    borderRadius: 12, paddingVertical: 13, alignItems: 'center',
  },
  ctaDisabled: { backgroundColor: '#1e2021', borderWidth: 1, borderColor: '#292a2b' },
  ctaText: { fontSize: 15, fontWeight: 'bold', color: '#121415' },
});
