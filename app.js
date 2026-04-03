import { Canvas, Rect, Circle } from 'fabric';
import { initInspector } from './tabs/inspector.js';
import { initText } from './tabs/text.js';
import { initImage } from './tabs/image.js';
import { initDrawing } from './tabs/drawing.js';
import { initLayers } from './tabs/layers.js';

// INITIALIZE CANVAS
const canvas = new Canvas('main-canvas', {
    backgroundColor: '#ffffff',
    width: 500,
    height: 500,
});

// Test shape
const testRect = new Rect({
    left: 250,
    top: 250,
    width: 200,
    height: 200,
});

canvas.add(testRect);
canvas.setActiveObject(testRect);

const { updateActiveObject } = initInspector(canvas);
initText(canvas, updateActiveObject);
initImage(canvas, updateActiveObject);
initDrawing(canvas);
initLayers(canvas);