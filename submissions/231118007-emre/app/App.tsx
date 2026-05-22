import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Animated,
  Easing,
  Modal,
  ScrollView,
  Image,
  TextInput
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuditWidget } from './nokta-audit/src/index';
import { captureScreen, captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Hayvan Veritabanı
const PETS = {
  CAT: { id: 'CAT', name: 'Kedi', emoji: '🐱', happy: '😻', sad: '😿', sound: 'Miyav' },
  DOG: { id: 'DOG', name: 'Köpek', emoji: '🐶', happy: '🐕', sad: '🐕‍🦺', sound: 'Hav hav' },
  RABBIT: { id: 'RABBIT', name: 'Tavşan', emoji: '🐰', happy: '🐇', sad: '🐰', sound: 'Sniff' }
};

export default function App() {
  // Global States
  const [activeTab, setActiveTab] = useState('HOME'); // HOME, SHOP, SETTINGS
  const [coins, setCoins] = useState(100);
  
  // Pet States
  const [currentPet, setCurrentPet] = useState(PETS.CAT);
  const [hunger, setHunger] = useState(50);
  const [happiness, setHappiness] = useState(50);
  const [energy, setEnergy] = useState(80);
  const [catState, setCatState] = useState(PETS.CAT.emoji);
  const [message, setMessage] = useState('Merhaba! Benimle oyna!');
  
  // Admin Panel states
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [bugList, setBugList] = useState([]);
  const [geminiKey, setGeminiKey] = useState('AIzaSyDz5tLsC4igg_QFue529vN-eiDjGr2a_8A');
  const [aiLoading, setAiLoading] = useState(false);

  const [scaleValue] = useState(new Animated.Value(1));

  // Simülasyon
  useEffect(() => {
    const timer = setInterval(() => {
      setHunger(prev => Math.max(0, prev - 2));
      setHappiness(prev => Math.max(0, prev - 1));
      setEnergy(prev => Math.max(0, prev - 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Ruh hali
  useEffect(() => {
    if (hunger < 20 || happiness < 20 || energy < 20) {
      setCatState(currentPet.sad);
      setMessage(`${currentPet.sound}... Çok mutsuzum, açım veya yorgunum.`);
    } else if (happiness > 80 && hunger > 80) {
      setCatState(currentPet.happy);
      setMessage(`*Mutlu sesler* Çok iyiyim!`);
    } else {
      setCatState(currentPet.emoji);
    }
  }, [hunger, happiness, energy, currentPet]);

  const animateCat = () => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 1.2,
        duration: 150,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 150,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ]).start();
  };

  const feedCat = () => {
    if (coins >= 10) {
      setCoins(prev => prev - 10);
      setHunger(prev => Math.min(100, prev + 30));
      setMessage('Mnyam mnyam! (10 Altın harcandı)');
      animateCat();
    } else {
      setMessage('Yeterli altının yok!');
    }
  };

  const petCat = () => {
    setHappiness(prev => Math.min(100, prev + 15));
    setCoins(prev => prev + 5); // Sevince altın kazandır (Teşvik)
    setMessage(`${currentPet.sound}! (5 Altın kazandın)`);
    animateCat();
  };

  const sleepCat = () => {
    setEnergy(100);
    setHappiness(prev => Math.max(0, prev - 10)); // Uyuyunca biraz canı sıkılır
    setMessage('Zzz... Zzz...');
    setCatState('😴');
    animateCat();
  }

  const waterCat = () => {
    if (coins >= 5) {
      setCoins(prev => prev - 5);
      setEnergy(prev => Math.min(100, prev + 20));
      setMessage('Lıkır lıkır! (5 Altın harcandı)');
      animateCat();
    } else {
      setMessage('Su için yeterli altının yok!');
    }
  };

  // Admin Fonksiyonları
  const openAdminPanel = async () => {
    try {
      const raw = await AsyncStorage.getItem('audit_notes');
      if (raw) {
        setBugList(JSON.parse(raw));
      } else {
        setBugList([]);
      }
      setIsAdminPanelOpen(true);
    } catch (e) {
      console.log('Error reading notes', e);
    }
  };

  const clearBugs = async () => {
    await AsyncStorage.removeItem('audit_notes');
    setBugList([]);
  };

  const exportAsMD = async () => {
    if (bugList.length === 0) {
      alert("Dışa aktarılacak hata yok!");
      return;
    }
    let content = "# 🐾 Sanal Dostum - Hata Raporları\n\n";
    bugList.forEach((b, i) => {
      content += `### ${i+1}. Hata - Ekran: ${b.screenName}\n`;
      content += `- **Tarih:** ${new Date(b.timestamp).toLocaleString()}\n`;
      content += `- **Kullanıcı Notu:** ${b.markdown}\n\n`;
    });
    try {
      const dir = FileSystem.documentDirectory.endsWith('/') ? FileSystem.documentDirectory : FileSystem.documentDirectory + '/';
      const uri = dir + 'HataRaporu.md';
      await FileSystem.writeAsStringAsync(uri, content);
      await Sharing.shareAsync(uri);
    } catch(e) {
      alert("MD Aktarım Hatası: " + e.message);
    }
  };

  const exportAsDoc = async () => {
    if (bugList.length === 0) {
      alert("Dışa aktarılacak hata yok!");
      return;
    }
    // Basit HTML formatı .doc olarak kaydedilince Word tarafından sorunsuz açılır.
    let content = "<html><head><meta charset='utf-8'></head><body style='font-family: Arial;'>";
    content += "<h1 style='color: #FF69B4;'>🐾 Sanal Dostum - Hata Raporları</h1>";
    bugList.forEach((b, i) => {
      content += `<h3 style='color: #333;'>${i+1}. Ekran: ${b.screenName}</h3>`;
      content += `<p><b>Tarih:</b> ${new Date(b.timestamp).toLocaleString()}</p>`;
      content += `<p><b>Kullanıcı Notu:</b> ${b.markdown}</p><hr/>`;
    });
    content += "</body></html>";
    
    try {
      const dir = FileSystem.documentDirectory.endsWith('/') ? FileSystem.documentDirectory : FileSystem.documentDirectory + '/';
      const uri = dir + 'HataRaporu.doc';
      await FileSystem.writeAsStringAsync(uri, content);
      await Sharing.shareAsync(uri);
    } catch(e) {
      alert("Word Aktarım Hatası: " + e.message);
    }
  };

  const solveWithAI = async (bug) => {
    if (!geminiKey) {
      alert('Lütfen önce yukarıdaki alana Gemini API Key girin!');
      return;
    }
    setAiLoading(true);
    try {
      // Base64 URI format: "data:image/png;base64,iVBORw0KGgo..." or a local file URI
      let base64Data = bug.base64Uri;
      if (base64Data && base64Data.startsWith('file://')) {
        base64Data = await FileSystem.readAsStringAsync(base64Data, { encoding: FileSystem.EncodingType.Base64 });
      } else if (base64Data && base64Data.includes(',')) {
        base64Data = base64Data.split(',')[1];
      }

      const requestBody = {
        contents: [{
          parts: [
            { text: `Sen 'Antigravity' adında usta bir React Native yapay zeka ajanısın. Aşağıdaki kullanıcı şikayetini ve ekran görüntüsünü incele. Şikayet: "${bug.markdown}". Uygulamanın kodu App.js içinde. Bu sorunu çözmek için koda tam olarak ne eklemem/değiştirmem gerektiğini çok kısa ve net bir şekilde açıkla.` },
          ]
        }]
      };

      // Resim varsa ekle
      if (base64Data) {
        requestBody.contents[0].parts.push({
          inlineData: {
            mimeType: "image/png",
            data: base64Data
          }
        });
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      setAiLoading(false);
      
      if (data.candidates && data.candidates[0]) {
        alert('🤖 Antigravity Otonom Çözüm:\n\n' + data.candidates[0].content.parts[0].text);
      } else {
        alert('AI yanıt veremedi veya hata oluştu.\n' + JSON.stringify(data));
      }
    } catch (e) {
      setAiLoading(false);
      alert('Bağlantı Hatası: ' + e.message);
    }
  };

  const renderHome = () => (
    <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Açlık</Text>
          <View style={styles.barBackground}>
            <View style={[styles.barFill, { width: `${hunger}%`, backgroundColor: hunger < 30 ? 'red' : 'green' }]} />
          </View>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Mutluluk</Text>
          <View style={styles.barBackground}>
            <View style={[styles.barFill, { width: `${happiness}%`, backgroundColor: happiness < 30 ? 'red' : 'orange' }]} />
          </View>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Enerji</Text>
          <View style={styles.barBackground}>
            <View style={[styles.barFill, { width: `${energy}%`, backgroundColor: energy < 30 ? 'red' : '#2196F3' }]} />
          </View>
        </View>
      </View>

      <View style={styles.catContainer}>
        <Text style={styles.messageBubble}>{message}</Text>
        <Animated.Text style={[styles.catEmoji, { transform: [{ scale: scaleValue }] }]}>
          {catState}
        </Animated.Text>
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.actionBtn} onPress={feedCat}>
          <Text style={styles.actionBtnText}>🥩 Besle (10 🪙)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#2196F3' }]} onPress={waterCat}>
          <Text style={styles.actionBtnText}>💧 Su Ver (5 🪙)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#9C27B0' }]} onPress={petCat}>
          <Text style={styles.actionBtnText}>✋ Sev (+5 🪙)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#607D8B' }]} onPress={sleepCat}>
          <Text style={styles.actionBtnText}>🛏️ Uyut</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderShop = () => (
    <View style={styles.shopContainer}>
      <Text style={styles.shopTitle}>Market'e Hoşgeldin!</Text>
      <Text style={styles.shopSubtitle}>Altınlarınla farklı hayvanlar evlat edinebilirsin.</Text>
      
      {Object.values(PETS).map(pet => (
        <TouchableOpacity 
          key={pet.id} 
          style={[styles.shopItem, currentPet.id === pet.id && styles.shopItemActive]}
          onPress={() => {
            if (coins >= 50) {
              setCoins(prev => prev - 50);
              setCurrentPet(pet);
              setMessage(`${pet.name} evlat edinildi!`);
            } else {
              alert("Yeterli altının yok (50 🪙 gerekli)");
            }
          }}
        >
          <Text style={styles.shopItemEmoji}>{pet.emoji}</Text>
          <View>
            <Text style={styles.shopItemName}>{pet.name}</Text>
            <Text style={styles.shopItemPrice}>50 🪙</Text>
          </View>
          {currentPet.id === pet.id && <Text style={styles.shopItemOwned}>Kullanımda</Text>}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSettings = () => (
    <View style={styles.shopContainer}>
      <Text style={styles.shopTitle}>Ayarlar</Text>
      
      {/* Düzeltilmiş Hata 1: Yazı okunabilir arka planla değiştirildi */}
      <View style={{ backgroundColor: '#F5F5F5', padding: 20, marginVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#EEE' }}>
        <Text style={{ color: '#333' }}>Gizlilik Politikası (Düzeltildi: Artık net bir şekilde okunuyor)</Text>
      </View>

      {/* Düzeltilmiş Hata 2: Buton padding ile hizalandı */}
      <TouchableOpacity style={{ backgroundColor: '#F44336', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, alignItems: 'center', marginTop: 20 }}>
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Profili Sil</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🐾 Sanal Dostum</Text>
          <View style={styles.headerRight}>
            <Text style={styles.coinText}>{coins} 🪙</Text>
            <TouchableOpacity style={styles.adminBtn} onPress={openAdminPanel}>
              <Text style={styles.adminBtnText}>⚙️ Admin</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Content */}
        <View style={styles.contentArea}>
          {activeTab === 'HOME' && renderHome()}
          {activeTab === 'SHOP' && renderShop()}
          {activeTab === 'SETTINGS' && renderSettings()}
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabBar}>
          <TouchableOpacity style={styles.tabBtn} onPress={() => setActiveTab('HOME')}>
            <Text style={[styles.tabText, activeTab === 'HOME' && styles.tabTextActive]}>🏠 Ev</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabBtn} onPress={() => setActiveTab('SHOP')}>
            <Text style={[styles.tabText, activeTab === 'SHOP' && styles.tabTextActive]}>🛒 Market</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabBtn} onPress={() => setActiveTab('SETTINGS')}>
            <Text style={[styles.tabText, activeTab === 'SETTINGS' && styles.tabTextActive]}>⚙️ Ayarlar</Text>
          </TouchableOpacity>
        </View>

        {/* Admin Paneli Modalı */}
        <Modal visible={isAdminPanelOpen} animationType="slide" onRequestClose={() => setIsAdminPanelOpen(false)}>
          <SafeAreaView style={styles.adminModalContainer}>
            <View style={styles.adminHeader}>
              <Text style={styles.adminHeaderTitle}>🛠 Yönetici Paneli (Bugs)</Text>
              <TouchableOpacity onPress={() => setIsAdminPanelOpen(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>Kapat</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.apiKeyContainer}>
              <Text style={styles.apiKeyLabel}>Gemini API Key (AI Studio):</Text>
              <TextInput 
                style={styles.apiKeyInput} 
                placeholder="AIzaSy..." 
                value={geminiKey}
                onChangeText={setGeminiKey}
                secureTextEntry={true}
              />
            </View>
            
            <ScrollView style={styles.bugList}>
              {bugList.length === 0 ? (
                <Text style={styles.emptyText}>Henüz bildirilen bir hata yok!</Text>
              ) : (
                bugList.map((bug) => (
                  <View key={bug.id} style={styles.bugCard}>
                    <Text style={styles.bugScreenName}>Ekran: {bug.screenName}</Text>
                    <Text style={styles.bugStatus}>Durum: {bug.status}</Text>
                    <Text style={styles.bugNote}>Not: {bug.markdown}</Text>
                    {bug.base64Uri && (
                      <Image source={{ uri: bug.base64Uri }} style={styles.bugImage} resizeMode="contain" />
                    )}
                    <Text style={styles.bugTime}>Zaman: {new Date(bug.timestamp).toLocaleString()}</Text>
                    
                    <TouchableOpacity 
                      style={styles.aiSolveBtn} 
                      onPress={() => solveWithAI(bug)}
                      disabled={aiLoading}
                    >
                      <Text style={styles.aiSolveBtnText}>
                        {aiLoading ? '🤖 Analiz Ediliyor...' : '🤖 Antigravity İle Çöz'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>
            
            {bugList.length > 0 && (
              <View style={styles.actionButtonsContainer}>
                <View style={styles.exportRow}>
                  <TouchableOpacity style={styles.exportMdBtn} onPress={exportAsMD}>
                    <Text style={styles.exportBtnText}>📄 MD Aktar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.exportDocBtn} onPress={exportAsDoc}>
                    <Text style={styles.exportBtnText}>📝 Word Aktar</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.clearBtn} onPress={clearBugs}>
                  <Text style={styles.clearBtnText}>🗑️ Tüm Kayıtları Temizle</Text>
                </TouchableOpacity>
              </View>
            )}
          </SafeAreaView>
        </Modal>

        {/* AuditWidget Drop-in Mount */}
        <AuditWidget
          appName="SanalDostumApp"
          deps={{
            captureScreen: () => captureScreen({ format: 'png', result: 'tmpfile' }),
            captureRef: (ref) => captureRef(ref, { format: 'png', result: 'tmpfile' }),
            writeFile: async (filename, content) => {
              const dir = FileSystem.documentDirectory.endsWith('/') ? FileSystem.documentDirectory : FileSystem.documentDirectory + '/';
              const uri = dir + filename;
              await FileSystem.writeAsStringAsync(uri, content);
              return uri;
            },
            writeFileBinary: async (filename, base64) => {
              const dir = FileSystem.documentDirectory.endsWith('/') ? FileSystem.documentDirectory : FileSystem.documentDirectory + '/';
              const uri = dir + filename;
              await FileSystem.writeAsStringAsync(uri, base64, {
                encoding: FileSystem.EncodingType.Base64,
              });
              return uri;
            },
            shareFile: (uri) => Sharing.shareAsync(uri),
            storage: {
              loadNotes: async () => {
                const raw = await AsyncStorage.getItem('audit_notes');
                return raw ? JSON.parse(raw) : [];
              },
              saveNotes: async (notes) => {
                await AsyncStorage.setItem('audit_notes', JSON.stringify(notes));
              }
            },
            currentScreen: activeTab,
            reporterId: 'oyuncu-qa',
            BugIcon: <Text style={{ fontSize: 22 }}>🐛</Text>,
          }}
          initialPosition={{ bottom: 100, right: 20 }}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5', 
  },
  header: {
    padding: 15,
    backgroundColor: '#FF69B4',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#FF1493',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700', // Altın sarısı
    marginRight: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2
  },
  adminBtn: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  adminBtnText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: 'bold',
  },
  contentArea: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: '#FFE4E1',
    borderBottomWidth: 1,
    borderBottomColor: '#FFC0CB',
  },
  statBox: {
    width: '30%',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  barBackground: {
    width: '100%',
    height: 12,
    backgroundColor: '#DDD',
    borderRadius: 10,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 10,
  },
  catContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  messageBubble: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CCC',
    fontSize: 16,
    marginBottom: 20,
    maxWidth: '80%',
    textAlign: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  catEmoji: {
    fontSize: 130,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    flexWrap: 'wrap',
    padding: 15,
    gap: 10,
  },
  actionBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 3,
    minWidth: 100,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingBottom: 20, // For safe area on iOS
  },
  tabBtn: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    color: '#888',
  },
  tabTextActive: {
    color: '#FF69B4',
    fontWeight: 'bold',
  },
  // Shop Styles
  shopContainer: {
    padding: 20,
  },
  shopTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  shopSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  shopItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  shopItemActive: {
    borderColor: '#FF69B4',
    backgroundColor: '#FFF0F5',
  },
  shopItemEmoji: {
    fontSize: 40,
    marginRight: 15,
  },
  shopItemName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  shopItemPrice: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  shopItemOwned: {
    position: 'absolute',
    right: 15,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  // Admin Panel Styles
  adminModalContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  adminHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#333',
  },
  adminHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  closeBtn: {
    padding: 8,
    backgroundColor: '#555',
    borderRadius: 5,
  },
  closeBtnText: {
    color: '#FFF',
  },
  apiKeyContainer: {
    padding: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },
  apiKeyLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  apiKeyInput: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#F9F9F9',
  },
  bugList: {
    padding: 15,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },
  bugCard: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderLeftWidth: 5,
    borderLeftColor: '#E91E63',
    elevation: 2,
  },
  bugScreenName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  bugStatus: {
    color: '#E91E63',
    fontWeight: 'bold',
    marginVertical: 5,
  },
  bugNote: {
    fontSize: 15,
    color: '#555',
    marginVertical: 5,
  },
  bugImage: {
    width: '100%',
    height: 200,
    marginTop: 10,
    borderRadius: 5,
    backgroundColor: '#EEE',
  },
  bugTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 10,
    textAlign: 'right',
  },
  clearBtn: {
    backgroundColor: '#F44336',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  aiSolveBtn: {
    backgroundColor: '#673AB7',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  aiSolveBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 15,
  }
});