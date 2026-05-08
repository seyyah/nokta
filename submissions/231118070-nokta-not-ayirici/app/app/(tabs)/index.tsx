import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';

export default function Index() {
  const [input, setInput] = useState('');
  const [cards, setCards] = useState<
    { id: number; title: string; description: string; source: string }[]
  >([]);

  const [expertName, setExpertName] = useState('');
  const [expertQuestion, setExpertQuestion] = useState('');
  const [expertMessage, setExpertMessage] = useState('');

  const generateCards = () => {
    const lines = input
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const uniqueLines = [...new Set(lines)];

    const generated = uniqueLines.map((item, index) => ({
      id: index + 1,
      title: `Fikir ${index + 1}`,
      description: item,
      source: 'Kullanıcı notu',
    }));

    setCards(generated);
  };

  const requestExpertSupport = () => {
    if (!expertName.trim() || !expertQuestion.trim()) {
      setExpertMessage('Lütfen adınızı ve destek konusunu doldurun.');
      return;
    }

    setExpertMessage(
      'Uzman destek talebiniz alındı. Bir uzman fikrinizi inceleyerek geri bildirim sağlayacaktır.'
    );

    setExpertName('');
    setExpertQuestion('');
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

        <View style={styles.expertBox}>
          <Text style={styles.expertTitle}>Uzman Desteği</Text>
          <Text style={styles.expertSubtitle}>
            Fikrinin bir uzman tarafından yorumlanmasını istiyorsan destek talebi oluştur.
          </Text>

          <TextInput
            style={styles.smallInput}
            placeholder="Adınız"
            value={expertName}
            onChangeText={setExpertName}
          />

          <TextInput
            style={styles.expertInput}
            multiline
            placeholder="Uzmandan hangi konuda destek almak istiyorsunuz?"
            value={expertQuestion}
            onChangeText={setExpertQuestion}
          />

          <TouchableOpacity style={styles.expertButton} onPress={requestExpertSupport}>
            <Text style={styles.buttonText}>Uzman Desteği İste</Text>
          </TouchableOpacity>

          {expertMessage.length > 0 && (
            <Text style={styles.successText}>{expertMessage}</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6fb',
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 15,
    color: '#4b5563',
    marginBottom: 16,
  },
  input: {
    minHeight: 180,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    textAlignVertical: 'top',
    fontSize: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  smallInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  expertInput: {
    minHeight: 110,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    textAlignVertical: 'top',
    fontSize: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  expertButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cardsContainer: {
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111827',
  },
  cardText: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 8,
  },
  cardSource: {
    fontSize: 12,
    color: '#6b7280',
  },
  expertBox: {
    marginTop: 24,
    backgroundColor: '#eefdf3',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  expertTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#14532d',
    marginBottom: 6,
  },
  expertSubtitle: {
    fontSize: 14,
    color: '#166534',
    marginBottom: 14,
  },
  successText: {
    marginTop: 4,
    fontSize: 14,
    color: '#166534',
    fontWeight: '600',
  },
});