import { initiate3DViewer } from './3d-viewer/index.js';
import { canvas } from './app.js';
import { loadLightingPresets } from './3d-viewer/presets/lightingPresetsLoader.js';
import clothingColors from './3d-viewer/presets/clothingColors.json';

const toggleButton = document.getElementById('toggle-3d');
const viewerContainer = document.getElementById('3d-viewer-container');

let is3DActive = false;
let viewerInstance = null;
let initPromise = null;

// Pre-load the 3D model in the background as soon as the page opens!
async function preLoad3D() {
  if (!viewerInstance) {
    // Keep it explicitly hidden while it initializes
    viewerContainer.style.display = 'none';

    const fabricContainer = document.querySelector('.canvas-container');
    if (fabricContainer) {
      viewerContainer.style.width = fabricContainer.clientWidth + 'px';
      viewerContainer.style.height = fabricContainer.clientHeight + 'px';
    }

    viewerInstance = await initiate3DViewer(viewerContainer);
  }
}

// Start background loading immediately!
initPromise = preLoad3D();

toggleButton.addEventListener('click', async () => {
  // Get Fabric's actual wrapper
  const fabricContainer = document.querySelector('.canvas-container');

  if (!viewerInstance) {
    const spinner = document.getElementById('3d-loading-overlay');
    if (spinner) spinner.style.display = 'block';

    await initPromise;

    if (spinner) spinner.style.display = 'none';
  }

  if (is3DActive) {
    viewerInstance.stop();
    if (fabricContainer) fabricContainer.style.display = 'block';
    viewerContainer.style.display = 'none';
    is3DActive = false;
    // Update HTML to show we're in 3D view now
    toggleButton.innerHTML = '<i class="bi bi-badge-3d"></i>';
    document.getElementById('2d-controls').style.display = 'block';
    document.getElementById('3d-controls').style.display = 'none';

  } else {
    if (fabricContainer) {
      // Always ensure dimensions stay synced
      viewerContainer.style.width = fabricContainer.clientWidth + 'px';
      viewerContainer.style.height = fabricContainer.clientHeight + 'px';
    }

    canvas.discardActiveObject();

    // Temporarily hide the canvas background so we export a clean transparent decal overlay!
    const originalBg = canvas.backgroundColor;
    canvas.backgroundColor = 'transparent'; // Force true transparent PNG, not null
    canvas.renderAll();

    // Generate a PNG data URL to absolutely guarantee alpha channel preservation!
    const dataURL = canvas.toDataURL({ format: 'png', multiplier: 2 });

    // Immediately restore the background for the 2D view
    canvas.backgroundColor = originalBg;
    canvas.renderAll();

    const img = new Image();
    img.onload = () => {
      // What is urrently selected in the dropdown
      const activeModelSelect = document.getElementById('apparel-model-select');
      const activeModelId = activeModelSelect ? activeModelSelect.value : 'tshirt';

      // Pass model ID to update texture
      viewerInstance.updateTexture(img, activeModelId);
      viewerInstance.start();
      if (fabricContainer) fabricContainer.style.display = 'none';
      viewerContainer.style.display = 'block';
      is3DActive = true;
      // Reset to 2D view
      toggleButton.innerHTML = '<i class="bi bi-pencil-square">';
      document.getElementById('2d-controls').style.display = 'none';
      document.getElementById('3d-controls').style.display = 'block';
    };

    img.src = dataURL;
  }
});

// Setup 3D Controls
async function setup3DControls() {
  const autoSpinToggle = document.getElementById('auto-spin-toggle');
  const lightingSelect = document.getElementById('lighting-preset-select');
  const colorContainer = document.getElementById('color-swatches-container');

  // Auto-Spin
  autoSpinToggle.addEventListener('change', (e) => {
    if (viewerInstance) viewerInstance.toggleAutoRotate(e.target.checked);
  });

  // Color Swatches
  clothingColors.colors.forEach(color => {
    const btn = document.createElement('button');
    // Styling buttons
    btn.className = 'btn rounded-circle shadow-sm border border-secondary p-0';
    btn.style.width = '32px';
    btn.style.height = '32px';
    btn.style.backgroundColor = `#${color.hex}`;
    btn.title = color.name; // hover tooltip

    btn.addEventListener('click', () => {
      if (viewerInstance) {
        // Append 0x to the hex value 
        viewerInstance.changeModelColor(parseInt(`0x${color.hex}`, 16));
      }
    });

    colorContainer.appendChild(btn);
  });

  // Lighting Presets
  const presets = await loadLightingPresets();
  presets.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.name;
    lightingSelect.appendChild(opt);
  });

  lightingSelect.addEventListener('change', (e) => {
    if (viewerInstance) viewerInstance.setLightingPreset(e.target.value);
  });

  // Apparel Model Select
  const modelSelect = document.getElementById('apparel-model-select');
  if (modelSelect) {
    modelSelect.addEventListener('change', async (e) => {
      if (!viewerInstance) return;

      const spinner = document.getElementById('3d-loading-overlay');
      if (spinner) spinner.style.display = 'block';

      const modelId = e.target.value;
      const modelPath = `/models/${modelId}.glb`;

      // Capture latest Fabric canvas
      canvas.discardActiveObject();
      const originalBg = canvas.backgroundColor;
      canvas.backgroundColor = 'transparent';
      canvas.renderAll();
      const dataURL = canvas.toDataURL({ format: 'png', multiplier: 2 });
      canvas.backgroundColor = originalBg;
      canvas.renderAll();

      const img = new Image();
      img.onload = async () => {
        await viewerInstance.switchModel(modelPath, img, modelId);
        if (spinner) spinner.style.display = 'none';
      };
      img.src = dataURL;
    });
  }

  // Export 3D View Button
  const export3DBtn = document.getElementById('export-3d-btn');
  if (export3DBtn) {
    export3DBtn.addEventListener('click', () => {
      if (viewerInstance) {
        viewerInstance.exportScreenshot();
      }
    });
  }
}

setup3DControls();