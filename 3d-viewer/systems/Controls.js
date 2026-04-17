import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * Creates OrbitControls for mouse-based 3D camera manipulation
 */
function createControls(camera, canvas) {
  const controls = new OrbitControls(camera, canvas);

  // Configure orbit controls
  controls.autoRotate = false;
  controls.autoRotateSpeed = 2;
  controls.enableZoom = true;
  controls.enablePan = true;
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 0.5;
  controls.maxDistance = 5;

  return controls;
}

export { createControls };