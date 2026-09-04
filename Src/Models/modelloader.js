import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

export class ModelLoader {
  constructor(scene) {
    this.scene = scene;
    this.loader = new GLTFLoader();
    this.currentModel = null;
  }

  loadFromFile(file, onProgress, onSuccess, onError) {
    const url = URL.createObjectURL(file);

    this.loader.load(
      url,
      (gltf) => {
        if (this.currentModel) {
          this.scene.remove(this.currentModel);
        }

        this.currentModel = gltf.scene;

        // Calculate Bounding Box & Fit Scene Centering
        const box = new THREE.Box3().setFromObject(this.currentModel);
        const center = box.getCenter(new THREE.Vector3());
        this.currentModel.position.sub(center);

        this.currentModel.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        this.scene.add(this.currentModel);
        URL.revokeObjectURL(url);
        onSuccess(this.currentModel);
      },
      (xhr) => {
        if (xhr.total > 0) {
          const progress = (xhr.loaded / xhr.total) * 100;
          onProgress(progress);
        }
      },
      (error) => {
        onError('تعذر تحميل النموذج. تأكد من أن الملف بصيغة GLB أو GLTF صالحة.');
      }
    );
  }
}