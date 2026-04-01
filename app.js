import { Canvas, Rect, Circle, Color, IText, FabricImage, filters } from 'fabric';

// INITIALIZE CANVAS
const canvas = new Canvas('main-canvas', {
    width: 500,
    height: 500,
});

// Test shape for interacting
const testRect = new Rect({
    left: 200,
    top: 200,
    width: 200,
    height: 150,
    fill: '#eef0b0',
    stroke: '#f0a0c0',
    strokeWidth: 2,
    angle: 0,
});

const circle = new Circle({
    left: 100,
    top: 100,
    radius: 50,
    strokeWidth: -5,
});

canvas.add(circle);
canvas.add(testRect);
canvas.setActiveObject(circle);

// ! === INSPECTOR WINDOW ===
// Grab HTML inputs from Inspector tab
const inspectorInputs = {
    top: document.getElementById('pos-rot-top'),
    left: document.getElementById('pos-rot-left'),
    angle: document.getElementById('pos-rot-angle'),
    width: document.getElementById('size-width'),
    height: document.getElementById('size-height'),
    fill: document.getElementById('color-fill'),
    stroke: document.getElementById('color-stroke'),
    strokeWidth: document.getElementById('stroke-width'),
};

// Update Inspector when interacting with object (Canvas --> Inspector)
function updateInspectorUI() {
    const activeObj = canvas.getActiveObject();
    if (!activeObj) return; // no object, do nothing

    //* Update Inspector Fields
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
}

// Run updateInspectorUI when these events trigger
canvas.on('selection:created', updateInspectorUI);
canvas.on('selection:updated', updateInspectorUI);
canvas.on('object:modified', updateInspectorUI);
canvas.on('object:moving', updateInspectorUI);
canvas.on('object:scaling', updateInspectorUI);
canvas.on('object:rotating', updateInspectorUI);

// Run once on startup
updateInspectorUI();

// Update active object when changing values in Inspector (Inspector --> Canvas)
function updateActiveObject(property, value, isNumeric = false) {
    const activeObj = canvas.getActiveObject();
    if (!activeObj) return;

    // convert string inputs to numbers if necessary
    const finalValue = isNumeric ? parseFloat(value) : value;

    // Handle width and height edge cases => reset scale to 1 to avoid miscalculations
    if (property === 'width') {
        // Dynamically scale
        activeObj.set({ scaleX: finalValue / activeObj.width });
    } else if (property === 'height') {
        // Dynamically scale
        activeObj.set({ scaleY: finalValue / activeObj.height });
    } else {
        // Default set property to value
        activeObj.set(property, finalValue);
    }

    // Redraw canvas to reflect changes
    canvas.requestRenderAll();
    // Keep UI in sync
    updateInspectorUI();
}

// Create eventListeners for Inspector elements with corresponding functions
// Position & Rotation
inspectorInputs.top.addEventListener('input', (e) => updateActiveObject('top', e.target.value, true));
inspectorInputs.left.addEventListener('input', (e) => updateActiveObject('left', e.target.value, true));
inspectorInputs.angle.addEventListener('input', (e) => updateActiveObject('angle', e.target.value, true));

// Size
inspectorInputs.width.addEventListener('input', (e) => updateActiveObject('width', e.target.value, true));
inspectorInputs.height.addEventListener('input', (e) => updateActiveObject('height', e.target.value, true));

// Color
inspectorInputs.fill.addEventListener('input', (e) => updateActiveObject('fill', e.target.value));
inspectorInputs.stroke.addEventListener('input', (e) => updateActiveObject('stroke', e.target.value));
inspectorInputs.strokeWidth.addEventListener('input', (e) => updateActiveObject('strokeWidth', e.target.value, true));

// ! === TEXT WINDOW ===
// Grab HTML inputs from Text tab
const textInputs = {
    addBtn: document.getElementById('add-text-btn'),
    content: document.getElementById('text-content-input'),

    family: document.getElementById('font-family'),
    size: document.getElementById('font-size'),

    bold: document.getElementById('text-bold-btn'),
    italic: document.getElementById('text-italic-btn'),
    underline: document.getElementById('text-underline-btn'),
    linethrough: document.getElementById('text-linethrough-btn'),

    alignLeft: document.getElementById('text-left-btn'),
    alignCenter: document.getElementById('text-center-btn'),
    alignRight: document.getElementById('text-right-btn'),
    alignJustify: document.getElementById('text-justify-btn'),

    lineHeight: document.getElementById('font-line-height'),
    spacing: document.getElementById('font-spacing')
};

// Add new text to canvas
textInputs.addBtn.addEventListener('click', () => {
    // Grab text content or use placeholder text
    const textContent = textInputs.content.value || 'Double click to edit';

    // Create IText element 
    const newText = new IText(textContent, {
        left: 100,
        top: 100,
        fontFamily: textInputs.family.value || 'Arial',
        fontSize: parseFloat(textInputs.size.value) || 40,
    });

    // Add to canvas and select text element 
    canvas.add(newText);
    canvas.setActiveObject(newText);

    // Clear input field
    textInputs.content.value = '';
})

// Text Properties
textInputs.family.addEventListener('change', (e) => updateActiveObject('fontFamily', e.target.value));
textInputs.size.addEventListener('input', (e) => updateActiveObject('fontSize', e.target.value, true));
// Divide by 10 for precise spacing
textInputs.lineHeight.addEventListener('input', (e) => updateActiveObject('lineHeight', e.target.value / 10, true));
// Multiplying by 10 for ease of use
textInputs.spacing.addEventListener('input', (e) => updateActiveObject('charSpacing', e.target.value * 10, true));

//* Styling Toggles
// Add event listener
textInputs.bold.addEventListener('click', () => {
    // Get the active object
    const obj = canvas.getActiveObject();
    // Check if object is not null and if it is a i-text field
    if (obj && obj.type === 'i-text') {
        // Check if the text is already bolded
        const isBold = obj.fontWeight === 'bold';
        // Set text to bold if normal and vice versa
        updateActiveObject('fontWeight', isBold ? 'normal' : 'bold');
    }
});

textInputs.italic.addEventListener('click', () => {
    const obj = canvas.getActiveObject();
    if (obj && obj.type === 'i-text') {
        const isItalic = obj.fontStyle === 'italic';
        updateActiveObject('fontStyle', isItalic ? 'normal' : 'italic');
    }
});

textInputs.underline.addEventListener('click', () => {
    const obj = canvas.getActiveObject();
    if (obj && obj.type === 'i-text') {
        // Underline uses a boolean
        updateActiveObject('underline', !obj.underline);
    }
});

textInputs.linethrough.addEventListener('click', () => {
    const obj = canvas.getActiveObject();
    if (obj && obj.type === 'i-text') {
        // Strikethrough also uses a boolean
        updateActiveObject('linethrough', !obj.linethrough);
    }
});

// Alignment
textInputs.alignLeft.addEventListener('click', () => updateActiveObject('textAlign', 'left'));
textInputs.alignCenter.addEventListener('click', () => updateActiveObject('textAlign', 'center'));
textInputs.alignRight.addEventListener('click', () => updateActiveObject('textAlign', 'right'));
textInputs.alignJustify.addEventListener('click', () => updateActiveObject('textAlign', 'justify'));

// ! === IMAGE WINDOW ===
// Grab HTML inputs from Images tab
const imageInputs = {
    upload: document.getElementById('image-upload'),
    addBtn: document.getElementById('add-image-btn'),

    // Quick Actions
    cropBtn: document.getElementById('img-crop-btn'),
    flipHBtn: document.getElementById('img-flip-h-btn'),
    flipVBtn: document.getElementById('img-flip-v-btn'),
    cloneBtn: document.getElementById('img-clone-btn'),

    // Adjustments (Sliders & Inputs)
    brightVal: document.getElementById('img-bright-val'),
    brightSlider: document.getElementById('img-bright-slider'),
    satVal: document.getElementById('img-sat-val'),
    satSlider: document.getElementById('img-sat-slider'),
    contrastVal: document.getElementById('img-contrast-val'),
    contrastSlider: document.getElementById('img-contrast-slider'),
    blurVal: document.getElementById('img-blur-val'),
    blurSlider: document.getElementById('img-blur-slider'),

    // Preset Filters
    filterNormal: document.getElementById('img-filter-normal'),
    filterSepia: document.getElementById('img-filter-sepia'),
    filterBW: document.getElementById('img-filter-bw'),
    filterVintage: document.getElementById('img-filter-vintage'),
    filterWarm: document.getElementById('img-filter-warm'),
    filterCool: document.getElementById('img-filter-cool'),
    filterPolaroid: document.getElementById('img-filter-polaroid'),
    filterInvert: document.getElementById('img-filter-invert'),
    filterTechnicolor: document.getElementById('img-filter-technicolor'),
    filterSharpen: document.getElementById('img-filter-sharpen'),

    // Advanced Tools
    noiseVal: document.getElementById('img-noise-val'),
    noiseSlider: document.getElementById('img-noise-slider'),
    pixelVal: document.getElementById('img-pixel-val'),
    pixelSlider: document.getElementById('img-pixel-slider'),
    blendMode: document.getElementById('img-blend-mode'),
    blendColor: document.getElementById('img-blend-color'),
    gammaGVal: document.getElementById('img-gamma-green-val'),
    gammaGSlider: document.getElementById('img-gamma-green-slider'),
    gammaRVal: document.getElementById('img-gamma-red-val'),
    gammaRSlider: document.getElementById('img-gamma-red-slider'),
    gammaBVal: document.getElementById('img-gamma-blue-val'),
    gammaBSlider: document.getElementById('img-gamma-blue-slider'),
    removeColor: document.getElementById('img-remove-color'),
    removeVal: document.getElementById('img-remove-val'),
    removeSlider: document.getElementById('img-remove-slider'),
};

// Add uploaded image to canvas
imageInputs.addBtn.addEventListener('click', () => {
    // Check if user actually uploaded a file
    const file = imageInputs.upload.files[0];
    if (!file) return;

    // FileReader to read the imagefile
    const reader = new FileReader();
    reader.onload = (e) => {
        const dataUrl = e.target.result;

        // Load image with a promise
        FabricImage.fromURL(dataUrl).then((img) => {
            // Scale image so it fits on canvas
            if (img.width > 400 || img.height > 400) {
                if (img.width >= img.height) {
                    img.scaleToWidth(400);
                } else {
                    img.scaleToHeight(400);
                }
            }

            img.set({
                left: 100,
                top: 100,
            });

            // Add image to canvas
            canvas.add(img);
            canvas.setActiveObject(img);

            // Clear input field
            imageInputs.upload.value = '';
        });
    };

    // Read file as Data URL (base64 string)
    reader.readAsDataURL(file);

});

//? Quick Actions
// Flip Horizontal
imageInputs.flipHBtn.addEventListener('click', () => {
    const obj = canvas.getActiveObject();
    if (obj) {
        // Toggle flipX
        obj.set('flipX', !obj.flipX);
        canvas.requestRenderAll();
    }
});

imageInputs.flipVBtn.addEventListener('click', () => {
    const obj = canvas.getActiveObject();
    if (obj) {
        obj.set('flipY', !obj.flipY);
        canvas.requestRenderAll();
    }
});

// Clone/Duplicate current object
imageInputs.cloneBtn.addEventListener('click', () => {
    const obj = canvas.getActiveObject();
    if (obj) {
        // Objects have a built-in clone function
        obj.clone().then((clonedObj) => {
            // Offset clone slightly
            clonedObj.set({
                left: clonedObj.left + 20,
                top: clonedObj.top + 20,
            });
            canvas.add(clonedObj);
            canvas.setActiveObject(clonedObj);
        });
    }
});

//? Filters
// Function to apply filters
function togglePresetFilter(btnElement, FilterClass) {
    const obj = canvas.getActiveObject();

    if (!obj || obj.type !== 'image') return;

    const filterIndex = obj.filters.findIndex(f => f instanceof FilterClass);

    if (obj && obj.type === 'image') {

        if (filterIndex > -1) {
            obj.filters.splice(filterIndex, 1);
            btnElement.classList.remove('active'); // remove active class from button
        } else {
            obj.filters.push(new FilterClass());
            btnElement.classList.add('active'); // add active class from button
        }

        // Bake the filters
        obj.applyFilters();
        canvas.requestRenderAll();
    }
}

// Preset Filter Event Listeners
// Clears all Preset Filters but LEAVE adjustments
imageInputs.filterNormal.addEventListener('click', () => {
    const obj = canvas.getActiveObject();
    if (!obj || obj.type !== 'image') return;

    // A list of the used classes
    const sliderFilters = [
        filters.Brightness, filters.Saturation, filters.Contrast,
        filters.Blur, filters.Noise, filters.Pixelate
    ];

    // Filter the array, keep sliders only
    obj.filters = obj.filters.filter(f => sliderFilters.some(SliderClass => f instanceof SliderClass));

    // Remove the 'active' class from every preset button
    const presetButtons = [
        imageInputs.filterSepia, imageInputs.filterBW, imageInputs.filterVintage,
        imageInputs.filterTechnicolor, imageInputs.filterPolaroid,
        imageInputs.filterInvert, imageInputs.filterWarm, imageInputs.filterCool
    ];
    presetButtons.forEach(btn => btn.classList.remove('active'));

    obj.applyFilters();
    canvas.requestRenderAll();
});

// Built-in vintage/color filters
imageInputs.filterSepia.addEventListener('click', (e) => togglePresetFilter(e.currentTarget, filters.Sepia));
imageInputs.filterBW.addEventListener('click', (e) => togglePresetFilter(e.currentTarget, filters.Grayscale));
imageInputs.filterVintage.addEventListener('click', (e) => togglePresetFilter(e.currentTarget, filters.Vintage));
imageInputs.filterPolaroid.addEventListener('click', (e) => togglePresetFilter(e.currentTarget, filters.Polaroid));
imageInputs.filterInvert.addEventListener('click', (e) => togglePresetFilter(e.currentTarget, filters.Invert));
imageInputs.filterWarm.addEventListener('click', (e) => togglePresetFilter(e.currentTarget, filters.Brownie));
imageInputs.filterCool.addEventListener('click', (e) => togglePresetFilter(e.currentTarget, filters.Kodachrome));
imageInputs.filterTechnicolor.addEventListener('click', (e) => togglePresetFilter(e.currentTarget, filters.Technicolor));

//? Image Adjustments
//helper function to keep adjustments made
function applySliderFilter(FilterClass, propName, value) {
    const obj = canvas.getActiveObject();
    if (!obj || obj.type !== 'image') return;

    // Check if we have already applied this filter
    let filter = obj.filters.find(f => f instanceof FilterClass);

    if (!filter) {
        // Create filter and add it to array
        filter = new FilterClass();
        obj.filters.push(filter);
    }

    // Apply value to property
    filter[propName] = value;

    obj.applyFilters();
    canvas.requestRenderAll();

}

//? Brightness
function handleBrightness(e) {
    const val = e.target.value;

    // sync slider and value
    imageInputs.brightSlider.value = imageInputs.brightVal.value = val;

    // Some math because HTML slider is 0-100 but brightness uses -1.0 - 1.0
    const fabricVal = (val - 50) / 50;

    applySliderFilter(filters.Brightness, 'brightness', fabricVal);
}

// Listen to slider and number
imageInputs.brightSlider.addEventListener('input', handleBrightness);
imageInputs.brightVal.addEventListener('input', handleBrightness);

//?  Saturation
function handleSaturation(e) {
    const val = e.target.value;

    imageInputs.satSlider.value = imageInputs.satVal.value = val;

    // Convert 0-100 to -1.0 to 1.0
    const fabricVal = (val - 50) / 50

    applySliderFilter(filters.Saturation, 'saturation', fabricVal);

}
imageInputs.satSlider.addEventListener('input', handleSaturation);
imageInputs.satVal.addEventListener('input', handleSaturation);

//? Contrast
function handleContrast(e) {
    const val = e.target.value;

    imageInputs.contrastVal.value = val;
    imageInputs.contrastSlider.value = val;

    // Convert 0-100 to -1.0 to 1.0
    const fabricVal = (val - 50) / 50;

    applySliderFilter(filters.Contrast, 'contrast', fabricVal);
}

imageInputs.contrastSlider.addEventListener('input', handleContrast);
imageInputs.contrastVal.addEventListener('input', handleContrast);

//? Blur
function handleBlur(e) {
    const val = e.target.value;

    imageInputs.blurVal.value = imageInputs.blurSlider.value = val;

    // blur needs value between 0 and 1 so divide by 100
    const fabricVal = val / 100;

    applySliderFilter(filters.Blur, 'blur', fabricVal);
}

imageInputs.blurSlider.addEventListener('input', handleBlur);
imageInputs.blurVal.addEventListener('input', handleBlur);

//? Advanced Tools
//? Pixelate
function handlePixelate(e) {
    const val = e.target.value;
    imageInputs.pixelSlider.value = imageInputs.pixelVal.value = val;

    // Pixelate goes from 1 (off) to 100 (huge pixels)
    const fabricVal = val < 2 ? 1 : Math.round(val);

    applySliderFilter(filters.Pixelate, 'blocksize', fabricVal);
}

imageInputs.pixelSlider.addEventListener('input', handlePixelate);
imageInputs.pixelVal.addEventListener('input', handlePixelate);