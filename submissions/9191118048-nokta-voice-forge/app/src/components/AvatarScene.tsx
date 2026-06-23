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
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'meshoptimizer';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';

// ── GLB constants ────────────────────────────────────────────────
const GLB_MAGIC  = 0x46546C67; // 'glTF'
const JSON_CHUNK = 0x4E4F534A; // 'JSON'
const BIN_CHUNK  = 0x004E4942; // 'BIN\0'
const AVATAR_CACHE_VERSION = 'v4-face-rig';
const UNPACK_PREMULTIPLY_ALPHA_WEBGL = 0x9241;
const UNPACK_COLORSPACE_CONVERSION_WEBGL = 0x9243;

// ── Morph-target name lists ──────────────────────────────────────
const OPEN_TARGETS = [
  'jawOpen', 'mouthOpen', 'mouth_open',
  'mouthFunnel',
];
const VISEME_TARGETS = [
  'viseme_aa', 'viseme_AA', 'viseme_E', 'viseme_I', 'viseme_O', 'viseme_U',
  'viseme_PP', 'viseme_FF', 'viseme_TH', 'viseme_DD', 'viseme_kk',
  'viseme_CH', 'viseme_SS', 'viseme_nn', 'viseme_RR',
];
const BLINK_TARGETS = [
  'eyeBlinkLeft', 'eyeBlinkRight', 'eyesClosed', 'blink',
];

// ── Types ────────────────────────────────────────────────────────
interface MorphBinding {
  mesh: THREE.Mesh;
  openIdx: number[];
  visemeIdx: number[];
  blinkIdx: number[];
}

interface BoneBinding {
  hips?: THREE.Bone;
  spine?: THREE.Bone;
  spine1?: THREE.Bone;
  spine2?: THREE.Bone;
  head?: THREE.Bone;
  leftShoulder?: THREE.Bone;
  rightShoulder?: THREE.Bone;
  leftArm?: THREE.Bone;
  rightArm?: THREE.Bone;
  leftForeArm?: THREE.Bone;
  rightForeArm?: THREE.Bone;
}

class NativeTextureLoader extends THREE.Loader<THREE.Texture> {
  load(
    url: string,
    onLoad?: (texture: THREE.Texture) => void,
    _onProgress?: (event: ProgressEvent) => void,
    onError?: (error: unknown) => void,
  ): THREE.Texture {
    const resolvedUri = this.path && !url.includes(':') ? `${this.path}${url}` : url;
    const texture = new THREE.Texture();

    Image.getSize(
      resolvedUri,
      (width, height) => {
        texture.image = { data: { localUri: resolvedUri }, width, height };
        texture.flipY = true;
        (texture as any).isDataTexture = true;
        texture.needsUpdate = true;
        onLoad?.(texture);
      },
      (error) => onError?.(error),
    );

    return texture;
  }
}

// ── GLB Inspection ───────────────────────────────────────────────
function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    const chunk = bytes.subarray(offset, Math.min(offset + chunkSize, bytes.length));
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

async function writeBytes(uri: string, bytes: Uint8Array): Promise<void> {
  await FileSystem.writeAsStringAsync(uri, bytesToBase64(bytes), {
    encoding: FileSystem.EncodingType.Base64,
  });
}

/**
 * Expo GL cannot reliably load GLB bufferView/data-URI textures. Expand the
 * bundled GLB into a cache-local GLTF whose BIN and images are normal files.
 */
async function prepareGlbForExpo(resolvedUri: string): Promise<string> {
  const cacheRoot = `${FileSystem.cacheDirectory}avatar-${AVATAR_CACHE_VERSION}/`;
  const sceneUri = `${cacheRoot}scene.gltf`;
  const cached = await FileSystem.getInfoAsync(sceneUri);
  if (cached.exists) return sceneUri;

  const response = await fetch(resolvedUri);
  const buffer = await response.arrayBuffer();
  const view = new DataView(buffer);

  if (buffer.byteLength < 20 || view.getUint32(0, true) !== GLB_MAGIC) {
    throw new Error('Avatar asset is not a valid GLB file');
  }

  let offset = 12;
  let json: any = null;
  let bin = new Uint8Array();

  while (offset + 8 <= buffer.byteLength) {
    const chunkLength = view.getUint32(offset, true);
    const chunkType = view.getUint32(offset + 4, true);
    const chunkBytes = new Uint8Array(buffer, offset + 8, chunkLength);

    if (chunkType === JSON_CHUNK) {
      json = JSON.parse(new TextDecoder().decode(chunkBytes).replace(/\0+$/g, ''));
    } else if (chunkType === BIN_CHUNK) {
      bin = new Uint8Array(chunkBytes);
    }
    offset += 8 + chunkLength;
  }

  if (!json || bin.length === 0) throw new Error('Avatar GLB chunks are incomplete');

  await FileSystem.makeDirectoryAsync(cacheRoot, { intermediates: true });

  for (let index = 0; index < (json.images?.length ?? 0); index++) {
    const image = json.images[index];
    if (image.bufferView === undefined) continue;

    const bufferView = json.bufferViews[image.bufferView];
    const start = bufferView.byteOffset ?? 0;
    const end = start + bufferView.byteLength;
    const extension = image.mimeType === 'image/png' ? 'png' : 'jpg';
    const imageName = `texture-${index}.${extension}`;

    await writeBytes(`${cacheRoot}${imageName}`, bin.subarray(start, end));
    image.uri = imageName;
    delete image.bufferView;
    delete image.mimeType;
  }

  json.buffers[0].uri = 'scene.bin';
  await writeBytes(`${cacheRoot}scene.bin`, bin);
  await FileSystem.writeAsStringAsync(sceneUri, JSON.stringify(json));

  return sceneUri;
}

function configureExpoGl(renderer: THREE.WebGLRenderer): void {
  const context = renderer.getContext();
  const originalPixelStorei = context.pixelStorei.bind(context);

  context.pixelStorei = (parameter: number, value: number | boolean) => {
    if (
      parameter === UNPACK_PREMULTIPLY_ALPHA_WEBGL ||
      parameter === UNPACK_COLORSPACE_CONVERSION_WEBGL
    ) {
      return;
    }
    originalPixelStorei(parameter, value);
  };
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
function AvatarModel({
  uri,
  speakingIntensity,
  isSpeaking,
  onRigStatus,
}: {
  uri: string;
  speakingIntensity: number;
  isSpeaking: boolean;
  onRigStatus: (hasLipSyncRig: boolean) => void;
}) {
  const gltf = useLoader(GLTFLoader, uri, (loader) => {
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.manager.addHandler(/\.(png|jpe?g)$/i, new NativeTextureLoader(loader.manager));
  });
  const { scene, animations } = gltf;
  const groupRef   = useRef<THREE.Group>(null);
  const morphRef   = useRef<MorphBinding[]>([]);
  const bonesRef   = useRef<BoneBinding>({});
  const baseRotationsRef = useRef(new Map<THREE.Bone, THREE.Euler>());
  const mixerRef   = useRef<THREE.AnimationMixer | null>(null);
  const elapsedRef = useRef(0);
  const [yOff, setYOff]   = useState(0);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!scene) return;

    const bindings: MorphBinding[] = [];
    const allNames = new Set<string>();
    const boneNames: string[] = [];

    scene.traverse((child: THREE.Object3D) => {
      // Collect bone names for diagnostics
      if ((child as any).isBone) {
        const bone = child as THREE.Bone;
        boneNames.push(bone.name);
        if (bone.name === 'Hips') bonesRef.current.hips = bone;
        if (bone.name === 'Spine') bonesRef.current.spine = bone;
        if (bone.name === 'Spine1') bonesRef.current.spine1 = bone;
        if (bone.name === 'Spine2') bonesRef.current.spine2 = bone;
        if (bone.name === 'Head') bonesRef.current.head = bone;
        if (bone.name === 'LeftShoulder') bonesRef.current.leftShoulder = bone;
        if (bone.name === 'RightShoulder') bonesRef.current.rightShoulder = bone;
        if (bone.name === 'LeftArm') bonesRef.current.leftArm = bone;
        if (bone.name === 'RightArm') bonesRef.current.rightArm = bone;
        if (bone.name === 'LeftForeArm') bonesRef.current.leftForeArm = bone;
        if (bone.name === 'RightForeArm') bonesRef.current.rightForeArm = bone;
      }

      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      fixMaterials(mesh);

      const dict = mesh.morphTargetDictionary;
      const infl = mesh.morphTargetInfluences;
      if (!dict || !infl) return;

      Object.keys(dict).forEach((n) => allNames.add(n));
      const openIdx: number[] = [];
      for (const t of OPEN_TARGETS) if (dict[t] !== undefined) openIdx.push(dict[t]);
      const visemeIdx: number[] = [];
      for (const t of VISEME_TARGETS) if (dict[t] !== undefined) visemeIdx.push(dict[t]);
      const bIdx: number[] = [];
      for (const t of BLINK_TARGETS) if (dict[t] !== undefined) bIdx.push(dict[t]);
      if (openIdx.length || visemeIdx.length || bIdx.length) {
        bindings.push({ mesh, openIdx, visemeIdx, blinkIdx: bIdx });
      }
    });

    morphRef.current = bindings;
    const hasMorphRig = bindings.some(
      (binding) => binding.openIdx.length > 0 || binding.visemeIdx.length > 0,
    );
    onRigStatus(hasMorphRig);

    if (animations.length > 0) {
      const mixer = new THREE.AnimationMixer(scene);
      animations.forEach((clip) => mixer.clipAction(clip).play());
      const idleTime = Math.min(1, animations[0].duration * 0.2);
      mixer.setTime(idleTime);
      mixerRef.current = mixer;
    }

    Object.values(bonesRef.current).forEach((bone) => {
      if (bone) baseRotationsRef.current.set(bone, bone.rotation.clone());
    });

    // Diagnostics
    console.log('[AvatarScene] morph target names:', Array.from(allNames));
    console.log(
      '[AvatarScene] mouth morph bindings:',
      bindings.reduce((a, b) => a + b.openIdx.length + b.visemeIdx.length, 0),
    );
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
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const s = maxDim > 0 ? 4.3 / maxDim : 1;
    setScale(s);
    setYOff(-1.38 * s);
    return () => {
      mixerRef.current?.stopAllAction();
      mixerRef.current = null;
    };
  }, [animations, scene, onRigStatus]);

  // Per-frame lipsync
  useFrame((_, dt) => {
    elapsedRef.current += dt;
    const t = elapsedRef.current;
    const mouthTarget = isSpeaking ? Math.min(1, speakingIntensity * 1.6) : 0;
    const blinkPhase = t % 4;
    const blinkVal = blinkPhase > 3.84 ? Math.sin(((blinkPhase - 3.84) / 0.16) * Math.PI) : 0;
    for (const b of morphRef.current) {
      const inf = b.mesh.morphTargetInfluences;
      if (!inf) continue;
      for (const i of b.openIdx) inf[i] += (mouthTarget * 0.7 - inf[i]) * 0.4;
      const activeViseme = b.visemeIdx.length > 0
        ? b.visemeIdx[Math.floor(t * 9) % b.visemeIdx.length]
        : -1;
      for (const i of b.visemeIdx) {
        const target = i === activeViseme ? mouthTarget * 0.85 : 0;
        inf[i] += (target - inf[i]) * 0.45;
      }
      for (const i of b.blinkIdx) inf[i] += (blinkVal   - inf[i]) * 0.50;
    }
    const bones = bonesRef.current;
    const activeIntensity = isSpeaking ? speakingIntensity : 0;
    const talkWave = Math.sin(t * 8) * activeIntensity;
    const explainGesture = (Math.sin(t * 2.2) * 0.5 + 0.5) * activeIntensity;
    const idleBreath = Math.sin(t * 1.65);
    const idleSway = Math.sin(t * 0.72);
    const moveBone = (bone: THREE.Bone | undefined, x: number, y: number, z: number) => {
      if (!bone) return;
      const base = baseRotationsRef.current.get(bone);
      if (!base) return;
      bone.rotation.x = THREE.MathUtils.lerp(bone.rotation.x, base.x + x, 0.22);
      bone.rotation.y = THREE.MathUtils.lerp(bone.rotation.y, base.y + y, 0.22);
      bone.rotation.z = THREE.MathUtils.lerp(bone.rotation.z, base.z + z, 0.22);
    };

    if (bones.head) {
      moveBone(
        bones.head,
        idleBreath * 0.008 + activeIntensity * 0.025,
        idleSway * 0.012 + talkWave * 0.045,
        idleSway * 0.006,
      );
    }
    moveBone(bones.hips, 0, idleSway * 0.008, idleSway * 0.004);
    moveBone(bones.spine, idleBreath * 0.006, 0, idleSway * 0.004);
    moveBone(bones.spine1, idleBreath * 0.008, idleSway * 0.004, idleSway * 0.004);
    moveBone(bones.spine2, idleBreath * 0.01, idleSway * 0.005, idleSway * 0.005);
    moveBone(bones.leftShoulder, 0, 0, idleBreath * 0.006);
    moveBone(bones.rightShoulder, 0, 0, -idleBreath * 0.006);

    // The source GLB has no body animation clips and starts in a T-pose.
    // Standing Idle keeps both arms relaxed beside the torso.
    moveBone(bones.leftArm, 1.52 - explainGesture * 0.22 + idleSway * 0.008, 0, 0);
    moveBone(bones.rightArm, 1.52 - explainGesture * 0.82 - idleSway * 0.008, 0, 0);
    moveBone(bones.leftForeArm, explainGesture * 0.18, talkWave * 0.02, 0);
    moveBone(bones.rightForeArm, explainGesture * 0.72, -talkWave * 0.03, 0);
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
export default function AvatarScene({
  speakingIntensity,
  isSpeaking,
}: {
  speakingIntensity: number;
  isSpeaking: boolean;
}) {
  const [modelUri, setModelUri]     = useState<string | null>(null);
  const [loadError, setLoadError]   = useState(false);
  const [hasLipSyncRig, setHasLipSyncRig] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // 1. Download bundled GLB via expo-asset
        const asset = Asset.fromModule(require('../../assets/avatar.uncompressed.glb'));
        await asset.downloadAsync();
        const rawUri = asset.localUri || asset.uri;
        if (!rawUri) throw new Error('Asset URI is null');

        const preparedUri = await prepareGlbForExpo(rawUri);
        setModelUri(preparedUri);
      } catch (err) {
        console.warn('[AvatarScene] asset download error:', err);
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
          camera={{ position: [0, 0.05, 4.6], fov: 30 }}
          shadows={false}
          gl={{ antialias: false, alpha: true }}
          onCreated={({ gl }) => configureExpoGl(gl)}
        >
          <ambientLight intensity={0.65} />
          <directionalLight position={[2, 3, 4]}  intensity={1.2} />
          <directionalLight position={[-2, 1, 2]} intensity={0.4} />
          <React.Suspense fallback={null}>
            <AvatarModel
              uri={modelUri}
              speakingIntensity={speakingIntensity}
              isSpeaking={isSpeaking}
              onRigStatus={setHasLipSyncRig}
            />
          </React.Suspense>
        </Canvas>
      </ErrorBoundary>
      {hasLipSyncRig === false && (
        <View style={styles.rigWarning}>
          <View style={styles.rigWarningDot} />
          <Text style={styles.rigWarningText}>Ses tepkili iskelet</Text>
        </View>
      )}
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
  rigWarning:  {
    position: 'absolute',
    right: 12,
    top: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(10, 10, 15, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255, 179, 71, 0.35)',
  },
  rigWarningDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFB347' },
  rigWarningText: { color: '#FFB347', fontSize: 10, fontWeight: '600' },
});
