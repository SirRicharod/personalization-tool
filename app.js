import { Canvas, IText, classRegistry, FabricObject } from 'fabric';
import { ClippingGroup } from '@erase2d/fabric';
import { initInspector } from './tabs/inspector.js';
import { initText } from './tabs/text.js';
import { initImage } from './tabs/image.js';
import { initDrawing } from './tabs/drawing.js';
import { initLayers } from './tabs/layers.js';
import { initExport } from './tabs/export.js';
import { initIcons } from './tabs/icons.js';
import { initQuickActions } from './quick-actions.js';
import { initShortcuts } from './shortcuts.js';
import { initAutoSave } from './auto-save.js';
import { initHistory } from './history.js';

// Register the custom ClippingGroup so erased objects serialize/deserialize perfectly into JSON!
classRegistry.setClass(ClippingGroup);

// Tell Fabric's builder that 'erasable' is a valid, permanent core property when importing JSON
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

canvas.add(testText);
canvas.setActiveObject(testText);

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
