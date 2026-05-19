import { buildSVG, extractPalette } from './svgBuilder.js';

export class PreviewManager {
  constructor() {
    this.previewEl = null;
    this.paletteEl = null;
    this.tabsEl = null;
    this.gridSize = 16;
    this.outlineEnabled = true;
    this.outlineColor = '#1a1612';
    this.outlineThickness = 1;
  }

  setupUI(previewEl, paletteEl, tabsEl) {
    this.previewEl = previewEl;
    this.paletteEl = paletteEl;
    this.tabsEl = tabsEl;
  }

  setSettings(gridSize, outlineEnabled, outlineColor, outlineThickness) {
    this.gridSize = gridSize;
    this.outlineEnabled = outlineEnabled;
    this.outlineColor = outlineColor;
    this.outlineThickness = outlineThickness;
  }

  render(activeFile, allFiles) {
    if (!activeFile || !activeFile.pixelData) {
      this.previewEl.innerHTML = '<span class="empty-state">NO SIGNAL<br>──────────<br>LOAD IMAGE<br>TO START</span>';
      this.paletteEl.innerHTML = '';
      return;
    }

    const svgContent = buildSVG(
      activeFile.pixelData,
      this.gridSize,
      220,
      this.outlineEnabled,
      this.outlineColor,
      this.outlineThickness
    );
    this.previewEl.innerHTML = svgContent;

    const palette = extractPalette(activeFile.pixelData);
    this.paletteEl.innerHTML = `<div class="pal-label">PALETTE (${palette.length})</div>` +
      palette.map(([r, g, b]) =>
        `<div style="width:18px;height:18px;background:rgb(${r},${g},${b});border:2px solid #1a1612;" title="rgb(${r},${g},${b})"></div>`
      ).join('');

    this.renderTabs(allFiles);
  }

  renderTabs(allFiles) {
    if (!allFiles || allFiles.length <= 1) {
      this.tabsEl.innerHTML = '';
      return;
    }

    this.tabsEl.innerHTML = allFiles.map((f, i) =>
      `<div class="ptab${i === this.activeIdx ? ' active' : ''}" data-idx="${i}" title="${f.name}">${f.name}</div>`
    ).join('');
  }

  clear() {
    this.previewEl.innerHTML = '<span class="empty-state">NO SIGNAL<br>──────────<br>LOAD IMAGE<br>TO START</span>';
    this.paletteEl.innerHTML = '';
    this.tabsEl.innerHTML = '';
  }
}
