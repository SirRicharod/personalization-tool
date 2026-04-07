import { initiate3DViewer } from './3d-viewer/index.js';

const toggleButton = document.getElementById('toggle-3d');
const viewerContainer = document.getElementById('3d-viewer-container');

let is3DActive = false;
let viewerInstance = null;

async function init3D() {
  if (!viewerInstance) {
    const fabricContainer = document.querySelector('.canvas-container');
    if (fabricContainer) {
      // Inherit the exact size of the fabric canvas dynamically
      viewerContainer.style.width = fabricContainer.clientWidth + 'px';
      viewerContainer.style.height = fabricContainer.clientHeight + 'px';
    }

    viewerContainer.style.display = 'block';
    viewerInstance = await initiate3DViewer(viewerContainer);
  }
}

toggleButton.addEventListener('click', async () => {
  // Get Fabric's actual wrapper
  const fabricContainer = document.querySelector('.canvas-container'); 

  if (!viewerInstance) {
    await init3D();
  }
  
  if (is3DActive) {
    viewerInstance.stop();
    if (fabricContainer) fabricContainer.style.display = 'block';
    viewerContainer.style.display = 'none';
    is3DActive = false;
  } else {
    if (fabricContainer) {
      // Always ensure dimensions stay synced
      viewerContainer.style.width = fabricContainer.clientWidth + 'px';
      viewerContainer.style.height = fabricContainer.clientHeight + 'px';
    }
    viewerInstance.start();
    if (fabricContainer) fabricContainer.style.display = 'none';
    viewerContainer.style.display = 'block';
    is3DActive = true;
  }
});