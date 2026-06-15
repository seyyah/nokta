import React, { Suspense, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Platform } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Asset } from 'expo-asset';
import * as THREE from 'three';

function Model({ amplitude }: { amplitude: number }) {
  const gltf = useGLTF(
    Platform.OS === 'web'
      ? Asset.fromModule(require('../assets/model.glb')).uri
      : require('../assets/model.glb')
  ) as any;
  const modelRef = useRef<THREE.Group>();
  const headRef = useRef<THREE.Object3D | null>(null);
  const lookMeshRef = useRef<THREE.Mesh | null>(null);
  
  // Bone references to bring arms down and animate them
  const leftArmRef = useRef<THREE.Object3D | null>(null);
  const rightArmRef = useRef<THREE.Object3D | null>(null);
  const leftForeArmRef = useRef<THREE.Object3D | null>(null);
  const rightForeArmRef = useRef<THREE.Object3D | null>(null);
  const morphTargetMeshes = useRef<{ mesh: THREE.Mesh; index: number }[]>([]);

  useEffect(() => {
    if (gltf && gltf.scene) {
      morphTargetMeshes.current = [];
      gltf.scene.traverse((child: any) => {
        if (child.name === 'Head') {
          headRef.current = child;
        }
        if (child.name === 'avaturn_look_0') {
          lookMeshRef.current = child;
        }
        if (child.name === 'LeftArm') {
          leftArmRef.current = child;
        }
        if (child.name === 'RightArm') {
          rightArmRef.current = child;
        }
        if (child.name === 'LeftForeArm') {
          leftForeArmRef.current = child;
        }
        if (child.name === 'RightForeArm') {
          rightForeArmRef.current = child;
        }

        // Auto-detect mouth/viseme morph targets
        if (child.isMesh && child.morphTargetDictionary) {
          const dict = child.morphTargetDictionary;
          for (const key of Object.keys(dict)) {
            const keyLower = key.toLowerCase();
            if (
              keyLower === 'mouthopen' ||
              keyLower === 'jawopen' ||
              keyLower === 'mouth_open' ||
              keyLower === 'jaw_open' ||
              keyLower === 'jaw_open_arkit' ||
              keyLower.includes('viseme_aa')
            ) {
              console.log(`[AvatarScene] Mapping viseme morph target: ${key} on mesh ${child.name}`);
              morphTargetMeshes.current.push({ mesh: child, index: dict[key] });
            }
          }
        }
      });
    }
  }, [gltf]);

  useFrame((state) => {
    if (!gltf) return;

    const time = state.clock.getElapsedTime();

    // 1. Idle breathing & natural head movement
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(time * 1.5) * 0.04;
      headRef.current.rotation.x = -0.079 + Math.cos(time * 1.0) * 0.015;
    }

    // 2. Bring arms down (A-pose) and add gestures when speaking
    const baseLeftArmZ = -1.25;
    const baseRightArmZ = 1.25;
    const baseLeftForeArmY = 0.3;
    const baseRightForeArmY = -0.3;

    // Subtle breathing animation on shoulders/arms
    const breathingOffset = Math.sin(time * 1.8) * 0.015;

    // Speach reactive arm movement (gestures)
    let speakGestureLeftZ = 0;
    let speakGestureRightZ = 0;
    let speakGestureLeftX = 0;
    let speakGestureRightX = 0;

    if (amplitude > 0.03) {
      speakGestureLeftZ = Math.sin(time * 8.0) * amplitude * 0.25;
      speakGestureRightZ = -Math.cos(time * 7.0) * amplitude * 0.25;
      speakGestureLeftX = (Math.cos(time * 9.0) + 1.0) * amplitude * 0.2;
      speakGestureRightX = (Math.sin(time * 8.5) + 1.0) * amplitude * 0.2;
    }

    if (leftArmRef.current) {
      leftArmRef.current.rotation.z = baseLeftArmZ + breathingOffset + speakGestureLeftZ;
      leftArmRef.current.rotation.x = speakGestureLeftX;
      leftArmRef.current.rotation.y = Math.sin(time * 0.8) * 0.05;
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.z = baseRightArmZ - breathingOffset + speakGestureRightZ;
      rightArmRef.current.rotation.x = speakGestureRightX;
      rightArmRef.current.rotation.y = -Math.sin(time * 0.8) * 0.05;
    }
    if (leftForeArmRef.current) {
      leftForeArmRef.current.rotation.y = baseLeftForeArmY + (amplitude > 0.03 ? Math.sin(time * 10) * amplitude * 0.15 : 0);
    }
    if (rightForeArmRef.current) {
      rightForeArmRef.current.rotation.y = baseRightForeArmY - (amplitude > 0.03 ? Math.cos(time * 9) * amplitude * 0.15 : 0);
    }

    // 3. Lip-sync animation based on microphone amplitude
    if (amplitude > 0.02) {
      if (headRef.current) {
        headRef.current.rotation.x += Math.sin(time * 25) * amplitude * 0.05;
        headRef.current.rotation.z = Math.cos(time * 20) * amplitude * 0.025;
      }

      // Set morph target values to open mouth
      morphTargetMeshes.current.forEach(({ mesh, index }) => {
        if (mesh.morphTargetInfluences) {
          mesh.morphTargetInfluences[index] = THREE.MathUtils.lerp(
            mesh.morphTargetInfluences[index],
            Math.min(1.0, amplitude * 2.2), // Scale factor for natural mouth open
            0.3
          );
        }
      });

      // Scale fallback if no morph targets found
      if (morphTargetMeshes.current.length === 0 && lookMeshRef.current) {
        lookMeshRef.current.scale.y = 1 + amplitude * 0.15;
        lookMeshRef.current.position.y = -amplitude * 0.02;
      }
    } else {
      // Close mouth and return to default state
      morphTargetMeshes.current.forEach(({ mesh, index }) => {
        if (mesh.morphTargetInfluences) {
          mesh.morphTargetInfluences[index] = THREE.MathUtils.lerp(
            mesh.morphTargetInfluences[index],
            0,
            0.25
          );
        }
      });

      if (lookMeshRef.current) {
        lookMeshRef.current.scale.y = THREE.MathUtils.lerp(lookMeshRef.current.scale.y, 1.0, 0.2);
        lookMeshRef.current.position.y = THREE.MathUtils.lerp(lookMeshRef.current.position.y, 0, 0.2);
      }
    }
  });

  if (!gltf) return null;

  return <primitive ref={modelRef} object={gltf.scene} scale={1.8} position={[0, -2.5, 0]} />;
}

interface Props {
  amplitude: number;
}

export function AvatarScene({ amplitude }: Props) {
  return (
    <View style={styles.canvasContainer}>
      <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
        <ambientLight intensity={1.2} />
        <directionalLight position={[2, 5, 2]} intensity={1.5} />
        <pointLight position={[-2, -2, -2]} intensity={0.5} />
        <Suspense fallback={null}>
          <Model amplitude={amplitude} />
        </Suspense>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  canvasContainer: {
    width: '100%',
    height: 350,
    backgroundColor: '#0F0F1A',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#6C63FF20',
  },
  center: {
    height: 350,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F0F1A',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#6C63FF20',
    gap: 12,
  },
  loadingText: {
    color: '#8888AA',
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: '#FF4A4A',
    fontSize: 14,
    paddingHorizontal: 20,
    textAlign: 'center',
  },
});
