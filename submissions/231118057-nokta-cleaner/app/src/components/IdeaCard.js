import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';

export default function IdeaCard({ idea }) {
  const handleCopy = async () => {
    const textToCopy = `[${idea.category}] ${idea.title}\n${idea.desc}`;
    await Clipboard.setStringAsync(textToCopy);
    Alert.alert("Copied", "Text copied to clipboard.");
  };

  return (
    <View className="border-[2px] border-black/10 p-6 mb-5 bg-white w-full rounded-2xl shadow-sm">
      <View className="flex-row justify-between items-start mb-5 overflow-hidden w-full gap-3">
        <View className="flex-1 shrink">
          <Text className="text-black font-extrabold text-2xl leading-8" style={{ flexShrink: 1 }}>{idea.title}</Text>
        </View>
        <View className="border border-black px-3 py-1.5 bg-black shrink-0 max-w-[40%] rounded-full">
          <Text className="text-[10px] font-bold uppercase tracking-widest text-white" numberOfLines={1} ellipsizeMode="tail">
            {idea.category}
          </Text>
        </View>
      </View>
      
      <Text className="text-gray-600 leading-relaxed mb-6 font-medium text-[15px]">
        {idea.desc}
      </Text>
      
      <TouchableOpacity 
        onPress={handleCopy}
        className="self-start px-5 py-3 border-[2px] border-black/10 active:scale-95 rounded-xl bg-gray-50"
      >
        <Text className="text-black font-black uppercase tracking-widest text-[10px]">Copy Block</Text>
      </TouchableOpacity>
    </View>
  );
}
