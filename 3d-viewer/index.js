import { Model } from './3DModel.js';
import { loadProjectionConfig } from './presets/configLoader.js';
import { loadLightingPresets } from './presets/lightingPresetsLoader.js';

let viewerInstance = null;

// Initialize 3D viewer with configs loaded
async function initiate3DViewer(containerElement) {
  // Load configuration data first
  await loadProjectionConfig();
  await loadLightingPresets();
  
  // Create and initialize 3D viewer instance
  viewerInstance = new Model(containerElement);
  await viewerInstance.init();
  
  return viewerInstance;
}

export { initiate3DViewer };