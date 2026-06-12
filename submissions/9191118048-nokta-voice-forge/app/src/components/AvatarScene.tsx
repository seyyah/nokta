/**
 * AvatarScene — 3D Avatar with Lipsync
 *
 * Handles GLB files whose textures are embedded as base64 data-URIs
 * (which React Native / expo-gl cannot load natively).
 *
 * Pipeline:
 *   1. expo-asset  → download the bundled avatar.glb
 *   2. Parse GLB binary → extract JSON + BIN chunks
 *   3. For every image that uses  data:image/…;base64,…  →
 *        decode, write to cache dir as a real .jpg/.png
 *   4. For every image stored as a bufferView  →
 *        slice from BIN, write to cache dir
 *   5. Rewrite GLTF JSON: images now reference local filenames
 *   6. Write modified .gltf + .bin to cache dir
 *   7. Load the .gltf with GLTFLoader (textures resolve to file:// URIs)
 */

import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Asset } from 'expo-asset';
import { File as ExpoFile, Directory, Paths } from 'expo-file-system';

// ── GLB constants ────────────────────────────────────────────────
const GLB_MAGIC  = 0x46546C67; // 'glTF'
const JSON_CHUNK = 0x4E4F534A; // 'JSON'
const BIN_CHUNK  = 0x004E4942; // 'BIN\0'

// ── Morph-target name lists ──────────────────────────────────────
const MOUTH_TARGETS = [
  'jawOpen', 'mouthOpen', 'mouth_open',
  'viseme_aa', 'viseme_AA', 'mouthFunnel',
];
const BLINK_TARGETS = [
  'eyeBlinkLeft', 'eyeBlinkRight', 'eyesClosed', 'blink',
];

// ── Types ────────────────────────────────────────────────────────
interface MorphBinding {
  mesh: THREE.Mesh;
  mouthIdx: number[];
  blinkIdx: number[];
}

// ── Helpers ──────────────────────────────────────────────────────
function b64ToBytes(b64: string): Uint8Array {
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

// ── GLB texture extraction ───────────────────────────────────────
function extractGlbTextures(resolvedUri: string): string {
  console.log('[AvatarScene] Inspecting GLB for embedded textures…');

  const srcFile = new ExpoFile(resolvedUri);
  const raw: Uint8Array = srcFile.bytes();
  const view = new DataView(raw.buffer, raw.byteOffset, raw.byteLength);

  // ── verify magic ──
  if (raw.byteLength < 12 || view.getUint32(0, true) !== GLB_MAGIC) {
    console.log('[AvatarScene] Not a GLB — loading as-is');
    return resolvedUri;
  }

  // ── parse chunks ──
  let jsonBytes: Uint8Array | null = null;
  let binBytes:  Uint8Array | null = null;
  let off = 12;
  while (off + 8 <= raw.byteLength) {
    const len   = view.getUint32(off, true);
    const type  = view.getUint32(off + 4, true);
    const start = off + 8;
    const end   = start + len;
    if (end > raw.byteLength) break;
    if (type === JSON_CHUNK) jsonBytes = raw.slice(start, end);
    else if (type === BIN_CHUNK) binBytes = raw.slice(start, end);
    off = end;
  }
  if (!jsonBytes) { console.warn('[AvatarScene] no JSON chunk'); return resolvedUri; }

  // ── parse GLTF JSON ──
  const jsonStr = new TextDecoder().decode(jsonBytes).replace(/\0+$/, '');
  const gltf: any = JSON.parse(jsonStr);
  const images: any[] = gltf.images ?? [];

  const needsExtraction = images.some(
    (img: any) =>
      (typeof img.uri === 'string' && img.uri.startsWith('data:')) ||
      img.bufferView !== undefined,
  );
  if (!needsExtraction) {
    console.log('[AvatarScene] No embedded textures — loading original');
    return resolvedUri;
  }

  // ── create cache dir ──
  const cacheDir = new Directory(Paths.cache, 'avatar-tex-cache');
  cacheDir.create({ intermediates: true, idempotent: true });

  let count = 0;
  for (let i = 0; i < images.length; i++) {
    const img = images[i];

    // — data URI ———————————————————————————
    if (typeof img.uri === 'string' && img.uri.startsWith('data:image/')) {
      const m = img.uri.match(/^data:image\/(png|jpe?g|webp);base64,(.+)$/i);
      if (m) {
        const ext  = m[1].toLowerCase().replace('jpeg', 'jpg');
        const name = `tex_${i}.${ext}`;
        try {
          const bytes = b64ToBytes(m[2]);
          new ExpoFile(cacheDir, name).write(bytes);
          img.uri = name;
          count++;
          console.log(`[AvatarScene] extracted data-URI → ${name}  (${bytes.length} B)`);
        } catch (e) {
          console.warn(`[AvatarScene] base64 decode failed for image ${i}`, e);
        }
      }
      continue;
    }

    // — bufferView ————————————————————————————
    if (img.bufferView !== undefined && binBytes) {
      const bv = gltf.bufferViews?.[img.bufferView];
      if (bv) {
        const bOff = bv.byteOffset ?? 0;
        const bLen = bv.byteLength;
        const slice = binBytes.slice(bOff, bOff + bLen);
        const mime = img.mimeType ?? 'image/png';
        const ext  = /jpe?g/i.test(mime) ? 'jpg' : 'png';
        const name = `tex_${i}.${ext}`;
        new ExpoFile(cacheDir, name).write(slice);
        img.uri = name;
        delete img.bufferView;
        delete img.mimeType;
        count++;
        console.log(`[AvatarScene] extracted bufferView → ${name}  (${slice.length} B)`);
      }
    }
  }

  // ── write BIN ──
  if (binBytes) {
    new ExpoFile(cacheDir, 'avatar.bin').write(binBytes);
    if (gltf.buffers?.[0]) {
      gltf.buffers[0].uri = 'avatar.bin';
      gltf.buffers[0].byteLength = binBytes.byteLength;
    }
  }

  // ── write modified GLTF ──
  const gltfFile = new ExpoFile(cacheDir, 'avatar.gltf');
  gltfFile.write(JSON.stringify(gltf));
  console.log(`[AvatarScene] ✅ Prepared mobile GLTF (${count} textures extracted)`);
  return gltfFile.uri;
}

// ── Material fixer ───────────────────────────────────────────────
function fixMaterials(mesh: THREE.Mesh) {
  const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  for (const mat of mats) {
    if (!(mat instanceof THREE.MeshStandardMaterial)) continue;

    mat.roughness = Math.max(mat.roughness, 0.55);
    mat.metalness = Math.min(mat.metalness, 0.1);

    if (mat.map) {
      mat.map.colorSpace = THREE.SRGBColorSpace;
      mat.map.needsUpdate = true;
    }

    // Fallback colour only when there is NO texture at all
    if (!mat.map) {
      const n = (mesh.name + ' ' + mat.name).toLowerCase();
      if (n.includes('hair'))                                       mat.color.set('#4a2f1d');
      else if (n.match(/body|skin|head|face/))                      mat.color.set('#dba68a');
      else if (n.includes('eye'))                                   mat.color.set('#f5f5f5');
      else if (n.match(/teeth|tooth/))                              mat.color.set('#f0ebe0');
      else if (n.includes('shoe'))                                  mat.color.set('#151518');
      else if (n.match(/top|shirt|look|jacket|hoodie/))             mat.color.set('#1c2030');
      else                                                          mat.color.set('#b0a898');
    }

    mat.needsUpdate = true;
  }
}

// ── AvatarModel ──────────────────────────────────────────────────
function AvatarModel({ uri, speakingIntensity }: { uri: string; speakingIntensity: number }) {
  const gltf = useLoader(GLTFLoader, uri);
  const { scene } = gltf;
  const groupRef   = useRef<THREE.Group>(null);
  const morphRef   = useRef<MorphBinding[]>([]);
  const elapsedRef = useRef(0);
  const [yOff, setYOff]   = useState(-2);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!scene) return;

    const bindings: MorphBinding[] = [];
    const allNames = new Set<string>();
    const boneNames: string[] = [];

    scene.traverse((child: THREE.Object3D) => {
      // Collect bone names for diagnostics
      if ((child as any).isBone) boneNames.push(child.name);

      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      fixMaterials(mesh);

      const dict = mesh.morphTargetDictionary;
      const infl = mesh.morphTargetInfluences;
      if (!dict || !infl) return;

      Object.keys(dict).forEach((n) => allNames.add(n));
      const mIdx: number[] = [];
      for (const t of MOUTH_TARGETS) if (dict[t] !== undefined) mIdx.push(dict[t]);
      const bIdx: number[] = [];
      for (const t of BLINK_TARGETS) if (dict[t] !== undefined) bIdx.push(dict[t]);
      if (mIdx.length || bIdx.length) bindings.push({ mesh, mouthIdx: mIdx, blinkIdx: bIdx });
    });

    morphRef.current = bindings;

    // Diagnostics
    console.log('[AvatarScene] morph target names:', Array.from(allNames));
    console.log('[AvatarScene] mouth morph bindings:', bindings.reduce((a, b) => a + b.mouthIdx.length, 0));
    console.log('[AvatarScene] blink morph bindings:', bindings.reduce((a, b) => a + b.blinkIdx.length, 0));
    console.log('[AvatarScene] bones sample:', boneNames.slice(0, 15));
    if (bindings.length === 0 && allNames.size === 0) {
      console.warn(
        '[AvatarScene] ⚠️ GLB has NO morph targets / blendshapes.\n' +
        'Real lip-sync needs a GLB exported with ARKit blendshapes (jawOpen, viseme_aa …).\n' +
        'Bones found: ' + (boneNames.length > 0 ? boneNames.join(', ') : 'none'),
      );
    }

    // Compute framing
    scene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const ctr  = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(ctr);
    const maxDim = Math.max(size.x, size.y, size.z);
    const s = maxDim > 0 ? 3.0 / maxDim : 1;
    setScale(s);
    setYOff(-ctr.y * s - 0.3);
  }, [scene]);

  // Per-frame lipsync
  useFrame((_, dt) => {
    elapsedRef.current += dt;
    const t = elapsedRef.current;
    const mouthTarget = Math.min(1, speakingIntensity * 1.6);
    const blinkPhase = t % 4;
    const blinkVal = blinkPhase > 3.84 ? Math.sin(((blinkPhase - 3.84) / 0.16) * Math.PI) : 0;

    for (const b of morphRef.current) {
      const inf = b.mesh.morphTargetInfluences;
      if (!inf) continue;
      for (const i of b.mouthIdx) inf[i] += (mouthTarget - inf[i]) * 0.35;
      for (const i of b.blinkIdx) inf[i] += (blinkVal   - inf[i]) * 0.50;
    }
    // Body stays completely still — no rotation, no sway.
  });

  return (
    <group ref={groupRef} scale={scale} position={[0, yOff, 0]}>
      <primitive object={scene} />
    </group>
  );
}

// ── Fallback view ────────────────────────────────────────────────
function FallbackView() {
  return (
    <View style={styles.errorBox}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorText}>Missing or invalid avatar.glb</Text>
      <Text style={styles.errorSub}>Place a valid GLB at app/assets/avatar.glb</Text>
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
  componentDidCatch(err: any) { console.warn('[AvatarScene EB]', err); }
  render() {
    return this.state.hasError ? <FallbackView /> : this.props.children;
  }
}

// ── Main export ──────────────────────────────────────────────────
export default function AvatarScene({ speakingIntensity }: { speakingIntensity: number }) {
  const [modelUri, setModelUri]     = useState<string | null>(null);
  const [loadError, setLoadError]   = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // 1. Download bundled GLB via expo-asset
        const asset = Asset.fromModule(require('../../assets/avatar.glb'));
        await asset.downloadAsync();
        const rawUri = asset.localUri || asset.uri;
        if (!rawUri) throw new Error('Asset URI is null');

        // 2. Extract embedded textures → mobile-compatible GLTF
        const preparedUri = extractGlbTextures(rawUri);
        setModelUri(preparedUri);
      } catch (err) {
        console.warn('[AvatarScene] asset error:', err);
        setLoadError(true);
      }
    })();
  }, []);

  if (loadError) return <View style={styles.root}><FallbackView /></View>;

  if (!modelUri) {
    return (
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator size="large" color="#00D4AA" />
        <Text style={styles.loadingText}>Avatar yükleniyor…</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ErrorBoundary>
        <Canvas
          camera={{ position: [0, 0.2, 2.4], fov: 30 }}
          shadows={false}
          gl={{ antialias: false, alpha: true }}
        >
          <ambientLight intensity={0.65} />
          <directionalLight position={[2, 3, 4]}  intensity={1.2} />
          <directionalLight position={[-2, 1, 2]} intensity={0.4} />
          <React.Suspense fallback={null}>
            <AvatarModel uri={modelUri} speakingIntensity={speakingIntensity} />
          </React.Suspense>
        </Canvas>
      </ErrorBoundary>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root:        { width: '100%', height: '100%' },
  center:      { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#888', fontSize: 14 },
  errorBox:    { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorIcon:   { fontSize: 36, marginBottom: 12 },
  errorText:   { color: '#ff6b6b', fontSize: 15, fontWeight: '600', textAlign: 'center', marginBottom: 6 },
  errorSub:    { color: '#888', fontSize: 12, textAlign: 'center' },
});
