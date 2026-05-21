import React, { useRef, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  PanResponder,
  Dimensions,
} from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('screen');

/**
 * @param {{
 *   screenshotUri: string;
 *   captureRef: (ref: React.RefObject<any>) => Promise<string>;
 *   onConfirm: (bounds: { x: number; y: number; width: number; height: number }, annotatedUri: string) => void;
 *   onCancel: () => void;
 * }} props
 */
export function AuditSelector({ screenshotUri, captureRef, onConfirm, onCancel }) {
  const [box, setBox] = useState(/** @type {{ x: number; y: number; w: number; h: number } | null} */ (null));
  const [burning, setBurning] = useState(false);
  /** @type {React.MutableRefObject<{ x: number; y: number } | null>} */
  const startPage = useRef(null);
  /** @type {React.RefObject<View>} */
  const compositeRef = useRef(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (e) => {
        const { pageX, pageY } = e.nativeEvent;
        startPage.current = { x: pageX, y: pageY };
        setBox({ x: pageX, y: pageY, w: 0, h: 0 });
      },

      onPanResponderMove: (_, gs) => {
        if (!startPage.current) return;
        const { x, y } = startPage.current;
        const w = gs.dx;
        const h = gs.dy;
        setBox({
          x: w < 0 ? x + w : x,
          y: h < 0 ? y + h : y,
          w: Math.abs(w),
          h: Math.abs(h),
        });
      },

      onPanResponderRelease: () => {},
    })
  ).current;

  const handleConfirm = async () => {
    if (!box || box.w < 10 || box.h < 10) return;
    setBurning(true);
    try {
      const annotatedUri = await captureRef(compositeRef);
      onConfirm({ x: box.x, y: box.y, width: box.w, height: box.h }, annotatedUri);
    } catch (e) {
      console.warn('[AuditSelector] captureRef failed:', e);
    } finally {
      setBurning(false);
    }
  };

  const hasBox = box && box.w > 10 && box.h > 10;

  return (
    <View style={styles.container}>
      <View ref={compositeRef} style={styles.composite} collapsable={false}>
        <Image
          source={{ uri: screenshotUri }}
          style={styles.screenshot}
          resizeMode="stretch"
        />
        {box && box.w > 2 && box.h > 2 && (
          <View
            pointerEvents="none"
            style={[styles.selectionBox, { left: box.x, top: box.y, width: box.w, height: box.h }]}
          />
        )}
      </View>

      <View style={styles.overlay} pointerEvents="none" />

      {box && box.w > 2 && box.h > 2 && (
        <View
          pointerEvents="none"
          style={[styles.selectionBoxOverlay, { left: box.x, top: box.y, width: box.w, height: box.h }]}
        />
      )}

      <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers} />

      <View style={styles.topBar} pointerEvents="none">
        <Text style={styles.instruction}>
          {hasBox ? 'Seçim tamam — onayla veya yeniden çiz' : 'Sorunlu alanı işaretle'}
        </Text>
      </View>

      <View style={styles.bottomBar} pointerEvents="box-none">
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} disabled={burning}>
          <Text style={styles.cancelText}>İptal</Text>
        </TouchableOpacity>
        {hasBox && (
          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} disabled={burning}>
            {burning ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.confirmText}>Devam →</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_W,
    height: SCREEN_H,
    zIndex: 10000,
  },
  composite: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_W,
    height: SCREEN_H,
  },
  screenshot: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_W,
    height: SCREEN_H,
  },
  selectionBox: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: '#f6e05e',
    backgroundColor: 'rgba(246,224,94,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagIcon: {
    fontSize: 22,
    lineHeight: 26,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  selectionBoxOverlay: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: '#f6e05e',
    backgroundColor: 'rgba(246,224,94,0.15)',
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instruction: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 48,
    left: 24,
    right: 24,
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cancelText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  confirmBtn: {
    flex: 2,
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: '#e53e3e',
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
