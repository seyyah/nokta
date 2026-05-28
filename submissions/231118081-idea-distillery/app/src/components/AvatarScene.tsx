import { Canvas, useFrame } from '@react-three/fiber/native';
import { Asset } from 'expo-asset';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import {
  ACESFilmicToneMapping,
  AnimationMixer,
  Box3,
  LoadingManager,
  SRGBColorSpace,
  Texture,
  Vector3,
  type AnimationClip,
  type Group,
  type Material,
  type Mesh,
  type Object3D,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { palette } from '../theme';

type AvatarSceneProps = {
  bands: number[];
  level: number;
  listening: boolean;
};

type LoadedModel = {
  animations: AnimationClip[];
  scene: Object3D;
};

type MorphMesh = Mesh & {
  morphTargetDictionary?: Record<string, number>;
  morphTargetInfluences?: number[];
};

type LipTarget = {
  mesh: MorphMesh;
  mode: 'viseme' | 'generic';
};

type ModelSource = {
  asset: number;
  lipSync: {
    combinedMouthScale: number;
    opennessScale: number;
    roundedMouthScale: number;
    roundedVisemeScale: number;
    switchIntervalScale: number;
    transitionAttack: number;
    transitionRelease: number;
    visemeScale: number;
  };
  position: [number, number, number];
  resources: Record<string, number>;
  rotation: [number, number, number];
  scale: number;
};

type MutableGltfDocument = {
  buffers?: Array<{ uri?: string }>;
  images?: Array<{ uri?: string }>;
  materials?: MutableGltfMaterial[];
  textures?: Array<{ source?: number }>;
};

type MutableGltfMaterial = {
  emissiveTexture?: GltfTextureRef;
  name?: string;
  normalTexture?: GltfTextureRef;
  occlusionTexture?: GltfTextureRef;
  pbrMetallicRoughness?: {
    baseColorTexture?: GltfTextureRef;
    metallicRoughnessTexture?: GltfTextureRef;
  };
};

type GltfTextureRef = {
  index?: number;
};

type MaterialTextureAssignment = {
  aoMap?: number;
  emissiveMap?: number;
  map?: number;
  materialName: string;
  metallicRoughnessMap?: number;
  normalMap?: number;
};

type TexturedMaterial = Material & {
  aoMap?: Texture | null;
  emissiveMap?: Texture | null;
  map?: Texture | null;
  metalnessMap?: Texture | null;
  normalMap?: Texture | null;
  roughnessMap?: Texture | null;
};

type NativeTextureImage = {
  data: {
    localUri: string;
  };
  height: number;
  width: number;
};

const MODEL_SOURCE: ModelSource = {
  asset: require('../../assets/models/realisticmodel-mobile/model.gltf') as number,
  lipSync: {
    combinedMouthScale: 0.43,
    opennessScale: 1.12,
    roundedMouthScale: 1.45,
    roundedVisemeScale: 1.18,
    switchIntervalScale: 1.14,
    transitionAttack: 0.42,
    transitionRelease: 0.2,
    visemeScale: 1,
  },
  position: [0, -6.42, 0],
  resources: {
    'model-buffer.bin': require('../../assets/models/realisticmodel-mobile/model-buffer.bin') as number,
    'textures/texture-0-0.jpg': require('../../assets/models/realisticmodel-mobile/textures/texture-0-0.jpg') as number,
    'textures/texture-1-1.jpg': require('../../assets/models/realisticmodel-mobile/textures/texture-1-1.jpg') as number,
    'textures/texture-10-10.jpg': require('../../assets/models/realisticmodel-mobile/textures/texture-10-10.jpg') as number,
    'textures/texture-11-11.jpg': require('../../assets/models/realisticmodel-mobile/textures/texture-11-11.jpg') as number,
    'textures/texture-12-12.jpg': require('../../assets/models/realisticmodel-mobile/textures/texture-12-12.jpg') as number,
    'textures/texture-13-13.jpg': require('../../assets/models/realisticmodel-mobile/textures/texture-13-13.jpg') as number,
    'textures/texture-14-14.png': require('../../assets/models/realisticmodel-mobile/textures/texture-14-14.png') as number,
    'textures/texture-15-15.png': require('../../assets/models/realisticmodel-mobile/textures/texture-15-15.png') as number,
    'textures/texture-16-16.jpg': require('../../assets/models/realisticmodel-mobile/textures/texture-16-16.jpg') as number,
    'textures/texture-17-17.png': require('../../assets/models/realisticmodel-mobile/textures/texture-17-17.png') as number,
    'textures/texture-18-18.jpg': require('../../assets/models/realisticmodel-mobile/textures/texture-18-18.jpg') as number,
    'textures/texture-19-19.jpg': require('../../assets/models/realisticmodel-mobile/textures/texture-19-19.jpg') as number,
    'textures/texture-2-2.jpg': require('../../assets/models/realisticmodel-mobile/textures/texture-2-2.jpg') as number,
    'textures/texture-20-20.jpg': require('../../assets/models/realisticmodel-mobile/textures/texture-20-20.jpg') as number,
    'textures/texture-21-21.jpg': require('../../assets/models/realisticmodel-mobile/textures/texture-21-21.jpg') as number,
    'textures/texture-22-22.jpg': require('../../assets/models/realisticmodel-mobile/textures/texture-22-22.jpg') as number,
    'textures/texture-23-23.jpg': require('../../assets/models/realisticmodel-mobile/textures/texture-23-23.jpg') as number,
    'textures/texture-24-24.jpg': require('../../assets/models/realisticmodel-mobile/textures/texture-24-24.jpg') as number,
    'textures/texture-25-25.jpg': require('../../assets/models/realisticmodel-mobile/textures/texture-25-25.jpg') as number,
    'textures/texture-26-26.jpg': require('../../assets/models/realisticmodel-mobile/textures/texture-26-26.jpg') as number,
    'textures/texture-3-3.jpg': require('../../assets/models/realisticmodel-mobile/textures/texture-3-3.jpg') as number,
    'textures/texture-4-4.png': require('../../assets/models/realisticmodel-mobile/textures/texture-4-4.png') as number,
    'textures/texture-5-5.png': require('../../assets/models/realisticmodel-mobile/textures/texture-5-5.png') as number,
    'textures/texture-6-6.jpg': require('../../assets/models/realisticmodel-mobile/textures/texture-6-6.jpg') as number,
    'textures/texture-7-7.png': require('../../assets/models/realisticmodel-mobile/textures/texture-7-7.png') as number,
    'textures/texture-8-8.png': require('../../assets/models/realisticmodel-mobile/textures/texture-8-8.png') as number,
    'textures/texture-9-9.jpg': require('../../assets/models/realisticmodel-mobile/textures/texture-9-9.jpg') as number,
  },
  rotation: [0, 0.5, 0],
  scale: 1,
};

const AUTO_PLAY_ANIMATION_NAME_PATTERN = /\b(idle|breath|breathing|neutral)\b/i;
const VISEMES = [
  'viseme_sil',
  'viseme_PP',
  'viseme_FF',
  'viseme_TH',
  'viseme_DD',
  'viseme_kk',
  'viseme_CH',
  'viseme_SS',
  'viseme_nn',
  'viseme_RR',
  'viseme_aa',
  'viseme_E',
  'viseme_I',
  'viseme_O',
  'viseme_U',
];
const GENERIC_MOUTH = [
  'jawOpen',
  'mouthOpen',
  'mouthFunnel',
  'mouthPucker',
  'mouthLowerDownLeft',
  'mouthLowerDownRight',
  'mouthUpperUpLeft',
  'mouthUpperUpRight',
  'mouthSmile',
  'mouthSmileLeft',
  'mouthSmileRight',
  'mouthClose',
];

export function AvatarScene({ bands, level, listening }: AvatarSceneProps) {
  const { error, model } = useAvatarModel();

  return (
    <View style={styles.container}>
      <View style={styles.sceneHeader}>
        <Text style={styles.sceneTitle}>Pitch Mentor</Text>
        <Text style={[styles.sceneState, listening ? styles.sceneStateActive : null]}>
          {listening ? 'listening' : 'idle'}
        </Text>
      </View>
      <Canvas
        camera={{ position: [0, 0, 5.1], fov: 34 }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = SRGBColorSpace;
          gl.toneMapping = ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
        style={styles.canvas}
      >
        <color args={['#f4f5ef']} attach="background" />
        <ambientLight intensity={0.72} />
        <hemisphereLight args={['#f7fbff', '#d6dbe7', 1.15]} position={[0, 3, 0]} />
        <directionalLight intensity={1.35} position={[3.5, 5.5, 6]} />
        <directionalLight intensity={0.34} position={[-4, 2.2, 4]} />
        <pointLight color="#f4dcc2" intensity={0.5} position={[0, 2.4, 3.2]} />
        {model ? (
          <ReactiveAvatar
            bands={bands}
            level={level}
            listening={listening}
            loadedModel={model}
          />
        ) : null}
      </Canvas>
      <View style={styles.sceneFooter}>
        <Text style={styles.sceneFootnote}>voice note to audit report to mentor review</Text>
      </View>
      {!model ? (
        <View style={styles.overlay}>
          <Text style={[styles.overlayText, error ? styles.errorText : null]}>
            {error ? 'Avatar yuklenemedi' : 'Avatar yukleniyor'}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function useAvatarModel() {
  const [model, setModel] = useState<LoadedModel | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setError(null);
      setModel(null);

      try {
        const manualLoaded = await loadModelManually();
        if (!cancelled) {
          setModel(manualLoaded);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError : new Error('Avatar model could not be prepared.'));
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { error, model };
}

async function loadModelManually(): Promise<LoadedModel> {
  const uri = await getAssetUri(MODEL_SOURCE.asset);
  const resourceUris = await getResourceUris(MODEL_SOURCE.resources);
  const loader = new GLTFLoader(createResourceLoadingManager(resourceUris));
  const preparedModel = await loadPreparedGltfData(
    uri,
    resourceUris,
    MODEL_SOURCE.resources,
  );

  if (preparedModel) {
    return new Promise((resolve, reject) => {
      loader.parse(
        preparedModel.data,
        '',
        (gltf) => {
          void applyManualTextures(gltf.scene, preparedModel.manualTextureAssignments)
            .then(() => {
              resolve({ animations: gltf.animations, scene: gltf.scene });
            })
            .catch(reject);
        },
        reject,
      );
    });
  }

  return new Promise((resolve, reject) => {
    loader.load(
      uri,
      (gltf) => {
        resolve({ animations: gltf.animations, scene: gltf.scene });
      },
      undefined,
      reject,
    );
  });
}

function ReactiveAvatar({
  bands,
  level,
  listening,
  loadedModel,
}: AvatarSceneProps & { loadedModel: LoadedModel }) {
  const group = useRef<Group>(null);
  const animationMixer = useRef<AnimationMixer | null>(null);
  const model = useMemo(() => {
    normalizeModel(loadedModel.scene);
    return loadedModel.scene;
  }, [loadedModel]);
  const targets = useMemo(() => collectLipTargets(model), [model]);
  const smoothedLevel = useRef(0);
  const activeViseme = useRef('viseme_sil');
  const nextSwitchAt = useRef(0);

  useEffect(() => {
    const animation =
      loadedModel.animations.find((clip) =>
        AUTO_PLAY_ANIMATION_NAME_PATTERN.test(clip.name),
      ) ?? loadedModel.animations[0];

    if (!animation) {
      animationMixer.current = null;
      return undefined;
    }

    const mixer = new AnimationMixer(model);
    const action = mixer.clipAction(animation);
    action.reset();
    action.play();
    mixer.setTime(getFirstAnimationKeyTime(animation));
    animationMixer.current = mixer;

    return () => {
      mixer.stopAllAction();
      animationMixer.current = null;
    };
  }, [loadedModel.animations, model]);

  useFrame(({ clock }, delta) => {
    const time = clock.getElapsedTime();
    animationMixer.current?.update(delta);

    const targetLevel = listening ? clamp(level, 0, 1) : 0;
    const smoothing = targetLevel > smoothedLevel.current ? 0.32 : 0.12;
    smoothedLevel.current += (targetLevel - smoothedLevel.current) * smoothing;
    const voice = smoothedLevel.current < 0.015 ? 0 : smoothedLevel.current;

    if (group.current) {
      const targetScale = MODEL_SOURCE.scale * (1 + voice * 0.045);
      group.current.scale.x = lerp(group.current.scale.x, targetScale, 0.08);
      group.current.scale.y = lerp(group.current.scale.y, targetScale, 0.08);
      group.current.scale.z = lerp(group.current.scale.z, targetScale, 0.08);
      group.current.position.y = MODEL_SOURCE.position[1] + Math.sin(time * 1.05) * 0.025;
      group.current.rotation.y = MODEL_SOURCE.rotation[1];
    }

    if (time >= nextSwitchAt.current) {
      activeViseme.current = chooseViseme(bands, voice, time);
      nextSwitchAt.current = time + 0.06 + Math.max(0, 0.13 - voice * 0.08);
    }

    targets.forEach((target) => {
      if (target.mode === 'viseme') {
        applyVisemes(target.mesh, activeViseme.current, voice);
      } else {
        applyGenericMouth(target.mesh, voice, time);
      }
    });
  });

  return (
    <group
      ref={group}
      position={MODEL_SOURCE.position}
      rotation={MODEL_SOURCE.rotation}
      scale={MODEL_SOURCE.scale}
    >
      <primitive object={model} />
    </group>
  );
}

async function getAssetUri(assetModule: number) {
  const asset = Asset.fromModule(assetModule);
  await asset.downloadAsync();
  return asset.localUri ?? asset.uri;
}

async function getResourceUris(resources?: Record<string, number>) {
  const entries = Object.entries(resources ?? {});
  const resolvedEntries = await Promise.all(
    entries.map(async ([uri, assetModule]) => [
      uri,
      await getAssetUri(assetModule),
    ]),
  );

  return new Map(resolvedEntries as [string, string][]);
}

async function loadPreparedGltfData(
  uri: string,
  resourceUris: Map<string, string>,
  resourceModules?: Record<string, number>,
) {
  if (resourceUris.size === 0 || !uri.endsWith('.gltf')) {
    return null;
  }

  const response = await fetch(uri);
  const gltf = (await response.json()) as MutableGltfDocument;
  const manualTextureAssignments = createManualTextureAssignments(
    gltf,
    resourceModules,
  );
  stripMaterialTextureRefs(gltf);
  rewriteGltfResourceUris(gltf, resourceUris);

  return {
    data: JSON.stringify(gltf),
    manualTextureAssignments,
  };
}

function createManualTextureAssignments(
  gltf: MutableGltfDocument,
  resourceModules?: Record<string, number>,
): MaterialTextureAssignment[] {
  if (!resourceModules || !gltf.materials?.length) {
    return [];
  }

  return gltf.materials
    .map((material, index) => {
      const materialName = material.name ?? `Material_${index}`;
      return {
        aoMap: getTextureModule(gltf, material.occlusionTexture, resourceModules),
        emissiveMap: getTextureModule(gltf, material.emissiveTexture, resourceModules),
        map: getTextureModule(
          gltf,
          material.pbrMetallicRoughness?.baseColorTexture,
          resourceModules,
        ),
        materialName,
        metallicRoughnessMap: getTextureModule(
          gltf,
          material.pbrMetallicRoughness?.metallicRoughnessTexture,
          resourceModules,
        ),
        normalMap: getTextureModule(gltf, material.normalTexture, resourceModules),
      };
    })
    .filter(
      (assignment) =>
        assignment.aoMap ||
        assignment.emissiveMap ||
        assignment.map ||
        assignment.normalMap ||
        assignment.metallicRoughnessMap,
    );
}

function getTextureModule(
  gltf: MutableGltfDocument,
  textureRef: GltfTextureRef | undefined,
  resourceModules: Record<string, number>,
) {
  const textureIndex = textureRef?.index;
  if (textureIndex === undefined) {
    return undefined;
  }

  const sourceIndex = gltf.textures?.[textureIndex]?.source;
  if (sourceIndex === undefined) {
    return undefined;
  }

  const imageUri = gltf.images?.[sourceIndex]?.uri;
  if (!imageUri) {
    return undefined;
  }

  return resolveResourceModule(imageUri, resourceModules);
}

function stripMaterialTextureRefs(gltf: MutableGltfDocument) {
  gltf.materials?.forEach((material) => {
    delete material.normalTexture;
    delete material.occlusionTexture;
    delete material.emissiveTexture;

    if (material.pbrMetallicRoughness) {
      delete material.pbrMetallicRoughness.baseColorTexture;
      delete material.pbrMetallicRoughness.metallicRoughnessTexture;
    }
  });
}

function rewriteGltfResourceUris(
  gltf: MutableGltfDocument,
  resourceUris: Map<string, string>,
) {
  gltf.buffers?.forEach((buffer) => {
    if (buffer.uri) {
      buffer.uri = resolveResourceUri(buffer.uri, resourceUris) ?? buffer.uri;
    }
  });

  gltf.images?.forEach((image) => {
    if (image.uri) {
      image.uri = resolveResourceUri(image.uri, resourceUris) ?? image.uri;
    }
  });
}

function createResourceLoadingManager(resourceUris: Map<string, string>) {
  const manager = new LoadingManager();

  manager.setURLModifier((url) => resolveResourceUri(url, resourceUris) ?? url);

  return manager;
}

function resolveResourceUri(url: string, resourceUris: Map<string, string>) {
  const normalizedUrl = normalizeAssetUri(url);

  for (const [resourceUri, resolvedUri] of resourceUris) {
    if (normalizedUrl === resourceUri || normalizedUrl.endsWith(`/${resourceUri}`)) {
      return resolvedUri;
    }
  }

  const fileName = normalizedUrl.split('/').pop();
  if (fileName) {
    for (const [resourceUri, resolvedUri] of resourceUris) {
      if (resourceUri.endsWith(`/${fileName}`) || resourceUri === fileName) {
        return resolvedUri;
      }
    }
  }

  return null;
}

function resolveResourceModule(
  url: string,
  resourceModules: Record<string, number>,
) {
  const normalizedUrl = normalizeAssetUri(url);
  const directModule = resourceModules[normalizedUrl];

  if (directModule) {
    return directModule;
  }

  const fileName = normalizedUrl.split('/').pop();
  if (!fileName) {
    return undefined;
  }

  for (const [resourceUri, resourceModule] of Object.entries(resourceModules)) {
    if (resourceUri.endsWith(`/${fileName}`) || resourceUri === fileName) {
      return resourceModule;
    }
  }

  return undefined;
}

function normalizeAssetUri(uri: string) {
  return decodeURIComponent(uri).replace(/\\/g, '/').split('?')[0];
}

async function applyManualTextures(
  scene: Object3D,
  assignments: MaterialTextureAssignment[],
) {
  if (assignments.length === 0) {
    return;
  }

  const loadedByMaterial = new Map<
    string,
    {
      aoMap?: Texture;
      emissiveMap?: Texture;
      map?: Texture;
      metallicRoughnessMap?: Texture;
      normalMap?: Texture;
    }
  >();
  const textureCache = new Map<number, Promise<Texture>>();
  const loadTexture = (assetModule: number, color: 'srgb' | 'linear') => {
    const cacheKey = color === 'srgb' ? assetModule : -assetModule;
    let texture = textureCache.get(cacheKey);

    if (!texture) {
      texture = createNativeTexture(assetModule, color);
      textureCache.set(cacheKey, texture);
    }

    return texture;
  };

  await Promise.all(
    assignments.map(async (assignment) => {
      loadedByMaterial.set(assignment.materialName, {
        aoMap: assignment.aoMap ? await loadTexture(assignment.aoMap, 'linear') : undefined,
        emissiveMap: assignment.emissiveMap ? await loadTexture(assignment.emissiveMap, 'srgb') : undefined,
        map: assignment.map ? await loadTexture(assignment.map, 'srgb') : undefined,
        metallicRoughnessMap: assignment.metallicRoughnessMap
          ? await loadTexture(assignment.metallicRoughnessMap, 'linear')
          : undefined,
        normalMap: assignment.normalMap ? await loadTexture(assignment.normalMap, 'linear') : undefined,
      });
    }),
  );

  scene.traverse((child) => {
    const mesh = child as Mesh;
    if (!mesh.isMesh || !mesh.material) {
      return;
    }

    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

    materials.forEach((material) => {
      const textures = loadedByMaterial.get(material.name);
      if (!textures) {
        return;
      }

      const texturedMaterial = material as TexturedMaterial;
      if (textures.map) {
        texturedMaterial.map = textures.map;
      }
      if (textures.aoMap) {
        texturedMaterial.aoMap = textures.aoMap;
      }
      if (textures.emissiveMap) {
        texturedMaterial.emissiveMap = textures.emissiveMap;
      }
      if (textures.normalMap) {
        texturedMaterial.normalMap = textures.normalMap;
      }
      if (textures.metallicRoughnessMap) {
        texturedMaterial.metalnessMap = textures.metallicRoughnessMap;
        texturedMaterial.roughnessMap = textures.metallicRoughnessMap;
      }
      texturedMaterial.needsUpdate = true;
    });
  });
}

async function createNativeTexture(
  assetModule: number,
  color: 'srgb' | 'linear',
) {
  const asset = Asset.fromModule(assetModule);
  const resolvedAsset = Image.resolveAssetSource(assetModule);
  await asset.downloadAsync();

  const uri = asset.localUri ?? resolvedAsset?.uri ?? asset.uri;
  const width = asset.width ?? resolvedAsset?.width;
  const height = asset.height ?? resolvedAsset?.height;

  if (!uri || !width || !height) {
    throw new Error('Texture asset could not be resolved for native GL.');
  }

  const texture = new Texture({
    data: { localUri: uri },
    height,
    width,
  } satisfies NativeTextureImage);

  texture.flipY = false;
  texture.needsUpdate = true;

  if (color === 'srgb') {
    texture.colorSpace = SRGBColorSpace;
  }

  (texture as unknown as { isDataTexture: boolean }).isDataTexture = true;

  return texture;
}

function normalizeModel(object: Object3D) {
  const box = getMeshBounds(object);
  const size = new Vector3();
  const center = new Vector3();
  box.getSize(size);
  box.getCenter(center);

  const modelHeight = size.y || Math.max(size.x, size.z) || 1;
  const normalizedScale = 15.8 / modelHeight;

  object.scale.setScalar(normalizedScale);
  object.position.set(
    -center.x * normalizedScale,
    -center.y * normalizedScale,
    -center.z * normalizedScale,
  );

  object.traverse((child) => {
    const mesh = child as Mesh;
    if (!mesh.isMesh) {
      return;
    }

    mesh.castShadow = false;
    mesh.receiveShadow = false;
  });
}

function getMeshBounds(object: Object3D) {
  const box = new Box3();
  let hasMesh = false;

  object.traverse((child) => {
    const mesh = child as Mesh;
    if (!mesh.isMesh) {
      return;
    }

    box.expandByObject(mesh);
    hasMesh = true;
  });

  return hasMesh ? box : new Box3().setFromObject(object);
}

function getFirstAnimationKeyTime(animation: AnimationClip) {
  const firstKeyTime = animation.tracks.reduce((firstTime, track) => {
    const trackTime = track.times[0];
    if (trackTime === undefined) {
      return firstTime;
    }

    return Math.min(firstTime, trackTime);
  }, Number.POSITIVE_INFINITY);

  return Number.isFinite(firstKeyTime) ? firstKeyTime : 0;
}

function collectLipTargets(scene: Object3D): LipTarget[] {
  const targets: LipTarget[] = [];

  scene.traverse((object) => {
    const mesh = object as MorphMesh;

    if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) {
      return;
    }

    const hasViseme = VISEMES.some((name) => getMorphIndex(mesh, name) !== undefined);
    const hasGeneric = GENERIC_MOUTH.some((name) => getMorphIndex(mesh, name) !== undefined);

    if ((hasViseme || hasGeneric) && isMouthLikeMesh(mesh.name)) {
      targets.push({ mesh, mode: hasViseme ? 'viseme' : 'generic' });
    }
  });

  return targets;
}

function isMouthLikeMesh(name: string) {
  const normalizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const hasMouthHint =
    normalizedName.includes('head') ||
    normalizedName.includes('face') ||
    normalizedName.includes('jaw') ||
    normalizedName.includes('mouth') ||
    normalizedName.includes('teeth') ||
    normalizedName.includes('tongue') ||
    normalizedName.includes('wolf3dhead') ||
    normalizedName.includes('wolf3dteeth');
  const isEyeOnly =
    (normalizedName.includes('eye') ||
      normalizedName.includes('brow') ||
      normalizedName.includes('lash')) &&
    !hasMouthHint;

  return hasMouthHint && !isEyeOnly;
}

function applyVisemes(mesh: MorphMesh, activeViseme: string, level: number) {
  VISEMES.forEach((name) => {
    const index = getMorphIndex(mesh, name);

    if (index === undefined || !mesh.morphTargetInfluences) {
      return;
    }

    const current = mesh.morphTargetInfluences[index] ?? 0;
    const target = name === activeViseme
      ? clamp(0.06 + level * 0.46, 0, 0.46)
      : name === 'viseme_sil' && level < 0.03
        ? 0.5
        : 0;
    const alpha = target > current
      ? MODEL_SOURCE.lipSync.transitionAttack
      : MODEL_SOURCE.lipSync.transitionRelease;
    mesh.morphTargetInfluences[index] = lerp(current, target, alpha);
  });
}

function applyGenericMouth(mesh: MorphMesh, level: number, time: number) {
  const open = clamp(
    (level * 0.42 + Math.abs(Math.sin(time * 12)) * level * 0.12) *
      MODEL_SOURCE.lipSync.opennessScale,
    0,
    0.31,
  );
  const rounded = clamp(open * 0.36 * MODEL_SOURCE.lipSync.roundedMouthScale, 0, 0.12);
  const weights: Record<string, number> = {
    jawOpen: open * 0.68,
    mouthOpen: open * 0.74,
    mouthFunnel: rounded,
    mouthPucker: rounded * 0.72,
    mouthLowerDownLeft: open * 0.2,
    mouthLowerDownRight: open * 0.2,
    mouthUpperUpLeft: open * 0.08,
    mouthUpperUpRight: open * 0.08,
    mouthSmile: clamp(open * 0.05, 0, 0.025),
    mouthSmileLeft: clamp(open * 0.04, 0, 0.02),
    mouthSmileRight: clamp(open * 0.04, 0, 0.02),
    mouthClose: open < 0.02 ? 0.06 : 0,
  };

  Object.entries(weights).forEach(([name, target]) => {
    const index = getMorphIndex(mesh, name);

    if (index === undefined || !mesh.morphTargetInfluences) {
      return;
    }

    const current = mesh.morphTargetInfluences[index] ?? 0;
    const alpha = target > current
      ? MODEL_SOURCE.lipSync.transitionAttack
      : MODEL_SOURCE.lipSync.transitionRelease;
    mesh.morphTargetInfluences[index] = lerp(current, target, alpha);
  });
}

function chooseViseme(bands: number[], level: number, time: number) {
  if (level < 0.025) {
    return 'viseme_sil';
  }

  const early = averageBands(bands, 0, 4);
  const center = averageBands(bands, 4, 9);
  const late = averageBands(bands, 9, 13);
  const pulse = Math.floor(time * (8.5 + level * 8));

  if (center > early * 1.08) {
    return pulse % 3 === 0 ? 'viseme_I' : 'viseme_E';
  }

  if (early > late * 1.08) {
    return pulse % 3 === 0 ? 'viseme_U' : 'viseme_O';
  }

  if (pulse % 5 === 0) {
    return 'viseme_PP';
  }

  return pulse % 3 === 0 ? 'viseme_aa' : pulse % 3 === 1 ? 'viseme_E' : 'viseme_O';
}

function averageBands(bands: number[], start: number, end: number) {
  const slice = bands.slice(start, end);

  if (slice.length === 0) {
    return 0;
  }

  return slice.reduce((total, value) => total + value, 0) / slice.length;
}

function getMorphIndex(mesh: MorphMesh, morphName: string) {
  if (!mesh.morphTargetDictionary) {
    return undefined;
  }

  const exact = mesh.morphTargetDictionary[morphName];

  if (exact !== undefined) {
    return exact;
  }

  const normalized = morphName.toLowerCase();
  return Object.entries(mesh.morphTargetDictionary).find(
    ([name]) => name.toLowerCase() === normalized,
  )?.[1];
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function lerp(from: number, to: number, amount: number) {
  return from + (to - from) * amount;
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
  },
  container: {
    backgroundColor: '#f4f5ef',
    borderColor: palette.surfaceMuted,
    borderRadius: 8,
    borderWidth: 1,
    height: 286,
    overflow: 'hidden',
    position: 'relative',
  },
  errorText: {
    color: palette.rust,
  },
  overlay: {
    alignItems: 'center',
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
  },
  overlayText: {
    color: palette.muted,
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
  },
  sceneFooter: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderTopColor: palette.surfaceMuted,
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    paddingVertical: 8,
    position: 'absolute',
    right: 0,
  },
  sceneFootnote: {
    color: palette.muted,
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
  },
  sceneHeader: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 2,
  },
  sceneState: {
    backgroundColor: palette.surfaceMuted,
    borderRadius: 999,
    color: palette.muted,
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  sceneStateActive: {
    backgroundColor: palette.successSoft,
    color: palette.success,
  },
  sceneTitle: {
    color: palette.ink,
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
  },
});
