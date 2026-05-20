import '../../style.css';
import { UploadManager } from './upload.js';
import { PreviewManager } from './preview.js';
import { ExportManager } from './exporter.js';
import { RAMPS } from './ascii.js';

const SIZES = [16, 24, 32, 48, 64, 96, 128, 256, 512];
let selectedSizes = new Set([32, 64, 128]);
let squareMode = false;
let activeEffect = 'pixel-art';

const effectSettings = {
  halftone:    { dotScale: 0.9, bgWhite: false },
  pointillism: { minR: 0.2, maxR: 0.9, bgWhite: true },
  ascii:       { ramp: RAMPS.balanced, colorMode: 'mono' },
};

const uploadManager = new UploadManager();
const previewManager = new PreviewManager();
const exportManager = new ExportManager();

uploadManager.setupUI(
  document.getElementById('dropZone'),
  document.getElementById('fileInput'),
  document.getElementById('fileList'),
  document.getElementById('uploadError')
);

uploadManager.onFilesChanged = () => {
  const activeFile = uploadManager.getActiveFile();
  previewManager.activeIdx = uploadManager.activeIdx;
  previewManager.render(activeFile, uploadManager.files);
  updateDownloadBtn();
};

previewManager.setupUI(
  document.getElementById('previewSvg'),
  document.getElementById('paletteDisplay'),
  document.getElementById('previewTabs')
);

exportManager.setupUI(document.getElementById('statusMsg'));

previewManager.onTabClick = (idx) => {
  uploadManager.activeIdx = idx;
  uploadManager.render();
  previewManager.activeIdx = idx;
  previewManager.render(uploadManager.getActiveFile(), uploadManager.files);
};

const sizesGrid = document.getElementById('sizesGrid');
sizesGrid.innerHTML = SIZES.map(s =>
  '<button class="size-btn' + (selectedSizes.has(s) ? ' active' : '') + '" data-size="' + s + '">' + s + 'px</button>'
).join('');

sizesGrid.addEventListener('click', (e) => {
  const btn = e.target.closest('.size-btn');
  if (!btn) return;
  const size = parseInt(btn.dataset.size);
  if (selectedSizes.has(size)) { selectedSizes.delete(size); } else { selectedSizes.add(size); }
  btn.classList.toggle('active');
});

// ── Pixel Art controls ────────────────────────────────────────────────
const gridSlider = document.getElementById('gridSlider');
const contrastSlider = document.getElementById('contrastSlider');
const maxColorsSlider = document.getElementById('maxColors');
const bgToleranceSlider = document.getElementById('bgTolerance');
const squareModeCheckbox = document.getElementById('squareMode');
const outlineCheckbox = document.getElementById('outlineEnabled');
const outlineColorPicker = document.getElementById('outlineColor');
const outlineThicknessSlider = document.getElementById('outlineThickness');

const updateValue = (displayEl, input) => { displayEl.textContent = input.value; };

function syncSettings() {
  uploadManager.currentSettings = {
    gridSize: parseInt(gridSlider.value),
    contrast: parseInt(contrastSlider.value),
    maxColors: parseInt(maxColorsSlider.value),
    bgTolerance: parseInt(bgToleranceSlider.value),
    squareMode
  };
}
syncSettings();

squareModeCheckbox.addEventListener('change', () => { squareMode = squareModeCheckbox.checked; syncSettings(); updateSizeInfo(); reprocessAll(); });
gridSlider.addEventListener('input', (e) => { updateValue(document.getElementById('gridVal'), e.target); document.getElementById('gridVal2').textContent = e.target.value; previewManager.gridSize = parseInt(e.target.value); syncSettings(); reprocessAll(); });
contrastSlider.addEventListener('input', (e) => { updateValue(document.getElementById('contrastVal'), e.target); syncSettings(); reprocessAll(); });
maxColorsSlider.addEventListener('input', (e) => { updateValue(document.getElementById('maxColorsVal'), e.target); syncSettings(); reprocessAll(); });
bgToleranceSlider.addEventListener('input', (e) => { updateValue(document.getElementById('bgToleranceVal'), e.target); syncSettings(); reprocessAll(); });
outlineThicknessSlider.addEventListener('input', (e) => { updateValue(document.getElementById('thickVal'), e.target); previewManager.outlineThickness = parseInt(e.target.value); rerenderPreview(); });
outlineCheckbox.addEventListener('change', () => { previewManager.outlineEnabled = outlineCheckbox.checked; rerenderPreview(); });
outlineColorPicker.addEventListener('input', () => { previewManager.outlineColor = outlineColorPicker.value; rerenderPreview(); });

// ── Halftone controls ─────────────────────────────────────────────────
const htGridSlider = document.getElementById('htGridSlider');
const htDotScale = document.getElementById('htDotScale');
const htBgWhite = document.getElementById('htBgWhite');

htGridSlider.addEventListener('input', (e) => { updateValue(document.getElementById('htGridVal'), e.target); reprocessAllWithGrid('halftone', parseInt(e.target.value)); });
htDotScale.addEventListener('input', (e) => { updateValue(document.getElementById('htDotScaleVal'), e.target); effectSettings.halftone.dotScale = parseInt(e.target.value) / 100; rerenderPreview(); });
htBgWhite.addEventListener('change', () => { effectSettings.halftone.bgWhite = htBgWhite.checked; rerenderPreview(); });

// ── Pointillism controls ──────────────────────────────────────────────
const ptGridSlider = document.getElementById('ptGridSlider');
const ptMinR = document.getElementById('ptMinR');
const ptMaxR = document.getElementById('ptMaxR');
const ptBgWhite = document.getElementById('ptBgWhite');

ptGridSlider.addEventListener('input', (e) => { updateValue(document.getElementById('ptGridVal'), e.target); reprocessAllWithGrid('pointillism', parseInt(e.target.value)); });
ptMinR.addEventListener('input', (e) => { updateValue(document.getElementById('ptMinRVal'), e.target); effectSettings.pointillism.minR = parseInt(e.target.value) / 100; rerenderPreview(); });
ptMaxR.addEventListener('input', (e) => { updateValue(document.getElementById('ptMaxRVal'), e.target); effectSettings.pointillism.maxR = parseInt(e.target.value) / 100; rerenderPreview(); });
ptBgWhite.addEventListener('change', () => { effectSettings.pointillism.bgWhite = ptBgWhite.checked; rerenderPreview(); });

// ── ASCII controls ────────────────────────────────────────────────────
const acGridSlider = document.getElementById('acGridSlider');
const acColorMode = document.getElementById('acColorMode');

acGridSlider.addEventListener('input', (e) => { updateValue(document.getElementById('acGridVal'), e.target); reprocessAllWithGrid('ascii', parseInt(e.target.value)); });
acColorMode.addEventListener('change', () => { effectSettings.ascii.colorMode = acColorMode.checked ? 'color' : 'mono'; rerenderPreview(); });
document.getElementById('rampBtns').addEventListener('click', (e) => {
  const btn = e.target.closest('.size-btn');
  if (!btn) return;
  document.querySelectorAll('#rampBtns .size-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  effectSettings.ascii.ramp = RAMPS[btn.dataset.ramp];
  rerenderPreview();
});

// ── Effect switcher ───────────────────────────────────────────────────
function getEffectGridSize() {
  switch (activeEffect) {
    case 'halftone':    return parseInt(htGridSlider.value);
    case 'pointillism': return parseInt(ptGridSlider.value);
    case 'ascii':       return parseInt(acGridSlider.value);
    default:            return parseInt(gridSlider.value);
  }
}

function switchEffect(effect) {
  activeEffect = effect;
  previewManager.activeEffect = effect;
  previewManager.effectSettings = effectSettings[effect] || {};
  document.querySelectorAll('.effect-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.effect === effect)
  );
  document.querySelectorAll('[id^="cfg-"]').forEach(el => {
    el.style.display = el.id === 'cfg-' + effect ? '' : 'none';
  });
  reprocessAllWithGrid(effect, getEffectGridSize());
}

document.getElementById('effectGrid').addEventListener('click', (e) => {
  const btn = e.target.closest('.effect-btn');
  if (!btn) return;
  switchEffect(btn.dataset.effect);
});

// ── Pipeline helpers ──────────────────────────────────────────────────
function reprocessAll() {
  uploadManager.reprocessAll({
    gridSize: parseInt(gridSlider.value),
    contrast: parseInt(contrastSlider.value),
    maxColors: parseInt(maxColorsSlider.value),
    bgTolerance: parseInt(bgToleranceSlider.value),
    squareMode
  });
}

function reprocessAllWithGrid(effect, gridSize) {
  previewManager.activeEffect = effect;
  previewManager.effectSettings = effectSettings[effect] || {};
  uploadManager.reprocessAll({ gridSize, contrast: 0, maxColors: 32, bgTolerance: 0, squareMode: false });
}

function rerenderPreview() {
  previewManager.render(uploadManager.getActiveFile(), uploadManager.files);
}

function updateSizeInfo() {
  const el = document.getElementById('sizeInfoText');
  if (!el) return;
  el.textContent = squareMode
    ? '⊟ EACH SIZE = SQUARE OUTPUT \xB7 EACH IMAGE = 1 SVG \xB7 ALL IN 1 ZIP'
    : '⊟ SIZE = LONGEST EDGE \xB7 RATIO PRESERVED \xB7 EACH IMAGE = 1 SVG \xB7 ALL IN 1 ZIP';
}

function updateDownloadBtn() {
  const hasReady = uploadManager.getReadyFiles().length > 0;
  document.getElementById('downloadBtn').disabled = !hasReady;
}

updateSizeInfo();

document.getElementById('downloadBtn').addEventListener('click', async () => {
  previewManager.outlineEnabled = outlineCheckbox.checked;
  previewManager.outlineColor = outlineColorPicker.value;
  previewManager.outlineThickness = parseInt(outlineThicknessSlider.value);

  await exportManager.exportZip(
    uploadManager.files,
    getEffectGridSize(),
    selectedSizes,
    outlineCheckbox.checked,
    outlineColorPicker.value,
    parseInt(outlineThicknessSlider.value),
    activeEffect,
    effectSettings[activeEffect] || {}
  );
});

document.getElementById('clearBtn').addEventListener('click', () => {
  uploadManager.clear();
  previewManager.clear();
  document.getElementById('fileInput').value = '';
  document.getElementById('statusMsg').textContent = '';
  document.getElementById('downloadBtn').disabled = true;
});

updateDownloadBtn();
