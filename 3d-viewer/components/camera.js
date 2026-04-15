import { PerspectiveCamera } from 'three';

/**
 * Creates a PerspectiveCamera configured for viewing the 3D model
 */
function createCamera(aspect = 1) {
  const camera = new PerspectiveCamera(
    75,           // field of view
    aspect,       // aspect ratio
    0.1,          // near clipping plane
    1000          // far clipping plane
  );

  // Position camera to view model at optimal distance
  camera.position.set(0, 0, 2.5);

  return camera;
}

export { createCamera };