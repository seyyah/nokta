import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Keyboard } from 'react-native';

export default function InputSection({ onSubmit, isLoading }) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (text.trim().length === 0) return;
    Keyboard.dismiss();
    onSubmit(text);
  };

  const isEmpty = text.trim().length === 0;
  const isDisabled = isLoading || isEmpty;

  const getButtonStyle = () => {
    if (isLoading) return 'bg-black border-[2px] border-black';
    if (isEmpty) return 'bg-gray-100 border-[2px] border-black/5';
    return 'bg-black border-[2px] border-black';
  };

  const getTextStyle = () => {
    if (isLoading) return 'text-white';
    if (isEmpty) return 'text-gray-400';
    return 'text-white';
  };

  return (
    <View className="w-full flex-col gap-4">
      <TextInput
        className="bg-white border-[2px] border-black/10 text-black p-6 min-h-[160px] max-h-[300px] text-[17px] font-medium w-full rounded-2xl"
        multiline
        placeholder="Paste your raw, messy notes..."
        placeholderTextColor="#a1a1aa"
        value={text}
        onChangeText={setText}
        textAlignVertical="top"
        editable={!isLoading}
      />

      <TouchableOpacity
        className={`w-full h-16 flex-row justify-center items-center rounded-2xl ${getButtonStyle()}`}
        onPress={handleSubmit}
        disabled={isDisabled}
        activeOpacity={0.85}
      >
        {isLoading ? (
          <ActivityIndicator color="white" style={{ marginRight: 10 }} />
        ) : null}

        <Text className={`font-black text-[13px] tracking-[0.15em] uppercase ${getTextStyle()}`}>
          {isLoading ? 'Processing' : 'Analyze Data'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
