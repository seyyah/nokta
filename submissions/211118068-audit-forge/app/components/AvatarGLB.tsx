import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import {
  PanResponder,
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
} from 'react-native';
import { Canvas, useFrame, useThree } from '@react-three/fiber/native';
import * as THREE from 'three';
import {
  applyMouthOpen,
  FACE_CAMERA_POS,
  FACE_LOOK_AT,
} from '../lib/normalizeAvatarScene';
import { loadAvatarGlb, resolveAvatarLoaderUri } from '../lib/loadAvatarGlb';

type Props = {
  mouthOpen: number;
  onError: (reason: string) => void;
};

function FaceCamera() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(...FACE_CAMERA_POS);
    camera.lookAt(new THREE.Vector3(...FACE_LOOK_AT));
    if ('fov' in camera) {
      (camera as THREE.PerspectiveCamera).fov = 26;
      (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    }
  }, [camera]);
  return null;
}

function AvatarModel({
  mouthOpen,
  root,
  dragYRef,
}: {
  mouthOpen: number;
  root: THREE.Group;
  dragYRef: MutableRefObject<number>;
}) {
  const pivot = useRef<THREE.Group>(null);

  useFrame(() => {
    if (pivot.current) {
      pivot.current.rotation.y = dragYRef.current;
    }
    applyMouthOpen(root, mouthOpen);
  });

  return (
    <group ref={pivot}>
      <primitive object={root} />
    </group>
  );
}

export function AvatarGLB({ mouthOpen, onError }: Props) {
  const [root, setRoot] = useState<THREE.Group | null>(null);
  const [pct, setPct] = useState(0);
  const [label, setLabel] = useState('Model hazırlanıyor…');
  const dragY = useRef(0);

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => {
        dragY.current += g.dx * 0.008;
      },
    })
  ).current;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setPct(12);
        setLabel('avatar.glb indiriliyor…');
        const uri = await resolveAvatarLoaderUri();
        if (cancelled) return;

        setPct(35);
        setLabel('Texture\'lar ayrıştırılıyor…');
        const scene = await loadAvatarGlb(uri);
        if (cancelled) return;

        setPct(100);
        setLabel('Hazır');
        setRoot(scene);
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : 'yüklenemedi';
          onError(msg);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [onError]);

  if (!root) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#38BDF8" size="large" />
        <Text style={styles.pct}>{pct}%</Text>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${pct}%` }]} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap} {...pan.panHandlers}>
      <Canvas
        camera={{ position: FACE_CAMERA_POS, fov: 30, near: 0.08, far: 100 }}
        frameloop="always"
        gl={{ powerPreference: 'low-power' }}
        onCreated={({ gl }) => {
          // expo-gl linear framebuffer — gamma dönüşümü yok.
          // LinearToneMapping + exposure, karardığı kadar geri açar.
          gl.outputColorSpace = 'srgb-linear';
          gl.toneMapping = 1; // THREE.LinearToneMapping
          gl.toneMappingExposure = 1.8;
        }}
      >
        <FaceCamera />
        <color attach="background" args={['#0B1220']} />
        <ambientLight intensity={0.65} />
        <directionalLight position={[1.5, 2.5, 2]} intensity={0.9} />
        <directionalLight position={[-2, 1.2, 1.5]} intensity={0.35} />
        <AvatarModel mouthOpen={mouthOpen} root={root} dragYRef={dragY} />
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, minHeight: 280 },
  loading: {
    minHeight: 280,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B1220',
    gap: 8,
    padding: 16,
  },
  pct: { color: '#38BDF8', fontSize: 26, fontWeight: '800' },
  label: { color: '#94A3B8', fontSize: 12, textAlign: 'center' },
  barTrack: {
    width: '80%',
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1E293B',
    overflow: 'hidden',
    marginTop: 4,
  },
  barFill: {
    height: '100%',
    backgroundColor: '#38BDF8',
    borderRadius: 3,
  },
});
