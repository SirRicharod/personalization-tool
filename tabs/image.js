import { imageInputs } from '../ui.js';
import { FabricImage, filters, Rect } from 'fabric';

// ! === IMAGE WINDOW ===
export function initImage(canvas, updateActiveObject) {
    // Add uploaded image to canvas
    imageInputs.addBtn.addEventListener('click', () => {
        // Check if user actually uploaded a file
        const file = imageInputs.upload.files[0];
        if (!file) return;

        // FileReader to read the imagefile
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result;

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
                    left: 100,
                    top: 100,
                });

                // Add image to canvas
                canvas.add(img);
                canvas.setActiveObject(img);

                // Clear input field
                imageInputs.upload.value = '';
            });
        };

        // Read file as Data URL (base64 string)
        reader.readAsDataURL(file);

    });

    //? Filters
    // Function to apply filters
    function togglePresetFilter(btnElement, FilterClass) {
        const obj = canvas.getActiveObject();

        if (!obj || obj.type !== 'image') return;

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

    // Preset Filter Event Listeners
    // Clears all Preset Filters but LEAVE adjustments
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

    // Built-in vintage/color filters
    imageInputs.filterSepia.addEventListener('click', (e) => togglePresetFilter(e.currentTarget, filters.Sepia));
    imageInputs.filterBW.addEventListener('click', (e) => togglePresetFilter(e.currentTarget, filters.Grayscale));
    imageInputs.filterVintage.addEventListener('click', (e) => togglePresetFilter(e.currentTarget, filters.Vintage));
    imageInputs.filterPolaroid.addEventListener('click', (e) => togglePresetFilter(e.currentTarget, filters.Polaroid));
    imageInputs.filterInvert.addEventListener('click', (e) => togglePresetFilter(e.currentTarget, filters.Invert));
    imageInputs.filterWarm.addEventListener('click', (e) => togglePresetFilter(e.currentTarget, filters.Brownie));
    imageInputs.filterCool.addEventListener('click', (e) => togglePresetFilter(e.currentTarget, filters.Kodachrome));
    imageInputs.filterTechnicolor.addEventListener('click', (e) => togglePresetFilter(e.currentTarget, filters.Technicolor));

    //? Image Adjustments
    //helper function to keep adjustments made
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

    //? Brightness
    function handleBrightness(e) {
        const val = e.target.value;

        // sync slider and value
        imageInputs.brightSlider.value = imageInputs.brightVal.value = val;

        // Some math because HTML slider is 0-100 but brightness uses -1.0 - 1.0
        const fabricVal = (val - 50) / 50;

        applySliderFilter(filters.Brightness, 'brightness', fabricVal);
    }

    // Listen to slider and number
    imageInputs.brightSlider.addEventListener('input', handleBrightness);
    imageInputs.brightVal.addEventListener('input', handleBrightness);

    //?  Saturation
    function handleSaturation(e) {
        const val = e.target.value;

        imageInputs.satSlider.value = imageInputs.satVal.value = val;

        // Convert 0-100 to -1.0 to 1.0
        const fabricVal = (val - 50) / 50;

        applySliderFilter(filters.Saturation, 'saturation', fabricVal);

    }
    imageInputs.satSlider.addEventListener('input', handleSaturation);
    imageInputs.satVal.addEventListener('input', handleSaturation);

    //? Contrast
    function handleContrast(e) {
        const val = e.target.value;

        imageInputs.contrastVal.value = val;
        imageInputs.contrastSlider.value = val;

        // Convert 0-100 to -1.0 to 1.0
        const fabricVal = (val - 50) / 50;

        applySliderFilter(filters.Contrast, 'contrast', fabricVal);
    }

    imageInputs.contrastSlider.addEventListener('input', handleContrast);
    imageInputs.contrastVal.addEventListener('input', handleContrast);

    //? Blur
    function handleBlur(e) {
        const val = e.target.value;

        imageInputs.blurVal.value = imageInputs.blurSlider.value = val;

        // blur needs value between 0 and 1 so divide by 100
        const fabricVal = val / 100;

        applySliderFilter(filters.Blur, 'blur', fabricVal);
    }

    imageInputs.blurSlider.addEventListener('input', handleBlur);
    imageInputs.blurVal.addEventListener('input', handleBlur);

    //? Advanced Tools
    //? Pixelate
    function handlePixelate(e) {
        const val = e.target.value;
        imageInputs.pixelSlider.value = imageInputs.pixelVal.value = val;

        // Pixelate goes from 1 (off) to 100 (huge pixels)
        const fabricVal = val < 2 ? 1 : Math.round(val);

        applySliderFilter(filters.Pixelate, 'blocksize', fabricVal);
    }

    imageInputs.pixelSlider.addEventListener('input', handlePixelate);
    imageInputs.pixelVal.addEventListener('input', handlePixelate);

    //? Noise
    function handleNoise(e) {
        const val = e.target.value;
        imageInputs.noiseSlider.value = imageInputs.noiseVal.value = val;

        // Max noise = ~1000, slider = 0-100, multiply by 5 for good range of noise
        applySliderFilter(filters.Noise, 'noise', val * 5);
    }

    imageInputs.noiseSlider.addEventListener('input', handleNoise);
    imageInputs.noiseVal.addEventListener('input', handleNoise);

    //? Color Blend
    function handleBlend() {
        const mode = imageInputs.blendMode.value.toLowerCase(); // lowercase
        const color = imageInputs.blendColor.value; // Hex value

        const obj = canvas.getActiveObject();
        if (!obj || obj.type !== 'image') return;

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

        // Get value from event
        const val = e.target.value;

        // Check which slider to sync
        const isRed = e.target === imageInputs.gammaRSlider || e.target === imageInputs.gammaRVal;
        const isGreen = e.target === imageInputs.gammaGSlider || e.target === imageInputs.gammaGVal;
        const isBlue = e.target === imageInputs.gammaBSlider || e.target === imageInputs.gammaBVal;

        // sync slider and number input
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

    // Crop Image (Interactive)
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

            // Create a cropping bounding box matched exactly to the image's visual bounds
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
                lockRotation: true // Prevent rotation
            });

            // Remove the rotating handle (mtr) from the crop box entirely
            cropRect.setControlsVisibility({ mtr: false });

            canvas.add(cropRect);
            canvas.setActiveObject(cropRect);
        } else {
            // 2. Apply Crop
            const scaleX = croppingImage.scaleX;
            const scaleY = croppingImage.scaleY;

            // Get visual bounding boxes
            const cropBounds = cropRect.getBoundingRect();
            const imgBounds = croppingImage.getBoundingRect();

            // Calculate visual offset on the canvas
            const deltaX = cropBounds.left - imgBounds.left;
            const deltaY = cropBounds.top - imgBounds.top;

            // Convert the canvas offset into unscaled image pixels for crop mapping
            const unscaledDeltaX = deltaX / scaleX;
            const unscaledDeltaY = deltaY / scaleY;

            // Calculate the new cropped dimensions in unscaled pixels
            const newWidth = cropRect.getScaledWidth() / scaleX;
            const newHeight = cropRect.getScaledHeight() / scaleY;

            // Factor in any existing crops
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
        }

        canvas.requestRenderAll();
    });
}