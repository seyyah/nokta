import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';

const CATEGORIES = ['Technical', 'Business', 'Design', 'Other'];

export default function IdeaCard({ idea, onUpdate, onDelete, onMoveUp, onMoveDown, theme }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showNote, setShowNote]   = useState(!!idea.comment);
  const [editData, setEditData]   = useState({ title: idea.title, desc: idea.desc, category: idea.category });

  const status = idea.status || 'pending';

  const borderColor = status === 'approved' ? '#16a34a' : status === 'rejected' ? '#dc2626' : theme.border;
  const borderWidth = status !== 'pending' ? 2 : 1;

  const handleSave = () => { onUpdate(editData); setIsEditing(false); };
  const handleCancelEdit = () => { setEditData({ title: idea.title, desc: idea.desc, category: idea.category }); setIsEditing(false); };
  const handleCopy = async () => { await Clipboard.setStringAsync(`[${idea.category}] ${idea.title}\n${idea.desc}`); };
  const toggleApprove = () => onUpdate({ status: status === 'approved' ? 'pending' : 'approved' });
  const toggleReject  = () => onUpdate({ status: status === 'rejected' ? 'pending' : 'rejected' });

  const s = {
    card: { marginBottom: 20, backgroundColor: theme.card, borderRadius: 16, padding: 24, borderWidth, borderColor, ...(Platform.OS === 'ios' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 } : { elevation: 2 }), opacity: status === 'rejected' ? 0.6 : 1 },
    label: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
    actionBtn: (active, color) => ({ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: active ? color : theme.border, backgroundColor: active ? color + '18' : 'transparent' }),
    actionTxt: (active, color) => ({ fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, color: active ? color : theme.textMuted }),
    input: { borderWidth: 1.5, borderColor: theme.borderStrong, borderRadius: 8, padding: 10, color: theme.text, backgroundColor: theme.inputBg },
  };

  return (
    <View style={s.card}>
      {status !== 'pending' && (
        <View style={{ position: 'absolute', top: 12, right: 12, zIndex: 1 }}>
          <View style={{ backgroundColor: status === 'approved' ? '#16a34a' : '#dc2626', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3 }}>
            <Text style={[s.label, { color: '#fff' }]}>{status === 'approved' ? 'Approved' : 'Rejected'}</Text>
          </View>
        </View>
      )}

      {isEditing ? (
        <View style={{ gap: 12 }}>
          <TextInput value={editData.title} onChangeText={t => setEditData(p => ({ ...p, title: t }))} placeholder="Title" placeholderTextColor={theme.placeholder} style={[s.input, { fontSize: 16, fontWeight: '700' }]} />
          <TextInput value={editData.desc} onChangeText={t => setEditData(p => ({ ...p, desc: t }))} placeholder="Description" placeholderTextColor={theme.placeholder} multiline style={[s.input, { fontSize: 14, minHeight: 72, textAlignVertical: 'top' }]} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity key={cat} onPress={() => setEditData(p => ({ ...p, category: cat }))}
                style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, borderWidth: 1.5, borderColor: editData.category === cat ? theme.tagBg : theme.border, backgroundColor: editData.category === cat ? theme.tagBg : 'transparent' }}>
                <Text style={[s.label, { color: editData.category === cat ? theme.tagText : theme.textMuted }]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity onPress={handleSave} style={{ flex: 1, backgroundColor: theme.btnBg, paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}>
              <Text style={[s.label, { color: theme.btnText, letterSpacing: 1 }]}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCancelEdit} style={{ flex: 1, borderWidth: 1.5, borderColor: theme.border, paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}>
              <Text style={[s.label, { color: theme.textMuted, letterSpacing: 1 }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, gap: 12 }}>
            <Text style={{ flex: 1, fontSize: 20, fontWeight: '800', color: theme.text, lineHeight: 26 }} numberOfLines={3}>{idea.title}</Text>
            <View style={{ backgroundColor: theme.tagBg, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99, flexShrink: 0, maxWidth: '42%' }}>
              <Text style={[s.label, { color: theme.tagText, letterSpacing: 1.5 }]} numberOfLines={1}>{idea.category}</Text>
            </View>
          </View>

          <Text style={{ color: theme.textMuted, lineHeight: 22, marginBottom: 18, fontSize: 14, fontWeight: '500' }}>{idea.desc}</Text>

          {(showNote || idea.comment) && (
            <TextInput
              value={idea.comment || ''}
              onChangeText={t => onUpdate({ comment: t })}
              multiline
              placeholder="Expert note..."
              placeholderTextColor={theme.placeholder}
              style={{ borderWidth: 1, borderColor: theme.border, borderRadius: 10, padding: 10, fontSize: 13, color: theme.text, minHeight: 56, textAlignVertical: 'top', marginBottom: 14, backgroundColor: theme.inputBg }}
            />
          )}

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <TouchableOpacity onPress={toggleApprove} style={s.actionBtn(status === 'approved', '#16a34a')}>
              <Text style={s.actionTxt(status === 'approved', '#16a34a')}>✓ Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleReject} style={s.actionBtn(status === 'rejected', '#dc2626')}>
              <Text style={s.actionTxt(status === 'rejected', '#dc2626')}>✗ Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowNote(true)} style={s.actionBtn(!!idea.comment, theme.borderStrong)}>
              <Text style={s.actionTxt(!!idea.comment, theme.borderStrong)}>Note</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsEditing(true)} style={s.actionBtn(false, theme.borderStrong)}>
              <Text style={s.actionTxt(false, theme.borderStrong)}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCopy} style={s.actionBtn(false, theme.borderStrong)}>
              <Text style={s.actionTxt(false, theme.borderStrong)}>Copy</Text>
            </TouchableOpacity>
            {onMoveUp && (
              <TouchableOpacity onPress={onMoveUp} style={s.actionBtn(false, theme.borderStrong)}>
                <Text style={s.actionTxt(false, theme.borderStrong)}>↑</Text>
              </TouchableOpacity>
            )}
            {onMoveDown && (
              <TouchableOpacity onPress={onMoveDown} style={s.actionBtn(false, theme.borderStrong)}>
                <Text style={s.actionTxt(false, theme.borderStrong)}>↓</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
    </View>
  );
}
