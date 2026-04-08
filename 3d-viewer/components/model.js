import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

const loader = new GLTFLoader();

async function loadModel(modelPath) {
  try {
    const gltf = await loader.loadAsync(modelPath);
    const model = gltf.scene;
    
    // Auto-center and normalize model scale so it fits nicely on screen
    const box = new THREE.Box3().setFromObject(model);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const size = new THREE.Vector3();
    box.getSize(size);
    
    // Calculate a scale factor to make the model approx 2.5 units tall
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2.5 / maxDim;
    model.scale.set(scale, scale, scale);
    
    // Recompute box after scale and recenter
    const scaledBox = new THREE.Box3().setFromObject(model);
    const newCenter = new THREE.Vector3();
    scaledBox.getCenter(newCenter);
    model.position.sub(newCenter);

    // Set model to white by default
    model.traverse((child) => {
      if (child.isMesh) {
        if (!child.material.isMeshStandardMaterial) {
          const newMat = new THREE.MeshStandardMaterial();
          newMat.copy(child.material);
          child.material = newMat;
        }
        child.material.color.setHex(0xffffff);
        // Make the material react better to lights by lowering roughness slightly
        child.material.roughness = 0.6;
        child.material.metalness = 0.1;
      }
    });

    return model;
  } catch (error) {
    console.error(`Failed to load model from ${modelPath}:`, error);
    throw error;
  }
}

export { loadModel };