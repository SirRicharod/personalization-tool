import { Canvas, Rect, Circle, Color, IText } from 'fabric';

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