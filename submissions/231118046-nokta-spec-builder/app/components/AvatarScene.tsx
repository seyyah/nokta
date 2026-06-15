import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Platform, Animated } from 'react-native';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import * as THREE from 'three';
// @ts-ignore
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Safe dynamic import to prevent native ExpoGL module crashes on mismatched Expo Go versions
let GLView: any = null;
try {
  GLView = require('expo-gl').GLView;
} catch (e) {
  console.warn('[AvatarScene] expo-gl native module is not available on this device client.');
}

// 100% synchronous, self-contained ArrayBuffer to Base64 encoder
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let base64 = '';

  for (let i = 0; i < len; i += 3) {
    const b1 = bytes[i];
    const b2 = i + 1 < len ? bytes[i + 1] : NaN;
    const b3 = i + 2 < len ? bytes[i + 2] : NaN;

    const enc1 = b1 >> 2;
    const enc2 = ((b1 & 3) << 4) | (isNaN(b2) ? 0 : b2 >> 4);
    const enc3 = isNaN(b2) ? 64 : ((b2 & 15) << 2) | (isNaN(b3) ? 0 : b3 >> 6);
    const enc4 = isNaN(b3) ? 64 : b3 & 63;

    base64 += chars[enc1] + chars[enc2] + 
              (enc3 === 64 ? '=' : chars[enc3]) + 
              (enc4 === 64 ? '=' : chars[enc4]);
  }

  return base64;
}

// Polyfill synchronous Blob & URL.createObjectURL for ArrayBuffers on React Native to support embedded GLB textures
if (Platform.OS !== 'web') {
  const OriginalBlob = global.Blob;
  if (OriginalBlob) {
    const SafeBlob = function(this: any, parts: any[], options?: any) {
      const part = parts && parts[0];
      const isBinary = part && (
        part instanceof ArrayBuffer ||
        ArrayBuffer.isView(part) ||
        part.buffer instanceof ArrayBuffer ||
        typeof part.byteLength === 'number' ||
        (part.constructor && part.constructor.name && part.constructor.name.indexOf('Array') !== -1)
      );

      if (isBinary) {
        let buffer: ArrayBuffer;
        
        if (part instanceof ArrayBuffer) {
          buffer = part;
        } else if (typeof part.byteLength === 'number') {
          // Precisely clone the byte range of the typed array view to avoid corruption
          const view = new Uint8Array(part.buffer || part, part.byteOffset || 0, part.byteLength);
          const copy = new Uint8Array(part.byteLength);
          copy.set(view);
          buffer = copy.buffer;
        } else {
          buffer = part;
        }

        // Return a plain object to completely bypass non-configurable prototype getter restrictions
        return {
          _arrayBuffer: buffer,
          size: part.byteLength,
          type: (options && options.type) || 'image/png'
        };
      }

      return Reflect.construct(OriginalBlob, [parts, options]);
    };

    SafeBlob.prototype = Object.create(OriginalBlob.prototype);
    SafeBlob.prototype.constructor = SafeBlob;

    // Support instanceof checks for both our plain binary blobs and native Blobs
    Object.defineProperty(SafeBlob, Symbol.hasInstance, {
      value: function(instance: any) {
        return instance && (
          instance._arrayBuffer !== undefined ||
          instance instanceof OriginalBlob
        );
      },
      configurable: true
    });

    global.Blob = SafeBlob as any;
  }

  if (!global.URL) {
    global.URL = {} as any;
  }
  global.URL.createObjectURL = (blob: any) => {
    if (blob && blob._arrayBuffer) {
      const base64 = arrayBufferToBase64(blob._arrayBuffer);
      return `data:${blob.type || 'image/png'};base64,${base64}`;
    }
    return '';
  };
}

interface AvatarSceneProps {
  audioLevel: number;
}

// Bulletproof, self-contained base64 decoding to ArrayBuffer for React Native
function decodeBase64ToArrayBuffer(base64: string): ArrayBuffer {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }

  let bufferLength = base64.length * 0.75;
  if (base64.endsWith('==')) {
    bufferLength -= 2;
  } else if (base64.endsWith('=')) {
    bufferLength -= 1;
  }

  const arrayBuffer = new ArrayBuffer(bufferLength);
  const bytes = new Uint8Array(arrayBuffer);

  let p = 0;
  for (let i = 0; i < base64.length; i += 4) {
    const encoded1 = lookup[base64.charCodeAt(i)];
    const encoded2 = lookup[base64.charCodeAt(i + 1)];
    const encoded3 = lookup[base64.charCodeAt(i + 2)];
    const encoded4 = lookup[base64.charCodeAt(i + 3)];

    bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
    if (p < bufferLength) {
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    }
    if (p < bufferLength) {
      bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }
  }

  return arrayBuffer;
}

// Robust local and remote texture loader utility supporting Web and Native (expo-gl)
async function loadTexture(module: any): Promise<THREE.Texture | null> {
  try {
    const asset = Asset.fromModule(module);
    await asset.downloadAsync();

    if (Platform.OS === 'web') {
      return new Promise((resolve) => {
        const loader = new THREE.TextureLoader();
        loader.load(
          asset.uri,
          (texture) => {
            texture.flipY = false;
            resolve(texture);
          },
          undefined,
          (error) => {
            console.warn('[AvatarScene] Web texture loader failed gracefully:', error);
            resolve(null);
          }
        );
      });
    } else {
      // Mobile Native: Create THREE.Texture mapped directly to local filesystem
      const texture = new THREE.Texture();
      // @ts-ignore
      texture.image = {
        localUri: asset.localUri || asset.uri,
        width: asset.width || 1024,
        height: asset.height || 1024,
      };
      
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.flipY = false;
      texture.needsUpdate = true;

      return texture;
    }
  } catch (error) {
    console.warn('[AvatarScene] Failed to load texture gracefully:', error);
    return null;
  }
}

export default function AvatarScene({ audioLevel }: AvatarSceneProps) {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const targetLevel = useRef(0);
  const currentLevel = useRef(0);


  // Core animated scale value for the 2D ripple fallback
  const fallbackScale = useRef(new Animated.Value(1)).current;

  // Sync prop changes into a ref to avoid React re-rendering during animation frames
  useEffect(() => {
    targetLevel.current = audioLevel;

    // Drive the 2D spring ripple animation on the native UI thread
    Animated.spring(fallbackScale, {
      toValue: 1 + audioLevel * 0.65, // Scale up to 1.65x based on voice intensity
      useNativeDriver: true,
      tension: 110,
      friction: 8,
    }).start();
  }, [audioLevel]);

  // If expo-gl native module is missing on this client, render the premium fallback
  if (!GLView) {
    const pulse1 = fallbackScale;
    const pulse2 = fallbackScale.interpolate({
      inputRange: [1, 1.65],
      outputRange: [1, 2.2],
    });

    return (
      <View style={styles.container}>
        <View style={styles.fallbackContainer}>
          {/* Glowing concentric ripple rings */}
          <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulse2 }] }]} />
          <Animated.View style={[styles.pulseRing2, { transform: [{ scale: pulse1 }] }]} />
          
          {/* Center glowing microphone button */}
          <View style={styles.micCircle}>
            <Text style={{ fontSize: 38 }}>🎙️</Text>
          </View>
        </View>
      </View>
    );
  }

  const onContextCreate = async (gl: any) => {
    // 1. Setup Three.js WebGLRenderer bound to the expo-gl context
    const renderer = new THREE.WebGLRenderer({
      canvas: {
        width: gl.drawingBufferWidth,
        height: gl.drawingBufferHeight,
        style: {},
        addEventListener: () => {},
        removeEventListener: () => {},
        clientHeight: gl.drawingBufferHeight,
      } as any,
      context: gl,
      antialias: true,
    });

    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    renderer.setPixelRatio(gl.drawingBufferPixelRatio || 1);
    renderer.setClearColor('#0a0a0c'); // Deep minimal dark background

    // 2. Setup Three.js Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      100
    );

    // 3. Premium Studio Lighting System
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    // Primary warm key light for depth and facial features
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(2, 4, 3);
    scene.add(keyLight);

    // Dynamic purple/indigo rim light (highly premium visual effect)
    const rimLight = new THREE.DirectionalLight(0x8a2be2, 1.2);
    rimLight.position.set(-2, 2, -3);
    scene.add(rimLight);

    let frameId: number;
    let mouthMesh: THREE.Mesh | null = null;
    let morphIndex = -1;
    let jawBone: THREE.Object3D | null = null;
    let headBone: THREE.Object3D | null = null;
    let neckBone: THREE.Object3D | null = null;
    let avatarModel: THREE.Group | null = null;

    try {
      // 4. Resolve local avatar_runtime_final.glb file using expo-asset
      const asset = Asset.fromModule(require('../assets/avatar_runtime_final.glb'));
      await asset.downloadAsync();

      const localUri = asset.localUri || asset.uri;
      if (!localUri) {
        throw new Error('Failed to resolve avatar asset URI.');
      }

      const loader = new GLTFLoader();

      // Shared scene builder after successful load
      const setupSceneModel = async (model: any) => {
        avatarModel = model;
        scene.add(model);

        // 1. Inspect morph targets and skinned mesh bindings as requested
        console.log('=== Skinned Mesh & Morph Target Audit ===');
        let skinnedMeshCount = 0;
        let jawBoneExists = false;
        
        model.traverse((node: any) => {
          if (node.isSkinnedMesh || (node.isMesh && node.skeleton)) {
            skinnedMeshCount++;
            console.log(`- SkinnedMesh ${skinnedMeshCount}: name="${node.name}"`);
            if (node.morphTargetDictionary) {
              console.log(`  - morphTargetDictionary keys:`, Object.keys(node.morphTargetDictionary));
              if (node.morphTargetInfluences) {
                console.log(`  - morphTargetInfluences length: ${node.morphTargetInfluences.length}`);
              }
            } else {
              console.log(`  - No morphTargetDictionary found.`);
            }
          }
          if (node.isBone) {
            const name = node.name.toLowerCase();
            if (name.includes('jaw')) {
              jawBoneExists = true;
              console.log(`  - Jaw Bone candidate found: name="${node.name}"`);
            }
          }
        });
        console.log(`Total SkinnedMeshes: ${skinnedMeshCount}`);
        console.log(`Jaw Bone Exists: ${jawBoneExists ? 'YES' : 'NO'}`);
        console.log('========================================');

        // Preload Avaturn textures in parallel to maximize performance and avoid frame lag
        let textures: {
          body: THREE.Texture | null;
          hair: THREE.Texture | null;
          look: THREE.Texture | null;
          shoes: THREE.Texture | null;
          glasses: THREE.Texture | null;
        } = { body: null, hair: null, look: null, shoes: null, glasses: null };

        try {
          const [body, hair, look, shoes, glasses] = await Promise.all([
            loadTexture(require('../assets/avatar_body.png')).catch(() => null),
            loadTexture(require('../assets/avatar_hair.png')).catch(() => null),
            loadTexture(require('../assets/avatar_look.png')).catch(() => null),
            loadTexture(require('../assets/avatar_shoes.png')).catch(() => null),
            loadTexture(require('../assets/avatar_glasses.png')).catch(() => null),
          ]);
          textures = { body, hair, look, shoes, glasses };
          
          console.log('[AvatarScene] External textures loaded:');
          console.log(`- body: ${textures.body ? 'SUCCESS' : 'FAILED'}`);
          console.log(`- hair: ${textures.hair ? 'SUCCESS' : 'FAILED'}`);
          console.log(`- look: ${textures.look ? 'SUCCESS' : 'FAILED'}`);
          console.log(`- shoes: ${textures.shoes ? 'SUCCESS' : 'FAILED'}`);
          console.log(`- glasses: ${textures.glasses ? 'SUCCESS' : 'FAILED'}`);
        } catch (err) {
          console.warn('[AvatarScene] Non-critical texture loader warning:', err);
        }

        let mappedCount = 0;
        let skippedCount = 0;

        // 7. Auto-traverse to identify mouth morph targets, bones, and map textures
        model.traverse((node: any) => {
          // Find morph targets (common in Ready Player Me and premium avatars)
          if (node.isMesh && node.morphTargetDictionary) {
            const dict = node.morphTargetDictionary;
            const candidates = ['mouthOpen', 'jawOpen', 'viseme_O', 'mouth_open', 'MouthOpen'];
            for (const cand of candidates) {
              if (dict[cand] !== undefined) {
                mouthMesh = node;
                morphIndex = dict[cand];
                break;
              }
            }
          }

          // Fallback jaw bone
          if (!jawBone && node.isBone) {
            const candidates = ['Jaw', 'jaw', 'mixamorigJaw', 'LowerJaw', 'lowerjaw'];
            if (candidates.some((cand) => node.name.toLowerCase().includes(cand.toLowerCase()))) {
              jawBone = node;
            }
          }

          // Search head and neck bones for organic speech reactions
          if (node.isBone) {
            const boneName = node.name.toLowerCase();
            if (boneName === 'head') {
              headBone = node;
            } else if (boneName === 'neck') {
              neckBone = node;
            }
          }

          // Map external Avaturn textures manually based on inspected mesh/material mapping
          if (node.isMesh && node.material) {
            node.material = node.material.clone(); // Clone to prevent shared styling conflicts

            const name = node.name.toLowerCase();
            let isMapped = false;
            
            if (name.includes('body') && textures.body) {
              node.material.map = textures.body;
              node.material.roughness = 0.85;
              node.material.metalness = 0.05;
              isMapped = true;
            } else if (name.includes('hair') && textures.hair) {
              node.material.map = textures.hair;
              node.material.roughness = 0.9;
              node.material.metalness = 0.02;
              isMapped = true;
            } else if (name.includes('look') && textures.look) {
              node.material.map = textures.look;
              node.material.roughness = 0.5;
              node.material.metalness = 0.1;
              isMapped = true;
            } else if (name.includes('shoes') && textures.shoes) {
              node.material.map = textures.shoes;
              node.material.roughness = 0.7;
              node.material.metalness = 0.2;
              isMapped = true;
            } else if (name.includes('glasses') && textures.glasses) {
              if (name.includes('glasses_0')) {
                node.material.map = textures.glasses;
                node.material.roughness = 0.4;
                node.material.metalness = 0.8;
              } else {
                // Glasses glass material (avaturn_glasses_1): glass aesthetic
                node.material.color.setHex(0xffffff);
                node.material.transparent = true;
                node.material.opacity = 0.35;
                node.material.roughness = 0.05;
                node.material.metalness = 0.95;
              }
              isMapped = true;
            }

            if (isMapped) {
              mappedCount++;
              console.log(`[AvatarScene] Mesh mapped successfully: "${node.name}"`);
            } else {
              skippedCount++;
              console.log(`[AvatarScene] Mesh skipped/untextured: "${node.name}"`);
            }

            node.material.needsUpdate = true;
          }
        });

        console.log(`[AvatarScene] Total mapped meshes: ${mappedCount}`);
        console.log(`[AvatarScene] Total skipped meshes: ${skippedCount}`);

        // 8. Dynamically position camera centered exactly at the head
        const box = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        box.getCenter(center);
        const size = new THREE.Vector3();
        box.getSize(size);

        const headHeight = center.y + size.y * 0.4; // Head position approximation
        camera.position.set(0, headHeight, size.z * 1.6 || 0.85);
        camera.lookAt(new THREE.Vector3(0, headHeight, 0));

        setLoading(false);
      };

      const validateGltfParser = (gltf: any) => {
        console.log('[AvatarScene] Loaded GLB asset: avatar_runtime_final.glb');
        const json = gltf.parser.json || {};
        const imagesCount = json.images ? json.images.length : 0;
        const texturesCount = json.textures ? json.textures.length : 0;
        const samplersCount = json.samplers ? json.samplers.length : 0;

        console.log(`[AvatarScene] GLTF Parser Validation: images=${imagesCount}, textures=${texturesCount}, samplers=${samplersCount}`);

        if (imagesCount > 0 || texturesCount > 0) {
          console.warn('[AvatarScene] WARNING: Stale or unexpected texture references detected in loaded GLB!');
          if (json.materials) {
            json.materials.forEach((mat: any, idx: number) => {
              if (mat.pbrMetallicRoughness && mat.pbrMetallicRoughness.baseColorTexture) {
                console.warn(`- Offending Material: "${mat.name || idx}" contains baseColorTexture reference:`, mat.pbrMetallicRoughness.baseColorTexture);
              }
            });
          }
        }
      };

      if (Platform.OS === 'web') {
        // 5a. Direct Web Loading via Fetch/XMLHttp to bypass local FileSystem deprecations
        loader.load(
          localUri,
          (gltf: any) => {
            validateGltfParser(gltf);
            setupSceneModel(gltf.scene);
          },
          undefined,
          (error: any) => {
            console.error('[AvatarScene] Web GLTFLoader error:', error);
            setErrorMsg('Error loading 3D model.');
            setLoading(false);
          }
        );
      } else {
        // 5b. Local Native Loading via FileSystem legacy reader
        const base64Content = await FileSystem.readAsStringAsync(localUri, {
          encoding: 'base64',
        });

        const arrayBuffer = decodeBase64ToArrayBuffer(base64Content);

        // 6. Load binary model via GLTFLoader parser
        loader.parse(
          arrayBuffer,
          '',
          (gltf: any) => {
            validateGltfParser(gltf);
            setupSceneModel(gltf.scene);
          },
          (error: any) => {
            console.error('[AvatarScene] Native GLTFLoader parse error:', error);
            setErrorMsg('Error parsing 3D model.');
            setLoading(false);
          }
        );
      }
    } catch (err: any) {
      console.error('[AvatarScene] Failed to load avatar:', err);
      setErrorMsg('Failed to load avatar asset.');
      setLoading(false);
    }

    // 9. Premium Render Loop with lerp mouth movements and idle sway/breathing
    const render = () => {
      frameId = requestAnimationFrame(render);

      // Smooth mouth/speech level interpolation (lerp)
      currentLevel.current += (targetLevel.current - currentLevel.current) * 0.25;



      if (mouthMesh && morphIndex !== -1 && mouthMesh.morphTargetInfluences) {
        mouthMesh.morphTargetInfluences[morphIndex] = currentLevel.current;
      } else if (jawBone) {
        jawBone.rotation.x = currentLevel.current * 0.35; // Fallback jaw rotation
      } else {
        // 4. Fallback mouth/speech animation using Head and Neck bones reactive movement
        if (headBone) {
          // Speak reaction: tilt head slightly forward/down when speaking, with dynamic speech-bobbing
          headBone.rotation.x = currentLevel.current * 0.12 + Math.sin(Date.now() * 0.01) * currentLevel.current * 0.04;
          // Subtly sway head side to side to feel extremely organic and reactive
          headBone.rotation.y = Math.sin(Date.now() * 0.005) * 0.04 + currentLevel.current * 0.05;
          headBone.rotation.z = Math.cos(Date.now() * 0.003) * 0.015;
        }
        if (neckBone) {
          // Dynamic chest breathing and neck sway coordination
          neckBone.rotation.x = currentLevel.current * 0.04;
        }
      }

      // Premium Idle sway & breathing to make the avatar feel alive
      if (avatarModel) {
        const time = Date.now() * 0.001;
        avatarModel.rotation.y = Math.sin(time * 0.5) * 0.04; // Gentle left-right head sway
        avatarModel.position.y = Math.sin(time * 1.5) * 0.006; // Soft vertical breathing idle
      }

      renderer.render(scene, camera);
      gl.endFrameEXP();
    };

    render();

    // 10. Perform garbage collection on unmount to prevent heavy memory leaks
    return () => {
      cancelAnimationFrame(frameId);
      try {
        renderer.dispose();
      } catch (_) {}

      scene.traverse((object: any) => {
        if (object.isMesh) {
          if (object.geometry) {
            object.geometry.dispose();
          }
          if (object.material) {
            const disposeMaterial = (mat: any) => {
              if (mat.map) mat.map.dispose();
              if (mat.lightMap) mat.lightMap.dispose();
              if (mat.bumpMap) mat.bumpMap.dispose();
              if (mat.normalMap) mat.normalMap.dispose();
              if (mat.specularMap) mat.specularMap.dispose();
              if (mat.envMap) mat.envMap.dispose();
              mat.dispose();
            };

            if (Array.isArray(object.material)) {
              object.material.forEach(disposeMaterial);
            } else {
              disposeMaterial(object.material);
            }
          }
        }
      });
    };
  };

  return (
    <View style={styles.container}>
      <GLView style={StyleSheet.absoluteFill} onContextCreate={onContextCreate} />
      
      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#00f2fe" />
          <Text style={styles.loadingText}>Initializing Avatar Scene...</Text>
        </View>
      )}

      {errorMsg && (
        <View style={styles.overlay}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 280,
    height: 280,
    borderRadius: 140, // Perfect circular window for avatar
    overflow: 'hidden',
    backgroundColor: '#0a0a0c',
    borderWidth: 2,
    borderColor: '#1f1f2e',
    marginVertical: 15,
    shadowColor: '#00f2fe',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0a0a0c',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#8b8b9f',
    fontSize: 12,
    marginTop: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  fallbackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0a0c',
    position: 'relative',
  },
  pulseRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: 'rgba(0, 242, 254, 0.12)',
    backgroundColor: 'rgba(0, 242, 254, 0.03)',
    shadowColor: '#00f2fe',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  pulseRing2: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 242, 254, 0.06)',
    backgroundColor: 'rgba(0, 242, 254, 0.015)',
    shadowColor: '#00f2fe',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  micCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#0e0e12',
    borderWidth: 2,
    borderColor: '#1f1f2e',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00f2fe',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
    zIndex: 5,
  },
});
