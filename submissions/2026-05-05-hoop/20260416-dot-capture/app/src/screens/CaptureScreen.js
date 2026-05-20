import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, Dimensions, Animated, PanResponder } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import AnimatedBackground from '../components/AnimatedBackground';
import NodeGraph from '../components/NodeGraph';
import NoktaMascot2D from '../components/NoktaMascot2D';
import { Voice } from '../utils/Voice';

const { width, height } = Dimensions.get('window');

const MOCK_DICTIONARY = {
  "araba": ["galeri", "ikinci el", "ekspertiz", "satış", "servis"],
  "ikinci el": ["pazaryeri", "güven", "ilan", "değerleme"],
  "ilan": ["fotoğraf", "ai destekli", "açıklama", "vitrin"],
  "yapay zeka": ["otomasyon", "hız", "veri", "tahmin", "analiz"],
  "galeri": ["müşteri", "stok yönetimi", "kredi", "randevu"],
  "pazaryeri": ["komisyon", "satıcılar", "alıcılar", "ödeme"]
};
const FALLBACK_WORDS = ["sistem", "mobil", "hızlı", "AI", "akıllı", "panel"];

const generateRandomPosition = (existingNodes) => {
  const paddingX = 40;
  const graphWidth = width - 40;
  const graphHeight = 300;
  const MIN_DISTANCE = 80; // Min pixels between nodes
  
  for (let i = 0; i < 50; i++) {
    const rx = paddingX + Math.random() * (graphWidth - paddingX * 2);
    const ry = 30 + Math.random() * (graphHeight - 60);

    // Check collision
    let collision = false;
    for (const node of existingNodes) {
      const dx = rx - node.x;
      const dy = ry - node.y;
      if (Math.sqrt(dx * dx + dy * dy) < MIN_DISTANCE) {
        collision = true;
        break;
      }
    }
    
    if (!collision) {
      return { x: rx, y: ry };
    }
  }
  
  // fallback if couldn't find empty spot
  return {
    x: paddingX + Math.random() * (graphWidth - paddingX * 2),
    y: 30 + Math.random() * (graphHeight - 60),
  };
};

export default function CaptureScreen({ navigation }) {
  const [keyword, setKeyword] = useState('');
  const [nodes, setNodes] = useState([]); // confirmed
  const [suggestions, setSuggestions] = useState([]); // hover nodes
  const [mascotState, setMascotState] = useState('idle');

  // DRAGGABLE LOGIC
  const pan = useRef(new Animated.ValueXY({ x: width - 130, y: height * 0.35 })).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only set pan responder if movement is significant (avoids blocking clicks)
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      }
    })
  ).current;

  useEffect(() => {
    // Welcome greeting with a slight delay to ensure TTS is ready
    const timer = setTimeout(() => {
      const greet = "Merhaba, ben Nokta! Fikirlerini bana anlatmak için üzerime tıklayabilirsin.";
      Voice.speak(greet, 
        () => setMascotState('speaking'),
        () => setMascotState('idle')
      );
    }, 1000);
    return () => {
      clearTimeout(timer);
      Voice.stop();
    };
  }, []);

  const triggerMascotAction = (type = 'love') => {
    setMascotState(type);
    setTimeout(() => setMascotState('idle'), 1500);
  };

  const addConfirmedNode = (text) => {
    const parentId = nodes.length > 0 ? nodes[nodes.length - 1].id : null;
    const pos = generateRandomPosition(nodes);
    const newNode = { 
      id: Date.now().toString() + Math.random(), 
      text: text.toLowerCase(), 
      x: pos.x, 
      y: pos.y,
      parentId: parentId
    };
    
    // Auto generate suggestions based on this node
    let related = MOCK_DICTIONARY[text.toLowerCase()] || [...FALLBACK_WORDS].sort(() => 0.5 - Math.random()).slice(0, 4);
    
    // We only take up to 4 to not clutter
    related = related.slice(0, 4);
    
    const newSuggestions = related.map(s => {
      const sp = generateRandomPosition([...nodes, newNode]);
      return {
        id: 'sugg_' + Date.now().toString() + Math.random(),
        text: s,
        x: sp.x,
        y: sp.y,
        parentId: newNode.id
      };
    });

    setNodes(prev => [...prev, newNode]);
    // Clear old suggestions, show new ones branch from this
    setSuggestions(newSuggestions);
    setKeyword('');
    triggerMascotAction('love');
    Keyboard.dismiss();
  };

  const handleManualAdd = () => {
    if (keyword.trim().length > 0) {
      addConfirmedNode(keyword.trim());
    }
  };

  const onSuggestionTap = (suggestion) => {
    addConfirmedNode(suggestion.text);
    triggerMascotAction('speaking');
  };

  const handleNext = () => {
    if (nodes.length > 0) {
      const ideaDump = nodes.map(n => n.text).join(', ');
      navigation.navigate('Processing', { ideaDump });
    }
  };

  return (
    <View style={styles.container}>
      <AnimatedBackground />
      
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView 
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.dotIcon} />
              <Text style={styles.logoText}>NOKTA_AĞI</Text>
            </View>

            <View style={styles.graphSection}>
              <View style={styles.pseudo3DWrapper}>
                <NodeGraph nodes={nodes} />
              </View>
              
              {nodes.length === 0 ? (
                 <Text style={styles.helperText}>Ağı başlatmak için temel bir kelime girin.</Text>
              ) : (
                 <Text style={styles.helperText}>{nodes.length} Nöron. Seçtikçe ağ 3D boyutunda genişler.</Text>
              )}
            </View>

            <View style={styles.inputSection}>
              {/* Suggestion Chips */}
              {suggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                   <Text style={styles.suggestTitle}>İlişkili Bağlar:</Text>
                   <View style={styles.suggestionsList}>
                     {suggestions.map(sugg => (
                       <TouchableOpacity key={sugg.id} onPress={() => onSuggestionTap(sugg)} style={styles.suggChip}>
                         <Text style={styles.suggChipText}>{sugg.text}</Text>
                       </TouchableOpacity>
                     ))}
                   </View>
                </View>
              )}

              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="örn: araba, yapay zeka"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={keyword}
                  onChangeText={setKeyword}
                  onSubmitEditing={handleManualAdd}
                  blurOnSubmit={false}
                  selectionColor="#06b6d4"
                />
                <TouchableOpacity onPress={handleManualAdd} style={styles.addBtn}>
                  <Ionicons name="git-branch-outline" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              {nodes.length >= 2 && (
                <TouchableOpacity onPress={handleNext} activeOpacity={0.8} style={styles.buttonWrapper}>
                  <BlurView intensity={40} tint="light" style={styles.buttonBlur}>
                    <Ionicons name="flash" size={20} color="#a855f7" style={{marginRight: 8}} />
                    <Text style={styles.generateText}>Ağı Çözümle ({nodes.length} Nöron)</Text>
                  </BlurView>
                </TouchableOpacity>
              )}
            </View>
            
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
      
      {/* Nokta Mascot Companion - Draggable & Clickable */}
      <Animated.View 
        style={[styles.mascotContainer, pan.getLayout()]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Assistant', { mode: 'ai' })}
          style={{ alignItems: 'center' }}
        >
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>
              {nodes.length === 0 ? "Fikirlerini bana anlatabilirsin!" : "Detaylar için bana tıkla!"}
            </Text>
          </View>
          <NoktaMascot2D state={mascotState} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', 
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'center',
  },
  dotIcon: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#a855f7',
    marginRight: 8,
    shadowColor: '#a855f7',
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  logoText: {
    fontSize: 14,
    letterSpacing: 4,
    fontWeight: '900',
    color: '#a855f7',
  },
  graphSection: {
    alignItems: 'center',
  },
  helperText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 10,
  },
  inputSection: {
    width: '100%',
    paddingBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    paddingRight: 8,
  },
  input: {
    flex: 1,
    padding: 20,
    color: '#fff',
    fontSize: 18,
  },
  addBtn: {
    backgroundColor: 'rgba(168, 85, 247, 0.5)',
    padding: 10,
    borderRadius: 12,
  },
  pseudo3DWrapper: {
    // We add some space around so it doesn't clip when rotated
    padding: 20, 
  },
  suggestionsContainer: {
    marginBottom: 15,
  },
  suggestTitle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  suggestionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggChip: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  suggChipText: {
    color: '#06b6d4',
    fontSize: 13,
    fontWeight: '600'
  },
  buttonWrapper: {
    marginTop: 20,
    alignSelf: 'stretch',
    borderRadius: 16,
    overflow: 'hidden',
  },
  mascotContainer: {
    position: 'absolute',
    // Position handled by pan responder
    alignItems: 'center',
    transform: [{ scale: 0.8 }],
    zIndex: 999,
  },
  bubble: {
    backgroundColor: '#1a6bff',
    padding: 10,
    borderRadius: 15,
    borderBottomRightRadius: 2,
    marginBottom: 5,
    maxWidth: 150,
  },
  bubbleText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  buttonBlur: {
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  generateText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  }
});


