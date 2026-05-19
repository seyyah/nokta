import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [notes, setNotes] = useState('');
  const [ideaCards, setIdeaCards] = useState([]);
  const [loading, setLoading] = useState(false);

  const processNotes = async () => {
    if (!notes.trim()) {
      Alert.alert('Uyarı', 'Lütfen işlem yapmak için notlarınızı girin.');
      return;
    }

    setLoading(true);
    const API_KEY = 'AIzaSyDEceQXTETjxid4G7DOAaaYeG2xc2WHyz8';

    const prompt = `Aşağıdaki ham not dökümündeki tekrarları (dedup) temizle ve farklı fikirleri ayrıştırarak 'Idea Cards' (Fikir Kartları) oluştur. Her fikir için 1 veya 2 kelimelik alakalı etiketler (tags) üret. Çıktıyı sadece JSON formatında, [{ "title": "Başlık", "summary": "Özet", "tags": ["Etiket1", "Etiket2"] }] şeklinde ver.\n\nNotlar:\n${notes}`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const resultText = data.candidates[0].content.parts[0].text;
      
      // AI bazen JSON'u markdown blokları içine koyabiliyor, bunları temizleyelim
      const cleanedText = resultText.replace(/```json|```/g, '').trim();
      const parsedData = JSON.parse(cleanedText);
      setIdeaCards(parsedData);
    } catch (error) {
      console.error("Detaylı Hata:", error.message);
      Alert.alert('Hata', 'API isteği sırasında bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const onShare = async (item) => {
    try {
      await Share.share({
        message: `${item.title}\n\n${item.summary}${item.tags ? '\n\nEtiketler: ' + item.tags.join(', ') : ''}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardSummary}>{item.summary}</Text>
      
      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagContainer}>
          {item.tags.map((tag, index) => (
            <View key={index} style={styles.tagBadge}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.cardFooter}>
        <TouchableOpacity 
          style={styles.shareButton} 
          onPress={() => onShare(item)}
          activeOpacity={0.6}
        >
          <Text style={styles.shareText}>Paylaş</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <FlatList
          ListHeaderComponent={
            <View style={styles.header}>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>Not Derleyici</Text>
                <Text style={styles.headerSubTitle}>& Fikir Kartları</Text>
              </View>
              
              <View style={styles.inputCard}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Karmaşık notlarınızı buraya yapıştırın..."
                  placeholderTextColor="#8E8E93"
                  multiline
                  value={notes}
                  onChangeText={setNotes}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={processNotes}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <View style={styles.loadingWrapper}>
                    <ActivityIndicator color="#ffffff" size="small" />
                    <Text style={styles.loadingText}>Fikirler Derleniyor...</Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>Fikir Kartlarına Dönüştür</Text>
                )}
              </TouchableOpacity>

              {ideaCards.length > 0 && (
                <Text style={styles.sectionTitle}>Ayrıştırılan Fikirler</Text>
              )}
            </View>
          }
          data={ideaCards}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 12,
  },
  headerTextContainer: {
    marginBottom: 32,
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1C1C1E',
    letterSpacing: -0.5,
  },
  headerSubTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#007AFF',
    letterSpacing: -0.5,
    marginTop: -4,
  },
  inputCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  textInput: {
    padding: 16,
    fontSize: 17,
    color: '#1C1C1E',
    minHeight: 180,
    maxHeight: 250,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#007AFF',
    width: '100%',
    height: 58,
    borderRadius: 12,
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#A2C6FF',
    shadowOpacity: 0.1,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  loadingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginTop: 40,
    marginBottom: 16,
    paddingLeft: 4,
  },
  listContent: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#ffffff',
    marginHorizontal: 24,
    marginVertical: 10,
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
    borderWidth: Platform.OS === 'ios' ? 0 : 1,
    borderColor: '#E5E5EA',
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
    lineHeight: 24,
  },
  cardSummary: {
    fontSize: 15,
    color: '#636366',
    lineHeight: 22,
    marginBottom: 16,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tagBadge: {
    backgroundColor: '#E1F0FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#007AFF',
    fontSize: 13,
    fontWeight: '600',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    paddingTop: 12,
    alignItems: 'flex-end',
  },
  shareButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  shareText: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

