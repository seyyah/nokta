import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nokta AI Assistant</Text>

      <Text style={styles.description}>
        Bu ekran Expo template kalıntısıydı. Nokta uygulaması ana ekrandan çalışır.
      </Text>

      <Pressable style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Geri Dön</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1020",
    alignItems: "center",
    justifyContent: "center",
    padding: 24
  },
  title: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center"
  },
  description: {
    color: "rgba(234,246,255,0.7)",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 12
  },
  button: {
    marginTop: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: "#2563EB"
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900"
  }
});