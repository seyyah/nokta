/**
 * ChatBubble.tsx
 * Chat ekranındaki mesaj balonları.
 * Desteklenen tipler: user | ai | hitl_pending | hitl_answered | knowledge
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Bot, User, Clock, CheckCircle2, BookOpen } from 'lucide-react-native';

export type MessageRole = 'user' | 'ai' | 'hitl_pending' | 'hitl_answered' | 'knowledge';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  hitlId?: string;
  expertAnswer?: string;
  knowledgeSource?: boolean;
}

interface ChatBubbleProps {
  message: Message;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(message.role === 'user' ? 30 : -30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <Animated.View style={[styles.row, styles.rowRight, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
        <View style={styles.userBubble}>
          <Text style={styles.userText}>{message.content}</Text>
        </View>
        <View style={styles.avatarSmall}>
          <User color="#000" size={14} />
        </View>
      </Animated.View>
    );
  }

  if (message.role === 'hitl_pending') {
    return (
      <Animated.View style={[styles.row, styles.rowLeft, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
        <View style={styles.avatarSmall}>
          <Clock color="#FF9800" size={14} />
        </View>
        <View style={styles.hitlPendingBubble}>
          <View style={styles.hitlHeader}>
            <Clock color="#FF9800" size={16} />
            <Text style={styles.hitlTitle}>UZMAN İNCELEMESİNDE</Text>
          </View>
          <Text style={styles.hitlSubtext}>
            Bu soru, doğruluğunu garanti etmek için bir uzmana iletildi. Cevap geldiğinde burada görünecek.
          </Text>
          <PulsingDot />
        </View>
      </Animated.View>
    );
  }

  if (message.role === 'hitl_answered') {
    return (
      <Animated.View style={[styles.row, styles.rowLeft, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
        <View style={styles.avatarSmall}>
          <CheckCircle2 color="#00FF41" size={14} />
        </View>
        <View style={styles.hitlAnsweredBubble}>
          <View style={styles.hitlHeader}>
            <CheckCircle2 color="#00FF41" size={16} />
            <Text style={[styles.hitlTitle, { color: '#00FF41' }]}>YETKİLİ CEVAP</Text>
          </View>
          <Text style={styles.aiText}>{message.expertAnswer}</Text>
        </View>
      </Animated.View>
    );
  }

  if (message.role === 'knowledge') {
    return (
      <Animated.View style={[styles.row, styles.rowLeft, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
        <View style={styles.avatarSmall}>
          <BookOpen color="#A78BFA" size={14} />
        </View>
        <View style={styles.knowledgeBubble}>
          <View style={styles.hitlHeader}>
            <BookOpen color="#A78BFA" size={16} />
            <Text style={[styles.hitlTitle, { color: '#A78BFA' }]}>BİLGİ TABANINDAN</Text>
          </View>
          <Text style={styles.aiText}>{message.content}</Text>
        </View>
      </Animated.View>
    );
  }

  // Default: AI mesajı
  return (
    <Animated.View style={[styles.row, styles.rowLeft, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
      <View style={styles.avatarSmall}>
        <Bot color="#00E5FF" size={14} />
      </View>
      <View style={styles.aiBubble}>
        <Text style={styles.aiText}>{message.content}</Text>
      </View>
    </Animated.View>
  );
}

/** Küçük animasyonlu nokta — "bekleniyor" göstergesi */
function PulsingDot() {
  const pulse = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <View style={{ flexDirection: 'row', marginTop: 10, gap: 6 }}>
      {[0, 1, 2].map(i => (
        <Animated.View
          key={i}
          style={{
            width: 8, height: 8, borderRadius: 4,
            backgroundColor: '#FF9800',
            opacity: pulse,
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'flex-end',
    gap: 8,
  },
  rowRight: {
    justifyContent: 'flex-end',
  },
  rowLeft: {
    justifyContent: 'flex-start',
  },
  avatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  userBubble: {
    maxWidth: '75%',
    backgroundColor: '#00E5FF',
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userText: {
    color: '#000',
    fontFamily: 'monospace',
    fontSize: 14,
    lineHeight: 20,
  },
  aiBubble: {
    maxWidth: '78%',
    backgroundColor: '#111',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  aiText: {
    color: '#E0E0E0',
    fontFamily: 'monospace',
    fontSize: 14,
    lineHeight: 22,
  },
  hitlPendingBubble: {
    maxWidth: '78%',
    backgroundColor: 'rgba(255, 152, 0, 0.08)',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  hitlAnsweredBubble: {
    maxWidth: '78%',
    backgroundColor: 'rgba(0, 255, 65, 0.06)',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#00FF41',
  },
  knowledgeBubble: {
    maxWidth: '78%',
    backgroundColor: 'rgba(167, 139, 250, 0.08)',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#A78BFA',
  },
  hitlHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  hitlTitle: {
    color: '#FF9800',
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  hitlSubtext: {
    color: '#999',
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 20,
  },
});
