import { DirectionalLight, AmbientLight } from 'three';

/**
 * Creates a three-light setup for the 3D scene
 */
function createLights() {
  // Main directional light
  const mainLight = new DirectionalLight(0xffffff, 1.5);
  mainLight.position.set(5, 5, 5);

  // Softer secondary light
  const fillLight = new DirectionalLight(0xffffff, 0.8);
  fillLight.position.set(-5, 3, 5);

  // Overall scene illumination
  const ambientLight = new AmbientLight(0xffffff, 0.6);

  return { mainLight, fillLight, ambientLight };
}

export { createLights };