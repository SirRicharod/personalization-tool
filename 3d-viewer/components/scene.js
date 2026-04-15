import { Scene, Color } from 'three';

/**
 * Creates a Three.js Scene with white background
 */
function createScene() {
  const scene = new Scene();
  scene.background = new Color(0xffffff);
  return scene;
}

export { createScene };