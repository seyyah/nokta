import React, { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Asset } from 'expo-asset';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Canvas, useFrame, useLoader } from '@react-three/fiber/native';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

const AVATAR_ASSET = require('../../assets/avatar.glb');

type Persona = {
  label: string;
  accent: string;
  backdrop: string;
  scale: number;
};

type GLTFScene = {
  scene: THREE.Group;
};

function AvatarMesh({ level, persona, uri }: { level: number; persona: Persona; uri: string }) {
  const group = useRef<THREE.Group>(null);
  const gltf = useLoader(GLTFLoader, uri) as unknown as GLTFScene;
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);

  const mouth = useMemo(() => {
    let mouthNode: THREE.Object3D | null = null;
    let jawNode: THREE.Object3D | null = null;

    scene.traverse((object: THREE.Object3D) => {
      const name = String(object.name || '').toLowerCase();
      if (!mouthNode && (name.includes('mouth') || name.includes('lip'))) {
        mouthNode = object;
      }
      if (!jawNode && name.includes('jaw')) {
        jawNode = object;
      }
    });

    return { mouthNode, jawNode } as { mouthNode: THREE.Object3D | null; jawNode: THREE.Object3D | null };
  }, [scene]);

  useLayoutEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const maxDim = Math.max(size.x, size.y, size.z, 1);
    const fittedScale = 1.65 / maxDim;

    scene.traverse((object: THREE.Object3D) => {
      if (object instanceof THREE.Mesh && object.material) {
        const material = object.material as THREE.MeshStandardMaterial | THREE.MeshBasicMaterial;
        if ('color' in material && material.color) {
          material.color = new THREE.Color(persona.accent);
        }
        if ('roughness' in material) {
          material.roughness = 0.55;
        }
        if ('metalness' in material) {
          material.metalness = 0.05;
        }
      }
    });

    scene.scale.setScalar(fittedScale);
    scene.position.set(
      -center.x * fittedScale,
      -center.y * fittedScale + size.y * fittedScale * 0.52,
      -center.z * fittedScale,
    );
  }, [scene, persona.accent]);

  useFrame(({ clock }) => {
    const root = group.current;
    if (!root) {
      return;
    }

    const t = clock.getElapsedTime();
    root.rotation.y = Math.sin(t * 0.8) * 0.08;
    root.rotation.x = Math.sin(t * 0.5) * 0.03 - 0.02;
    root.position.y = Math.sin(t * 1.1) * 0.015;
    root.position.z = 0;

    if (mouth.mouthNode) {
      mouth.mouthNode.scale.y = 0.8 + level * 1.9;
      mouth.mouthNode.scale.x = 1 + level * 0.15;
    }

    if (mouth.jawNode) {
      mouth.jawNode.rotation.x = -level * 0.45;
    }
  });

  return <primitive ref={group} object={scene} scale={persona.scale} dispose={null} />;
}

export default function AvatarStage({ level, persona }: { level: number; persona: Persona }) {
  const [uri, setUri] = useState('');

  useEffect(() => {
    let mounted = true;
    Asset.fromModule(AVATAR_ASSET)
      .downloadAsync()
      .then((asset) => {
        if (mounted) {
          setUri(asset.localUri || asset.uri || '');
        }
      })
      .catch(() => {
        if (mounted) {
          setUri('');
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Avatar sahnesi</Text>
          <Text style={styles.subtitle}>GLB, `app/assets/avatar.glb` içinden yüklenir</Text>
        </View>
        <View style={[styles.tag, { backgroundColor: persona.backdrop }]}>
          <Text style={[styles.tagText, { color: persona.accent }]}>{persona.label}</Text>
        </View>
      </View>

      <View style={styles.canvasBox}>
        {uri ? (
          <Canvas camera={{ position: [0, 1.72, 2.65], fov: 18 }}>
            <ambientLight intensity={0.95} />
            <directionalLight position={[3, 4, 5]} intensity={1.35} />
            <pointLight position={[-2, -1, 3]} intensity={0.55} color={persona.accent} />
            <Suspense fallback={null}>
              <AvatarMesh level={level} persona={persona} uri={uri} />
            </Suspense>
          </Canvas>
        ) : (
          <View style={styles.loading}>
            <ActivityIndicator color={persona.accent} />
            <Text style={styles.loadingText}>Avatar yükleniyor...</Text>
          </View>
        )}

        <View style={styles.overlay}>
          <View style={[styles.pulse, { opacity: 0.3 + level * 0.7 }]} />
          <Text style={styles.overlayText}>
            {level > 0.16 ? 'Konuşuyor' : 'Sessiz'} · ağız sürüşü {Math.round(level * 100)}%
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: 'rgba(8, 15, 33, 0.92)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.18)',
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  title: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '900',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
  },
  tag: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  canvasBox: {
    height: 320,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#050a14',
    position: 'relative',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    color: '#94a3b8',
  },
  overlay: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(8, 15, 33, 0.78)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pulse: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: '#22d3ee',
  },
  overlayText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '700',
  },
});
