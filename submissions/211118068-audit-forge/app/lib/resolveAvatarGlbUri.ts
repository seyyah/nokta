import { Platform } from 'react-native';
import { Asset } from 'expo-asset';
import {
  cacheDirectory,
  documentDirectory,
  downloadAsync,
  getContentUriAsync,
  getInfoAsync,
  makeDirectoryAsync,
  copyAsync,
} from 'expo-file-system/legacy';

const avatarModule = require('../avatar.glb');

const CACHE_SUBDIR = 'avatar-viewer/';
const CACHE_GLB = 'avatar.glb';

function storageRoot(): string {
  const root = cacheDirectory ?? documentDirectory;
  if (!root) throw new Error('Dosya depolama açılamadı');
  return root;
}

async function ensureCachedGlb(assetUri: string): Promise<string> {
  const dir = storageRoot() + CACHE_SUBDIR;
  await makeDirectoryAsync(dir, { intermediates: true });
  const dest = dir + CACHE_GLB;

  const cached = await getInfoAsync(dest);
  if (cached.exists && (cached.size ?? 0) > 500_000) {
    return dest;
  }

  // Asset.downloadAsync() Metro unstable_path URL'lerini desteklemiyor.
  // FileSystem.downloadAsync doğrudan HTTP GET yapar — çalışır.
  if (assetUri.startsWith('http://') || assetUri.startsWith('https://')) {
    await downloadAsync(assetUri, dest);
  } else {
    const from = assetUri.startsWith('file://') ? assetUri : `file://${assetUri}`;
    await copyAsync({ from, to: dest });
  }
  return dest;
}

async function toWebViewSrc(filePath: string): Promise<string> {
  const fileUri = filePath.startsWith('file://') ? filePath : `file://${filePath}`;
  if (Platform.OS === 'android') {
    try {
      return await getContentUriAsync(fileUri);
    } catch {
      return fileUri;
    }
  }
  return fileUri;
}

export async function resolveAvatarGlbUri(
  onProgress: (pct: number, label: string) => void
): Promise<string> {
  const asset = Asset.fromModule(avatarModule);
  onProgress(15, 'Model hazırlanıyor…');

  // Her zaman cache'e indir — hem Expo Go hem APK için tutarlı
  onProgress(25, 'Model indiriliyor (13 MB)…');
  const localPath = await ensureCachedGlb(asset.uri);
  onProgress(60, 'Android için bağlanıyor…');
  return toWebViewSrc(localPath);
}

export function getAvatarAssetModule(): number {
  return avatarModule;
}
