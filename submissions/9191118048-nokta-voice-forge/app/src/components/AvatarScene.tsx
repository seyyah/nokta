/**
 * AvatarScene — 3D Avatar Component with Lipsync
 * Resolves avatar.glb using expo-asset and handles parsing errors gracefully.
 */

import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Asset } from 'expo-asset';
import { Directory, File as ExpoFile, Paths } from 'expo-file-system';
import AvatarFace from './AvatarFace';
import { PersonaId } from '../types';

interface AvatarModelProps {
  uri: string;
  speakingIntensity: number;
}

type ModelTransform = {
  position: [number, number, number];
  scale: number;
};

type MorphBinding = {
  mesh: THREE.Mesh;
  mouthIndices: number[];
  blinkIndices: number[];
};

type GltfJson = {
  buffers?: Array<{ uri?: string; byteLength: number }>;
  images?: unknown[];
  materials?: GltfMaterial[];
  samplers?: unknown[];
  textures?: unknown[];
  [key: string]: unknown;
};

type GltfMaterial = {
  name?: string;
  normalTexture?: unknown;
  occlusionTexture?: unknown;
  emissiveTexture?: unknown;
  pbrMetallicRoughness?: {
    baseColorFactor?: number[];
    baseColorTexture?: unknown;
    metallicFactor?: number;
    metallicRoughnessTexture?: unknown;
    roughnessFactor?: number;
  };
  [key: string]: unknown;
};

interface FallbackAvatarProps {
  speakingIntensity: number;
  persona: PersonaId;
}

// Possible morph targets for mouth opening
const MOUTH_MORPH_TARGETS = [
  'jawOpen',
  'mouthOpen',
  'mouth_open',
  'viseme_aa',
  'viseme_AA',
  'mouthFunnel',
];

const BLINK_MORPH_TARGETS = [
  'eyeBlinkLeft',
  'eyeBlinkRight',
  'eyesClosed',
  'blink',
];

const EMPTY_FILE_HASH = 'd41d8cd98f00b204e9800998ecf8427e';
const GLB_MAGIC = 0x46546c67;
const JSON_CHUNK = 0x4e4f534a;
const BIN_CHUNK = 0x004e4942;

function colorFactorForName(name = '') {
  const normalized = name.toLowerCase();

  if (normalized.includes('hair')) {
    return [0.17, 0.1, 0.07, 1];
  }

  if (normalized.includes('body')) {
    return [0.82, 0.61, 0.47, 1];
  }

  if (normalized.includes('shoe')) {
    return [0.03, 0.035, 0.045, 1];
  }

  if (normalized.includes('look')) {
    return [0.13, 0.2, 0.3, 1];
  }

  return [0.75, 0.75, 0.72, 1];
}

function assertValidAvatarAsset(asset: Asset, resolvedUri: string) {
  if (asset.hash === EMPTY_FILE_HASH) {
    throw new Error('app/assets/avatar.glb is empty');
  }

  assertValidAvatarUri(resolvedUri);
}

function assertValidAvatarUri(resolvedUri: string) {
  if (resolvedUri.startsWith('file://')) {
    const fileInfo = new ExpoFile(resolvedUri).info();
    if (!fileInfo.exists || !fileInfo.size) {
      throw new Error('avatar.glb is missing or empty');
    }
  }
}

async function prepareExpoCompatibleGltf(asset: Asset, resolvedUri: string) {
  const bytes = await new ExpoFile(resolvedUri).bytes();
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  if (view.getUint32(0, true) !== GLB_MAGIC) {
    return resolvedUri;
  }

  let offset = 12;
  let jsonBytes: Uint8Array | null = null;
  let binBytes: Uint8Array | null = null;

  while (offset + 8 <= bytes.byteLength) {
    const chunkLength = view.getUint32(offset, true);
    const chunkType = view.getUint32(offset + 4, true);
    const chunkStart = offset + 8;
    const chunkEnd = chunkStart + chunkLength;

    if (chunkEnd > bytes.byteLength) {
      break;
    }

    if (chunkType === JSON_CHUNK) {
      jsonBytes = bytes.slice(chunkStart, chunkEnd);
    } else if (chunkType === BIN_CHUNK) {
      binBytes = bytes.slice(chunkStart, chunkEnd);
    }

    offset = chunkEnd;
  }

  if (!jsonBytes || !binBytes) {
    return resolvedUri;
  }

  const jsonText = new TextDecoder('utf-8').decode(jsonBytes).replace(/\0+$/g, '').trim();
  const gltf = JSON.parse(jsonText) as GltfJson;
  const safeHash = asset.hash?.replace(/[^a-zA-Z0-9_-]/g, '') || 'local';
  const cacheDir = new Directory(Paths.cache, `avatar-gltf-${safeHash}`);
  cacheDir.create({ intermediates: true, idempotent: true });

  const binFile = new ExpoFile(cacheDir, 'avatar.bin');
  binFile.write(binBytes);

  if (gltf.buffers?.[0]) {
    gltf.buffers[0].uri = 'avatar.bin';
    gltf.buffers[0].byteLength = binBytes.byteLength;
  }

  const strippedTextureCount = gltf.images?.length ?? 0;
  gltf.materials?.forEach((material) => {
    const pbr = material.pbrMetallicRoughness ?? {};
    delete pbr.baseColorTexture;
    delete pbr.metallicRoughnessTexture;

    pbr.baseColorFactor = colorFactorForName(material.name);
    pbr.metallicFactor = 0;
    pbr.roughnessFactor = 0.78;
    material.pbrMetallicRoughness = pbr;

    delete material.normalTexture;
    delete material.occlusionTexture;
    delete material.emissiveTexture;
  });
  delete gltf.images;
  delete gltf.textures;
  delete gltf.samplers;

  const gltfFile = new ExpoFile(cacheDir, 'avatar.gltf');
  gltfFile.write(JSON.stringify(gltf));

  console.log('[AvatarScene] prepared Expo material cache:', {
    gltf: gltfFile.uri,
    strippedTextures: strippedTextureCount,
  });

  return gltfFile.uri;
}

function applyExpoMaterialFallback(mesh: THREE.Mesh) {
  const meshName = mesh.name.toLowerCase();
  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

  for (const material of materials) {
    if (!(material instanceof THREE.MeshStandardMaterial)) {
      continue;
    }

    material.roughness = Math.max(material.roughness, 0.65);
    material.metalness = Math.min(material.metalness, 0.08);

    const hasUsableMap = Boolean(material.map?.image);

    if (hasUsableMap && material.map) {
      material.map.colorSpace = THREE.SRGBColorSpace;
      material.map.needsUpdate = true;
    }

    if (!hasUsableMap) {
      material.color.fromArray(colorFactorForName(meshName));
    }

    material.needsUpdate = true;
  }
}

function AvatarModel({ uri, speakingIntensity }: AvatarModelProps) {
  const gltf = useLoader(GLTFLoader, uri);
  const { scene, animations } = gltf;
  const groupRef = useRef<THREE.Group | null>(null);
  const morphBindingsRef = useRef<MorphBinding[]>([]);
  const baseScaleRef = useRef(1);
  const elapsedRef = useRef(0);
  const scratchScaleRef = useRef(new THREE.Vector3(1, 1, 1));
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const [modelTransform, setModelTransform] = useState<ModelTransform>({
    position: [0, 0, 0],
    scale: 1,
  });

  useEffect(() => {
    if (scene) {
      const morphBindings: MorphBinding[] = [];
      const morphTargetNames = new Set<string>();

      scene.traverse((child: THREE.Object3D) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          applyExpoMaterialFallback(mesh);

          if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
            const dictionary = mesh.morphTargetDictionary;
            Object.keys(dictionary).forEach((name) => morphTargetNames.add(name));

            const indices: number[] = [];
            for (const targetName of MOUTH_MORPH_TARGETS) {
              if (dictionary[targetName] !== undefined) {
                indices.push(dictionary[targetName]);
              }
            }

            const blinkIndices: number[] = [];
            for (const targetName of BLINK_MORPH_TARGETS) {
              if (dictionary[targetName] !== undefined) {
                blinkIndices.push(dictionary[targetName]);
              }
            }

            if (indices.length > 0 || blinkIndices.length > 0) {
              morphBindings.push({ mesh, mouthIndices: indices, blinkIndices });
            }
          }
        }
      });

      morphBindingsRef.current = morphBindings;

      scene.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(scene);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);

      const maxDimension = Math.max(size.x, size.y, size.z);
      const scale = maxDimension > 0
        ? Math.min(6, Math.max(0.65, 4.1 / maxDimension))
        : 1;

      baseScaleRef.current = scale;
      setModelTransform({
        position: [-center.x, -center.y, -center.z],
        scale,
      });

      console.log('[AvatarScene] GLB loaded:', uri);
      console.log('[AvatarScene] animation clips count:', animations.length);
      console.log(
        '[AvatarScene] animation names:',
        animations.map((clip: THREE.AnimationClip) => clip.name)
      );
      console.log('[AvatarScene] morph target names detected:', Array.from(morphTargetNames));
    }

    if (animations.length > 0) {
      const mixer = new THREE.AnimationMixer(scene);
      const idleClip =
        animations.find((clip: THREE.AnimationClip) => clip.name.toLowerCase().includes('idle')) ??
        animations[0];
      mixer.clipAction(idleClip).reset().play();
      mixerRef.current = mixer;

      return () => {
        mixer.stopAllAction();
        mixer.uncacheRoot(scene);
        mixerRef.current = null;
      };
    }

    mixerRef.current = null;
    return undefined;
  }, [animations, scene, uri]);

  useFrame((_, delta) => {
    elapsedRef.current += delta;
    mixerRef.current?.update(delta);

    const targetValue = Math.min(1, speakingIntensity * 1.5);
    const blinkPhase = elapsedRef.current % 4;
    const blinkValue =
      blinkPhase > 3.84 ? Math.sin(((blinkPhase - 3.84) / 0.16) * Math.PI) : 0;

    for (const binding of morphBindingsRef.current) {
      const influences = binding.mesh.morphTargetInfluences;
      if (!influences) continue;

      for (const idx of binding.mouthIndices) {
        const current = influences[idx];
        influences[idx] = current + (targetValue - current) * 0.3;
      }

      for (const idx of binding.blinkIndices) {
        const current = influences[idx];
        influences[idx] = current + (blinkValue - current) * 0.45;
      }
    }

    if (scene) {
      scene.rotation.y = Math.sin(elapsedRef.current * 0.9) * 0.04;
      scene.rotation.x = speakingIntensity * 0.04;
    }

    if (groupRef.current) {
      const animatedScale = baseScaleRef.current * (1 + speakingIntensity * 0.035);
      scratchScaleRef.current.set(animatedScale, animatedScale, animatedScale);
      groupRef.current.scale.lerp(
        scratchScaleRef.current,
        0.18
      );
    }
  });

  return (
    <group ref={groupRef} scale={modelTransform.scale} position={[0, -1.25, 0]}>
      <primitive object={scene} position={modelTransform.position} />
    </group>
  );
}

function FallbackAvatar({ speakingIntensity, persona }: FallbackAvatarProps) {
  return (
    <View style={styles.fallbackContainer}>
      <Text style={styles.errorText}>⚠️ Missing or invalid Avaturn avatar.glb</Text>
      <AvatarFace
        speakingIntensity={speakingIntensity}
        persona={persona}
        isActive
        style={styles.fallbackAvatar}
      />
    </View>
  );
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn('[AvatarScene ErrorBoundary] Caught GLB parsing error:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

interface AvatarSceneProps {
  speakingIntensity: number;
  persona?: PersonaId;
}

export default function AvatarScene({ speakingIntensity, persona = 'junior' }: AvatarSceneProps) {
  const [assetUri, setAssetUri] = useState<string | null>(null);
  const [hasAssetError, setHasAssetError] = useState(false);

  useEffect(() => {
    async function resolveAsset() {
      try {
        const asset = Asset.fromModule(require('../../assets/avatar.glb'));
        await asset.downloadAsync();
        const resolvedUri = asset.localUri || asset.uri;
        
        if (!resolvedUri) {
          throw new Error('URI could not be resolved from Asset');
        }

        assertValidAvatarAsset(asset, resolvedUri);
        
        const preparedUri = await prepareExpoCompatibleGltf(asset, resolvedUri);
        setAssetUri(preparedUri);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (!message.includes('avatar.glb is empty')) {
          console.warn('[AvatarScene] Failed to download or resolve expo-asset:', err);
        }
        setHasAssetError(true);
      }
    }
    resolveAsset();
  }, []);

  if (hasAssetError) {
    return (
      <View style={styles.container}>
        <FallbackAvatar speakingIntensity={speakingIntensity} persona={persona} />
      </View>
    );
  }

  if (!assetUri) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#FF9F43" />
        <Text style={styles.loadingText}>Avatar Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ErrorBoundary
        key={assetUri}
        fallback={<FallbackAvatar speakingIntensity={speakingIntensity} persona={persona} />}
      >
        <Canvas
          camera={{ position: [0, 0, 5], fov: 42 }}
          shadows={false}
          gl={{ antialias: false, alpha: true }}
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[3, 4, 5]} intensity={1} />
          <React.Suspense fallback={null}>
            <AvatarModel uri={assetUri} speakingIntensity={speakingIntensity} />
          </React.Suspense>
        </Canvas>
      </ErrorBoundary>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#888',
    fontSize: 14,
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 212, 170, 0.05)',
  },
  fallbackAvatar: {
    transform: [{ scale: 0.92 }],
  },
  errorText: {
    display: 'none',
    color: '#ff4757',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    color: '#ff4757',
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
});
