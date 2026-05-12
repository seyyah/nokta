import React, { useState, useRef, useContext } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, PanResponder, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../context/AppContext';
import { CATALOG } from '../data/catalog';
import StepBar from '../components/StepBar';
import ComponentPreview from '../components/ComponentPreview';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = 90;
const SWIPE_UP_THRESHOLD = 80;

export default function ReviewComponent({ navigation }) {
  const { t } = useTranslation();
  const { currentDraft, updateDraft } = useContext(AppContext);
  const specialty = currentDraft?.specialty || 'cardiologist';
  const catalogEntry = CATALOG[specialty] || CATALOG.cardiologist;
  const accent = catalogEntry.accentColor;
  const components = catalogEntry.components;

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState([]);
  const [superSelected, setSuperSelected] = useState([]);
  const position = useRef(new Animated.ValueXY()).current;
  const swipeFnRef = useRef(null);

  const swipe = (direction) => {
    const isSuper = direction === 'up';
    const isInclude = direction === 'right' || isSuper;
    const toX = isSuper ? 0 : direction === 'right' ? width * 1.5 : -width * 1.5;
    const toY = isSuper ? -600 : 0;
    const cid = components[index].id;
    const newSelected = isInclude ? [...selected, cid] : selected;
    const newSuper = isSuper ? [...superSelected, cid] : superSelected;

    Animated.timing(position, {
      toValue: { x: toX, y: toY },
      duration: 230,
      useNativeDriver: true,
    }).start(() => {
      if (index < components.length - 1) {
        setSelected(newSelected);
        if (isSuper) setSuperSelected(newSuper);
        setIndex((i) => i + 1);
        position.setValue({ x: 0, y: 0 });
      } else {
        updateDraft({ selectedComponents: newSelected, superComponents: newSuper });
        navigation.navigate('PrototypeComplete');
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
  const includeOpacity = position.x.interpolate({
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

  const includeOverlay = position.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 0.18],
    extrapolate: 'clamp',
  });
  const skipOverlay = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [0.18, 0],
    extrapolate: 'clamp',
  });
  const superOverlay = position.y.interpolate({
    inputRange: [-SWIPE_UP_THRESHOLD, 0],
    outputRange: [0.18, 0],
    extrapolate: 'clamp',
  });

  if (!components.length) return null;

  const component = components[index];
  if (!component) return null;
  const progress = index / components.length;
  const isHighSignal = component.peerSignal >= 70;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Ionicons name="arrow-back" size={24} color="#e3e2e3" />
      </TouchableOpacity>

      <StepBar step={3} accent={accent} />

      <Text style={styles.title}>{t('components.title')}</Text>

      <View style={styles.progressBar}>
        <Animated.View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: accent }]} />
      </View>
      <Text style={styles.progressLabel}>
        {index + 1} of {components.length} Â· {selected.length} selected
      </Text>

      <Animated.View
        style={[
          styles.card,
          { transform: [{ translateX: position.x }, { rotate }] },
        ]}
        {...panResponder.panHandlers}
      >
        <Animated.View style={[styles.overlay, { backgroundColor: accent, opacity: includeOverlay }]} pointerEvents="none" />
        <Animated.View style={[styles.overlay, { backgroundColor: '#ffb4ab', opacity: skipOverlay }]} pointerEvents="none" />
        <Animated.View style={[styles.overlay, { backgroundColor: '#c5e8c5', opacity: superOverlay }]} pointerEvents="none" />

        <Animated.View style={[styles.badge, styles.includeBadge, { opacity: includeOpacity, borderColor: accent }]}>
          <Text style={[styles.includeText, { color: accent }]}>INCLUDE</Text>
        </Animated.View>
        <Animated.View style={[styles.badge, styles.skipBadge, { opacity: skipOpacity }]}>
          <Text style={styles.skipText}>SKIP</Text>
        </Animated.View>
        <Animated.View style={[styles.badge, styles.superBadge, { opacity: superOpacity }]}>
          <Text style={styles.superText}>SÜPER ✦</Text>
        </Animated.View>

        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconWrap, { backgroundColor: accent + '22' }]}>
              <Ionicons name={component.icon} size={20} color={accent} />
            </View>
            <Text style={styles.cardTitle}>{component.name}</Text>
          </View>

          <View style={styles.previewArea}>
            <ComponentPreview
              pattern={component.ui_pattern}
              sampleContent={component.sample_content}
              accent={accent}
            />
          </View>

          <View style={[styles.signalWrap, isHighSignal && { backgroundColor: accent + '18' }]}>
            <Ionicons name="people" size={14} color={isHighSignal ? accent : '#6B6B6B'} />
            <Text style={[styles.signalText, isHighSignal && { color: accent }]}>
              {component.peerSignal}% of {catalogEntry.label} apps include this
            </Text>
            {!isHighSignal && <Text style={styles.unverified}> [UNVERIFIED]</Text>}
          </View>
        </View>
      </Animated.View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.roundBtn} onPress={() => swipe('left')} activeOpacity={0.8}>
          <Ionicons name="close" size={28} color="#ffb4ab" />
          <Text style={styles.btnLabel}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.roundBtn, styles.superBtn]} onPress={() => swipe('up')} activeOpacity={0.8}>
          <Ionicons name="arrow-up" size={26} color="#c5e8c5" />
          <Text style={[styles.btnLabel, { color: '#c5e8c5' }]}>Süper</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roundBtn, { borderColor: accent }]}
          onPress={() => swipe('right')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color={accent} />
          <Text style={[styles.btnLabel, { color: accent }]}>Include</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121415', padding: 24, paddingTop: 64 },
  back: { marginBottom: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#e3e2e3', marginBottom: 16 },

  progressBar: { height: 3, backgroundColor: '#292a2b', borderRadius: 2, marginBottom: 8 },
  progressFill: { height: 3, borderRadius: 2 },
  progressLabel: { fontSize: 12, color: '#6B6B6B', marginBottom: 20 },

  card: {
    flex: 1, backgroundColor: '#1e2021', borderRadius: 24,
    overflow: 'hidden', borderWidth: 1, borderColor: '#292a2b', justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
    borderRadius: 24,
  },
  badge: {
    position: 'absolute', top: 24, zIndex: 10,
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 2,
  },
  includeBadge: { right: 24 },
  skipBadge: { left: 24, borderColor: '#ffb4ab' },
  superBadge: { alignSelf: 'center', top: 24, borderColor: '#c5e8c5' },
  includeText: { fontWeight: 'bold', fontSize: 15 },
  skipText: { color: '#ffb4ab', fontWeight: 'bold', fontSize: 15 },
  superText: { color: '#c5e8c5', fontWeight: 'bold', fontSize: 15 },

  cardBody: { padding: 20, flex: 1, justifyContent: 'space-between' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  iconWrap: {
    width: 32, height: 32, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#e3e2e3', flex: 1 },
  previewArea: { flex: 1, justifyContent: 'center', marginBottom: 16 },

  signalWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#292a2b', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
  },
  signalText: { fontSize: 13, color: '#6B6B6B', marginLeft: 6 },
  unverified: { fontSize: 10, color: '#343536' },

  controls: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 24 },
  roundBtn: {
    alignItems: 'center', justifyContent: 'center',
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#1e2021', borderWidth: 1, borderColor: '#343536', gap: 4,
  },
  superBtn: { borderColor: '#c5e8c5' },
  btnLabel: { fontSize: 11, color: '#6B6B6B', fontWeight: '600' },
});

