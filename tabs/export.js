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

    // Load and scale background image to fit canvas
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

    // Helper to trigger file download from data URL
    function downloadDataUrl(dataUrl, filename) {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        link.click();
    }

    // Export canvas to PNG, JPEG, or SVG format
    exportCanvasBtn.addEventListener('click', () => {
        // Deselect objects before export
        canvas.discardActiveObject();
        canvas.renderAll();

        const format = exportFormat.value; // 'png', 'jpeg', or 'svg'
        const needsTransparency = exportTransparentBg.checked;

        // Preserve original background for later restoration
        const originalBgColor = canvas.backgroundColor;
        const originalBgImage = canvas.backgroundImage;

        // JPEG always has a background
        if (needsTransparency && format !== 'jpeg') {
            canvas.backgroundColor = null;
            canvas.backgroundImage = null;
            canvas.renderAll();
        }

        // Export as SVG or raster image based on format
        if (format === 'svg') {
            // Generate SVG markup
            const svgString = canvas.toSVG();
            // Use Blob for safe data handling
            const blob = new Blob([svgString], { type: 'image/svg+xml' });
            const dataUrl = URL.createObjectURL(blob);
            downloadDataUrl(dataUrl, 'canvas-export.svg');

            // Clean up the URL object
            setTimeout(() => URL.revokeObjectURL(dataUrl), 100);
        } else {
            // Generate raster image at 2x resolution
            const dataUrl = canvas.toDataURL({
                format: format,
                multiplier: 2 // resolution
            });
            downloadDataUrl(dataUrl, `high-res-export.${format}`);
        }

        // Restore original background state
        if (needsTransparency && format !== 'jpeg') {
            canvas.backgroundColor = originalBgColor;
            canvas.backgroundImage = originalBgImage;
            canvas.renderAll();
        }
    });

    // Disable transparency option for JPEG format
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

    // Restore canvas from JSON data in textarea
    importJsonBtn.addEventListener('click', () => {
        const jsonText = jsonTextarea.value.trim();

        // Fabric v6+ returns Promise from loadFromJSON
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