import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PAGES = [
  {
    title: 'Nokta\'ya Hoş Geldiniz',
    description: 'Ham, kaotik ve dağınık fikirlerinizi alıp onları net, uygulanabilir ürün blueprint\'lerine dönüştürüyoruz.',
    icon: 'bulb-outline',
    color: '#1A73E8',
  },
  {
    title: 'Soru Motoru',
    description: 'AI, fikirleriniz hakkında problem, hedef kitle, kapsam ve kısıtlar odaklı 5 kritik mühendislik sorusu hazırlar.',
    icon: 'chatbubble-ellipses-outline',
    color: '#FBBC05',
  },
  {
    title: 'Mükemmel Spesifikasyon',
    description: 'Cevaplarınız harmanlanır ve slop içermeyen net bir spec dokümanı yerel olarak telefonunuza kaydedilir.',
    icon: 'document-text-outline',
    color: '#34A853',
  },
];

export default function OnboardingScreen() {
  const [currentPage, setCurrentPage] = useState(0);
  const router = useRouter();

  const handleNext = async () => {
    if (currentPage < PAGES.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      await AsyncStorage.setItem('ONBOARDING_COMPLETED', 'true');
      router.replace('/(tabs)');
    }
  };

  const page = PAGES[currentPage];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.skipRow}>
        <TouchableOpacity
          onPress={async () => {
            await AsyncStorage.setItem('ONBOARDING_COMPLETED', 'true');
            router.replace('/(tabs)');
          }}
        >
          <Text style={styles.skipText}>Geç</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: page.color + '15' }]}>
          <Ionicons name={page.icon as any} size={80} color={page.color} />
        </View>

        <Text style={styles.title}>{page.title}</Text>
        <Text style={styles.description}>{page.description}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.dotsRow}>
          {PAGES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentPage ? styles.activeDot : null,
                index === currentPage ? { backgroundColor: page.color } : null,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: page.color }]}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>
            {currentPage === PAGES.length - 1 ? 'Başla' : 'İleri'}
          </Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  skipRow: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
  },
  skipText: {
    fontSize: 15,
    color: '#5F6368',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#202124',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  description: {
    fontSize: 16,
    color: '#5F6368',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DADCE0',
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
  },
  button: {
    flexDirection: 'row',
    height: 48,
    paddingHorizontal: 24,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
