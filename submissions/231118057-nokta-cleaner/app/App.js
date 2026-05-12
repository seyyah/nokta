import './global.css';

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, StatusBar, Alert, KeyboardAvoidingView, Platform, TouchableOpacity, TextInput } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import InputSection from './src/components/InputSection';
import IdeaCard from './src/components/IdeaCard';
import { processNotes } from './src/services/GeminiService';
import { loadSessions, saveSession } from './src/utils/storage';

const CATEGORIES = ['Technical', 'Business', 'Design', 'Other'];
const EMPTY_CARD  = { title: '', desc: '', category: 'Other' };

const LIGHT = {
  bg: '#f9fafb', card: '#ffffff', text: '#000000', textMuted: '#6b7280',
  placeholder: '#a1a1aa', border: '#e5e7eb', borderStrong: '#000000',
  tagBg: '#000000', tagText: '#ffffff', inputBg: '#ffffff',
  btnBg: '#000000', btnText: '#ffffff', btnDisabledBg: '#f3f4f6', btnDisabledText: '#9ca3af',
  separator: '#000000', historyBg: '#ffffff', historyBorder: '#e5e7eb',
};

const DARK = {
  bg: '#111111', card: '#1c1c1c', text: '#ffffff', textMuted: '#9ca3af',
  placeholder: '#4b5563', border: '#2d2d2d', borderStrong: '#ffffff',
  tagBg: '#ffffff', tagText: '#000000', inputBg: '#161616',
  btnBg: '#ffffff', btnText: '#000000', btnDisabledBg: '#1c1c1c', btnDisabledText: '#4b5563',
  separator: '#ffffff', historyBg: '#1c1c1c', historyBorder: '#2d2d2d',
};

export default function App() {
  const [ideas, setIdeas]               = useState([]);
  const [isLoading, setIsLoading]       = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [showAddForm, setShowAddForm]   = useState(false);
  const [newCard, setNewCard]           = useState(EMPTY_CARD);
  const [isDark, setIsDark]             = useState(false);
  const [search, setSearch]             = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [sessions, setSessions]         = useState([]);
  const [showHistory, setShowHistory]   = useState(false);

  const theme = isDark ? DARK : LIGHT;

  useEffect(() => { setSessions(loadSessions()); }, []);

  const stats = {
    pending:  ideas.filter(i => (i.status || 'pending') === 'pending').length,
    approved: ideas.filter(i => i.status === 'approved').length,
    rejected: ideas.filter(i => i.status === 'rejected').length,
  };

  const displayed = ideas.filter(i => {
    const matchSearch = !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.desc.toLowerCase().includes(search.toLowerCase());
    const matchCat    = !activeCategory || i.category === activeCategory;
    return matchSearch && matchCat;
  });

  const handleProcessNotes = async (text) => {
    setIsLoading(true);
    setIdeas([]);
    setSearch('');
    setActiveCategory(null);
    try {
      const result = await processNotes(text);
      const newIdeas = result.map(idea => ({ ...idea, status: 'pending', comment: '' }));
      setIdeas(newIdeas);
      const updated = saveSession(newIdeas);
      setSessions(updated);
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

  const handleMoveUp = (id) => {
    setIdeas(prev => {
      const idx = prev.findIndex(i => i.id === id);
      if (idx <= 0) return prev;
      const arr = [...prev];
      [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
      return arr;
    });
  };

  const handleMoveDown = (id) => {
    setIdeas(prev => {
      const idx = prev.findIndex(i => i.id === id);
      if (idx >= prev.length - 1) return prev;
      const arr = [...prev];
      [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
      return arr;
    });
  };

  const handleAddCard = () => {
    if (!newCard.title.trim()) return;
    setIdeas(prev => [...prev, { ...newCard, id: Date.now(), status: 'pending', comment: '' }]);
    setNewCard(EMPTY_CARD);
    setShowAddForm(false);
  };

  const handleClear = () => { setIdeas([]); setShowAddForm(false); setSearch(''); setActiveCategory(null); };

  const handleBulkApprove = () => setIdeas(prev => prev.map(i => ({ ...i, status: 'approved' })));
  const handleBulkReject  = () => setIdeas(prev => prev.map(i => ({ ...i, status: 'rejected' })));

  const handleExportApproved = async () => {
    const approved = ideas.filter(i => i.status === 'approved');
    if (approved.length === 0) { Alert.alert('No approved cards', 'Approve at least one card first.'); return; }
    const text = approved.map(i => `[${i.category}] ${i.title}\n${i.desc}${i.comment ? `\nNote: ${i.comment}` : ''}`).join('\n\n');
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', `${approved.length} approved card(s) copied to clipboard.`);
  };

  const handleReanalyzeRejected = async () => {
    const rejected = ideas.filter(i => i.status === 'rejected');
    if (rejected.length === 0) return;
    setIsReanalyzing(true);
    try {
      const result = await processNotes(rejected.map(i => `${i.title}: ${i.desc}`).join('\n'));
      const newIdeas = result.map(idea => ({ ...idea, id: Date.now() + Math.random(), status: 'pending', comment: '' }));
      setIdeas(prev => [...prev.filter(i => i.status !== 'rejected'), ...newIdeas]);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsReanalyzing(false);
    }
  };

  const handleLoadSession = (session) => {
    setIdeas(session.ideas);
    setSearch('');
    setActiveCategory(null);
    setShowHistory(false);
  };

  const isWeb = Platform.OS === 'web';

  const pill = (label, active, onPress, color) => (
    <TouchableOpacity
      key={label}
      onPress={onPress}
      style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, borderWidth: 1.5, borderColor: active ? (color || theme.borderStrong) : theme.border, backgroundColor: active ? (color || theme.borderStrong) : 'transparent' }}
    >
      <Text style={{ fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, color: active ? (color ? '#fff' : theme.bg) : theme.textMuted }}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const content = (
    <ScrollView
      style={{ flex: 1, width: '100%' }}
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 80, flexGrow: 1, maxWidth: 680, alignSelf: 'center', width: '100%' }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <View style={{ flex: 1, width: '100%' }}>

        {/* ── Header ── */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <View>
            <Text style={{ color: theme.text, fontSize: 30, fontWeight: '900', letterSpacing: -1 }}>Nokta</Text>
            <Text style={{ color: theme.textMuted, fontWeight: '700', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase' }}>Migration & Dedup</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            {sessions.length > 0 && (
              <TouchableOpacity onPress={() => setShowHistory(v => !v)}>
                <Text style={{ fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, color: showHistory ? theme.text : theme.textMuted }}>History</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => setIsDark(v => !v)} style={{ width: 36, height: 20, borderRadius: 10, backgroundColor: isDark ? '#fff' : '#000', justifyContent: 'center', paddingHorizontal: 3 }}>
              <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: isDark ? '#000' : '#fff', alignSelf: isDark ? 'flex-end' : 'flex-start' }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── History panel ── */}
        {showHistory && (
          <View style={{ borderWidth: 1, borderColor: theme.historyBorder, borderRadius: 12, marginBottom: 16, backgroundColor: theme.historyBg, overflow: 'hidden' }}>
            {sessions.map((s, i) => (
              <TouchableOpacity
                key={s.id}
                onPress={() => handleLoadSession(s)}
                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: i < sessions.length - 1 ? 1 : 0, borderColor: theme.historyBorder }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text }}>{s.date}</Text>
                <Text style={{ fontSize: 11, fontWeight: '700', color: theme.textMuted }}>{s.count} cards</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Input ── */}
        <View style={{ marginBottom: 32, marginTop: 16 }}>
          <InputSection onSubmit={handleProcessNotes} isLoading={isLoading} theme={theme} />
        </View>

        {/* ── Results ── */}
        {ideas.length > 0 && (
          <View style={{ width: '100%' }}>

            {/* Section header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 2, borderColor: theme.separator, paddingBottom: 12, marginBottom: 12 }}>
              <Text style={{ fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 2, color: theme.text }}>Extracted</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text }}>{ideas.length}</Text>
                <TouchableOpacity onPress={() => setShowAddForm(v => !v)}>
                  <Text style={{ fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, color: theme.text }}>+ Add</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleClear}>
                  <Text style={{ fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, color: theme.textMuted }}>Clear</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Stats bar */}
            <View style={{ flexDirection: 'row', gap: 16, marginBottom: 12 }}>
              {[['pending', '#6b7280', stats.pending], ['approved', '#16a34a', stats.approved], ['rejected', '#dc2626', stats.rejected]].map(([label, color, count]) => (
                <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: color }} />
                  <Text style={{ fontSize: 11, fontWeight: '700', color }}>{label.charAt(0).toUpperCase() + label.slice(1)} {count}</Text>
                </View>
              ))}
            </View>

            {/* Search */}
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search cards..."
              placeholderTextColor={theme.placeholder}
              style={{ borderWidth: 1.5, borderColor: theme.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: theme.text, backgroundColor: theme.inputBg, marginBottom: 12 }}
            />

            {/* Category filter */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {pill('All', !activeCategory, () => setActiveCategory(null))}
              {CATEGORIES.map(cat => pill(cat, activeCategory === cat, () => setActiveCategory(activeCategory === cat ? null : cat)))}
            </View>

            {/* Action bar */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              <TouchableOpacity onPress={handleBulkApprove} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1.5, borderColor: '#16a34a', backgroundColor: '#16a34a18' }}>
                <Text style={{ fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, color: '#16a34a' }}>Approve All</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleBulkReject} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1.5, borderColor: '#dc2626', backgroundColor: '#dc262618' }}>
                <Text style={{ fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, color: '#dc2626' }}>Reject All</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleExportApproved} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1.5, borderColor: theme.borderStrong, backgroundColor: theme.btnBg }}>
                <Text style={{ fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, color: theme.btnText }}>Export Approved</Text>
              </TouchableOpacity>
              {stats.rejected > 0 && (
                <TouchableOpacity onPress={handleReanalyzeRejected} disabled={isReanalyzing} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1.5, borderColor: theme.border, backgroundColor: isReanalyzing ? theme.btnDisabledBg : 'transparent' }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, color: theme.textMuted }}>
                    {isReanalyzing ? 'Analyzing...' : `Re-analyze ${stats.rejected}`}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Manual add form */}
            {showAddForm && (
              <View style={{ borderWidth: 1.5, borderColor: theme.borderStrong, borderRadius: 16, padding: 20, marginBottom: 20, backgroundColor: theme.card, gap: 12 }}>
                <Text style={{ fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, color: theme.text }}>New Card</Text>
                <TextInput value={newCard.title} onChangeText={t => setNewCard(p => ({ ...p, title: t }))} placeholder="Title" placeholderTextColor={theme.placeholder} style={{ borderWidth: 1.5, borderColor: theme.border, borderRadius: 8, padding: 10, fontSize: 15, fontWeight: '700', color: theme.text, backgroundColor: theme.inputBg }} />
                <TextInput value={newCard.desc} onChangeText={t => setNewCard(p => ({ ...p, desc: t }))} placeholder="Description" placeholderTextColor={theme.placeholder} multiline style={{ borderWidth: 1.5, borderColor: theme.border, borderRadius: 8, padding: 10, fontSize: 14, color: theme.text, minHeight: 64, textAlignVertical: 'top', backgroundColor: theme.inputBg }} />
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {CATEGORIES.map(cat => (
                    <TouchableOpacity key={cat} onPress={() => setNewCard(p => ({ ...p, category: cat }))}
                      style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, borderWidth: 1.5, borderColor: newCard.category === cat ? theme.tagBg : theme.border, backgroundColor: newCard.category === cat ? theme.tagBg : 'transparent' }}>
                      <Text style={{ fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, color: newCard.category === cat ? theme.tagText : theme.textMuted }}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity onPress={handleAddCard} style={{ flex: 1, backgroundColor: theme.btnBg, paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}>
                    <Text style={{ color: theme.btnText, fontWeight: '800', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Add Card</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setShowAddForm(false); setNewCard(EMPTY_CARD); }} style={{ flex: 1, borderWidth: 1.5, borderColor: theme.border, paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}>
                    <Text style={{ color: theme.textMuted, fontWeight: '800', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Cards */}
            {displayed.length === 0 ? (
              <View style={{ borderWidth: 1.5, borderColor: theme.border, borderRadius: 12, paddingVertical: 32, alignItems: 'center' }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: theme.textMuted }}>No cards match your filter.</Text>
              </View>
            ) : (
              displayed.map((idea, index) => (
                <IdeaCard
                  key={idea.id || index}
                  idea={idea}
                  theme={theme}
                  onUpdate={changes => handleUpdateIdea(idea.id, changes)}
                  onDelete={() => handleDeleteIdea(idea.id)}
                  onMoveUp={ideas.indexOf(idea) > 0 ? () => handleMoveUp(idea.id) : null}
                  onMoveDown={ideas.indexOf(idea) < ideas.length - 1 ? () => handleMoveDown(idea.id) : null}
                />
              ))
            )}
          </View>
        )}

        {/* Empty state */}
        {ideas.length === 0 && (
          <View style={{ borderWidth: 2, borderColor: theme.borderStrong, borderRadius: 12, paddingVertical: 64, paddingHorizontal: 24, alignItems: 'center', opacity: isLoading ? 0.5 : 1 }}>
            <Text style={{ color: theme.text, fontWeight: '900', fontSize: 24, textTransform: 'uppercase', letterSpacing: -0.5, marginBottom: 8 }}>
              {isLoading ? 'Structuring...' : 'Void'}
            </Text>
            <Text style={{ color: theme.textMuted, textAlign: 'center', fontWeight: '500', fontSize: 14, lineHeight: 22 }}>
              {isLoading ? 'Ordering chaos.' : 'Feed your notes.'}
            </Text>
          </View>
        )}

      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      {isWeb ? content : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
          {content}
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}
