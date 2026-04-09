export function initAutoSave(canvas) {
    let isRestoring = false;

    // Check for existing save on startup
    const savedData = localStorage.getItem('personalization_canvas_state');
    if (savedData) {
        // Ask the user via native browser confirm dialogue
        if (confirm("Restore previous session?")) {
            isRestoring = true;
            // Fabric v6 loadFromJSON is Promise-based
            canvas.loadFromJSON(savedData).then(() => {
                canvas.renderAll();
                isRestoring = false;
            }).catch(err => {
                console.error("Failed to restore canvas:", err);
                isRestoring = false;
            });
        } else {
            // They chose not to restore, so clear the old memory
            localStorage.removeItem('personalization_canvas_state');
        }
    }

    // Debounce mechanism to prevent lag while actively dragging
    let saveTimeout;
    function triggerSave() {
        if (isRestoring) return; // Don't trigger saves while we are loading it in!

        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            try {
                // Compress to string
                const jsonString = JSON.stringify(canvas.toJSON(['erasable']));
                localStorage.setItem('personalization_canvas_state', jsonString);
                console.log(`Auto-saved project! Size: ${(jsonString.length / 1024).toFixed(2)} KB`);
            } catch (e) {
                console.warn("Auto-save bypassed: LocalStorage size limit exceeded.", e);
            }
        }, 1000); // Triggers exactly 1 second after their last modification
    }

    // Listen to canvas events to trigger the background save
    canvas.on('object:modified', triggerSave);
    canvas.on('object:added', triggerSave);
    canvas.on('object:removed', triggerSave);
    canvas.on('path:created', triggerSave);
}