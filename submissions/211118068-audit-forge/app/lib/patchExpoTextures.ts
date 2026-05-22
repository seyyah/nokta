/**
 * expo-gl texImage2D yalnızca { localUri: 'file://...' } formatındaki objeleri
 * natively yükleyebilir. Bu modül tüm texture URL tiplerini (data:, blob:, file://)
 * bu formata dönüştürür; Three.js / R3F pipeline'ını bypass eder.
 */
import * as THREE from 'three';
import { dataUrlToCacheFile } from './dataUrlTextureCache';

let patched = false;

async function blobUrlToFileUri(blobUrl: string): Promise<string> {
  const response = await fetch(blobUrl);
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl?.startsWith('data:')) {
        reject(new Error('FileReader boş döndü'));
        return;
      }
      void dataUrlToCacheFile(dataUrl).then(resolve).catch(reject);
    };
    reader.onerror = () => reject(new Error('FileReader hatası'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Herhangi bir texture URL'ini expo-gl'in anlayacağı { localUri } objesine çevirir.
 * onLoad({ localUri }) çağrısı → Three.js texture.image = { localUri } yazar →
 * expo-gl texImage2D natively dosyayı okur → tam renkli texture.
 */
function patchedLoad(
  this: unknown,
  url: string,
  onLoad?: (img: unknown) => void,
  _onProgress?: unknown,
  onError?: (err: unknown) => void
): unknown {
  function deliver(fileUri: string): void {
    const img = { localUri: fileUri } as unknown as HTMLImageElement;
    // setTimeout: Three.js loader callbacks her zaman async beklenir
    setTimeout(() => onLoad?.(img), 0);
  }

  if (typeof url !== 'string') return {};

  if (url.startsWith('data:image/')) {
    void dataUrlToCacheFile(url).then(deliver).catch((e) => onError?.(e));
    return {} as HTMLImageElement;
  }

  if (url.startsWith('blob:')) {
    void blobUrlToFileUri(url).then(deliver).catch((e) => onError?.(e));
    return {} as HTMLImageElement;
  }

  if (url.startsWith('file://')) {
    deliver(url);
    return { localUri: url } as unknown as HTMLImageElement;
  }

  // HTTP/HTTPS veya bilinmeyen format — Three.js varsayılan yolu
  return {} as HTMLImageElement;
}

export function patchExpoTextureLoading(): void {
  if (patched) return;
  patched = true;

  THREE.TextureLoader.prototype.load = function (url, onLoad, onProgress, onError) {
    return patchedLoad.call(
      this,
      url,
      onLoad as (img: unknown) => void,
      onProgress,
      onError
    ) as THREE.Texture;
  };

  THREE.ImageLoader.prototype.load = function (url, onLoad, onProgress, onError) {
    return patchedLoad.call(
      this,
      url,
      onLoad as (img: unknown) => void,
      onProgress,
      onError
    ) as HTMLImageElement;
  };
}

/** Materyal son ayarları — yalnızca colorSpace, orijinal değerlere dokunma */
export function tuneLoadedMaterials(scene: THREE.Object3D): void {
  scene.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const mat of mats) {
      if (!mat) continue;
      const std = mat as THREE.MeshStandardMaterial;
      // Base color texture sRGB olarak işaretlenmeli
      if (std.map) {
        std.map.colorSpace = THREE.SRGBColorSpace;
        std.map.needsUpdate = true;
      }
      // Normal/roughness/metalness haritaları linear
      if (std.normalMap) {
        std.normalMap.colorSpace = THREE.LinearSRGBColorSpace;
        std.normalMap.needsUpdate = true;
      }
      if (std.roughnessMap) {
        std.roughnessMap.colorSpace = THREE.LinearSRGBColorSpace;
        std.roughnessMap.needsUpdate = true;
      }
      std.needsUpdate = true;
    }
  });
}
