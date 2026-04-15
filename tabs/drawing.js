import { drawingInputs } from '../ui.js';
import { PencilBrush, SprayBrush, PatternBrush, Shadow } from 'fabric';
import { EraserBrush } from '@erase2d/fabric';
import brushes from '../json-config/brushes.json' assert { type: 'json' };
import { fileToDataUrl } from '../functions/fileReaderUtil.js';

// Helper function to get the Fabric.js brush class from the brush config
function getBrushClass(fabricType) {
  const classMap = {
    'PencilBrush': PencilBrush,
    'SprayBrush': SprayBrush,
    'PatternBrush': PatternBrush,
    'EraserBrush': EraserBrush
  };
  return classMap[fabricType];
}

// Helper function to convert kebab-case to camelCase
function toCamelCase(str) {
  return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
}

// ! === DRAWING TAB ===
export function initDrawing(canvas) {
    // Basic drawing state
    let isDrawing = false;
    let currentPatternType = null;
    let currentTexture = null;

    // Canvas Toggle
    drawingInputs.drawToggle.addEventListener('click', () => {
        isDrawing = !isDrawing;
        canvas.isDrawingMode = isDrawing;
        drawingInputs.drawToggle.classList.toggle('active', isDrawing);
        drawingInputs.drawToggle.innerText = isDrawing ? 'Stop Drawing' : 'Start Drawing';

        if (isDrawing) {
            canvas.discardActiveObject();
            canvas.requestRenderAll();
        }
    });

    // Custom Pattern Generator
    function createPatternSource(type, color, size = 20) {
        // Create invisible canvas
        const patternCanvas = document.createElement('canvas');
        const ctx = patternCanvas.getContext('2d');
        patternCanvas.width = size;
        patternCanvas.height = size;

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        // Create a pattern on that canvas that we can use as a brush
        if (type === 'grid') {
            ctx.moveTo(0, size / 2); ctx.lineTo(size, size / 2);
            ctx.moveTo(size / 2, 0); ctx.lineTo(size / 2, size);
        } else if (type === 'hline') {
            ctx.moveTo(0, size / 2); ctx.lineTo(size, size / 2);
        } else if (type === 'vline') {
            ctx.moveTo(size / 2, 0); ctx.lineTo(size / 2, size);
        } else if (type === 'circle') {
            ctx.arc(size / 2, size / 2, size / 4, 0, 2 * Math.PI);
        } else if (type === 'circle-fill') {
            ctx.fillStyle = color;
            ctx.arc(size / 2, size / 2, size / 4, 0, 2 * Math.PI);
            ctx.fill(); // Fill instead of stroke
            ctx.beginPath();
        } else if (type === 'crosshatch') {
            for (let i = -size; i < size; i += 5) {
                ctx.moveTo(i, 0); ctx.lineTo(i + size, size);
                ctx.moveTo(i + size, 0); ctx.lineTo(i, size);
            }
        }
        ctx.stroke();
        return patternCanvas;
    }

    // Brush Settings
    function updateBrushSettings() {
        if (!canvas.freeDrawingBrush) return;

        const brush = canvas.freeDrawingBrush;
        const color = drawingInputs.brushColor.value || '#000000';
        const width = parseInt(drawingInputs.brushSize.value, 10) || 10;

        // Setup shadow
        const blurSize = parseInt(drawingInputs.shadowSize.value, 10) || 0;
        const offsetXSize = parseInt(drawingInputs.shadowOffsetX.value, 10) || 0;
        const offsetYSize = parseInt(drawingInputs.shadowOffsetY.value, 10) || 0;

        brush.color = color;
        brush.width = width;

        // If it's a pattern brush, generate the custom mini-canvas for it
        if (brush instanceof PatternBrush && currentPatternType) {
            if (currentPatternType === 'texture' && currentTexture) {
                // Use the uploaded image, but draw it on a mini-canvas first
                const textureCanvas = document.createElement('canvas');
                textureCanvas.width = width;
                textureCanvas.height = width;
                const ctx = textureCanvas.getContext('2d');
                ctx.drawImage(currentTexture, 0, 0, width, width);
                brush.source = textureCanvas;
            } else {
                // Use the geometric shapes
                brush.source = createPatternSource(currentPatternType, color);
            }
        }

        // The eraser plugin crashes if it attempts to render a drop shadow
        if (brush instanceof EraserBrush) {
            brush.shadow = null;
        }
        // brush shadow logic
        else if (blurSize === 0) {
            brush.shadow = null;
        } else {
            brush.shadow = new Shadow({
                color: drawingInputs.shadowColor.value || '#000000',
                blur: blurSize,
                offsetX: offsetXSize,
                offsetY: offsetYSize,
                affectStroke: true
            });
        }

        // Text updates for sliders
        if (drawingInputs.brushSizeVal) drawingInputs.brushSizeVal.innerText = width;
        if (drawingInputs.shadowSizeVal) drawingInputs.shadowSizeVal.innerText = blurSize;
        if (drawingInputs.shadowOffsetXVal) drawingInputs.shadowOffsetXVal.innerText = offsetXSize;
        if (drawingInputs.shadowOffsetYVal) drawingInputs.shadowOffsetYVal.innerText = offsetYSize;
    }

    // Sliders & Color Listeners
    ['brushSize', 'shadowSize', 'shadowOffsetX', 'shadowOffsetY'].forEach(id => {
        if (drawingInputs[id]) {
            drawingInputs[id].addEventListener('input', (e) => {
                const value = parseInt(e.target.value, 10);
                
                // Offset sliders (shadowOffsetX, shadowOffsetY) can be -50 to 50
                const isOffsetSlider = id.includes('Offset');
                const isInvalid = isOffsetSlider ? false : (value < 0);
                
                if (isInvalid) {
                    drawingInputs[id].classList.add('is-invalid');
                    return;
                }
                drawingInputs[id].classList.remove('is-invalid');
                updateBrushSettings();
            });
        }
    });

    ['brushColor', 'shadowColor'].forEach(id => {
        if (drawingInputs[id]) {
            drawingInputs[id].addEventListener('input', updateBrushSettings);
            drawingInputs[id].addEventListener('change', updateBrushSettings);
        }
    });

    // Brush Switcher Helper
    function setActiveBrush(btnElement, BrushClass, patternType = null) {
        currentPatternType = patternType;

        // Remove active class from all brush buttons (dynamic from brushes config)
        brushes.forEach(brush => {
            const camelCaseId = toCamelCase(brush.id);
            const buttonId = 'brush' + camelCaseId.charAt(0).toUpperCase() + camelCaseId.slice(1);
            if (drawingInputs[buttonId]) drawingInputs[buttonId].classList.remove('active');
        });

        // Set new active brush button
        if (btnElement) btnElement.classList.add('active');

        // Instantiate and apply the new brush
        if (BrushClass) {
            canvas.freeDrawingBrush = new BrushClass(canvas);
            
            // Apply Eraser-specific safety overrides
            if (BrushClass === EraserBrush) {
                // The EraserBrush uses isTargetErasable internally, we can override it:
                canvas.freeDrawingBrush.isTargetErasable = (target) => {
                    return target.erasable === true;
                };
            }

            updateBrushSettings();
        }
    }

    brushes.forEach(brush => {
      const camelCaseId = toCamelCase(brush.id);
      const buttonId = 'brush' + camelCaseId.charAt(0).toUpperCase() + camelCaseId.slice(1);
      const brushBtn = drawingInputs[buttonId];
      if (brushBtn) {
        brushBtn.addEventListener('click', () => {
          const brushClass = getBrushClass(brush.fabricType);
          setActiveBrush(brushBtn, brushClass, brush.patternType);
        });
      }
    });

    // Texture Upload Listener
    if (drawingInputs.textureUpload) {
        drawingInputs.textureUpload.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const dataUrl = await fileToDataUrl(file);
                const img = new Image();
                img.onload = () => {
                    currentTexture = img;
                    setActiveBrush(drawingInputs.brushTexture, PatternBrush, 'texture');
                };
                img.src = dataUrl;
            } catch (error) {
                console.error('Failed to load texture:', error);
            }
        });
    }

    // Every time a new brush stroke is finished, make sure it can be erased later!
    canvas.on('path:created', (opt) => {
        opt.path.set({ erasable: true });
    });

    // Initialize with pencil
    setActiveBrush(drawingInputs.brushPencil, PencilBrush);

    // Stop Drawing when leaving the Drawing tab
    const drawingTabLink = document.getElementById('nav-drawing-tab');
    if (drawingTabLink) {
        drawingTabLink.addEventListener('hidden.bs.tab', () => {
            if (isDrawing) {
                isDrawing = false;
                canvas.isDrawingMode = false;
                drawingInputs.drawToggle.classList.remove('active');
                drawingInputs.drawToggle.innerText = 'Start Drawing';
            }
        });
    }
}