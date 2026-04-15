import { iconInputs } from '../ui.js';
import { loadSVGFromURL, util } from 'fabric';
import iconsData from '../json-config/icons.json';

export function initIcons(canvas) {
    const { searchInput, categorySelect, iconsGrid } = iconInputs;

    let allIcons = [];

    // Load icons from config and populate dropdown
    const loadIcons = () => {
        try {
            const iconPacks = iconsData;
            // Loop through JSON
            for (const [prefix, packData] of Object.entries(iconPacks)) {

                // Add category option to dropdown
                const option = document.createElement('option');
                option.value = prefix;
                option.textContent = packData.name;
                categorySelect.appendChild(option);

                // Collect all icons from this pack
                packData.icons.forEach(name => {
                    allIcons.push({
                        id: `${prefix}:${name}`,
                        prefix: prefix,
                        name: name,
                        url: `https://api.iconify.design/${prefix}/${name}.svg`
                    });
                });
            }
            // Initial render
            renderIcons();
        } catch (err) {
            console.error("Error loading icons.json:", err);
            iconsGrid.innerHTML = `<div class="text-danger small p-2">Failed to load icon configuration.</div>`;
        }
    };

    loadIcons();

    // Filter and display icons in grid
    function renderIcons(filterText = '', filterCategory = 'all') {
        iconsGrid.innerHTML = ''; // Clear grid

        const lowerFilter = filterText.toLowerCase();

        // Check whether icon matches name and category
        const filteredIcons = allIcons.filter(icon => {
            const matchesText = icon.name.includes(lowerFilter) || icon.prefix.includes(lowerFilter);
            const matchesCat = filterCategory === 'all' || icon.prefix === filterCategory;
            return matchesText && matchesCat
        });

        // No icons found
        if (filteredIcons.length === 0) {
            iconsGrid.innerHTML = `<div class="text-center w-100 text-muted small mt-4" style="grid-column: 1 / -1;">No graphics found.</div>`;
            return;
        }

        // Create clickable button for each icon
        filteredIcons.forEach(icon => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-light border p-1 d-flex align-items-center justify-content-center shadow-sm icon-btn';
            btn.style.height = '45px';
            btn.title = icon.name.replace(/-/g, ' ');

            // Load and display icon SVG 
            btn.innerHTML = `<img src="${icon.url}" alt="${icon.name}" style="width: 24px; height: 24px; object-fit: contain;">`;

            btn.addEventListener('click', () => {
                addIconToCanvas(icon.url);
            });
            iconsGrid.appendChild(btn);
        });

    }
    // Listen for search and category filter changes
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        const category = categorySelect.value;
        renderIcons(query, category);
    });

    categorySelect.addEventListener('change', (e) => {
        renderIcons(searchInput.value, e.target.value);
    });

    // Load SVG icon and add to canvas
    function addIconToCanvas(url) {
        loadSVGFromURL(url).then(({ objects, options }) => {
            // Group svg if composed of multiple parts
            const svgObj = util.groupSVGElements(objects, options);

            // Standard starting size
            svgObj.scaleToWidth(100);

            // Center on canvas
            svgObj.set({
                left: canvas.width / 2,
                top: canvas.height / 2,
                originX: 'center',
                originY: 'center',
                erasable: true,
            });

            canvas.add(svgObj);
            canvas.setActiveObject(svgObj);
            canvas.renderAll();
        }).catch(err => {
            console.error('Failed to load SVG icon:', err);
        })
    }
}
