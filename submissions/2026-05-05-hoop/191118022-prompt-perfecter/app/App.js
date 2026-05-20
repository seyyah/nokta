import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import HomeScreen from './screens/HomeScreen';
import QuestionScreen from './screens/QuestionScreen';
import ResultScreen from './screens/ResultScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [initialPrompt, setInitialPrompt] = useState('');
  const [answers, setAnswers] = useState([]);
  const [resultData, setResultData] = useState(null);

  const navigate = (screen, params = {}) => {
    if (params.initialPrompt !== undefined) setInitialPrompt(params.initialPrompt);
    if (params.answers !== undefined) setAnswers(params.answers);
    if (params.resultData !== undefined) setResultData(params.resultData);
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen
            onSubmit={(prompt) => navigate('questions', { initialPrompt: prompt })}
          />
        );
      case 'questions':
        return (
          <QuestionScreen
            initialPrompt={initialPrompt}
            onComplete={(result) => navigate('result', { resultData: result })}
            onBack={() => navigate('home')}
          />
        );
      case 'result':
        return (
          <ResultScreen
            resultData={resultData}
            onReset={() => navigate('home')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
});
