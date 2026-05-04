import './global.css';

import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, StatusBar, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import InputSection from './src/components/InputSection';
import IdeaCard from './src/components/IdeaCard';
import { processNotes } from './src/services/GeminiService';

export default function App() {
  const [ideas, setIdeas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleProcessNotes = async (text) => {
    setIsLoading(true);
    try {
      const result = await processNotes(text);
      setIdeas(result);
    } catch (error) {
      Alert.alert("Error processing notes", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 pt-10">
      <StatusBar barStyle="dark-content" />
        <ScrollView 
          className="flex-1 w-full"
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 80, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View className="flex-1 w-full flex-col">
            <View className="flex-row justify-between items-center mb-6 w-full">
              <View className="shrink">
                <Text className="text-black text-3xl font-black tracking-tighter mb-1">
                  Nokta
                </Text>
                <Text className="text-gray-500 font-bold text-[10px] tracking-widest uppercase">
                  Migration & Dedup
                </Text>
              </View>
            </View>

            <View className="w-full mb-8">
              <InputSection onSubmit={handleProcessNotes} isLoading={isLoading} />
            </View>

            <View className="flex-1 w-full">
              {ideas.length > 0 ? (
                <View className="w-full">
                  <View className="flex-row justify-between items-end mb-6 border-b-[2px] border-black pb-3 w-full">
                     <Text className="text-black font-extrabold uppercase tracking-widest text-sm shrink">
                       Extracted
                     </Text>
                     <Text className="text-black font-bold text-xs shrink-0">
                       {ideas.length}
                     </Text>
                  </View>
                  {ideas.map((idea, index) => (
                    <IdeaCard key={idea.id || index} idea={idea} />
                  ))}
                </View>
              ) : (
                   <View className={`items-center justify-center py-16 px-6 border-[2px] border-black w-full rounded-sm ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
                     {isLoading ? (
                       <Text className="text-black mb-3 font-black text-xl uppercase tracking-widest text-center">Structuring...</Text>
                     ) : (
                       <Text className="text-black text-center mb-3 font-black text-2xl uppercase tracking-tighter">Void</Text>
                     )}
                     <Text className="text-gray-500 text-center font-medium text-sm leading-6">
                       {isLoading ? "Ordering chaos." : "Feed your notes."}
                     </Text>
                   </View>
              )}
            </View>
          </View>
        </ScrollView>
    </SafeAreaView>
  );
}