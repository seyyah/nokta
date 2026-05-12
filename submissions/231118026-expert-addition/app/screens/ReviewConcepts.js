import React, { useState, useRef, useContext } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, PanResponder, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { CATALOG } from '../data/catalog';
import StepBar from '../components/StepBar';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = 90;
const SWIPE_UP_THRESHOLD = 80;

// Mini wireframe layouts per style â€” each concept has a different visual density/rhythm
function MiniAppPreview({ concept, accent }) {
  const isDense = concept.density === 'dense';
  const isWarm = concept.density === 'warm';

  return (
    <View style={[miniStyles.screen, { backgroundColor: concept.bg }]}>
      {/* Status bar */}
      <View style={miniStyles.statusBar}>
        <View style={[miniStyles.statusDot, { backgroundColor: accent + '88' }]} />
        <View style={[miniStyles.statusDot, { backgroundColor: accent + '44', width: 24 }]} />
      </View>

      {/* App header */}
      <View style={[miniStyles.appHeader, isDense && { paddingVertical: 6 }]}>
        <View style={[miniStyles.avatar, { backgroundColor: accent + '33' }]}>
          <View style={[miniStyles.avatarDot, { backgroundColor: accent }]} />
        </View>
        <View style={miniStyles.headerText}>
          <View style={[miniStyles.bar, { width: 60, backgroundColor: accent + 'cc' }]} />
          <View style={[miniStyles.bar, { width: 40, backgroundColor: accent + '44', marginTop: 4 }]} />
        </View>
      </View>

      {/* Primary CTA */}
      <View style={[miniStyles.cta, { backgroundColor: accent, marginHorizontal: isDense ? 8 : 14 }]}>
        <View style={[miniStyles.bar, { width: 70, backgroundColor: '#121415cc' }]} />
      </View>

      {/* Feature grid */}
      <View style={[miniStyles.grid, { gap: isDense ? 4 : 8, marginHorizontal: isDense ? 8 : 14 }]}>
        {[0, 1].map((i) => (
          <View key={i} style={[
            miniStyles.gridItem,
            { backgroundColor: accent + '11', borderColor: accent + '22' }
          ]}>
            <View style={[miniStyles.gridIcon, { backgroundColor: accent + '33' }]} />
            <View style={[miniStyles.bar, { width: 32, backgroundColor: accent + '66', marginTop: 6 }]} />
          </View>
        ))}
      </View>

      {/* Bottom tab bar */}
      <View style={miniStyles.tabBar}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[
            miniStyles.tabDot,
            i === 0 && { backgroundColor: accent }
          ]} />
        ))}
      </View>
    </View>
  );
}

export default function ReviewConcepts({ navigation }) {
  const { currentDraft, updateDraft } = useContext(AppContext);
  const specialty = currentDraft?.specialty || 'cardiologist';
  const concepts = CATALOG[specialty]?.styleConcepts || [];

  const [index, setIndex] = useState(0);
  const [likes, setLikes] = useState([]);
  const [superIndex, setSuperIndex] = useState(null);
  const position = useRef(new Animated.ValueXY()).current;
  const swipeFnRef = useRef(null);

  const finish = (newLikes, newSuper) => {
    const preferred = newSuper !== null
      ? newSuper
      : newLikes.length > 0
        ? newLikes[newLikes.length - 1]
        : concepts.length - 1;
    updateDraft({ stylePreference: preferred, superStyle: newSuper });
    navigation.navigate('ReviewComponent');
  };

  const swipe = (direction) => {
    const isSuper = direction === 'up';
    const isLike = direction === 'right' || isSuper;
    const toX = isSuper ? 0 : direction === 'right' ? width * 1.5 : -width * 1.5;
    const toY = isSuper ? -600 : 0;
    const newLikes = isLike ? [...likes, index] : likes;
    const newSuper = isSuper ? index : superIndex;

    Animated.timing(position, {
      toValue: { x: toX, y: toY },
      duration: 230,
      useNativeDriver: true,
    }).start(() => {
      if (index < concepts.length - 1) {
        setLikes(newLikes);
        if (isSuper) setSuperIndex(index);
        setIndex((i) => i + 1);
        position.setValue({ x: 0, y: 0 });
      } else {
        finish(newLikes, newSuper);
      }
    });
  };

  swipeFnRef.current = swipe;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => position.setValue({ x: g.dx, y: g.dy }),
      onPanResponderRelease: (_, g) => {
        if (g.dy < -SWIPE_UP_THRESHOLD && Math.abs(g.dx) < SWIPE_THRESHOLD) {
          swipeFnRef.current('up');
        } else if (g.dx > SWIPE_THRESHOLD) {
          swipeFnRef.current('right');
        } else if (g.dx < -SWIPE_THRESHOLD) {
          swipeFnRef.current('left');
        } else {
          Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
        }
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
  const superOpacity = position.y.interpolate({
    inputRange: [-SWIPE_UP_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const likeOverlay = position.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 0.15],
    extrapolate: 'clamp',
  });
  const skipOverlay = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [0.15, 0],
    extrapolate: 'clamp',
  });
  const superOverlay = position.y.interpolate({
    inputRange: [-SWIPE_UP_THRESHOLD, 0],
    outputRange: [0.15, 0],
    extrapolate: 'clamp',
  });

  if (!concepts.length) return null;
  const concept = concepts[index];
  if (!concept) return null;

  const accentForBar = CATALOG[specialty]?.accentColor || '#abcbdf';

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color="#e3e2e3" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('EditComponents')}
          style={styles.editBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={18} color="#abcbdf" />
          <Text style={styles.editBtnText}>Düzenle</Text>
        </TouchableOpacity>
      </View>

      <StepBar step={2} accent={accentForBar} />

      <Text style={styles.title}>Which feels right?</Text>
      <Text style={styles.hint}>Swipe right to like · left to skip</Text>

      <Animated.View
        style={[styles.card, { transform: [{ translateX: position.x }, { rotate }] }]}
        {...panResponder.panHandlers}
      >
        <Animated.View style={[styles.overlay, { backgroundColor: concept.accent, opacity: likeOverlay }]} pointerEvents="none" />
        <Animated.View style={[styles.overlay, { backgroundColor: '#ffb4ab', opacity: skipOverlay }]} pointerEvents="none" />
        <Animated.View style={[styles.overlay, { backgroundColor: '#c5e8c5', opacity: superOverlay }]} pointerEvents="none" />

        <Animated.View style={[styles.badge, styles.likeBadge, { opacity: likeOpacity }]}>
          <Text style={styles.likeText}>LIKE</Text>
        </Animated.View>
        <Animated.View style={[styles.badge, styles.skipBadge, { opacity: skipOpacity }]}>
          <Text style={styles.skipText}>SKIP</Text>
        </Animated.View>
        <Animated.View style={[styles.badge, styles.superBadge, { opacity: superOpacity }]}>
          <Text style={styles.superText}>SÜPER ✦</Text>
        </Animated.View>

        <View style={styles.previewWrap}>
          <MiniAppPreview concept={concept} accent={concept.accent} />
        </View>

        <View style={styles.cardFooter}>
          <Text style={[styles.conceptTitle, { color: concept.accent }]}>{concept.title}</Text>
          <Text style={styles.conceptSub}>{concept.subtitle}</Text>
          <Text style={styles.counter}>{index + 1} of {concepts.length}</Text>
        </View>
      </Animated.View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.roundBtn} onPress={() => swipe('left')}>
          <Ionicons name="close" size={28} color="#ffb4ab" />
          <Text style={styles.btnLabel}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.roundBtn, styles.superBtn]} onPress={() => swipe('up')}>
          <Ionicons name="arrow-up" size={26} color="#c5e8c5" />
          <Text style={[styles.btnLabel, { color: '#c5e8c5' }]}>Süper</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.roundBtn, styles.likeBtn]} onPress={() => swipe('right')}>
          <Ionicons name="heart" size={28} color="#abcbdf" />
          <Text style={[styles.btnLabel, { color: '#abcbdf' }]}>Like</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const miniStyles = StyleSheet.create({
  screen: { flex: 1, paddingTop: 10 },
  statusBar: { flexDirection: 'row', paddingHorizontal: 14, gap: 4, marginBottom: 10 },
  statusDot: { height: 4, width: 16, borderRadius: 2 },
  appHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  avatar: { width: 28, height: 28, borderRadius: 8 },
  avatarDot: { width: 10, height: 10, borderRadius: 3, margin: 9 },
  headerText: { flex: 1 },
  bar: { height: 7, borderRadius: 4 },
  cta: {
    height: 32,
    borderRadius: 10,
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: { flexDirection: 'row' },
  gridItem: {
    flex: 1,
    height: 64,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  gridIcon: { width: 20, height: 20, borderRadius: 6 },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: '#ffffff11',
  },
  tabDot: { width: 20, height: 4, borderRadius: 2, backgroundColor: '#ffffff22' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121415', padding: 24, paddingTop: 64 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  back: {},
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#1e2021',
    borderWidth: 1,
    borderColor: '#292a2b',
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#abcbdf',
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#e3e2e3', marginBottom: 4 },
  hint: { fontSize: 13, color: '#6B6B6B', marginBottom: 20 },

  card: {
    flex: 1,
    backgroundColor: '#1e2021',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#292a2b',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
    borderRadius: 24,
  },
  badge: {
    position: 'absolute', top: 16, zIndex: 10,
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 8, borderWidth: 2,
  },
  likeBadge: { right: 16, borderColor: '#abcbdf' },
  skipBadge: { left: 16, borderColor: '#ffb4ab' },
  superBadge: { alignSelf: 'center', top: 16, borderColor: '#c5e8c5' },
  likeText: { color: '#abcbdf', fontWeight: 'bold', fontSize: 14 },
  skipText: { color: '#ffb4ab', fontWeight: 'bold', fontSize: 14 },
  superText: { color: '#c5e8c5', fontWeight: 'bold', fontSize: 14 },

  previewWrap: { flex: 1 },
  cardFooter: { padding: 20, backgroundColor: '#1e2021', borderTopWidth: 1, borderTopColor: '#292a2b' },
  conceptTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  conceptSub: { fontSize: 13, color: '#c2c7cc', lineHeight: 18, marginBottom: 8 },
  counter: { fontSize: 11, color: '#6B6B6B' },

  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 24,
  },
  roundBtn: {
    alignItems: 'center', justifyContent: 'center',
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#1e2021',
    borderWidth: 1, borderColor: '#292a2b',
    gap: 4,
  },
  likeBtn: { borderColor: '#abcbdf' },
  superBtn: { borderColor: '#c5e8c5' },
  btnLabel: { fontSize: 11, color: '#6B6B6B', fontWeight: '600' },
});

