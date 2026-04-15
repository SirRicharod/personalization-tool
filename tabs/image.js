import { imageInputs } from '../ui.js';
import { FabricImage, filters, Rect } from 'fabric';
import { fileToDataUrl } from '../functions/fileReaderUtil.js';
import { syncSliderInput, createSliderFilterHandler } from '../functions/uiBindings.js';

// ! === IMAGE WINDOW ===
export function initImage(canvas, updateActiveObject) {
    // Add uploaded image to canvas
    imageInputs.addBtn.addEventListener('click', async () => {
        // Check if user actually uploaded a file
        const file = imageInputs.upload.files[0];
        if (!file) return;

        try {
            // Convert file to data URL using utility
            const dataUrl = await fileToDataUrl(file);

            // Load image with a promise
            FabricImage.fromURL(dataUrl).then((img) => {
                // Scale image so it fits on canvas
                if (img.width > 400 || img.height > 400) {
                    if (img.width >= img.height) {
                        img.scaleToWidth(400);
                    } else {
                        img.scaleToHeight(400);
                    }
                }

                img.set({
                    left: canvas.width / 2,
                    top: canvas.height / 2,
                });

                // Add image to canvas
                canvas.add(img);
                canvas.setActiveObject(img);

                // Clear input field
                imageInputs.upload.value = '';
            });
        } catch (error) {
            console.error('Failed to load image:', error);
        }

    });

    //? Filters
    // Toggle preset filter, keep adjustments separate
    function togglePresetFilter(btnElement, FilterClass) {
        const obj = canvas.getActiveObject();

        if (!obj || obj.type !== 'image') return;

        // Look for existing instance of this filter
        const filterIndex = obj.filters.findIndex(f => f instanceof FilterClass);

        if (obj && obj.type === 'image') {

            if (filterIndex > -1) {
                obj.filters.splice(filterIndex, 1);
                btnElement.classList.remove('active'); // remove active class from button
            } else {
                obj.filters.push(new FilterClass());
                btnElement.classList.add('active'); // add active class from button
            }

            // Bake the filters
            obj.applyFilters();
            canvas.requestRenderAll();
        }
    }

    //? Preset Filter Event Listeners
    // Clears all Preset Filters but not adjustments
    imageInputs.filterNormal.addEventListener('click', () => {
        const obj = canvas.getActiveObject();
        if (!obj || obj.type !== 'image') return;

        // A list of the used classes
        const sliderFilters = [
            filters.Brightness, filters.Saturation, filters.Contrast,
            filters.Blur, filters.Noise, filters.Pixelate, filters.BlendColor, filters.Gamma, filters.RemoveColor
        ];

        // Filter the array, keep sliders only
        obj.filters = obj.filters.filter(f => sliderFilters.some(SliderClass => f instanceof SliderClass));

        // Remove the 'active' class from every preset button
        const presetButtons = [
            imageInputs.filterSepia, imageInputs.filterBW, imageInputs.filterVintage,
            imageInputs.filterTechnicolor, imageInputs.filterPolaroid,
            imageInputs.filterInvert, imageInputs.filterWarm, imageInputs.filterCool
        ];
        presetButtons.forEach(btn => btn.classList.remove('active'));

        obj.applyFilters();
        canvas.requestRenderAll();
    });

    // Built-in color filters
    imageInputs.filterSepia.addEventListener('click', (e) => togglePresetFilter(e.currentTarget, filters.Sepia));
    imageInputs.filterBW.addEventListener('click', (e) => togglePresetFilter(e.currentTarget, filters.Grayscale));
    imageInputs.filterVintage.addEventListener('click', (e) => togglePresetFilter(e.currentTarget, filters.Vintage));
    imageInputs.filterPolaroid.addEventListener('click', (e) => togglePresetFilter(e.currentTarget, filters.Polaroid));
    imageInputs.filterInvert.addEventListener('click', (e) => togglePresetFilter(e.currentTarget, filters.Invert));
    imageInputs.filterWarm.addEventListener('click', (e) => togglePresetFilter(e.currentTarget, filters.Brownie));
    imageInputs.filterCool.addEventListener('click', (e) => togglePresetFilter(e.currentTarget, filters.Kodachrome));
    imageInputs.filterTechnicolor.addEventListener('click', (e) => togglePresetFilter(e.currentTarget, filters.Technicolor));

    //? Image Adjustments
    // Helper function to keep adjustments made
    function applySliderFilter(FilterClass, propName, value) {
        const obj = canvas.getActiveObject();
        if (!obj || obj.type !== 'image') return;

        // Check if we have already applied this filter
        let filter = obj.filters.find(f => f instanceof FilterClass);

        if (!filter) {
            // Create filter and add it to array
            filter = new FilterClass();
            obj.filters.push(filter);
        }

        // Apply value to property
        filter[propName] = value;

        obj.applyFilters();
        canvas.requestRenderAll();

    }

    // Brightness adjustment slider
    syncSliderInput(imageInputs.brightSlider, imageInputs.brightVal,
        createSliderFilterHandler(applySliderFilter, filters.Brightness, 'brightness', (val) => (val - 50) / 50));

    // Saturation adjustment slider
    syncSliderInput(imageInputs.satSlider, imageInputs.satVal,
        createSliderFilterHandler(applySliderFilter, filters.Saturation, 'saturation', (val) => (val - 50) / 50));

    // Contrast adjustment slider
    syncSliderInput(imageInputs.contrastSlider, imageInputs.contrastVal,
        createSliderFilterHandler(applySliderFilter, filters.Contrast, 'contrast', (val) => (val - 50) / 50));

    // Blur adjustment slider
    syncSliderInput(imageInputs.blurSlider, imageInputs.blurVal,
        createSliderFilterHandler(applySliderFilter, filters.Blur, 'blur', (val) => val / 100));

    // Advanced image tools

    // Pixelate effect slider
    syncSliderInput(imageInputs.pixelSlider, imageInputs.pixelVal,
        createSliderFilterHandler(applySliderFilter, filters.Pixelate, 'blocksize', (val) => val < 2 ? 1 : Math.round(val)));

    // Noise effect slider
    syncSliderInput(imageInputs.noiseSlider, imageInputs.noiseVal,
        createSliderFilterHandler(applySliderFilter, filters.Noise, 'noise', (val) => val * 5));

    //? Color Blend
    function handleBlend() {
        const obj = canvas.getActiveObject();
        if (!obj || obj.type !== 'image') return;

        const mode = imageInputs.blendMode.value.toLowerCase(); // lowercase
        const color = imageInputs.blendColor.value; // Hex value

        let filter = obj.filters.find(f => f instanceof filters.BlendColor);

        if (!filter) {
            filter = new filters.BlendColor();
            obj.filters.push(filter);
        }

        if (mode === 'normal') {
            //normal = no filter
            filter.alpha = 1;
            filter.mode = 'multiply';
            filter.color = imageInputs.blendColor.value = '#ffffff';
        } else {
            filter.mode = mode;
            filter.color = color;
            filter.alpha = 1;
        }

        obj.applyFilters();
        canvas.requestRenderAll();
    }

    imageInputs.blendMode.addEventListener('change', handleBlend);
    imageInputs.blendColor.addEventListener('input', handleBlend);

    //? Gamma (RGB)
    function handleGamma(e) {
        const val = e.target.value;

        // Determine which RGB channel was changed
        const isRed = e.target === imageInputs.gammaRSlider || e.target === imageInputs.gammaRVal;
        const isGreen = e.target === imageInputs.gammaGSlider || e.target === imageInputs.gammaGVal;
        const isBlue = e.target === imageInputs.gammaBSlider || e.target === imageInputs.gammaBVal;

        // Keep slider and input in sync for all three channels
        if (isRed) imageInputs.gammaRSlider.value = imageInputs.gammaRVal.value = val;
        if (isGreen) imageInputs.gammaGSlider.value = imageInputs.gammaGVal.value = val;
        if (isBlue) imageInputs.gammaBSlider.value = imageInputs.gammaBVal.value = val;

        // get final value
        const rVal = imageInputs.gammaRSlider.value;
        const gVal = imageInputs.gammaGSlider.value;
        const bVal = imageInputs.gammaBSlider.value;

        // Gamma goes 0.01 - 2.2
        const minGamma = 0.01;
        const maxGamma = 2.2;

        const r = minGamma + (rVal / 100) * (maxGamma - minGamma);
        const g = minGamma + (gVal / 100) * (maxGamma - minGamma);
        const b = minGamma + (bVal / 100) * (maxGamma - minGamma);

        const obj = canvas.getActiveObject();
        if (!obj || obj.type !== 'image') return;

        let filter = obj.filters.find(f => f instanceof filters.Gamma);
        if (!filter) {
            filter = new filters.Gamma();
            obj.filters.push(filter);
        }

        // Gamma expects array of [red, green, blue] 
        filter.gamma = [r, g, b];

        obj.applyFilters();
        canvas.requestRenderAll();
    }

    imageInputs.gammaRSlider.addEventListener('input', handleGamma);
    imageInputs.gammaRVal.addEventListener('input', handleGamma);
    imageInputs.gammaGSlider.addEventListener('input', handleGamma);
    imageInputs.gammaGVal.addEventListener('input', handleGamma);
    imageInputs.gammaBSlider.addEventListener('input', handleGamma);
    imageInputs.gammaBVal.addEventListener('input', handleGamma);

    //? Remove Color (Chroma Key)
    function handleRemoveColor(e) {
        const color = imageInputs.removeColor.value; // Hex value

        if (e.target === imageInputs.removeSlider || e.target === imageInputs.removeVal) {
            // Sync distance slider and input
            imageInputs.removeSlider.value = imageInputs.removeVal.value = e.target.value;
        }

        const distVal = imageInputs.removeSlider.value; // 0 to 100

        const obj = canvas.getActiveObject();
        if (!obj || obj.type !== 'image') return;

        let filter = obj.filters.find(f => f instanceof filters.RemoveColor);
        if (!filter) {
            filter = new filters.RemoveColor();
            obj.filters.push(filter);
        }

        filter.color = color;
        filter.distance = distVal / 100; // 0 - 1 range divide by 100

        obj.applyFilters();
        canvas.requestRenderAll();
    }

    imageInputs.removeSlider.addEventListener('input', handleRemoveColor);
    imageInputs.removeVal.addEventListener('input', handleRemoveColor);
    imageInputs.removeColor.addEventListener('input', handleRemoveColor);

    //? Crop Image
    let croppingImage = null;
    let cropRect = null;

    imageInputs.cropBtn.addEventListener('click', () => {
        if (!croppingImage) {
            // 1. Enter Crop Mode
            const obj = canvas.getActiveObject();
            if (!obj || obj.type !== 'image') return;

            croppingImage = obj;

            // Lock the image while we adjust the crop box
            croppingImage.set({ selectable: false, evented: false });
            imageInputs.cropBtn.classList.add('active');

            // Show crop mode indicator
            imageInputs.cropBtn.textContent = '✂️ Cropping';
            imageInputs.cropBtn.style.backgroundColor = '#ff6b6b';
            imageInputs.cropBtn.style.color = '#fff';

            // Create crop box overlay matching image's visual bounds (includes scale)
            const imgBounds = croppingImage.getBoundingRect();
            cropRect = new Rect({
                left: imgBounds.left,
                top: imgBounds.top,
                width: croppingImage.getScaledWidth(),
                height: croppingImage.getScaledHeight(),
                fill: 'rgba(0, 0, 0, 0.3)',
                strokeWidth: 2,
                stroke: '#000000',
                strokeDashArray: [5, 5],
                originX: 'left',
                originY: 'top',
                lockRotation: true
            });

            // Hide rotating handle (resize/move only)
            cropRect.setControlsVisibility({ mtr: false });

            canvas.add(cropRect);
            canvas.setActiveObject(cropRect);
        } else {
            // 2. Apply Crop
            const scaleX = croppingImage.scaleX;
            const scaleY = croppingImage.scaleY;

            // Get visual bounds for crop rect and image on canvas
            const cropBounds = cropRect.getBoundingRect();
            const imgBounds = croppingImage.getBoundingRect();

            // Calculate visual offset
            const deltaX = cropBounds.left - imgBounds.left;
            const deltaY = cropBounds.top - imgBounds.top;

            // Convert visual offset to unscaled image pixels via scale factors
            const unscaledDeltaX = deltaX / scaleX;
            const unscaledDeltaY = deltaY / scaleY;

            // Calculate new crop dimensions in unscaled image space
            const newWidth = cropRect.getScaledWidth() / scaleX;
            const newHeight = cropRect.getScaledHeight() / scaleY;

            // Support stacked crops (multiple crops in sequence)
            const currentCropX = croppingImage.cropX || 0;
            const currentCropY = croppingImage.cropY || 0;

            // Store targets before removing rect
            const finalLeft = cropBounds.left;
            const finalTop = cropBounds.top;

            // Clean up crop UI
            canvas.remove(cropRect);

            const finalImage = croppingImage;

            // Apply new crop values and size
            finalImage.set({
                cropX: currentCropX + unscaledDeltaX,
                cropY: currentCropY + unscaledDeltaY,
                width: newWidth,
                height: newHeight,
                selectable: true,
                evented: true
            });

            // Use Fabric's internals to perfectly realign the image back over the crop box footprint
            // without guessing origins
            finalImage.setCoords();
            const newImgBounds = finalImage.getBoundingRect();
            const shiftX = finalLeft - newImgBounds.left;
            const shiftY = finalTop - newImgBounds.top;

            finalImage.set({
                left: finalImage.left + shiftX,
                top: finalImage.top + shiftY
            });

            finalImage.setCoords(); // Final visual update
            canvas.setActiveObject(finalImage);

            // Reset variables
            croppingImage = null;
            cropRect = null;
            imageInputs.cropBtn.classList.remove('active');

            // Reset button styling
            imageInputs.cropBtn.innerHTML = '<i class="bi bi-crop fs-5"></i> Crop';
            imageInputs.cropBtn.style.backgroundColor = '';
            imageInputs.cropBtn.style.color = '';
        }

        canvas.requestRenderAll();
    });
}