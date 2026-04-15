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
 * Retrieves the configuration for a specific model by ID
 */
function getModelConfig(modelId) {
    if (!configCache) {
        console.error('Config not loaded yet. Call loadProjectionConfig() first.');
        return null;
    }

    return configCache.models.find(m => m.id === modelId);
}

export { loadProjectionConfig, getModelConfig };