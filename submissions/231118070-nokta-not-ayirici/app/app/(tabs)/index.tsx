import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Index() {
  const [input, setInput] = useState("");
  const [cards, setCards] = useState<
    { id: number; title: string; description: string; source: string }[]
  >([]);

  const generateCards = () => {
    const lines = input
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const uniqueLines = [...new Set(lines)];

    const generated = uniqueLines.map((item, index) => ({
      id: index + 1,
      title: `Fikir ${index + 1}`,
      description: item,
      source: "Kullanıcı notu",
    }));

    setCards(generated);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>NOKTA - Not Ayırıcı</Text>
        <Text style={styles.subtitle}>
          Notlarını yapıştır, tekrarları temizle, idea card olarak gör.
        </Text>

        <TextInput
          style={styles.input}
          multiline
          placeholder="Buraya notlarını yapıştır..."
          value={input}
          onChangeText={setInput}
        />

        <TouchableOpacity style={styles.button} onPress={generateCards}>
          <Text style={styles.buttonText}>Idea Card Oluştur</Text>
        </TouchableOpacity>

        <View style={styles.cardsContainer}>
          {cards.map((card) => (
            <View key={card.id} style={styles.card}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardText}>{card.description}</Text>
              <Text style={styles.cardSource}>Kaynak: {card.source}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6fb",
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
    color: "#1f2937",
  },
  subtitle: {
    fontSize: 15,
    color: "#4b5563",
    marginBottom: 16,
  },
  input: {
    minHeight: 180,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    textAlignVertical: "top",
    fontSize: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cardsContainer: {
    gap: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    color: "#111827",
  },
  cardText: {
    fontSize: 15,
    color: "#374151",
    marginBottom: 8,
  },
  cardSource: {
    fontSize: 12,
    color: "#6b7280",
  },
});
