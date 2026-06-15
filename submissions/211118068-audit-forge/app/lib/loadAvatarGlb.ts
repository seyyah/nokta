import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib';
import { Asset } from 'expo-asset';
import {
  cacheDirectory,
  downloadAsync,
  getInfoAsync,
  makeDirectoryAsync,
} from 'expo-file-system/legacy';
import { frameAvatarScene } from './normalizeAvatarScene';
import { patchExpoTextureLoading, tuneLoadedMaterials } from './patchExpoTextures';
import { normalizeFileUri } from './metroHost';
import { preprocessGlbTextures } from './preprocessGlb';

const avatarModule = require('../avatar.glb');

const GLB_CACHE_DIR = (cacheDirectory ?? 'file:///') + 'avatar-r3f/';
const GLB_CACHE_FILE = GLB_CACHE_DIR + 'avatar.glb';

export async function resolveAvatarLoaderUri(): Promise<string> {
  const asset = Asset.fromModule(avatarModule);

  await makeDirectoryAsync(GLB_CACHE_DIR, { intermediates: true });
  const cached = await getInfoAsync(GLB_CACHE_FILE);

  if (!cached.exists || (cached.size ?? 0) < 500_000) {
    await downloadAsync(asset.uri, GLB_CACHE_FILE);
  }

  return normalizeFileUri(GLB_CACHE_FILE);
}

export async function loadAvatarGlb(uri: string): Promise<THREE.Group> {
  patchExpoTextureLoading();

  // Embedded texture'ları blob: URL yerine file:// URI'ye dönüştür.
  // Three.js r160 GLTFLoader blob: URL üretir → React Native WebGL kabul etmez → gri model.
  // preprocessGlbTextures bunları önceden dosyaya yazarak file:// URI'ye çevirir.
  let loadUri = uri;
  try {
    loadUri = await preprocessGlbTextures(uri);
  } catch (e) {
    console.warn('[loadAvatarGlb] preprocess atlandı:', e);
  }

  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      loadUri,
      (gltf) => {
        const root = gltf.scene;
        tuneLoadedMaterials(root);
        frameAvatarScene(root);
        resolve(root);
      },
      undefined,
      (err) => reject(err)
    );
  });
}
