import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { analyzeExpertNeed } from '../services/groqService';
import { HeartPulse, ArrowLeft } from 'lucide-react-native';

export default function ExpertSupport() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSend = async () => {
    if (message.trim().length < 5) {
      Alert.alert('Hata', 'Lütfen durumunuzu biraz daha detaylı açıklayın.');
      return;
    }

    setLoading(true);
    try {
      const needsExpert = await analyzeExpertNeed(message);
      
      // Burada normalde Firebase'e kayıt işlemi yapılacaktır.
      // Firestore 'experts' koleksiyonu ve 'needsExpertReview' boolean alanı planlanmıştır.
      /*
      await firestore().collection('requests').add({
        message,
        needsExpertReview: needsExpert,
        createdAt: new Date(),
        userId: 'elderly_user_id'
      });
      */

      if (needsExpert) {
        Alert.alert(
          'Talebiniz Alındı', 
          'Durumunuz uzmanlık gerektirdiği için mesajınız onaylanmak ve incelenmek üzere nöbetçi doktor/sosyal hizmet uzmanına iletilmiştir. Size en kısa sürede dönüş yapılacaktır.'
        );
      } else {
        Alert.alert(
          'Talebiniz Alındı', 
          'Mesajınız gönüllü ağımıza iletilmiştir. Yardımcı olabilecek bir gönüllü size dönüş yapacaktır.'
        );
      }
      setMessage('');
      router.back();
    } catch (error) {
      Alert.alert('Hata', 'Talebiniz iletilemedi, lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          accessibilityLabel="Geri Dön"
          accessibilityRole="button"
        >
          <ArrowLeft color="#fff" size={32} />
        </TouchableOpacity>
        <Text style={styles.title}>Uzmana Danış</Text>
      </View>

      <Text style={styles.infoText}>
        Kendinizi iyi hissetmiyor musunuz veya listenizle ilgili bir doktora danışmak mı istiyorsunuz? Bize yazın.
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Şikayetinizi veya sorunuzu buraya yazın..."
          placeholderTextColor="#cccccc"
          multiline
          value={message}
          onChangeText={setMessage}
          textAlignVertical="top"
          accessibilityLabel="Mesaj yazma alanı"
        />
        <TouchableOpacity 
          style={[styles.button, (message.trim().length < 5 || loading) && styles.buttonDisabled]} 
          onPress={handleSend}
          disabled={message.trim().length < 5 || loading}
          accessibilityLabel="Mesajı Uzmana Gönder"
          accessibilityRole="button"
        >
          {loading ? (
            <ActivityIndicator color="#000" size="large" />
          ) : (
            <>
              <HeartPulse color="#000" size={28} style={{ marginRight: 12 }} />
              <Text style={styles.buttonText}>Gönder</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // WCAG High Contrast (Siyah Arkaplan)
    padding: 24,
    justifyContent: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#ffffff',
  },
  infoText: {
    fontSize: 22, // WCAG Minimum 18pt kuralını fazlasıyla karşılıyor
    color: '#ffffff',
    marginBottom: 32,
    lineHeight: 32,
  },
  inputContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#444444',
  },
  input: {
    color: '#ffffff',
    fontSize: 24, // Yaşlılar için büyük font
    minHeight: 180,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#FFD700', // Yüksek kontrastlı sarı (Siyah üzerinde WCAG AA)
    borderRadius: 16,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80, // Dokunma hedefi (48x48dp'den çok daha büyük)
  },
  buttonDisabled: {
    backgroundColor: '#887700',
    opacity: 0.7,
  },
  buttonText: {
    color: '#000000', // Siyah yazı (Sarı üzerinde yüksek kontrast)
    fontSize: 28,
    fontWeight: '800',
  },
});
