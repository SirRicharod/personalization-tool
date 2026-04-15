import { inspectorInputs, textInputs, imageInputs } from '../ui.js';
import { Color, filters } from 'fabric';

// ! === INSPECTOR WINDOW ===
export function initInspector(canvas) {

    // Sync inspector fields with currently selected canvas object
    function updateInspectorUI() {
        const activeObj = canvas.getActiveObject();
        if (!activeObj) return;

        // Update Position & Angle
        inspectorInputs.top.value = Math.round(activeObj.top);
        inspectorInputs.left.value = Math.round(activeObj.left);
        inspectorInputs.angle.value = Math.round(activeObj.angle);

        // Update Size
        // Fabric doesn't actually use width/height when dragging to resize but 'scale'
        // visual width/height => width/height * scaleX/scaleY
        inspectorInputs.width.value = Math.round(activeObj.width * activeObj.scaleX);
        inspectorInputs.height.value = Math.round(activeObj.height * activeObj.scaleY);

        // Update Color
        // toHex() returns the hex without the '#', so we manually add it.
        inspectorInputs.fill.value = activeObj.fill ? '#' + new Color(activeObj.fill).toHex() : '#000000';
        inspectorInputs.stroke.value = activeObj.stroke ? '#' + new Color(activeObj.stroke).toHex() : '#000000';
        inspectorInputs.strokeWidth.value = activeObj.strokeWidth || 1;

        //* Update Text Properties if a text object is selected
        if (activeObj.type === 'i-text') {
            textInputs.family.value = activeObj.fontFamily || 'Arial';
            textInputs.size.value = Math.round(activeObj.fontSize) || 40;

            // Reverse math from event listeners
            textInputs.lineHeight.value = Math.round(activeObj.lineHeight * 10) || 12;
            textInputs.spacing.value = Math.round((activeObj.charSpacing || 0) / 10);

            // Visual feedback for toggles
            textInputs.bold.classList.toggle('active', activeObj.fontWeight === 'bold');
            textInputs.italic.classList.toggle('active', activeObj.fontStyle === 'italic');
            textInputs.underline.classList.toggle('active', activeObj.underline === true);
            textInputs.linethrough.classList.toggle('active', activeObj.linethrough === true);

            // Visual feedback for alignments
            textInputs.alignLeft.classList.toggle('active', activeObj.textAlign === 'left');
            textInputs.alignCenter.classList.toggle('active', activeObj.textAlign === 'center');
            textInputs.alignRight.classList.toggle('active', activeObj.textAlign === 'right');
            textInputs.alignJustify.classList.toggle('active', activeObj.textAlign === 'justify');
        }

        //* Update Image Properties if an image is selected
        if (activeObj.type === 'image') {

            // Determine which filters are active on image
            const hasFilter = (FilterClass) => activeObj.filters.some(f => f instanceof FilterClass);

            // Highlight enabled preset filters
            imageInputs.filterSepia.classList.toggle('active', hasFilter(filters.Sepia));
            imageInputs.filterBW.classList.toggle('active', hasFilter(filters.Grayscale));
            imageInputs.filterVintage.classList.toggle('active', hasFilter(filters.Vintage));
            imageInputs.filterTechnicolor.classList.toggle('active', hasFilter(filters.Technicolor));
            imageInputs.filterPolaroid.classList.toggle('active', hasFilter(filters.Polaroid));
            imageInputs.filterInvert.classList.toggle('active', hasFilter(filters.Invert));
            imageInputs.filterWarm.classList.toggle('active', hasFilter(filters.Brownie));
            imageInputs.filterCool.classList.toggle('active', hasFilter(filters.Kodachrome));

            // Extract filter property or use default if not applied
            const getSliderVal = (FilterClass, prop, defaultVal) => {
                const f = activeObj.filters.find(f => f instanceof FilterClass);
                return f ? f[prop] : defaultVal;
            };

            // Map filter values to slider ranges for UI display
            // Different filters use different value ranges, normalized to 0-100
            const bright = Math.round((getSliderVal(filters.Brightness, 'brightness', 0) * 50) + 50);
            imageInputs.brightVal.value = bright;
            imageInputs.brightSlider.value = bright;

            const sat = Math.round((getSliderVal(filters.Saturation, 'saturation', 0) * 50) + 50);
            imageInputs.satVal.value = sat;
            imageInputs.satSlider.value = sat;

            const contrast = Math.round((getSliderVal(filters.Contrast, 'contrast', 0) * 50) + 50);
            imageInputs.contrastVal.value = contrast;
            imageInputs.contrastSlider.value = contrast;

            // value * 100
            const blur = Math.round(getSliderVal(filters.Blur, 'blur', 0) * 100);
            imageInputs.blurVal.value = blur;
            imageInputs.blurSlider.value = blur;

            // value / 5
            const noise = Math.round(getSliderVal(filters.Noise, 'noise', 0) / 5);
            imageInputs.noiseVal.value = noise;
            imageInputs.noiseSlider.value = noise;

            // blocksize
            const pixel = Math.round(getSliderVal(filters.Pixelate, 'blocksize', 1));
            imageInputs.pixelVal.value = pixel;
            imageInputs.pixelSlider.value = pixel;

            // Blend Color
            const blendFilter = activeObj.filters.find(f => f instanceof filters.BlendColor);
            if (blendFilter) {
                // normal = multiply with white value
                if (blendFilter.mode === 'multiply' && blendFilter.color === '#ffffff') {
                    imageInputs.blendMode.value = 'normal';
                } else {
                    imageInputs.blendMode.value = blendFilter.mode;
                }
                imageInputs.blendColor.value = blendFilter.color;
            } else {
                imageInputs.blendMode.value = 'normal';
                imageInputs.blendColor.value = '#ffffff';
            }

            // Remove Color
            const removeFilter = activeObj.filters.find(f => f instanceof filters.RemoveColor);
            imageInputs.removeColor.value = removeFilter ? removeFilter.color : '#00ff00';
            const removeDist = Math.round((removeFilter ? removeFilter.distance : 0) * 100);
            imageInputs.removeVal.value = removeDist;
            imageInputs.removeSlider.value = removeDist;

            // Gamma
            const gammaFilter = activeObj.filters.find(f => f instanceof filters.Gamma);
            const gammaArr = gammaFilter ? gammaFilter.gamma : [1, 1, 1];

            // Reverse math function
            const getSliderFromGamma = (gamma) => {
                return Math.round(((gamma - 0.01) / (2.2 - 0.01)) * 100);
            };

            const rSliderVal = getSliderFromGamma(gammaArr[0]);
            const gSliderVal = getSliderFromGamma(gammaArr[1]);
            const bSliderVal = getSliderFromGamma(gammaArr[2]);

            imageInputs.gammaRVal.value = imageInputs.gammaRSlider.value = rSliderVal;
            imageInputs.gammaGVal.value = imageInputs.gammaGSlider.value = gSliderVal;
            imageInputs.gammaBVal.value = imageInputs.gammaBSlider.value = bSliderVal;
        }
    }

    // Refresh inspector when object selection or properties change
    canvas.on('selection:created', updateInspectorUI);
    canvas.on('selection:updated', updateInspectorUI);
    canvas.on('object:modified', updateInspectorUI);
    canvas.on('object:moving', updateInspectorUI);
    canvas.on('object:scaling', updateInspectorUI);
    canvas.on('object:rotating', updateInspectorUI);

    updateInspectorUI();

    // Apply inspector field changes back to canvas object
    function updateActiveObject(property, value, isNumeric = false) {
        const activeObj = canvas.getActiveObject();
        if (!activeObj) return;

        // Type convert input values if needed
        const finalValue = isNumeric ? parseFloat(value) : value;

        // Width and height require scale adjustment instead of direct size change
        if (property === 'width') {
            // Dynamically scale
            activeObj.set({ scaleX: finalValue / activeObj.width });
        } else if (property === 'height') {
            // Dynamically scale
            activeObj.set({ scaleY: finalValue / activeObj.height });
        } else {
            // Set property directly
            activeObj.set(property, finalValue);
        }

        canvas.requestRenderAll();
        updateInspectorUI();
    }

    // Create eventListeners for Inspector elements with corresponding functions
    // Position & Rotation
    inspectorInputs.top.addEventListener('input', (e) => updateActiveObject('top', e.target.value, true));
    inspectorInputs.left.addEventListener('input', (e) => updateActiveObject('left', e.target.value, true));
    inspectorInputs.angle.addEventListener('input', (e) => {
        // Validate: angle must be 0-360
        const value = parseInt(e.target.value, 10) || 0;
        if (value < 0 || value > 360) {
            inspectorInputs.angle.classList.add('is-invalid');
            return;
        }
        inspectorInputs.angle.classList.remove('is-invalid');
        updateActiveObject('angle', value, true);
    });

    // Size
    inspectorInputs.width.addEventListener('input', (e) => {
        // Validate: width must be > 0
        const value = parseInt(e.target.value, 10);
        if (value <= 0) {
            inspectorInputs.width.classList.add('is-invalid');
            return;
        }
        inspectorInputs.width.classList.remove('is-invalid');
        updateActiveObject('width', value, true);
    });
    
    inspectorInputs.height.addEventListener('input', (e) => {
        // Validate: height must be > 0
        const value = parseInt(e.target.value, 10);
        if (value <= 0) {
            inspectorInputs.height.classList.add('is-invalid');
            return;
        }
        inspectorInputs.height.classList.remove('is-invalid');
        updateActiveObject('height', value, true);
    });

    // Color
    inspectorInputs.fill.addEventListener('input', (e) => updateActiveObject('fill', e.target.value));
    inspectorInputs.stroke.addEventListener('input', (e) => updateActiveObject('stroke', e.target.value));
    inspectorInputs.strokeWidth.addEventListener('input', (e) => updateActiveObject('strokeWidth', e.target.value, true));

    return { updateActiveObject };
}