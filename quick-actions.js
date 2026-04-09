import { quickActionInputs } from "./ui.js";

export function initQuickActions(canvas) {
    const { toolbar, flipXBtn, flipYBtn, cloneBtn, deleteBtn } = quickActionInputs;

    function updateToolbarDisplay() {
        const activeObj = canvas.getActiveObject();

        // Nothing selected -> hide toolbar
        if (!activeObj) {
            toolbar.style.display = 'none';
            return;
        }
        // Show toolbar
        toolbar.style.display = 'flex';
    }

    canvas.on('selection:created', updateToolbarDisplay);
    canvas.on('selection:updated', updateToolbarDisplay);
    canvas.on('selection:cleared', updateToolbarDisplay);

    // Listener for Clone
    cloneBtn.addEventListener('click', () => {
        const activeObj = canvas.getActiveObject();
        if (!activeObj) return;

        activeObj.clone(['erasable']).then(clonedObj => {
            // Offset slightly
            clonedObj.set({
                left: clonedObj.left + 20,
                top: clonedObj.top + 20,
                evented: true
            });

            if (clonedObj.type === 'activeSelection') {
                clonedObj.canvas = canvas;
                clonedObj.forEachObject(obj => canvas.add(obj));
                clonedObj.setCoords();
            } else {
                canvas.add(clonedObj);
            }

            canvas.setActiveObject(clonedObj);
            canvas.renderAll();
        });
    });

    // Listeners for Flipping
    flipXBtn.addEventListener('click', () => {
        const activeObj = canvas.getActiveObject();
        if (!activeObj) return;
        activeObj.set('flipX', !activeObj.flipX);
        canvas.renderAll();
    });

    flipYBtn.addEventListener('click', () => {
        const activeObj = canvas.getActiveObject();
        if (!activeObj) return;
        activeObj.set('flipY', !activeObj.flipY);
        canvas.renderAll();
    });

    // Listener for Delete
    deleteBtn.addEventListener('click', () => {
        const activeObjects = canvas.getActiveObjects();
        if (activeObjects.length > 0) {
            canvas.discardActiveObject();
            activeObjects.forEach(obj => canvas.remove(obj));
        }
    });
}