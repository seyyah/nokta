import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, radius, spacing, typography } from '@/constants/theme';

export type MessageBubbleProps = {
  role: 'user' | 'ai';
  text: string;
};

export function MessageBubble({ role, text }: MessageBubbleProps) {
  const isUser = role === 'user';
  return (
    <View style={[styles.row, isUser ? styles.rowRight : styles.rowLeft]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAi]}>
        <Text style={[styles.text, isUser ? styles.textUser : styles.textAi]}>
          {text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  rowLeft: { alignItems: 'flex-start' },
  rowRight: { alignItems: 'flex-end' },
  bubble: {
    maxWidth: '84%',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  bubbleUser: {
    backgroundColor: colors.bubbleUser,
    borderBottomRightRadius: radius.sm,
  },
  bubbleAi: {
    backgroundColor: colors.bubbleAi,
    borderBottomLeftRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: {
    fontFamily: typography.body,
    fontSize: fontSize.md,
    lineHeight: 22,
  },
  textUser: { color: '#FFFFFF' },
  textAi: { color: colors.text },
});
