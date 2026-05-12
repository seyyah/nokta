import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { CATALOG } from '../data/catalog';

export default function EditComponents({ navigation }) {
    const { currentDraft, updateDraft } = useContext(AppContext);
    const specialty = currentDraft?.specialty || 'cardiologist';
    const catalogEntry = CATALOG[specialty];

    // Get AI suggested components (from custom request) or all components (from browse)
    const aiSuggestedIds = currentDraft?.aiSuggestedComponents || [];
    const isFromAI = aiSuggestedIds.length > 0;

    // Filter components: show only AI suggested ones if coming from AI flow
    const availableComponents = isFromAI
        ? catalogEntry.components.filter(c => aiSuggestedIds.includes(c.id))
        : catalogEntry.components;

    const [selectedComponents, setSelectedComponents] = useState(
        currentDraft?.selectedComponents || []
    );

    const toggleComponent = (componentId) => {
        setSelectedComponents(prev => {
            if (prev.includes(componentId)) {
                return prev.filter(id => id !== componentId);
            } else {
                return [...prev, componentId];
            }
        });
    };

    const handleSave = () => {
        updateDraft({ selectedComponents });
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
                    <Ionicons name="arrow-back" size={24} color="#e3e2e3" />
                </TouchableOpacity>
                <Text style={styles.title}>Özellikleri Düzenle</Text>
            </View>

            <View style={styles.specialtyBadge}>
                <Ionicons name={catalogEntry.icon} size={16} color={catalogEntry.accentColor} />
                <Text style={[styles.specialtyText, { color: catalogEntry.accentColor }]}>
                    {catalogEntry.label}
                </Text>
            </View>

            <Text style={styles.subtitle}>
                {selectedComponents.length} özellik seçildi
            </Text>

            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                {availableComponents.map((component) => {
                    const isSelected = selectedComponents.includes(component.id);

                    return (
                        <TouchableOpacity
                            key={component.id}
                            style={[
                                styles.componentCard,
                                isSelected && { borderColor: catalogEntry.accentColor, backgroundColor: catalogEntry.accentColor + '11' }
                            ]}
                            onPress={() => toggleComponent(component.id)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.componentLeft}>
                                <View style={[
                                    styles.checkbox,
                                    isSelected && { backgroundColor: catalogEntry.accentColor, borderColor: catalogEntry.accentColor }
                                ]}>
                                    {isSelected && (
                                        <Ionicons name="checkmark" size={16} color="#121415" />
                                    )}
                                </View>

                                <View style={[styles.iconWrap, { backgroundColor: catalogEntry.accentColor + '22' }]}>
                                    <Ionicons name={component.icon} size={18} color={catalogEntry.accentColor} />
                                </View>

                                <View style={styles.componentInfo}>
                                    <Text style={styles.componentName}>{component.name}</Text>
                                    <Text style={styles.componentPeer}>
                                        {component.peerSignal}% pratiklerin bunu kullanıyor
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.saveBtn, { backgroundColor: catalogEntry.accentColor }]}
                    onPress={handleSave}
                    activeOpacity={0.85}
                >
                    <Text style={styles.saveBtnText}>Kaydet & Devam</Text>
                    <Ionicons name="arrow-forward" size={18} color="#121415" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121415',
        paddingTop: 64,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 16,
        gap: 16,
    },
    back: {},
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#e3e2e3',
    },

    specialtyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#292a2b',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginHorizontal: 24,
        marginBottom: 8,
        gap: 6,
    },
    specialtyText: {
        fontSize: 13,
        fontWeight: 'bold',
    },

    subtitle: {
        fontSize: 14,
        color: '#6B6B6B',
        marginHorizontal: 24,
        marginBottom: 20,
    },

    list: {
        flex: 1,
        paddingHorizontal: 24,
    },

    componentCard: {
        backgroundColor: '#1e2021',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#292a2b',
    },
    componentLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#292a2b',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconWrap: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    componentInfo: {
        flex: 1,
    },
    componentName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#e3e2e3',
        marginBottom: 4,
    },
    componentPeer: {
        fontSize: 12,
        color: '#6B6B6B',
    },

    footer: {
        padding: 24,
        paddingBottom: 32,
        borderTopWidth: 1,
        borderTopColor: '#292a2b',
    },
    saveBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    saveBtnText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#121415',
    },
});

// Made with Bob
