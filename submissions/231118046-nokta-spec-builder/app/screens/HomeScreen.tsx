import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import VoiceVisualizer from "../components/VoiceVisualizer";
import AvatarScene from "../components/AvatarScene";

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [voiceLevel, setVoiceLevel] = useState(0);
  const [persona, setPersona] = useState<'junior' | 'senior'>('junior');

  useEffect(() => {
    const loadPersona = async () => {
      try {
        const saved = await AsyncStorage.getItem('@avatar_persona');
        if (saved === 'junior' || saved === 'senior') {
          setPersona(saved);
        }
      } catch (err) {
        console.warn('Failed to load persona:', err);
      }
    };
    loadPersona();
  }, []);

  const handlePersonaChange = async (selected: 'junior' | 'senior') => {
    setPersona(selected);
    try {
      await AsyncStorage.setItem('@avatar_persona', selected);
    } catch (err) {
      console.warn('Failed to save persona:', err);
    }
  };

  const accentColor = persona === 'junior' ? '#00f2fe' : '#a855f7';

  return (
    <ScrollView 
      contentContainerStyle={styles.scrollContainer} 
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.brandTitle, { color: accentColor, textShadowColor: accentColor }]}>NOKTA</Text>
        <Text style={styles.brandSubtitle}>
          {persona === 'junior' ? 'Junior Ravza Assistant' : 'Senior Ravza Architect'}
        </Text>
      </View>

      {/* Persona Segmented Control */}
      <View style={styles.segmentedContainer}>
        <Pressable 
          style={[
            styles.segmentButton, 
            persona === 'junior' && { backgroundColor: 'rgba(0, 242, 254, 0.12)', borderColor: 'rgba(0, 242, 254, 0.3)' }
          ]}
          onPress={() => handlePersonaChange('junior')}
        >
          <Text style={[
            styles.segmentText, 
            persona === 'junior' && { color: '#00f2fe', fontWeight: '700' }
          ]}>Junior Ravza</Text>
        </Pressable>
        
        <Pressable 
          style={[
            styles.segmentButton, 
            persona === 'senior' && { backgroundColor: 'rgba(168, 85, 247, 0.12)', borderColor: 'rgba(168, 85, 247, 0.3)' }
          ]}
          onPress={() => handlePersonaChange('senior')}
        >
          <Text style={[
            styles.segmentText, 
            persona === 'senior' && { color: '#a855f7', fontWeight: '700' }
          ]}>Senior Ravza</Text>
        </Pressable>
      </View>
      
      <View style={styles.avatarWrapper}>
        <AvatarScene audioLevel={voiceLevel} />
      </View>
      
      <VoiceVisualizer onLevelChange={(level) => setVoiceLevel(level)} />

      <View style={styles.buttonGroup}>
        <Pressable 
          style={({ pressed }) => [
            styles.primaryButton,
            { backgroundColor: accentColor, shadowColor: accentColor },
            pressed && styles.buttonPressed
          ]} 
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.primaryButtonText}>Go to Profile</Text>
        </Pressable>

        <Pressable 
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.buttonPressed
          ]} 
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.secondaryButtonText}>Go to Settings</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0c',
  },
  scrollContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Platform.OS === 'web' ? 30 : 15,
    paddingHorizontal: 20,
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#00f2fe',
    letterSpacing: 5,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 242, 254, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  brandSubtitle: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#65657b',
    letterSpacing: 2.5,
    marginTop: 3,
    textTransform: 'uppercase',
  },
  avatarWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  buttonGroup: {
    width: '100%',
    maxWidth: 280,
    marginTop: 10,
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#00f2fe',
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00f2fe',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#0e0e12',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#1f1f2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#8b8b9f',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 20,
    padding: 4,
    marginVertical: 10,
    width: '100%',
    maxWidth: 240,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  segmentText: {
    color: '#8b8b9f',
    fontSize: 12,
    fontWeight: '500',
  },
});
