import React, { Suspense, useRef, useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Asset } from 'expo-asset';

let Canvas;
try {
  const r3f = require('@react-three/fiber');
  Canvas = r3f.Canvas;
} catch (e) {
  console.warn('react-three-fiber yüklenemedi:', e.message);
}

function AvatarModel({ url, speaking }) {
  if (!Canvas) return null;
  const { useLoader } = require('@react-three/fiber');
  const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader');
  const gltf = useLoader(GLTFLoader, url);
  const scene = gltf.scene;
  const ref = useRef();

  useEffect(() => {
    if (!ref.current || !scene) return;
    const interval = setInterval(() => {
      scene.traverse((node) => {
        if (node.isMesh && node.morphTargetDictionary && node.morphTargetInfluences) {
          const jawOpen = node.morphTargetDictionary['jawOpen'] ?? node.morphTargetDictionary['mouthOpen'];
          if (jawOpen !== undefined) {
            node.morphTargetInfluences[jawOpen] = speaking ? 0.15 + Math.random() * 0.4 : 0;
          }
        }
      });
    }, 80);
    return () => clearInterval(interval);
  }, [speaking, scene]);

  return <primitive ref={ref} object={scene} scale={2.5} position={[0, -2.5, 0]} />;
}

export default function AvatarWidget({ speaking, width = '100%', height = 200 }) {
  const [modelUri, setModelUri] = useState(null);

  useEffect(() => {
    async function loadAsset() {
      try {
        const asset = Asset.fromModule(require('../../../assets/avatar.glb'));
        await asset.downloadAsync();
        setModelUri(asset.localUri || asset.uri);
      } catch (e) {
        console.error("Avatar GLB yüklenemedi:", e);
      }
    }
    loadAsset();
  }, []);

  if (!Canvas) {
    return (
      <View style={[styles.fallback, { width, height }]}>
        <Text style={{color: '#94a3b8'}}>3D Desteklenmiyor</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { width, height }]}>
      {modelUri ? (
        <Canvas camera={{ position: [0, 0, 2], fov: 45 }}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[2, 5, 5]} intensity={2.5} />
          <pointLight position={[-2, 2, 2]} intensity={1} />
          <Suspense fallback={null}>
            <AvatarModel url={modelUri} speaking={speaking} />
          </Suspense>
        </Canvas>
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#3b82f6" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    overflow: 'hidden',
  },
  fallback: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
