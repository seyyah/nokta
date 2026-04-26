import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Tag } from 'lucide-react-native';

export interface Idea {
  id: string;
  text: string;
  tags?: string[];
  isActuallySlop?: boolean;
  reason?: string;
}

interface IdeaCardProps {
  idea: Idea;
}

export default function IdeaCard({ idea }: IdeaCardProps) {
  return (
    <BlurView intensity={80} tint="dark" style={styles.card}>
      {/* Decorative Watermarks (No overlap over text) */}
      <View style={styles.watermarkContainer} pointerEvents="none">
        <Text style={styles.watermarkText}>// PITCH_CAPTURE</Text>
        <Text style={styles.watermarkId}>{idea.id}</Text>
      </View>
      
      {/* Main Content fully centered */}
      <View style={styles.contentContainer}>
        <Text style={styles.text}>{idea.text}</Text>
      </View>

      {/* Footer Tags */}
      <View style={styles.footer}>
        <View style={styles.tagsContainer}>
          {idea.tags && idea.tags.length > 0 ? (
            idea.tags.map((tag, idx) => (
              <View key={idx} style={styles.badge}>
                <Tag color="#00E5FF" size={12} style={styles.badgeIcon} />
                <Text style={styles.badgeText}>{tag}</Text>
              </View>
            ))
          ) : (
            <View style={styles.badge}>
              <Tag color="#555" size={12} style={styles.badgeIcon} />
              <Text style={[styles.badgeText, { color: '#555' }]}>Uncategorized</Text>
            </View>
          )}
        </View>
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 480,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 24,
    overflow: 'hidden', 
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 10,
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 10, 10, 0.85)',
  },
  watermarkContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    opacity: 0.15, // Solved visual overlap clutter
  },
  watermarkText: {
    fontFamily: 'monospace',
    color: '#00FF41',
    fontSize: 12,
  },
  watermarkId: {
    fontFamily: 'monospace',
    color: '#666',
    fontSize: 10,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 40,
  },
  text: {
    fontSize: 26,
    color: '#FFFFFF',
    lineHeight: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  badgeIcon: {
    marginRight: 4,
  },
  badgeText: {
    color: '#00E5FF',
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  }
});
