/**
 * AvatarScene — 3D Avatar with Lipsync
 * Loads avatar.glb via expo-asset, renders with proper materials/lighting,
 * drives mouth morph targets from microphone RMS.
 */

import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Asset } from 'expo-asset';

// ── Morph target name lists ──────────────────────────────────────
const MOUTH_MORPH_TARGETS = [
  'jawOpen', 'mouthOpen', 'mouth_open',
  'viseme_aa', 'viseme_AA', 'mouthFunnel',
];
const BLINK_MORPH_TARGETS = [
  'eyeBlinkLeft', 'eyeBlinkRight', 'eyesClosed', 'blink',
];

// ── Types ────────────────────────────────────────────────────────
interface AvatarModelProps {
  uri: string;
  speakingIntensity: number;
}

type MorphBinding = {
  mesh: THREE.Mesh;
  mouthIndices: number[];
  blinkIndices: number[];
};

// ── Material fixer ───────────────────────────────────────────────
// Expo-GL can't load external textures reliably from GLB.
// If a texture has no valid image data, fall back to a solid colour
// derived from the material name.  Otherwise keep the original map.
function fixMaterials(mesh: THREE.Mesh) {
  const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

  for (const mat of mats) {
    if (!(mat instanceof THREE.MeshStandardMaterial)) continue;

    // Tone down metalness so skin / clothes don't look chrome-plated
    mat.roughness = Math.max(mat.roughness, 0.55);
    mat.metalness = Math.min(mat.metalness, 0.1);

    // Check if the texture was actually decoded
    const hasGoodMap = Boolean(mat.map?.image);
    if (hasGoodMap && mat.map) {
      mat.map.colorSpace = THREE.SRGBColorSpace;
      mat.map.needsUpdate = true;
    }

    if (!hasGoodMap) {
      // Apply a heuristic colour based on mesh / material name
      const n = (mesh.name + ' ' + mat.name).toLowerCase();
      if (n.includes('hair'))           mat.color.set('#4a2f1d');
      else if (n.includes('body') || n.includes('skin') || n.includes('head') || n.includes('face'))
                                        mat.color.set('#dba68a');
      else if (n.includes('eye'))       mat.color.set('#f5f5f5');
      else if (n.includes('teeth') || n.includes('tooth'))
                                        mat.color.set('#f0ebe0');
      else if (n.includes('shoe'))      mat.color.set('#151518');
      else if (n.includes('look') || n.includes('top') || n.includes('shirt'))
                                        mat.color.set('#1c2030');
      else                              mat.color.set('#b0a898');
    }

    mat.needsUpdate = true;
  }
}

// ── Avatar model component ───────────────────────────────────────
function AvatarModel({ uri, speakingIntensity }: AvatarModelProps) {
  const gltf = useLoader(GLTFLoader, uri);
  const { scene } = gltf;
  const groupRef  = useRef<THREE.Group | null>(null);
  const morphRef  = useRef<MorphBinding[]>([]);
  const elapsedRef = useRef(0);

  // Initial setup: fix materials, find morph targets, compute framing
  const [yOffset, setYOffset] = useState(-2);
  const [scale, setScale]     = useState(1);

  useEffect(() => {
    if (!scene) return;

    const morphBindings: MorphBinding[] = [];
    const allMorphNames = new Set<string>();

    scene.traverse((child: THREE.Object3D) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;

      // Fix materials/textures
      fixMaterials(mesh);

      // Collect morph targets
      const dict = mesh.morphTargetDictionary;
      const infl = mesh.morphTargetInfluences;
      if (!dict || !infl) return;

      Object.keys(dict).forEach((n) => allMorphNames.add(n));

      const mouthIdx: number[] = [];
      for (const t of MOUTH_MORPH_TARGETS) {
        if (dict[t] !== undefined) mouthIdx.push(dict[t]);
      }

      const blinkIdx: number[] = [];
      for (const t of BLINK_MORPH_TARGETS) {
        if (dict[t] !== undefined) blinkIdx.push(dict[t]);
      }

      if (mouthIdx.length > 0 || blinkIdx.length > 0) {
        morphBindings.push({ mesh, mouthIndices: mouthIdx, blinkIndices: blinkIdx });
      }
    });

    morphRef.current = morphBindings;

    // Log diagnostics
    console.log('[AvatarScene] morph targets found:', Array.from(allMorphNames));
    console.log('[AvatarScene] mouth bindings:', morphBindings.length);
    if (morphBindings.length === 0 && allMorphNames.size === 0) {
      console.warn('[AvatarScene] GLB has NO morph targets / blendshapes. Real lipsync requires a GLB exported with ARKit blendshapes (e.g. jawOpen, viseme_aa).');
    }

    // Compute bounding box to frame upper body
    scene.updateMatrixWorld(true);
    const box  = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const ctr  = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(ctr);

    const maxDim = Math.max(size.x, size.y, size.z);
    const s = maxDim > 0 ? 3.0 / maxDim : 1;   // tight portrait framing
    setScale(s);
    setYOffset(-ctr.y * s - 0.3);               // centre vertically, shifted slightly down
  }, [scene]);

  // Per-frame animation
  useFrame((_, delta) => {
    elapsedRef.current += delta;
    const t = elapsedRef.current;

    // ── Mouth morph targets ──
    const mouthTarget = Math.min(1, speakingIntensity * 1.6);
    // Natural blink every ~4s
    const blinkPhase = t % 4;
    const blinkVal = blinkPhase > 3.84 ? Math.sin(((blinkPhase - 3.84) / 0.16) * Math.PI) : 0;

    for (const b of morphRef.current) {
      const infl = b.mesh.morphTargetInfluences;
      if (!infl) continue;

      for (const idx of b.mouthIndices) {
        infl[idx] += (mouthTarget - infl[idx]) * 0.35;
      }
      for (const idx of b.blinkIndices) {
        infl[idx] += (blinkVal - infl[idx]) * 0.5;
      }
    }

    // ── Body stays STILL. No rotation, no sway. ──
    // (deliberately empty — no scene.rotation updates)
  });

  return (
    <group ref={groupRef} scale={scale} position={[0, yOffset, 0]}>
      <primitive object={scene} />
    </group>
  );
}

// ── Fallback when GLB fails ──────────────────────────────────────
function FallbackView() {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorText}>Missing or invalid avatar.glb</Text>
      <Text style={styles.errorSub}>
        Place a valid GLB file at app/assets/avatar.glb
      </Text>
    </View>
  );
}

// ── Error boundary ───────────────────────────────────────────────
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err: any) {
    console.warn('[AvatarScene ErrorBoundary]', err);
  }
  render() {
    return this.state.hasError ? <FallbackView /> : this.props.children;
  }
}

// ── Main export ──────────────────────────────────────────────────
interface AvatarSceneProps {
  speakingIntensity: number;
}

export default function AvatarScene({ speakingIntensity }: AvatarSceneProps) {
  const [assetUri, setAssetUri]       = useState<string | null>(null);
  const [hasAssetError, setHasAssetError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const asset = Asset.fromModule(require('../../assets/avatar.glb'));
        await asset.downloadAsync();
        const uri = asset.localUri || asset.uri;
        if (!uri) throw new Error('Asset URI is null');
        setAssetUri(uri);
      } catch (err) {
        console.warn('[AvatarScene] asset error:', err);
        setHasAssetError(true);
      }
    })();
  }, []);

  if (hasAssetError) {
    return <View style={styles.container}><FallbackView /></View>;
  }
  if (!assetUri) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#00D4AA" />
        <Text style={styles.loadingText}>Avatar yükleniyor…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ErrorBoundary>
        <Canvas
          camera={{ position: [0, 0.2, 2.4], fov: 30 }}
          shadows={false}
          gl={{ antialias: false, alpha: true }}
        >
          {/* Lighting: key + fill + ambient */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[2, 3, 4]} intensity={1.2} />
          <directionalLight position={[-2, 1, 2]} intensity={0.4} />

          <React.Suspense fallback={null}>
            <AvatarModel uri={assetUri} speakingIntensity={speakingIntensity} />
          </React.Suspense>
        </Canvas>
      </ErrorBoundary>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', height: '100%' },
  center:    { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#888', fontSize: 14 },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorIcon: { fontSize: 36, marginBottom: 12 },
  errorText: {
    color: '#ff6b6b', fontSize: 15, fontWeight: '600',
    textAlign: 'center', marginBottom: 6,
  },
  errorSub: {
    color: '#888', fontSize: 12, textAlign: 'center',
  },
});
