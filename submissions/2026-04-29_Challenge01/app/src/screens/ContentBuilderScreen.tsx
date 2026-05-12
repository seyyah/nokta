import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { useSession, session } from '@/state/sessionStore';
import { emitSpec } from '@/services/orchestrator';
import { embed } from '@/services/embeddings';
import { saveHistory } from '@/services/storage';
import { AllProvidersFailedError } from '@/types';

type ContentLevel = 'word' | 'sentence' | 'paragraph' | 'section';

interface ContentBlock {
  id: string;
  level: ContentLevel;
  content: string;
  keywords: string[];
  expanded: boolean;
  aiGenerated: boolean;
}

const LEVEL_CONFIG = {
  word: { emoji: '🔤', label: 'Kelime', color: '#00E5FF' },
  sentence: { emoji: '📝', label: 'Cümle', color: '#FF6B9D' },
  paragraph: { emoji: '📄', label: 'Paragraf', color: '#FFC107' },
  section: { emoji: '📚', label: 'Bölüm', color: '#4CAF50' },
};

export default function ContentBuilderScreen() {
  const s = useSession();
  const router = useRouter();
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [currentLevel, setCurrentLevel] = useState<ContentLevel>('word');
  const [loading, setLoading] = useState(false);
  const [generatingBlockId, setGeneratingBlockId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Initialize with selected keywords as word-level blocks
    const initialBlocks: ContentBlock[] = (s.selectedKeywords || []).map((keyword, idx) => ({
      id: `word-${idx}`,
      level: 'word',
      content: keyword,
      keywords: [keyword],
      expanded: false,
      aiGenerated: false,
    }));
    setBlocks(initialBlocks);

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const expandBlock = async (blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block || block.expanded) return;

    setGeneratingBlockId(blockId);
    
    // Simulate AI generation (in real app, call AI service)
    await new Promise(resolve => setTimeout(resolve, 1500));

    const nextLevel: ContentLevel = 
      block.level === 'word' ? 'sentence' :
      block.level === 'sentence' ? 'paragraph' :
      block.level === 'paragraph' ? 'section' : 'section';

    let generatedContent = '';
    
    switch (nextLevel) {
      case 'sentence':
        generatedContent = `${block.content} kullanıcı deneyimini iyileştirmek için kritik bir faktördür.`;
        break;
      case 'paragraph':
        generatedContent = `${block.content}. Bu yaklaşım, sistemin ölçeklenebilirliğini artırırken performans optimizasyonu sağlar. Kullanıcı etkileşimlerini analiz ederek, daha iyi bir deneyim sunabiliriz.`;
        break;
      case 'section':
        generatedContent = `## ${block.keywords[0]}\n\n${block.content}\n\nBu bölümde, ${block.keywords[0]} konusunu detaylı olarak ele alacağız. Teknik mimari, implementasyon detayları ve best practice'ler üzerinde duracağız.\n\n### Alt Başlık\n\nDetaylı açıklama ve örnekler...`;
        break;
    }

    const newBlock: ContentBlock = {
      id: `${nextLevel}-${Date.now()}`,
      level: nextLevel,
      content: generatedContent,
      keywords: block.keywords,
      expanded: false,
      aiGenerated: true,
    };

    setBlocks(prev => [
      ...prev.map(b => b.id === blockId ? { ...b, expanded: true } : b),
      newBlock,
    ]);
    setGeneratingBlockId(null);
  };

  const editBlock = (blockId: string, newContent: string) => {
    setBlocks(prev => prev.map(b => 
      b.id === blockId ? { ...b, content: newContent, aiGenerated: false } : b
    ));
  };

  const deleteBlock = (blockId: string) => {
    setBlocks(prev => prev.filter(b => b.id !== blockId));
  };

  const mergeBlocks = () => {
    // Merge all blocks into a coherent spec
    const sections = blocks
      .filter(b => b.level === 'section')
      .map(b => b.content)
      .join('\n\n---\n\n');
    
    const paragraphs = blocks
      .filter(b => b.level === 'paragraph')
      .map(b => b.content)
      .join('\n\n');
    
    return sections || paragraphs || blocks.map(b => b.content).join('\n\n');
  };

  const handleGenerateSpec = async () => {
    setError(null);
    setLoading(true);
    
    try {
      // Merge user-built content with AI-generated spec
      const userContent = mergeBlocks();
      const enhancedIdea = `${s.idea}\n\nKullanıcı Notları:\n${userContent}`;
      
      const result = await emitSpec(enhancedIdea, s.questions, s.answers);
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const entry = { ...result.data, id, embedding: embed(result.data.markdown) };
      await saveHistory(entry);
      
      session.set({ 
        spec: result.data, 
        provider: result.provider, 
        attempts: result.attempts,
        userGeneratedContent: userContent,
      });
      
      router.push('/spec');
    } catch (e) {
      if (e instanceof AllProvidersFailedError) {
        setError(`Tüm provider'lar başarısız: ${JSON.stringify(e.errors)}`);
      } else {
        setError(e instanceof Error ? e.message : String(e));
      }
    } finally {
      setLoading(false);
    }
  };

  const renderBlock = (block: ContentBlock) => {
    const config = LEVEL_CONFIG[block.level];
    const isGenerating = generatingBlockId === block.id;

    return (
      <Animated.View
        key={block.id}
        style={[
          styles.blockContainer,
          { opacity: fadeAnim },
          { borderLeftColor: config.color },
        ]}
      >
        {/* Block Header */}
        <View style={styles.blockHeader}>
          <View style={styles.blockHeaderLeft}>
            <Text style={styles.blockEmoji}>{config.emoji}</Text>
            <Text style={[styles.blockLabel, { color: config.color }]}>
              {config.label}
            </Text>
            {block.aiGenerated && (
              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>AI</Text>
              </View>
            )}
          </View>
          <Pressable onPress={() => deleteBlock(block.id)} style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>×</Text>
          </Pressable>
        </View>

        {/* Block Content */}
        <TextInput
          style={[styles.blockContent, { fontSize: block.level === 'word' ? 16 : 14 }]}
          multiline
          value={block.content}
          onChangeText={(text) => editBlock(block.id, text)}
          placeholder="İçerik ekle..."
          placeholderTextColor="#666"
        />

        {/* Block Actions */}
        <View style={styles.blockActions}>
          {!block.expanded && block.level !== 'section' && (
            <Pressable
              style={[styles.actionButton, isGenerating && styles.actionButtonDisabled]}
              onPress={() => expandBlock(block.id)}
              disabled={isGenerating}
            >
              <Text style={styles.actionButtonText}>
                {isGenerating ? '⏳ Üretiliyor...' : `↗️ ${LEVEL_CONFIG[
                  block.level === 'word' ? 'sentence' :
                  block.level === 'sentence' ? 'paragraph' : 'section'
                ].label}'ye Genişlet`}
              </Text>
            </Pressable>
          )}
          
          {block.keywords.length > 0 && (
            <View style={styles.keywordTags}>
              {block.keywords.map((kw, idx) => (
                <View key={idx} style={styles.keywordTag}>
                  <Text style={styles.keywordTagText}>{kw}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  const wordCount = blocks.reduce((sum, b) => sum + b.content.split(/\s+/).length, 0);
  const canGenerate = blocks.length > 0 && wordCount > 20;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>✨ İçerik Atölyesi</Text>
        <Text style={styles.subtitle}>
          Kelimelerden spec'e doğru yolculuk
        </Text>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{blocks.length}</Text>
          <Text style={styles.statLabel}>Blok</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{wordCount}</Text>
          <Text style={styles.statLabel}>Kelime</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {blocks.filter(b => b.level === 'section').length}
          </Text>
          <Text style={styles.statLabel}>Bölüm</Text>
        </View>
      </View>

      {/* Level Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.levelFilter}>
        {(['word', 'sentence', 'paragraph', 'section'] as ContentLevel[]).map(level => {
          const count = blocks.filter(b => b.level === level).length;
          const config = LEVEL_CONFIG[level];
          return (
            <Pressable
              key={level}
              style={[
                styles.levelChip,
                currentLevel === level && styles.levelChipActive,
                { borderColor: config.color },
              ]}
              onPress={() => setCurrentLevel(level)}
            >
              <Text style={styles.levelChipEmoji}>{config.emoji}</Text>
              <Text style={[styles.levelChipText, currentLevel === level && { color: config.color }]}>
                {config.label} ({count})
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Content Blocks */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {blocks
          .filter(b => currentLevel === 'word' || b.level === currentLevel)
          .map(renderBlock)}
        
        {blocks.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Henüz içerik yok. Kelime bulutu ekranından başla!
            </Text>
          </View>
        )}
      </ScrollView>

      {/* AI Assistant Tip */}
      {blocks.length > 0 && blocks.length < 5 && (
        <View style={styles.tipBox}>
          <Text style={styles.tipText}>
            💡 İpucu: Blokları genişleterek daha detaylı içerik oluştur. Her seviye daha fazla derinlik katar.
          </Text>
        </View>
      )}

      {/* Navigation */}
      <View style={styles.navigation}>
        <Button variant="ghost" onPress={() => router.back()} style={styles.backButton}>
          ← Kelime Bulutuna Dön
        </Button>
        <Button
          onPress={handleGenerateSpec}
          disabled={!canGenerate || loading}
          style={[styles.generateButton, canGenerate && styles.generateButtonActive]}
        >
          {loading ? 'Spec Üretiliyor...' : 'Final Spec Üret →'}
        </Button>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
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
  statsBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 16,
  },
  stat: {
    flex: 1,
    backgroundColor: '#141414',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222',
  },
  statValue: {
    color: '#00E5FF',
    fontSize: 24,
    fontWeight: '800',
  },
  statLabel: {
    color: '#888',
    fontSize: 11,
    marginTop: 2,
  },
  levelFilter: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  levelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: '#141414',
    marginRight: 8,
  },
  levelChipActive: {
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
  },
  levelChipEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  levelChipText: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  blockContainer: {
    backgroundColor: '#141414',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#222',
  },
  blockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  blockHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  blockEmoji: {
    fontSize: 16,
  },
  blockLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  aiBadge: {
    backgroundColor: 'rgba(0, 229, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  aiBadgeText: {
    color: '#00E5FF',
    fontSize: 9,
    fontWeight: '800',
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 20,
    fontWeight: '700',
  },
  blockContent: {
    color: '#fff',
    minHeight: 40,
    lineHeight: 22,
    marginBottom: 12,
  },
  blockActions: {
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    color: '#00E5FF',
    fontSize: 12,
    fontWeight: '600',
  },
  keywordTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  keywordTag: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  keywordTagText: {
    color: '#888',
    fontSize: 10,
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  tipBox: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  tipText: {
    color: '#FFC107',
    fontSize: 12,
    lineHeight: 18,
  },
  navigation: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  backButton: {
    flex: 1,
  },
  generateButton: {
    flex: 2,
    backgroundColor: '#333',
  },
  generateButtonActive: {
    backgroundColor: '#4CAF50',
  },
  error: {
    color: '#ef4444',
    fontSize: 13,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
});
