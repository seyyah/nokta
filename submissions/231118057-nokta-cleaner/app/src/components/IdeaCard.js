import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';

const CATEGORIES = ['Technical', 'Business', 'Design', 'Other'];

const STATUS_BORDER = {
  approved: { borderColor: '#16a34a', borderWidth: 2 },
  rejected:  { borderColor: '#dc2626', borderWidth: 2, opacity: 0.55 },
  pending:   { borderColor: '#e5e7eb', borderWidth: 1 },
};

export default function IdeaCard({ idea, onUpdate, onDelete }) {
  const [isEditing, setIsEditing]     = useState(false);
  const [showNote, setShowNote]       = useState(!!idea.comment);
  const [editData, setEditData]       = useState({ title: idea.title, desc: idea.desc, category: idea.category });

  const status = idea.status || 'pending';

  const handleSave = () => {
    onUpdate(editData);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditData({ title: idea.title, desc: idea.desc, category: idea.category });
    setIsEditing(false);
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(`[${idea.category}] ${idea.title}\n${idea.desc}`);
  };

  const toggleApprove = () => onUpdate({ status: status === 'approved' ? 'pending' : 'approved' });
  const toggleReject  = () => onUpdate({ status: status === 'rejected' ? 'pending' : 'rejected' });

  return (
    <View
      style={[
        { marginBottom: 20, backgroundColor: 'white', borderRadius: 16, padding: 24 },
        STATUS_BORDER[status],
        Platform.OS === 'ios'
          ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 }
          : { elevation: 2 },
      ]}
    >
      {status !== 'pending' && (
        <View style={{ position: 'absolute', top: 12, right: 12, zIndex: 1 }}>
          <View style={{ backgroundColor: status === 'approved' ? '#16a34a' : '#dc2626', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3 }}>
            <Text style={{ color: '#fff', fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 }}>
              {status === 'approved' ? 'Approved' : 'Rejected'}
            </Text>
          </View>
        </View>
      )}

      {isEditing ? (
        <View style={{ gap: 12 }}>
          <TextInput
            value={editData.title}
            onChangeText={t => setEditData(p => ({ ...p, title: t }))}
            style={{ borderWidth: 1.5, borderColor: '#000', borderRadius: 8, padding: 10, fontSize: 16, fontWeight: '700', color: '#000' }}
            placeholder="Title"
            placeholderTextColor="#9ca3af"
          />
          <TextInput
            value={editData.desc}
            onChangeText={t => setEditData(p => ({ ...p, desc: t }))}
            multiline
            style={{ borderWidth: 1.5, borderColor: '#000', borderRadius: 8, padding: 10, fontSize: 14, color: '#374151', minHeight: 72, textAlignVertical: 'top' }}
            placeholder="Description"
            placeholderTextColor="#9ca3af"
          />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                onPress={() => setEditData(p => ({ ...p, category: cat }))}
                style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, borderWidth: 1.5, borderColor: editData.category === cat ? '#000' : '#e5e7eb', backgroundColor: editData.category === cat ? '#000' : 'transparent' }}
              >
                <Text style={{ fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, color: editData.category === cat ? '#fff' : '#9ca3af' }}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity onPress={handleSave} style={{ flex: 1, backgroundColor: '#000', paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCancelEdit} style={{ flex: 1, borderWidth: 1.5, borderColor: '#e5e7eb', paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}>
              <Text style={{ color: '#9ca3af', fontWeight: '800', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, gap: 12 }}>
            <Text style={{ flex: 1, fontSize: 20, fontWeight: '800', color: '#000', lineHeight: 26 }} numberOfLines={3}>
              {idea.title}
            </Text>
            <View style={{ backgroundColor: '#000', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99, flexShrink: 0, maxWidth: '42%' }}>
              <Text style={{ fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, color: '#fff' }} numberOfLines={1}>
                {idea.category}
              </Text>
            </View>
          </View>

          <Text style={{ color: '#6b7280', lineHeight: 22, marginBottom: 18, fontSize: 14, fontWeight: '500' }}>
            {idea.desc}
          </Text>

          {(showNote || idea.comment) && (
            <TextInput
              value={idea.comment || ''}
              onChangeText={t => onUpdate({ comment: t })}
              multiline
              placeholder="Expert note..."
              placeholderTextColor="#d1d5db"
              style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 10, fontSize: 13, color: '#374151', minHeight: 56, textAlignVertical: 'top', marginBottom: 14, backgroundColor: '#f9fafb' }}
            />
          )}

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <TouchableOpacity onPress={toggleApprove} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: status === 'approved' ? '#16a34a' : '#e5e7eb', backgroundColor: status === 'approved' ? '#f0fdf4' : 'transparent' }}>
              <Text style={{ fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, color: status === 'approved' ? '#16a34a' : '#9ca3af' }}>✓ Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleReject} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: status === 'rejected' ? '#dc2626' : '#e5e7eb', backgroundColor: status === 'rejected' ? '#fef2f2' : 'transparent' }}>
              <Text style={{ fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, color: status === 'rejected' ? '#dc2626' : '#9ca3af' }}>✗ Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowNote(true)} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: idea.comment ? '#000' : '#e5e7eb' }}>
              <Text style={{ fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, color: idea.comment ? '#000' : '#9ca3af' }}>Note</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsEditing(true)} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: '#e5e7eb' }}>
              <Text style={{ fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, color: '#9ca3af' }}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCopy} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }}>
              <Text style={{ fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, color: '#9ca3af' }}>Copy</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}
