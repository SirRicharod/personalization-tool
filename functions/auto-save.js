export function initAutoSave(canvas) {
    let isRestoring = false;

    // Attempt to recover previous session on load
    const savedData = localStorage.getItem('personalization_canvas_state');
    if (savedData) {
        // Prompt user to restore
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
            // User declined restore, clear old data
            localStorage.removeItem('personalization_canvas_state');
        }
    }

    // Throttle saves to prevent performance issues during active editing
    let saveTimeout;
    function triggerSave() {
        if (isRestoring) return;

        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            try {
                // Serialize canvas to JSON string
                const jsonString = JSON.stringify(canvas.toJSON(['erasable']));
                localStorage.setItem('personalization_canvas_state', jsonString);
                console.log(`Auto-saved project! Size: ${(jsonString.length / 1024).toFixed(2)} KB`);
            } catch (e) {
                console.warn("Auto-save bypassed: LocalStorage size limit exceeded.", e);
            }
        }, 1000);
    }

    // Trigger save on canvas modification events
    canvas.on('object:modified', triggerSave);
    canvas.on('object:added', triggerSave);
    canvas.on('object:removed', triggerSave);
    canvas.on('path:created', triggerSave);
}