export function initHistory(canvas, updateActiveObject) {
    const historyStack = [];
    let historyIndex = -1;
    let isProcessing = false;
    const MAX_HISTORY = 20;

    // Record canvas state to history
    function saveHistory() {
        if (isProcessing) return;
        
        // Discard future states if user edits after going back in time
        if (historyIndex < historyStack.length - 1) {
            historyStack.length = historyIndex + 1;
        }

        // Serialize canvas including custom properties
        const json = JSON.stringify(canvas.toJSON(['erasable']));
        historyStack.push(json);
        
        // Prevent excessive memory consumption
        if (historyStack.length > MAX_HISTORY) {
            historyStack.shift();
        } else {
            historyIndex++;
        }
    }

    // Go back one step in history
    function undo() {
        if (isProcessing || historyIndex <= 0) return;
        isProcessing = true;
        historyIndex--;
        
        canvas.loadFromJSON(historyStack[historyIndex]).then(() => {
            canvas.renderAll();
            isProcessing = false;
            // Sync inspector fields to potentially changed object
            if (updateActiveObject) updateActiveObject();
            // Refresh layer UI (undo/redo can change lock/visibility state)
            document.dispatchEvent(new Event('refresh-layers'));
        }).catch(err => {
            console.error("Undo failed:", err);
            isProcessing = false;
        });
    }

    // Move forward one step in history
    function redo() {
        if (isProcessing || historyIndex >= historyStack.length - 1) return;
        isProcessing = true;
        historyIndex++;
        
        canvas.loadFromJSON(historyStack[historyIndex]).then(() => {
            canvas.renderAll();
            isProcessing = false;
            // Sync inspector to match reverted state
            if (updateActiveObject) updateActiveObject();
            // Refresh layer UI after redo
            document.dispatchEvent(new Event('refresh-layers'));
        }).catch(err => {
            console.error("Redo failed:", err);
            isProcessing = false;
        });
    }

    // Store initial canvas state
    saveHistory();

    // Save state when objects are added, removed, or modified
    canvas.on('object:added', saveHistory);
    canvas.on('object:modified', saveHistory);
    canvas.on('object:removed', saveHistory);
    canvas.on('path:created', saveHistory);

    // Keyboard shortcuts for undo/redo
    document.addEventListener('keydown', (e) => {
        // Skip input fields and text editing
        if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
        const activeObj = canvas.getActiveObject();
        if (activeObj && activeObj.isEditing) return;

        if (e.ctrlKey || e.metaKey) {
            if (e.key.toLowerCase() === 'z') {
                e.preventDefault();
                if (e.shiftKey) {
                    redo();
                } else {
                    undo();
                }
            } else if (e.key.toLowerCase() === 'y') {
                e.preventDefault();
                redo();
            }
        }
    });
}