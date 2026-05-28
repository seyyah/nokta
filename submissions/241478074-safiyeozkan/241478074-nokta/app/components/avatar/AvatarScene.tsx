
import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import { Group, Mesh, Object3D } from 'three';
import type { PersonaConfig } from '../../src/store/usePersonaStore';

interface AvatarSceneProps {
  speechLevel: number;
  visemeMap?: Record<string, number>;
  persona: PersonaConfig;
}

const visemeNames = ['aa', 'ee', 'oo', 'th', 'f', 'l', 's', 'm'];
const blinkNames = ['blink', 'Blink', 'eyesClosed'];
const mouthNames = ['jawOpen', 'mouthOpen', 'vowel'];

function RawAvatar({ speechLevel, visemeMap, persona }: AvatarSceneProps) {
  const gltf = useGLTF(require('../../../assets/avatar.glb')) as any;
  const meshRef = useRef<Mesh | null>(null);
  const headRef = useRef<Group | null>(null);
  const blinkTimer = useRef(0);
  const blinkThreshold = useRef(Math.random() * 2 + 2);
  const targetInfluences = useMemo(() => new Map<string, number>(), []);

  useEffect(() => {
    const scene = gltf.scene as Object3D;
    scene.traverse((child) => {
      if ((child as Mesh).isMesh && (child as Mesh).morphTargetDictionary) {
        const mesh = child as Mesh;
        meshRef.current = mesh;
        const dictionary = mesh.morphTargetDictionary;
        if (!dictionary) return;
        Object.entries(dictionary).forEach(([key, index]) => {
          targetInfluences.set(key, index as number);
        });
      }
    });
  }, [gltf, targetInfluences]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || !mesh.morphTargetInfluences) return;

    const influences = mesh.morphTargetInfluences;
    const baseMouth = Math.min(1, speechLevel * persona.mouthGain);
    let applied = false;

    if (visemeMap) {
      visemeNames.forEach((name) => {
        const index = targetInfluences.get(name);
        if (index !== undefined) {
          influences[index] = Math.min(1, Math.max(0, visemeMap[name] ?? 0));
          applied = true;
        }
      });
    }

    if (!applied) {
      const mouthIndex = mouthNames
        .map((name) => targetInfluences.get(name))
        .find((index) => index !== undefined);
      if (mouthIndex !== undefined) {
        influences[mouthIndex] = baseMouth;
      }
    }
  }, [speechLevel, visemeMap, persona, targetInfluences]);

  useFrame((state, delta) => {
    const head = headRef.current;
    const mesh = meshRef.current;
    if (head) {
      head.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * persona.headSway;
      head.rotation.x = Math.cos(state.clock.elapsedTime * 0.12) * persona.headSway * 0.5;
    }

    if (mesh && mesh.morphTargetInfluences) {
      blinkTimer.current += delta;
      if (blinkTimer.current >= blinkThreshold.current) {
        blinkTimer.current = 0;
        blinkThreshold.current = persona.blinkRate / 1000 + Math.random() * 1.2;
        const blinkIndex = blinkNames
          .map((name) => targetInfluences.get(name))
          .find((index) => index !== undefined);
        if (blinkIndex !== undefined) {
          mesh.morphTargetInfluences[blinkIndex] = 1;
          setTimeout(() => {
            if (mesh.morphTargetInfluences) {
              mesh.morphTargetInfluences[blinkIndex] = 0;
            }
          }, 120);
        }
      }
    }
  });

  return (
    <group ref={headRef} position={[0, -1.4, 0]}>
      <primitive object={gltf.scene} scale={1.35} />
    </group>
  );
}

export default function AvatarScene(props: AvatarSceneProps) {
  return (
    <Canvas camera={{ position: [0, 0.75, 3], fov: 35 }}>
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 8, 5]} intensity={1.1} />
      <directionalLight position={[-4, 4, -2]} intensity={0.6} />
      <RawAvatar {...props} />
      <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2.2} minPolarAngle={Math.PI / 3} />
    </Canvas>
  );
}
