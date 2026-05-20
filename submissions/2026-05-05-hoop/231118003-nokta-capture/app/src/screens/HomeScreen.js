import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { COLORS } from "../theme";

export default function HomeScreen({ navigation }) {
  const [idea, setIdea] = useState("");
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0.2, duration: 1500, useNativeDriver: true })
      ])
    ).start();
  }, []);

  const handleStart = () => {
    if(idea.length > 3) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.navigate("Enrich", { rawIdea: idea });
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <LinearGradient colors={[COLORS.bg, "#1A0830"]} style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <Animated.View style={[styles.sparkleContainer, { opacity: fadeAnim }]}>
          <Text style={styles.sparkle}>✨</Text>
        </Animated.View>
        <Text style={styles.logo}>nokta.</Text>
        <Text style={styles.subtitle}>fikirlerini zenginleştir</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="Aklındaki fikir nedir?"
            placeholderTextColor="#666"
            value={idea}
            onChangeText={(text) => {
              setIdea(text);
              if(text.length % 10 === 0 && text.length > 0) Haptics.selectionAsync();
            }}
            multiline
          />
        </View>
        <TouchableOpacity style={styles.btn} onPress={handleStart}>
          <LinearGradient colors={[COLORS.pink, COLORS.mint]} style={styles.btnG} start={{x:0,y:0}} end={{x:1,y:0}}>
            <Text style={styles.btnT}>Başla →</Text>
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },
  sparkleContainer: { position: "absolute", top: "20%", right: "15%" },
  sparkle: { fontSize: 40 },
  logo: { fontSize: 48, fontWeight: "900", color: "#fff", letterSpacing: -2 },
  subtitle: { fontSize: 16, color: COLORS.mint, marginBottom: 40, fontStyle: "italic" },
  inputBox: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 20, padding: 20, minHeight: 150, marginBottom: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  input: { color: "#fff", fontSize: 18, lineHeight: 24 },
  btnG: { padding: 18, borderRadius: 30, alignItems: "center" },
  btnT: { fontWeight: "800", fontSize: 18, color: "#0A0A18" }
});
