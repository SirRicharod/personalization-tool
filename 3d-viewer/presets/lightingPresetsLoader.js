import lightingPresetsData from './lightingPresets.json';

/**
 * Loads and manages lighting preset configurations
 */
// Loads and manages lighting preset configurations
let presetsCache = null;

/**
 * Loads lighting presets from JSON (cached after first load)
 */
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

/**
 * Retrieves a preset by ID (defaults to first preset if ID not found)
 */
function getPreset(presetId) {
  if (!presetsCache) {
    console.error('Presets not loaded yet. Call loadLightingPresets() first.');
    return null;
  }
  
  return presetsCache.find(p => p.id === presetId) || presetsCache[0];
}

/**
 * Gets the IDs of all available lighting presets
 */
function getAllPresetIds() {
  if (!presetsCache) return [];
  return presetsCache.map(p => p.id);
}

export { loadLightingPresets, getPreset, getAllPresetIds };