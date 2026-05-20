import '../../style.css';
import { UploadManager } from './upload.js';
import { PreviewManager } from './preview.js';
import { ExportManager } from './exporter.js';

const SIZES = [16, 24, 32, 48, 64, 96, 128, 256, 512];
let selectedSizes = new Set([32, 64, 128]);
let squareMode = false;
let activeEffect = 'pixel-art';

const uploadManager = new UploadManager();
const previewManager = new PreviewManager();
const exportManager = new ExportManager();

// Setup upload
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

// Setup preview
previewManager.setupUI(
  document.getElementById('previewSvg'),
  document.getElementById('paletteDisplay'),
  document.getElementById('previewTabs')
);

// Setup export
exportManager.setupUI(document.getElementById('statusMsg'));

// Setup sizes
const sizesGrid = document.getElementById('sizesGrid');
sizesGrid.innerHTML = SIZES.map(s =>
  '<button class="size-btn' + (selectedSizes.has(s) ? ' active' : '') + '" data-size="' + s + '">' + s + 'px</button>'
).join('');

sizesGrid.addEventListener('click', (e) => {
  const btn = e.target.closest('.size-btn');
  if (!btn) return;
  const size = parseInt(btn.dataset.size);
  if (selectedSizes.has(size)) {
    selectedSizes.delete(size);
  } else {
    selectedSizes.add(size);
  }
  btn.classList.toggle('active');
});

// Setup controls
const gridSlider = document.getElementById('gridSlider');
const contrastSlider = document.getElementById('contrastSlider');
const maxColorsSlider = document.getElementById('maxColors');
const bgToleranceSlider = document.getElementById('bgTolerance');
const squareModeCheckbox = document.getElementById('squareMode');

squareModeCheckbox.addEventListener('change', () => {
  squareMode = squareModeCheckbox.checked;
  syncSettings();
  updateSizeInfo();
  reprocessAll();
});

const outlineCheckbox = document.getElementById('outlineEnabled');
const outlineColorPicker = document.getElementById('outlineColor');
const outlineThicknessSlider = document.getElementById('outlineThickness');

const updateValue = (displayEl, input) => {
  displayEl.textContent = input.value;
};

// Sync uploadManager settings so new uploads always use the current slider values
function syncSettings() {
  uploadManager.currentSettings = {
    gridSize: parseInt(gridSlider.value),
    contrast: parseInt(contrastSlider.value),
    maxColors: parseInt(maxColorsSlider.value),
    bgTolerance: parseInt(bgToleranceSlider.value),
    squareMode
  };
}

// Initialize from HTML defaults on load
syncSettings();

gridSlider.addEventListener('input', (e) => {
  updateValue(document.getElementById('gridVal'), e.target);
  document.getElementById('gridVal2').textContent = e.target.value;
  previewManager.gridSize = parseInt(e.target.value);
  syncSettings();
  reprocessAll();
});

contrastSlider.addEventListener('input', (e) => {
  updateValue(document.getElementById('contrastVal'), e.target);
  syncSettings();
  reprocessAll();
});

maxColorsSlider.addEventListener('input', (e) => {
  updateValue(document.getElementById('maxColorsVal'), e.target);
  syncSettings();
  reprocessAll();
});

bgToleranceSlider.addEventListener('input', (e) => {
  updateValue(document.getElementById('bgToleranceVal'), e.target);
  syncSettings();
  reprocessAll();
});

outlineThicknessSlider.addEventListener('input', (e) => {
  updateValue(document.getElementById('thickVal'), e.target);
  previewManager.outlineThickness = parseInt(e.target.value);
  previewManager.render(uploadManager.getActiveFile(), uploadManager.files);
});

outlineCheckbox.addEventListener('change', () => {
  previewManager.outlineEnabled = outlineCheckbox.checked;
  previewManager.render(uploadManager.getActiveFile(), uploadManager.files);
});

outlineColorPicker.addEventListener('input', () => {
  previewManager.outlineColor = outlineColorPicker.value;
  previewManager.render(uploadManager.getActiveFile(), uploadManager.files);
});

function reprocessAll() {
  uploadManager.reprocessAll({
    gridSize: parseInt(gridSlider.value),
    contrast: parseInt(contrastSlider.value),
    maxColors: parseInt(maxColorsSlider.value),
    bgTolerance: parseInt(bgToleranceSlider.value),
    squareMode
  });
  // onFilesChanged drives the render after reprocessing completes — no setTimeout needed
}

// Effect switcher
function switchEffect(effect) {
  activeEffect = effect;
  document.querySelectorAll('.effect-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.effect === effect)
  );
  document.querySelectorAll('[id^="cfg-"]').forEach(el => {
    el.style.display = el.id === `cfg-${effect}` ? '' : 'none';
  });
  if (effect === 'pixel-art') {
    reprocessAll();
  } else {
    previewManager.clear();
    document.getElementById('downloadBtn').disabled = true;
  }
}

document.getElementById('effectGrid').addEventListener('click', (e) => {
  const btn = e.target.closest('.effect-btn');
  if (!btn) return;
  switchEffect(btn.dataset.effect);
});

function updateSizeInfo() {
  const el = document.getElementById('sizeInfoText');
  if (!el) return;
  el.textContent = squareMode
    ? '⊟ EACH SIZE = SQUARE OUTPUT · EACH IMAGE = 1 SVG · ALL IN 1 ZIP'
    : '⊟ SIZE = LONGEST EDGE · RATIO PRESERVED · EACH IMAGE = 1 SVG · ALL IN 1 ZIP';
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
    parseInt(gridSlider.value),
    selectedSizes,
    outlineCheckbox.checked,
    outlineColorPicker.value,
    parseInt(outlineThicknessSlider.value)
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
