export function initHistory(canvas, updateActiveObject) {
    const historyStack = [];
    let historyIndex = -1;
    let isProcessing = false;
    const MAX_HISTORY = 20;

    function saveHistory() {
        if (isProcessing) return;
        
        // If we are back in time and make a new change, slice off the alternate future!
        if (historyIndex < historyStack.length - 1) {
            historyStack.length = historyIndex + 1;
        }

        // Save our custom 'erasable' property!
        const json = JSON.stringify(canvas.toJSON(['erasable']));
        historyStack.push(json);
        
        // Prevent RAM bloat
        if (historyStack.length > MAX_HISTORY) {
            historyStack.shift();
        } else {
            historyIndex++;
        }
    }

    function undo() {
        if (isProcessing || historyIndex <= 0) return;
        isProcessing = true;
        historyIndex--;
        
        canvas.loadFromJSON(historyStack[historyIndex]).then(() => {
            canvas.renderAll();
            isProcessing = false;
            // Tell the UI Inspector to update since the selected object might have warped
            if (updateActiveObject) updateActiveObject();
        }).catch(err => {
            console.error("Undo failed:", err);
            isProcessing = false;
        });
    }

    function redo() {
        if (isProcessing || historyIndex >= historyStack.length - 1) return;
        isProcessing = true;
        historyIndex++;
        
        canvas.loadFromJSON(historyStack[historyIndex]).then(() => {
            canvas.renderAll();
            isProcessing = false;
            if (updateActiveObject) updateActiveObject();
        }).catch(err => {
            console.error("Redo failed:", err);
            isProcessing = false;
        });
    }

    // Save the initial starting state
    saveHistory();

    // Listen for canvas changes
    canvas.on('object:added', saveHistory);
    canvas.on('object:modified', saveHistory);
    canvas.on('object:removed', saveHistory);
    canvas.on('path:created', saveHistory);

    // Listen for keyboard shortcuts (Ctrl+Z and Ctrl+Y / Ctrl+Shift+Z)
    document.addEventListener('keydown', (e) => {
        // Ignore if user is typing in a text field
        if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
        const activeObj = canvas.getActiveObject();
        if (activeObj && activeObj.isEditing) return;

        if (e.ctrlKey || e.metaKey) {
            if (e.key.toLowerCase() === 'z') {
                e.preventDefault(); // Stop browser from doing native undo
                if (e.shiftKey) {
                    redo(); // Ctrl+Shift+Z
                } else {
                    undo(); // Ctrl+Z
                }
            } else if (e.key.toLowerCase() === 'y') {
                e.preventDefault();
                redo(); // Ctrl+Y
            }
        }
    });
}