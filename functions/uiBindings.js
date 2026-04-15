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

/**
 * Create a callback handler for Fabric.js filter sliders
 * Reduces boilerplate for slider-to-filter value conversions
 * @param {Function} applySliderFilter - Function to apply filter: applySliderFilter(FilterClass, propName, value)
 * @param {Class} FilterClass - Fabric.js filter class (e.g., filters.Brightness)
 * @param {string} propName - Filter property name (e.g., 'brightness')
 * @param {Function} converterFn - Value converter: (sliderValue) => fabricValue
 * @returns {Function} Callback ready for syncSliderInput
 * @example
 * const handler = createSliderFilterHandler(
 *   applySliderFilter,
 *   filters.Brightness,
 *   'brightness',
 *   (val) => (val - 50) / 50  // Convert 0-100 to -1.0 to 1.0
 * );
 * syncSliderInput(brightnessSlider, brightnessInput, handler);
 */

export function createSliderFilterHandler(applySliderFilter, FilterClass, propName, converterFn) {
  return (val) => {
    const fabricVal = converterFn(val);
    applySliderFilter(FilterClass, propName, fabricVal);
  };
}
