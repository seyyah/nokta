import {
  cacheDirectory,
  getInfoAsync,
  makeDirectoryAsync,
  writeAsStringAsync,
  EncodingType,
} from 'expo-file-system/legacy';

const TEX_DIR = 'avatar-glb-textures/';
const fileCache = new Map<string, string>();

function cacheKey(dataUrl: string): string {
  let h = 2166136261;
  const slice = dataUrl.length > 4000 ? dataUrl.slice(0, 4000) : dataUrl;
  for (let i = 0; i < slice.length; i++) {
    h ^= slice.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}

/** GLB içindeki data:image/... base64 → cihazda dosya (orijinal renk) */
export async function dataUrlToCacheFile(dataUrl: string): Promise<string> {
  if (!dataUrl.startsWith('data:image/')) {
    return dataUrl;
  }

  const hit = fileCache.get(dataUrl);
  if (hit) return hit;

  const base = cacheDirectory;
  if (!base) throw new Error('texture cache');

  const match = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/i);
  if (!match) return dataUrl;

  const ext = match[1].toLowerCase() === 'png' ? 'png' : 'jpg';
  const b64 = match[2];
  const dir = base + TEX_DIR;
  await makeDirectoryAsync(dir, { intermediates: true });

  let path = dir + cacheKey(dataUrl) + '.' + ext;
  const info = await getInfoAsync(path);
  if (!info.exists) {
    await writeAsStringAsync(path, b64, { encoding: EncodingType.Base64 });
  }

  const uri = path.startsWith('file://') ? path : `file://${path}`;
  fileCache.set(dataUrl, uri);
  return uri;
}
