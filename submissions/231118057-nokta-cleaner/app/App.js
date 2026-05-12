import './global.css';

import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, StatusBar, Alert, KeyboardAvoidingView, Platform, TouchableOpacity, TextInput } from 'react-native';
import InputSection from './src/components/InputSection';
import IdeaCard from './src/components/IdeaCard';
import { processNotes } from './src/services/GeminiService';

const CATEGORIES = ['Technical', 'Business', 'Design', 'Other'];

const EMPTY_CARD = { title: '', desc: '', category: 'Other' };

export default function App() {
  const [ideas, setIdeas]           = useState([]);
  const [isLoading, setIsLoading]   = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCard, setNewCard]       = useState(EMPTY_CARD);

  const handleProcessNotes = async (text) => {
    setIsLoading(true);
    setIdeas([]);
    try {
      const result = await processNotes(text);
      setIdeas(result.map(idea => ({ ...idea, status: 'pending', comment: '' })));
    } catch (error) {
      Alert.alert('Error processing notes', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateIdea = (id, changes) => {
    setIdeas(prev => prev.map(idea => idea.id === id ? { ...idea, ...changes } : idea));
  };

  const handleDeleteIdea = (id) => {
    setIdeas(prev => prev.filter(idea => idea.id !== id));
  };

  const handleAddCard = () => {
    if (!newCard.title.trim()) return;
    const id = Date.now();
    setIdeas(prev => [...prev, { ...newCard, id, status: 'pending', comment: '' }]);
    setNewCard(EMPTY_CARD);
    setShowAddForm(false);
  };

  const handleClear = () => {
    setIdeas([]);
    setShowAddForm(false);
  };

  const isWeb = Platform.OS === 'web';

  const content = (
    <ScrollView
      style={{ flex: 1, width: '100%' }}
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 80, flexGrow: 1, maxWidth: 680, alignSelf: 'center', width: '100%' }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <View className="flex-1 w-full flex-col">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6 w-full">
          <View className="shrink">
            <Text className="text-black text-3xl font-black tracking-tighter mb-1">Nokta</Text>
            <Text className="text-gray-500 font-bold text-[10px] tracking-widest uppercase">Migration & Dedup</Text>
          </View>
        </View>

        {/* Input */}
        <View className="w-full mb-8">
          <InputSection onSubmit={handleProcessNotes} isLoading={isLoading} />
        </View>

        {/* Results */}
        <View className="flex-1 w-full">
          {ideas.length > 0 ? (
            <View className="w-full">
              {/* Section header */}
              <View className="flex-row justify-between items-center mb-6 border-b-[2px] border-black pb-3 w-full">
                <Text className="text-black font-extrabold uppercase tracking-widest text-sm shrink">Extracted</Text>
                <View className="flex-row items-center gap-3 shrink-0">
                  <Text className="text-black font-bold text-xs">{ideas.length}</Text>
                  <TouchableOpacity onPress={() => setShowAddForm(v => !v)} activeOpacity={0.7}>
                    <Text className="text-black font-bold text-xs uppercase tracking-widest">+ Add</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleClear} activeOpacity={0.7}>
                    <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest">Clear</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Manual add form */}
              {showAddForm && (
                <View style={{ borderWidth: 1.5, borderColor: '#000', borderRadius: 16, padding: 20, marginBottom: 20, backgroundColor: '#fff', gap: 12 }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, color: '#000', marginBottom: 4 }}>New Card</Text>
                  <TextInput
                    value={newCard.title}
                    onChangeText={t => setNewCard(p => ({ ...p, title: t }))}
                    placeholder="Title"
                    placeholderTextColor="#9ca3af"
                    style={{ borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 8, padding: 10, fontSize: 15, fontWeight: '700', color: '#000' }}
                  />
                  <TextInput
                    value={newCard.desc}
                    onChangeText={t => setNewCard(p => ({ ...p, desc: t }))}
                    placeholder="Description"
                    placeholderTextColor="#9ca3af"
                    multiline
                    style={{ borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 8, padding: 10, fontSize: 14, color: '#374151', minHeight: 64, textAlignVertical: 'top' }}
                  />
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {CATEGORIES.map(cat => (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => setNewCard(p => ({ ...p, category: cat }))}
                        style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, borderWidth: 1.5, borderColor: newCard.category === cat ? '#000' : '#e5e7eb', backgroundColor: newCard.category === cat ? '#000' : 'transparent' }}
                      >
                        <Text style={{ fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, color: newCard.category === cat ? '#fff' : '#9ca3af' }}>{cat}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity onPress={handleAddCard} style={{ flex: 1, backgroundColor: '#000', paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}>
                      <Text style={{ color: '#fff', fontWeight: '800', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Add Card</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { setShowAddForm(false); setNewCard(EMPTY_CARD); }} style={{ flex: 1, borderWidth: 1.5, borderColor: '#e5e7eb', paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}>
                      <Text style={{ color: '#9ca3af', fontWeight: '800', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Cards */}
              {ideas.map((idea, index) => (
                <IdeaCard
                  key={idea.id || index}
                  idea={idea}
                  onUpdate={changes => handleUpdateIdea(idea.id, changes)}
                  onDelete={() => handleDeleteIdea(idea.id)}
                />
              ))}
            </View>
          ) : (
            <View className={`items-center justify-center py-16 px-6 border-[2px] border-black w-full rounded-xl ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
              {isLoading ? (
                <Text className="text-black mb-3 font-black text-xl uppercase tracking-widest text-center">Structuring...</Text>
              ) : (
                <Text className="text-black text-center mb-3 font-black text-2xl uppercase tracking-tighter">Void</Text>
              )}
              <Text className="text-gray-500 text-center font-medium text-sm leading-6">
                {isLoading ? 'Ordering chaos.' : 'Feed your notes.'}
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <StatusBar barStyle="dark-content" />
      {isWeb ? content : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {content}
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}
