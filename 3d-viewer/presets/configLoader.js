import projectionConfig from './projectionConfig.json';

/**
 * Loads and manages the projection configuration
 */
//Loads and manages the projection configuration
let configCache = null;

/**
 * Loads the projection configuration from JSON (cached after first load)
 */
async function loadProjectionConfig() {
    if (configCache) return configCache;

    try {
        // Vite will bundle this json directly, no network request needed!
        configCache = projectionConfig;
        return configCache;
    } catch (error) {
        console.error('Failed to load projection config:', error);
        throw error;
    }
}

/**
 * Generates the HTML options for the model selector dropdown
 */
/* generateModelOptions removed — use `getModels()` and build DOM options in the caller */

/**
 * Returns the models array from the loaded projection config
 */
async function getModels() {
    const cfg = await loadProjectionConfig();
    return (cfg && cfg.models) ? cfg.models : [];
}

/**
 * Returns the configuration object for a single model by id
 */
function getModelConfig(modelId) {
    if (!modelId) return null;
    // If configCache hasn't been populated yet, fall back to the bundled JSON
    if (!configCache) configCache = projectionConfig;
    if (!configCache.models) return null;
    return configCache.models.find(m => m.id === modelId) || null;
}

export { loadProjectionConfig, getModels, getModelConfig };