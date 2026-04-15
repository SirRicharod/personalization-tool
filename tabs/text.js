import { textInputs } from '../ui.js';
import { IText } from 'fabric';
import fontsData from '../json-config/fonts.json';

// ! === TEXT WINDOW ===
export function initText(canvas, updateActiveObject) {

    // Load and organize fonts into dropdown
    function setupFonts() {
        const familySelect = textInputs.family;
        familySelect.innerHTML = '';

        // Separate system fonts from Google Fonts
        const systemFonts = ['Arial', 'Helvetica', 'Times New Roman'];
        const googleFonts = fontsData.fonts.filter(f => !systemFonts.includes(f));

        // Load Google Fonts stylesheet for web font support
        if (googleFonts.length > 0) {
            const fontQuery = googleFonts.map(f => `family=${f.replace(/ /g, '+')}:wght@400;700`).join('&');
            const link = document.createElement('link');
            link.href = `https://fonts.googleapis.com/css2?${fontQuery}&display=swap`;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }

        // Populate dropdown with font options
        fontsData.fonts.forEach(font => {
            const opt = document.createElement('option');
            opt.value = font;
            opt.textContent = font;
            // Style option with actual font for preview
            opt.style.fontFamily = `"${font}", sans-serif`;
            familySelect.appendChild(opt);
        });
    }

    setupFonts();
    
    // Create and add text object to canvas
    textInputs.addBtn.addEventListener('click', () => {
        // Grab text content or use placeholder text
        const textContent = textInputs.content.value || 'Double click to edit';

        // Create IText element
        const newText = new IText(textContent, {
            left: canvas.width / 2, // Middle of screen
            top: canvas.height / 2,
            fontFamily: textInputs.family.value || 'Arial',
            fontSize: parseFloat(textInputs.size.value) || 40,
        });

        // Hide all scaling and stretching handles
        newText.setControlsVisibility({
            mt: false, mb: false, ml: false, mr: false,
            tl: false, tr: false, bl: false, br: false
        });

        // Add to canvas and select text element 
        canvas.add(newText);
        canvas.setActiveObject(newText);

        // Clear input field
        textInputs.content.value = '';
    });

    // Font and size controls
    textInputs.family.addEventListener('change', (e) => updateActiveObject('fontFamily', e.target.value));
    textInputs.size.addEventListener('input', (e) => {
        // Enforce min and max font sizes
        const value = parseInt(e.target.value, 10);
        if (value < 8 || value > 256) {
            textInputs.size.classList.add('is-invalid');
            return;
        }
        textInputs.size.classList.remove('is-invalid');
        updateActiveObject('fontSize', value, true);
    });
    // Line height stored as decimal, UI uses scaled value
    textInputs.lineHeight.addEventListener('input', (e) => updateActiveObject('lineHeight', e.target.value / 10, true));
    // Multiplying by 10 for ease of use
    textInputs.spacing.addEventListener('input', (e) => updateActiveObject('charSpacing', e.target.value * 10, true));

    // Text styling toggles (bold, italic, etc)
    // Toggle bold styling
    textInputs.bold.addEventListener('click', () => {
        // Get the active object
        const obj = canvas.getActiveObject();
        // Check if object is not null and if it is a i-text field
        if (obj && obj.type === 'i-text') {
            // Check if the text is already bolded
            const isBold = obj.fontWeight === 'bold';
            // Set text to bold if normal and vice versa
            updateActiveObject('fontWeight', isBold ? 'normal' : 'bold');
        }
    });

    // Toggle italic styling
    textInputs.italic.addEventListener('click', () => {
        const obj = canvas.getActiveObject();
        if (obj && obj.type === 'i-text') {
            const isItalic = obj.fontStyle === 'italic';
            updateActiveObject('fontStyle', isItalic ? 'normal' : 'italic');
        }
    });

    // Toggle underline styling
    textInputs.underline.addEventListener('click', () => {
        const obj = canvas.getActiveObject();
        if (obj && obj.type === 'i-text') {
            // Underline uses a boolean
            updateActiveObject('underline', !obj.underline);
        }
    });

    // Toggle strikethrough styling
    textInputs.linethrough.addEventListener('click', () => {
        const obj = canvas.getActiveObject();
        if (obj && obj.type === 'i-text') {
            // Strikethrough also uses a boolean
            updateActiveObject('linethrough', !obj.linethrough);
        }
    });

    // Text alignment options
    // Set text alignment to selected option
    textInputs.alignLeft.addEventListener('click', () => updateActiveObject('textAlign', 'left'));
    textInputs.alignCenter.addEventListener('click', () => updateActiveObject('textAlign', 'center'));
    textInputs.alignRight.addEventListener('click', () => updateActiveObject('textAlign', 'right'));
    textInputs.alignJustify.addEventListener('click', () => updateActiveObject('textAlign', 'justify'));
}