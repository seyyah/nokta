import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { 
  Provider as PaperProvider, 
  MD3DarkTheme as DarkTheme, 
  Appbar, 
  TextInput, 
  Button, 
  Card, 
  Text, 
  Divider, 
  IconButton,
  Chip,
  MD3Colors
} from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

const theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#6200ee',
    secondary: '#03dac6',
    background: '#121212',
    surface: '#1e1e1e',
  },
};

export default function App() {
  const [rawText, setRawText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cards, setCards] = useState([]);

  const processNotes = () => {
    setIsProcessing(true);
    
    // Simulating AI Processing with a timeout
    setTimeout(() => {
      const lines = rawText.split('\n').filter(line => line.trim().length > 3);
      const groups = {};

      // Very simple keyword-based grouping (Pseudo-AI Dedup)
      lines.forEach(line => {
        const keywords = ['app', 'web', 'ai', 'mobile', 'fitness', 'bot', 'game', 'dev'];
        let matchedKey = 'Genel Fikir';
        
        keywords.forEach(key => {
          if (line.toLowerCase().includes(key)) matchedKey = key.toUpperCase();
        });

        if (!groups[matchedKey]) groups[matchedKey] = [];
        groups[matchedKey].push(line);
      });

      const newCards = Object.keys(groups).map((key, index) => ({
        id: index.toString(),
        category: key,
        title: groups[key][0].substring(0, 30) + (groups[key][0].length > 30 ? '...' : ''),
        description: groups[key].join('\n\n'),
        count: groups[key].length
      }));

      setCards(newCards);
      setIsProcessing(false);
    }, 1500);
  };

  const clearAll = () => {
    setRawText('');
    setCards([]);
  };

  return (
    <PaperProvider theme={theme}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <Appbar.Header style={{ backgroundColor: '#1e1e1e' }}>
          <Appbar.Content title="Nokta Capture" titleStyle={{ fontWeight: 'bold', color: '#fff' }} />
          <Appbar.Action icon="delete-outline" color="#fff" onPress={clearAll} />
        </Appbar.Header>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Card style={styles.inputCard}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.label}>Ham Not Döşemesi (WhatsApp/Notlar)</Text>
                <TextInput
                  placeholder="Buraya notlarınızı yapıştırın..."
                  value={rawText}
                  onChangeText={setRawText}
                  multiline
                  numberOfLines={6}
                  mode="outlined"
                  outlineColor="#444"
                  activeOutlineColor={theme.colors.primary}
                  textColor="#fff"
                  style={styles.textInput}
                />
                <Button 
                  mode="contained" 
                  onPress={processNotes} 
                  loading={isProcessing}
                  disabled={isProcessing || !rawText.trim()}
                  style={styles.processButton}
                  icon="auto-fix"
                >
                  Cerebra Dedup & Analyze
                </Button>
              </Card.Content>
            </Card>

            <View style={styles.resultsHeader}>
              <Text variant="headlineSmall" style={{ color: '#fff' }}>Idea Cards ({cards.length})</Text>
              {cards.length > 0 && <Chip icon="check-decagram" style={styles.aiChip}>AI Verified</Chip>}
            </View>

            {cards.length === 0 && !isProcessing && (
              <View style={styles.emptyState}>
                <IconButton icon="lightbulb-outline" size={60} iconColor="#444" />
                <Text style={{ color: '#666' }}>Henüz ayrıştırılmış bir fikir yok.</Text>
              </View>
            )}

            {cards.map((card) => (
              <Card key={card.id} style={styles.ideaCard}>
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <Chip compact style={styles.categoryChip}>{card.category}</Chip>
                    <Text style={styles.dedupInfo}>{card.count} Not Birleştirildi</Text>
                  </View>
                  <Text variant="titleLarge" style={styles.cardTitle}>{card.title}</Text>
                  <Divider style={styles.divider} />
                  <Text variant="bodyMedium" style={styles.cardDescription}>{card.description}</Text>
                </Card.Content>
                <Card.Actions>
                  <Button icon="content-copy" onPress={() => {}}>Kopyala</Button>
                  <Button icon="export-variant" onPress={() => {}}>Dışa Aktar</Button>
                </Card.Actions>
              </Card>
            ))}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  inputCard: {
    backgroundColor: '#1e1e1e',
    marginBottom: 24,
    borderRadius: 12,
  },
  label: {
    marginBottom: 8,
    color: '#ddd',
  },
  textInput: {
    backgroundColor: '#252525',
    marginBottom: 16,
    minHeight: 120,
  },
  processButton: {
    borderRadius: 8,
    paddingVertical: 4,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  aiChip: {
    backgroundColor: 'rgba(98, 0, 238, 0.2)',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
  },
  ideaCard: {
    backgroundColor: '#1e1e1e',
    marginBottom: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6200ee',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryChip: {
    backgroundColor: '#333',
  },
  dedupInfo: {
    color: '#03dac6',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardTitle: {
    color: '#fff',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 12,
    backgroundColor: '#333',
  },
  cardDescription: {
    color: '#bbb',
    lineHeight: 20,
  },
});
