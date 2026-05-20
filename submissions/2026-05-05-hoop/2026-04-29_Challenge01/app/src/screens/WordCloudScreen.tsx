import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { useSession, session } from '@/state/sessionStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// AI-generated keywords based on answers (mock for now, can be enhanced with real AI)
const generateKeywords = (answers: Record<string, string>): string[] => {
  const allText = Object.values(answers).join(' ').toLowerCase();
  const words = allText.split(/\s+/).filter(w => w.length > 3);
  
  // Extract unique meaningful words (simplified)
  const uniqueWords = [...new Set(words)];
  
  // Add some AI-suggested related keywords
  const aiSuggestions = [
    'kullanıcı deneyimi',
    'ölçeklenebilirlik',
    'performans',
    'güvenlik',
    'entegrasyon',
    'veri akışı',
    'mimari',
    'API',
    'veritabanı',
    'arayüz',
    'optimizasyon',
    'test',
    'deployment',
    'monitoring',
    'analytics',
  ];
  
  return [...uniqueWords.slice(0, 15), ...aiSuggestions].slice(0, 25);
};

interface KeywordNode {
  id: string;
  text: string;
  x: number;
  y: number;
  size: number;
  color: string;
  connections: string[];
}

const COLORS = ['#00E5FF', '#FF6B9D', '#FFC107', '#4CAF50', '#9C27B0', '#FF5722'];

export default function WordCloudScreen() {
  const s = useSession();
  const router = useRouter();
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [keywords] = useState<string[]>(generateKeywords(s.answers));
  const [nodes, setNodes] = useState<KeywordNode[]>([]);
  const [showMindMap, setShowMindMap] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Generate random positions for word cloud
    const generatedNodes: KeywordNode[] = keywords.map((keyword, idx) => ({
      id: `node-${idx}`,
      text: keyword,
      x: Math.random() * (SCREEN_WIDTH - 120) + 20,
      y: Math.random() * 400 + 50,
      size: Math.random() * 12 + 14,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      connections: [],
    }));
    setNodes(generatedNodes);

    // Pulse animation for selected keywords
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleKeywordPress = (keyword: string) => {
    if (selectedKeywords.includes(keyword)) {
      setSelectedKeywords(selectedKeywords.filter(k => k !== keyword));
    } else {
      setSelectedKeywords([...selectedKeywords, keyword]);
      
      // Auto-suggest related keywords (simple proximity-based)
      const clickedNode = nodes.find(n => n.text === keyword);
      if (clickedNode && selectedKeywords.length < 3) {
        const nearby = nodes
          .filter(n => {
            const distance = Math.sqrt(
              Math.pow(n.x - clickedNode.x, 2) + Math.pow(n.y - clickedNode.y, 2)
            );
            return distance < 150 && n.text !== keyword && !selectedKeywords.includes(n.text);
          })
          .slice(0, 2)
          .map(n => n.text);
        
        // Highlight suggestions with a delay
        setTimeout(() => {
          setNodes(nodes.map(n => 
            nearby.includes(n.text) 
              ? { ...n, color: '#FFD700' } 
              : n
          ));
        }, 300);
      }
    }
  };

  const handleContinue = () => {
    session.set({ selectedKeywords });
    router.push('/content-builder');
  };

  const toggleView = () => {
    setShowMindMap(!showMindMap);
  };

  const renderWordCloud = () => (
    <View style={styles.cloudContainer}>
      {nodes.map((node) => {
        const isSelected = selectedKeywords.includes(node.text);
        return (
          <Animated.View
            key={node.id}
            style={[
              styles.wordNode,
              {
                position: 'absolute',
                left: node.x,
                top: node.y,
                transform: [{ scale: isSelected ? pulseAnim : 1 }],
              },
            ]}
          >
            <Pressable
              onPress={() => handleKeywordPress(node.text)}
              style={[
                styles.wordButton,
                isSelected && styles.wordButtonSelected,
                { borderColor: node.color },
              ]}
            >
              <Text
                style={[
                  styles.wordText,
                  { fontSize: node.size, color: isSelected ? node.color : '#aaa' },
                ]}
              >
                {node.text}
              </Text>
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );

  const renderMindMap = () => {
    // Simple hierarchical mind map layout
    const centerX = SCREEN_WIDTH / 2;
    const centerY = 200;
    const radius = 120;

    return (
      <View style={styles.mindMapContainer}>
        {/* Center node */}
        <View style={[styles.centerNode, { left: centerX - 60, top: centerY - 30 }]}>
          <Text style={styles.centerNodeText}>Nokta Spec</Text>
        </View>

        {/* Surrounding nodes */}
        {nodes.slice(0, 8).map((node, idx) => {
          const angle = (idx / 8) * 2 * Math.PI;
          const x = centerX + radius * Math.cos(angle) - 40;
          const y = centerY + radius * Math.sin(angle) - 20;
          const isSelected = selectedKeywords.includes(node.text);

          return (
            <View key={node.id}>
              {/* Connection line */}
              <View
                style={[
                  styles.connectionLine,
                  {
                    position: 'absolute',
                    left: centerX,
                    top: centerY,
                    width: Math.sqrt(Math.pow(x + 40 - centerX, 2) + Math.pow(y + 20 - centerY, 2)),
                    transform: [
                      { rotate: `${Math.atan2(y + 20 - centerY, x + 40 - centerX)}rad` },
                    ],
                    opacity: isSelected ? 1 : 0.3,
                  },
                ]}
              />
              
              {/* Node */}
              <Pressable
                onPress={() => handleKeywordPress(node.text)}
                style={[
                  styles.mindMapNode,
                  { left: x, top: y },
                  isSelected && styles.mindMapNodeSelected,
                ]}
              >
                <Text style={[styles.mindMapNodeText, isSelected && { color: node.color }]}>
                  {node.text}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🧠 Kelime Evreni</Text>
        <Text style={styles.subtitle}>
          Spec'ini şekillendirecek anahtar kelimeleri seç
        </Text>
      </View>

      {/* View Toggle */}
      <View style={styles.toggleContainer}>
        <Pressable
          style={[styles.toggleButton, !showMindMap && styles.toggleButtonActive]}
          onPress={() => setShowMindMap(false)}
        >
          <Text style={[styles.toggleText, !showMindMap && styles.toggleTextActive]}>
            ☁️ Kelime Bulutu
          </Text>
        </Pressable>
        <Pressable
          style={[styles.toggleButton, showMindMap && styles.toggleButtonActive]}
          onPress={() => setShowMindMap(true)}
        >
          <Text style={[styles.toggleText, showMindMap && styles.toggleTextActive]}>
            🗺️ Mind Map
          </Text>
        </Pressable>
      </View>

      {/* Selected Keywords Bar */}
      <View style={styles.selectedBar}>
        <Text style={styles.selectedLabel}>Seçilenler ({selectedKeywords.length}):</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectedScroll}>
          {selectedKeywords.map((keyword, idx) => (
            <Pressable
              key={idx}
              style={styles.selectedChip}
              onPress={() => handleKeywordPress(keyword)}
            >
              <Text style={styles.selectedChipText}>{keyword}</Text>
              <Text style={styles.selectedChipClose}>×</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {showMindMap ? renderMindMap() : renderWordCloud()}
      </ScrollView>

      {/* AI Suggestions */}
      {selectedKeywords.length > 0 && selectedKeywords.length < 5 && (
        <View style={styles.suggestionsBox}>
          <Text style={styles.suggestionsTitle}>💡 AI Önerisi</Text>
          <Text style={styles.suggestionsText}>
            {selectedKeywords.length === 1 && 'Harika başlangıç! 2-3 kelime daha seçersen daha zengin bir spec oluşur.'}
            {selectedKeywords.length === 2 && 'İyi gidiyorsun! Bir kelime daha ekle ve ilişkileri güçlendir.'}
            {selectedKeywords.length >= 3 && 'Mükemmel! Artık içerik üretmeye hazırsın.'}
          </Text>
        </View>
      )}

      {/* Navigation */}
      <View style={styles.navigation}>
        <Button variant="ghost" onPress={() => router.back()} style={styles.backButton}>
          ← Sorulara Dön
        </Button>
        <Button
          onPress={handleContinue}
          disabled={selectedKeywords.length < 3}
          style={[styles.continueButton, selectedKeywords.length >= 3 && styles.continueButtonActive]}
        >
          İçerik Üret →
        </Button>
      </View>

      {/* Helper Text */}
      <Text style={styles.helperText}>
        💡 İpucu: Kelimelere tıklayarak seç, tekrar tıklayarak kaldır
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    color: '#aaa',
    fontSize: 14,
  },
  toggleContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  toggleButtonActive: {
    borderColor: '#00E5FF',
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
  },
  toggleText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#00E5FF',
  },
  selectedBar: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  selectedLabel: {
    color: '#00E5FF',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  selectedScroll: {
    flexDirection: 'row',
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#00E5FF',
  },
  selectedChipText: {
    color: '#00E5FF',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  selectedChipClose: {
    color: '#00E5FF',
    fontSize: 16,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    minHeight: 500,
  },
  cloudContainer: {
    height: 500,
    position: 'relative',
  },
  wordNode: {
    position: 'absolute',
  },
  wordButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: '#141414',
  },
  wordButtonSelected: {
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
  },
  wordText: {
    fontWeight: '600',
  },
  mindMapContainer: {
    height: 500,
    position: 'relative',
  },
  centerNode: {
    position: 'absolute',
    width: 120,
    height: 60,
    backgroundColor: '#00E5FF',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  centerNodeText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '800',
  },
  connectionLine: {
    height: 2,
    backgroundColor: '#333',
    position: 'absolute',
    transformOrigin: 'left center',
  },
  mindMapNode: {
    position: 'absolute',
    width: 80,
    height: 40,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mindMapNodeSelected: {
    borderColor: '#00E5FF',
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
  },
  mindMapNodeText: {
    color: '#aaa',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  suggestionsBox: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(0, 229, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  suggestionsTitle: {
    color: '#00E5FF',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  suggestionsText: {
    color: '#aaa',
    fontSize: 12,
    lineHeight: 18,
  },
  navigation: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 8,
  },
  backButton: {
    flex: 1,
  },
  continueButton: {
    flex: 2,
    backgroundColor: '#333',
  },
  continueButtonActive: {
    backgroundColor: '#00E5FF',
  },
  helperText: {
    color: '#666',
    fontSize: 11,
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});
