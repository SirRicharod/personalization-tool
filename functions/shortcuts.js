export function initShortcuts(canvas, updateActiveObject) {
    // Double-click object to bring forward
    canvas.on('mouse:dblclick', (opt) => {
        if (opt.target) {
            canvas.bringObjectToFront(opt.target);
            canvas.renderAll();
        }
    });

    // Right-click object to send backward
    canvas.on('mouse:down', (opt) => {
        // e.button === 2 is native right-click
        if (opt.e && opt.e.button === 2 && opt.target) {
            console.log("Right Click");
            canvas.sendObjectToBack(opt.target);
            canvas.renderAll();
        }
    });

    // Global keyboard shortcuts for object manipulation
    document.addEventListener('keydown', (e) => {
        // Skip if typing in input or text editing
        if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
        const activeObj = canvas.getActiveObject();
        if (activeObj && activeObj.isEditing) return;

        // Delete
        if (e.key === 'Delete' || e.key === 'Backspace') {
            const activeObjects = canvas.getActiveObjects();
            if (activeObjects.length > 0) {
                canvas.discardActiveObject();
                activeObjects.forEach(obj => canvas.remove(obj));
                canvas.renderAll();
            }
            return;
        }

        // Arrow Key Nudging
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            if (!activeObj) return;
            e.preventDefault();

            // Hold Shift to jump 10px
            const nudgeAmount = e.shiftKey ? 10 : 1;

            switch (e.key) {
                case 'ArrowUp': activeObj.set('top', activeObj.top - nudgeAmount); break;
                case 'ArrowDown': activeObj.set('top', activeObj.top + nudgeAmount); break;
                case 'ArrowLeft': activeObj.set('left', activeObj.left - nudgeAmount); break;
                case 'ArrowRight': activeObj.set('left', activeObj.left + nudgeAmount); break;
            }
            activeObj.setCoords();
            canvas.renderAll();
            // Sync inspector to show new position
            if (updateActiveObject) updateActiveObject();
        }

        // Rotate with Q and E keys
        if (e.key === 'q' || e.key === 'Q' || e.key === 'e' || e.key === 'E') {
            if (!activeObj) return;

            // Single degree or 15 degrees if Shift held
            const rotateAmount = e.shiftKey ? 15 : 1;
            let currentAngle = activeObj.angle || 0;

            if (e.key === 'q' || e.key === 'Q') {
                activeObj.set('angle', currentAngle - rotateAmount);
            } else {
                activeObj.set('angle', currentAngle + rotateAmount);
            }

            activeObj.setCoords();
            canvas.renderAll();

            // Sync inspector to show new rotation
            if (updateActiveObject) updateActiveObject();
        }
    });
}