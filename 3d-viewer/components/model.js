import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();

async function loadModel(modelPath) {
  try {
    const gltf = await loader.loadAsync(modelPath);
    const model = gltf.scene;
    
    // Set model to white by default
    model.traverse((child) => {
      if (child.isMesh) {
        child.material.color.setHex(0xffffff);
      }
    });

    return model;
  } catch (error) {
    console.error(`Failed to load model from ${modelPath}:`, error);
    throw error;
  }
}

export { loadModel };