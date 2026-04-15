import { quickActionInputs } from "../ui.js";

export function initQuickActions(canvas) {
    const { toolbar, flipXBtn, flipYBtn, cloneBtn, deleteBtn } = quickActionInputs;

    // Show or hide toolbar based on selection
    function updateToolbarDisplay() {
        const activeObj = canvas.getActiveObject();

        // Hide toolbar when nothing selected
        if (!activeObj) {
            toolbar.style.display = 'none';
            return;
        }
        // Show toolbar when object selected
        toolbar.style.display = 'flex';
    }

    // Update toolbar visibility on selection changes
    canvas.on('selection:created', updateToolbarDisplay);
    canvas.on('selection:updated', updateToolbarDisplay);
    canvas.on('selection:cleared', updateToolbarDisplay);

    // Duplicate selected object with offset
    cloneBtn.addEventListener('click', () => {
        const activeObj = canvas.getActiveObject();
        if (!activeObj) return;

        activeObj.clone(['erasable']).then(clonedObj => {
            // Offset cloned object
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

    // Mirror object horizontally
    flipXBtn.addEventListener('click', () => {
        const activeObj = canvas.getActiveObject();
        if (!activeObj) return;
        activeObj.set('flipX', !activeObj.flipX);
        canvas.renderAll();
    });

    // Mirror object vertically
    flipYBtn.addEventListener('click', () => {
        const activeObj = canvas.getActiveObject();
        if (!activeObj) return;
        activeObj.set('flipY', !activeObj.flipY);
        canvas.renderAll();
    });

    // Remove selected objects from canvas
    deleteBtn.addEventListener('click', () => {
        const activeObjects = canvas.getActiveObjects();
        if (activeObjects.length > 0) {
            canvas.discardActiveObject();
            activeObjects.forEach(obj => canvas.remove(obj));
        }
    });
}