import { Scene, Color } from 'three';

function createScene() {
  const scene = new Scene();
  scene.background = new Color(0xffffff);
  return scene;
}

export { createScene };