import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

const loader = new GLTFLoader();

/**
 * Loads a GLB model from a file path, applies default material, and normalizes scale
 */
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
        // Make the material more matte: high roughness, no metal, subtle environment response
        child.material.roughness = 0.9;
        child.material.metalness = 0.0;
        // Reduce environment reflection strength when present
        if (child.material.envMapIntensity !== undefined) child.material.envMapIntensity = 0.5;
        // Disable clearcoat for flatter appearance
        child.material.clearcoat = 0.0;
      }
    });

    return model;
  } catch (error) {
    console.error(`Failed to load model from ${modelPath}:`, error);
    throw error;
  }
}

export { loadModel };