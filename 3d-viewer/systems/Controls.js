import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

function createControls(camera, canvas) {
  const controls = new OrbitControls(camera, canvas);

  // Configure orbit controls
  controls.autoRotate = false;
  controls.autoRotateSpeed = 2;
  controls.enableZoom = true;
  controls.enablePan = true;
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  return controls;
}

export { createControls };