import { PerspectiveCamera } from 'three';

function createCamera(aspect = 1) {
  const camera = new PerspectiveCamera(
    75,           // field of view
    aspect,       // aspect ratio
    0.1,          // near clipping plane
    1000          // far clipping plane
  );

  // Position camera to view the model
  camera.position.set(0, 0, 3);

  return camera;
}

export { createCamera };