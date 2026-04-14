/**
 * UI Bindings Utility - Sync slider and number inputs
 */

/**
 * Sync a range input (slider) and number input together
 * When either changes, both update and callback fires with the new value
 * @param {HTMLElement} sliderEl - The range input element (0-100 typically)
 * @param {HTMLElement} inputEl - The number input element (syncs with slider)
 * @param {Function} callback - Function called with value when either input changes: callback(value)
 * @returns {void}
 * @example
 * syncSliderInput(
 *   document.getElementById('brightness-slider'),
 *   document.getElementById('brightness-input'),
 *   (value) => applyBrightness(value)
 * );
 */

export function syncSliderInput(sliderEl, inputEl, callback) {
  const handler = (e) => {
    const val = e.target.value;
    
    // Sync both elements to the same value
    sliderEl.value = val;
    inputEl.value = val;
    
    // Fire callback with new value
    callback(val);
  };
  
  // Listen to both for changes
  sliderEl.addEventListener('input', handler);
  inputEl.addEventListener('input', handler);
}
