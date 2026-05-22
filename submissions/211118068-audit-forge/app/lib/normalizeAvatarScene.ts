import * as THREE from 'three';

/** Sadece kadraj — materyale dokunma (GLB orijinal renk/texture) */
export function frameAvatarScene(scene: THREE.Group): void {
  const box = new THREE.Box3().setFromObject(scene);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());

  scene.position.x = -center.x;
  scene.position.z = -center.z;

  const scale = 2.4 / Math.max(size.y, 0.001);
  scene.scale.setScalar(scale);

  // Yüzü lookAt noktasıyla (0.36) hizala; 0.22 çok alçak kalıyordu
  const faceY = center.y + size.y * 0.36;
  scene.position.y = 0.36 - faceY * scale;
}

/** Kamera — yüze yakın, hafif yukarıdan bakan açı */
export const FACE_LOOK_AT: [number, number, number] = [0, 0.36, 0];
export const FACE_CAMERA_POS: [number, number, number] = [0, 0.44, 0.88];

export function applyMouthOpen(scene: THREE.Object3D, mouthOpen: number): void {
  const amount = Math.min(1, Math.max(0, mouthOpen));

  // Yalnızca gerçek çene kemikleri — 'Head' ve gövde parçaları dahil edilmez
  const jaw =
    scene.getObjectByName('jaw') ??
    scene.getObjectByName('Jaw') ??
    scene.getObjectByName('mixamorig_Jaw') ??
    scene.getObjectByName('CC_Base_JawRoot') ??
    scene.getObjectByName('DEF-jaw');

  if (jaw) {
    jaw.rotation.x = -amount * 0.4;
    return;
  }

  // Çene kemiği yok — morph target kullan (Avaturn bu sistemi kullanır)
  scene.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || !mesh.morphTargetInfluences || !mesh.morphTargetDictionary) {
      return;
    }

    const dict = mesh.morphTargetDictionary;

    // Avaturn öncelik sırası: jawOpen → mouthOpen → viseme_aa
    const jawOpenIdx = dict['jawOpen'] ?? dict['JawOpen'];
    if (jawOpenIdx !== undefined) {
      mesh.morphTargetInfluences[jawOpenIdx] = amount * 0.9;
    }

    const mouthOpenIdx = dict['mouthOpen'] ?? dict['MouthOpen'];
    if (mouthOpenIdx !== undefined) {
      mesh.morphTargetInfluences[mouthOpenIdx] = amount * 0.6;
    }

    // Hiçbiri yoksa ilk viseme_aa'yı dene
    if (jawOpenIdx === undefined && mouthOpenIdx === undefined) {
      const key = Object.keys(dict).find((k) => /viseme_aa/i.test(k));
      if (key !== undefined) {
        mesh.morphTargetInfluences[dict[key]] = amount * 0.8;
      }
    }
  });
}
