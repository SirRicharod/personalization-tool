import { WebGLRenderer } from 'three';

/**
 * Creates a WebGLRenderer configured for physically-based rendering
 */
function createRenderer() {
  const renderer = new WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.physicallyCorrectLights = true;

  return renderer;
}

export { createRenderer };