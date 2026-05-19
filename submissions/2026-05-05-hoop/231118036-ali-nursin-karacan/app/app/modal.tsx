import { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const API_KEY = 'AIzaSyC33m9Gw18WSMXZaoDiQ2kdsDGIlTJd_Cs';

const AVATAR_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <style>
    body { margin: 0; background: #e5e5ea; overflow: hidden; display: flex; justify-content: center; align-items: center; }
    canvas { width: 100%; height: 100%; outline: none; }
  </style>
</head>
<body>
<script>
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 100);
  camera.position.z = 4.5;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(2, 5, 3);
  scene.add(dirLight);

  const group = new THREE.Group();
  scene.add(group);

  // Head (White Sphere)
  const headGeo = new THREE.SphereGeometry(1.2, 32, 32);
  const headMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
  const head = new THREE.Mesh(headGeo, headMat);
  group.add(head);

  // Eyes (Blue Capsules)
  const eyeGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.3, 16);
  eyeGeo.rotateX(Math.PI/2);
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x007aff });
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(-0.4, 0.2, 1.05);
  const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
  eyeR.position.set(0.4, 0.2, 1.05);
  group.add(eyeL);
  group.add(eyeR);

  // --- Advanced Mouth with Teeth and Tongue ---
  const mouthGroup = new THREE.Group();
  mouthGroup.position.set(0, -0.3, 1.12);

  // 1. Mouth Cavity (Dark inside)
  const cavityGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 32);
  cavityGeo.rotateX(Math.PI / 2);
  const cavityMat = new THREE.MeshStandardMaterial({ color: 0x1a0000 });
  const cavity = new THREE.Mesh(cavityGeo, cavityMat);
  mouthGroup.add(cavity);

  // 2. Lips (Blue Border)
  const lipGeo = new THREE.TorusGeometry(0.3, 0.05, 16, 32);
  const lipMat = new THREE.MeshStandardMaterial({ color: 0x007aff });
  const lips = new THREE.Mesh(lipGeo, lipMat);
  lips.position.z = 0.02;
  mouthGroup.add(lips);

  // 3. Teeth (White Blocks)
  const teethMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 });
  const topTeethGeo = new THREE.BoxGeometry(0.4, 0.05, 0.04);
  const topTeeth = new THREE.Mesh(topTeethGeo, teethMat);
  topTeeth.position.z = 0.01;
  mouthGroup.add(topTeeth);
  
  const bottomTeethGeo = new THREE.BoxGeometry(0.4, 0.05, 0.04);
  const bottomTeeth = new THREE.Mesh(bottomTeethGeo, teethMat);
  bottomTeeth.position.z = 0.01;
  mouthGroup.add(bottomTeeth);

  // 4. Tongue (Pink)
  const tongueGeo = new THREE.SphereGeometry(0.18, 16, 16);
  const tongueMat = new THREE.MeshStandardMaterial({ color: 0xff4d4d, roughness: 0.4 });
  const tongue = new THREE.Mesh(tongueGeo, tongueMat);
  tongue.scale.set(1.2, 0.3, 1.2);
  tongue.position.z = 0.02;
  mouthGroup.add(tongue);

  group.add(mouthGroup);
  // ------------------------------------------

  let isSpeaking = false;

  window.speakText = function(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'tr-TR';
    utterance.rate = 1.0;
    utterance.pitch = 1.1;
    utterance.onstart = () => { isSpeaking = true; };
    utterance.onend = () => { isSpeaking = false; };
    utterance.onerror = () => { isSpeaking = false; };
    window.speechSynthesis.speak(utterance);
  };

  // Listen to messages from React Native
  window.addEventListener('message', (e) => {
    if (e.data && typeof e.data === 'string') {
      window.speakText(e.data);
    }
  });

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    
    // Floating animation
    group.position.y = Math.sin(t * 2) * 0.1;
    group.rotation.y = Math.sin(t * 1) * 0.1;
    
    // Blinking animation
    let blink = Math.abs(Math.sin(t * 0.5)) < 0.05 ? 0.1 : 1;
    eyeL.scale.y = blink;
    eyeR.scale.y = blink;

    // Advanced Lip Sync with Teeth and Tongue
    if (isSpeaking) {
      let openLevel = 0.3 + Math.random() * 0.7; // randomly open between 0.3 and 1.0
      cavity.scale.y = openLevel;
      lips.scale.y = openLevel;
      
      // Move teeth up and down based on mouth opening
      topTeeth.position.y = (0.3 * openLevel) - 0.025;
      bottomTeeth.position.y = -(0.3 * openLevel) + 0.025;
      
      // Tongue bobs up and down while talking
      tongue.position.y = -(0.3 * openLevel) + 0.05;
      tongue.rotation.x = Math.random() * 0.2;
    } else {
      // Closed / Smile
      cavity.scale.y = 0.1;
      lips.scale.y = 0.1;
      
      topTeeth.position.y = 0.015;
      bottomTeeth.position.y = -0.015;
      tongue.position.y = -0.01;
      tongue.rotation.x = 0;
    }

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
</script>
</body>
</html>
`;

export default function ExpertSupportModal() {
  const router = useRouter();
  const { ideaTitle } = useLocalSearchParams();
  const [connecting, setConnecting] = useState(true);
  const [messages, setMessages] = useState<Array<{id: string, text: string, sender: 'user' | 'expert'}>>([]);
  const [inputText, setInputText] = useState('');
  
  const scrollViewRef = useRef<ScrollView>(null);
  const webViewRef = useRef<WebView>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const speak = (text: string) => {
    if (Platform.OS === 'web') {
      iframeRef.current?.contentWindow?.postMessage(text, '*');
    } else {
      const script = `window.speakText("${text.replace(/"/g, '\\"')}"); true;`;
      webViewRef.current?.injectJavaScript(script);
    }
  };

  useEffect(() => {
    // Simulate connection delay for human expert (HITL)
    const timer = setTimeout(() => {
      setConnecting(false);
      const initialText = `Merhaba! Ben Dr. Ahmet. "${ideaTitle}" başlıklı fikrinizi inceledim. Fikrinizi geliştirmek için buradayım, aklınıza takılan soruları sorabilirsiniz.`;
      
      setMessages([
        {
          id: '1',
          text: initialText,
          sender: 'expert'
        }
      ]);

      // Delay speaking slightly so the iframe has time to load
      setTimeout(() => speak("Merhaba, size nasıl yardımcı olabilirim?"), 500);

    }, 2000);

    return () => clearTimeout(timer);
  }, [ideaTitle]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userText = inputText;
    const newMessage = { id: Date.now().toString(), text: userText, sender: 'user' as const };
    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const prompt = `Sen inovasyon ve ürün geliştirme konusunda uzman bir mentorsun (Dr. Ahmet). Kullanıcının fikri: "${ideaTitle}". Kullanıcı sana şu soruyu sordu: "${userText}". Profesyonel, yapıcı ve doğrudan bir cevap ver. (Maksimum 2 cümle. Konuşma dilinde yaz, çünkü sesli okunacak.)`;
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      if (!response.ok) throw new Error('API Hatası');
      
      const data = await response.json();
      const expertReply = data.candidates[0].content.parts[0].text;

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: expertReply,
        sender: 'expert'
      }]);
      
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
      
      // Make the avatar speak!
      speak(expertReply);
      
    } catch (error) {
      const errorMsg = 'Bağlantı koptu, lütfen daha sonra tekrar deneyin.';
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: errorMsg,
        sender: 'expert'
      }]);
      speak(errorMsg);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Uzman Desteği (3D Konuşan Avatar)</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>Kapat</Text>
        </TouchableOpacity>
      </View>

      {connecting ? (
        <View style={styles.connectingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.connectingText}>Uygun bir uzmana bağlanılıyor...</Text>
          <Text style={styles.connectingSubText}>Lütfen bekleyin (Yüz animasyonu yükleniyor)</Text>
        </View>
      ) : (
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.chatContainer}
        >
          <View style={styles.videoPlaceholder}>
            {Platform.OS === 'web' ? (
              <iframe 
                ref={iframeRef}
                srcDoc={AVATAR_HTML} 
                style={{width: '100%', height: '100%', border: 'none'}} 
                allow="autoplay; speaker"
              />
            ) : (
              <WebView 
                ref={webViewRef}
                source={{ html: AVATAR_HTML }} 
                style={{ flex: 1, backgroundColor: 'transparent' }} 
                scrollEnabled={false}
              />
            )}
          </View>
          
          <ScrollView ref={scrollViewRef} contentContainerStyle={styles.messagesList}>
            {messages.map(msg => (
              <View key={msg.id} style={[
                styles.messageBubble, 
                msg.sender === 'user' ? styles.messageUser : styles.messageExpert
              ]}>
                <Text style={[
                  styles.messageText,
                  msg.sender === 'user' ? styles.messageTextUser : styles.messageTextExpert
                ]}>
                  {msg.text}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Uzmana sorunuzu yazın..."
              value={inputText}
              onChangeText={setInputText}
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Text style={styles.sendButtonText}>Gönder</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  closeBtn: {
    padding: 8,
  },
  closeBtnText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  connectingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  connectingSubText: {
    marginTop: 8,
    fontSize: 14,
    color: '#8E8E93',
  },
  chatContainer: {
    flex: 1,
  },
  videoPlaceholder: {
    height: 300,
    backgroundColor: '#e5e5ea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 32,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  messageExpert: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
  },
  messageUser: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageTextExpert: {
    color: '#1C1C1E',
  },
  messageTextUser: {
    color: '#ffffff',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#007AFF',
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
});
