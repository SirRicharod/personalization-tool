import { exportInputs } from '../ui.js';
import { FabricImage } from 'fabric';
import { fileToDataUrl } from '../functions/fileReaderUtil.js';

export function initExport(canvas) {
    const {
        bgColor, bgImage, clearBgImageBtn, exportCanvasBtn,
        exportJsonBtn, importJsonBtn, jsonTextarea,
        exportFormat, exportTransparentBg
    } = exportInputs;

    // Background Color
    bgColor.addEventListener('input', (e) => {
        canvas.backgroundColor = e.target.value;
        canvas.renderAll();
    });

    // Background Image
    bgImage.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const dataUrl = await fileToDataUrl(file);

            FabricImage.fromURL(dataUrl).then((img) => {
                img.set({
                    scaleX: canvas.width / img.width,
                    scaleY: canvas.height / img.height,
                    originX: 'left',
                    originY: 'top'
                });

                canvas.backgroundImage = img;
                canvas.renderAll();

                e.target.value = '';
            });
        } catch (error) {
            console.error('Failed to load background image:', error);
        }
    });

    // Clear Background Image
    clearBgImageBtn.addEventListener('click', () => {
        canvas.backgroundImage = null;
        bgImage.value = ''; // Reset file input
        canvas.renderAll();
    });

    // Download helper
    function downloadDataUrl(dataUrl, filename) {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        link.click();
    }

    // Export Canvas
    exportCanvasBtn.addEventListener('click', () => {
        // Drop active bounding boxes
        canvas.discardActiveObject();
        canvas.renderAll();

        const format = exportFormat.value; // 'png', 'jpeg', or 'svg'
        const needsTransparency = exportTransparentBg.checked;

        // Save background to restore after export
        const originalBgColor = canvas.backgroundColor;
        const originalBgImage = canvas.backgroundImage;

        // JPEG always has a background
        if (needsTransparency && format !== 'jpeg') {
            canvas.backgroundColor = null;
            canvas.backgroundImage = null;
            canvas.renderAll();
        }

        // Handle SVG generation vs Image Generation
        if (format === 'svg') {
            const svgString = canvas.toSVG();
            // Create a Blob to safely handle all characters
            const blob = new Blob([svgString], { type: 'image/svg+xml' });
            const dataUrl = URL.createObjectURL(blob);
            downloadDataUrl(dataUrl, 'canvas-export.svg');

            // Clean up the URL object
            setTimeout(() => URL.revokeObjectURL(dataUrl), 100);
        } else {
            const dataUrl = canvas.toDataURL({
                format: format,
                multiplier: 2 // resolution
            });
            downloadDataUrl(dataUrl, `high-res-export.${format}`);
        }

        // restore background
        if (needsTransparency && format !== 'jpeg') {
            canvas.backgroundColor = originalBgColor;
            canvas.backgroundImage = originalBgImage;
            canvas.renderAll();
        }
    });

    // disable transparency checkbox if JPEG is selected, also show format tooltip
    exportFormat.addEventListener('change', (e) => {
        // Update disable state
        if (e.target.value === 'jpeg') {
            exportTransparentBg.checked = false;
            exportTransparentBg.disabled = true;
        } else {
            exportTransparentBg.disabled = false;
        }
    });
    // Trigger on load to show default
    exportFormat.dispatchEvent(new Event('change'));

    // Copy JSON to clipboard
    exportJsonBtn.addEventListener('click', () => {
        const jsonStr = JSON.stringify(canvas.toJSON(['erasable']));
        navigator.clipboard.writeText(jsonStr);
    });

    // Import JSON from Textarea
    importJsonBtn.addEventListener('click', () => {
        const jsonText = jsonTextarea.value.trim();

        // loadFromJSON returns a Promise in Fabric v6+
        canvas.loadFromJSON(jsonText).then(() => {
            canvas.renderAll();
            if (importJsonBtn.classList.contains('btn-danger'))
                importJsonBtn.classList.remove('btn-danger');
        }).catch(err => {
            console.error('Failed to load JSON:', err);
            importJsonBtn.classList.add('btn-danger');
        });
    });
}