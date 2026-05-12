import React, { useState, useRef, useContext, useMemo, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, PanResponder, Dimensions, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { CATALOG } from '../data/catalog';
import { USE_CASES } from '../data/useCases';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = 90;

function resolveComponents(specialty, ids) {
  const catalog = CATALOG[specialty];
  if (!catalog) return [];
  return ids.map(id => catalog.components.find(c => c.id === id)).filter(Boolean);
}

const ALL_SPECIALTIES = ['all', ...Array.from(new Set(USE_CASES.map(uc => uc.specialty)))];

export default function UseCaseBrowser({ navigation }) {
  const { updateDraft, startNewDraft, currentDraft, userProfile } = useContext(AppContext);
  const defaultSpecialty = currentDraft?.specialty || userProfile?.specialty || 'all';
  const [activeFilter, setActiveFilter] = useState(
    ALL_SPECIALTIES.includes(defaultSpecialty) ? defaultSpecialty : 'all'
  );
  const [index, setIndex] = useState(0);
  const [liked, setLiked] = useState([]);

  const filteredCases = useMemo(
    () => activeFilter === 'all' ? USE_CASES : USE_CASES.filter(uc => uc.specialty === activeFilter),
    [activeFilter]
  );

  useEffect(() => {
    setIndex(0);
    setLiked([]);
    position.setValue({ x: 0, y: 0 });
  }, [activeFilter]);
  const position = useRef(new Animated.ValueXY()).current;
  const swipeFnRef = useRef(null);

  const swipe = (direction) => {
    const toX = direction === 'right' ? width * 1.5 : -width * 1.5;
    const newLiked = direction === 'right' ? [...liked, index] : liked;

    Animated.timing(position, {
      toValue: { x: toX, y: 0 },
      duration: 230,
      useNativeDriver: true,
    }).start(() => {
      if (index < filteredCases.length - 1) {
        setLiked(newLiked);
        setIndex(i => i + 1);
        position.setValue({ x: 0, y: 0 });
      } else {
        if (newLiked.length > 0) {
          const chosen = filteredCases[newLiked[newLiked.length - 1]];
          startNewDraft(chosen.specialty);
          updateDraft({ selectedComponents: chosen.components, aiSuggestedComponents: chosen.components });
          navigation.navigate('WizardFlow', { screen: 'ReviewConcepts' });
        } else {
          navigation.goBack();
        }
      }
    });
  };

  swipeFnRef.current = swipe;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => position.setValue({ x: g.dx, y: 0 }),
      onPanResponderRelease: (_, g) => {
        if (g.dx > SWIPE_THRESHOLD) swipeFnRef.current('right');
        else if (g.dx < -SWIPE_THRESHOLD) swipeFnRef.current('left');
        else Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
      },
    })
  ).current;

  const rotate = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-8deg', '0deg', '8deg'],
  });
  const likeOpacity = position.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const skipOpacity = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const useCase = filteredCases[index];
  if (!useCase) return null;

  const catalogEntry = CATALOG[useCase.specialty];
  const accent = catalogEntry?.accentColor || '#abcbdf';
  const resolvedComponents = resolveComponents(useCase.specialty, useCase.components);
  const progress = filteredCases.length > 1 ? index / filteredCases.length : 0;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Ionicons name="arrow-back" size={24} color="#e3e2e3" />
      </TouchableOpacity>

      <Text style={styles.title}>
        {activeFilter !== 'all' ? `${CATALOG[activeFilter]?.label || ''} Şablonları` : 'Hazır Şablonlar'}
      </Text>
      <Text style={styles.hint}>Sağa swipe = bu bana uyar · sol = geç</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterContent}
      >
        {ALL_SPECIALTIES.map((spec) => {
          const entry = CATALOG[spec];
          const chipColor = entry?.accentColor || '#abcbdf';
          const label = spec === 'all' ? 'Tümü' : entry?.label || spec;
          const isActive = activeFilter === spec;
          return (
            <TouchableOpacity
              key={spec}
              style={[styles.chip, isActive && { backgroundColor: chipColor + '22', borderColor: chipColor }]}
              onPress={() => setActiveFilter(spec)}
              activeOpacity={0.75}
            >
              {entry && <Ionicons name={entry.icon} size={12} color={isActive ? chipColor : '#6B6B6B'} />}
              <Text style={[styles.chipText, isActive && { color: chipColor }]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: accent }]} />
      </View>
      <Text style={styles.progressLabel}>{index + 1} / {filteredCases.length}</Text>

      <Animated.View
        style={[styles.card, { transform: [{ translateX: position.x }, { rotate }] }]}
        {...panResponder.panHandlers}
      >
        <Animated.View style={[styles.badge, styles.likeBadge, { opacity: likeOpacity, borderColor: accent }]}>
          <Text style={[styles.likeText, { color: accent }]}>UYAR</Text>
        </Animated.View>
        <Animated.View style={[styles.badge, styles.skipBadge, { opacity: skipOpacity }]}>
          <Text style={styles.skipText}>GEÇ</Text>
        </Animated.View>

        <View style={styles.cardBody}>
          <View style={[styles.iconCircle, { backgroundColor: accent + '22' }]}>
            <Ionicons name={useCase.icon} size={28} color={accent} />
          </View>

          <Text style={styles.cardTitle}>{useCase.title}</Text>
          <Text style={styles.cardSubtitle}>{useCase.subtitle}</Text>

          <View style={[styles.specialtyChip, { backgroundColor: accent + '18', borderColor: accent + '33' }]}>
            <Ionicons name={catalogEntry?.icon} size={13} color={accent} />
            <Text style={[styles.specialtyLabel, { color: accent }]}>{catalogEntry?.label}</Text>
          </View>

          <View style={styles.componentList}>
            {resolvedComponents.map((comp) => (
              <View key={comp.id} style={styles.componentRow}>
                <View style={[styles.compDot, { backgroundColor: accent + '33' }]}>
                  <Ionicons name={comp.icon} size={10} color={accent} />
                </View>
                <Text style={styles.compName} numberOfLines={1}>{comp.name}</Text>
                <View style={[styles.peerChip, { backgroundColor: accent + '18' }]}>
                  <Text style={[styles.peerText, { color: accent }]}>{comp.peerSignal}%</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </Animated.View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.roundBtn} onPress={() => swipe('left')} activeOpacity={0.8}>
          <Ionicons name="close" size={28} color="#ffb4ab" />
          <Text style={styles.btnLabel}>Geç</Text>
        </TouchableOpacity>
        <Text style={styles.swipeHint}>swipe</Text>
        <TouchableOpacity
          style={[styles.roundBtn, { borderColor: accent }]}
          onPress={() => swipe('right')}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark" size={28} color={accent} />
          <Text style={[styles.btnLabel, { color: accent }]}>Uyar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121415', padding: 24, paddingTop: 64 },
  back: { marginBottom: 16 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#e3e2e3', marginBottom: 4 },
  hint: { fontSize: 13, color: '#6B6B6B', marginBottom: 12 },

  filterRow: { marginBottom: 12 },
  filterContent: { gap: 8, paddingRight: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: '#292a2b',
    backgroundColor: '#1e2021',
  },
  chipText: { fontSize: 12, fontWeight: '600', color: '#6B6B6B' },

  progressBar: { height: 3, backgroundColor: '#292a2b', borderRadius: 2, marginBottom: 6 },
  progressFill: { height: 3, borderRadius: 2 },
  progressLabel: { fontSize: 11, color: '#6B6B6B', marginBottom: 16 },

  card: {
    flex: 1, backgroundColor: '#1e2021', borderRadius: 24,
    overflow: 'hidden', borderWidth: 1, borderColor: '#292a2b',
  },
  badge: {
    position: 'absolute', top: 20, zIndex: 10,
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, borderWidth: 2,
  },
  likeBadge: { right: 20 },
  skipBadge: { left: 20, borderColor: '#ffb4ab' },
  likeText: { fontWeight: 'bold', fontSize: 14 },
  skipText: { color: '#ffb4ab', fontWeight: 'bold', fontSize: 14 },

  cardBody: { flex: 1, padding: 24, justifyContent: 'center', gap: 12 },
  iconCircle: {
    width: 56, height: 56, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', marginBottom: 4,
  },
  cardTitle: { fontSize: 22, fontWeight: 'bold', color: '#e3e2e3' },
  cardSubtitle: { fontSize: 14, color: '#c2c7cc', lineHeight: 20 },

  specialtyChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
    borderWidth: 1, alignSelf: 'flex-start',
  },
  specialtyLabel: { fontSize: 12, fontWeight: '600' },

  componentList: { gap: 8, marginTop: 4 },
  componentRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  compDot: { width: 22, height: 22, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  compName: { fontSize: 13, color: '#c2c7cc', flex: 1 },
  peerChip: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  peerText: { fontSize: 11, fontWeight: '600' },

  controls: {
    flexDirection: 'row', justifyContent: 'space-around',
    alignItems: 'center', paddingVertical: 24,
  },
  roundBtn: {
    alignItems: 'center', justifyContent: 'center',
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#1e2021', borderWidth: 1, borderColor: '#343536', gap: 4,
  },
  btnLabel: { fontSize: 11, color: '#6B6B6B', fontWeight: '600' },
  swipeHint: { fontSize: 11, color: '#292a2b', letterSpacing: 2 },
});
