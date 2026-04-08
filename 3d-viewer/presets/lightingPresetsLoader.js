import lightingPresetsData from './lightingPresets.json';

// Loads and manages lighting preset configurations
let presetsCache = null;

async function loadLightingPresets() {
  if (presetsCache) return presetsCache;

  try {
    presetsCache = lightingPresetsData.presets;
    return presetsCache;
  } catch (error) {
    console.error('Failed to load lighting presets:', error);
    throw error;
  }
}

function getPreset(presetId) {
  if (!presetsCache) {
    console.error('Presets not loaded yet. Call loadLightingPresets() first.');
    return null;
  }
  
  return presetsCache.find(p => p.id === presetId) || presetsCache[0];
}

function getAllPresetIds() {
  if (!presetsCache) return [];
  return presetsCache.map(p => p.id);
}

export { loadLightingPresets, getPreset, getAllPresetIds };