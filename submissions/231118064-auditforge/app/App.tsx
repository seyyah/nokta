import React, { useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { IdeaListScreen } from './src/screens/IdeaListScreen';
import { IdeaDetailScreen } from './src/screens/IdeaDetailScreen';
import { AuditBoundary } from './src/components/AuditBoundary';
import { Idea } from './src/types';

type ScreenState = 
  | { name: 'Onboarding' }
  | { name: 'Home' }
  | { name: 'IdeaList' }
  | { name: 'IdeaDetail'; params: { idea: Idea } };

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>({ name: 'Onboarding' });

  const renderScreen = () => {
    switch (currentScreen.name) {
      case 'Onboarding':
        return <OnboardingScreen onNavigate={(screen) => setCurrentScreen({ name: screen })} />;
      case 'Home':
        return <HomeScreen onNavigate={(screen) => setCurrentScreen({ name: screen })} />;
      case 'IdeaList':
        return (
          <IdeaListScreen 
            onNavigate={(screen, params) => setCurrentScreen({ name: screen, params })} 
            onBack={() => setCurrentScreen({ name: 'Home' })}
          />
        );
      case 'IdeaDetail':
        return (
          <IdeaDetailScreen 
            idea={currentScreen.params.idea} 
            onBack={() => setCurrentScreen({ name: 'IdeaList' })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <AuditBoundary currentScreen={currentScreen.name}>
        {renderScreen()}
      </AuditBoundary>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
