import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Keyboard } from 'react-native';

export default function InputSection({ onSubmit, isLoading }) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (text.trim().length === 0) return;
    Keyboard.dismiss();
    onSubmit(text);
  };

  const isDisabled = isLoading || text.trim().length === 0;

  return (
    <View className="w-full flex-col gap-4">
      <TextInput
        className="bg-white border-[2px] border-black/10 text-black p-6 min-h-[160px] max-h-[300px] text-[17px] font-medium w-full rounded-2xl shadow-sm"
        multiline
        placeholder="Paste your raw, messy notes..."
        placeholderTextColor="#a1a1aa"
        value={text}
        onChangeText={setText}
        textAlignVertical="top"
        editable={!isLoading}
      />
      
      <TouchableOpacity
        className={`w-full h-16 flex-row justify-center items-center active:scale-95 rounded-2xl ${
          isDisabled 
            ? 'bg-gray-100 border-[2px] border-black/5' 
            : 'bg-black border-[2px] border-black'
        }`}
        onPress={handleSubmit}
        disabled={isDisabled}
        activeOpacity={0.9}
      >
        {isLoading ? (
            <ActivityIndicator color={isDisabled ? "gray" : "#52525b"} className="mr-3" />
        ) : null}
        
        <Text className={`font-black text-[13px] tracking-[0.15em] uppercase ${
          isDisabled ? 'text-gray-400' : 'text-white'
        }`}>
          {isLoading ? 'Processing' : 'Analyze Data'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
