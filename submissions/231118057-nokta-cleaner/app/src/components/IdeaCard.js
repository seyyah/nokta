import React from 'react';
import { View, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';

export default function IdeaCard({ idea }) {
  const handleCopy = async () => {
    const textToCopy = `[${idea.category}] ${idea.title}\n${idea.desc}`;
    await Clipboard.setStringAsync(textToCopy);
    Alert.alert("Copied", "Text copied to clipboard.");
  };

  return (
    <View
      className="border border-gray-200 p-6 mb-5 bg-white w-full rounded-2xl"
      style={Platform.OS === 'ios' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 } : { elevation: 2 }}
    >
      <View className="flex-row justify-between items-start mb-5 w-full" style={{ gap: 12 }}>
        <View className="flex-1">
          <Text className="text-black font-extrabold text-2xl leading-8" numberOfLines={3}>{idea.title}</Text>
        </View>
        <View className="bg-black px-3 py-1.5 rounded-full" style={{ flexShrink: 0, maxWidth: '42%' }}>
          <Text className="text-[10px] font-bold uppercase tracking-widest text-white" numberOfLines={1} ellipsizeMode="tail">
            {idea.category}
          </Text>
        </View>
      </View>

      <Text className="text-gray-500 leading-relaxed mb-6 font-medium text-[15px]">
        {idea.desc}
      </Text>

      <TouchableOpacity
        onPress={handleCopy}
        activeOpacity={0.7}
        className="self-start px-5 py-3 border border-gray-200 rounded-xl bg-gray-50"
      >
        <Text className="text-black font-black uppercase tracking-widest text-[10px]">Copy Block</Text>
      </TouchableOpacity>
    </View>
  );
}
