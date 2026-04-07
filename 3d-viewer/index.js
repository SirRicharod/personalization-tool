import { Model } from './3DModel.js';
import { loadProjectionConfig } from './presets/configLoader.js';
import { loadLightingPresets } from './presets/lightingPresetsLoader.js';

let viewerInstance = null;

async function initiate3DViewer(containerElement) {
  // Load all configs upfront
  await loadProjectionConfig();
  await loadLightingPresets();
  
  // Initialize the 3D viewer
  viewerInstance = new Model(containerElement);
  await viewerInstance.init();
  
  return viewerInstance;
}

export { initiate3DViewer };