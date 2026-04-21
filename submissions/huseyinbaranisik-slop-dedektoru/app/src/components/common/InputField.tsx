import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { getColors } from '../../theme/colors';

interface InputFieldProps extends TextInputProps {
  label?: string;
  charCount?: number;
  maxCharCount?: number;
}

export function InputField({
  label,
  charCount,
  maxCharCount,
  style,
  ...props
}: InputFieldProps) {
  const { themeMode, accentColor } = useTheme();
  const colors = getColors(themeMode, accentColor);

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>}
      <View style={[styles.inputWrapper, { backgroundColor: colors.bgCard, borderColor: colors.bgCardBorder }]}>
        <TextInput
          style={[styles.input, { color: colors.textPrimary }, style]}
          placeholderTextColor={colors.textDim}
          textAlignVertical="top"
          {...props}
        />
        {maxCharCount !== undefined && charCount !== undefined && (
          <Text style={[styles.charCount, { color: colors.textDim }]}>
            {charCount}/{maxCharCount}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  inputWrapper: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  input: {
    fontSize: 15,
    minHeight: 140,
    lineHeight: 22,
  },
  charCount: {
    textAlign: 'right',
    fontSize: 11,
    marginTop: 8,
  },
});
