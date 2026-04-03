import { layerInputs } from '../ui.js';

export function initLayers(canvas) {
    const { container } = layerInputs;

    function renderLayers() {
        container.innerHTML = ''; // Clear current layers

        // Get all canvas objects in reverse
        const objects = [...canvas.getObjects()].reverse();

        objects.forEach((obj, index) => {
            // Get actual z-index
            const realIndex = objects.length - 1 - index;

            const layerDiv = document.createElement('div');
            layerDiv.className = 'd-flex align-items-center justify-content-between bg-white rounded p-2 mb-2 shadow-sm layer-item';

            // Add layer controls
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

            //? Wire up buttons
            // Visibility
            layerDiv.querySelector('.toggle-visibility-btn').addEventListener('click', () => {
                obj.visible = obj.visible === false ? true : false; // Toggle
                if (canvas.getActiveObject() === obj) canvas.discardActiveObject();
                canvas.renderAll();
                renderLayers(); // Re-render to update eye icon
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

            // Delete object
            layerDiv.querySelector('.layer-delete-btn').addEventListener('click', () => {
                canvas.remove(obj);
            });

            // Lock object
            layerDiv.querySelector('.toggle-lock-btn').addEventListener('click', () => {
                // selectable = false => locked
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
                renderLayers(); // update layer UI
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