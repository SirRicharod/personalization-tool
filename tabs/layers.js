import { layerInputs } from '../ui.js';

export function initLayers(canvas) {
    const { container } = layerInputs;

    // Rebuild layer panel to match current canvas state
    function renderLayers() {
        container.innerHTML = ''; // Clear current layers

        // Get canvas objects in reverse z-order (top to bottom)
        const objects = [...canvas.getObjects()].reverse();

        objects.forEach((obj, index) => {
            // Calculate true z-index for display
            const realIndex = objects.length - 1 - index;

            // Create layer item DOM structure
            const layerDiv = document.createElement('div');
            layerDiv.className = 'd-flex align-items-center justify-content-between bg-white rounded p-2 mb-2 shadow-sm layer-item';

            // Build layer UI with lock, visibility, and action buttons
            layerDiv.innerHTML = `
                <div class="d-flex align-items-center text-dark">
                    <button class="btn btn-sm btn-light border p-1 me-2 lh-1 toggle-lock-btn" title="Toggle Lock">
                        <i class="bi ${obj.selectable === false ? 'bi-lock-fill text-primary' : 'bi-unlock'}"></i>
                    </button>
                    <span class="fw-medium text-truncate layer-name">
                        Layer ${realIndex + 1} — ${obj.type.toUpperCase()}
                    </span>
                </div>
                <div class="d-flex gap-1">
                    <button class="btn btn-sm btn-light border p-1 lh-1 toggle-visibility-btn" title="Toggle Visibility">
                        <i class="bi ${obj.visible === false ? 'bi-eye-slash text-secondary' : 'bi-eye text-dark'}"></i>
                    </button>
                    <button class="btn btn-sm btn-light border p-1 lh-1 move-down-btn" title="Send Backward" 
                    ${realIndex === 0 ? 'disabled' : ''}>
                        <i class="bi bi-chevron-down text-dark"></i>
                    </button>
                    <button class="btn btn-sm btn-light border p-1 lh-1 move-up-btn" title="Bring Forward" 
                    ${realIndex === objects.length - 1 ? 'disabled' : ''}>
                        <i class="bi bi-chevron-up text-dark"></i>
                    </button>
                    <button class="btn btn-sm btn-light border p-1 lh-1 layer-delete-btn" title="Delete Layer">
                        <i class="bi bi-trash3 text-dark"></i>
                    </button>
                </div>
            `;

            // Attach event handlers for layer controls
            // Visibility toggle
            layerDiv.querySelector('.toggle-visibility-btn').addEventListener('click', () => {
                obj.visible = !obj.visible;
                if (canvas.getActiveObject() === obj) canvas.discardActiveObject();
                canvas.renderAll();
                renderLayers();
            });

            // Move up one
            layerDiv.querySelector('.move-up-btn').addEventListener('click', () => {
                canvas.bringObjectForward(obj);
                canvas.renderAll();
                renderLayers();
            });

            // Move down one
            layerDiv.querySelector('.move-down-btn').addEventListener('click', () => {
                canvas.sendObjectBackwards(obj);
                canvas.renderAll();
                renderLayers();
            });

            // Delete layer from canvas
            layerDiv.querySelector('.layer-delete-btn').addEventListener('click', () => {
                canvas.remove(obj);
                renderLayers();
            });

            // Lock or unlock layer for editing
            layerDiv.querySelector('.toggle-lock-btn').addEventListener('click', () => {
                const isLocked = obj.selectable === false;

                obj.set({
                    selectable: isLocked,
                    evented: isLocked,
                    lockMovementX: !isLocked,
                    lockMovementY: !isLocked,
                    lockRotation: !isLocked,
                    lockScalingX: !isLocked,
                    lockScalingY: !isLocked,
                });

                // Deselect object we locked
                if(!isLocked && canvas.getActiveObject() == obj) {
                    canvas.discardActiveObject();
                }

                canvas.renderAll();
                renderLayers();
            })

            container.appendChild(layerDiv);
        });
    }

    // Listeners for canvas events
    canvas.on('object:added', renderLayers);
    canvas.on('object:removed', renderLayers);

    // Initial render
    renderLayers();
}