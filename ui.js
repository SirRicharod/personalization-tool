//? Centralizing all the UI Elements
//! ------------------------------------------------

//? Inspector tab inputs
export const inspectorInputs = {
  top: document.getElementById('pos-rot-top'),
  left: document.getElementById('pos-rot-left'),
  angle: document.getElementById('pos-rot-angle'),
  width: document.getElementById('size-width'),
  height: document.getElementById('size-height'),
  fill: document.getElementById('color-fill'),
  stroke: document.getElementById('color-stroke'),
  strokeWidth: document.getElementById('stroke-width')
};

//! ------------------------------------------------

//? Text tab inputs
export const textInputs = {
  addBtn: document.getElementById('add-text-btn'),
  content: document.getElementById('text-content-input'),
  family: document.getElementById('font-family'),
  size: document.getElementById('font-size'),
  bold: document.getElementById('text-bold-btn'),
  italic: document.getElementById('text-italic-btn'),
  underline: document.getElementById('text-underline-btn'),
  linethrough: document.getElementById('text-linethrough-btn'),
  alignLeft: document.getElementById('text-left-btn'),
  alignCenter: document.getElementById('text-center-btn'),
  alignRight: document.getElementById('text-right-btn'),
  alignJustify: document.getElementById('text-justify-btn'),
  lineHeight: document.getElementById('font-line-height'),
  spacing: document.getElementById('font-spacing')
};

//! ------------------------------------------------

//? Image tab inputs
export const imageInputs = {
  upload: document.getElementById('image-upload'),
  addBtn: document.getElementById('add-image-btn'),
  cropBtn: document.getElementById('img-crop-btn'),
  flipHBtn: document.getElementById('img-flip-h-btn'),
  flipVBtn: document.getElementById('img-flip-v-btn'),
  cloneBtn: document.getElementById('img-clone-btn'),

  // Adjustment sliders / number inputs
  brightVal: document.getElementById('img-bright-val'),
  brightSlider: document.getElementById('img-bright-slider'),
  satVal: document.getElementById('img-sat-val'),
  satSlider: document.getElementById('img-sat-slider'),
  contrastVal: document.getElementById('img-contrast-val'),
  contrastSlider: document.getElementById('img-contrast-slider'),
  blurVal: document.getElementById('img-blur-val'),
  blurSlider: document.getElementById('img-blur-slider'),

  // Preset filter buttons
  filterNormal: document.getElementById('img-filter-normal'),
  filterSepia: document.getElementById('img-filter-sepia'),
  filterBW: document.getElementById('img-filter-bw'),
  filterVintage: document.getElementById('img-filter-vintage'),
  filterWarm: document.getElementById('img-filter-warm'),
  filterCool: document.getElementById('img-filter-cool'),
  filterPolaroid: document.getElementById('img-filter-polaroid'),
  filterInvert: document.getElementById('img-filter-invert'),
  filterTechnicolor: document.getElementById('img-filter-technicolor'),
  filterSharpen: document.getElementById('img-filter-sharpen'),

  // Advanced tools
  noiseVal: document.getElementById('img-noise-val'),
  noiseSlider: document.getElementById('img-noise-slider'),
  pixelVal: document.getElementById('img-pixel-val'),
  pixelSlider: document.getElementById('img-pixel-slider'),
  blendMode: document.getElementById('img-blend-mode'),
  blendColor: document.getElementById('img-blend-color'),
  gammaGVal: document.getElementById('img-gamma-green-val'),
  gammaGSlider: document.getElementById('img-gamma-green-slider'),
  gammaRVal: document.getElementById('img-gamma-red-val'),
  gammaRSlider: document.getElementById('img-gamma-red-slider'),
  gammaBVal: document.getElementById('img-gamma-blue-val'),
  gammaBSlider: document.getElementById('img-gamma-blue-slider'),
  removeColor: document.getElementById('img-remove-color'),
  removeVal: document.getElementById('img-remove-val'),
  removeSlider: document.getElementById('img-remove-slider')
};

//! ------------------------------------------------

//? Drawing tab inputs
export const drawingInputs = {
  drawToggle: document.getElementById('draw-toggle-btn'),

  // Brush selection buttons
  brushPencil: document.getElementById('brush-pencil-btn'),
  brushCircle: document.getElementById('brush-circle-btn'),
  brushSpray: document.getElementById('brush-spray-btn'),
  brushGrid: document.getElementById('brush-grid-btn'),
  brushCirclePattern: document.getElementById('brush-circle-pattern-btn'),
  brushHLine: document.getElementById('brush-h-line-btn'),
  brushVLine: document.getElementById('brush-v-line-btn'),
  brushCrosshatch: document.getElementById('brush-crosshatch-btn'),
  brushTexture: document.getElementById('brush-texture-btn'),
  brushEraser: document.getElementById('brush-eraser-btn'),

  // Brush settings
  brushSize: document.getElementById('brush-size'),
  brushSizeVal: document.getElementById('brush-size-val'),
  shadowSize: document.getElementById('shadow-size'),
  shadowSizeVal: document.getElementById('shadow-size-val'),
  shadowOffsetX: document.getElementById('shadow-offset-x'),
  shadowOffsetXVal: document.getElementById('shadow-offset-x-val'),
  shadowOffsetY: document.getElementById('shadow-offset-y'),
  shadowOffsetYVal: document.getElementById('shadow-offset-y-val'),
  brushColor: document.getElementById('brush-color'),
  shadowColor: document.getElementById('brush-shadow'),

  // Texture source
  textureUpload: document.getElementById('texture-upload')
};

//! ------------------------------------------------

//? Layers tab inputs
export const layerInputs = {
  container: document.getElementById('layers-container')
};

//! ------------------------------------------------

//? Export / Canvas tab inputs
export const exportInputs = {
  bgColor: document.getElementById('canvas-bg-color'),
  bgImage: document.getElementById('canvas-bg-image'),
  exportCanvasBtn: document.getElementById('export-canvas-btn'),
  exportJsonBtn: document.getElementById('export-json-btn'),
  importJsonBtn: document.getElementById('import-json-btn'),
  jsonTextarea: document.getElementById('json-io-textarea'),
  exportFormat: document.getElementById('export-format'),
  exportTransparentBg: document.getElementById('export-transparent-bg')
};