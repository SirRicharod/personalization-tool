import { Canvas, IText, classRegistry, FabricObject } from 'fabric';
import { ClippingGroup } from '@erase2d/fabric';
import { initInspector } from './tabs/inspector.js';
import { initText } from './tabs/text.js';
import { initImage } from './tabs/image.js';
import { initDrawing } from './tabs/drawing.js';
import { initLayers } from './tabs/layers.js';
import { initExport } from './tabs/export.js';
import { initIcons } from './tabs/icons.js';
import { initQuickActions } from './functions/quick-actions.js';
import { initShortcuts } from './functions/shortcuts.js';
import { initAutoSave } from './functions/auto-save.js';
import { initHistory } from './functions/history.js';
import { initializeBrushButtons } from './ui.js';

// Register eraser plugin for JSON serialization compatibility
classRegistry.setClass(ClippingGroup);

// Mark 'erasable' property as persistent during JSON round-trips
FabricObject.customProperties = ['erasable'];

const fabricCanvas = document.getElementById('main-canvas');

// INITIALIZE CANVAS
const canvas = new Canvas('main-canvas', {
    backgroundColor: '#ffffff',
    width: fabricCanvas.width,
    height: fabricCanvas.height,
    fireRightClick: true,
    stopContextMenu: true,
});

const testText = new IText("Be Creative!", {
    color: '#000000',
    left: canvas.width / 2,
    top: canvas.height / 2,
    fontFamily: 'Arial'
});

// Hide all scaling and stretching handles, leaving only the rotator
testText.setControlsVisibility({
    mt: false, mb: false, ml: false, mr: false, // middle handles
    tl: false, tr: false, bl: false, br: false  // corner handles
});

canvas.add(testText);
canvas.setActiveObject(testText);

// Initialize brush buttons from JSON before drawing tab
initializeBrushButtons();

const { updateActiveObject } = initInspector(canvas);
initText(canvas, updateActiveObject);
initImage(canvas, updateActiveObject);
initDrawing(canvas);
initLayers(canvas);
initExport(canvas);
initIcons(canvas);
initQuickActions(canvas);
initShortcuts(canvas, updateActiveObject);
initAutoSave(canvas);
initHistory(canvas, updateActiveObject);

export { canvas };
