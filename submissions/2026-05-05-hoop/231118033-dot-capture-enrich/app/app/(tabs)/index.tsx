import React, { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Answers = {
  problem: string;
  user: string;
  scope: string;
  constraints: string;
  success: string;
};

export default function HomeScreen() {
  const [idea, setIdea] = useState('');
  const [started, setStarted] = useState(false);

  const [answers, setAnswers] = useState<Answers>({
    problem: '',
    user: '',
    scope: '',
    constraints: '',
    success: '',
  });

  const handleStart = () => {
    if (!idea.trim()) {
      Alert.alert('Uyarı', 'Lütfen önce ham fikrini gir.');
      return;
    }
    setStarted(true);
  };

  const handleChange = (key: keyof Answers, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const specText = useMemo(() => {
    return `# Ürün Spec

## Ham Fikir
${idea || '-'}

## Problem
${answers.problem || '-'}

## Hedef Kullanıcı
${answers.user || '-'}

## MVP Kapsamı
${answers.scope || '-'}

## Kısıtlar
${answers.constraints || '-'}

## Başarı Ölçütü
${answers.success || '-'}

## Özet
Bu fikir, ${answers.user || 'hedef kullanıcılar'} için ${
      answers.problem || 'belirtilen problemi'
    } çözmeyi amaçlar. İlk sürümde ${answers.scope || 'temel özellikler'} odağa alınacaktır. 
Geliştirme sırasında ${answers.constraints || 'mevcut kısıtlar'} dikkate alınacaktır. 
Başarı ise ${answers.success || 'tanımlanan ölçütler'} üzerinden değerlendirilecektir.`;
  }, [idea, answers]);

  const handleCopyDemo = () => {
    Alert.alert('Bilgi', 'Spec metni hazır. İstersen sonra kopyalama özelliği de ekleriz.');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>NOKTA – Track A</Text>
      <Text style={styles.subtitle}>Ham fikirden tek sayfalık ürün spesifikasyonuna</Text>

      <View style={styles.card}>
        <Text style={styles.label}>1. Ham fikrini yaz</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="Örn: Öğrencilerin ders notlarını özetleyip çalışma planı çıkaran bir mobil uygulama"
          placeholderTextColor="#777"
          value={idea}
          onChangeText={setIdea}
          multiline
        />

        <TouchableOpacity style={styles.button} onPress={handleStart}>
          <Text style={styles.buttonText}>Soruları Oluştur</Text>
        </TouchableOpacity>
      </View>

      {started && (
        <>
          <View style={styles.card}>
            <Text style={styles.label}>2. Soruları cevapla</Text>

            <Text style={styles.question}>Bu fikir hangi problemi çözüyor?</Text>
            <TextInput
              style={styles.input}
              placeholder="Problemi yaz"
              placeholderTextColor="#777"
              value={answers.problem}
              onChangeText={(text) => handleChange('problem', text)}
            />

            <Text style={styles.question}>Hedef kullanıcı kim?</Text>
            <TextInput
              style={styles.input}
              placeholder="Hedef kullanıcıyı yaz"
              placeholderTextColor="#777"
              value={answers.user}
              onChangeText={(text) => handleChange('user', text)}
            />

            <Text style={styles.question}>İlk sürümde kapsam ne olacak?</Text>
            <TextInput
              style={styles.input}
              placeholder="MVP kapsamını yaz"
              placeholderTextColor="#777"
              value={answers.scope}
              onChangeText={(text) => handleChange('scope', text)}
            />

            <Text style={styles.question}>Teknik veya zaman kısıtları neler?</Text>
            <TextInput
              style={styles.input}
              placeholder="Kısıtları yaz"
              placeholderTextColor="#777"
              value={answers.constraints}
              onChangeText={(text) => handleChange('constraints', text)}
            />

            <Text style={styles.question}>Başarı nasıl ölçülecek?</Text>
            <TextInput
              style={styles.input}
              placeholder="Başarı ölçütünü yaz"
              placeholderTextColor="#777"
              value={answers.success}
              onChangeText={(text) => handleChange('success', text)}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>3. Oluşan Tek Sayfa Spec</Text>
            <View style={styles.specBox}>
              <Text style={styles.specText}>{specText}</Text>
            </View>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleCopyDemo}>
              <Text style={styles.secondaryButtonText}>Spec Hazır</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#f5f7fb',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111',
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#555',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111',
  },
  question: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 10,
    color: '#222',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fafafa',
    fontSize: 14,
    color: '#111',
  },
  multilineInput: {
    minHeight: 110,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#111827',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  specBox: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  specText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#111',
  },
});