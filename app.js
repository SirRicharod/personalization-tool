import { Canvas, IText } from 'fabric';
import { initInspector } from './tabs/inspector.js';
import { initText } from './tabs/text.js';
import { initImage } from './tabs/image.js';
import { initDrawing } from './tabs/drawing.js';
import { initLayers } from './tabs/layers.js';
import { initExport } from './tabs/export.js';
import { initIcons } from './tabs/icons.js';

// INITIALIZE CANVAS
const canvas = new Canvas('main-canvas', {
    backgroundColor: '#ffffff',
    width: 500,
    height: 500,
});

const testText = new IText("Be Creative!",{
    color: '#000000',
    left: canvas.width / 2,
    top: canvas.height/2,
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