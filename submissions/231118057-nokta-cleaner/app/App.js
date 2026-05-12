import './global.css';

import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, StatusBar, Alert, KeyboardAvoidingView, Platform, TouchableOpacity, TextInput } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import InputSection from './src/components/InputSection';
import IdeaCard from './src/components/IdeaCard';
import { processNotes } from './src/services/GeminiService';

const CATEGORIES = ['Technical', 'Business', 'Design', 'Other'];
const EMPTY_CARD  = { title: '', desc: '', category: 'Other' };

export default function App() {
  const [ideas, setIdeas]             = useState([]);
  const [isLoading, setIsLoading]     = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCard, setNewCard]         = useState(EMPTY_CARD);

  const stats = {
    pending:  ideas.filter(i => (i.status || 'pending') === 'pending').length,
    approved: ideas.filter(i => i.status === 'approved').length,
    rejected: ideas.filter(i => i.status === 'rejected').length,
  };

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

  const handleUpdateIdea = (id, changes) =>
    setIdeas(prev => prev.map(idea => idea.id === id ? { ...idea, ...changes } : idea));

  const handleDeleteIdea = (id) =>
    setIdeas(prev => prev.filter(idea => idea.id !== id));

  const handleAddCard = () => {
    if (!newCard.title.trim()) return;
    setIdeas(prev => [...prev, { ...newCard, id: Date.now(), status: 'pending', comment: '' }]);
    setNewCard(EMPTY_CARD);
    setShowAddForm(false);
  };

  const handleClear = () => { setIdeas([]); setShowAddForm(false); };

  const handleBulkApprove = () =>
    setIdeas(prev => prev.map(i => ({ ...i, status: 'approved' })));

  const handleBulkReject = () =>
    setIdeas(prev => prev.map(i => ({ ...i, status: 'rejected' })));

  const handleExportApproved = async () => {
    const approved = ideas.filter(i => i.status === 'approved');
    if (approved.length === 0) {
      Alert.alert('No approved cards', 'Approve at least one card first.');
      return;
    }
    const text = approved
      .map(i => `[${i.category}] ${i.title}\n${i.desc}${i.comment ? `\nNote: ${i.comment}` : ''}`)
      .join('\n\n');
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', `${approved.length} approved card(s) copied to clipboard.`);
  };

  const handleReanalyzeRejected = async () => {
    const rejected = ideas.filter(i => i.status === 'rejected');
    if (rejected.length === 0) return;
    setIsReanalyzing(true);
    const rawText = rejected.map(i => `${i.title}: ${i.desc}`).join('\n');
    try {
      const result = await processNotes(rawText);
      const newIdeas = result.map(idea => ({
        ...idea,
        id: Date.now() + Math.random(),
        status: 'pending',
        comment: '',
      }));
      setIdeas(prev => [...prev.filter(i => i.status !== 'rejected'), ...newIdeas]);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsReanalyzing(false);
    }
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
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 2, borderColor: '#000', paddingBottom: 12, marginBottom: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 2, color: '#000' }}>Extracted</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#000' }}>{ideas.length}</Text>
                  <TouchableOpacity onPress={() => setShowAddForm(v => !v)} activeOpacity={0.7}>
                    <Text style={{ fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, color: '#000' }}>+ Add</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleClear} activeOpacity={0.7}>
                    <Text style={{ fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, color: '#9ca3af' }}>Clear</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Stats bar */}
              <View style={{ flexDirection: 'row', gap: 16, marginBottom: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#9ca3af' }} />
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#6b7280' }}>Pending {stats.pending}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#16a34a' }} />
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#16a34a' }}>Approved {stats.approved}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#dc2626' }} />
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#dc2626' }}>Rejected {stats.rejected}</Text>
                </View>
              </View>

              {/* Action bar */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                <TouchableOpacity onPress={handleBulkApprove} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1.5, borderColor: '#16a34a', backgroundColor: '#f0fdf4' }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, color: '#16a34a' }}>Approve All</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleBulkReject} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1.5, borderColor: '#dc2626', backgroundColor: '#fef2f2' }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, color: '#dc2626' }}>Reject All</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleExportApproved} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1.5, borderColor: '#000', backgroundColor: '#000' }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, color: '#fff' }}>Export Approved</Text>
                </TouchableOpacity>
                {stats.rejected > 0 && (
                  <TouchableOpacity onPress={handleReanalyzeRejected} disabled={isReanalyzing} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1.5, borderColor: '#6b7280', backgroundColor: isReanalyzing ? '#f3f4f6' : 'transparent' }}>
                    <Text style={{ fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, color: '#6b7280' }}>
                      {isReanalyzing ? 'Analyzing...' : `Re-analyze ${stats.rejected}`}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Manual add form */}
              {showAddForm && (
                <View style={{ borderWidth: 1.5, borderColor: '#000', borderRadius: 16, padding: 20, marginBottom: 20, backgroundColor: '#fff', gap: 12 }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, color: '#000' }}>New Card</Text>
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
