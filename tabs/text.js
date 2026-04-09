import { textInputs } from '../ui.js';
import { IText } from 'fabric';
import fontsData from '../json-config/fonts.json';

// ! === TEXT WINDOW ===
export function initText(canvas, updateActiveObject) {

    // -- Setup Dynamic Fonts --
    function setupFonts() {
        const familySelect = textInputs.family;
        familySelect.innerHTML = ''; // Start clean

        // Separate system fonts from Google Fonts
        const systemFonts = ['Arial', 'Helvetica', 'Times New Roman'];
        const googleFonts = fontsData.fonts.filter(f => !systemFonts.includes(f));

        // Inject Google Fonts stylesheet directly into the document <head>
        if (googleFonts.length > 0) {
            const fontQuery = googleFonts.map(f => `family=${f.replace(/ /g, '+')}:wght@400;700`).join('&');
            const link = document.createElement('link');
            link.href = `https://fonts.googleapis.com/css2?${fontQuery}&display=swap`;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }

        // Build the styled dropdown options!
        fontsData.fonts.forEach(font => {
            const opt = document.createElement('option');
            opt.value = font;
            opt.textContent = font;
            // Native browsers will honor this inline style inside the dropdown menu
            opt.style.fontFamily = `"${font}", sans-serif`;
            familySelect.appendChild(opt);
        });
    }

    // Run it immediately
    setupFonts();
    
    // Add new text to canvas
    textInputs.addBtn.addEventListener('click', () => {
        // Grab text content or use placeholder text
        const textContent = textInputs.content.value || 'Double click to edit';

        // Create IText element
        const newText = new IText(textContent, {
            left: 100,
            top: 100,
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

        // Add to canvas and select text element 
        canvas.add(newText);
        canvas.setActiveObject(newText);

        // Clear input field
        textInputs.content.value = '';
    });

    // Text Properties
    textInputs.family.addEventListener('change', (e) => updateActiveObject('fontFamily', e.target.value));
    textInputs.size.addEventListener('input', (e) => updateActiveObject('fontSize', e.target.value, true));
    // Divide by 10 for precise spacing
    textInputs.lineHeight.addEventListener('input', (e) => updateActiveObject('lineHeight', e.target.value / 10, true));
    // Multiplying by 10 for ease of use
    textInputs.spacing.addEventListener('input', (e) => updateActiveObject('charSpacing', e.target.value * 10, true));

    //* Styling Toggles
    // Add event listener
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

    textInputs.italic.addEventListener('click', () => {
        const obj = canvas.getActiveObject();
        if (obj && obj.type === 'i-text') {
            const isItalic = obj.fontStyle === 'italic';
            updateActiveObject('fontStyle', isItalic ? 'normal' : 'italic');
        }
    });

    textInputs.underline.addEventListener('click', () => {
        const obj = canvas.getActiveObject();
        if (obj && obj.type === 'i-text') {
            // Underline uses a boolean
            updateActiveObject('underline', !obj.underline);
        }
    });

    textInputs.linethrough.addEventListener('click', () => {
        const obj = canvas.getActiveObject();
        if (obj && obj.type === 'i-text') {
            // Strikethrough also uses a boolean
            updateActiveObject('linethrough', !obj.linethrough);
        }
    });

    // Alignment
    textInputs.alignLeft.addEventListener('click', () => updateActiveObject('textAlign', 'left'));
    textInputs.alignCenter.addEventListener('click', () => updateActiveObject('textAlign', 'center'));
    textInputs.alignRight.addEventListener('click', () => updateActiveObject('textAlign', 'right'));
    textInputs.alignJustify.addEventListener('click', () => updateActiveObject('textAlign', 'justify'));
}