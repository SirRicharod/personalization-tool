import { initiate3DViewer } from './3d-viewer/index.js';
import { canvas } from './app.js';
import { loadLightingPresets } from './3d-viewer/presets/lightingPresetsLoader.js';

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
    await initPromise;
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
      viewerInstance.updateTexture(img);
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
  const colorSelect = document.getElementById('model-color-select');
  const lightingSelect = document.getElementById('lighting-preset-select');

  // Phase 11: Auto-Spin
  autoSpinToggle.addEventListener('change', (e) => {
    if (viewerInstance) viewerInstance.toggleAutoRotate(e.target.checked);
  });

  // Phase 13: Base Color (Dropdown)
  colorSelect.addEventListener('change', (e) => {
    if (viewerInstance) {
      const hex = parseInt(e.target.value, 16);
      viewerInstance.changeModelColor(hex);
    }
  });

  // Phase 12: Lighting Presets
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
}

setup3DControls();