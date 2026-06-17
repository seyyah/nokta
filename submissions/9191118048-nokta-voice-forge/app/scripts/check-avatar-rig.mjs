import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';

const MOUTH_TARGETS = new Set([
  'jawOpen',
  'mouthOpen',
  'mouth_open',
  'viseme_aa',
  'viseme_AA',
  'mouthFunnel',
]);

await MeshoptDecoder.ready;

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.decoder': MeshoptDecoder });

const document = await io.read('assets/avatar.glb');
const targetNames = new Set();

for (const mesh of document.getRoot().listMeshes()) {
  for (const primitive of mesh.listPrimitives()) {
    for (const target of primitive.listTargets()) {
      const name = target.getName();
      if (name) targetNames.add(name);
    }
  }
}

const supportedTargets = [...targetNames].filter((name) => MOUTH_TARGETS.has(name));

console.log(`Morph targets: ${targetNames.size}`);
console.log(`Supported mouth targets: ${supportedTargets.join(', ') || 'none'}`);

if (supportedTargets.length === 0) {
  console.error(
    'Avatar lipsync rig is missing. Export the Avaturn model with facial blendshapes/visemes, then replace assets/avatar.glb.',
  );
  process.exit(1);
}

console.log('Avatar lipsync rig is ready.');
