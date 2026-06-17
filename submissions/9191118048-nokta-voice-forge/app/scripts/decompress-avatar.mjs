import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const assetsDir = path.join(__dirname, '../assets');
  const inFile = path.join(assetsDir, 'avatar.glb');
  const outFile = path.join(assetsDir, 'avatar.uncompressed.glb');

  console.log(`[Decompress] Reading ${inFile}`);

  if (!fs.existsSync(inFile)) {
    console.error(`[Decompress] Error: input file not found: ${inFile}`);
    process.exit(1);
  }

  // 1. Await MeshoptDecoder readiness
  await MeshoptDecoder.ready;

  // 2. Setup NodeIO with the extension and decoder
  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({
      'meshopt.decoder': MeshoptDecoder,
    });

  // 3. Read the document (this will use the decoder to parse meshopt-compressed data)
  const document = await io.read(inFile);
  
  // 4. Inspect to see if it used compression
  let wasCompressed = false;
  const root = document.getRoot();
  const extensions = root.listExtensionsUsed();
  
  for (const ext of extensions) {
    if (ext.extensionName === 'EXT_meshopt_compression') {
      wasCompressed = true;
      console.log(`[Decompress] Found EXT_meshopt_compression. Removing it...`);
      // Disposing the extension from the document means it won't be written back
      ext.dispose();
    }
  }

  if (!wasCompressed) {
    console.log(`[Decompress] Notice: EXT_meshopt_compression was not found in the file. Will just write it as-is.`);
  }

  // 5. Write the uncompressed document
  // Because we removed the extension and we don't apply meshopt encoding during write,
  // the resulting GLB will be a standard binary GLTF.
  console.log(`[Decompress] Writing ${outFile}`);
  await io.write(outFile, document);

  console.log(`[Decompress] Done! Created avatar.uncompressed.glb successfully.`);
  
  // Optional: print some stats to verify
  console.log(`\n--- Stats ---`);
  console.log(`Meshes: ${root.listMeshes().length}`);
  console.log(`Materials: ${root.listMaterials().length}`);
  console.log(`Textures: ${root.listTextures().length}`);
}

run().catch(err => {
  console.error('[Decompress] Fatal Error:', err);
  process.exit(1);
});
