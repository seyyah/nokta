/**
 * GLB binary'sindeki embedded texture'ları cihaz diskine çıkarır, GLTF JSON'unu
 * file:// URI'leri ile günceller ve yeni GLB'yi cache'e yazar.
 *
 * NEDEN: Three.js r160 GLTFLoader, embedded texture'lar için URL.createObjectURL(Blob)
 * kullanır. React Native'de bu blob: URL'ler WebGL texture'a dönüşemiyor → gri/beyaz model.
 * Burada texture'ları Three.js görmeden önce dosyaya yazıyoruz; R3F native file:// URI'leri
 * natively yükleyebiliyor.
 */

import {
  cacheDirectory,
  documentDirectory,
  makeDirectoryAsync,
  writeAsStringAsync,
  readAsStringAsync,
  getInfoAsync,
  EncodingType,
} from 'expo-file-system/legacy';

const TEX_DIR = 'glb-tex/';
const PROC_DIR = 'glb-proc/';

function u8ToBase64(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]);
  }
  return btoa(bin);
}

export async function preprocessGlbTextures(glbUri: string): Promise<string> {
  const base = cacheDirectory ?? documentDirectory ?? '';
  const texDir = base + TEX_DIR;
  const procDir = base + PROC_DIR;
  const name = glbUri.split('/').pop() ?? 'avatar.glb';
  const procPath = procDir + name;

  // Daha önce işlendiyse direkt döndür
  const { exists } = await getInfoAsync(procPath);
  if (exists) return procPath;

  await makeDirectoryAsync(texDir, { intermediates: true });
  await makeDirectoryAsync(procDir, { intermediates: true });

  // GLB'yi base64 oku → binary Uint8Array
  const b64 = await readAsStringAsync(glbUri, { encoding: EncodingType.Base64 });
  const rawBin = atob(b64);
  const src = new Uint8Array(rawBin.length);
  for (let i = 0; i < rawBin.length; i++) src[i] = rawBin.charCodeAt(i);

  const dv = new DataView(src.buffer);

  // GLB magic kontrolü ("glTF" = 0x46546C67)
  if (dv.getUint32(0, true) !== 0x46546C67) {
    throw new Error('preprocessGlb: geçersiz GLB formatı');
  }

  // JSON chunk (offset 12: uzunluk, offset 20: veri başlangıcı)
  const jsonLen = dv.getUint32(12, true);
  const jsonSlice = src.subarray(20, 20 + jsonLen);
  let jsonStr = '';
  for (let i = 0; i < jsonSlice.length; i++) {
    jsonStr += String.fromCharCode(jsonSlice[i]);
  }

  type Img = { bufferView?: number; mimeType?: string; uri?: string };
  type BV = { byteOffset: number; byteLength: number };
  const gltf = JSON.parse(jsonStr) as { images?: Img[]; bufferViews?: BV[] };

  const binStart = 20 + jsonLen;
  if (binStart + 8 > src.length || !gltf.images?.length || !gltf.bufferViews?.length) {
    return glbUri; // BIN chunk yok ya da image yok
  }

  const binLen = dv.getUint32(binStart, true);
  const bin = src.subarray(binStart + 8, binStart + 8 + binLen);

  const key = name.replace(/\.\w+$/, '');
  let changed = false;

  for (let i = 0; i < gltf.images.length; i++) {
    const img = gltf.images[i];
    if (img.bufferView === undefined) continue;

    const bv = gltf.bufferViews[img.bufferView];
    const imgBytes = bin.subarray(bv.byteOffset, bv.byteOffset + bv.byteLength);
    const mime = img.mimeType ?? 'image/jpeg';
    const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg';
    const texPath = `${texDir}${key}_${i}.${ext}`;

    const { exists: texOk } = await getInfoAsync(texPath);
    if (!texOk) {
      await writeAsStringAsync(texPath, u8ToBase64(imgBytes), {
        encoding: EncodingType.Base64,
      });
    }

    // bufferView yerine dosya URI'si koy
    delete img.bufferView;
    delete img.mimeType;
    img.uri = texPath; // cacheDirectory file:// içeriyor
    changed = true;
  }

  if (!changed) return glbUri;

  // Güncellenmiş JSON ile yeni GLB oluştur
  const newJsonStr = JSON.stringify(gltf);
  const pad = (4 - (newJsonStr.length % 4)) % 4;
  const newJsonLen = newJsonStr.length + pad;
  const newJsonBytes = new Uint8Array(newJsonLen);
  newJsonBytes.fill(0x20); // boşlukla doldur
  for (let i = 0; i < newJsonStr.length; i++) {
    newJsonBytes[i] = newJsonStr.charCodeAt(i);
  }

  const total = 12 + 8 + newJsonLen + 8 + binLen;
  const out = new Uint8Array(total);
  const ov = new DataView(out.buffer);

  // GLB header
  ov.setUint32(0, 0x46546C67, true);
  ov.setUint32(4, 2, true);
  ov.setUint32(8, total, true);
  // JSON chunk
  ov.setUint32(12, newJsonLen, true);
  ov.setUint32(16, 0x4E4F534A, true);
  out.set(newJsonBytes, 20);
  // BIN chunk
  const bo = 20 + newJsonLen;
  ov.setUint32(bo, binLen, true);
  ov.setUint32(bo + 4, 0x004E4942, true);
  out.set(bin, bo + 8);

  await writeAsStringAsync(procPath, u8ToBase64(out), { encoding: EncodingType.Base64 });
  return procPath;
}
