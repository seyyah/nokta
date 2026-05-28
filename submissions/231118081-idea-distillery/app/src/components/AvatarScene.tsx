import { Canvas, useFrame } from '@react-three/fiber/native';
import { Asset } from 'expo-asset';
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  ACESFilmicToneMapping,
  Box3,
  SRGBColorSpace,
  Vector3,
  type Group,
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

const AVATAR_MODEL = require('../../assets/models/avatar.glb') as number;
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
        camera={{ position: [0, 0, 3.8], fov: 30 }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = SRGBColorSpace;
          gl.toneMapping = ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.08;
        }}
        style={styles.canvas}
      >
        <color args={['#f4f5ef']} attach="background" />
        <ambientLight intensity={0.86} />
        <hemisphereLight args={['#fff8ee', '#d5ded2', 1.28]} position={[0, 3, 0]} />
        <directionalLight intensity={1.65} position={[2.8, 4.8, 4.8]} />
        <directionalLight intensity={0.42} position={[-3.5, 2.2, 4]} />
        <pointLight color="#fff0d6" intensity={0.58} position={[0, 1.4, 2.8]} />
        {model ? (
          <ReactiveAvatar bands={bands} level={level} listening={listening} model={model.scene} />
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
      try {
        setError(null);
        const asset = Asset.fromModule(AVATAR_MODEL);
        await asset.downloadAsync();
        const uri = asset.localUri ?? asset.uri;
        const loader = new GLTFLoader();
        loader.load(
          uri,
          (gltf) => {
            normalizeModel(gltf.scene);
            if (!cancelled) {
              setModel({ scene: gltf.scene });
            }
          },
          undefined,
          (loadError) => {
            if (!cancelled) {
              setError(loadError instanceof Error ? loadError : new Error('GLB load failed'));
            }
          },
        );
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError : new Error('GLB prepare failed'));
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

function ReactiveAvatar({
  bands,
  level,
  listening,
  model,
}: AvatarSceneProps & { model: Object3D }) {
  const group = useRef<Group>(null);
  const scene = useMemo(() => model.clone(true), [model]);
  const targets = useMemo(() => collectLipTargets(scene), [scene]);
  const smoothedLevel = useRef(0);
  const activeViseme = useRef('viseme_sil');
  const nextSwitchAt = useRef(0);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const targetLevel = listening ? clamp(level, 0, 1) : 0;
    const smoothing = targetLevel > smoothedLevel.current ? 0.32 : 0.12;
    smoothedLevel.current += (targetLevel - smoothedLevel.current) * smoothing;
    const voice = smoothedLevel.current < 0.015 ? 0 : smoothedLevel.current;

    if (group.current) {
      const scale = 1 + voice * 0.028;
      group.current.scale.setScalar(scale);
      group.current.position.y = Math.sin(time * 1.15) * 0.018;
      group.current.rotation.y = Math.sin(time * 0.42) * 0.038;
    }

    if (time >= nextSwitchAt.current) {
      activeViseme.current = chooseViseme(bands, voice, time);
      nextSwitchAt.current = time + 0.08 + Math.max(0, 0.14 - voice * 0.08);
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
    <group ref={group}>
      <primitive object={scene} />
    </group>
  );
}

function normalizeModel(scene: Object3D) {
  hideFullBodyMeshes(scene);

  const box = visibleMeshBox(scene);
  const size = box.getSize(new Vector3());
  const center = box.getCenter(new Vector3());
  const maxAxis = Math.max(size.x, size.y, size.z, 1);
  const scale = 1.86 / maxAxis;

  scene.scale.setScalar(scale);
  scene.position.set(-center.x * scale, -center.y * scale - 0.08, -center.z * scale);
  scene.rotation.y = 0.08;
}

function hideFullBodyMeshes(scene: Object3D) {
  const hiddenNames = new Set(['Body_Mesh', 'avaturn_shoes_0', 'avaturn_look_0']);

  scene.traverse((object) => {
    if (hiddenNames.has(object.name)) {
      object.visible = false;
    }
  });
}

function visibleMeshBox(scene: Object3D) {
  const box = new Box3();

  scene.traverse((object) => {
    const mesh = object as Mesh & { isMesh?: boolean };

    if (!mesh.isMesh || !mesh.visible) {
      return;
    }

    box.expandByObject(mesh);
  });

  return box.isEmpty() ? new Box3().setFromObject(scene) : box;
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

    if (hasViseme || hasGeneric || /mouth|jaw|head|face/i.test(mesh.name)) {
      targets.push({ mesh, mode: hasViseme ? 'viseme' : 'generic' });
    }
  });

  return targets;
}

function applyVisemes(mesh: MorphMesh, activeViseme: string, level: number) {
  VISEMES.forEach((name) => {
    const index = getMorphIndex(mesh, name);

    if (index === undefined || !mesh.morphTargetInfluences) {
      return;
    }

    const target = name === activeViseme ? clamp(0.08 + level * 0.82, 0, 0.92) : name === 'viseme_sil' && level < 0.03 ? 0.45 : 0;
    mesh.morphTargetInfluences[index] = lerp(mesh.morphTargetInfluences[index] ?? 0, target, 0.42);
  });
}

function applyGenericMouth(mesh: MorphMesh, level: number, time: number) {
  const open = clamp(level * 1.12 + Math.abs(Math.sin(time * 12)) * level * 0.12, 0, 1);
  const rounded = clamp(level * 0.62, 0, 0.74);
  const weights: Record<string, number> = {
    jawOpen: open * 0.72,
    mouthOpen: open * 0.8,
    mouthFunnel: rounded,
    mouthPucker: rounded * 0.68,
    mouthLowerDownLeft: open * 0.18,
    mouthLowerDownRight: open * 0.18,
    mouthUpperUpLeft: open * 0.08,
    mouthUpperUpRight: open * 0.08,
    mouthClose: open < 0.025 ? 0.06 : 0,
  };

  Object.entries(weights).forEach(([name, target]) => {
    const index = getMorphIndex(mesh, name);

    if (index === undefined || !mesh.morphTargetInfluences) {
      return;
    }

    mesh.morphTargetInfluences[index] = lerp(mesh.morphTargetInfluences[index] ?? 0, target, 0.34);
  });
}

function chooseViseme(bands: number[], level: number, time: number) {
  if (level < 0.025) {
    return 'viseme_sil';
  }

  const low = (bands[1] ?? 0) + (bands[2] ?? 0);
  const mid = (bands[5] ?? 0) + (bands[6] ?? 0);
  const high = (bands[10] ?? 0) + (bands[11] ?? 0);
  const pulse = Math.floor(time * (7 + level * 8));

  if (high > mid && high > low) {
    return pulse % 2 === 0 ? 'viseme_SS' : 'viseme_FF';
  }

  if (low > mid) {
    return pulse % 2 === 0 ? 'viseme_O' : 'viseme_U';
  }

  if (pulse % 5 === 0) {
    return 'viseme_PP';
  }

  return pulse % 3 === 0 ? 'viseme_aa' : pulse % 3 === 1 ? 'viseme_E' : 'viseme_I';
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
    borderRadius: 8,
    borderColor: palette.surfaceMuted,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 12,
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
