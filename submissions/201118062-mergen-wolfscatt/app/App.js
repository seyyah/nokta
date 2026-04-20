import React, { useMemo, useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import HomeScreen from "./screens/HomeScreen";
import QuestionsScreen from "./screens/QuestionsScreen";
import LoadingScreen from "./screens/LoadingScreen";
import ResultScreen from "./screens/ResultScreen";
import { FOLLOW_UP_QUESTIONS, INITIAL_ANSWERS } from "./data/questions";
import { generateSpec } from "./utils/enrichment";
import { colors } from "./constants/theme";

export default function App() {
  const [screen, setScreen] = useState("home");
  const [idea, setIdea] = useState("");
  const [answers, setAnswers] = useState(INITIAL_ANSWERS);
  const [spec, setSpec] = useState(null);

  const questions = useMemo(() => FOLLOW_UP_QUESTIONS, []);

  const handleStart = (rawIdea) => {
    setIdea(rawIdea.trim());
    setAnswers(INITIAL_ANSWERS);
    setSpec(null);
    setScreen("questions");
  };

  const handleFinishQuestions = (nextAnswers) => {
    setAnswers(nextAnswers);
    setScreen("loading");

    setTimeout(() => {
      setSpec(generateSpec(idea, nextAnswers));
      setScreen("result");
    }, 1100);
  };

  const handleRestart = () => {
    setIdea("");
    setAnswers(INITIAL_ANSWERS);
    setSpec(null);
    setScreen("home");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {screen === "home" && <HomeScreen initialIdea={idea} onStart={handleStart} />}

      {screen === "questions" && (
        <QuestionsScreen
          idea={idea}
          questions={questions}
          initialAnswers={answers}
          onBack={handleRestart}
          onComplete={handleFinishQuestions}
        />
      )}

      {screen === "loading" && <LoadingScreen idea={idea} />}

      {screen === "result" && (
        <ResultScreen
          idea={idea}
          spec={spec}
          onRestart={handleRestart}
          onBackToQuestions={() => setScreen("questions")}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  }
});
