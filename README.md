# Personalization Tool

A professional 2D+3D apparel design platform built with **Fabric.js** (2D canvas editor) and **Three.js** (3D clothing viewer). Design custom graphics, texts, and images on clothes, then export as PNG, JPEG, SVG, or JSON state.

![Status](https://img.shields.io/badge/status-production--ready-brightgreen)

<br>

## Quick Navigation
- **[Quick Start](#quick-start)**  -------------------------- Get running in 2 minutes
- **[Features](#features)**  ----------------------------- What the tool does
- **[Core Engineering Principles](#core-engineering-principles)**  ------- How it's built
- **[Configuration](#configuration-guide)**  ----------------------- Customize & Extend
- **[Deployment](#deployment)**  ------------------------- Go live

---

<br>

## Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation & Development

```bash
# Clone and install dependencies
npm install

# Start development server (Vite)
npx vite

# Build for production
npx vite build

# Preview production build
npx vite preview
```

Open `http://localhost:5173` in your browser.

---

<br>
<br>


## Features

### 2D Canvas Editor (7 Tabs)

| Tab | What It Does |
|-----|-------------|
| **Inspector** | Real-time 2-way sync: Position (X/Y), Rotation (wraps 0-360), Size, Colors and Stroke Width |
| **Text** | 20+ fonts (system + Google Fonts), typography (bold/italic/underline), alignment, line spacing
| **Image** | Upload own image, apply 10 filters (Sepia, Grayscale, B&W, etc.), crop tool, brightness/saturation/contrast sliders |
| **Drawing** | 10 brushes (Pencil, Circle, Spray, Grid, **Eraser**, etc.), adjustable size, shadow support |
| **Icons** | 4000+ icons via Iconify API (emojis, game icons, etc.), searchable, category-filtered |
| **Layers** | Object stack view, visibility toggle, lock/unlock, z-order control, delete |
| **Export** | PNG, JPEG or SVG, JSON state (save/restore), background color/image picker |

<br>


### 3D Viewer

- **Multi-Model Support**: Switch between t-shirt, hoodie, baseball cap in real-time
- **Texture Projection**: Your 2D designs automatically map onto 3D clothing with UV-correct positioning
- **PBR Lighting**: 8 lighting presets (Studio, Dramatic, Soft, Outdoor, etc.) with realistic material response
- **Dynamic Color Swatches**: 50+ colors adjustable via JSON config
- **Auto-Spin**: Watch your design rotate 360°
- **Loading Indicator**: Feedback during model/texture transitions

<br>


### Quality-of-Life Features

- **Keyboard Shortcuts**
  - `Arrow Keys`: Nudge selected object 1px (`Shift` = 10px)
  - `Q`/`E`: Rotate 1° (`Shift` = 15°) 
  - `Delete`: Remove selected object
  - `Double-click`: Bring to front
  - `Right-click`: Send to back
  - `Ctrl+Z` / `Ctrl+Y OR Ctrl+Shift+Z`: Undo/Redo (20-step history)

- **Auto-Save**: Design state auto-saves to `localStorage` every second after interaction with canvas. 
Restore prompt on page reload

- **Erasable SVG Icons**: Erase parts of icons using the Eraser brush

---

<br>
<br>

## Core Engineering Principles

This tool is built on three core patterns that make it extensible, maintainable, and clear:

### 1. Observer Pattern: Two-Way Synchronization

**Problem:** Canvas state and UI must always stay in sync. When a user moves an object on canvas, the position fields update instantly. When they type a new rotation value, the canvas redraws immediately.

**Solution:** `inspector.js` watches for `canvas:object:modified` events and updates the UI, while simultaneously listening to UI input events and pushing changes back to the canvas.

**Code Pattern:**
```javascript
// Canvas → UI: When user drags an object
canvas.on('object:modified', (event) => {
  inspectorInputs.top.value = event.target.top;
  inspectorInputs.left.value = event.target.left;
});

// UI → Canvas: When user types in a field
inspectorInputs.angle.addEventListener('input', (e) => {
  canvas.getActiveObject().rotate(e.target.value);
});
```

**Benefits:** Users see instant feedback. No "sync lag." Changes propagate both directions automatically.

---

<br>

### 2. Factory Pattern: Dynamic UI Generation from Config

**Problem:** Adding a new brush manually meant editing HTML, JavaScript, and UI registries separately—error-prone and unmaintainable.

**Solution:** `ui.js` reads `brushes.json` and dynamically creates buttons. Same pattern for fonts in `fonts.json`. Configuration files ARE the source of truth.

**Code Pattern:**
```javascript
// ui.js reads brushes.json
brushes.forEach(brush => {
  const btn = document.createElement('button');
  btn.innerHTML = `<i class="${brush.icon}"></i>`;
  btn.textContent = brush.name;
  container.appendChild(btn);
  drawingInputs[`brush${toCamelCase(brush.id)}`] = btn;
});
```

**Result:** Add an entry to `brushes.json` → Button auto-generates with icon + label. No code changes needed.

**Files that use this:**
- `brushes.json` → Drawing tab buttons
- `fonts.json` → Text tab font dropdown
- `lightingPresets.json` → 3D lighting presets
- `clothingColors.json` → Color swatches
- `projectionConfig.json` → 3D models

---

<br>

### 3. World/Bridge Pattern: 2D <--> 3D

**Problem:** Fabric.js (2D canvas) and Three.js (3D WebGL) are separate engines. How do we bridge them so designs automatically appear on 3D models?

**Solution:** `main.js` acts as the orchestrator. It listens to Fabric canvas changes, captures a high-res snapshot, and injects it as a texture into the 3D scene.

**Data Flow:**
1. User draws/edits on 2D canvas → `canvas:object:modified` fires
2. `main.js` listener triggers `captureCanvasTexture()`
3. Canvas is snapshotted at 2× resolution
4. Snapshot is passed to Three.js `MeshStandardMaterial.map` (PBR material)
5. 3D model re-renders with new texture instantly

**Performance Optimizations:**
- **Lazy Loading**: 3D viewer doesn't load until user toggles 3D tab → Saves GPU memory
- **Debouncing**: Texture updates debounce during rapid canvas changes → Prevents lag
- **Proxy Meshes**: Design texture sits slightly above garment surface → Fixes 3D Flickering (Z-fighting)
- **Backface Culling**: Design only renders on front of garment → Prevents confusing double-renders

---

<br>
<br>

## Architecture

```
personalize-tool/
│
├── app.js                          # Main entry, Fabric canvas init, tab loading
├── main.js                         # Bridge orchestrator: 2D → 3D texture sync
├── index.html                      # DOM structure (2D tabs + 3D controls)
├── style.css                       # CSS variables for theming
├── ui.js                           # Central DOM registry + dynamic UI generation
│
├── tabs/                           # Tab modules (each exports initTabName function)
│   ├── inspector.js                # Observer Pattern: Position, rotation, size, colors
│   ├── text.js                     # Google Fonts loader
│   ├── image.js                    # Filters, crop, adjustments
│   ├── drawing.js                  # Factory Pattern: Brush buttons from brushes.json
│   ├── icons.js                    # Iconify API integration
│   ├── layers.js                   # Object stack management
│   └── export.js                   # PNG/JPEG/SVG export, JSON serialization
│
├── functions/                      # Utility systems
│   ├── shortcuts.js                # Keyboard & mouse handlers
│   ├── history.js                  # Undo/redo (20-step history)
│   ├── auto-save.js                # localStorage persistence + restore
│   ├── quick-actions.js            # Quick toolbar
│   ├── uiBindings.js               # DRY slider factory (Factory Pattern)
│   └── fileReaderUtil.js           # File upload utilities
│
├── 3d-viewer/                      # Three.js subsystem (World/Bridge Pattern)
│   ├── index.js                    # 3D initialization
│   ├── 3DModel.js                  # Orchestrator class
│   ├── components/                 # Factory functions for scene setup
│   │   ├── scene.js
│   │   ├── camera.js
│   │   ├── lights.js
│   │   ├── model.js                # GLB loader + PBR material setup
│   │   └── textureProjector.js     # Canvas → 3D texture mapping
│   ├── systems/                    # Class-based rendering systems
│   │   ├── Renderer.js
│   │   ├── Loop.js                 # Animation loop + auto-spin
│   │   ├── Resizer.js
│   │   └── Controls.js
│   └── presets/                    # Configuration loaders
│       ├── lightingPresetsLoader.js
│       ├── configLoader.js
│       ├── lightingPresets.json    # 8 presets loaded at runtime
│       ├── projectionConfig.json   # UV mapping per garment
│       └── clothingColors.json     # 56 apparel colors
│
└── json-config/                    # Configuration as source of truth
    ├── fonts.json                  # Google Fonts list
    ├── brushes.json                # Brush definitions
    └── icons.json                  # Icon metadata

└── public/                         # Static assets
    ├── favicon.svg
    └── models/                     # 3D garments
        ├── tshirt.glb
        ├── hoodie.glb
        └── baseball_cap.glb
```

---

<br>
<br>

## Configuration Guide

### Add New Apparel Model

To add a new 3D garment to the tool:

1. **Export your model as `.glb`** and place it in `/public/models/`
   ```
   /public/models/your-garment.glb
   ```

2. **Update `projectionConfig.json`** with UV mapping for your garment:
  ```json
  {
    "your-garment": {
      "modelPath": "/models/your-garment.glb",
      "meshName": "Object",
      "offset": { "x": 0, "y": 0.15 },
      "scale": 3.0,
      "uv": { "x": 0, "y": 0 }
    }
  }
  ```
   These values control where and how your 2D design maps onto the 3D surface.

3. Your model **AUTOMATICALLY** appears in the 3D-Viewer Model dropdown! Restart dev server and your model is ready to use.

---

<br>

### Add Custom Fonts

Edit [fonts.json](json-config/fonts.json):

```json
[
  "Arial",
  "Roboto",
  "Pacifico",
  "Your Font Name Here"  // <-- Add here, must exist on Google Fonts
]
```

Restart dev server. New font appears in Text tab dropdown.

### Add Custom Brushes (Non-Technical)

Edit [brushes.json](json-config/brushes.json):

```json
{
  "id": "my-brush",                    // kebab-case unique ID (used for button naming)
  "name": "My Brush",                  // Display name shown under button
  "icon": "bi bi-pencil-fill",         // Bootstrap icon class (bi bi-*)
  "description": "Description here",   // Currently not implemented
  "fabricType": "PencilBrush",         // Fabric.js class: PencilBrush, SprayBrush, PatternBrush, EraserBrush
  "patternType": null                  // For PatternBrush only: "grid", "circle", "crosshatch", "texture" else null
}
```

Restart dev server. Brush appears in Drawing tab.

<br>

### Change Theme Colors

Edit [style.css](style.css) `:root` section:

```css
:root {
    --primary-accent: #10b981;     /* Buttons, active states */
    --text-primary: #1a1a1a;       /* Headings, strong text */
    --text-secondary: #6b7280;     /* Helper text, borders */
    --bg-light: #f8f9fa;           /* Main background */
    --surface: #ffffff;            /* Panels, cards */
    --border: #e5e7eb;             /* Dividers */
}
```

Changes apply immediately in dev mode.

<br>

### Customize 3D Lighting

Edit [lightingPresets.json](3d-viewer/presets/lightingPresets.json):

```json
{
  "id": "my-preset",                 // kebab-case unique ID
  "name": "My Lighting",             // Display name in 3D lighting dropdown
  "mainLight": {                     // Primary directional light
    "intensity": 2.5,                // Brightness multiplier
    "position": [5, 5, 5],           // [x, y, z] world coordinates
    "color": "0xfff4e6"              // Hex color (0x prefix, not #)
  },
  "fillLight": {                     // Secondary fill light (shadow softening)
    "intensity": 1.2,
    "position": [-5, 3, 5],
    "color": "0xdbe4ff"
  },
  "ambientLight": {                  // Global ambient light (fill entire scene)
    "intensity": 0.8,
    "color": "0xffffff"
  },
  "backgroundColor": "0xffffff"      // Background color behind 3D model
}
```

Preset auto-appears in 3D lighting dropdown.

<br>

### Add Apparel Colors

Edit [clothingColors.json](3d-viewer/presets/clothingColors.json):

```json
{
  "colors": [
    { "name": "Sky Blue", "hex": "#87ceeb" },
    { "name": "Your Color", "hex": "#yourcode" }
  ]
}
```

New color swatches appear in 3D Color Picker.

---

<br>
<br>

##  Deployment

### Build for Production

```bash
npx vite build
```

Creates `dist/` folder with optimized, bundled code.

**Key Notes:**
- All JSON configs are statically imported (bundled), not fetched --> ensures loading works offline
- 3D models served from CDN, loaded on-demand
- localStorage auto-save requires browser support (all modern browsers)

---
<br>
<br>

## Known Quirks & Workarounds

| Issue | Why | Fix |
|-------|-----|-----|
| Eraser crashes if shadow enabled | Fabric.js + erase2d incompatibility | Auto-disabled shadow on eraser |


---
<br>
<br>

## Contributing

For suggestions or bugs:

1. Document the issue with screenshots
2. Include reproduction steps

---

**Last Updated:** April 17, 2026  
**Status:** Production-ready
